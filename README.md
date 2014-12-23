jxrlib.js
=========

A trial to bring jxrlib to JavaScript world, by Emscripten.

### Example

```javascript
// <img id="image" />
JxrLib.decodeAsBlob(this.files[0])
  .then(function (blob) { 
    window.image.src = window.URL.createObjectURL(blob, { oneTimeOnly: true });
  });
```

### API

Decoding options will be supported very soon.

```typescript
declare module JxrLib {
    var sample: string;
    function download(url: string): Promise<ArrayBuffer>;
    function isNativelySupported(): Promise<boolean>;
    
    function decode(blob: Blob): Promise<Uint8Array>;
    function decode(arraybuffer: ArrayBuffer): Promise<Uint8Array>;
    function decodeAsBlob(blob: Blob): Promise<Blob>;
    function decodeAsBlob(arraybuffer: ArrayBuffer): Promise<Blob>;
    function decodeAsElement(blob: Blob): Promise<HTMLImageElement>;
    function decodeAsElement(arraybuffer: ArrayBuffer): Promise<HTMLImageElement>;
}
```

### Depends on:

ES6 Promise (Natively supported on Firefox, Chrome, and IE Technical Preview as of December 2014)
