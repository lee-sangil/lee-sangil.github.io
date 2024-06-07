---
title: "[Electron] How To Update an Electron App Automatically"
categories:
 - Electron
 - JavaScript
tags:
 - electron
 - autoUpdater
header:
  teaser: /assets/image/thumbnail/electron.jpg
excerpt_separator: <!--more-->
---

> The autoUpdater enables an electron app to check the latest version and update itself automatically. [^updater]

<!--more-->

#### Installation
You can install autoUpdater via NPM or yarn:
```bash
npm install --save—dev electron-updater
```
or
```shell
yarn add electron-updater
```

#### Example
In main .js file of electron, autoUpdater can be defined as follows:
```js
// main.js
const { autoUpdater } = require("electron-updater");

autoUpdater.setFeedURL({
    provider: "github",
    host: "github.com",
    owner: "{ username }",
    repo: "{ repository }",
    token: "{ token }",
});
```

#### Events
* checking-for-update
    Emit when checking update has started.
* update-available
	Emit when there is an available update. If `autoDownload = true`, the update will be downloaded automatically. The event contains the version, releaseDate, releaseNotes, etc.
* update-not-available
	Emit when there is no available update.
* error
	Emit when there is an error.
* download-progress
	Emit when downloading update has started. The event contains the download percentages.
* update-downloaded
	Emit when the update has been downloaded. The event contains the version, releaseDate, releaseNotes, downloadFile, etc.

#### Properties
* autoDownload
	`autoDownload` defines whether to automatically download an update when it is found. If `autoDownload = false`, you should manually execute `autoUpdater.downloadUpdate()` after receiving update-available event.
* autoInstallOnAppQuit
	`autoInstallOnAppQuit` defines whether to automatically install a downloaded update on app quit. If `autoInstallOnAppQuit = false`, you should manually execute `autoUpdater.quitAndInstall()`.

#### Methods
* setFeedURL(options)
	Configure update provider. If you use GitHub as provider, `options` consists of provider, host, owner, repo, token, etc. 
* checkForUpdatesAndNotify()
	Ask the server whether there is an update.
* downloadUpdate()
	Start downloading update.
* quitAndInstall()
	Restart the app and install the update after it has been downloaded. This method should be called after `update-downloaded` has been emitted.

[^updater]: [https://www.electronjs.org/docs/latest/api/auto-updater](https://www.electronjs.org/docs/latest/api/auto-updater)