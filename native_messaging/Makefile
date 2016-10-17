
CC = cl
LINK = link
OBJS = open_tortoise_svn_host.obj json11.obj
LIBS = Shlwapi.lib

all: open_tortoise_svn_host.exe

clean:
	del $(OBJS)

open_tortoise_svn_host.exe: $(OBJS) open_tortoise_svn_host.res
	$(LINK) /OUT:$@ $(OBJS) open_tortoise_svn_host.res $(LIBS) /MANIFEST:EMBED /MANIFESTUAC:"level='asInvoker' uiAccess='false'"

.cpp.obj:
	$(CC) /EHsc $< /c /MT /Fo$@ /W3 /Ox /D_CRT_SECURE_NO_WARNINGS /DNDEBUG

.rc.res:
	rc /D "_UNICODE" /D "UNICODE" /l 0x0409 /nologo /fo$@ $<

