---
title: "[Three.js] Shader Material"
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

> A shader material is rendered with a custom shader. It requires vertex and fragment shaders which are written in GLSL (openGL Shading Language) code and depict the position of a vertex and its color, respectively. Since these codes run on the GPU using WebGL, a `ShaderMaterial` is rendered properly by `WebGLRenderer` only. In the post, I'll explain how to use Shaders in Three.js.

<!--more-->

`ShaderMaterial` can be defined by:
```js
const material = new THREE.ShaderMaterial({
	uniforms: {
		time: { value: 1.0 },
		resolution: { value: new THREE.Vector2() }
	},
	vertexShader: /* glsl */ `...`,
	fragmentShader: /* glsl */ `...`,
})
```

The properties inside `uniforms` can be accessed in the `vertexShader` and `fragmentShader`, and they have the same values for each vertex. The types of GLSL variable are float, vec2, vec3, vec4, sampler2D, and their corresponding types for JavaScript are `Number`, `THREE.Vector2`, `THREE.Vector3` (or `THREE.Color`), `THREE.Vector4`, and `THREE.Texture`.

| GLSL | JavaScript |
|:---:|:---:|
| float | Number |
| vec2 | THREE.Vector2 |
| vec3 | THREE.Vector3 or THREE.Color |
| vec4 | THREE.Vector4 |
| sampler2D | THREE.Texture |

The `vertexShader` and `fragmentShader` of `ShaderMaterial` fetch a code as a text format. These code can be written inside `<script type=“x-shader/x-vertex”>` or `<script type=“x-shader/x-fragment”>` in HTML, then be read by `document.getElementById(’vertex’).textContent`. 
```html
<!-- index.html -->
<html>
<head>
	<script id="vertex" type=“x-shader/x-vertex”>
		...
	</script>
	<script id="fragment" type=“x-shader/x-fragment”>
		...
	</script>
</head>
<body>
</body>
</html>
```

Otherwise, they can be declared as a multi-line strings using apostrophe (\`) at an external file, then be imported as `import vertex from ‘./shader/vertex.js’`
```js
// vertex.js
export const vertex = `
/* glsl */
...
`
```

In the following articles, I’ll introduce the basics of GLSL and create the earth using `ShaderMaterial`.