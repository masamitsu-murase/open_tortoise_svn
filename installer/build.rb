# coding: utf-8

require("fileutils")
require("pathname")
require("seven_zip_ruby")
require("net/http")
require("uri")
require("stringio")

RUBY_PATH = Pathname(__dir__) + "ruby"
URL = "http://dl.bintray.com/oneclick/rubyinstaller/ruby-2.2.5-i386-mingw32.7z"

def fetch(uri_str, limit = 10)
  # You should choose better exception.
  raise ArgumentError, 'HTTP redirect too deep' if limit == 0

  response = Net::HTTP.get_response(URI.parse(uri_str))
  case response
  when Net::HTTPSuccess
    response
  when Net::HTTPRedirection
    fetch(response['location'], limit - 1)
  else
    raise "Error: Invalid HTTP Response"
  end
end

def download_ruby_installer
  if RUBY_PATH.exist?
    puts "Ruby is found. Use it."
    return
  end

  puts "Downloading..."
  data = fetch(URL).body.b

  RUBY_PATH.mkpath
  puts "Extracting..."
  SevenZipRuby::Reader.open(StringIO.new(data)) do |szr|
    szr.extract(:all, RUBY_PATH.to_s)
  end
end

def main
  download_ruby_installer

  FileUtils.cp("../native_messaging/open_tortoise_svn.json", "open_tortoise_svn.json")
  FileUtils.cp("../native_messaging/open_tortoise_svn_host.exe", "open_tortoise_svn_host.exe")

  ENV["PATH"] = Dir.glob(RUBY_PATH.to_s.gsub("\\"){ "/" } + "/*/bin").first.gsub("/"){ "\\" }

  system("gem update --system --no-rdoc --no-ri")
  system("gem install ocra --version 1.3.6 --no-rdoc --no-ri")


  # Note:
  #  How to create stubw.exe:
  #   1. Replace icon images with Resource Hacker.
  #   2. Add manifest to avoid UAC.
  #        > mt.exe ?manifest stubw.manifest -outputresource:stubw.exe;1

  # Replace stubw.exe.
  stubw = Dir.glob(RUBY_PATH.to_s.gsub("\\"){ "/" } + "/*/lib/ruby/gems/*/gems/ocra-*/share/ocra/stubw.exe").first
  FileUtils.cp("stubw.exe", stubw)

  installer = Pathname("install.exe")
  installer.rmtree if installer.exist?
  system("ocra --windows --no-enc --gem-minimal --no-autodll install.rb open_tortoise_svn.json open_tortoise_svn_host.exe")

  uninstaller = Pathname("uninstall.exe")
  uninstaller.rmtree if uninstaller.exist?
  system("ocra --windows --no-enc --gem-minimal --no-autodll uninstall.rb open_tortoise_svn.json open_tortoise_svn_host.exe")

  FileUtils.cp("install.exe", "../extension/install.exe", verbose: true)
  FileUtils.cp("uninstall.exe", "../extension/uninstall.exe", verbose: true)
end

def clean
  [ "install.exe", "uninstall.exe", "open_tortoise_svn.json", "open_tortoise_svn_host.exe", "ruby" ].each do |item|
    file = Pathname(item)
    file.rmtree if file.exist?
  end
end

Dir.chdir(__dir__) do
  if ARGV[0] == "clean"
    clean
  else
    main
  end
end

