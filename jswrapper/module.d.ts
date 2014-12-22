declare enum EmscriptenMemoryAllocator { }
declare var ALLOC_STATIC: EmscriptenMemoryAllocator;
declare var ALLOC_STACK: EmscriptenMemoryAllocator;
declare var ALLOC_NORMAL: EmscriptenMemoryAllocator;
declare var ALLOC_NONE: EmscriptenMemoryAllocator;
declare var ALLOC_DYNAMIC: EmscriptenMemoryAllocator;

declare module Module {
    function allocate(slab: any[], types: string[], allocator: EmscriptenMemoryAllocator): number;
    function allocate(slab: any[], types: string, allocator: EmscriptenMemoryAllocator): number;
    function allocate(slab: number, types: any, allocator: EmscriptenMemoryAllocator): number;

    function intArrayFromString(stringy: string, dontAddNull: boolean, length?: number): number[];

    function ccall(ident: string, returnType: string, argTypes: string[], args: any[]): any;

    function _free(byteOffset: number): void;
    function _malloc(size: number): number;
    function _calloc(num: number, size: number): number;
    var HEAP8: Int8Array;
    var HEAP32: Int32Array;
}

declare module FS {
    interface IOOptionBag {
        encoding?: string; // "binary"|"utf8"
        flags?: string;
    }
    function syncfs(populate: boolean, callback: (err: any) => any): void;
    function writeFile(path: string, data: ArrayBufferView, opts: IOOptionBag): void;
    function readFile(path: string, opts: IOOptionBag): any; // string|Uint8Array
    function unlink(path: string): void;
}