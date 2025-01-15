---
title: "Post-processing"
categories:
 - ThreeJS
tags:
 - javascript
 - three.js
 - postprocessing
 - bloom
 - antialiasing
 - webgl
header:
  teaser: /assets/image/thumbnail/threejs.jpg
excerpt_separator: <!--more-->
---

> Post-processing in Three.js is a technique used to enhance the visual quality of rendered 3D scenes by applying various effects such as bloom, depth of field, and glitch effects. These effects are added after the main rendering process, giving developers control over the final appearance of a scene. This article describes some post-processing passes and explains how to apply post-processing in Three.js. 

<!--more-->

Post-processing is the process of applying visual effects to a rendered image after it has been created by the renderer. This allows developers to add cinematic effects, enhance realism, or stylize the scene in ways that cannot be achieved during the standard 3D rendering pipeline.

## Effect Composer
The `EffectComposer` is the essential class used for managing post-processing in Three.js. After introducing `EffectComposer`, scenes are rendered through the successive passes of `EffectComposer` instead of `WebGLRenderer`. Each pass processes the output of the previous one sequentially.

```js
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
const composer = new EffectComposer(renderer);
```

### Render Pass
A render pass is the first step in the post-processing pipeline. `RenderPass` plays the same role as `WebGLRenderer`, rendering 3D objects into 2D scene. Without the `RenderPass`, the `EffectComposer` has no base image to apply post-processing effects. The `RenderPass` constructor takes the `scene` and `camera` objects: 

```js
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
```

### Bloom Pass
The Bloom Pass creates a glowing effect around bright areas in a scene. This effect is inspired by real-world camera behavior, where very bright parts of a scene can appear to “bloom” or glow. To use the Bloom Pass in Three.js, here’s an example:

```js
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight), // Resolution
  1.5, // Strength of the glow
  0.4, // Radius of the glow
  0.85 // Threshold for brightness
);
composer.addPass(bloomPass);
```

Here, resolution determines the quality of the bloom effect. Higher resolution gives sharper results but can degrade performance. The strength controls the intensity of the bloom effect. The radius specifies the area over which the bloom spreads, and threshold sets the brightness threshold. Only pixels brighter than this value will bloom.

### Shader Pass
The above passes are pre-built-in classes defined in Three.js. On the other hand, `ShaderPass` uses custom shaders to implement effects. It allows high flexibility for creating custom post-processing effects. It is implemented by GLSL code. 

The `ShaderPass` applies a custom shader to the image data produced by the previous pass in the pipeline. It uses two main components:

- Vertex Shader: Defines how the geometry is processed (usually minimal work in post-processing).
- Fragment Shader: Defines how pixels are shaded or manipulated. This is where most of the work happens for post-processing effects.

```js
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
const shaderPass = new ShaderPass(
  new THREE.ShaderMaterial({
    uniforms: {},
    vertexShader: ``, // vertex shader GLSL code
    fragmentShader: ``, // fragment shader GLSL code
  })
);
composer.addPass(shaderPass);
```

A vertex and fragment shaders of pass-through `ShaderPass` can be defined by

```glsl
// vertex shader
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
```

```glsl
// fragment shader
uniform sampler2D tDiffuse;
varying vec2 vUv;
void main() {
  vec4 color = texture2D(tDiffuse, vUv);
  gl_FragColor = color;
}
```

In the above, `tDiffuse` is a standard uniform used in Shader Passes and represents the texture of the rendered scene from the previous pass. Also, we can pass additional data (e.g. time, custom parameters) to the shader via `uniforms`. 

### Antialiasing Pass
Antialiasing algorithms for post-processing are implemented by shader program. Thus, we can apply antialiasing using `ShaderPass`. In Three.js post-processing, SSAA (super sampling antialiasing), FXAA (fast approximation antialiasing), SMAA (enhanced subpixel morphological antialiasing), etc. are provided as a built-in code. When using a post-processing with the `EffectComposer`, antialiasing is not applied by default, as WebGL’s built-in antialiasing is bypassed. Thus, to achieve antialiasing in your final render, you need to add an AA pass at the end of your post-processing pipeline.

