---
title: "Create a Realistic Saturn with Rings"
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
  teaser: /assets/image/thumbnail/2024-11-02-create-realistic-saturn-with-rings.jpg
excerpt_separator: <!--more-->
---

> In the solar system, there are two main types of planets: rocky and gas giants, some of which have rings. Among them, Saturn is the most well-known gas giant with prominent rings. This project focuses on creating a realistic 3D model of Saturn, with a detailed representation of its rings, surface, and the shadows cast between the rings and the planet.

<!--more-->

## The main body of Saturn
The visualization of Saturn begins with the previous post[^earth]. However, its bumpy texture, ocean reflection, and clouds are not rendered, since Saturn is a gas giant. Therefore, the main body of Saturn can be implemented as below. 

```glsl
// vertex shader of Saturn body
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying mat3 vTbn;

attribute vec4 tangent; // "geometry.computeTangents()" is needed.

void main() {
  vUv = uv;
  vNormal = normalize(mat3(modelMatrix) * normal);
  vPosition = mat3(modelMatrix) * position;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

  vec3 t = normalize(tangent.xyz);
  vec3 n = normalize(normal.xyz);
  vec3 b = normalize(cross(t, n));

  t = mat3(modelMatrix) * t;
  b = mat3(modelMatrix) * b;
  n = mat3(modelMatrix) * n;
  vTbn = mat3(t, b, n);
}
```

```glsl
uniform sampler2D u_dayTexture;
uniform sampler2D u_normalTexture;
uniform vec3 u_sunRelPosition; // the relative position of light source
uniform vec3 u_position; // the position of this object
uniform float u_sunRadius; // the radius of light source
uniform float u_specRatio;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying mat3 vTbn;

void main( void ) {
  vec3 sunDir = normalize(u_sunRelPosition);

  // 1. Day and night texture
  vec3 dayColor = texture2D( u_dayTexture, vUv ).rgb;
  float cosAngleSunToNormal = dot(vNormal, sunDir); // Compute cosine sun to normal
  float hemisphereLight = 1. / (1. + exp(-20. * (cosAngleSunToNormal+0.05)));
  float mixAmountSurface = hemisphereLight; // Sharpen the edge beween the transition
  vec3 color = mix( vec3(0.), dayColor, mixAmountSurface ); // Select day or night texture based on mix.

  // 2. Specular map texture with reflection
  vec3 surfacePosition = u_position + vPosition;
  vec3 reflectVec = reflect(-sunDir, vNormal); // reflected vector of sunlight
  float specPower = dot(reflectVec, normalize(cameraPosition - surfacePosition)); // dot product between reflected light and camera vector
  color += mixAmountSurface * pow(specPower, 3.0) * u_specRatio * 0.4;

  gl_FragColor = vec4( color, 1.0 );
}
```

<img class="image" referrerpolicy="no-referrer" src="https://i.imgur.com/Yo7DsGN.png">

## The rings of Saturn
Now, let's implement the remaining part of Saturn, rings. The rings of Saturn consist of countless small particles with various colors and densities. Even if we do not render all particles, we are about to describe the color and transparency of each subdivision of rings by generating a double-sided disc component. 

```js
const geometry_ring = new THREE.RingGeometry(1.3, 2.2, 128).rotateX(-Math.PI / 2);
const material_ring = new THREE.MeshBasicMaterial({color: 0xffffaa});

const ring_upper = new THREE.Mesh(geometry_ring, material_ring);
const ring_lower = new THREE.Mesh(geometry_ring, material_ring).rotateX(Math.PI);;

saturn.add(ring_upper);
saturn.add(ring_lower);
```

<img class="image640" referrerpolicy="no-referrer" src="https://i.imgur.com/p98czpt.png">

For more complicated and realistic ring, let's create a shader material.

Vertex shader:
```glsl
// vertex shader of Saturn ring
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying mat3 vTbn;

void main() {
  vUv = uv;
  vNormal = normalize(mat3(modelMatrix) * normal);
  vPosition = mat3(modelMatrix) * position;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

}
```

