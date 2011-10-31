/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* ***** BEGIN LICENSE BLOCK *****
 * Version: NPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Netscape Public License
 * Version 1.1 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.mozilla.org/NPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is mozilla.org code.
 *
 * The Initial Developer of the Original Code is 
 * Netscape Communications Corporation.
 * Portions created by the Initial Developer are Copyright (C) 1998
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or 
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the NPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the NPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

//////////////////////////////////////////////////
//
// CPlugin class implementation
//
#ifdef XP_WIN
#include <windows.h>
#include <windowsx.h>
#include <Shlwapi.h>
#endif

#include <vector>
#include <algorithm>
#include <cwctype>
#include <string>
#include <functional>

#include "plugin.h"
#include "npfunctions.h"

static NPIdentifier tsvn_id;

// Helper class that can be used to map calls to the NPObject hooks
// into virtual methods on instances of classes that derive from this
// class.
class ScriptablePluginObjectBase : public NPObject
{
  public:
    ScriptablePluginObjectBase(NPP npp)
         : mNpp(npp)
    {
    }

    virtual ~ScriptablePluginObjectBase()
    {
    }

    // Virtual NPObject hooks called through this base class. Override
    // as you see fit.
    virtual void Invalidate();
    virtual bool HasMethod(NPIdentifier name);
    virtual bool Invoke(NPIdentifier name, const NPVariant *args,
                        uint32_t argCount, NPVariant *result);
    virtual bool InvokeDefault(const NPVariant *args, uint32_t argCount,
                               NPVariant *result);
    virtual bool HasProperty(NPIdentifier name);
    virtual bool GetProperty(NPIdentifier name, NPVariant *result);
    virtual bool SetProperty(NPIdentifier name, const NPVariant *value);
    virtual bool RemoveProperty(NPIdentifier name);
    virtual bool Enumerate(NPIdentifier **identifier, uint32_t *count);
    virtual bool Construct(const NPVariant *args, uint32_t argCount,
                           NPVariant *result);

  public:
    static void _Deallocate(NPObject *npobj);
    static void _Invalidate(NPObject *npobj);
    static bool _HasMethod(NPObject *npobj, NPIdentifier name);
    static bool _Invoke(NPObject *npobj, NPIdentifier name,
                        const NPVariant *args, uint32_t argCount,
                        NPVariant *result);
    static bool _InvokeDefault(NPObject *npobj, const NPVariant *args,
                               uint32_t argCount, NPVariant *result);
    static bool _HasProperty(NPObject * npobj, NPIdentifier name);
    static bool _GetProperty(NPObject *npobj, NPIdentifier name,
                             NPVariant *result);
    static bool _SetProperty(NPObject *npobj, NPIdentifier name,
                             const NPVariant *value);
    static bool _RemoveProperty(NPObject *npobj, NPIdentifier name);
    static bool _Enumerate(NPObject *npobj, NPIdentifier **identifier,
                           uint32_t *count);
    static bool _Construct(NPObject *npobj, const NPVariant *args,
                           uint32_t argCount, NPVariant *result);

  protected:
    NPP mNpp;
};

#define DECLARE_NPOBJECT_CLASS_WITH_BASE(_class, ctor)                          \
static NPClass s##_class##_NPClass = {                                          \
    NP_CLASS_STRUCT_VERSION_CTOR,                                               \
    ctor,                                                                       \
    ScriptablePluginObjectBase::_Deallocate,                                    \
    ScriptablePluginObjectBase::_Invalidate,                                    \
    ScriptablePluginObjectBase::_HasMethod,                                     \
    ScriptablePluginObjectBase::_Invoke,                                        \
    ScriptablePluginObjectBase::_InvokeDefault,                                 \
    ScriptablePluginObjectBase::_HasProperty,                                   \
    ScriptablePluginObjectBase::_GetProperty,                                   \
    ScriptablePluginObjectBase::_SetProperty,                                   \
    ScriptablePluginObjectBase::_RemoveProperty,                                \
    ScriptablePluginObjectBase::_Enumerate,                                     \
    ScriptablePluginObjectBase::_Construct                                      \
}

