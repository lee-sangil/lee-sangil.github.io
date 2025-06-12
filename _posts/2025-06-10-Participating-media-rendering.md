---
title: "Implementing Volume Rendering in GLSL"
prefix: "WebGL"
categories:
 - WebGL
tags:
 - glsl
 - webgl
 - shader
 - raymarching
 - sdf
 - reflection
 - refraction
 - diffusion
 - fresnel
 - snell

header:
  teaser: /assets/image/thumbnail/2025-06-10-Participating-media-rendering.jpeg
excerpt_separator: <!--more-->
---

> In the previous article, I explained how to render solid objects using the ray marching method. However, since the ray stops marching at the boundary of the object, it cannot successfully render translucent or transparent objects. This article delves into the ray marching method for a generalized object, such as glass, incorporating fundamental optical physics. This technique is also known as volume rendering or participating media rendering. 

## Translucent object
To represent the color of an arbitrary object, it’s a good starting point to calculate a translucent color. Once we have that, it becomes straightforward to depict a transparent or opaque object by simply adjusting the opacity parameter.

### Color and opacity
Firstly, we define the color and opacity (or density in NERF and optical density in Beer-Lambert law) of an object. The `get_color` function outputs the RGB color of a point within the object, while the `get_density` function returns a positive value. A zero density indicates transparency, while a high density signifies opaqueness. This definition closely follows the Beer-Lambert law, where density determines how much light is absorbed per unit distance. It allows us to simulate realistic light attenuation through media like fog, smoke, or glass.

```glsl
vec3 get_color(in vec3 p) {
  if (get_sphere_dist(p) < 0.0) return vec3(0.8, 0.9, 1.0);
  if (get_plane_dist(p) < 0.0) return texture(u_texture, fract(0.1*p.xz)).rgb;
  return vec3(1.2, 1.3, 1.5); // atmosphere color
}

float get_density(vec3 p) {
  if (get_sphere_dist(p) < 0.0) return 0.15;
  if (get_plane_dist(p) < 0.0) return 10.0;
  return 0.;
}
```

The `get_sphere_dist()` and `get_plane_dist()` functions calculate the signed distance (SDF) of a sphere and a plane, respectively.

```glsl
float get_plane_dist(in vec3 p) {
  return p.y + 1.2;
}

float get_sphere_dist(in vec3 p) {
  vec4 s = vec4(0, 0, 0, 1);
  return length(p - s.xyz) - s.w;
}
```

### Ray sampling

<img class="image640" referrerpolicy="no-referrer" src="https://i.imgur.com/okYS3sV.jpeg">

Next, we sample points along the ray. If a point lies outside surfaces, it moves forward by the value of the SDF. Conversely, if a point is close to or inside surfaces, i.e., `SDF(p) <= SAMPLE_DIST`, the point moves forward by a fixed step, `SAMPLE_DIST`. This heuristic helps balance performance and visual fidelity. Using a small step size ensures smooth transitions and accurate shading but increases computation time.

```glsl
vec3 p = ro + rd * d;
float ds = SDF(p);

if (ds > SAMPLE_DIST)
  d += ds;
else
  d += SAMPLE_DIST;
```

Then, according to Beer-Lambert’s law, we sum the color of samples with their density as a weight; `density * SAMPLE_DIST`. As the ray traverses inside the object, it loses energy due to absorption and/or scattering. Consequently, we update the `transmittance` parameter as the ray passes through the object by multiplying it with `exp(-density * SAMPLE_DIST)`. The farther a point is from the surface of an object, the weaker its ability to express color becomes. For example, if a point is `2*SAMPLE_DIST` below the surface, the transmittance of a light at that point decreases by `exp(-density*SAMPLE_DIST)*exp(-density*SAMPLE_DIST)=exp(-density*2*SAMPLE_DIST)` compared to the transmittance at the surface. Given a specific ray and `N` samples, the above computation can be expressed as

$$
\begin{align}
C(\bf r) &= \sum_{i=1}^N {T_i (1-\exp(-\sigma_i \delta_i)) {\bf c}_i}, \\\nonumber
T_i &= \exp(-\sum_{j=1}^{i-1}{\sigma_j \delta_i}),
\end{align}
$$

where $${\bf c}_i$$ represents the color of the $$i$$-th sample, $$\sigma_i$$ denotes its density, $$\delta_i$$ is the distance between adjacent samples, and $$T_i$$ indicates the transmitted intensity of light originating from the $$i$$-th sample.

