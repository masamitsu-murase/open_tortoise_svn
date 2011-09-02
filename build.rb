
require("pathname")

def zip(output, targets)
  system("7z a -tzip #{output} #{targets.join(' ')}")
end

xpi_file = Pathname.new("open_tortoise_svn.xpi")
xpi_file.rmtree if (xpi_file.exist?)

zip(xpi_file, [ "chrome.manifest", "content", "install.rdf", "locale", "skin" ])

