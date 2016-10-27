
//
//================================================================
//

var JSON_DATA;
if (!JSON_DATA) {
    JSON_DATA = null;
}
var EXE_DATA;
if (!EXE_DATA) {
    EXE_DATA = null;
}

var gWshShell = WScript.CreateObject("WScript.Shell");
var gFileObject = WScript.CreateObject("Scripting.FileSystemObject");

var INSTALLER_TITLE = "Open TortoiseSVN - Installer";
var UNINSTALLER_TITLE = "Open TortoiseSVN - Uninstaller";
var GITHUB_URL = "https://github.com/masamitsu-murase/open_tortoise_svn";

var KEY_BASE = "HKCU\\Software\\Mozilla\\NativeMessagingHosts";
var OPEN_TSVN_KEY = KEY_BASE + "\\" + "masamitsu.murase.open_tortoise_svn\\";
var JSON_FILENAME = "open_tortoise_svn.json";
var FILE_LIST = [ {
  name: "open_tortoise_svn.json",
  data: JSON_DATA
}, {
  name: "open_tortoise_svn_host.exe",
  data: EXE_DATA
} ];

////////////////////////////////////////////////////////////////
function TargetDirectory()
{
    return gWshShell.ExpandEnvironmentStrings("%LOCALAPPDATA%\\masamitsu.murase.open_tortoise_svn_fx");
}

function SetRegKey()
{
    var value = TargetDirectory() + "\\" + JSON_FILENAME;
    gWshShell.RegWrite(OPEN_TSVN_KEY, value, "REG_SZ");
}

function GetRegKey()
{
    return gWshShell.RegRead(OPEN_TSVN_KEY);
}

function CheckRegKey()
{
    try{
        if (GetRegKey() == TargetDirectory() + "\\" + JSON_FILENAME){
            return true;
        }else{
            return null;
        }
    }catch(e){
        return false;
    }
}

function DeleteRegKey()
{
    try{
        gWshShell.RegDelete(OPEN_TSVN_KEY);
    }catch(e){
    }
}

function Hex2Bytes(hex)
{
    var doc = null;
    try {
        doc = WScript.CreateObject("Msxml2.DOMDocument.6.0");
    } catch(e) {
        doc = null;
    }
    if (doc === null) {
        doc = WScript.CreateObject("Msxml2.DOMDocument");
    }
    var elem = doc.createElement("hex");
    elem.dataType = "bin.hex";
    elem.text = hex;
    return elem.nodeTypedValue;
}

function CreateBinaryFile(name, data)
{
    var stream = WScript.CreateObject("ADODB.Stream");
    stream.Open();
    stream.Type = 1;  // Binary
    stream.Write(Hex2Bytes(data));
    stream.SaveToFile(name, 2);  // adSaveCreateOverWrite
    stream.Close();
}

function InstallFiles()
{
    var dir = TargetDirectory();
    if (!gFileObject.FolderExists(dir)){
        gFileObject.CreateFolder(dir);
    }

    var files = FILE_LIST;
    for (var i=0; i<files.length; i++){
        CreateBinaryFile(dir + "\\" + files[i].name, files[i].data);
    }
}

function UninstallFiles()
{
    var dir = TargetDirectory();
    if (gFileObject.FolderExists(dir)){
        gFileObject.DeleteFolder(dir, true);
    }
}

function CheckFiles()
{
    try{
        var dir = TargetDirectory();
        if (!gFileObject.FolderExists(dir)){
            return false;
        }

        var files = FILE_LIST;
        for (var i=0; i<files.length; i++){
            var file = dir + "\\" + files[i].name;
            if (!gFileObject.FileExists(file)){
                return null;
            }
        }
    }catch(e){
        return null;
    }
    return true;
}

function InstallAll()
{
    SetRegKey();
    InstallFiles();
}

function UninstallAll()
{
    DeleteRegKey();
    UninstallFiles();
}

function EchoInstallMessage(success)
{
    if (success){
        gWshShell.Popup("Installation was completed successfully.\n"
                        + "Files were installed in '" + TargetDirectory() + "'.", 0,
                        INSTALLER_TITLE, 0);
    }else{
        gWshShell.Popup("Installation failed.\n"
                        + "If you face this issue, please let me know the issue in my GitHub page.\n"
                        + "  " + GITHUB_URL, 0,
                        INSTALLER_TITLE, 0);
    }
}

function EchoUninstallMessage(success)
{
    if (success){
        gWshShell.Popup("Uninstallation was completed successfully.", 0,
                        UNINSTALLER_TITLE, 0);
    }else{
        gWshShell.Popup("Uninstallation failed.", 0,
                        UNINSTALLER_TITLE, 0);
    }
}


function main()
{
    if (WScript.Arguments.length != 1){
        WScript.Echo("Invalid argument.");
        return;
    }

    switch(WScript.Arguments(0)){
      case "install":
        try{
            InstallAll();
            EchoInstallMessage(CheckRegKey() && CheckFiles());
        }catch(e){
            EchoInstallMessage(false);
        }
        break;
      case "uninstall":
        try{
            if (CheckRegKey()===false && CheckFiles()===false){
                EchoUninstallMessage(true);
                break;
            }

            UninstallAll();
            EchoUninstallMessage(CheckRegKey()===false && CheckFiles()===false);
        }catch(e){
            EchoUninstallMessage(false);
        }
        break;
      default:
        WScript.Echo("Invalid argument.");
        break;
    }
}

main();

