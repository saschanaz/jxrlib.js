module JxrLib {
    var sample = "data:image/vnd.ms-photo;base64,SUm8AQgAAAAJAAG8AQAQAAAAegAAAAK8BAABAAAAAAAAAAS8BAABAAAAAAAAAIC8BAABAAAAAgAAAIG8BAABAAAAAwAAAIK8CwABAAAAAADAQoO8CwABAAAAAADAQsC8BAABAAAAigAAAMG8BAABAAAADgEAAAAAAAAkw91vA07+S7GFPXd2jckMV01QSE9UTwARRMBxAAEAAmAAoAAKAACgAAAAAQAAAAkAPv8ABEKAAAEAAAEByQ1Yf8AAAAEC+CFiBD4ggohx4eEAEYaNG1TNAiQC9xR+0RLkCyGAAABAMAALCApgSCe/8AAAAAAAAAAAAQMjN6DL0wTgiCRowm+GEBEEfCCSwwmmGEqhBEogj4QTUjCSQgl5wQ2CPqCiemEkSMJ8QQQUOaQT+kAJnaCiemEkSMJ8QVBRPTCSJGE+IIIKHNIJ/SAEzoQUOaQT+kAJnaCVUgksQgjTF0EqpBJYhBGmLoJVSCSyQRpy6CVUgksiCNMTsKHMwn9QhM7wocmE/pBCZ3hQ5MJ/SCEzvChyYT+oQmdA";
    export function isNativelySupported() {
        return new Promise<boolean>((resolve, reject) => {
            var image = new Image();
            image.onload = () => {
                if (image.naturalWidth == 2 && image.naturalHeight == 3)
                    resolve(true);
                else
                    resolve(false);
            };
            image.onerror = () => resolve(false);
            image.src = sample;
        });
    }


    function readBlob(blob: Blob) {
        return new Promise<ArrayBuffer>((resolve, reject) => {
            var reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = (err) => reject(new Error(err.message));
            reader.readAsArrayBuffer(blob);
        });
    }
    function uint8ArrayToBlob(uint8array: Uint8Array, mimeType: string) {
        return new Blob([new DataView(uint8array.buffer)], { type: mimeType })
    }
    function blobToElement(blob: Blob) {
        var image = new Image();
        image.src = URL.createObjectURL(blob, { oneTimeOnly: true });
        return image;
    }

    export interface DecodingOptionBag {
        outputType?: string; // "bmp"|"tif"|"jxr
        outputPixelFormat?: string; // ...
        downscale: number; // uint;
        region?: number[]; // [top, left, height, width]
        orientation?: { rotate90: boolean; flipHorizontally: boolean; flipVertically: boolean; };
        subbands?: string; // "all"|"noflexbits"|"nohighpass"|"dconly"
        channel?: { image: boolean; alpha: boolean; };
        postProcessingLevel: number; // 0 to 4
    }
    export function decode(blob: Blob, options?: DecodingOptionBag): Promise<Uint8Array>
    export function decode(arraybuffer: ArrayBuffer, options?: DecodingOptionBag): Promise<Uint8Array>
    export function decode(input: any, options?: DecodingOptionBag) {
        if (!Module || !("_jxrlibDecodeMain" in Module))
            throw new Error("jxrlib was not detected. It should be included for JxrLib.decode function.");

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
                var resultCode = Module.ccall("jxrlibDecodeMain", "number", ["number", "number"], [arguments.content.length, arguments.pointer]);
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
        return decode(input, options).then((array) => uint8ArrayToBlob(array, "image/bmp"));
    }

    export function decodeAsElement(blob: Blob, options?: DecodingOptionBag): Promise<HTMLImageElement>
    export function decodeAsElement(arraybuffer: ArrayBuffer, options?: DecodingOptionBag): Promise<HTMLImageElement>
    export function decodeAsElement(input: any, options?: DecodingOptionBag) {
        return decodeAsBlob(input, options).then(blobToElement);
    }


    export interface EncodingOptionBag {
        inputType?: string; // "bmp"|"tif"|"hdr"

        quality?: number; // 0 - 1
        quantization?: number; // 1 to 255. Cannot choose both
        sourcePixelFormat?: string; // ...
        chromaYCoCg?: string; // "Yonly"|"420"|"422"|"444"
        overlapLevel?: number; // 0 to 2

        alphaFormat: string; // "planar"|"interleaved"
        alphaQuantization?: number; // 1 to 255

        forceSpatialOrderBitstream: boolean;
        forceSequentialMode: boolean;
        forceZeroAsWhite: boolean;

        macroblockColumns: number[];
        macroblockRows: number[];
        tiles: number[]; // [vertical, horizontal]

        flexbitsTrimming: number; // 0 to 15
        subbands?: string; // "all"|"noflexbits"|"nohighpass"|"dconly"
    }
    export function encode(blob: Blob, options?: EncodingOptionBag): Promise<Uint8Array>
    export function encode(arraybuffer: ArrayBuffer, options?: EncodingOptionBag): Promise<Uint8Array>
    export function encode(input: any, options?: EncodingOptionBag) {
        if (!Module || !("_jxrlibEncodeMain" in Module))
            throw new Error("jxrlib was not detected. It should be included for JxrLib.encode function.");

        var sequence: Promise<ArrayBuffer>;
        if (input instanceof ArrayBuffer)
            sequence = Promise.resolve(input);
        else if (input instanceof Blob)
            sequence = readBlob(input);

        return sequence
            .then((buffer) => {
                FS.writeFile("input.bmp", new Uint8Array(buffer), { encoding: "binary" });
                return EmscriptenUtility.FileSystem.synchronize(true);
            })
            .then(() => {
                var arguments = EmscriptenUtility.allocateStringArray(["./this.program", "-v", "-i", "input.bmp", "-o", "output.jxr"]);
                var resultCode = Module.ccall("jxrlibEncodeMain", "number", ["number", "number"], [arguments.content.length, arguments.pointer]);
                console.log(resultCode);
                if (resultCode !== 0)
                    throw new Error("Encoding failed: error code " + resultCode);
                EmscriptenUtility.deleteStringArray(arguments);
                FS.unlink("input.bmp");
                return EmscriptenUtility.FileSystem.synchronize(false);
            })
            .then(() => {
                var result = FS.readFile("output.jxr", { encoding: "binary" });
                FS.unlink("output.jxr");
                return result;
            });
    }

    export function encodeAsBlob(blob: Blob, options?: EncodingOptionBag): Promise<Blob>
    export function encodeAsBlob(arraybuffer: ArrayBuffer, options?: EncodingOptionBag): Promise<Blob>
    export function encodeAsBlob(input: any, options?: EncodingOptionBag) {
        return encode(input, options).then((array) => uint8ArrayToBlob(array, "image/vnd.ms-photo"));
    }

    export function encodeAsElement(blob: Blob, options?: EncodingOptionBag): Promise<HTMLImageElement>
    export function encodeAsElement(arraybuffer: ArrayBuffer, options?: EncodingOptionBag): Promise<HTMLImageElement>
    export function encodeAsElement(input: any, options?: EncodingOptionBag) {
        return encodeAsBlob(input, options).then(blobToElement);
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