Fragment shader:
```glsl
// fragment shader of Saturn ring
uniform sampler2D u_colorTexture;
uniform sampler2D u_alphaTexture;
uniform vec3 u_sunRelPosition; // the relative position of light source
uniform vec3 u_moonPosition; // the position of obstacle
uniform vec3 u_position; // the position of this object
uniform float u_sunRadius; // the radius of light source
uniform float u_moonRadius; // the radius of obstacle

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

#define PI (3.141592)

float eclipse(float angleBtw, float angleLight, float angleObs) {
  float angleRatio2 = pow(angleObs / angleLight, 2.);
  float value;
  if (angleBtw > angleLight - angleObs && angleBtw < angleLight + angleObs) {
    if (angleBtw < angleObs - angleLight) {
      value = 0.;
    }else {
      float x = 0.5/angleBtw * (angleBtw*angleBtw + angleLight*angleLight - angleObs*angleObs);
      float ths = acos(x/angleLight);
      float thm = acos((angleBtw-x)/angleObs);
      value = 1./PI * (PI - ths + 0.5 * sin(2. * ths) - thm * angleRatio2 + 0.5 * angleRatio2 * sin(2. * thm));
    }
  } else if (angleBtw > angleLight + angleObs)
    value = 1.;
  else { // angleBtw < angleLight - angleObs
    value = 1. - angleRatio2;
  }

  return clamp(value, 0., 1.);
}

void main( void ) {
  vec3 sunDir = normalize(u_sunRelPosition);

  // 1. Day and night texture
  vec3 ringColor = texture2D( u_colorTexture, vUv ).rgb;
  float ringAlpha = texture2D( u_alphaTexture, vUv ).r;

  float cosAngleSunToNormal = dot(vNormal, sunDir); // Compute cosine sun to normal
  float mixAmountSurface = 0.7 / (1. + exp(-10. * cosAngleSunToNormal)) + 0.3; // Sharpen the edge beween the transition

  // // 2. Eclipse
  vec3 surfacePosition = u_position + vPosition;
  float distSurfaceToSun = length(u_sunRelPosition);
  float cosAngleBtwSunMoon = dot(sunDir, normalize(u_moonPosition - surfacePosition));
  float angleBtwSunMoon = acos(cosAngleBtwSunMoon);
  float distSurfaceToMoon = length(u_moonPosition - surfacePosition);
  mixAmountSurface *= eclipse(angleBtwSunMoon, asin(u_sunRadius / distSurfaceToSun), asin(u_moonRadius / distSurfaceToMoon));

  vec3 color = mix( vec3(0.), ringColor, mixAmountSurface ); // Select day or night texture based on mix.

  // 3. Specular map texture with reflection
  vec3 reflectVec = reflect(-sunDir, vNormal); // reflected vector of sunlight
  float specPower = dot(reflectVec, normalize(cameraPosition - surfacePosition)); // dot product between reflected light and camera vector
  color += mixAmountSurface * pow(specPower, 3.0) * 0.3;

  gl_FragColor = vec4( color, ringAlpha );
}
```

Since the principles of object surface rendering are the same, you can see that the functions of the ring and planet shaders are also identical. For a detailed description of eclipse, see the previous post[^earth]. To implement the upper side and the lower side of disc, please notice that I've created two discs with different rotation, 0 deg and 180 deg. In the above GLSL shaders, the texture of rings are applied to the disc and examples of ring texture can be downloaded from [here](https://planetpixelemporium.com/saturn.html) or [here](https://www.solarsystemscope.com/textures/). As a result of the above shaders, the below is obtained.

<img class="image640" referrerpolicy="no-referrer" src="https://i.imgur.com/ZBgELjz.png">

However, the ring texture image is not applied properly in the direction away from the planet, because the UV coordinates of the texture image and mesh object are different to each other: in the image below, you can see that the UV coordinates of the disk mesh is based on the orthogonal coordinate system, \[R, G, B\] = \[U, V, 0\]. Therefore, we have to convert the UV coordinates of the mesh from the orthogonal to polar coordinates.

<img class="image640" referrerpolicy="no-referrer" src="https://i.imgur.com/jjDaOHH.png">

The below convert the orthogonal coordinates into polar coordinates, i.e., vertices at outer boundary of disc have a value of 1, while the value of vertices at inner boundary is 0.
```js
const pos = geometry_ring.attributes.position;
const mid_point = 0.5 * (1.3 + 2.2);
let v3 = new THREE.Vector3();
for (let i = 0; i < pos.count; ++i){
  v3.fromBufferAttribute(pos, i);
  geometry_ring.attributes.uv.setXY(i, v3.length() < mid_point ? 0 : 1, 0);
}
```
After setting a new value for geometry of ring, the UV coordinates of mesh gets corrected as below.

<img class="image640" referrerpolicy="no-referrer" src="https://i.imgur.com/f2s7KdA.png">

Then, Saturn ring is rendered as shown here.

<img class="image640" referrerpolicy="no-referrer" src="https://i.imgur.com/OZ3oUya.png">

