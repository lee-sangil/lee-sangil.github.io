---
title: "Create a Realistic Phobos with Irregular Shape"
prefix: "Three.js"
categories:
 - ThreeJS
tags:
 - javascript
 - three.js
 - glsl
 - webgl
 - shader
 - solar system
 - phobos
header:
  teaser: /assets/image/thumbnail/2024-11-15-phobos.png
excerpt_separator: <!--more-->
---

> Until now, I've illustrated celestial bodies as a completely spherical shapes: Earth, Sun, and Saturn. They have enough gravity to form nearly smooth, spherical shapes. However, Phobos, one of Mars’ moons, has an irregular shape due to its low mass and weak gravity, which aren’t strong enough to smooth out its rugged surface. In this post, we’ll show how to render bumpy geometry of Phobos. 

<!--more-->

In the previous posts[^earth], I've described mountains, valleys, and clouds, but they are drawn on the surface of sphere and their shadows make the sphere look like a 3D model. The variation in altitude on Earth’s surface is negligible compared to its radius, making it possible to describe it sufficiently with the previous methods. However, since the altitude variation on Phobos is not small enough relative to its radius, another geometry different from that of Earth should be used. Please see the below code.

```glsl
uniform sampler2D u_dispTexture;
uniform float u_dispScale;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying mat3 vTbn;

attribute vec4 tangent; // "geometry.computeTangents()" is needed.

void main() {
  vUv = uv;
  vNormal = normalize(mat3(modelMatrix) * normal);
  vPosition = mat3(modelMatrix) * position;

  float displacement = texture2D( u_dispTexture, vUv ).r;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position + u_dispScale * (displacement - 0.5) * normal, 1.0);

  vec3 t = normalize(tangent.xyz);
  vec3 n = normalize(normal.xyz);
  vec3 b = normalize(cross(t, n));

  t = mat3(modelMatrix) * t;
  b = mat3(modelMatrix) * b;
  n = mat3(modelMatrix) * n;
  vTbn = mat3(t, b, n);
}
```

Compared to the spherical vertex shader code, this is where the changes have been made: from
```glsl
gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
```

to
```glsl
float displacement = texture2D( u_dispTexture, vUv ).r;
gl_Position = projectionMatrix * modelViewMatrix * vec4(position + u_dispScale * (displacement - 0.5) * normal, 1.0);
```

The values ​​of the displacement texture map are given as normalized altitude ​​with an average radius of 0, and the positions of the vertices are expanded by `u_dispScale * (displacement - 0.5)` in the direction of the normal vector. You can choose a value of `u_dispScale` manually.

|             small scale              |             large scale              |
|:------------------------------------:|:------------------------------------:|
| <img class="image" referrerpolicy="no-referrer" src="https://i.imgur.com/lLo1L2d.png"> | <img class="image" referrerpolicy="no-referrer" src="https://i.imgur.com/7HtdX1I.png"> |

[^earth]: [\[Three.js\] Create a Realistic Earth with Shaders](https://sangillee.com/2024-06-07-create-realistic-earth-with-shaders/)