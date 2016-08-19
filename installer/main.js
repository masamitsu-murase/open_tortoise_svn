//
//================================================================
//

var gWshShell = WScript.CreateObject("WScript.Shell");
var gFileObject = WScript.CreateObject("Scripting.FileSystemObject");


var THIS_DIR = WScript.ScriptFullName.substr(0, WScript.ScriptFullName.length - WScript.ScriptName.length - 1);

var KEY_BASE = "HKCU\\Software\\Google\\Chrome\\NativeMessagingHosts";
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
    return gWshShell.ExpandEnvironmentStrings("%LOCALAPPDATA%\\masamitsu.murase.open_tortoise_svn");
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

function CreateBinaryFile(name, data)
{
    var stream = WScript.CreateObject("ADODB.Stream");
    stream.Open();
    stream.Type = 2;  // Text
    stream.Charset = "iso-8859-1";

    var i = 0;
    while(data[i] !== null) {
        stream.WriteText(String.fromCharCode(data[i]));
        i++;
    }
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
    WScript.Echo("");
    if (success){
        WScript.Echo("Installation was completed successfully.\n"
                     + "Files are installed in '" + TargetDirectory() + "'.");
    }else{
        WScript.Echo("Installation failed.");
    }
}

function EchoUninstallMessage(success)
{
    if (success){
        WScript.Echo("Uninstallation was completed successfully.");
    }else{
        WScript.Echo("Uninstallation failed.");
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
        WScript.Echo("Installing...");
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

