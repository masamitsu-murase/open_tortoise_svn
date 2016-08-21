
require("pathname")
require("fileutils")
require("win32ole")

TARGET_DIR = Pathname(ENV["LOCALAPPDATA"]) + "masamitsu.murase.open_tortoise_svn_fx"
KEY_BASE = "HKCU\\Software\\Mozilla\\NativeMessagingHosts"

OPEN_TSVN_KEY = KEY_BASE + "\\" + "masamitsu.murase.open_tortoise_svn\\"
JSON_FILENAME = "open_tortoise_svn.json"
FILE_LIST = [ "open_tortoise_svn.json", "open_tortoise_svn_host.exe" ]

WSH = WIN32OLE.new("WScript.Shell")

def set_reg_key
  value = TARGET_DIR.to_s.gsub("/"){ "\\" } + "\\" + JSON_FILENAME
  WSH.RegWrite(OPEN_TSVN_KEY, value, "REG_SZ")
end

def get_reg_key
  return WSH.RegRead(OPEN_TSVN_KEY)
end

def check_reg_key
  return get_reg_key == TARGET_DIR.to_s.gsub("/"){ "\\" } + "\\" + JSON_FILENAME
end

def delete_reg_key
  WSH.RegDelete(OPEN_TSVN_KEY)
end

def install_files
  TARGET_DIR.mkpath unless TARGET_DIR.exist?

  FILE_LIST.each do |item|
    FileUtils.cp(Pathname(__dir__) + item, TARGET_DIR + item)
  end
end

def uninstall_files
  TARGET_DIR.rmtree if TARGET_DIR.exist?
end

def check_files
  return false unless TARGET_DIR.directory?
  return false unless FILE_LIST.all?{ |item| (TARGET_DIR + item).file? }

  return FILE_LIST.all?{ |item| FileUtils.compare_file(Pathname(__dir__) + item, TARGET_DIR + item) }
end

def install_all
  set_reg_key
  install_files
end

def check_installed
  return check_reg_key && check_files
end

def uninstall_all
  delete_reg_key rescue nil
  uninstall_files rescue nil
end

def check_uninstalled
  key_removed = false
  begin
    get_reg_key
  rescue => e
    key_removed = true
  end

  return key_removed && !(TARGET_DIR.exist?)
end

def show_install_message(success)
  if success
    msg = "Installation was completed successfully.\n\n" +
      "Files are installed in '" + TARGET_DIR.to_s.gsub("/"){ "\\" } + "'."
    #                             OK
    WSH.Popup(msg, 0, POPUP_TITLE, 0)
  else
    msg = "Installation failed."
    #                             OK   !
    WSH.Popup(msg, 0, POPUP_TITLE, 0 + 48)
  end
end

def show_uninstall_message(success)
  if success
    msg = "Uninstallation was completed successfully."
    #                             OK
    WSH.Popup(msg, 0, POPUP_TITLE, 0)
  else
    msg = "Uninstallation failed."
    #                             OK   !
    WSH.Popup(msg, 0, POPUP_TITLE, 0 + 48)
  end
end


