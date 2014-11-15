
CC = cl
OBJS = open_tortoise_svn_host.obj json11.obj
LIBS = Shlwapi.lib

all: open_tortoise_svn_host.exe

clean:
	del $(OBJS)

open_tortoise_svn_host.exe: $(OBJS)
	$(CC) /EHsc $(OBJS) /Fe$@ /W3 /Ox $(LIBS)

.cpp.obj:
	$(CC) /EHsc $< /c /Fo$@ /W3 /Ox /D_CRT_SECURE_NO_WARNINGS

