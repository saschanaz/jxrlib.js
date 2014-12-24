build: lib

# Emscripten
CC=emcc

# Compiler flags
# -D : #define in proprocessor
CFLAGS=-O2 --memory-init-file 0 -std=c11 -I common/include -I $(DIR_SYS) -D __ANSI__ -D DISABLE_PERF_MEASUREMENT -D _EMSCRIPTEN_

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
ENCCOMPILE=$(CC) $(DIR_EXEC)/$(ENCAPP).c $(CFLAGS) -I $(DIR_GLUE) -I $(DIR_TEST) $(LIBRARIES)
$(ENCAPP): $(LIBRARIES)
	$(ENCCOMPILE) -o $(ENCAPP).out.js -s EXPORTED_FUNCTIONS=['_main']

# Decoder app
DECAPP=JxrDecApp
DECCOMPILE=$(CC) $(DIR_EXEC)/$(DECAPP).c $(CFLAGS) -I $(DIR_GLUE) -I $(DIR_TEST) $(LIBRARIES)
$(DECAPP): $(LIBRARIES)
	$(DECCOMPILE) -o $(DECAPP).out.js -s EXPORTED_FUNCTIONS=['_main']

# Single integrated Library
INTLIB=JxrLib
INTCOMPILE=$(CC) $(DIR_EXEC)/$(DECAPP).c $(DIR_EXEC)/$(ENCAPP).c $(CFLAGS) -I $(DIR_GLUE) -I $(DIR_TEST) $(LIBRARIES) -D _NOMAIN_
$(INTLIB): $(LIBRARIES)
	$(INTCOMPILE) -o $(INTLIB).out.js -s EXPORTED_FUNCTIONS=['_jxrlibDecodeMain','_jxrlibEncodeMain']

app: $(ENCAPP) $(DECAPP)

lib: $(INTLIB)

clean:
	rm -rf *App *.o libj*.a libj*.so libj*.bc *.out.*
