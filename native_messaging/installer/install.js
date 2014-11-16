
var KEY_BASE = "HKCU\\Software\\Google\\Chrome\\NativeMessagingHosts";
var OPEN_TSVN_KEY = KEY_BASE + "\\" + "masamitsu.murase.open_tortoise_svn\\";

var gWshShell = WScript.CreateObject("WScript.Shell");
var gFileObject = WScript.CreateObject("Scripting.FileSystemObject");

function RegReadOpenTsvnKey()
{
    return gWshShell.RegRead(OPEN_TSVN_KEY);
}

function RegWriteOpenTsvnKey(value)
{
    gWshShell.RegWrite(OPEN_TSVN_KEY, value, "REG_SZ");
}

function TargetDirectory()
{
    return gWshShell.ExpandEnvironmentStrings("%LOCALAPPDATA%\\masamitsu.murase.open_tortoise_svn");
}

function InstallFiles()
{
    var dir = TargetDirectory();
    if (!gFileObject.FolderExists(dir)){
        gFileObject.CreateFolder(dir);
    }

    var files = [ "open_tortoise_svn.json", "open_tortoise_svn_host.exe" ];
    for (var i=0; i<files.length; i++){
        var file = files[i];

        gFileObject.CopyFile(file, dir + "\\", true);
    }
}

RegWriteOpenTsvnKey(TargetDirectory() + "\\open_tortoise_svn.json");
InstallFiles();
WScript.Echo(RegReadOpenTsvnKey());
WScript.Echo(TargetDirectory());

