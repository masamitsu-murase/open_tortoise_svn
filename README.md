# ![Open TortoiseSVN logo](https://raw.githubusercontent.com/masamitsu-murase/open_tortoise_svn_for_google_chrome/master/extension/icons/icon128.png) Open TortoiseSVN for Google Chrome™

## Overview

This extension enables you to open [TortoiseSVN](http://tortoisesvn.tigris.org/) directly.  
When you click the link to one of the registered URLs, TortoiseSVN Repository Browser is opened automatically.

This extension also provides some context menus to open TortoiseSVN Repository Browser, Log Viewer and Blame Viewer.

This extension is a Google Chrome™ version of [Open TortoiseSVN for Firefox](https://addons.mozilla.org/en/firefox/addon/open-tortoisesvn/).

## For Developers

This extension uses [Native Messaging](https://developer.chrome.com/extensions/messaging#native-messaging).

Native Messaging is a feature supported by Google Chrome.  
It communicates with the pre-installed native exectable file.

In the case of Open TortoiseSVN extension, users have to install [open_tortoise_svn_host.exe](https://github.com/masamitsu-murase/open_tortoise_svn_for_google_chrome/raw/master/native_messaging/open_tortoise_svn_host.exe) in advance as follows:

* Place `open_tortoise_svn_host.exe` and `open_tortoise_svn.json` in `%LOCALAPPDATA%\masamitsu.murase.open_tortoise_svn`.
* Create a registry key `HKCU\Software\Google\Chrome\NativeMessagingHosts\masamitsu.murase.open_tortoise_svn\`, whose value is `%LOCALAPPDATA%\masamitsu.murase.open_tortoise_svn\open_tortoise_svn.json`.  
  Of course, the value must has an expanded absolute path, i.e. `%LOCALAPPDATA%` should be replaced with the real path.

This registry key belongs to `HKEY_CURRENT_USER`, so it can be created without administrator privileges.

This extension uses [json11](https://github.com/dropbox/json11) to parse/dump JSON data.  
json11 is developed by Dropbox Inc.  
Thank you, Dropbox!  
You can check the license of json11 in the [source file](https://raw.githubusercontent.com/masamitsu-murase/open_tortoise_svn_for_google_chrome/master/native_messaging/json11.hpp).

## License

You may use this software under the terms of the MIT License.

Copyright (c) 2014 Masamitsu MURASE

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

