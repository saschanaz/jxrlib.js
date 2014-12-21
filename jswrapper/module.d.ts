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

    function intArrayFromString(stringy: string, dontAddNull: boolean, length?: number): number;

    function ccall(ident: string, returnType: string, argTypes: string[], args: any[]): any;

    function _free(byteOffset: number): void;
}

declare module FS {
}