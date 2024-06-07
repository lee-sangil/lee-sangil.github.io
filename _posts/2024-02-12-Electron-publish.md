---
title: "[Electron] How To Publish an Electron App to Github at Build Time"
categories:
 - Electron
 - JavaScript
tags:
 - electron
 - electron-builder
 - vue
header:
  teaser: /assets/image/thumbnail/electron.jpg
excerpt_separator: <!--more-->
---

> In the page, I’ll introduce a method to build an electron app and automatically publish it to GitHub using electron-builder. 

<!--more-->

First, you should install `electron-builder`:
```bash
npm install --save-dev electron-builder
```

Then, you should add repository and build option in `package.json` as below:
```json
// package.json
{
    "name": "{ name }",
    "version": "{ version }",
    ...
    "repository": {
        "type": "git",
        "url": "{ repository url }"
    },
    "build": {
        "appID": "{ appID }",
        ...
        "publish": {
            "provider": "github",
            "host": "{ github.com }",
            "owner": "{ github username }",
            "repo": "{ repository name }",
            "releaseType": "draft",
        },
        "releaseInfo": {
            "releaseNotesFile": "release-notes.md",
        }
    }
}
```
`releaseType` can be "draft", "prerelease", or "release"; and these are types of release. If you choose "draft", you have to publish release manually in the remote repository.

`releaseInfo` contains "releaseName", "releaseNotes", "releaseNotesFile", "releaseDate" values that summarize the release update.

### Electron-builder with Vue
When you use electron with Vue, you should configure builder in `vue.config.js` as below: 
```js
module.exports = defineConfig({
    ...
    pluginOptions: {
        electronBuilder: {
            builderOptions: {
                appId: "{ appID }",
                ...
                "publish": {
                    "provider": "github",
                    "host": "{ github.com }",
                    "owner": "{ github username }",
                    "repo": "{ repository name }",
                    "releaseType": "draft",
                },
                "releaseInfo": {
                    "releaseNotesFile": "release-notes.md",
                }
            }
        }
    },
    ...
})
```

### Publish
To publish a release, execute the below line using publish argument, `-p` or `--publish`:
```bash
vue-cli-service electron:build --publish always
```
`always` forces to publish the current build. The choices are "onTag", "onTagOrDraft", "always", and "never". [^publish]

When you use NPM script, execute:
```bash
npm run [build script] -- -p always
```
`--` makes to pass the following arguments to the script.

[^publish]: [https://www.electron.build/configuration/publish.html](https://www.electron.build/configuration/publish.html)