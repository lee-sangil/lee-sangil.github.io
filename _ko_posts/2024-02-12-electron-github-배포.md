---
title: "빌드 시 Electron 앱을 GitHub에 배포하기"
prefix: "Electron"
lang: "ko"
lang_ref: "2024-02-12-electron-publish"
categories:
 - Electron
tags:
 - electron
 - electron-builder
 - vue
header:
  teaser: /assets/image/thumbnail/electron.jpg
excerpt_separator: <!--more-->
---

> 이 글에서는 electron-builder를 이용해 Electron 앱을 빌드하고 GitHub에 자동으로 배포하는 방법을 소개한다.

<!--more-->

먼저 `electron-builder`를 설치해야 한다:
```bash
npm install --save-dev electron-builder
```

그런 다음 `package.json`에 아래와 같이 repository와 build 옵션을 추가한다:
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
`releaseType`은 "draft", "prerelease", "release" 중 하나로, 릴리스의 종류를 나타낸다. "draft"를 선택하면 원격 저장소에서 릴리스를 직접 게시해야 한다.

`releaseInfo`는 릴리스 업데이트를 요약하는 "releaseName", "releaseNotes", "releaseNotesFile", "releaseDate" 값을 포함한다.

### Vue와 함께 쓰는 Electron-builder
Vue와 함께 Electron을 사용하는 경우, 아래와 같이 `vue.config.js`에서 builder를 설정해야 한다:
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

### 배포
릴리스를 배포하려면 publish 인자(`-p` 또는 `--publish`)를 사용하여 아래 명령을 실행한다:
```bash
vue-cli-service electron:build --publish always
```
`always`는 현재 빌드를 강제로 배포한다. 선택지는 "onTag", "onTagOrDraft", "always", "never"이다. [^publish]

NPM 스크립트를 사용하는 경우에는 다음과 같이 실행한다:
```bash
npm run [build script] -- -p always
```
`--`는 뒤따르는 인자들을 스크립트로 전달하게 한다. `GH_TOKEN` 환경 변수가 설정되어 있는지 반드시 확인한다.

[^publish]: [https://www.electron.build/configuration/publish.html](https://www.electron.build/configuration/publish.html)
