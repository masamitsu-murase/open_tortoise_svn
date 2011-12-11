
system("svnadmin create repos")
path = File.expand_path(File.dirname(__FILE__))
repos_url = "file:///#{path}/repos"

system("svn co #{repos_url} working")
Dir.chdir("working") do
  File.open("test.html", "w") do |file|
    file << "sample\n"
  end
  File.open("test.htm", "w") do |file|
    file << "sample htm\n"
  end
  system("svn add test.html")
  system("svn add test.htm")
  system("svn commit -m \"commit test.html test.htm\"")

  File.open("test.cpp", "w") do |file|
    file << "sample cpp\n"
  end
  system("svn add test.cpp")
  File.open("test.c", "w") do |file|
    file << "sample c\n"
  end
  system("svn add test.c")
  system("svn commit -m \"commit test.cpp test.c\"")

  File.open("test.txt", "w") do |file|
    file << "sample txt\n"
  end
  system("svn add test.txt")
  system("svn commit -m \"commit test.txt\"")
end

