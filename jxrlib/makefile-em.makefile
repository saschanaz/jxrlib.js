build: all

# Emscripten
CC=emcc

# Compiler flags
# -D : #define in proprocessor
CFLAGS=-std=c11 -I common/include -I $(DIR_SYS) -D __ANSI__ -D DISABLE_PERF_MEASUREMENT

# Directories
DIR_SYS=image/sys
DIR_DEC=image/decode
DIR_ENC=image/encode

DIR_GLUE=jxrgluelib
DIR_TEST=jxrtestlib
DIR_EXEC=jxrencoderdecoder

# Common files
OBJ_SYS=adapthuff.o image.o strcodec.o strPredQuant.o strTransform.o perfTimerANSI.o
$(OBJ_SYS):
	$(CC) $(CFLAGS) -c $(DIR_SYS)/$*.c

# Decoder
OBJ_DEC=decode.o postprocess.o segdec.o strdec.o strInvTransform.o strPredQuantDec.o JXRTranscode.o
$(OBJ_DEC):
	$(CC) $(CFLAGS) -c $(DIR_DEC)/$*.c

# Encoder
OBJ_ENC=encode.o segenc.o strenc.o strFwdTransform.o strPredQuantEnc.o
$(OBJ_ENC):
	$(CC) $(CFLAGS) -c $(DIR_ENC)/$*.c

# JPEG XR Library
# (referencing other files)
libjpegxr.bc: $(OBJ_ENC) $(OBJ_DEC) $(OBJ_SYS)
	$(CC) -shared -o $@ $(OBJ_ENC) $(OBJ_DEC) $(OBJ_SYS)

# Glue files
OBJ_GLUE=JXRGlue.o JXRMeta.o JXRGluePFC.o JXRGlueDec.o JXRGlueEnc.o JXRGlueDecUtil.o JXRGlueTCUtil.o
$(OBJ_GLUE):
	$(CC) $(CFLAGS) -I $(DIR_GLUE) -c $(DIR_GLUE)/$*.c

# Test files
OBJ_TEST=JXRTest.o JXRTestBmp.o JXRTestHdr.o JXRTestPnm.o JXRTestTif.o JXRTestYUV.o
$(OBJ_TEST):
	$(CC) $(CFLAGS) -I $(DIR_GLUE) -I $(DIR_TEST) -c $(DIR_TEST)/$*.c

libjxrglue.bc: $(OBJ_GLUE) $(OBJ_TEST)
	$(CC) -shared -o $@ $(OBJ_GLUE) $(OBJ_TEST)


LIBRARIES=libjpegxr.bc libjxrglue.bc

# Encoder app
ENCAPP=JxrEncApp
$(ENCAPP): $(LIBRARIES)
	$(CC) $(DIR_EXEC)/$(ENCAPP).c -o $(ENCAPP).out.js $(CFLAGS) -I $(DIR_GLUE) -I $(DIR_TEST) $(LIBRARIES)

# Decoder app
DECAPP=JxrDecApp
$(DECAPP): $(LIBRARIES)
	$(CC) $(DIR_EXEC)/$(DECAPP).c -o $(DECAPP).out.js $(CFLAGS) -I $(DIR_GLUE) -I $(DIR_TEST) $(LIBRARIES) -s EXPORTED_FUNCTIONS=['_mainFn']

all: $(ENCAPP) $(DECAPP)

clean:
	rm -rf *App *.o libj*.a libj*.so libj*.bc *.out.*
