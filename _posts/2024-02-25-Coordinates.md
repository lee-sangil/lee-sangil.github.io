---
title: "Scene Graph"
prefix: "Three.js"
categories:
 - ThreeJS
tags:
 - javascript
 - three.js
 - solar system
header:
  teaser: /assets/image/thumbnail/threejs.jpg
excerpt_separator: <!--more-->
---

## Sun-Earth system
In this article, I'll create a simple Sun-Earth system. Firstly, create an orange sphere and a blue sphere which represent the Sun and the Earth, respectively.
<!--more-->
```js
// create sphere geometry for Sun and Earth
const geometry_sphere = new THREE.SphereGeometry(1, 30, 30); 

// object Sun uses basicMaterial since it emits orange light
const material_sun = new THREE.MeshBasicMaterial({color: 0xffaa00});
const sun = new THREE.Mesh(geometry_sphere, material_sun);
sun.position.set(0, 0, 0);

const light = new THREE.PointLight(0xffffff, 50);
light.position.set(0, 0, 0);

// object Earth uses lambertMaterial since it reflects sunlight
const material_earth = new THREE.MeshLambertMaterial({color: 0x4444ff});
const earth = new THREE.Mesh(geometry_sphere, material_earth);
earth.position.set(3, 0, 0); // distant from Sun
earth.scale.set(0.2, 0.2, 0.2); // smaller size than Sun

const scene = new THREE.Scene();
scene.add(sun);
scene.add(earth);
scene.add(light);
```

The sun and earth have the same shape, thus they share a single geometry attribute, `geometry_sphere`. Because sun is the only lighting source in the system, the material of Sun is `MeshBasicMaterial` which is not affected by lighting, and `PointLight` is located at the center of sun. The earth is distanced from the the sun and has smaller size than the sun. The result is below:

<img class="image" referrerpolicy="no-referrer" src="https://i.imgur.com/ZFs7Zpa.png">

## Orbiting earth
Let's make the earth rotating and orbiting around the sun. Define the following function and add it inside the animation loop.
```js
const w_orbit = 0.5;
const w_rotate = 0.1;

function updateSystem(sec) {
    earth.position.set(3*Math.cos(w_orbit*sec), 0, -3*Math.sin(w_orbit*sec));
    earth.rotateY(w_rotate);
}
```