```glsl
vec3 compute_color(in vec3 ro, in vec3 rd) {
  vec3 c = vec3(0.);
  float transmittance = 1.;
  float d = 0.;
  for (int i = 0; i < MAX_STEPS; ++i) {
    vec3 p = ro + rd * d;
    float ds = SDF(p);
    vec3 color = get_color(p);
    float density = get_density(p);
    
    if (ds > SAMPLE_DIST)
      d += ds;
    else
      d += SAMPLE_DIST;

    c += color * (1. - exp(-density * SAMPLE_DIST)) * transmittance;
    transmittance *= exp(-density * SAMPLE_DIST);
    
    if (transmittance < 0.01 || d > MAX_DIST) break;
  }
  return c;
}
```

### Light attenuation
In the computation above, the color of a deeper point has a lesser impact on the final rendering because the light scattered at the point loses its energy as it traverses the interior of the object. However, we should also consider the intensity of light, which is inputted at the point. If the point is beneath the surface, not only does the color of the point decrease, but the intensity of the light also decreases. The attenuated intensity of light at a point, $$p$$, is computed as

```glsl
float compute_intensity(in vec3 p) {
  vec3 l = get_light(); // light position
  vec3 ld = normalize(l - p); // light direction

  vec3 q = p;
  float intensity = 15.; // initial intensity
  for (int i = 0; i < MAX_STEPS; ++i) {
    float ds = SDF(q);
    float density = get_optical_density(q);

    float step_size;
    if (ds > 0.0)
      step_size = ds;
    else
      step_size = SAMPLE_DIST;

    q += step_size * ld;
    intensity *= exp(-density * step_size);

    if (dot(l - p, l - q) < 0.0 || intensity < 0.01)
      break;
  }
  return intensity;
}
```

The initial light intensity is manually set to `15.0`. A ray travels from the given point to the lighting source. When it passes through the source, it stops marching. After applying the above function, `compute_color()` is revised as

```glsl
vec3 compute_color(in vec3 ro, in vec3 rd) {
  vec3 c = vec3(0.);
  float d = 0.;
  float transmittance = 1.0; // RENAMED
  for (int i = 0; i < MAX_STEPS; ++i) {
    vec3 p = ro + rd * d;
    float ds = SDF(p);
    vec3 color = get_color(p);
    float density = get_density(p);
    float intensity = compute_intensity(p); // CHANGED
    
    if (ds > SAMPLE_DIST)
      d += ds;
    else
      d += SAMPLE_DIST;

    c += color * (1. - exp(-density * SAMPLE_DIST)) * intensity * transmittance;
    transmittance *= exp(-density * SAMPLE_DIST);
    
    if (transmittance < 0.01 || d > MAX_DIST) break;
  }
  return c;
}
```

|      constant lighting       |     attenuated lighting      |
|:------------------------------------:|:------------------------------------:|
| <img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/V8FB82u.png"> | <img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/PMJY1pC.png"> |

### Jittering
Inside an object, a ray moves with a fixed step size, `SAMPLE_DIST`. However, if this step size is not sufficiently small compared to the object’s scale, a color banding artifact appears. To mitigate this undesirable effect, the ray’s step size is randomized instead of being fixed. 

```glsl
if (ds > SAMPLE_DIST)
  step_size = ds;
else
  step_size = SAMPLE_DIST * (hash13(q) + 0.5); // Instead of SAMPLE_DIST
```

## Refraction

When light encounters a boundary between materials with different densities, its direction is bent, a phenomenon known as refraction. This bending is governed by Snell’s law, which establishes the relationship between the angles of incidence and refraction.

$$
n_1 \sin(\theta_1) = n_2 \sin(\theta_2),
$$
where $$n_1$$ and $$n_2$$ are the refractive indices of each material, meaning they are the scaling factors that decrease the speed of light compared to its speed in a vacuum.

In GLSL, we can utilize the built-in function `refract()`. Alternatively, we can implement the function using vector operations. `I` and `N` represent the incidence and normal unit vectors, respectively, and `eta` denotes the ratio of the refractive indices of two materials, $$(n_2/n_1)$$. 

```glsl
vec3 refract(vec3 I, vec3 N, float eta) {
  k = 1.0 - eta * eta * (1.0 - dot(N, I) * dot(N, I));
  if (k < 0.0)
    T = NaN; // total internal reflection
  else
    T = eta * I - (eta * dot(N, I) + sqrt(k)) * N;
  return T;
}
```

The above formula can be derived as follows. 

<img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/qRS68PK.jpeg">

