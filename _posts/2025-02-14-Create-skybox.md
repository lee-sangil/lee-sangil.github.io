---
title: "Create the Milky Way Skybox"
prefix: "Three.js"
categories:
 - ThreeJS
tags:
 - javascript
 - three.js
 - solar system
 - webgl
 - shader
 - skybox
header:
  teaser: /assets/image/thumbnail/2025-02-14-skybox.gif
excerpt_separator: <!--more-->
---

> This post is the final step of our solar system project using Three.js. We will add a realistic Milky Way background. This will enhance the feeling of exploring the solar system. To do this, we will create a large cube with Milky Way texture on the inner face of the cube.

<!--more-->

To create the background, we first load a high-resolution image of the Milky Way using `THREE.TextureLoader()`. Then, we apply linear filtering to ensure smooth rendering.

```js
const loader = new THREE.TextureLoader();
const texture = loader.load('assets/galaxy_starfield_sharpen.jpg');
texture.magFilter = THREE.LinearFilter;
texture.minFilter = THREE.LinearFilter;
```

To display the equirectangular texture on a cube, we use Three.js’s built-in shader, `ShaderLib.equirect`. This shader is designed to make skyboxes or background environments.

```js
const shader = THREE.ShaderLib.equirect;
const material = new THREE.ShaderMaterial({
	fragmentShader: shader.fragmentShader,
	vertexShader: shader.vertexShader,
	uniforms: shader.uniforms,
	depthWrite: false, // Prevents the background from interfering with depth calculations
	side: THREE.BackSide, // Renders the texture on the inside of the geometry
});
material.uniforms.tEquirect.value = texture;
```

The `side: THREE.BackSide` rendering ensures that the stars are visible from within the box, surrounding our scene completely. Lastly, we create a large box geometry. Since our shader maps the texture equirectangularly, a cube can effectively display the entire sky without distortion.

```js
const plane = new THREE.BoxGeometry(100, 100, 100); // set the size manually depending on the map scale
const background = new THREE.Mesh(plane, material);
scene.add(background);
```

After applying this background, our scene now looks like this.

<img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/eK6RGVQ.gif">

Finally, I conclude the [How to Create the Solar System]({% post_url 2024-02-16-How-to-Create-the-Solar-System %}) series. Based on the posts so far, you might now have all the necessary knowledge to build a realistic solar system. From now on, I will try to continue to make updates, especially focusing on UI/UX features, such as labelling planet, drawing orbits.