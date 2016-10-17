
def main
  File.open("binary_data.h", "w") do |file|
    file.puts('#ifndef BINARY_DATA_H__')
    file.puts('#define BINARY_DATA_H__')
    file.puts

    file.puts("const unsigned char open_tortoise_svn_json[] = {")
    File.open("../native_messaging/open_tortoise_svn.json", "rb", &:read).each_byte.each_slice(32) do |list|
      file.puts("  " + list.map{ |i| "0x" + i.to_s(16).rjust(2, "0") }.join(",") + ",")
    end
    file.puts("};")
    file.puts

    file.puts("const unsigned char open_tortoise_svn_host_exe[] = {")
    File.open("../native_messaging/open_tortoise_svn_host.exe", "rb", &:read).each_byte.each_slice(32) do |list|
      file.puts("  " + list.map{ |i| "0x" + i.to_s(16).rjust(2, "0") }.join(",") + ",")
    end
    file.puts("};")
    file.puts

    file.puts('#endif')
  end
end

Dir.chdir(__dir__) do
  main
end


