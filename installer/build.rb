
require("fileutils")
require("pathname")

INSTALLER_HEADER = <<'EOS'
@if (0)==(0) echo off
cscript //E:JScript //Nologo "%~f0" install
pause
exit
@end
EOS

UNINSTALLER_HEADER = <<'EOS'
@if (0)==(0) echo off
cscript //E:JScript //Nologo "%~f0" uninstall
pause
exit
@end
EOS


NM_DIR = Pathname("../native_messaging")
NM_EXE = NM_DIR + "open_tortoise_svn_host.exe"
NM_JSON = NM_DIR + "open_tortoise_svn.json"
INSTALL_BAT = "install.bat"
UNINSTALL_BAT = "uninstall.bat"
MAIN_JS = "main.js"
TARGET_DIR = Pathname("../extension")
TARGET = TARGET_DIR + "open_tortoise_svn_host.zip"

def create_install_bat(exe_data, json_data)
  File.open(INSTALL_BAT, "w") do |file|
    file.puts INSTALLER_HEADER

    file.puts "var EXE_DATA = ["
    exe_data.each_byte.each_slice(16) do |list|
      file.puts(list.map{ |i| "0x" + i.to_s(16).rjust(2, "0") }.join(", ") + ",")
    end
    file.puts "null ];"

    file.puts "var JSON_DATA = ["
    json_data.each_byte.each_slice(16) do |list|
      file.puts(list.map{ |i| "0x" + i.to_s(16).rjust(2, "0") }.join(", ") + ",")
    end
    file.puts "null ];"

    file.puts(File.open(MAIN_JS, "r", &:read))
  end
end

def create_uninstall_bat
  File.open(UNINSTALL_BAT, "w") do |file|
    file.puts UNINSTALLER_HEADER
    file.puts "var EXE_DATA = [ null ];"
    file.puts "var JSON_DATA = [ null ];"
    file.puts(File.open(MAIN_JS, "r", &:read))
  end
end

def create_zip
  TARGET.rmtree if TARGET.exist?
  system("\"C:/Program Files/7-Zip/7z.exe\" a #{TARGET} #{INSTALL_BAT} #{UNINSTALL_BAT}")
end

def main
  exe_data = File.open(NM_EXE, "rb", &:read).b
  json_data = File.open(NM_JSON, "rb", &:read).b
  create_install_bat(exe_data, json_data)
  create_uninstall_bat

  create_zip
end

Dir.chdir(__dir__) do
  main
end