#define GET_NPOBJECT_CLASS(_class) &s##_class##_NPClass

void ScriptablePluginObjectBase::Invalidate()
{
}

bool ScriptablePluginObjectBase::HasMethod(NPIdentifier name)
{
    return false;
}

bool ScriptablePluginObjectBase::Invoke(NPIdentifier name, const NPVariant *args,
                                        uint32_t argCount, NPVariant *result)
{
    return false;
}

bool ScriptablePluginObjectBase::InvokeDefault(const NPVariant *args,
                                               uint32_t argCount, NPVariant *result)
{
    return false;
}

bool ScriptablePluginObjectBase::HasProperty(NPIdentifier name)
{
    return false;
}

bool ScriptablePluginObjectBase::GetProperty(NPIdentifier name, NPVariant *result)
{
    return false;
}

bool ScriptablePluginObjectBase::SetProperty(NPIdentifier name,
                                             const NPVariant *value)
{
    return false;
}

bool ScriptablePluginObjectBase::RemoveProperty(NPIdentifier name)
{
    return false;
}

bool ScriptablePluginObjectBase::Enumerate(NPIdentifier **identifier,
                                           uint32_t *count)
{
    return false;
}

bool ScriptablePluginObjectBase::Construct(const NPVariant *args, uint32_t argCount,
                                           NPVariant *result)
{
    return false;
}

// static
void ScriptablePluginObjectBase::_Deallocate(NPObject *npobj)
{
    // Call the virtual destructor.
    delete (ScriptablePluginObjectBase *)npobj;
}

// static
void ScriptablePluginObjectBase::_Invalidate(NPObject *npobj)
{
    ((ScriptablePluginObjectBase *)npobj)->Invalidate();
}

// static
bool ScriptablePluginObjectBase::_HasMethod(NPObject *npobj, NPIdentifier name)
{
    return ((ScriptablePluginObjectBase *)npobj)->HasMethod(name);
}

// static
bool ScriptablePluginObjectBase::_Invoke(NPObject *npobj, NPIdentifier name,
                                         const NPVariant *args, uint32_t argCount,
                                         NPVariant *result)
{
    return ((ScriptablePluginObjectBase *)npobj)->Invoke(name, args, argCount,
                                                         result);
}

// static
bool ScriptablePluginObjectBase::_InvokeDefault(NPObject *npobj,
                                                const NPVariant *args,
                                                uint32_t argCount,
                                                NPVariant *result)
{
    return ((ScriptablePluginObjectBase *)npobj)->InvokeDefault(args, argCount,
                                                                result);
}

// static
bool ScriptablePluginObjectBase::_HasProperty(NPObject * npobj, NPIdentifier name)
{
    return ((ScriptablePluginObjectBase *)npobj)->HasProperty(name);
}

// static
bool ScriptablePluginObjectBase::_GetProperty(NPObject *npobj, NPIdentifier name,
                                              NPVariant *result)
{
    return ((ScriptablePluginObjectBase *)npobj)->GetProperty(name, result);
}

// static
bool ScriptablePluginObjectBase::_SetProperty(NPObject *npobj, NPIdentifier name,
                                              const NPVariant *value)
{
    return ((ScriptablePluginObjectBase *)npobj)->SetProperty(name, value);
}

// static
bool ScriptablePluginObjectBase::_RemoveProperty(NPObject *npobj, NPIdentifier name)
{
    return ((ScriptablePluginObjectBase *)npobj)->RemoveProperty(name);
}

// static
bool ScriptablePluginObjectBase::_Enumerate(NPObject *npobj,
                                            NPIdentifier **identifier,
                                            uint32_t *count)
{
    return ((ScriptablePluginObjectBase *)npobj)->Enumerate(identifier, count);
}

// static
bool ScriptablePluginObjectBase::_Construct(NPObject *npobj, const NPVariant *args,
                                            uint32_t argCount, NPVariant *result)
{
    return ((ScriptablePluginObjectBase *)npobj)->Construct(args, argCount, result);
}


class ScriptablePluginObject : public ScriptablePluginObjectBase
{
  public:
    ScriptablePluginObject(NPP npp)
         : ScriptablePluginObjectBase(npp)
    {
    }

