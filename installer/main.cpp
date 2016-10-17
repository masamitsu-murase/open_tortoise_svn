
#include <iostream>
#include <fstream>
#include <string>
#include <vector>

#include <windows.h>
#include <Shellapi.h>
#include <shlobj.h>
#include <Objbase.h>
#include <Shlwapi.h>

#include "binary_data.h"


const std::wstring TARGET_FOLDER(L"masamitsu.murase.open_tortoise_svn_fx");
const std::string KEY_BASE("Software\\Mozilla\\NativeMessagingHosts");
const std::string OPEN_TSVN_KEY_NAME("masamitsu.murase.open_tortoise_svn");
const std::string OPEN_TSVN_KEY(KEY_BASE + "\\" + OPEN_TSVN_KEY_NAME);


class RegCloser
{
  public:
    RegCloser(HKEY key)
         : m_key(key)
    {
    }

    ~RegCloser()
    {
        RegCloseKey(m_key);
    }

  private:
    HKEY m_key;
};


std::wstring GetTargetFolderPath()
{
    PWSTR path;
    HRESULT result = SHGetKnownFolderPath(FOLDERID_LocalAppData, 0, NULL, &path);

    if (result != S_OK) {
        throw std::runtime_error("Cannot get folder path");
    }

    std::wstring target_path = std::wstring(path) + L"\\" + TARGET_FOLDER;

    CoTaskMemFree(path);

    return target_path;
}

std::wstring GetTargetJsonPath()
{
    return GetTargetFolderPath() + L"\\" + L"open_tortoise_svn.json";
}

std::wstring GetTargetExePath()
{
    return GetTargetFolderPath() + L"\\" + L"open_tortoise_svn_host.exe";
}

void CreateTargetFolder()
{
    std::wstring target_path = GetTargetFolderPath();

    if (PathFileExistsW(target_path.c_str())) {
        if (!PathIsDirectoryW(target_path.c_str())) {
            throw std::runtime_error("Cannot create folder");
        }

        return;
    }

    BOOL ret = CreateDirectoryW(target_path.c_str(), NULL);
    if (!ret) {
        throw std::runtime_error("Cannot create target folder");
    }
}

void CreateFiles()
{
    {
        std::ofstream json(GetTargetJsonPath(), std::ios::binary);
        json.write(reinterpret_cast< const char* >(open_tortoise_svn_json), sizeof(open_tortoise_svn_json));
    }

    {
        std::ofstream json(GetTargetExePath(), std::ios::binary);
        json.write(reinterpret_cast< const char* >(open_tortoise_svn_host_exe), sizeof(open_tortoise_svn_host_exe));
    }
}

void RemoveFiles()
{
    const std::wstring &json_path = GetTargetJsonPath();
    if (PathFileExistsW(json_path.c_str())) {
        if (!DeleteFileW(json_path.c_str())) {
            throw std::runtime_error("Failed to remove file.");
        }
    }

    const std::wstring &exe_path = GetTargetExePath();
    if (PathFileExistsW(exe_path.c_str())) {
        if (!DeleteFileW(exe_path.c_str())) {
            throw std::runtime_error("Failed to remove file.");
        }
    }

    const std::wstring &folder_path = GetTargetFolderPath();
    if (PathIsDirectoryW(folder_path.c_str()) && PathIsDirectoryEmptyW(folder_path.c_str())) {
        if (!RemoveDirectoryW(folder_path.c_str())) {
            throw std::runtime_error("Failed to remove files.");
        }
    }
}

void CreateRegistry()
{
    HKEY key;
    LONG result;

    result = RegCreateKeyExA(HKEY_CURRENT_USER, OPEN_TSVN_KEY.c_str(), 0, NULL, REG_OPTION_NON_VOLATILE,
                                  KEY_ALL_ACCESS, NULL, &key, NULL);
    if (result != ERROR_SUCCESS) {
        throw std::runtime_error("Failed to create registry key.");
    }
    RegCloser rc(key);

    std::wstring value = GetTargetJsonPath();
    result = RegSetValueExW(key, NULL, 0, REG_SZ, reinterpret_cast< const BYTE* >(value.c_str()), (value.size() + 1) * sizeof(wchar_t));
    if (result != ERROR_SUCCESS) {
        throw std::runtime_error("Failed to set a value to registry key.");
    }
}

void RemoveRegistry()
{
    HKEY key;
    LONG result;

    result = RegOpenKeyExA(HKEY_CURRENT_USER, KEY_BASE.c_str(), 0, KEY_ALL_ACCESS, &key);
    if (result != ERROR_SUCCESS) {
        throw std::runtime_error("Failed to delete registry key.");
    }
    RegCloser rc(key);

    result = RegQueryValueExA(key, OPEN_TSVN_KEY_NAME.c_str(), NULL, NULL, NULL, NULL);
    if (result == ERROR_FILE_NOT_FOUND) {
        return;
    } else if (result != ERROR_SUCCESS) {
        throw std::runtime_error("Failed to delete registry key.");
    }

    result = RegDeleteKeyEx(key, OPEN_TSVN_KEY_NAME.c_str(), KEY_WOW64_64KEY, 0);
    if (result != ERROR_SUCCESS) {
        throw std::runtime_error("Failed to delete registry key.");
    }
}

void Install()
{
    CreateTargetFolder();
    CreateFiles();
    CreateRegistry();
}

void Uninstall()
{
    RemoveFiles();
    RemoveRegistry();
}

int WINAPI WinMain(
    HINSTANCE hInstance, 
    HINSTANCE hPrevInstance, 
    LPSTR lpCmdLine, 
    int nCmdShow
)
{
#ifdef INSTALLER
    try {
        std::wstring message;

        message = L"Click 'OK' to install open_tortoise_svn_host.exe or 'Cancel' to exit the installer.";
        if (MessageBoxW(NULL, message.c_str(), L"Installer - Open TortoiseSVN", MB_OKCANCEL) != IDOK) {
            return 0;
        }

        Install();

        message = L"Installation was completed successfully.\n\n";
        message += L"Files were installed in '" + GetTargetFolderPath() + L"'";
        MessageBoxW(NULL, message.c_str(), L"Installer - Open TortoiseSVN", MB_OK);
    } catch (const std::runtime_error &) {
        std::wstring message;
        message = L"Installation failed.";
        MessageBoxW(NULL, message.c_str(), L"Installer - Open TortoiseSVN", MB_OK);
    }
#endif
#ifdef UNINSTALLER
    try {
        std::wstring message;

        message = L"Click 'OK' to uninstall open_tortoise_svn_host.exe or 'Cancel' to exit the uninstaller.";
        if (MessageBoxW(NULL, message.c_str(), L"Uninstaller - Open TortoiseSVN", MB_OKCANCEL) != IDOK) {
            return 0;
        }

        Uninstall();

        message = L"Uninstallation was completed successfully.";
        MessageBoxW(NULL, message.c_str(), L"Uninstaller - Open TortoiseSVN", MB_OK);

    } catch (const std::runtime_error &) {
        std::wstring message;
        message = L"Uninstallation failed.";
        MessageBoxW(NULL, message.c_str(), L"Uninstaller - Open TortoiseSVN", MB_OK);
    }
#endif

    return 0;
}

