
require_relative("main.rb")

POPUP_TITLE = "Uninstaller - Open TortoiseSVN"

def usage
  msg = "Run uninstall.exe to uninstall open_tortoise_svn_host.exe."
  WSH.Popup(msg, 0, POPUP_TITLE, 0)
end

def really_uninstall?
  msg = "Click 'OK' to uninstall open_tortoise_svn_host.exe or 'Cancel' to exit the uninstaller."
  #                             OK&Cancel
  ret = WSH.Popup(msg, 0, POPUP_TITLE, 1)
  # ret is 1 for OK, 2 for Cancel.
  return ret == 1
end

def main
  if ARGV.size != 0
    usage
    return
  end

  return unless really_uninstall?

  uninstall_all
  show_uninstall_message(check_uninstalled)
rescue => e
  show_uninstall_message(false)
end

exit if defined?(Ocra)
main

