---
title: "Implementing Ray Marching in GLSL"
prefix: "WebGL"
categories:
 - WebGL
tags:
 - glsl
 - webgl
 - shader
 - raymarching
 - sdf
 - noise
 - texture
 - reflection
header:
  teaser: /assets/image/thumbnail/2025-04-29-ray-marching.jpeg
excerpt_separator: <!--more-->
---

> Ray marching is a technique for rendering a 3D scene onto a 2D screen. As the name suggests, a bundle of rays marches incrementally, checking for intersections with objects. This post will walk through how to implement ray marching in GLSL step by step, covering topics such as distance maps, normal maps, lighting, shading, reflections, transparent objects, and refraction.

<!--more-->

In this post, I will explain step by step how to create the results below.

{% include /assets/basic_shader.html vertex="
precision mediump float;

attribute vec2 a_position;
attribute vec3 a_normal;

// uniform vec2 u_resolution;

varying vec2 v_position;
varying vec3 v_normal;

void main() {
  // 위치를 픽셀에서 0.0과 1.0사이로 변환
  vec2 zeroToOne = a_position;// / u_resolution;

  // 0->1에서 -1->+1로 변환 (클립 공간)
  vec2 clipSpace = zeroToOne * 2.0 - 1.0;
  clipSpace.y *= -1.;

  v_position = a_position;
  v_normal = a_normal;

  gl_Position = vec4(clipSpace, 0., 1.);
}" fragment="
// Author: Sangil Lee, https://sangillee.com
// Refer to Tim Coster, https://timcoster.com

precision highp float;
uniform vec2 u_resolution; // Width & height of the shader
uniform float u_time; // Time elapsed
uniform sampler2D u_texture;
uniform vec2 u_angle; // camera rotation

// Constants
#define PI 3.1415925359
#define TWO_PI 6.2831852
#define MAX_STEPS 200 // Mar Raymarching steps
#define MAX_DIST 100. // Max Raymarching distance
#define SURF_DIST .01 // Surface distance
#define SAMPLE_DIST 0.05 // Sample distance

float random(in vec2 x) {
  return fract(sin(dot(x, vec2(12.9898,54.233))) * 43758.5453123);
}

float noise(in vec2 x) {
  vec2 i = floor(x);
  vec2 f = fract(x);

  float tl = random(i); // top-left corner
  float tr = random(i + vec2(1.0, 0.0)); // top-right corner
  float bl = random(i + vec2(0.0, 1.0)); // bottom-left corner
  float br = random(i + vec2(1.0, 1.0)); // bottom-right corner

  vec2 u = smoothstep(0., 1., f);

  return
  mix(
    mix(tl, tr, u.x), 
    mix(bl, br, u.x), 
  u.y);
}

vec3 get_light() {
  return vec3(6.*sin(0.3*u_time),5.,6.*cos(0.3*u_time));
}

float get_plane_dist(in vec3 p) {
  return p.y + 0.5*noise(0.5*p.xz) + 0.05*noise(2.*p.xz) + 0.012*noise(4.*p.xz) + 1.2;
}

float get_sphere_dist(in vec3 p) { 
  vec4 s = vec4(0, 0, 0, 1);
  return length(p - s.xyz) - s.w;
}

vec2 get_sphere_tex_coord(in vec3 p) {
  vec4 s = vec4(0, 0, 0, 1);
  vec3 r = p - s.xyz;
  float phi = atan(sqrt(dot(r.xz, r.xz)), r.y);
  float theta = atan(r.z, r.x);
  return fract(vec2(phi / PI, theta / TWO_PI));
}

float SDF(in vec3 p) {
  float sphereDist = get_sphere_dist(p);
  float planeDist = get_plane_dist(p);
  float d = min(sphereDist, planeDist);
  return d;
}

int get_object_id(in vec3 p) {
  if (get_sphere_dist(p) < 0.0) return 1;
  if (get_plane_dist(p) < 0.0) return 2;
  return 0;
}

vec3 get_color(in vec3 p) {
  if (get_sphere_dist(p) < 0.0) return vec3(0.5, 0.7, 1.0); // sphere color
  // if (get_plane_dist(p) < 0.0) return vec3(0.8, 0.55, 0.3); // ground color
  // if (get_sphere_dist(p) < 0.0) return texture2D(u_texture, get_sphere_tex_coord(p)).rgb; // sphere color
  if (get_plane_dist(p) < 0.0) return texture2D(u_texture, fract(0.2*p.xz)).rgb; // ground color
  return vec3(0.);
}

float get_density(in vec3 p) {
  if (get_sphere_dist(p) < 0.0) return 0.2; // sphere density
  if (get_plane_dist(p) < 0.0) return 10.0; // ground density
  return 0.;
}

float get_specular(in vec3 p) {
  if (get_sphere_dist(p) < 0.0) return 0.3; // sphere specular
  if (get_plane_dist(p) < 0.0) return 0.05; // ground specular
  return 0.;
}

float ray_march(in vec3 ro, in vec3 rd) {
  float d = 0.;
  for (int i = 0; i < MAX_STEPS; ++i) {
    vec3 p = ro + rd * d;
    float ds = SDF(p);
    
    if (ds < SURF_DIST)
      return d;
      
    d += ds;
  
    if (d > MAX_DIST)
      return 1./0.;
  }
  return 1./0.;
}

vec3 get_normal(in vec3 p) { 
  vec2 e = vec2(.01,0); // Epsilon
  vec3 n = vec3(
  SDF(p+e.xyy) - SDF(p-e.xyy),
  SDF(p+e.yxy) - SDF(p-e.yxy),
  SDF(p+e.yyx) - SDF(p-e.yyx)
  );
  
  return normalize(n);
}

float compute_contrast(in vec3 p, in vec3 n) {
  // Directional light
  vec3 l = get_light(); // Light Position
  vec3 ld = normalize(l-p); // Light Vector
  
  float dif = dot(n,ld); // Diffuse light
  dif = clamp(dif,0.,1.); // Clamp so it doesnt go below 0
  
  // Shadows
  float d = ray_march(p + 10.*n*SURF_DIST, ld);
  if (d < length(l-p))
    dif *= 0.3;

  return dif;
}

float compute_reflection(in vec3 p, in vec3 n, in vec3 c, in float f) {
  vec3 l = get_light(); // Light Position
  vec3 ld = normalize(l-p); // Light Vector
  vec3 r = reflect(-ld, n); // reflected vector of sunlight
  float s = clamp(dot(r, normalize(c - p)), 0., 1.); // dot product between reflected light and camera vector
  return pow(s, 10.0) * f;
}

void main()
{
  // image plane: u ~ [0, u_resolution.x], v ~ [0, u_resolution.y]
  vec2 uv = gl_FragCoord.xy;
  
  // intrinsic parameter
  vec2 f = vec2(600.);
  vec2 c = 0.5*u_resolution.xy;
  
  // normalized image plane
  vec2 xy = (uv - c) / f;
  
  // distortion
  vec2 k_d = vec2(0.3,0.0);
  vec2 p_d = vec2(0.0,0.0);
  float r2 = dot(xy, xy);
  xy = (1. + k_d.x*r2 + k_d.y*r2*r2) * xy + vec2(2.*p_d.x*xy.x*xy.y + p_d.y*(r2 + 2.*xy.x*xy.x), 2.*p_d.y*xy.x*xy.y + p_d.x*(r2 + 2.*xy.y*xy.y));
  
  // camera
  float theta = -u_angle.x; // camera yaw
  float phi = u_angle.y; // camera pitch

  mat3 Ry = mat3(
    cos(theta), 0., -sin(theta),
    0., 1., 0.,
    sin(theta), 0., cos(theta)
  );

  mat3 Rx = mat3(
    1., 0., 0.,
    0., cos(phi), sin(phi),
    0., -sin(phi), cos(phi)
  );

  mat3 R = Ry * Rx; // camera rotation
  float r = 6.0; // camera distance
  
  // camera translation
  vec3 t = vec3(-r*cos(phi)*sin(theta), r*sin(phi), -r*cos(phi)*cos(theta));

  mat4 T = mat4(
    vec4(R[0], 0.0),
    vec4(R[1], 0.0),
    vec4(R[2], 0.0),
    vec4(t, 1.0)
  );

  vec3 co = vec3(0,0,0); // camera origin
  vec3 cd = normalize(vec3(xy,1)); // camera ray vector
  
  // ray
  vec3 ro = (T * vec4(co, 1.)).xyz; // ray origin w.r.t world
  vec3 rd = (T * vec4(cd, 0.)).xyz; // ray vector w.r.t world

  // find the surface point
  float d = ray_march(ro, rd);
  vec3 p = ro + rd * d;
  vec3 n = get_normal(p);

  vec3 color = get_color(p - n*SURF_DIST); // apply color or texture
  color *= compute_contrast(p, n); // apply lighting and shading

  // apply specular lighting
  color += compute_reflection(p, n, ro, get_specular(p-n*SURF_DIST));
  
  gl_FragColor = vec4(color,1.0);
}" texture="/assets/image/texture/soil.jpg" index=0 %}

## Signed distance function
In GLSL, a 3D model can be represented by a signed distance function (SDF), which outputs the minimum distance to the surface of the 3D model. When a point is outside the model, its SDF value is positive; if a point is inside, the value is negative. Consequently, SDF values are zero on the surfaces. By computing SDF values along rays, we can find the surface points of the 3D model.

The example code below defines SDF functions for two objects: a sphere and a plane. Note that the output d is the minimum of `sphereDist` and `planeDist`, effectively merging the SDFs of each model. You can find additional models and their SDF functions in [Inigo Quilez](https://iquilezles.org/articles/distfunctions/). 

```glsl
float SDF(vec3 p) 
{
  vec4 s = vec4(0,1.2,0,1); //Sphere xyz is position w is radius
  float sphereDist = length(p-s.xyz) - s.w;
  float planeDist = p.y;
  float d = min(sphereDist,planeDist);
  return d;
}
```

### Deformation
If you want to create desert-like or mountain-like terrain, you can easily implement it using noise functions (see [Noise functions]({% post_url 2024-07-14-Noise-functions %})) and the fractal Brownian motion (fBm) technique (see [Shader patterns]({% post_url 2024-05-25-Shader-design-patterns %})). Here are some examples.

## Ray marching
In this step, we find the depth of each ray using the SDF. Each ray consists of an origin, `ro`, and a direction, `rd`. The ray origin can be the camera position, and its direction is associated with the normalized image coordinates using intrinsic parameters.

For each ray, we sample a point along the ray and check if the point lies on a surface. If not, we resample the point at a farther distance. When resampling, rays do not march by a fixed step size but instead by the SDF value. Since the SDF value represents the minimum distance to the nearest surface, it guarantees that there is no object inside a sphere whose radius is equal to the SDF value.

Inside the for-loop, when the sampled point hits a surface, the corresponding depth `d` is returned. Otherwise, if the maximum number of iterations is reached or the depth exceeds the maximum distance, an invalid value `1./0.` is returned.

```glsl
float ray_march(vec3 ro, vec3 rd) {
  float d = 0.; // init depth
  for (int i=0; i < MAX_STEPS; ++i) {
    vec3 p = ro + rd * d;
    float ds = SDF(p);
    
    if (ds < SURF_DIST) 
      return d;
      
    d += ds;
  
    if (d > MAX_DIST)
      return 1./0.;
  }
  return 1./0.;
}
```

|             flat plane              |             bumpy plane              |
|:------------------------------------:|:------------------------------------:|
| <img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/WPM9vju.png"> | <img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/3UV8T6s.png"> |

## Normal map
For lighting and shading effects, a normal map is necessary. To compute the normal vector on the surface of a 3D object, we calculate the change in the SDF within a local region around the point. By definition, the SDF value increases as you move away from the surface, so the gradient of the SDF near the surface is equal to the surface normal vector. In practice, we compute this gradient numerically by using sufficiently small displacements.

```glsl
vec3 get_normal(vec3 p) { 
  vec2 e = vec2(.01,0); // Epsilon
  vec3 n = vec3(
    SDF(p+e.xyy) - SDF(p-e.xyy),
    SDF(p+e.yxy) - SDF(p-e.yxy),
    SDF(p+e.yyx) - SDF(p-e.yyx)
  );
  
  return normalize(n);
}
```

<img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/oLmZCh9.png">

## Lighting and shading
Now that we have the depth map and normal map, we can apply the same techniques described in [Create realistic Earth]({% post_url 2024-06-07-Create-realistic-Earth-with-shaders %}). In the “Mountain Shadow” section of that post, lighting and shading were implemented as follows:

```glsl
// Normal map texture
vec3 t_normal = texture2D( u_normalTexture, vUv ).xyz * 2.0 - 1.0;
vec3 normal = normalize(vTbn * t_normal);
float cosAngleSunToSurface = dot(normal, sunDir); // Compute cosine sun to normal
mixAmountTexture *= 1.0 + u_normalPower * (cosAngleSunToSurface - cosAngleSunToNormal);
mixAmountTexture = clamp(mixAmountTexture, 0., 1.);
```

Similar to the previous work, I compute the dot product between the light direction and normal vectors, as shown below. To simulate ambient light, the second argument of `clamp` is set to `0.2`.

Shadows caused by occlusion can be detected using `ray_march` with the light direction `ld` as the ray direction. If the returned distance is smaller than the actual distance between the surface point and the light source, it means there is an object between them — in other words, occlusion has occurred.

I also applied two practical techniques. First, since the surface point `p` already satisfies the break condition `SDF(p) < SURF_DIST`, I slightly offset it by adding a small normal vector `n * SURF_DIST` to the point. Second, to prevent the surface point from being dimmed twice by both shading and self-occlusion, I added a check for the condition `d > 10. * SURF_DIST`.

```glsl
float light(vec3 p, vec3 n) {
  // lighting
  vec3 l = vec3(5.*sin(u_time),5.,5.0*cos(u_time)); // Light Position
  vec3 ld = normalize(l-p); // Light Vector
  
  float dif = dot(n,ld); // Diffuse light
  dif = clamp(dif,0.2,1.); // Clamp so it doesnt go below 0
  
  // occlusion
  float d = ray_march(p+n*SURF_DIST, ld); 
  if ( d > 10. * SURF_DIST && d < length(l-p)) dif *= 0.3;
  return dif;
}
```

<img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/KUbEDps.png">

## Reflecting a point light source
The fundamentals of reflection are also explained in the “Ocean Reflection” section of [Create realistic Earth]({% post_url 2024-06-07-Create-realistic-Earth-with-shaders %}):

```glsl
// Specular map texture with reflection
vec3 surfacePosition = u_position + vPosition; // surface position in world coordinates
float reflectRatio = texture2D(u_specTexture, vUv).r;
reflectRatio = 0.3 * reflectRatio + 0.1;
vec3 reflectVec = reflect(-sunDir, normal); // reflected vector of sunlight

// dot product between reflected light and camera vector
float specPower = clamp(dot(reflectVec, normalize(cameraPosition - surfacePosition)), 0., 1.);
color += mixAmountTexture * pow(specPower, 2.0) * reflectRatio;
```

Similar to the previous work, I computed the reflected light vector, `r`, and dot product between `r` and camera vector.  `f` plays the same role as `reflectRatio` above, controlling the reflectance.

```glsl
float reflection(vec3 p, vec3 n, vec3 c, float f) {
  vec3 l = vec3(5.*sin(u_time),5.,5.0*cos(u_time)); // Light Position
  vec3 ld = normalize(l-p); // Light Vector
  vec3 r = reflect(-ld, n); // reflected vector of sunlight

  // dot product between reflected light and camera vector
  float s = clamp(dot(r, normalize(c - p)), 0., 1.); 
  return pow(s, 10.0) * f;
}
```

<img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/QuferLg.png">

In the future, I’ll delve into the implementation of lighting, shading, and reflecting techniques for a volumetric light source. 

## Coloring

In this post, I discuss a basic coloring technique for 3D rendering. Materials are represented using solid RGB colors or textures. In a future post, I will cover how to implement coloring for transparent materials using participating media rendering method.

### Solid RGB color

First, we define the color of objects. Then, we can compute the color of a ray by calling `get_color(p - n*SURF_DIST)`, ensuring that we extract the color from beneath the surface.

```glsl
vec3 get_color(vec3 p) {
  vec4 s = get_sphere();
  if (length(p-s.xyz) < s.w) return vec3(0.5, 0.7, 1.0); // sphere color
  if (p.y < 0.0) return vec3(0.57, 0.42, 0.3); // ground color
  return vec3(0.);
}
```

<img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/pqBRzDv.png">

### Texture
Instead of a solid color, using a texture makes an object appear more realistic. Free textures can be found [here](https://texturelabs.org). Before applying a texture, we need to define a UV map, $$f: \mathbb{R}^3 \rightarrow [0, 1]^2$$. For a plane whose SDF is $$SDF(x, y, z) = y$$, the UV map is simply mapped by `fract(vec2(x, z))`, resulting in a repetitive pattern. For a sphere, given its center position and radius, the UV map is mapped using longitude and latitude.

```glsl
vec2 get_sphere_tex_coord(in vec3 p) {
  vec4 s = vec4(0, 1.2, 0, 1);
  vec3 r = p - s.xyz;
  float phi = atan(sqrt(dot(r.xz, r.xz)), r.y);
  float theta = atan(r.z, r.x);
  return fract(vec2(phi / PI, theta / TWO_PI));
}
```

For a flat surface, the UV map can be simply mapped as, for example, `p.xz`. Then, update `get_color` function.

```glsl
vec3 get_color(vec3 p) {
  vec4 s = get_sphere();
  if (length(p-s.xyz) < s.w) return vec3(0.5, 0.7, 1.0); // sphere color
  if (p.y < 0.0) return texture2D(u_texture, fract(0.2*p.xz)).rgb; // ground color
  return vec3(0.);
}
```

When using a sand texture to describe desert terrain, the result would look like this:

<img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/1LwXUMB.png">

## Moving camera
To determine the position and orientation of a camera, we employ a transformation matrix that incorporates a rotation matrix and a translation vector. It’s important to note that the elements of `mat3` and `mat4` are stored contiguously in columns. Consequently, rotation matrices for the `x, y, z` axes are represented as follows:

```glsl
mat3 Rx = mat3(
  1., 0., 0.,
  0., cos(psi), sin(psi),
  0., -sin(psi), cos(psi)
);
mat3 Ry = mat3(
  cos(theta), 0., -sin(theta),
  0., 1., 0.,
  sin(theta), 0., cos(theta)
);
mat3 Rz = mat3(
  cos(phi), sin(phi), 0.,
  -sin(phi), cos(phi), 0.,
  0., 0., 1.
);
```

Then, given a rotation matrix `R` and a translation vector `t`, the transformation matrix `T` is computed as follows:

```glsl
mat4 T = mat4(
  vec4(R[0], 0.0),
  vec4(R[1], 0.0),
  vec4(R[2], 0.0),
  vec4(t, 1.0)
);
```

Thus, the origin and the direction of the ray in world coordinates are determined by multiplying the origin and the view direction of the camera by the transformation matrix `T`.

```glsl
vec3 co = vec3(0,0,0); // camera origin
vec3 cd = normalize(vec3(xy,1)); // camera ray vector

vec3 ro = (T * vec4(co, 1.)).xyz; // ray origin w.r.t world
vec3 rd = (T * vec4(cd, 0.)).xyz; // ray vector w.r.t world
```

## Entire fragment code
The final result and code are below.

```glsl
// Author: Sangil Lee, https://sangillee.com
// Refer to Tim Coster, https://timcoster.com

precision highp float;
uniform vec2 u_resolution; // Width & height of the shader
uniform float u_time; // Time elapsed
uniform sampler2D u_texture;
uniform vec2 u_angle; // camera rotation

// Constants
#define PI 3.1415925359
#define TWO_PI 6.2831852
#define MAX_STEPS 200 // Mar Raymarching steps
#define MAX_DIST 100. // Max Raymarching distance
#define SURF_DIST .01 // Surface distance
#define SAMPLE_DIST 0.05 // Sample distance

float random(in vec2 x) {
  return fract(sin(dot(x, vec2(12.9898,54.233))) * 43758.5453123);
}

float noise(in vec2 x) {
  vec2 i = floor(x);
  vec2 f = fract(x);

  float tl = random(i); // top-left corner
  float tr = random(i + vec2(1.0, 0.0)); // top-right corner
  float bl = random(i + vec2(0.0, 1.0)); // bottom-left corner
  float br = random(i + vec2(1.0, 1.0)); // bottom-right corner

  vec2 u = smoothstep(0., 1., f);

  return
  mix(
    mix(tl, tr, u.x), 
    mix(bl, br, u.x), 
  u.y);
}

vec3 get_light() {
  return vec3(6.*sin(0.3*u_time),5.,6.*cos(0.3*u_time));
}

float get_plane_dist(in vec3 p) {
  return p.y + 0.5*noise(0.5*p.xz) + 0.05*noise(2.*p.xz) + 0.012*noise(4.*p.xz);
}

float get_sphere_dist(in vec3 p) { 
  vec4 s = vec4(0, 1.2, 0, 1);
  return length(p - s.xyz) - s.w;
}

vec2 get_sphere_tex_coord(in vec3 p) {
  vec4 s = vec4(0, 1.2, 0, 1);
  vec3 r = p - s.xyz;
  float phi = atan(sqrt(dot(r.xz, r.xz)), r.y);
  float theta = atan(r.z, r.x);
  return fract(vec2(phi / PI, theta / TWO_PI));
}

float SDF(in vec3 p) {
  float sphereDist = get_sphere_dist(p);
  float planeDist = get_plane_dist(p);
  float d = min(sphereDist, planeDist);
  return d;
}

int get_object_id(in vec3 p) {
  if (get_sphere_dist(p) < 0.0) return 1;
  if (get_plane_dist(p) < 0.0) return 2;
  return 0;
}

vec3 get_color(in vec3 p) {
  if (get_sphere_dist(p) < 0.0) return vec3(0.5, 0.7, 1.0); // sphere color
  // if (get_plane_dist(p) < 0.0) return vec3(0.8, 0.55, 0.3); // ground color
  // if (get_sphere_dist(p) < 0.0) return texture2D(u_texture, get_sphere_tex_coord(p)).rgb; // sphere color
  if (get_plane_dist(p) < 0.0) return texture2D(u_texture, fract(0.2*p.xz)).rgb; // ground color
  return vec3(0.);
}

float get_density(in vec3 p) {
  if (get_sphere_dist(p) < 0.0) return 0.2; // sphere density
  if (get_plane_dist(p) < 0.0) return 10.0; // ground density
  return 0.;
}

float get_specular(in vec3 p) {
  if (get_sphere_dist(p) < 0.0) return 0.3; // sphere specular
  if (get_plane_dist(p) < 0.0) return 0.05; // ground specular
  return 0.;
}

float ray_march(in vec3 ro, in vec3 rd) {
  float d = 0.;
  for (int i = 0; i < MAX_STEPS; ++i) {
    vec3 p = ro + rd * d;
    float ds = SDF(p);
    
    if (ds < SURF_DIST)
      return d;
      
    d += ds;
  
    if (d > MAX_DIST)
      return 1./0.;
  }
  return 1./0.;
}

vec3 get_normal(in vec3 p) { 
  vec2 e = vec2(.01,0); // Epsilon
  vec3 n = vec3(
    SDF(p+e.xyy) - SDF(p-e.xyy),
    SDF(p+e.yxy) - SDF(p-e.yxy),
    SDF(p+e.yyx) - SDF(p-e.yyx)
  );
  
  return normalize(n);
}

float compute_contrast(in vec3 p, in vec3 n) {
  // Directional light
  vec3 l = get_light(); // Light Position
  vec3 ld = normalize(l-p); // Light Vector
  
  float dif = dot(n,ld); // Diffuse light
  dif = clamp(dif,0.,1.); // Clamp so it doesnt go below 0
  
  // Shadows
  float d = ray_march(p + 10.*n*SURF_DIST, ld);
  if (d < length(l-p))
    dif *= 0.3;

  return dif;
}

float compute_reflection(in vec3 p, in vec3 n, in vec3 c, in float f) {
  vec3 l = get_light(); // Light Position
  vec3 ld = normalize(l-p); // Light Vector
  vec3 r = reflect(-ld, n); // reflected vector of sunlight
  float s = clamp(dot(r, normalize(c - p)), 0., 1.); // dot product between reflected light and camera vector
  return pow(s, 10.0) * f;
}

void main()
{
  vec3 color = vec3(0.);
    
  // image plane: u ~ [0, u_resolution.x], v ~ [0, u_resolution.y]
  vec2 uv = gl_FragCoord.xy;
    
  // intrinsic parameter
  vec2 f = vec2(600.);
  vec2 c = 0.5*u_resolution.xy;
  
  // normalized image plane
  vec2 xy = (uv - c) / f;
  
  // distortion
  vec2 k_d = vec2(0.3,0.0);
  vec2 p_d = vec2(0.0,0.0);
  float r2 = dot(xy, xy);
  xy = (1. + k_d.x*r2 + k_d.y*r2*r2) * xy + vec2(2.*p_d.x*xy.x*xy.y + p_d.y*(r2 + 2.*xy.x*xy.x), 2.*p_d.y*xy.x*xy.y + p_d.x*(r2 + 2.*xy.y*xy.y));
  
  // camera
  float theta = u_angle.x; // camera yaw
  float phi = u_angle.y; // camera pitch

  mat3 Ry = mat3(
    cos(theta), 0., -sin(theta),
    0., 1., 0.,
    sin(theta), 0., cos(theta)
  );

  mat3 Rx = mat3(
    1., 0., 0.,
    0., cos(phi), sin(phi),
    0., -sin(phi), cos(phi)
  );

  mat3 R = Ry * Rx; // camera rotation
  float r = 6.0; // camera distance
  vec3 t = vec3(-r*cos(phi)*sin(theta), r*sin(phi), -r*cos(phi)*cos(theta)); // camera translation

  mat4 T = mat4(
    vec4(R[0], 0.0),
    vec4(R[1], 0.0),
    vec4(R[2], 0.0),
    vec4(t, 1.0)
  );

  vec3 co = vec3(0,0,0); // camera origin
  vec3 cd = normalize(vec3(xy,1)); // camera ray vector
  
  // ray
  vec3 ro = (T * vec4(co, 1.)).xyz; // ray origin w.r.t world
  vec3 rd = (T * vec4(cd, 0.)).xyz; // ray vector w.r.t world

  // find the surface point
  float d = ray_march(ro, rd);
  vec3 p = ro + rd * d;
  vec3 n = get_normal(p);

  color = get_color(p - n*SURF_DIST); // apply color and texture
  color *= compute_contrast(p, n); // apply lighting and shading
  
  // apply specular lighting
  color += compute_reflection(p, n, ro, get_specular(p-n*SURF_DIST));
  
  gl_FragColor = vec4(color,1.0);
}
```