    virtual bool HasMethod(NPIdentifier name);
    virtual bool HasProperty(NPIdentifier name);
    virtual bool GetProperty(NPIdentifier name, NPVariant *result);
    virtual bool Invoke(NPIdentifier name, const NPVariant *args,
                        uint32_t argCount, NPVariant *result);
    virtual bool InvokeDefault(const NPVariant *args, uint32_t argCount,
                               NPVariant *result);

  private:
    bool checkTsvnProcExe(const std::wstring &path);
    bool checkTsvnArgumentPath(const std::wstring &path);
    bool checkTsvnArgument(const NPVariant *args, uint32_t argCount);
    bool execTsvn(const NPVariant *args, uint32_t argCount);
};

static NPObject *AllocateScriptablePluginObject(NPP npp, NPClass *aClass)
{
    return new ScriptablePluginObject(npp);
}

DECLARE_NPOBJECT_CLASS_WITH_BASE(ScriptablePluginObject, AllocateScriptablePluginObject);

bool ScriptablePluginObject::HasMethod(NPIdentifier name)
{
    if (name == tsvn_id){
        return true;
    }
    return false;
}

bool ScriptablePluginObject::HasProperty(NPIdentifier name)
{
    return false;
}

bool ScriptablePluginObject::GetProperty(NPIdentifier name, NPVariant *result)
{
    VOID_TO_NPVARIANT(*result);
    return true;
}

bool ScriptablePluginObject::Invoke(NPIdentifier name, const NPVariant *args,
                                    uint32_t argCount, NPVariant *result)
{
    if (name == tsvn_id){
        if (!checkTsvnArgument(args, argCount)){
            BOOLEAN_TO_NPVARIANT(false, *result);
            return true;
        }

        if (!execTsvn(args, argCount)){
            BOOLEAN_TO_NPVARIANT(false, *result);
            return true;
        }

        BOOLEAN_TO_NPVARIANT(true, *result);
        return true;
    }

    return false;
}

bool ScriptablePluginObject::InvokeDefault(const NPVariant *args, uint32_t argCount,
                                           NPVariant *result)
{
    VOID_TO_NPVARIANT(*result);
    return false;
}

static std::wstring stringToUtf16(const NPVariant &str)
{
    std::vector< WCHAR > ret;

    int count = MultiByteToWideChar(CP_UTF8, 0, NPVARIANT_TO_STRING(str).UTF8Characters,
                                    NPVARIANT_TO_STRING(str).UTF8Length, NULL, 0);
    if (count == 0){
        return std::wstring();
    }

    ret.resize(count);
    count = MultiByteToWideChar(CP_UTF8, 0, NPVARIANT_TO_STRING(str).UTF8Characters,
                                NPVARIANT_TO_STRING(str).UTF8Length, &ret[0], ret.size());
    return std::wstring(ret.begin(), ret.end());
}

bool ScriptablePluginObject::checkTsvnProcExe(const std::wstring &path)
{
    const std::wstring invalid_chars(L"\"");

    if (std::find_first_of(path.begin(), path.end(), invalid_chars.begin(), invalid_chars.end()) != path.end()){
        return false;
    }
    if (!PathFileExists(path.c_str())){
        return false;
    }

    return true;
}

bool ScriptablePluginObject::checkTsvnArgumentPath(const std::wstring &path)
{
    const std::wstring invalid_chars(L"\"");
    if (std::find_first_of(path.begin(), path.end(), invalid_chars.begin(), invalid_chars.end()) != path.end()){
        return false;
    }

    const std::wstring correct_path(L"/path:");
    return std::equal(correct_path.begin(), correct_path.end(), path.begin());
}

