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

    export enum PixelFormats {
        Bpp24BGR,
        Bpp1BlackWhite,
        Bpp8Gray,
        Bpp16Gray,
        Bpp16GrayFixedPoint,
        Bpp16GrayHalf,
        
        Bpp32GrayFixedPoint = 7,
        Bpp32GrayFloat,
        Bpp24RGB,
        Bpp48RGB,
        Bpp48RGBFixedPoint,
        Bpp48RGBHalf,
        
        Bpp96RGBFixedPoint = 14,
        Bpp128RGBFloat,
        Bpp32RGBE,
        Bpp32CMYK,
        Bpp64CMYK,

        Bpp32BGRA = 22,
        Bpp64RGBA,
        Bpp64RGBAFixedPoint,
        Bpp64RGBAHalf,

        Bpp128RGBAFixedPoint = 27,
        Bpp128RGBAFloat,
        Bpp16RGB555,
        Bpp16RGB565,
        Bpp32RGB101010,
        Bpp40CMYKAlpha,
        Bpp80CMYKAlpha,
        Bpp32BGR,
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

    function getFileName(optionType: string, inputData?: any) {
        var base = inputData ? "input." : "output.";
        if (optionType != null)
            return base + optionType;
        else if (!inputData)
            return base + "bmp";

        if (inputData instanceof File)
            return (<File>inputData).name;
        else if (inputData instanceof Blob) {
            switch ((<Blob>inputData).type) {
                case "image/bmp": return base + "bmp";
                case "image/tiff": return base + "tif";
                case "image/x‑portable‑bitmap":
                case "image/x‑portable‑graymap":
                case "image/x‑portable‑pixmap":
                case "image/x‑portable‑anymap":
                    return base + "pnm";
            }
        }

        console.error("JxrLib cannot infer the proper file type, so assuming the input as a BMP file.");
        return base + "bmp";
    }
    function stringOption(optionName: string, stringOptions: string[], input: string) {
        var option = stringOptions.indexOf(input);
        if (option < 0)
            throw new Error("\"" + input + "\" is not supported for `options." + optionName + "`.");
        return option;
    }
    function booleanOption(booleans: boolean[]) {
        var bits = 0;
        for (var i = 0; i < booleans.length; i++)
            bits += ~~booleans[i] << i;
        return bits;
    }

    export interface DecodingOptionBag {
        outputType?: string; // "bmp"|"tif"|"jxr"|...

        outputPixelFormat?: PixelFormats;
        region?: number[]; // [top, left, height, width]
        downscale: number; // uint;
        orientation?: { flipVertically: boolean; flipHorizontally: boolean; rotate90: boolean; };
        subbands?: string; // "all"|"noflexbits"|"nohighpass"|"dconly"
        channel?: { alpha: boolean; image: boolean; };
        postProcessingLevel: number; // 0 to 4
    }
    export interface ImageOrienting {
        flipVertically: boolean;
        flipHorizontally: boolean;
        rotate90: boolean;
    }
    function orientAsBits(orientation: ImageOrienting) {
        return booleanOption([
            orientation.flipVertically,
            orientation.flipHorizontally,
            orientation.rotate90
        ]);
    }
    function getDecoderArgumentArray(options: DecodingOptionBag) {
        var args: string[] = [];
        if (!options)
            return args;

        if (options.outputPixelFormat != null)
            args.push("-c", options.outputPixelFormat.toString());
        if (options.region != null) {
            args.push("-r");
            for (var i = 0; i < 4; i++)
                args.push(options.region[i].toString());
        }
        if (options.downscale != null)
            args.push("-T", options.downscale.toString());
        if (options.orientation != null)
            args.push("-O", orientAsBits(options.orientation).toString());
        if (options.subbands != null)
            args.push("-s", stringOption("subbands", ["all", "noflexbits", "nohighpass", "dconly"], options.subbands).toString());
        if (options.channel != null)
            args.push("-a", booleanOption([options.channel.alpha, options.channel.image]).toString());
        if (options.postProcessingLevel != null)
            args.push("-p", options.postProcessingLevel.toString());
        return args;
    }

    export function decode(blob: Blob, options?: DecodingOptionBag): Promise<Uint8Array>
    export function decode(arraybuffer: ArrayBuffer, options?: DecodingOptionBag): Promise<Uint8Array>
    export function decode(input: any, options?: DecodingOptionBag) {
        if (!Module || !("_jxrlibDecodeMain" in Module))
            throw new Error("jxrlib was not detected. It should be included for JxrLib.decode function.");

        var outputName = getFileName(options ? options.outputType : null);

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
                var arguments = EmscriptenUtility.allocateStringArray(
                    ["./this.program", "-v", "-t", "-i", "input.jxr", "-o", outputName].concat(getDecoderArgumentArray(options)));
                var resultCode = Module.ccall("jxrlibDecodeMain", "number", ["number", "number"], [arguments.content.length, arguments.pointer]);
                console.log(resultCode);
                if (resultCode !== 0)
                    throw new Error("Decoding failed: error code " + resultCode);
                EmscriptenUtility.deleteStringArray(arguments);
                FS.unlink("input.jxr");
                return EmscriptenUtility.FileSystem.synchronize(false);
            })
            .then(() => {
                var result = FS.readFile(outputName, { encoding: "binary" });
                FS.unlink(outputName);
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
        inputType?: string; // "bmp"|"tif"|"hdr"|...
        sourcePixelFormat?: PixelFormats;

        quality?: number; // 0 - 1
        quantization?: number; // 1 to 255. Cannot choose both
        orientation?: ImageOrienting;
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
    function getEncoderArgumentString(options: EncodingOptionBag) {
        var args: string[] = [];
        if (!options)
            return args;
        if (options.quality != null && options.quantization != null)
            throw new Error("You must choose options.quality or options.quantization, not both.");

        if (options.sourcePixelFormat != null)
            args.push("-c", options.sourcePixelFormat.toString());
        if (options.quality != null && options.quality <= 1)
            args.push("-q", options.quality.toString());
        else if (options.quantization != null && options.quantization >= 1)
            args.push("-q", options.quantization.toString());
        if (options.orientation != null)
            args.push("-O", orientAsBits(options.orientation).toString());
        if (options.chromaYCoCg != null)
            args.push("-d", stringOption("chromaYCoCg", ["Yonly", "420", "422", "444"], options.chromaYCoCg).toString());
        if (options.overlapLevel != null)
            args.push("-l", options.overlapLevel.toString());
        if (options.alphaFormat != null)
            args.push("-a", stringOption("alphaFormat", [,,"planar", "interleaved"], options.alphaFormat).toString());
        if (options.alphaQuantization != null)
            args.push("-Q", options.alphaQuantization.toString());
        if (options.forceSpatialOrderBitstream != null)
            args.push("-f");
        if (options.forceSequentialMode != null)
            args.push("-p");
        if (options.forceZeroAsWhite != null)
            args.push("-b");
        if (options.macroblockColumns != null) {
            args.push("-V");
            for (var i = 0; i < options.macroblockColumns.length; i++)
                args.push(options.macroblockColumns[i].toString());
        }
        if (options.macroblockRows != null) {
            args.push("-H");
            for (var i = 0; i < options.macroblockRows.length; i++)
                args.push(options.macroblockRows[i].toString());
        }
        if (options.tiles != null) {
            args.push("-U");
            for (var i = 0; i < 2; i++)
                args.push(options.tiles[i].toString());
        }
        if (options.flexbitsTrimming != null)
            args.push("-F", options.flexbitsTrimming.toString());
        if (options.subbands != null)
            args.push("-s", stringOption("subbands", ["all", "noflexbits", "nohighpass", "dconly"], options.subbands).toString());
        return args;
    }

    export function encode(blob: Blob, options?: EncodingOptionBag): Promise<Uint8Array>
    export function encode(arraybuffer: ArrayBuffer, options?: EncodingOptionBag): Promise<Uint8Array>
    export function encode(input: any, options?: EncodingOptionBag) {
        if (!Module || !("_jxrlibEncodeMain" in Module))
            throw new Error("jxrlib was not detected. It should be included for JxrLib.encode function.");

        var inputName = getFileName(options ? options.inputType : null, input);

        var sequence: Promise<ArrayBuffer>;
        if (input instanceof ArrayBuffer)
            sequence = Promise.resolve(input);
        else if (input instanceof Blob)
            sequence = readBlob(input);

        return sequence
            .then((buffer) => {
                FS.writeFile(inputName, new Uint8Array(buffer), { encoding: "binary" });
                return EmscriptenUtility.FileSystem.synchronize(true);
            })
            .then(() => {
                var arguments = EmscriptenUtility.allocateStringArray(
                    ["./this.program", "-v", "-i", inputName, "-o", "output.jxr"].concat(getEncoderArgumentString(options)));
                var resultCode = Module.ccall("jxrlibEncodeMain", "number", ["number", "number"], [arguments.content.length, arguments.pointer]);
                console.log(resultCode);
                if (resultCode !== 0)
                    throw new Error("Encoding failed: error code " + resultCode);
                EmscriptenUtility.deleteStringArray(arguments);
                FS.unlink(inputName);
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