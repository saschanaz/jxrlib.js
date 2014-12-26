var JxrLib;
(function (JxrLib) {
    var sample = "data:image/vnd.ms-photo;base64,SUm8AQgAAAAJAAG8AQAQAAAAegAAAAK8BAABAAAAAAAAAAS8BAABAAAAAAAAAIC8BAABAAAAAgAAAIG8BAABAAAAAwAAAIK8CwABAAAAAADAQoO8CwABAAAAAADAQsC8BAABAAAAigAAAMG8BAABAAAADgEAAAAAAAAkw91vA07+S7GFPXd2jckMV01QSE9UTwARRMBxAAEAAmAAoAAKAACgAAAAAQAAAAkAPv8ABEKAAAEAAAEByQ1Yf8AAAAEC+CFiBD4ggohx4eEAEYaNG1TNAiQC9xR+0RLkCyGAAABAMAALCApgSCe/8AAAAAAAAAAAAQMjN6DL0wTgiCRowm+GEBEEfCCSwwmmGEqhBEogj4QTUjCSQgl5wQ2CPqCiemEkSMJ8QQQUOaQT+kAJnaCiemEkSMJ8QVBRPTCSJGE+IIIKHNIJ/SAEzoQUOaQT+kAJnaCVUgksQgjTF0EqpBJYhBGmLoJVSCSyQRpy6CVUgksiCNMTsKHMwn9QhM7wocmE/pBCZ3hQ5MJ/SCEzvChyYT+oQmdA";
    function isNativelySupported() {
        return new Promise(function (resolve, reject) {
            var image = new Image();
            image.onload = function () {
                if (image.naturalWidth == 2 && image.naturalHeight == 3)
                    resolve(true);
                else
                    resolve(false);
            };
            image.onerror = function () { return resolve(false); };
            image.src = sample;
        });
    }
    JxrLib.isNativelySupported = isNativelySupported;
    (function (PixelFormats) {
        PixelFormats[PixelFormats["Bpp24BGR"] = 0] = "Bpp24BGR";
        PixelFormats[PixelFormats["Bpp1BlackWhite"] = 1] = "Bpp1BlackWhite";
        PixelFormats[PixelFormats["Bpp8Gray"] = 2] = "Bpp8Gray";
        PixelFormats[PixelFormats["Bpp16Gray"] = 3] = "Bpp16Gray";
        PixelFormats[PixelFormats["Bpp16GrayFixedPoint"] = 4] = "Bpp16GrayFixedPoint";
        PixelFormats[PixelFormats["Bpp16GrayHalf"] = 5] = "Bpp16GrayHalf";
        PixelFormats[PixelFormats["Bpp32GrayFixedPoint"] = 7] = "Bpp32GrayFixedPoint";
        PixelFormats[PixelFormats["Bpp32GrayFloat"] = 8] = "Bpp32GrayFloat";
        PixelFormats[PixelFormats["Bpp24RGB"] = 9] = "Bpp24RGB";
        PixelFormats[PixelFormats["Bpp48RGB"] = 10] = "Bpp48RGB";
        PixelFormats[PixelFormats["Bpp48RGBFixedPoint"] = 11] = "Bpp48RGBFixedPoint";
        PixelFormats[PixelFormats["Bpp48RGBHalf"] = 12] = "Bpp48RGBHalf";
        PixelFormats[PixelFormats["Bpp96RGBFixedPoint"] = 14] = "Bpp96RGBFixedPoint";
        PixelFormats[PixelFormats["Bpp128RGBFloat"] = 15] = "Bpp128RGBFloat";
        PixelFormats[PixelFormats["Bpp32RGBE"] = 16] = "Bpp32RGBE";
        PixelFormats[PixelFormats["Bpp32CMYK"] = 17] = "Bpp32CMYK";
        PixelFormats[PixelFormats["Bpp64CMYK"] = 18] = "Bpp64CMYK";
        PixelFormats[PixelFormats["Bpp32BGRA"] = 22] = "Bpp32BGRA";
        PixelFormats[PixelFormats["Bpp64RGBA"] = 23] = "Bpp64RGBA";
        PixelFormats[PixelFormats["Bpp64RGBAFixedPoint"] = 24] = "Bpp64RGBAFixedPoint";
        PixelFormats[PixelFormats["Bpp64RGBAHalf"] = 25] = "Bpp64RGBAHalf";
        PixelFormats[PixelFormats["Bpp128RGBAFixedPoint"] = 27] = "Bpp128RGBAFixedPoint";
        PixelFormats[PixelFormats["Bpp128RGBAFloat"] = 28] = "Bpp128RGBAFloat";
        PixelFormats[PixelFormats["Bpp16RGB555"] = 29] = "Bpp16RGB555";
        PixelFormats[PixelFormats["Bpp16RGB565"] = 30] = "Bpp16RGB565";
        PixelFormats[PixelFormats["Bpp32RGB101010"] = 31] = "Bpp32RGB101010";
        PixelFormats[PixelFormats["Bpp40CMYKAlpha"] = 32] = "Bpp40CMYKAlpha";
        PixelFormats[PixelFormats["Bpp80CMYKAlpha"] = 33] = "Bpp80CMYKAlpha";
        PixelFormats[PixelFormats["Bpp32BGR"] = 34] = "Bpp32BGR";
    })(JxrLib.PixelFormats || (JxrLib.PixelFormats = {}));
    var PixelFormats = JxrLib.PixelFormats;
    function readBlob(blob) {
        return new Promise(function (resolve, reject) {
            var reader = new FileReader();
            reader.onload = function () { return resolve(reader.result); };
            reader.onerror = function (err) { return reject(new Error(err.message)); };
            reader.readAsArrayBuffer(blob);
        });
    }
    function uint8ArrayToBlob(uint8array, mimeType) {
        return new Blob([new DataView(uint8array.buffer)], { type: mimeType });
    }
    function blobToElement(blob) {
        var image = new Image();
        image.src = URL.createObjectURL(blob, { oneTimeOnly: true });
        return image;
    }
    function getFileName(optionType, inputData) {
        var base = inputData ? "input." : "output.";
        if (optionType != null)
            return base + optionType;
        else if (!inputData)
            return base + "bmp";
        if (inputData instanceof File)
            return inputData.name;
        else if (inputData instanceof Blob) {
            switch (inputData.type) {
                case "image/bmp":
                    return base + "bmp";
                case "image/tiff":
                    return base + "tif";
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
    function stringOption(optionName, stringOptions, input) {
        var option = stringOptions.indexOf(input);
        if (option < 0)
            throw new Error("\"" + input + "\" is not supported for `options." + optionName + "`.");
        return option;
    }
    function booleanOption(booleans) {
        var bits = 0;
        for (var i = 0; i < booleans.length; i++)
            bits += ~~booleans[i] << i;
        return bits;
    }
    function orientAsBits(orientation) {
        return booleanOption([
            orientation.flipVertically,
            orientation.flipHorizontally,
            orientation.rotate90
        ]);
    }
    function getDecoderArgumentArray(options) {
        var args = [];
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
    function decode(input, options) {
        if (!Module || !("_jxrlibDecodeMain" in Module))
            throw new Error("jxrlib was not detected. It should be included for JxrLib.decode function.");
        var outputName = getFileName(options ? options.outputType : null);
        var sequence;
        if (input instanceof ArrayBuffer)
            sequence = Promise.resolve(input);
        else if (input instanceof Blob)
            sequence = readBlob(input);
        return sequence.then(function (buffer) {
            FS.writeFile("input.jxr", new Uint8Array(buffer), { encoding: "binary" });
            return EmscriptenUtility.FileSystem.synchronize(true);
        }).then(function () {
            var arguments = EmscriptenUtility.allocateStringArray(["./this.program", "-v", "-t", "-i", "input.jxr", "-o", outputName].concat(getDecoderArgumentArray(options)));
            var resultCode = Module.ccall("jxrlibDecodeMain", "number", ["number", "number"], [arguments.content.length, arguments.pointer]);
            console.log(resultCode);
            if (resultCode !== 0)
                throw new Error("Decoding failed: error code " + resultCode);
            EmscriptenUtility.deleteStringArray(arguments);
            FS.unlink("input.jxr");
            return EmscriptenUtility.FileSystem.synchronize(false);
        }).then(function () {
            var result = FS.readFile(outputName, { encoding: "binary" });
            FS.unlink(outputName);
            return result;
        });
    }
    JxrLib.decode = decode;
    function decodeAsBlob(input, options) {
        return decode(input, options).then(function (array) { return uint8ArrayToBlob(array, "image/bmp"); });
    }
    JxrLib.decodeAsBlob = decodeAsBlob;
    function decodeAsElement(input, options) {
        return decodeAsBlob(input, options).then(blobToElement);
    }
    JxrLib.decodeAsElement = decodeAsElement;
    function getEncoderArgumentString(options) {
        var args = [];
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
            args.push("-a", stringOption("alphaFormat", [, , "planar", "interleaved"], options.alphaFormat).toString());
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
    function encode(input, options) {
        if (!Module || !("_jxrlibEncodeMain" in Module))
            throw new Error("jxrlib was not detected. It should be included for JxrLib.encode function.");
        var inputName = getFileName(options ? options.inputType : null, input);
        var sequence;
        if (input instanceof ArrayBuffer)
            sequence = Promise.resolve(input);
        else if (input instanceof Blob)
            sequence = readBlob(input);
        return sequence.then(function (buffer) {
            FS.writeFile(inputName, new Uint8Array(buffer), { encoding: "binary" });
            return EmscriptenUtility.FileSystem.synchronize(true);
        }).then(function () {
            var arguments = EmscriptenUtility.allocateStringArray(["./this.program", "-v", "-i", inputName, "-o", "output.jxr"].concat(getEncoderArgumentString(options)));
            var resultCode = Module.ccall("jxrlibEncodeMain", "number", ["number", "number"], [arguments.content.length, arguments.pointer]);
            console.log(resultCode);
            if (resultCode !== 0)
                throw new Error("Encoding failed: error code " + resultCode);
            EmscriptenUtility.deleteStringArray(arguments);
            FS.unlink(inputName);
            return EmscriptenUtility.FileSystem.synchronize(false);
        }).then(function () {
            var result = FS.readFile("output.jxr", { encoding: "binary" });
            FS.unlink("output.jxr");
            return result;
        });
    }
    JxrLib.encode = encode;
    function encodeAsBlob(input, options) {
        return encode(input, options).then(function (array) { return uint8ArrayToBlob(array, "image/vnd.ms-photo"); });
    }
    JxrLib.encodeAsBlob = encodeAsBlob;
    function encodeAsElement(input, options) {
        return encodeAsBlob(input, options).then(blobToElement);
    }
    JxrLib.encodeAsElement = encodeAsElement;
})(JxrLib || (JxrLib = {}));
var EmscriptenUtility;
(function (EmscriptenUtility) {
    function allocateString(input) {
        var array = Module.intArrayFromString(input, false);
        var pointer = Module._malloc(array.length);
        Module.HEAP8.set(new Int8Array(array), pointer);
        return pointer;
    }
    function allocateStringArray(input) {
        var array = [];
        input.forEach(function (item) { return array.push(allocateString(item)); });
        var pointer = Module._calloc(array.length, 4);
        Module.HEAP32.set(new Uint32Array(array), pointer / 4);
        return {
            content: array,
            pointer: pointer
        };
    }
    EmscriptenUtility.allocateStringArray = allocateStringArray;
    function deleteStringArray(input) {
        input.content.forEach(function (item) { return Module._free(item); });
        Module._free(input.pointer);
    }
    EmscriptenUtility.deleteStringArray = deleteStringArray;
})(EmscriptenUtility || (EmscriptenUtility = {}));
var EmscriptenUtility;
(function (EmscriptenUtility) {
    var FileSystem;
    (function (FileSystem) {
        function writeBlob(path, blob) {
            return new Promise(function (resolve, reject) {
                var reader = new FileReader();
                reader.onload = function () { return resolve(reader.result); };
                reader.readAsArrayBuffer(blob);
            }).then(function (result) {
                FS.writeFile(path, new Uint8Array(result), { encoding: "binary" });
            });
        }
        FileSystem.writeBlob = writeBlob;
        function synchronize(populate) {
            return new Promise(function (resolve, reject) {
                FS.syncfs(populate, function () { return resolve(); });
            });
        }
        FileSystem.synchronize = synchronize;
    })(FileSystem = EmscriptenUtility.FileSystem || (EmscriptenUtility.FileSystem = {}));
})(EmscriptenUtility || (EmscriptenUtility = {}));
//# sourceMappingURL=jxrlibwrapper.js.map