By the way, the animation function that is binded with `requestAnimationFrame()` can pass a single argument indicating timestamp, `msec`.
> This callback function is passed a single argument: a [`DOMHighResTimeStamp`](https://developer.mozilla.org/en-US/docs/Web/API/DOMHighResTimeStamp) indicating the end time of the previous frame's rendering (based on the number of milliseconds since [time origin](https://developer.mozilla.org/en-US/docs/Web/API/DOMHighResTimeStamp#the_time_origin)). [^rAF]

```js
function animate (msec) {
    requestAnimationFrame(animate);
    
    updateSystem(msec * 0.001);

    controls.update();
    renderer.render(scene, camera);
}
animate();
```

Also, to easily see the rotation of the Earth, reduce the number of segment of `SphereGeometry` and set `flatShading = true` for the Earth material.
```js
const geometry_sphere = new THREE.SphereGeometry(1, 10, 10);
const material_earth = new THREE.MeshLambertMaterial({color: 0x4444ff, flatShading: true});
```

Finally, the result is below:

<img class="image" referrerpolicy="no-referrer" src="https://i.imgur.com/mBaXGcW.gif">

## Local coordinates
However, when we try to add the Moon to the Sun-Earth system, we have to solve the position of the Moon explicitly.

$$
x_{\rm moon} = dist_{\rm sun-earth} \times \cos(\omega_{\rm rev, earth}\times t) + dist_{\rm earth-moon}\times \cos(\omega_{\rm rev, moon}\times t)
$$

$$
y_{\rm moon} = -dist_{\rm sun-earth} \times \sin(\omega_{\rm rev, earth}\times t) - dist_{\rm earth-moon}\times \sin(\omega_{\rm rev, moon}\times t)
$$

Moreover, if we try to describe a realistic solar system, the above equations would become much more complicated because real orbit and rotation axis of the Earth are tilted. Let's revise the above code using local coordinate: Earth's orbit plane and equator plane, and Moon's orbit plane. 
```js
const earth_orbit = new THREE.Object3D();
const earth_equator = new THREE.Object3D();
const moon_orbit = new THREE.Object3D();
earth_equator.rotateZ(23.5*Math.PI/180); // tilted rotation axis

const scene = new THREE.Scene();
scene.add(sun);
scene.add(earth_orbit);
sun.add(light);
earth_orbit.add(earth_equator);
earth_equator.add(earth);
earth_equator.add(moon_orbit);
moon_orbit.add(moon);

const w_moon = 5;
const w_orbit = 0.5;
const w_rotate = 0.1;

function updateSystem(sec) {
    moon.position.set(0.4*Math.cos(w_moon*sec), 0, -0.4*Math.sin(w_moon*sec));
    earth_equator.position.set(3*Math.cos(w_orbit*sec), 0, -3*Math.sin(w_orbit*sec));
    earth.rotateY(w_rotate);
}
```

In the above code, because `moon_orbit` belongs to the `earth_equator`, the position of `moon` is determined in the `earth_equator` coordinates. Thus, the equation of the Moon gets simple rather than the above equation.

<img class="image" referrerpolicy="no-referrer" src="https://i.imgur.com/5yJ95Mw.gif">

## Scene graph

Therefore, the scene graph of the above system looks like below. Depending on moon, its object can be added into mother's equator or mother's orbit. Actually, to be precise, the scene graph also includes the relationships among Object3D, Mesh, Geometry, Material, and Texture. But here, I depicted Object3D only.

<img class="image" referrerpolicy="no-referrer" src="https://i.imgur.com/KvtEwBx.png">

## Entire code
```js
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

const renderer = new THREE.WebGLRenderer({canvas: canvas, alpha: true, antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight );

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 5);

const geometry_sphere = new THREE.SphereGeometry(1, 10, 10);

const material_sun = new THREE.MeshBasicMaterial({color: 0xffaa00});
const sun = new THREE.Mesh(geometry_sphere, material_sun);

const material_earth = new THREE.MeshLambertMaterial({color: 0x4444ff, flatShading: true});
const earth = new THREE.Mesh(geometry_sphere, material_earth);
earth.scale.set(0.2, 0.2, 0.2);

const material_moon = new THREE.MeshLambertMaterial({color: 0xaaaaaa, flatShading: true});
const moon = new THREE.Mesh(geometry_sphere, material_moon);
moon.scale.set(0.1, 0.1, 0.1);

const light = new THREE.PointLight(0xffffff, 50);
light.position.set(0, 0, 0);

const earth_orbit = new THREE.Object3D();
const earth_equator = new THREE.Object3D();
const moon_orbit = new THREE.Object3D();
earth_equator.rotateZ(23.5*Math.PI/180);

const scene = new THREE.Scene();
scene.add(sun);
scene.add(earth_orbit);
sun.add(light);
earth_orbit.add(earth_equator);
earth_equator.add(earth);
earth_equator.add(moon_orbit);
moon_orbit.add(moon);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const w_moon = 5;
const w_orbit = 0.5;
const w_rotate = 0.1;

function updateSystem(sec) {
    moon.position.set(0.4*Math.cos(w_moon*sec), 0, -0.4*Math.sin(w_moon*sec));
    earth_equator.position.set(3*Math.cos(w_orbit*sec), 0, -3*Math.sin(w_orbit*sec));
    earth.rotateY(w_rotate);
}

function animate (msec) {
    requestAnimationFrame(animate);
    
    updateSystem(msec * 0.001);

    controls.update();
    renderer.render(scene, camera);
}
animate();
```

[^rAF]: [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)