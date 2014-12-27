jxrlib.js
=========

A trial to bring [jxrlib](http://jxrlib.codeplex.com/), an open source JPEG XR library, to the JavaScript world.

You can try it [here](http://saschanaz.github.io/jxrlib.js).

### Example

```javascript
// <img id="image" />
JxrLib.decodeAsBlob(this.files[0])
  .then(function (blob) {
    window.image.src = window.URL.createObjectURL(blob, { oneTimeOnly: true });
  });
```

### API

Basic functions:

```typescript
declare module JxrLib {
  // Checks whether the browser natively supports JPEG XR
  function isNativelySupported(): Promise<boolean>;  

  function decode(blob: Blob, options?: DecodingOptionBag): Promise<Uint8Array>;
  function decode(arraybuffer: ArrayBuffer, options?: DecodingOptionBag): Promise<Uint8Array>;
  function decodeAsBlob(blob: Blob, options?: DecodingOptionBag): Promise<Blob>;
  function decodeAsBlob(arraybuffer: ArrayBuffer, options?: DecodingOptionBag): Promise<Blob>;
  function decodeAsElement(blob: Blob, options?: DecodingOptionBag): Promise<HTMLImageElement>;
  function decodeAsElement(arraybuffer: ArrayBuffer, options?: DecodingOptionBag): Promise<HTMLImageElement>;

  function encode(blob: Blob, options?: EncodingOptionBag): Promise<Uint8Array>;
  function encode(arraybuffer: ArrayBuffer, options?: EncodingOptionBag): Promise<Uint8Array>;
  function encodeAsBlob(blob: Blob, options?: EncodingOptionBag): Promise<Blob>;
  function encodeAsBlob(arraybuffer: ArrayBuffer, options?: EncodingOptionBag): Promise<Blob>;
  function encodeAsElement(blob: Blob, options?: EncodingOptionBag): Promise<HTMLImageElement>;
  function encodeAsElement(arraybuffer: ArrayBuffer, options?: EncodingOptionBag): Promise<HTMLImageElement>;
}
```

Interfaces for options:

```typescript
interface DecodingOptionBag {
  outputType?: string;
  outputPixelFormat?: PixelFormats;
  region?: number[];
  downscale: number;
  orientation?: {
    flipVertically: boolean;
    flipHorizontally: boolean;
    rotate90: boolean;
  };
  subbands?: string;
  channel?: {
    alpha: boolean;
    image: boolean;
  };
  postProcessingLevel: number;
}
interface EncodingOptionBag {
  inputType?: string;
  sourcePixelFormat?: PixelFormats;
  quality?: number;
  quantization?: number;
  orientation?: ImageOrienting;
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
interface ImageOrienting {
  flipVertically: boolean;
  flipHorizontally: boolean;
  rotate90: boolean;
}
```

### Depends on:

* ES6 Promise (Natively supported on Firefox, Chrome, and IE Technical Preview as of December 2014)
