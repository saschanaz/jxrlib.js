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

Decoding options will be supported very soon.

```typescript
declare module JxrLib {
  function decode(blob: Blob): Promise<Uint8Array>;
  function decode(arraybuffer: ArrayBuffer): Promise<Uint8Array>;
  function decodeAsBlob(blob: Blob): Promise<Blob>;
  function decodeAsBlob(arraybuffer: ArrayBuffer): Promise<Blob>;
  function decodeAsElement(blob: Blob): Promise<HTMLImageElement>;
  function decodeAsElement(arraybuffer: ArrayBuffer): Promise<HTMLImageElement>;
  
  // Checks whether the browser natively supports JPEG XR
  function isNativelySupported(): Promise<boolean>;  
}
```

### Depends on:

* ES6 Promise (Natively supported on Firefox, Chrome, and IE Technical Preview as of December 2014)
