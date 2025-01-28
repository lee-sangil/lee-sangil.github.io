---
title: "Make the Sun Shine"
prefix: "Three.js"
categories:
 - ThreeJS
tags:
 - javascript
 - three.js
 - postprocessing
 - bloom
 - shader
 - solar system
 - sun
 - webgl
header:
  teaser: /assets/image/thumbnail/2025-01-27-selective-blooming.gif
excerpt_separator: <!--more-->
---

> This post explains how to apply a bloom effect to specific objects in a Three.js scene using multiple EffectComposer instances and layers. By leveraging Three.js Layers, objects that require the bloom effect are isolated into a dedicated layer. A "bloom composer" renders only these objects with the bloom effect, while a "main composer" renders the full scene and merges the bloom effect back into it using a custom shader. To merge two rendered images properly, non-blooming objects are temporarily darkened during the bloom rendering process to avoid unintended contributions to the effect. Then, the original materials are restored before rendering the final scene. Finally, a selective blooming effect can be achieved, while improving visual aesthetics.

<!--more-->

Based on the previous posts I've written so far, we can create the realistic solar system using Three.js. To achieve even more realism, we can implement a bloom effect, which simulates the way light above a certain brightness creates a glowing aura when viewed through a camera or by the human eye. However, if we apply the bloom effect to the entire scene, other objects like planets or stars might also glow, which doesn’t look good. In this post, I will guide you through the process of applying a selective bloom effect only to the Sun. By doing this, you can make your solar system look more clean and visually appealing. 

When working with Three.js, this can be achieved by using multiple `EffectComposer` instances and layers. Here’s steps for applying bloom effect to a specific object.

## Use layers for isolation

Three.js `Layers` allow you to selectively render objects in your scene. There are 32 available layers (0-31), and objects can belong to one or more of them. Layers are represented using a bit-mask. For instance:

- Layer 0: 1
- Layer 1: 2
- ...

An object assigned to multiple layers has a bit-mask equal to the sum of the respective layer values. For example, an object on layers 0 and 1 has a bit-mask of $1 + 2 = 3$. If no layer is assigned, the bit-mask is 0, making the object invisible. A camera object also have a `Layers` property. They only render objects that share at least one layer with the camera. By default, both cameras and objects belong to layer 0. Objects can be assigned to other layers using the layers property:

```js
obj = new THREE.Mesh({}, {}); // default layer is 0, 0x000...0001
obj.layers.set(1); // 0x000...0010
obj.layers.enable(0); // 0x000...0011
```

Back to our solar system, we assign the Sun to a dedicated bloom layer (in this case, layer 1):

```js
sun.layers.enable(1);
```

This setup ensures the bloom effect applies only to the Sun. Next, we configure two EffectComposer instances to handle the rendering: one for the bloom effect and one for the final scene.

## Set up effect composers

### Bloom composer
The bloom composer renders only the objects that need the bloom effect. It includes `renderPass`, `antialiasPass`, `bloomPass`, and does not render directly to the screen. Instead, it passes its rendering results to the main composer as an argument.

```js
bloomComposer = new EffectComposer(renderer);
bloomComposer.addPass(renderPass);
bloomComposer.addPass(antialiasPass);
bloomComposer.addPass(bloomPass);
bloomComposer.renderToScreen = false;
```

Before rendering the bloom composer, we first darken objects that are not to bloom, and make objects (i.e., atmosphere, glow) that do not occlude the light invisible. These changes of material will be restored after bloom effect processing.

#### Hide non-blooming objects

Before rendering the bloom effect, non-blooming objects are "darkened" by replacing their materials with a black solid material so that bloom composer can not affect these objects. This function ensures that only the objects in the bloom layer (1) contribute to the bloom effect. Note that we use `materials` list variable to store the original material of objects to be darkened temporarily.