Given the incidence unit vector, $$\hat{I}$$, the normal unit vector, $$\hat{N}$$, and the ratio of refractive indices, $$\eta$$, the refraction unit vector, $$\hat{T}$$, can be decomposed into two vectors: $$\sin(\theta_t)\hat{M}$$ and $$-\cos(\theta_t)\hat{N}$$. Here, $$\hat{M}$$ is a unit vector perpendicular to both $$\hat{N}$$ and the cross product of $$\hat{I}$$ and $$\hat{N}$$.  $$\hat{M}$$ can be derived from $$(\hat{I} + \cos(\theta_i) \hat{N}) / \sin(\theta_i)$$, thus

$$
\begin{align}
  \hat{T} &= \sin(\theta_t)\hat{M} - \cos(\theta_t)\hat{N} \nonumber\\
  &= \eta (\hat{I} + \cos(\theta_i) \hat{N}) - \cos(\theta_t) \hat{N}, \\
\end{align}
$$

where $$\eta = {\sin(\theta_t)}/{\sin(\theta_i)} = n_i/n_r$$.  By substituting $$\cos(\theta_i)$$ with $$(-\hat{I} \cdot \hat{N})$$ and $$\cos(\theta_t)$$ with $$\sqrt{1-\sin(\theta_t)^2}$$,

$$
\begin{align}
  \hat{T} &= \eta (\hat{I} - (\hat{I} \cdot \hat{N}) \hat{N}) - \cos(\theta_t) \hat{N} \nonumber \\
  &= \eta (\hat{I} - (\hat{I} \cdot \hat{N}) \hat{N}) - \sqrt{1-\sin(\theta_t)^2} \hat{N} \nonumber \\
  &= \eta (\hat{I} - (\hat{I} \cdot \hat{N}) \hat{N}) - \sqrt{1-\eta^2 \sin(\theta_i)^2} \hat{N} \nonumber \\
  &= \eta (\hat{I} - (\hat{I} \cdot \hat{N}) \hat{N}) - \sqrt{1-\eta^2 (1-(\hat{I}\cdot \hat{N})^2)} \hat{N} \\
  &= \eta \hat{I} - \left( \eta (\hat{I} \cdot \hat{N}) + \sqrt{1-\eta^2 (1-(\hat{I}\cdot \hat{N})^2)} \right) \hat{N}. \\
\end{align}
$$

### Internal reflection

At the same time, some of the light is reflected off the surface. This phenomenon is particularly evident when the incidence angle increases, leading to the occurrence of total internal reflection at a specific incidence angle. This threshold angle is determined by the ratio of the refractive indices, $$\eta$$. The internal reflection process will be further discussed in this article, with a special emphasis on the Fresnel effect.  

|     $$\eta = 1.3$$ (water)     |     $$\eta = 1.5$$ (glass)     |
|:------------------------------------:|:------------------------------------:|
| <img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/Pc0w4Vs.png"> | <img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/hvXGnSY.png"> |

## Reflection

 For a non-black body, there are reflections, including diffusion and specular reflection. These reflections alter the color of light based on the surface’s characteristics, significantly impacting the rendering result. In this chapter, I’ll theoretically describe specular reflection in advance, while diffusion will be explained in the subsequent chapter. 
 
### Specular reflection

<img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/L9oAOl1.jpeg">

Contrary to the principle of refraction, computing the reflection unit vector, $$\hat{R}$$, from the incidence unit vector, $$\hat{I}$$, and the normal unit vector, $$\hat{N}$$, is straightforward. By following the principle of reflection, we simply reverse the direction of the components of the incidence vector that are parallel to the normal vector. This can be achieved using the formula $$\hat{R} = \hat{I} - 2(\hat{I} \cdot \hat{N}) \hat{N}$$.

```glsl
vec3 reflect(vec3 I, vec3 N) {
  R = I - 2.0 * dot(I, N) * N;
  return R;
}
```

### Fresnel effect

The reflectance of a surface between dielectric materials varies with the incidence angle. As the angle approaches 90 degrees, the reflectance increases and reaches 1. In this article, I’ve used Schlick’s approximation to calculate the Fresnel reflectance coefficient.

```glsl
float compute_fresnel_reflectance(float eta, float u, float f0, float f90) {
  if (f0 == 0.0) return 0.0; // non-reflective

  float r0 = (eta - 1.) / (eta + 1.);
  r0 = r0 * r0;

  if (eta > 1.0) { // strike the surface of less dense medium
    float sin_refract = eta * sqrt(1. - u*u);
    if (sin_refract >= 1.0) return 1.0; // total internal reflection
    u = sqrt(1.0 - sin_refract*sin_refract);
  }

  float r = mix(r0, 1., pow(1. - u, 5.0));
  return mix(f0, f90, r);
}
```

