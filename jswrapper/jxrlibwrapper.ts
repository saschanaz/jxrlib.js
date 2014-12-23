module JxrLib {
    var sample = "data:image/vnd.ms-photo;base64,SUm8AQgAAAAJAAG8AQAQAAAAegAAAAK8BAABAAAAAAAAAAS8BAABAAAAAAAAAIC8BAABAAAAAgAAAIG8BAABAAAAAwAAAIK8CwABAAAAAADAQoO8CwABAAAAAADAQsC8BAABAAAAigAAAMG8BAABAAAADgEAAAAAAAAkw91vA07+S7GFPXd2jckMV01QSE9UTwARRMBxAAEAAmAAoAAKAACgAAAAAQAAAAkAPv8ABEKAAAEAAAEByQ1Yf8AAAAEC+CFiBD4ggohx4eEAEYaNG1TNAiQC9xR+0RLkCyGAAABAMAALCApgSCe/8AAAAAAAAAAAAQMjN6DL0wTgiCRowm+GEBEEfCCSwwmmGEqhBEogj4QTUjCSQgl5wQ2CPqCiemEkSMJ8QQQUOaQT+kAJnaCiemEkSMJ8QVBRPTCSJGE+IIIKHNIJ/SAEzoQUOaQT+kAJnaCVUgksQgjTF0EqpBJYhBGmLoJVSCSyQRpy6CVUgksiCNMTsKHMwn9QhM7wocmE/pBCZ3hQ5MJ/SCEzvChyYT+oQmdA";
    export function isNativelySupported() {
        return new Promise<boolean>((resolve, reject) => {
            var image = new Image();
            image.onload = () => resolve(true);
            image.onerror = () => resolve(false);
            image.src = sample;
        });
    }


    export interface DecodingOptionBag {
    }
    function readBlob(blob: Blob) {
        return new Promise<ArrayBuffer>((resolve, reject) => {
            var reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = (err) => reject(new Error(err.message));
            reader.readAsArrayBuffer(blob);
        });
    }
    
    export function decode(blob: Blob, options?: DecodingOptionBag): Promise<Uint8Array>
    export function decode(arraybuffer: ArrayBuffer, options?: DecodingOptionBag): Promise<Uint8Array>
    export function decode(input: any, options?: DecodingOptionBag) {
        var sequence: Promise<ArrayBuffer>;
        if (input instanceof ArrayBuffer)
            sequence = Promise.resolve(input);
        else if (input instanceof Blob)
            sequence = readBlob(input);

        return sequence
            .then((buffer) => {
                FS.writeFile("input.jxr", new Uint8Array(buffer), { encoding: "binary" });
                return EmscriptenUtility.FileSystem.synchronize(true);
            })
            .then(() => {
                var arguments = EmscriptenUtility.allocateStringArray(["./this.program", "-v", "-i", "input.jxr", "-o", "output.bmp"]);
                var resultCode = Module.ccall("mainFn", "number", ["number", "number"], [arguments.content.length, arguments.pointer]);
                console.log(resultCode);
                if (resultCode !== 0)
                    throw new Error("Decoding failed: error code " + resultCode);
                EmscriptenUtility.deleteStringArray(arguments);
                FS.unlink("input.jxr");
                return EmscriptenUtility.FileSystem.synchronize(false);
            })
            .then(() => {
                var result = FS.readFile("output.bmp", { encoding: "binary" });
                FS.unlink("output.bmp");
                return result;
            });
    }

    export function decodeAsBlob(blob: Blob, options?: DecodingOptionBag): Promise<Blob>
    export function decodeAsBlob(arraybuffer: ArrayBuffer, options?: DecodingOptionBag): Promise<Blob>
    export function decodeAsBlob(input: any, options?: DecodingOptionBag) {
        return decode(input, options)
            .then((uint8array) => {
                return new Blob([new DataView(uint8array.buffer)], { type: "image/bmp" })
            });
    }

    export function decodeAsElement(blob: Blob, options?: DecodingOptionBag): Promise<HTMLImageElement>
    export function decodeAsElement(arraybuffer: ArrayBuffer, options?: DecodingOptionBag): Promise<HTMLImageElement>
    export function decodeAsElement(input: any, options?: DecodingOptionBag) {
        return decodeAsBlob(input, options)
            .then((blob) => {
                var image = new Image();
                image.src = URL.createObjectURL(blob, { oneTimeOnly: true });
                return image;
            });
    }
}

module EmscriptenUtility {
    export interface AllocatedArray {
        content: any[];
        pointer: number;
    }
    function allocateString(input: string) {
        var array = Module.intArrayFromString(input, false);
        var pointer = Module._malloc(array.length);
        Module.HEAP8.set(new Int8Array(array), pointer);
        return pointer;
    }
    export function allocateStringArray(input: string[]) {
        var array: number[] = [];
        input.forEach((item) => array.push(allocateString(item)));
        var pointer = Module._calloc(array.length, 4);
        Module.HEAP32.set(new Uint32Array(array), pointer / 4);
        return <AllocatedArray>{
            content: array,
            pointer: pointer
        };
    }
    export function deleteStringArray(input: AllocatedArray) {
        input.content.forEach((item) => Module._free(item));
        Module._free(input.pointer);
    }
}

module EmscriptenUtility.FileSystem {
    export function writeBlob(path: string, blob: Blob) {
        return new Promise<ArrayBuffer>((resolve, reject) => {
            var reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsArrayBuffer(blob);
        })
            .then((result) => {
                FS.writeFile(path, new Uint8Array(result), { encoding: "binary" });
            });
    }
    export function synchronize(populate: boolean) {
        return new Promise<void>((resolve, reject) => {
            FS.syncfs(populate, () => resolve());
        });
    }
}