```js
function darkenNonBloom(obj) {
  // Hide non-blooming and non-occluding object
  if ( obj.name == 'atmosphere' || obj.name == 'glow' || obj.name == 'fresnel')
    obj.visible = false;

    // Darken non-blooming and occluding object
  else if ( obj.layers.isEnabled(1) === false ) {
    materials[obj.uuid] = obj.material;
    obj.material = darkMaterial;
  }
}
```

#### Restore original materials

After rendering the bloom composer, the original materials of the non-blooming objects are restored from `material` list variable.

```js
function restoreMaterial(obj) {
  // Reveal non-blooming and non-occluding object
  if ( obj.name == 'atmosphere' || obj.name == 'glow' || obj.name == 'fresnel')
    obj.visible = true;

    // Restore non-blooming and occluding object
  else if (materials[obj.uuid]) {
    obj.material = materials[obj.uuid];
    delete materials[obj.uuid];
  }
}
``` 

### Main composer

On the other hands, the main composer renders the entire scene and merges the bloom effect into it. It includes `renderPass`, `antialiasPass`, and `mergePass`. The `mergePass` is a main pass in the main composer, and it merges the rendering results with bloom effect (bloom composer) and without bloom effect (main composer) using shaders.

```js
composer = new EffectComposer(renderer);
composer.addPass(renderPass);
composer.addPass(antialiasPass);
composer.addPass(mergePass);
```

#### Merge shader

A custom shader is used to merge the bloom effect back into the final scene. The shader combines the base scene texture (the result after `antialiasPass` of `composer`) and the bloom texture (the final result of `bloomComposer`).

```js
const bloomUniforms = {
  u_baseTexture: { value: null },
  u_bloomTexture: { value: bloomComposer.readBuffer.texture },
  u_alpha: { value: 0.5 }
};
  
const mergePass = new ShaderPass(new THREE.ShaderMaterial({
  uniforms: bloomUniforms,
  vertexShader: shader_pass_vertex,
  fragmentShader: shader_pass_fragment,
}), 'u_baseTexture'); // textureID of the previous rendering texture
```

`ShaderPass` passes the previous rendering result as the second argument. Also, the rendering result of composer can be obtained using `readBuffer.texture`. Now, `shader_pass_fragment` merges two textures mathematically.

```glsl
// vertex shader
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
```

```glsl
// fragment shader
uniform sampler2D u_baseTexture;
uniform sampler2D u_bloomTexture;
uniform float u_alpha;

varying vec2 vUv;

void main() {
  gl_FragColor = (texture2D(u_baseTexture, vUv) + u_alpha * texture2D(u_bloomTexture, vUv));
}
```

#### Final render

To render effect composers, we substitute `renderer.render()` with

```js
scene.traverse( darkenNonBloom ); // Leave objects that affect blooming
bloomComposer.render(); // Blooming

scene.traverse( restoreMaterial ); // Restore non-blooming objects
composer.render(); // Merge layers 0 (non-bloom) and 1 (bloom)
```

`scene.traverse()` method is used to iterate through all objects in the scene and apply the callback function. For comparison, the rendering result of 1) without post-processing, 2) with selective blooming effect, and 3) with only bloom composer.

| without post-processing              | selective blooming                   | entire blooming                      |
| :------------------------------------: | :------------------------------------: | :------------------------------------: |
| <img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/DrpvdlM.png"> | <img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/RTHbiC2.png"> | <img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/q1cYuIJ.png"> |

## Example code