## Shadow cast by rings
In order to render shadow on Saturn's surface cast by rings, I've added supplementary uniform variables at the material of Saturn body.
```js
const material_saturn = new THREE.ShaderMaterial({
  uniforms: {
    u_dayTexture: { value: new THREE.TextureLoader().load( './assets/saturnmap.jpg') },
    u_sunRelPosition: { value: new THREE.Vector3(0,0,0)},
    u_position: { value: new THREE.Vector3(0,0,0)},
    u_sunRadius: { value: 0.2},

    // added variables
    u_alphaTexture: { value: new THREE.TextureLoader().load( 'assets/saturnringpattern.png') },
    u_ringNormal: { value: new THREE.Vector3(0,1,0) },
    u_radius1: { value: 0.2 * 1.3 },
    u_radius2: { value: 0.2 * 2.2 },
  },
  vertexShader: vertex,
  fragmentShader: fragment,
})
```

`u_alphaTexture` is an alpha map texture of rings, `u_ringNormal` is the normal vector of a plane on which rings lie, `u_radius1` and `u_radius2` are the inner and outer absolute radius of rings disc, where 0.2 is the radius of Saturn, and 1.3 and 2.2 are the inner and outer radius of Saturn rings disc, respectively. 

Using `u_ringNormal`, $$\mathbf{n}$$, `u_position`, $$\mathbf{p}_o$$, and an assumption that the center of rings is equal to the position of the main body, the plane equation of rings is

$$
\mathbf{n} \cdot (\mathbf{x} - \mathbf{p}_o) = 0.
$$

For a point on the surface of main body, $$\mathbf{p}_s$$, the line equation passing the origin of Sun, $$\mathbf{p}_{\rm sun}$$ and the surface point is

$$
\mathbf{x} = \mathbf{p}_s + (\mathbf{p}_{\rm sun} - \mathbf{p}_o) * t, ~t > 0.
$$

Then, the intersection point between the above plane and line, $$x_p$$, satisfies

$$
\mathbf{x}_p = \mathbf{p}_s + (\mathbf{p}_{\rm sun} - \mathbf{p}_o) * t_p
$$

and

$$
\mathbf{n} \cdot (\mathbf{p}_s + (\mathbf{p}_{\rm sun} - \mathbf{p}_o) * t_p - \mathbf{p}_o) = 0.
$$

When solving $$t_p$$, we obtain

$$
t_p = - \frac{\mathbf{n}\cdot (\mathbf{p}_s - \mathbf{p}_o)}{\mathbf{n}\cdot (\mathbf{p}_{\rm sun} - \mathbf{p}_o)}.
$$

For $$t_p > 0$$, the intersection point is

$$
\mathbf{x}_p = \mathbf{p}_s - (\mathbf{p}_{\rm sun} - \mathbf{p}_o) * \frac{\mathbf{n}\cdot (\mathbf{p}_s - \mathbf{p}_o)}{\mathbf{n}\cdot (\mathbf{p}_{\rm sun} - \mathbf{p}_o)}.
$$

Next, to determine whether the intersection point lies on the rings, I've compared the distance of the point, $$d$$ with the inner and outer radius of rings. 

$$
d = ||(\mathbf{x}_p - \mathbf{p}_o)||_2
$$

If $$d$$ is larger than the inner radius and smaller than the outer radius, we can obtain the strength of shadow, `ringAlpha`, cast by rings:

```glsl
vec3 surfacePosition = u_position + vPosition;
float s = -dot(u_ringNormal, surfacePosition - u_position) / dot(u_ringNormal, sunDir);
if (s > 0.) {
  vec3 point = surfacePosition + sunDir * s;
  float alphaRatio = (sqrt(dot(point - u_position, point - u_position)) - u_radius1) / (u_radius2 - u_radius1);
  if (alphaRatio > 0. && alphaRatio < 1.) {
    float ringAlpha = texture2D(u_alphaTexture, vec2(alphaRatio, 1.0) ).r;
    mixAmountSurface *= (1. - 0.8 * ringAlpha * hemisphereLight); // apply rings shadow
  }
}
```

Finally, the realistic Saturn is here:

<img class="image640" referrerpolicy="no-referrer" src="https://i.imgur.com/nyK5N78.png">

## Shadow cast by rings (advanced)
Since I've computed eclipse shadow effect with precise mathematics, the shadow on rings cast by main body becomes blurred as the light source gets closer or larger. 