|      w/o Fresnel effect      |      w/ Fresnel effect       |
|:------------------------------------:|:------------------------------------:|
| <img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/wvevawS.png"> | <img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/dPEKc7T.png"> |

## Diffusion

|     Lambertian diffusion      |     randomized normal vector    |
|:-------------------------------------:|:-------------------------------------:|
| <img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/PLb0gRr.jpeg"> | <img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/6gbdxI9.jpeg"> |

In the real world, most materials have a rough surface, causing the reflected and refracted light to spread. This is because the normal vectors on the local surface are inconsistent and random. To simulate this randomness, I computed the reflection and refraction vectors using a randomly generated normal vector that follows a Gaussian distribution with a variance determined by the roughness of the surface. Additionally, to handle multiple rays split by reflection and refraction, I used a queue structure to store information about each ray, including its position, direction, color, transmittance, and traveled distance. 

```glsl
struct Ray {
  vec3 origin; // ray origin
  vec3 direction; // ray direction
  vec3 color; // ray color
  float transmittance; // transmittance
  float dist; // distance travelled before
};
Ray rays[NUM_RAYS];
int n_rays = 0; // number of rays
```

Whenever a ray is reflected or refracted specularly or diffusely, a ray starting from the division point is added to the queue. Finally, rendering the result involves summing the colors of the rays in the queue. 

```glsl
for (int i = 0; i < n_rays; ++i) {
  Ray ray = rays[i];
  vec3 p = ray.origin;
  vec3 v = ray.direction;
  vec3 c = ray.color;
  float t = ray.transmittance;
  float d = ray.dist;

  if (d > MAX_DIST) continue; // skip if distance exceeds max distance
  if (t < MIN_TRNASMITTANCE) continue; // skip if transmittance is too low

  color += compute_color_along_ray(p, v, c, t, d);
}
return color;
```

To mimic diffusion lighting, I used Lambertian reflection law. It states that the reflected light’s power is proportional to the cosine between the surface normal and the light direction, `max(0., dot(normalize(l - q), n))`, and the reflected direction, `dot(v_diffuse, n)`. 

```glsl
rand_vec = normalize(hash33(q) - 0.5); // random unit vector
vec3 v_diffuse = normalize(n + rand_vec); // random unit vector on the hemisphere
v_diffuse *= dot(v_diffuse, n); // cosine weighted
float diffuse_intensity = 0.2 * max(0., dot(normalize(l - q), n));
rays[n_rays++] = Ray(q + SURF_DIST * n, v_diffuse, l_color * color, diffuse_intensity * transmittance * (1. - get_specular(q)), dist_before + dist);
```

### Diffused refraction

In a similar manner to the above method, I generated a random vector and added it to the normal vector. Subsequently, I computed the refracted vector and added a new ray originating from the surface point to the queue. 

```glsl
// diffuse refraction
rand_vec = normalize(hash33(q) - 0.5); // random unit vector
vec3 v_refract = refract(v, normalize(n + get_roughness(p, q) * rand_vec), ri / ri_new);
rays[n_rays++] = Ray(q, v_refract, l_color, (1. - reflectance) * transmittance, dist_before + dist);
```

### Diffused reflection

Similarly, I generated a random vector and corrupted the normal vector. Subsequently, the reflected ray is added to the queue.

```glsl
vec3 rand_vec = normalize(hash33(q) - 0.5); // random unit vector
vec3 v_reflect = reflect(v, normalize(n + get_roughness(p, q) * rand_vec)); // random normal vector
rays[n_rays++] = Ray(q + SURF_DIST * v_reflect, v_reflect, l_color * color, reflectance * transmittance * get_specular(q), dist_before + dist);
```

|      w/o diffusion       |       w/ diffusion       |
|:------------------------------------:|:------------------------------------:|
| <img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/AQW3erk.png"> | <img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/WiNpv6A.png"> |

The result above is available on [Shadertoy](https://www.shadertoy.com/view/wctSD7), and you can also adjust the material properties. Here are some examples.

|        opaque        |       mirror-like        |
|:------------------------------------:|:------------------------------------:|
| <img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/PmBqtS1.png"> | <img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/aeJWzDr.png"> |

## References
- [blog.demofox.org](https://blog.demofox.org/2020/05/25/casual-shadertoy-path-tracing-1-basic-camera-diffuse-emissive/)
- [scratchapixel.com](https://www.scratchapixel.com/lessons/3d-basic-rendering/volume-rendering-for-developers/intro-volume-rendering.html)