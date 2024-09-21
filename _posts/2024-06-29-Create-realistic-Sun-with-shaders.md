---
title: "Create a Realistic Sun with Shaders"
categories:
 - ThreeJS
 - WebGL
 - JavaScript
tags:
 - javascript
 - three.js
 - glsl
 - webgl
 - shader
 - solar system
header:
  teaser: /assets/image/thumbnail/2024-06-29-create-realistic-sun-with-shaders.jpg
excerpt_separator: <!--more-->
---

> In the previous article[^earth], we've created a realistic Earth. Unlike the Earth that consists of solid elements, the sun is full of gas. In order to render a gas flowing through the surface of the sun, I'll utilize fractal noise, a.k.a., fractal Brownian motion, that is mentioned at here[^shaderpattern]. Also, I've rendered the glow and Fresnel effects.

<!--more-->

## Surface
Since the sun is the only celestial object that emits lights, there is no day-and-night. There is only day. So, we just design the texture of the surface of the sun only. In this article, the surface of the sun is rendered using fractal noise, a.k.a., fractal Brownian motion, referred from here[^shaderpattern]. To render a fractal noise in 3D space, we define a random and a noise function whose input is a 3D vector, in advance. You can find another magic numbers who generate a random number. 
```glsl
// 2D Random
float random (in vec3 st) {
    return fract(sin(dot(st,vec3(12.9898,78.233,23.112)))*12943.145);
}
```

By the way, a noise function fetching 3D vector as an input is as follows. 
```glsl
float noise (in vec3 _pos) {
    vec3 i_pos = floor(_pos);
    vec3 f_pos = fract(_pos);

    // Four corners in 2D of a tile
    float aa = random(i_pos);
    float ab = random(i_pos + vec3(1., 0., 0.));
    float ac = random(i_pos + vec3(0., 1., 0.));
    float ad = random(i_pos + vec3(1., 1., 0.));
    float ae = random(i_pos + vec3(0., 0., 1.));
    float af = random(i_pos + vec3(1., 0., 1.));
    float ag = random(i_pos + vec3(0., 1., 1.));
    float ah = random(i_pos + vec3(1., 1., 1.));

    // Smooth step
    vec3 t = smoothstep(0., 1., f_pos);

    // Mix 4 corners percentages
    return 
    mix(
        mix(
            mix(aa,ab,t.x),
            mix(ac,ad,t.x), 
        t.y),
        mix(
            mix(ae,af,t.x), 
            mix(ag,ah,t.x), 
        t.y), 
    t.z)
}
```
Since the above noise function is based on 3D space, it mixes a total of eight values with 3d smoothing step vector `t` in x, y, z axis. 

Furthermore, to change the values as time goes, I've defined `i_time` and `f_time`, in similar with `i_pos` and `f_pos`.  Then, new eight values, `ba` ~ `bh`, are introduced. In the below, I've added the time variable into the position variable, i.e., `float aa = random(i_pos + 2.*i_time)`. Instead, you can define a random function for `vec4` type, and use `float aa = random(vec4(i_pos, i_time))`. 
```glsl
float noise (in vec3 _pos) {
    vec3 i_pos = floor(_pos);
    vec3 f_pos = fract(_pos);

    float i_time = floor(u_time*0.2);
    float f_time = fract(u_time*0.2);

    // Four corners in 2D of a tile
    float aa = random(i_pos + i_time);
    float ab = random(i_pos + i_time + vec3(1., 0., 0.));
    float ac = random(i_pos + i_time + vec3(0., 1., 0.));
    float ad = random(i_pos + i_time + vec3(1., 1., 0.));
    float ae = random(i_pos + i_time + vec3(0., 0., 1.));
    float af = random(i_pos + i_time + vec3(1., 0., 1.));
    float ag = random(i_pos + i_time + vec3(0., 1., 1.));
    float ah = random(i_pos + i_time + vec3(1., 1., 1.));

    float ba = random(i_pos + (i_time + 1.));
    float bb = random(i_pos + (i_time + 1.) + vec3(1., 0., 0.));
    float bc = random(i_pos + (i_time + 1.) + vec3(0., 1., 0.));
    float bd = random(i_pos + (i_time + 1.) + vec3(1., 1., 0.));
    float be = random(i_pos + (i_time + 1.) + vec3(0., 0., 1.));
    float bf = random(i_pos + (i_time + 1.) + vec3(1., 0., 1.));
    float bg = random(i_pos + (i_time + 1.) + vec3(0., 1., 1.));
    float bh = random(i_pos + (i_time + 1.) + vec3(1., 1., 1.));

    // Smooth step
    vec3 t = smoothstep(0., 1., f_pos);
    float t_time = smoothstep(0., 1., f_time);

    // Mix 4 corners percentages
    return 
    mix(
        mix(
            mix(mix(aa,ab,t.x), mix(ac,ad,t.x), t.y),
            mix(mix(ae,af,t.x), mix(ag,ah,t.x), t.y), 
        t.z),
        mix(
            mix(mix(ba,bb,t.x), mix(bc,bd,t.x), t.y),
            mix(mix(be,bf,t.x), mix(bg,bh,t.x), t.y), 
        t.z), 
    t_time);
}
```

