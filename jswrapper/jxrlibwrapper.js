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
    function readBlob(blob) {
        return new Promise(function (resolve, reject) {
            var reader = new FileReader();
            reader.onload = function () { return resolve(reader.result); };
            reader.onerror = function (err) { return reject(new Error(err.message)); };
            reader.readAsArrayBuffer(blob);
        });
    }
    function decode(input, options) {
        var sequence;
        if (input instanceof ArrayBuffer)
            sequence = Promise.resolve(input);
        else if (input instanceof Blob)
            sequence = readBlob(input);
        return sequence.then(function (buffer) {
            FS.writeFile("input.jxr", new Uint8Array(buffer), { encoding: "binary" });
            return EmscriptenUtility.FileSystem.synchronize(true);
        }).then(function () {
            var arguments = EmscriptenUtility.allocateStringArray(["./this.program", "-v", "-i", "input.jxr", "-o", "output.bmp"]);
            var resultCode = Module.ccall("mainFn", "number", ["number", "number"], [arguments.content.length, arguments.pointer]);
            console.log(resultCode);
            if (resultCode !== 0)
                throw new Error("Decoding failed: error code " + resultCode);
            EmscriptenUtility.deleteStringArray(arguments);
            FS.unlink("input.jxr");
            return EmscriptenUtility.FileSystem.synchronize(false);
        }).then(function () {
            var result = FS.readFile("output.bmp", { encoding: "binary" });
            FS.unlink("output.bmp");
            return result;
        });
    }
    JxrLib.decode = decode;
    function decodeAsBlob(input, options) {
        return decode(input, options).then(function (uint8array) {
            return new Blob([new DataView(uint8array.buffer)], { type: "image/bmp" });
        });
    }
    JxrLib.decodeAsBlob = decodeAsBlob;
    function decodeAsElement(input, options) {
        return decodeAsBlob(input, options).then(function (blob) {
            var image = new Image();
            image.src = URL.createObjectURL(blob, { oneTimeOnly: true });
            return image;
        });
    }
    JxrLib.decodeAsElement = decodeAsElement;
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