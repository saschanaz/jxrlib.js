#include "JXRGlue.h"

ERR PKCodecFactory_CreateDecoderFromFile(const char* szFilename, PKImageDecode** ppDecoder)
{
    ERR err = WMP_errSuccess;

    char *pExt = NULL;
    const PKIID* pIID = NULL;

    struct WMPStream* pStream = NULL;
    PKImageDecode* pDecoder = NULL;

    // get file extension
    pExt = strrchr(szFilename, '.');
    FailIf(NULL == pExt, WMP_errUnsupportedFormat);

    // get decode PKIID
    Call(GetImageDecodeIID(pExt, &pIID));

    // create stream
    Call(CreateWS_File(&pStream, szFilename, "rb"));

    // Create decoder
#if 0
    Call(PKCodecFactory_CreateCodec(pIID, (void **) ppDecoder));
#else
    // We know we are creating a decoder here
    Call(PKImageDecode_Create_WMP(ppDecoder));
#endif

    pDecoder = *ppDecoder;

    // attach stream to decoder
    Call(pDecoder->Initialize(pDecoder, pStream));
    pDecoder->fStreamOwner = !0;

Cleanup:
    return err;
}