bool ScriptablePluginObject::checkTsvnArgument(const NPVariant *args, uint32_t argCount)
{
    if (argCount < 2){
        return false;
    }

    // arg type check
    for (uint32_t i=0; i<argCount; i++){
        if (!NPVARIANT_IS_STRING(args[i])){
            return false;
        }
    }

    if (!checkTsvnProcExe(stringToUtf16(args[0]))){
        return false;
    }

    // check each command
    std::wstring command = stringToUtf16(args[1]);
    if (command == L"/command:repobrowser"){
        if (argCount != 3 || !checkTsvnArgumentPath(stringToUtf16(args[2]))){
            return false;
        }
    }else if (command == L"/command:log"){
        if (argCount < 3 || argCount > 5 || !checkTsvnArgumentPath(stringToUtf16(args[2]))){
            return false;
        }

        bool startrev = false;
        bool endrev = false;
        for (uint32_t i=3; i<argCount; i++){
            std::wstring rev = stringToUtf16(args[i]);
            const std::wstring start(L"/startrev:");
            const std::wstring end(L"/endrev:");
            if (rev.size() > start.size() && std::equal(start.begin(), start.end(), rev.begin())){
                if (startrev
                    || std::find_if(rev.begin() + start.size(), rev.end(),
                                    std::not1(std::ptr_fun< wint_t, int >(std::iswdigit))) != rev.end()){
                    return false;
                }
                startrev = true;
            }else if (rev.size() > end.size() && std::equal(end.begin(), end.end(), rev.begin())){
                if (endrev 
                    || std::find_if(rev.begin() + end.size(), rev.end(), 
                                    std::not1(std::ptr_fun< wint_t, int >(std::iswdigit))) != rev.end()){
                    return false;
                }
                endrev = true;
            }else{
                return false;
            }
        }
    }else if (command == L"/command:blame"){
        if (argCount != 3 || !checkTsvnArgumentPath(stringToUtf16(args[2]))){
            return false;
        }
    }else{
        return false;
    }

    return true;
}

bool ScriptablePluginObject::execTsvn(const NPVariant *args, uint32_t argCount)
{
    std::wstring app_name = stringToUtf16(args[0]);

    std::wstring command_line = std::wstring(L"\"") + app_name + L"\"";
    for (uint32_t i=1; i<argCount; i++){
        command_line.append(L" ");
        command_line.append(stringToUtf16(args[i]));
    }

    PROCESS_INFORMATION pi;
    STARTUPINFO si;

    ZeroMemory(&si,sizeof(si));
    si.cb = sizeof(si);
    si.dwFlags = STARTF_USESHOWWINDOW;
    si.wShowWindow = SW_SHOWNORMAL;

    std::vector< WCHAR > cmd(command_line.size() + 1);
    std::copy(command_line.begin(), command_line.end(), cmd.begin());
    cmd[cmd.size() - 1] = L'\0';

    if (!CreateProcess(app_name.c_str(), &cmd[0], NULL, NULL, FALSE, NORMAL_PRIORITY_CLASS,
                       NULL, NULL, &si, &pi)){
        return false;
    }

    CloseHandle(pi.hThread);
    CloseHandle(pi.hProcess);

    return true;
}

///////////////////////////////////////////
CPlugin::CPlugin(NPP pNPInstance)
     : m_pNPInstance(pNPInstance),
       m_pNPStream(NULL),
       m_bInitialized(false),
       m_pScriptableObject(NULL)
{
    tsvn_id = NPN_GetStringIdentifier("tsvn");
}

CPlugin::~CPlugin()
{
    if (m_pScriptableObject){
        NPN_ReleaseObject(m_pScriptableObject);
    }
}

NPBool CPlugin::init(NPWindow* pNPWindow)
{
    if (!pNPWindow){
        return false;
    }

    m_Window = pNPWindow;

    m_bInitialized = true;
    return true;
}

void CPlugin::shut()
{
    m_bInitialized = false;
}

NPBool CPlugin::isInitialized()
{
    return m_bInitialized;
}

int16_t CPlugin::handleEvent(void* event)
{
    return 0;
}

NPObject *CPlugin::GetScriptableObject()
{
    if (!m_pScriptableObject){
        m_pScriptableObject = NPN_CreateObject(m_pNPInstance, GET_NPOBJECT_CLASS(ScriptablePluginObject));
    }

    if (m_pScriptableObject){
        NPN_RetainObject(m_pScriptableObject);
    }

    return m_pScriptableObject;
}
