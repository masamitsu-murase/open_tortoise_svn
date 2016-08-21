
require_relative("main.rb")

POPUP_TITLE = "Installer - Open TortoiseSVN"

def usage
  msg = "Run install.exe to install open_tortoise_svn_host.exe."
  WSH.Popup(msg, 0, POPUP_TITLE, 0)
end

def really_install?
  msg = "Click 'OK' to install open_tortoise_svn_host.exe or 'Cancel' to exit the installer."
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

  return unless really_install?

  install_all
  show_install_message(check_installed)
rescue => e
  show_install_message(false)
end

exit if defined?(Ocra)
main

