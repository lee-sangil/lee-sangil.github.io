---
title: "[Three.js] Installation"
categories:
 - ThreeJS
 - JavaScript
tags:
 - javascript
 - three.js
header:
  teaser: /assets/image/thumbnail/threejs.jpg
excerpt_separator: <!--more-->
---

> Three.js is a JavaScript library for creating and animating 3D computer graphics in browser using WebGL. [^wiki]

<!--more-->

## Installation

You can install Three.js with NPM or from a CDN. 

#### Option 1: Install with NPM
1. Install Node.js
2. Install Three.js and Vite:
```bash
npm install --save three
npm install --save-dev vite
```
3. From your terminal, run:
```bash
npx vite
```
4. Open localhost URL (ex. http://localhost:5173/) to see the result.

### Option 2: Install from a CDN.
1. Insert import map inside `<head></head>` tag in index.html. Please substitute `{version}` with an actual version of Three.js, such as 0.153.1.
```html
<!-- index.html -->
<script type="importmap">
    {
        "imports": {
            "three": "https://unpkg.com/three@{version}/build/three.module.js",
            "three/addons/": "https://unpkg.com/three@{version}/examples/jsm/"
        }
    }
</script>
```
2. Install Node.js and Vite to run server.
```bash
npm install --save-dev vite
npx serve .
```
Otherwise, you can run server using Live Server if you use VS Code.

## Usage
To use Three.js, you have to import `THREE` in main.js. It is different depending on the installation option. If you’ve installed Three.js with Option 1, import Three.js as:
```js
// main.js
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
...
```

If you’ve installed Three.js with Option 2, use:
```js
// main.js
import * as THREE from 'three'
import { OrbitControls } from 'three/addon/controls/OrbitControls.js';
...
```

In the following contents, I've imported Three.js from a CDN and used Live Server with VS Code.

[^wiki]: [https://en.wikipedia.org/wiki/Three.js](https://en.wikipedia.org/wiki/Three.js)