Next, we build a fractal Brownian motion using the above noise function.
```glsl
#define NUM_OCTAVES 6
float fBm ( in vec3 _pos, in float sz) {
    float v = 0.0;
    float a = 0.2;
    _pos *= sz;

    vec3 angle = vec3(-0.001*u_time,0.0001*u_time,0.0004*u_time);
    mat3 rotx = mat3(1, 0, 0,
                    0, cos(angle.x), -sin(angle.x),
                    0, sin(angle.x), cos(angle.x));
    mat3 roty = mat3(cos(angle.y), 0, sin(angle.y),
                    0, 1, 0,
                    -sin(angle.y), 0, cos(angle.y));
    mat3 rotz = mat3(cos(angle.z), -sin(angle.z), 0,
                    sin(angle.z), cos(angle.z), 0,
                    0, 0, 1);

    for (int i = 0; i < NUM_OCTAVES; ++i) {
        v += a * noise(_pos);
        _pos = rotx * roty * rotz * _pos * 2.0;
        a *= 0.8;
    }
    return v;
}

void main() {
    vec3 st = vPosition;

    vec3 q = vec3(0.);
    q.x = fBm( st, 5.);
    q.y = fBm( st + vec3(1.2,3.2,1.52), 5.);
    q.z = fBm( st + vec3(0.02,0.12,0.152), 5.);

    float n = fBm(st+q+vec3(1.82,1.32,1.09), 5.);

    vec3 color = vec3(0.);
    color = mix(vec3(1.,0.4,0.), vec3(1.,1.,1.), n*n);
    color = mix(color, vec3(1.,0.,0.), q*0.7);
    gl_FragColor = vec4(1.6*color, 1.);
```
As the scale of the fractal becomes small, its amplitude and angle are adjusted manually. The result is shown below.

<img class="image" referrerpolicy="no-referrer" src="https://i.imgur.com/Necxivn.gif">

## Glow
The glow effect can make a light-emitting object brighter. Since the glow effect does not depend on the object itself and appears on the camera, a vector `vNormalView` is defined in the camera coordinates. For your information, the below images show the difference between `vNormal`, `vNormalModel`, and `vNormalView`.  As you can see, `vNormal`, `vNormalModel`, and `vNormalView` are based on world, model, camera coordinates, respectively.

| `vNormal`                            | `vNormalModel`                       | `vNormalView`                        |
| :----------------------------------: | :----------------------------------: | :----------------------------------: |
| <img class="image" referrerpolicy="no-referrer" src="https://i.imgur.com/JdN8oyc.gif"> | <img class="image" referrerpolicy="no-referrer" src="https://i.imgur.com/VY5pyZG.gif"> | <img class="image" referrerpolicy="no-referrer" src="https://i.imgur.com/qXqr1mV.gif"> |

In Three.js, `vNormal`, `vNormalModel`, and `vNormalView` can be derived from the predefined attributes; `normal`, `modelMatrix`, and `normalMatrix`.
```glsl
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vNormalModel;
varying vec3 vNormalView;
varying vec3 vPosition;

void main() {
    vUv = uv;
    vNormal = normalize(mat3(modelMatrix) * normal);
    vNormalModel = normal;
    vNormalView = normalize(normalMatrix * normal);
    vPosition = normalize(vec3(modelViewMatrix * vec4(position, 1.0)).xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
```

Thus, `dot(vPosition, vNormalView)` has the largest value at the center of object, whereas having small value at the boundary.  
```glsl
uniform vec3 u_color;
varying vec3 vPosition;
varying vec3 vNormalView;

void main() {
    float raw_intensity = max(dot(vPosition, vNormalView), 0.);
    float intensity = pow(raw_intensity, 4.);
    vec4 color = vec4(u_color, intensity);
    gl_FragColor = color;
}
```
<img class="image" referrerpolicy="no-referrer" src="https://i.imgur.com/vwOynAW.gif">

## Fresnel
As mentioned in the previous article[^earth], when rendering the light-emitting object, we have to consider that the boundary of the object seems to be brighter because the angle of incidence becomes small at the boundary. In the below, the Fresnel effect is described with the term, `fresnelTerm_outer`. Besides, because the light from the center of the object enters the camera more strongly, this effect is described as a term, `fresnelTerm_inner`. As the same with the glow effect, `vNormalView` has been used to render the Fresnel effect.
```glsl
uniform vec3 u_color;
varying vec3 vPosition;
varying vec3 vNormalView;

void main() {
    float fresnelTerm_inner = 0.2 - 0.7*min(dot(vPosition, vNormalView), 0.0);
    fresnelTerm_inner = pow(fresnelTerm_inner, 5.0);

    float fresnelTerm_outer = 1.0 + dot(normalize(vPosition), normalize(vNormalView));
    fresnelTerm_outer = pow(fresnelTerm_outer, 2.0);
    
    float fresnelTerm = fresnelTerm_inner + fresnelTerm_outer;
    gl_FragColor = vec4( u_color, 0.7 ) * fresnelTerm;
}
```
<img class="image" referrerpolicy="no-referrer" src="https://i.imgur.com/XLfgZSl.gif">

[^earth]: [\[Three.js\] Create a Realistic Earth with Shaders](https://sangillee.com/2024-06-07-create-realistic-earth-with-shaders/)
[^shaderpattern]: [\[WebGL\] Shader Design Patterns](https://sangillee.com/2024-05-25-shader-design-patterns/)