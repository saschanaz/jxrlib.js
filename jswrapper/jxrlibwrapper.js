var JxrLib;
(function (JxrLib) {
    function decode(blob, options) {
        var arguments = emAllocateStringArray(["saschanaz"]); //"./this.program"
        Module.ccall("mainFn", "number", ["number", "number"], [arguments.content.length, arguments.pointer]);
        emFreeStringArray(arguments);
    }
    JxrLib.decode = decode;
    function emAllocateString(input) {
        return Module.allocate(Module.intArrayFromString(input, false), "i8", ALLOC_STACK);
    }
    function emAllocateStringArray(input) {
        var array = [];
        input.forEach(function (item) { return array.push(emAllocateString(item)); });
        return {
            content: array,
            pointer: Module.allocate(array, "i16", ALLOC_STACK)
        };
    }
    function emFreeStringArray(input) {
        Module._free(input.pointer);
    }
})(JxrLib || (JxrLib = {}));
//# sourceMappingURL=jxrlibwrapper.js.map