```js
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
const fxaaPass = new ShaderPass( FXAAShader );
const pixelRatio = renderer.getPixelRatio();
fxaaPass.material.uniforms[ 'resolution' ].value.x = 1 / ( window.innerWidth * pixelRatio ); // set resolution of antialiasing
fxaaPass.material.uniforms[ 'resolution' ].value.y = 1 / ( window.innerHeight * pixelRatio );
```

### Other Passes

There are lots of pre built-in pass in Three.js. You can browse the interactive demo of post-processing in [here](https://threejs.org/examples/). Below briefly describes some of post-processing passes.

- `BokehPass`: mimics the camera’s focus, blurring objects outside the focal plane.
- `RenderPixelatedPass`: adds a pixelate effect to scene, like Minecraft.
- `GlitchPass`: makes a glitch effect at random times.

## Rendering

Here’s a simple example to integrate post-processing into Three.js scene: I've created a cube floating on a plane, and then applied anti-alias and bloom post-processing. 

|       Without blooming effect        |         With blooming effect         |
|:------------------------------------:|:------------------------------------:|
| <img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/5SvGe26.gif"> | <img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/F07TbAg.gif"> |

```js
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

const renderer = new THREE.WebGLRenderer({canvas: canvas, alpha: true});
renderer.shadowMap.enabled = true;
renderer.setPixelRatio(window.devicePixelRatio);

const scene = new THREE.Scene();

// setup camera
const width = canvas.width;
const height = canvas.height;
const camera = new THREE.PerspectiveCamera(50, width/height, 0.1, 2 * 400);
camera.position.x = 0;
camera.position.y = 6;
camera.position.z = 8;

// setup cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({
  color: 'red',
})

const cube = new THREE.Mesh(geometry, material);
cube.castShadow = true;
cube.receiveShadow = true;
scene.add(cube);

// setup plane
const geo_plane = new THREE.PlaneGeometry(50,50,1,1);
geo_plane.rotateX(-Math.PI/2);
geo_plane.translate(0,-1,0);
const mat_plane = new THREE.MeshStandardMaterial({
  color: 'white',
})

const plane = new THREE.Mesh(geo_plane, mat_plane);
plane.castShadow = true;
plane.receiveShadow = true;
scene.add(plane);

// setup light
const light = new THREE.PointLight( 0xffffff, 20, 10, 2 );
light.position.set(1,3,0);

light.add(new THREE.Mesh(new THREE.SphereGeometry(0.1,32,16), new THREE.MeshBasicMaterial({
  color: 'white',
})));
light.castShadow = true;
light.shadow.radius = 1;
scene.add(light);

// setup post processing
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);

// setup bloom pass
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 2, 1, 0.4);

// setup FXAA pass
const fxaaPass = new ShaderPass( FXAAShader );
const pixelRatio = renderer.getPixelRatio();
fxaaPass.material.uniforms[ 'resolution' ].value.x = 1 / ( window.innerWidth * pixelRatio );
fxaaPass.material.uniforms[ 'resolution' ].value.y = 1 / ( window.innerHeight * pixelRatio );

// add passes into composer
composer.addPass(renderPass);
composer.addPass(bloomPass);
composer.addPass(fxaaPass);

// setup controller
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// add resize event listener
function resize() {
  const width = document.body.clientWidth;
  const height = document.body.clientHeight;

  canvas.width = width;
  canvas.height = height;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  composer.setSize(width, height);

  fxaaPass.material.uniforms[ 'resolution' ].value.x = 1 / ( window.innerWidth * pixelRatio );
  fxaaPass.material.uniforms[ 'resolution' ].value.y = 1 / ( window.innerHeight * pixelRatio );
}
window.onresize = resize;

resize();

// animate
function animate() {
  requestAnimationFrame(animate);
  composer.render();

  cube.rotateY(0.02);
  controls.update();
}

animate();
```