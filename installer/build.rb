# coding: utf-8

require("fileutils")

INSTALL_BAT_PREFIX = <<'EOS'
@if(0)==(0) ECHO OFF
start "" wscript.exe //nologo //E:JScript "%~f0" install
exit
@end
EOS

UNINSTALL_BAT_PREFIX = <<'EOS'
@if(0)==(0) ECHO OFF
start "" wscript.exe //nologo //E:JScript "%~f0" uninstall
exit
@end
EOS

def create_installer
  json_path = File.expand_path("../../native_messaging/open_tortoise_svn.json", __FILE__)
  json_data = File.open(json_path, "rb", &:read).each_byte.map{ |i| i.to_s(16).rjust(2, "0") }.join("")
  exe_path = File.expand_path("../../native_messaging/open_tortoise_svn_host.exe", __FILE__)
  exe_data = File.open(exe_path, "rb", &:read).each_byte.map{ |i| i.to_s(16).rjust(2, "0") }.join("")

  path = File.expand_path("../install.bat", __FILE__)
  File.open(path, "w") do |file|
    file.puts(INSTALL_BAT_PREFIX)
    file.puts("var JSON_DATA = \"#{json_data}\";")
    file.puts("var EXE_DATA = \"#{exe_data}\";")
    file.puts(File.open(File.expand_path("../base.js", __FILE__), "r", &:read))
  end

  FileUtils.cp(path, File.expand_path("../../extension/", __FILE__))
end

def create_uninstaller
  path = File.expand_path("../uninstall.bat", __FILE__)
  File.open(path, "w") do |file|
    file.puts(UNINSTALL_BAT_PREFIX)
    file.puts(File.open(File.expand_path("../base.js", __FILE__), "r", &:read))
  end

  FileUtils.cp(path, File.expand_path("../../extension/", __FILE__))
end

create_installer
create_uninstaller

