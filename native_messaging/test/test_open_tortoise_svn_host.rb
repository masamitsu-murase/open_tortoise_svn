# coding: utf-8

require("pathname")
require("json")
require("fileutils")
require("minitest/autorun")
require("minitest/unit")

BASE_DIR = Pathname(__FILE__).expand_path.parent.parent
THIS_DIR = Pathname(__FILE__).expand_path.parent
HOST_EXE_PATH = BASE_DIR + "open_tortoise_svn_host.exe"
TEMP_DIR = THIS_DIR + "tmp"
SAMPLE_EXE_PATH = THIS_DIR + "a.exe"


class TestOpenTortoiseSvnHost < MiniTest::Unit::TestCase
  def setup
    @env = ENV.to_a.clone
    TEMP_DIR.mkpath
  end

  def teardown
    ENV.clear
    @env.each do |key, value|
      ENV[key] = value
    end
    TEMP_DIR.rmtree
  end

  def send_json(io, data)
    if data.kind_of?(String)
      json_str = data.to_json
    else
      json_str = JSON.generate(data)
    end
    str = [ json_str.bytesize ].pack("L") + json_str.b
    io.write(str)
  end

  def receive_json(io)
    length = io.read(4).unpack("L")[0]
    str = io.read(length).force_encoding(Encoding::UTF_8)
    return JSON.parse(str)
  end

  def run_tsvn_host(obj)
    IO.popen(HOST_EXE_PATH.to_s, "r+") do |io|
      io.binmode
      send_json(io, obj)
      next receive_json(io)
    end
  end


  def test_invalid_command
    # 0x0A0D means CR LF, so this may causes unexpected result if host does not consider binmode.
    obj = run_tsvn_host("a" * (0x0A0D - 2))
    assert_equal false, obj["result"]
    assert obj["error"]

    obj = run_tsvn_host({ "action" => "unknown_action" })
    assert_equal false, obj["result"]
    assert obj["error"]

    obj = run_tsvn_host({ "unknown_key" => true })
    assert_equal false, obj["result"]
    assert obj["error"]
  end

  def test_action_tsvn
    sample_proc = TEMP_DIR + "®日本語" + "TortoiseProc.exe"
    sample_proc.parent.mkpath

    obj = run_tsvn_host({ "action" => "tsvn", "path" => sample_proc.to_s.gsub("/"){ "\\" } })
    assert_equal false, obj["result"]

    FileUtils.cp(SAMPLE_EXE_PATH, sample_proc)
    obj = run_tsvn_host({ "action" => "tsvn", "path" => sample_proc.to_s.gsub("/"){ "\\" } })
    assert_equal true, obj["result"]

    obj = run_tsvn_host({ "action" => "tsvn", "pat" => sample_proc.to_s.gsub("/"){ "\\" } })
    assert_equal false, obj["result"]

    obj = run_tsvn_host({ "action" => "tsvn", "path" => sample_proc.parent.to_s.gsub("/"){ "\\" } })
    assert_equal false, obj["result"]
  end

  def test_action_search_tsvn_from_path
    sample_proc = TEMP_DIR + "日本語" + "TortoiseProc.exe"
    sample_proc.parent.mkpath

    ENV.clear
    FileUtils.cp(SAMPLE_EXE_PATH, sample_proc)
    obj = run_tsvn_host({ "action" => "search_tsvn" })
    assert_equal true, obj["result"]
    assert_equal false, obj["data"]

    ENV.clear
    ENV["PATH"] = sample_proc.parent.to_s.encode(Encoding::CP932).gsub("/"){ "\\" }
    obj = run_tsvn_host({ "action" => "search_tsvn" })
    assert_equal true, obj["result"]
    assert_equal sample_proc.to_s.gsub("/"){ "\\" }, obj["data"]

    ENV.clear
    ENV["ProgramFiles"] = TEMP_DIR.to_s.gsub("/"){ "\\" }
    proc_path = TEMP_DIR + "TortoiseSVN" + "bin" + "TortoiseProc.exe"
    proc_path.parent.mkpath
    FileUtils.cp(SAMPLE_EXE_PATH, proc_path)
    obj = run_tsvn_host({ "action" => "search_tsvn" })
    assert_equal true, obj["result"]
    assert_equal proc_path.to_s.gsub("/"){ "\\" }, obj["data"]
  end
end

