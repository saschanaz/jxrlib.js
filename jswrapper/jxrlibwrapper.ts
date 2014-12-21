module JxrLib {
    export interface DecodingOptionBag {
    }
    export function decode(blob: Blob, options: DecodingOptionBag) {
        var arguments = emAllocateStringArray(["saschanaz"]);//"./this.program"
        Module.ccall("mainFn", "number", ["number", "number"], [arguments.content.length, arguments.pointer]);
        emFreeStringArray(arguments);
    }

    interface AllocatedArray {
        content: any[];
        pointer: number;
    }
    function emAllocateString(input: string) {
        return Module.allocate(Module.intArrayFromString(input, false), "i8", ALLOC_STACK);
    }
    function emAllocateStringArray(input: string[]) {
        var array: number[] = [];
        input.forEach((item) => array.push(emAllocateString(item)));
        return <AllocatedArray>{
            content: array,
            pointer: Module.allocate(array, "i16", ALLOC_STACK)
        };
    }
    function emFreeStringArray(input: AllocatedArray) {
        Module._free(input.pointer);
    }
}