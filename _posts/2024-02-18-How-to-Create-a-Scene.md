---
title: "How to Create a Scene"
prefix: "Three.js"
categories:
 - ThreeJS
tags:
 - javascript
 - three.js
header:
  teaser: /assets/image/thumbnail/threejs.jpg
excerpt_separator: <!--more-->
---

## Create the scene environment
For Three.js to render a scene, it needs scene, camera, and renderer. In JavaScript, you have to import Three.js depending on the installation options as mentioned in the previous article. 
<!--more-->
```js
// main.js
import * as THREE from 'three'
```

In HTML, to display the rendering result of Three.js, you have to create or designate `<canvas>` element to which Three.js renders the scene.
```js
const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
```

The renderer fetches `canvas` as `domElement` and `options` such as alpha, anti-alias. If you want the app to fill the screen, you can set the size of renderer as `window.innerWidth` and `window.innerHeight`.
```js
const renderer = new THREE.WebGLRenderer({canvas: canvas, alpha: true, antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight );
```

Next, camera can be defined as `PerspectiveCamera` or `OrthographicCamera`. In the example, I've chosen a perspective camera. The perspective camera needs field of view, aspect ratio, near and far depth values as arguments.
```js
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(1, -5, 5);
camera.lookAt(new THREE.Vector3(0,0,0));
```

After generating an empty scene, `renderer.render(scene, camera)` renders the scene with the camera.
```js
const scene = new THREE.Scene();
renderer.render(scene, camera);
```

## Create the scene objects
Furthermore, in order to construct a 3D scene, we also need objects and lights. A 3D object requires geometry, material, and mesh properties to be created. In the below, we define cube geometry and basic material. `BoxGeometry(1,1,1)` constructs a cube with a length of 1. `MeshBasicMaterial` constructs the material of the object, and does not affect by lighting. 
```js
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({color: 0xff0000});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
```
<img class="image" referrerpolicy="no-referrer" src="https://i.imgur.com/tojAf5p.png">


If we use `MeshLambertMaterial`, then you should add a light into the scene.
```js
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshLambertMaterial({color: 0xff0000});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

const light = new THREE.PointLight(0xffffff, 50);
light.position.set(2, -3, 5);
light.lookAt(new THREE.Vector3(0,0,0));
scene.add(light);
```
<img class="image" referrerpolicy="no-referrer" src="https://i.imgur.com/CbZaWL3.png">

## Animation
If you want to animate the scene, you have to run `renderer.render(scene, camera)` iteratively. Similar to canvas animation, it would be better to use `requestAnimationFrame()` rather than to use `setInterval()`. 
```js
function animate () {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
```

Let's rotate the cube to see the animation. Insert `cube.rotateX(0.02)` inside `animate()` function.
```js
function animate () {
    requestAnimationFrame(animate);
    
    cube.rotateX(0.02);
    renderer.render(scene, camera);
}
animate();
```
<img class="image" referrerpolicy="no-referrer" src="https://i.imgur.com/I8oftqA.gif">

## Control the viewport of the scene
To control the pose of the camera using mouse interaction, you can use an add-on of Three.js. It provides several versatile controls. Particularly, orbit controls allow the camera to move along its orbit around a target. 
```js
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
...
const controls = new OrbitControls(camera, canvas);
```

If you want to enable damping effect of orbit controls, set `controls.enableDamping = true` and revise the `animate()` function
```js
function animate () {
    requestAnimationFrame(animate);
    
    cube.rotateX(0.02);
    controls.update();
    renderer.render(scene, camera);
}
animate();
```

## Entire code
```js
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

const renderer = new THREE.WebGLRenderer({canvas: canvas, alpha: true, antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight );

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(1, -5, 5);
camera.lookAt(new THREE.Vector3(0,0,0));

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshLambertMaterial({color: 0xff0000});
const cube = new THREE.Mesh(geometry, material);

const light = new THREE.PointLight(0xffffff, 50);
light.position.set(2, -3, 5);
light.lookAt(new THREE.Vector3(0,0,0));

const scene = new THREE.Scene();
scene.add(cube);
scene.add(light);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

function animate () {
    requestAnimationFrame(animate);

    cube.rotateX(0.02);
    controls.update();
    
    renderer.render(scene, camera);
}
animate();
```