|           distant light source           |          close light source          |
|:------------------------------------:|:------------------------------------:|
| <img class="image" referrerpolicy="no-referrer" src="https://i.imgur.com/fEx7NUB.gif"> | <img class="image" referrerpolicy="no-referrer" src="https://i.imgur.com/HWVxkNE.gif"> |

However, even when the apparent size of the light source differs, the boundary of the shadow on main body's surface cast by the rings remains sharp and clear. To make its boundary more realistic, I've divided the light source into several areas along with the normal vector of the ring plane, and computed a shading factor for each subdivision. The below figure summarizes this method. 

<img class="image640" referrerpolicy="no-referrer" src="https://i.imgur.com/aFd7fu2.jpeg">

The axis of subdivision is perpendicular to the sun direction, and lies along with the normal vector of ring plane. In mathematics, it can be derived by

$$
\mathbf{v}_{\rm sun,perp} = \rm{arg}\max_{\mathbf{v}} (\mathbf{v} \cdot \mathbf{n}_{ring})
$$

such that

$$
\mathbf{v} \cdot \mathbf{v}_{\rm sun} = 0, 
$$

where $$\mathbf{n}_{\rm ring}$$ is the normal vector of ring plane and $$\mathbf{v}_{\rm sun}$$ denotes the direction vector from the surface to the origin of Sun. Then, for $$i$$-th subdivision, $$\mathbf{v}_{\rm sunRay}=\mathbf{v}_{\rm sun}+(i/DIV * R_{\rm sun}) ~\mathbf{v}_{\rm sun,perp}$$ is obtained, where $$i$$ is an integer within $$-DIV, \ldots, DIV$$, and $$DIV$$ is a parameter for creating subdivision, i.e., a total number of subdivision is $$2 * DIV + 1$$. You can use a large value of $$DIV$$ to imitate an exact shadow effect. 

Because the width of subdivisions is different from each other, the shadow factor of each subdivision should be considered differently. In here, I've used the normalized width, $$\sqrt{1-(i/DIV)^2}$$, as a weight. Thus, a total shadow coefficient on a surface point of planet is the weighted sum of ring's alpha values. The below code is the additional part of fragment shader. 

```glsl
#define DIV 7

#if DIV == 0
  #define INV_DIV 1. // prevent nan
#else
  #define INV_DIV (1./float(DIV))
#endif

float eclipseByRings(vec3 surfacePosition, vec3 sunRadiusPerp) {
  float totalRingAlpha = 0.;
  for (int i = -DIV; i <= DIV; ++i) {
    vec3 sunRay = u_sunRelPosition + INV_DIV * float(i) * sunRadiusPerp;
    float weight = sqrt(1. - pow(float(i)*INV_DIV, 2.));
    float s = -dot(u_ringNormal, surfacePosition - u_position) / dot(u_ringNormal, sunRay);
    if (s > 0.) {
      vec3 point = surfacePosition + sunRay * s;
      float alphaRatio = (sqrt(dot(point - u_position, point - u_position)) - u_radius1) / (u_radius2 - u_radius1);
      if (alphaRatio > 0. && alphaRatio < 1.) {
        float ringAlpha = texture2D( u_alphaTexture, vec2(alphaRatio, 1.0) ).r;
        totalRingAlpha += ringAlpha * weight;
      }
    }
  }
  totalRingAlpha /= (2. * float(DIV) + 1.);
  return totalRingAlpha;
}
```

Therefore, the main function of the previous fragment shader becomes

```glsl
// 2. Shadow of rings
vec3 surfacePosition = u_position + vPosition;
vec3 sunRadiusPerp = u_ringNormal - dot(sunDir, u_ringNormal)/dot(sunDir, sunDir) * sunDir;
sunRadiusPerp = normalize(sunRadiusPerp) * u_sunRadius / length(u_sunRelPosition);
float ringAlpha = eclipseByRings(surfacePosition, sunRadiusPerp);
mixAmountSurface *= (1. - 0.8 * ringAlpha * hemisphereLight);
vec3 color = mix( vec3(0.), dayColor, mixAmountSurface ); // Select day or night texture based on mix.
```

Finally, you can see that the shadow cast by rings becomes blurry as the light source gets further away from the planet.

|           distant light source           |          close light source          |
|:------------------------------------:|:------------------------------------:|
| <img class="image" referrerpolicy="no-referrer" src="https://i.imgur.com/fEx7NUB.gif"> | <img class="image" referrerpolicy="no-referrer" src="https://i.imgur.com/0lIxHNB.gif"> |

[^earth]: [\[Three.js\] Create a Realistic Earth with Shaders](https://sangillee.com/2024-06-07-create-realistic-earth-with-shaders/)