In the below, I provide a test code for the selective blooming post-processing with simplified two objects, Sun and Earth.
```js
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import shader_pass_fragment from './assets/shaderPass.frag.js';
import shader_pass_vertex from './assets/shaderPass.vert.js';

const canvas = document.createElement("canvas");
canvas.style.backgroundColor = 'black';
document.body.style.margin = '0';
document.body.appendChild(canvas);

const renderer = new THREE.WebGLRenderer({canvas: canvas, alpha: true, antialias: false});
renderer.shadowMap.enabled = true;

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
camera.position.set(10,0,0.2);

// create sphere geometry for Sun and Earth
const geometry_sphere = new THREE.SphereGeometry(1, 30, 30); 

// object Sun uses basicMaterial since it emits orange light
const material_sun = new THREE.MeshBasicMaterial({color: 0xffaa00});
const sun = new THREE.Mesh(geometry_sphere, material_sun);
sun.layers.enable(1);
sun.position.set(0, 0, 0);

const light = new THREE.PointLight(0xffffff, 50);
light.position.set(0, 0, 0);
sun.add(light);

// object Earth uses lambertMaterial since it reflects sunlight
const material_earth = new THREE.MeshLambertMaterial({color: 0x4444ff});
const earth = new THREE.Mesh(geometry_sphere, material_earth);
earth.position.set(3, 0, 0); // distant from Sun
earth.scale.set(0.2, 0.2, 0.2); // smaller size than Sun

const earth_plane = new THREE.Object3D();
earth_plane.add(earth);

const scene = new THREE.Scene();
scene.add(sun);
scene.add(earth_plane);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

let materials = {};

const darkMaterial = new THREE.MeshBasicMaterial({ color: 'black' });

const renderPass = new RenderPass(scene, camera);
const antialiasPass = new ShaderPass(FXAAShader);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight));
bloomPass.threshold = 0;
bloomPass.strength = 1.5;
bloomPass.radius = .1;

const bloomComposer = new EffectComposer(renderer);
bloomComposer.addPass(renderPass);
bloomComposer.addPass(bloomPass);
bloomComposer.addPass(antialiasPass);
bloomComposer.renderToScreen = false;

const bloomUniforms = {
  u_baseTexture: { value: null },
  u_bloomTexture: { value: bloomComposer.readBuffer.texture },
  u_alpha: { value: 0.2 }
};

const mergePass = new ShaderPass(new THREE.ShaderMaterial({
  uniforms: bloomUniforms,
  vertexShader: shader_pass_vertex,
  fragmentShader: shader_pass_fragment,
}), 'u_baseTexture');

const composer = new EffectComposer(renderer);
composer.addPass(renderPass);
composer.addPass(antialiasPass);
composer.addPass(mergePass);

function darkenNonBloom(obj) {
  // Hide non-blooming and non-occluding object
  if ( obj.name == 'atmosphere' || obj.name == 'glow' || obj.name == 'fresnel')
    obj.visible = false;

    // Darken non-blooming and occluding object
  else if ( obj.layers.isEnabled(1) === false ) {
    materials[obj.uuid] = obj.material;
    obj.material = darkMaterial;
  }
}

function restoreMaterial(obj) {
  // Reveal non-blooming and non-occluding object
  if ( obj.name == 'atmosphere' || obj.name == 'glow' || obj.name == 'fresnel')
    obj.visible = true;

    // Restore non-blooming and occluding object
  else if (materials[obj.uuid]) {
    obj.material = materials[obj.uuid];
    delete materials[obj.uuid];
  }
}

function resize () {
  const dpr = window.devicePixelRatio;
  const width = document.body.clientWidth;
  const height = document.body.clientHeight;

  canvas.width = width * dpr;
  canvas.height = height * dpr;

  renderer.setSize(width, height);

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  
  bloomComposer.setSize(width, height);
  composer.setSize(width, height);
  
  antialiasPass.material.uniforms['resolution'].value.x = 1 / canvas.width;
  antialiasPass.material.uniforms['resolution'].value.y = 1 / canvas.height;
}
window.onresize = resize;
resize();

function animate () {
  requestAnimationFrame(animate);

  controls.update();

  earth_plane.rotateY(0.01);
  
  scene.traverse( darkenNonBloom ); // Leave objects that affect blooming
  bloomComposer.render(); // Blooming
  
  scene.traverse( restoreMaterial ); // Restore non-blooming objects
  composer.render(); // Merge layers 0 (non-bloom) and 1 (bloom)
}
animate();
```

<img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/FIdpq7j.gif">
