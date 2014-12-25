declare module JxrLib {
    function isNativelySupported(): Promise<boolean>;
    enum PixelFormats {
        Bpp24BGR = 0,
        Bpp1BlackWhite = 1,
        Bpp8Gray = 2,
        Bpp16Gray = 3,
        Bpp16GrayFixedPoint = 4,
        Bpp16GrayHalf = 5,
        Bpp32GrayFixedPoint = 7,
        Bpp32GrayFloat = 8,
        Bpp24RGB = 9,
        Bpp48RGB = 10,
        Bpp48RGBFixedPoint = 11,
        Bpp48RGBHalf = 12,
        Bpp96RGBFixedPoint = 14,
        Bpp128RGBFloat = 15,
        Bpp32RGBE = 16,
        Bpp32CMYK = 17,
        Bpp64CMYK = 18,
        Bpp32BGRA = 22,
        Bpp64RGBA = 23,
        Bpp64RGBAFixedPoint = 24,
        Bpp64RGBAHalf = 25,
        Bpp128RGBAFixedPoint = 27,
        Bpp128RGBAFloat = 28,
        Bpp16RGB555 = 29,
        Bpp16RGB565 = 30,
        Bpp32RGB101010 = 31,
        Bpp40CMYKAlpha = 32,
        Bpp80CMYKAlpha = 33,
        Bpp32BGR = 34,
    }
    interface DecodingOptionBag {
        outputType?: string;
        outputPixelFormat?: PixelFormats;
        downscale: number;
        region?: number[];
        orientation?: {
            rotate90: boolean;
            flipHorizontally: boolean;
            flipVertically: boolean;
        };
        subbands?: string;
        channel?: {
            image: boolean;
            alpha: boolean;
        };
        postProcessingLevel: number;
    }
    function decode(blob: Blob, options?: DecodingOptionBag): Promise<Uint8Array>;
    function decode(arraybuffer: ArrayBuffer, options?: DecodingOptionBag): Promise<Uint8Array>;
    function decodeAsBlob(blob: Blob, options?: DecodingOptionBag): Promise<Blob>;
    function decodeAsBlob(arraybuffer: ArrayBuffer, options?: DecodingOptionBag): Promise<Blob>;
    function decodeAsElement(blob: Blob, options?: DecodingOptionBag): Promise<HTMLImageElement>;
    function decodeAsElement(arraybuffer: ArrayBuffer, options?: DecodingOptionBag): Promise<HTMLImageElement>;
    interface EncodingOptionBag {
        inputType?: string;
        quality?: number;
        quantization?: number;
        sourcePixelFormat?: PixelFormats;
        chromaYCoCg?: string;
        overlapLevel?: number;
        alphaFormat: string;
        alphaQuantization?: number;
        forceSpatialOrderBitstream: boolean;
        forceSequentialMode: boolean;
        forceZeroAsWhite: boolean;
        macroblockColumns: number[];
        macroblockRows: number[];
        tiles: number[];
        flexbitsTrimming: number;
        subbands?: string;
    }
    function encode(blob: Blob, options?: EncodingOptionBag): Promise<Uint8Array>;
    function encode(arraybuffer: ArrayBuffer, options?: EncodingOptionBag): Promise<Uint8Array>;
    function encodeAsBlob(blob: Blob, options?: EncodingOptionBag): Promise<Blob>;
    function encodeAsBlob(arraybuffer: ArrayBuffer, options?: EncodingOptionBag): Promise<Blob>;
    function encodeAsElement(blob: Blob, options?: EncodingOptionBag): Promise<HTMLImageElement>;
    function encodeAsElement(arraybuffer: ArrayBuffer, options?: EncodingOptionBag): Promise<HTMLImageElement>;
}
declare module EmscriptenUtility {
    interface AllocatedArray {
        content: any[];
        pointer: number;
    }
    function allocateStringArray(input: string[]): AllocatedArray;
    function deleteStringArray(input: AllocatedArray): void;
}
declare module EmscriptenUtility.FileSystem {
    function writeBlob(path: string, blob: Blob): Promise<void>;
    function synchronize(populate: boolean): Promise<void>;
}
