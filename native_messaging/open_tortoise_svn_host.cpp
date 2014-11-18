
#include <cstdio>
#include <cstdint>
#include <cctype>
#include <iostream>
#include <vector>
#include <stdexcept>
#include <string>
#include <algorithm>

#include <io.h>
#include <fcntl.h>

#include "json11.hpp"

#include <windows.h>
#include <Shlwapi.h>

#define VERSION "1.0"

#define TSVN_PROC_NAME "TortoiseProc.exe"
#define TSVN_PROC_NAME_W  L"TortoiseProc.exe"

namespace{

void set_binary_mode()
{
    _setmode(_fileno(stdin), _O_BINARY);
    _setmode(_fileno(stdout), _O_BINARY);
}

std::wstring string_to_wstring(const std::string &str)
{
    int count = MultiByteToWideChar(CP_UTF8, 0, str.c_str(), str.size(), NULL, 0);
    if (count == 0){
        return std::wstring();
    }

    std::vector<WCHAR> ret(count);
    MultiByteToWideChar(CP_UTF8, 0, str.c_str(), str.size(), &ret[0], ret.size());
    return std::wstring(ret.begin(), ret.end());
}

std::string wstring_to_string(const std::wstring &str)
{
    int count = WideCharToMultiByte(CP_UTF8, 0, str.c_str(), str.size(), NULL, 0, NULL, NULL);
    if (count == 0){
        return std::string();
    }

    std::vector<char> ret(count);
    WideCharToMultiByte(CP_UTF8, 0, str.c_str(), str.size(), &ret[0], ret.size(), NULL, NULL);
    return std::string(ret.begin(), ret.end());
}

json11::Json get_json(std::istream &in)
{
    std::uint32_t size;
    in.read(reinterpret_cast<char*>(&size), sizeof(size));
    if (!in || !size){
        throw std::runtime_error("Invalid size is specified.");
    }

    std::vector<char> buf(size + 1);

    in.read(&buf[0], size);
    if (!in){
        throw std::runtime_error("Invalid data is specified.");
    }
    buf[size] = '\0';

    std::string error;
    auto ret = json11::Json::parse(&buf[0], error);
    if (!error.empty()){
        throw std::runtime_error(error);
    }

    return ret;
}

bool exec_command(const std::wstring &app, const std::vector<std::wstring> &args)
{
    std::wstring command_line = std::wstring(L"\"") + app + L"\"";
    for (unsigned int i=0; i<args.size(); i++){
        command_line.append(L" " + args[i]);
    }

    PROCESS_INFORMATION pi;
    STARTUPINFOW si;

    ZeroMemory(&si,sizeof(si));
    si.cb = sizeof(si);
    si.dwFlags = STARTF_USESHOWWINDOW;
    si.wShowWindow = SW_SHOWNORMAL;

    // Why the 2nd argument of CreateProcessW is not const?
    std::vector<WCHAR> cmd(command_line.size() + 1);
    std::copy(command_line.begin(), command_line.end(), cmd.begin());
    cmd[cmd.size() - 1] = L'\0';

    if (!CreateProcessW(app.c_str(), &cmd[0], NULL, NULL, FALSE, NORMAL_PRIORITY_CLASS,
                        NULL, NULL, &si, &pi)){
        return false;
    }

    CloseHandle(pi.hThread);
    CloseHandle(pi.hProcess);

    return true;
}

json11::Json run_tortoise_svn(const json11::Json &param)
{
    const std::string tsvn_proc("\\" TSVN_PROC_NAME);
    const std::string &path = param["path"].string_value();
    if (path.length() <= tsvn_proc.length()
         || path.compare(path.length() - tsvn_proc.length(), tsvn_proc.length(), tsvn_proc) != 0){
        throw std::runtime_error("Path should end with " TSVN_PROC_NAME ".");
    }

    std::wstring wpath = string_to_wstring(path);
    if (!PathFileExistsW(wpath.c_str())){
        throw std::runtime_error(TSVN_PROC_NAME " is not found.");
    }

    json11::Json::array args_in_json = param["args"].array_items();
    std::vector<std::wstring> args(args_in_json.size());
    std::transform(args_in_json.begin(), args_in_json.end(), args.begin(), [](const json11::Json &arg){
        return string_to_wstring(arg.string_value());
    });

    bool result = exec_command(wpath, args);
    if (!result){
        throw std::runtime_error("Failed to execute " TSVN_PROC_NAME ".");
    }

    return true;
}

json11::Json search_tortoise_svn(const json11::Json &param)
{
    const std::wstring tsvn_relative_path = L"TortoiseSVN\\bin";

    const WCHAR *env_list[] = { L"ProgramFiles", L"ProgramFiles(x86)" };

    std::vector< std::vector<WCHAR> > additional_path;
    for (unsigned int i=0; i<sizeof(env_list)/sizeof(env_list[0]); i++){
        DWORD size = GetEnvironmentVariableW(env_list[i], NULL, 0);
        if (size){
            additional_path.resize(additional_path.size() + 1);
            std::vector<WCHAR> &path = additional_path.back();
            path.resize(MAX_PATH);
            GetEnvironmentVariableW(env_list[i], &path[0], size);
            if (!PathAppendW(&path[0], tsvn_relative_path.c_str())){
                additional_path.pop_back();
            }
        }
    }

    std::vector<const WCHAR*> additional_path_ptr(additional_path.size() + 1, NULL);
    std::transform(additional_path.begin(), additional_path.end(), additional_path_ptr.begin(),
                   [](const std::vector<WCHAR> &value){ return &value[0]; });
    WCHAR tsvn_path[MAX_PATH] = TSVN_PROC_NAME_W;
    if (!PathFindOnPathW(tsvn_path, &additional_path_ptr[0])){
        return false;
    }

    return wstring_to_string(std::wstring(tsvn_path));
}

json11::Json process_param(const json11::Json &param)
{
    std::string action = param["action"].string_value();
    if (action == "version"){
        return VERSION;
    }else if (action == "tsvn"){
        return run_tortoise_svn(param);
    }else if (action == "search_tsvn"){
        return search_tortoise_svn(param);
    }else{
        throw std::runtime_error("Unknown action is specified.");
    }
}

void print_json(std::ostream &out, const json11::Json &param)
{
    std::string str = param.dump();
    std::uint32_t size = str.size();
    out.write(reinterpret_cast<char*>(&size), sizeof(size));
    out.write(str.c_str(), size);
    out.flush();
}

void print_json_success(std::ostream &out, const json11::Json &data)
{
    json11::Json::object ret;
    ret["result"] = true;
    ret["data"] = data;
    print_json(out, ret);
}

void print_json_failure(std::ostream &out, const std::string &error)
{
    json11::Json::object ret;
    ret["result"] = false;
    ret["error"] = error;
    print_json(out, ret);
}

}

int main(int argc, char *argv[])
{
    if (argc == 2){
        std::string arg(argv[1]);
        std::transform(arg.begin(), arg.end(), arg.begin(), [](char c){
            return static_cast<char>(std::tolower(c));
        });

        if (arg == "-v" || arg == "/v" || arg == "--version"){
            std::cout << "Version: " << VERSION << std::endl;
            return 0;
        }
    }

    set_binary_mode();

    try{
        auto param = get_json(std::cin);
        auto data = process_param(param);
        print_json_success(std::cout, data);
    }catch(const std::exception &e){
        print_json_failure(std::cout, e.what());
    }

    return 0;
}

