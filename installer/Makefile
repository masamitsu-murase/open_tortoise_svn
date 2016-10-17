
CFLAGS = /EHsc /W3 /Ox /DNDEBUG /MT /D_WINDOWS
LFLAGS = shell32.lib ole32.lib shlwapi.lib Advapi32.lib User32.lib /SUBSYSTEM:WINDOWS

all: copy_tsvn_tool.exe remove_tsvn_tool.exe

clean:
	del *.obj copy_tsvn_tool.exe remove_tsvn_tool.exe *.res

copy_tsvn_tool.exe: copy_tsvn_tool.obj install.res
	link copy_tsvn_tool.obj install.res $(LFLAGS) /MANIFEST:EMBED /MANIFESTUAC:"level='asInvoker' uiAccess='false'"

remove_tsvn_tool.exe: remove_tsvn_tool.obj uninstall.res
	link remove_tsvn_tool.obj uninstall.res $(LFLAGS) /MANIFEST:EMBED /MANIFESTUAC:"level='asInvoker' uiAccess='false'"

copy_tsvn_tool.obj: main.cpp binary_data.h
	cl main.cpp /DINSTALLER $(CFLAGS) /c /Fo$@

remove_tsvn_tool.obj: main.cpp binary_data.h
	cl main.cpp /DUNINSTALLER $(CFLAGS) /c /Fo$@

binary_data.h: ..\native_messaging\open_tortoise_svn_host.exe ..\native_messaging\open_tortoise_svn.json
	ruby prepare.rb

.rc.res:
	rc /D "_UNICODE" /D "UNICODE" /l 0x0409 /nologo /fo$@ $<

