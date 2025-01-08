---
title: "Noise Functions"
categories:
 - WebGL
tags:
 - glsl
 - webgl
 - shader
 - noise
header:
  teaser: /assets/image/thumbnail/simplex_noise.png
excerpt_separator: <!--more-->
---

> This article summarizes the fundamentals of well-known noise functions, for example, Value, Perlin, Simplex noises, and describes how to use them. 

<!--more-->

## Value noise
This is the simplest noise function using four random values per each vertex. As mentioned in here[^shaderpattern], GLSL does not support a true random function, but pseudo-random function. Thus, a vertex can read the random value of adjacent vertices from indexing, i.e., `random(x + vec2(1., 0.))`. By interpolating the value of four vertices, we can generate a noise value. To make the noise value smooth at the boundary, we can use `smoothstep()` or a custom stepper (timing) function. I'll address the interpolation methods in the upcoming article. Then, when you increase the scale of the input of the noise function, the resolution of the noise pattern will increase. 

```glsl
// Fragment
precision mediump float;

varying vec2 v_position;

float random (in vec2 x) {
    return fract(sin(dot(x, vec2(12.9898,54.233))) * 43758.5453123);
}

float noise (in vec2 x) {
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

void main() {
    vec2 st = v_position * 6.;
    float value = noise(st);
    
    gl_FragColor = vec4(vec3(value), 1.);
}
```

<img class="imageWideFull" referrerpolicy="no-referrer" src="https://i.imgur.com/DLSAFiz.png">

However, the result is so bricky, and this limitation would not be resolved by another interpolation method. 

## Perlin noise
A Perlin noise is suggested by Ken Perlin to represent the natural complexity while reducing blocky pattern. Contrary to the Value noise, Perlin noise generates a random vector at each vertex. First, compute four gradient vectors of adjacent vertices. Second, compute the dot product between each gradient vector and the offset vector from the corresponding vertex to candidate point. This dot product will be zero at corners, and it denotes the z value of the plane that intersects XY plane at corner and has a normal vector `n = (g_x, g_y, -1)` where `(g_x, g_y)` is the gradient vector. The final value of the candidate point is obtained by interpolating these four dot product values. At last, we can normalize the value by multiplying by 0.5 and adding 0.5. For a single cell, let me depict the dot product value of each gradient vector and compare the gradient vector of vertices and the vector field of the noise function. The color ranges from -5 (blue) to 5 (orange).

|               top-left               |              top-right               |
|:------------------------------------:|:------------------------------------:|
| <img class="image" referrerpolicy="no-referrer" src="https://i.imgur.com/6nD78SQ.png"> | <img class="image" referrerpolicy="no-referrer" src="https://i.imgur.com/d6LV5nc.png"> |

|             bottom-left              |             bottom-right             |
|:------------------------------------:|:------------------------------------:|
| <img class="image" referrerpolicy="no-referrer" src="https://i.imgur.com/2J1qZDP.png"> | <img class="image" referrerpolicy="no-referrer" src="https://i.imgur.com/vpuYKOs.png"> |

|  gradient vectors and noise result   |        gradient vector field         |
|:------------------------------------:|:------------------------------------:|
| <img class="image" referrerpolicy="no-referrer" src="https://i.imgur.com/t46aA6d.png"> | <img class="image" referrerpolicy="no-referrer" src="https://i.imgur.com/SE9RkJI.png"> |

The example code is shown below.

```glsl
// Fragment
precision mediump float;

varying vec2 v_position;

#define PI (3.141592)

float random (in vec2 x) {
    return fract(sin(dot(x, vec2(12.9898,54.233))) * 43758.5453123);
}

vec2 random2 (in vec2 x) {
    float theta = random(x) * 2. * PI;
    return vec2(cos(theta), sin(theta));
}

float Perlin (in vec2 x) {
    vec2 i = floor(x);
    vec2 f = fract(x);

    vec2 a = random2(i);
    vec2 b = random2(i + vec2(1., 0.));
    vec2 c = random2(i + vec2(0., 1.));
    vec2 d = random2(i + vec2(1., 1.));

    float va = dot(a, f);
    float vb = dot(b, f - vec2(1.,0.));
    float vc = dot(c, f - vec2(0.,1.));
    float vd = dot(d, f - vec2(1.,1.));

    vec2 u = smoothstep(0., 1., f);

    return 0.5 + 0.5 * mix(mix(va, vb, u.x), mix(vc, vd, u.x), u.y);
}

void main() {
    vec2 st = v_position * 6.;
    float value = Perlin(st);
    
    gl_FragColor = vec4(vec3(value), 1.);
}
```

<img class="imageWideFull" referrerpolicy="no-referrer" src="https://i.imgur.com/At2S8sU.png">

However, since the value of points are computed from gradient vectors, the value of all corners is zero. This characteristic of Perlin noise can cause directional artifacts. Depending on the condition, straight lines with values ​​near 0 can be seen. To resolve this issue, we can set the magnitude of gradient vector randomly,

```glsl
vec2 random2 (in vec2 x) {
    float magnitude = random(x * 12.34);
    float theta = random(x) * 2. * PI;
    return magnitude * vec2(cos(theta), sin(theta));
}
```

<img class="imageWideFull" referrerpolicy="no-referrer" src="https://i.imgur.com/czsW8FG.png">

or we can use the previous Value noise together. 
```glsl
void main() {
    vec2 st = v_position * 6.;
    float value = 0.2 * noise(st) + 0.8 * Perlin(st);
    
    gl_FragColor = vec4(vec3(value), 1.);
}
```

<img class="imageWideFull" referrerpolicy="no-referrer" src="https://i.imgur.com/wBYjM0K.png">

## Simplex noise
Simplex noise was introduced by Ken Perlin to reduce directional artifacts and computational complexity while preserving natural complexity quality. As shown in the above noise functions, the rectangle-based cell makes it easy to compute interpolation. But, Ken Perlin thought that the basic structure of 2D shape is a triangle. Also, tetrahedron (triangular pyramid) would be the simplest structure among 3D shapes. When we use triangles as a cell for noise, it is enough to compute three random values and interpolate them, while we have to use four values for rectangles. In 3D space, the number of computation will be four at tetrahedron or eight at cube. Therefore, in n-dimensional space, the computation complexity of Simplex noise is $$O(n\cdot(n+1))$$ due to (n+1) n-dimensional gradient vectors, meanwhile the computational complexity of Perlin noises is $$O(n\cdot2^n)$$. To implement simplex noise, there are four steps: coordinate skewing, simplicial subdivision, gradient selection, and kernel summation.[^wiki]

#### Coordinate skewing
A $$n$$-dimensional input coordinate is transformed using the below formula:

$$
\begin{align}
&x' = x + (x+y+\cdots) \cdot F,\\
&y' = y + (x+y+\cdots) \cdot F,\nonumber\\
&\cdots,\nonumber
\end{align}
$$

where

$$
F = \frac{\sqrt{n+1}-1}{n}.
$$

And the reverse formula is shown below.

$$
\begin{align}
&x = x' - (x'+y'+\cdots) \cdot G,\\
&y = y' - (x'+y'+\cdots) \cdot G,\nonumber\\
&\cdots,\nonumber
\end{align}
$$

where

$$
G = \frac{1-1/\sqrt{n+1}}{n}.
$$

The coordinate is squashed along its main diagonal direction until the distance between $$(0,0,\cdots,0)$$ and $$(1,0,\cdots,0)$$ becomes equal to the distance between $$(0,0,\cdots,0)$$ and $$(1,1,\cdots,1)$$. Let's derive the above formulas.

<img class="image240" referrerpolicy="no-referrer" src="https://i.imgur.com/HqCIIvZ.png">

The above figure shows the input coordinate, $$\{O\}$$, and skewed coordinate, $$\{S\}$$. For a point $$x'$$, 

$$
{}^O {\bf x'} = {}^O T_S \cdot {}^S {\bf x'},
$$

where $${}^O T_S$$ is a transformation matrix converting a point of skewed coordinate into the input coordinate. And, the matrix can be represented with a one variable as

$$
\begin{equation}
    {}^O T_S = 
    \left[\begin{matrix} 
        1-G & -G & \cdots & -G \\ 
        -G & 1-G & \cdots & -G \\
        \cdots & \cdots & \ddots & \vdots \\
        -G & -G & \cdots & 1-G \\
    \end{matrix}\right]
\end{equation}
$$

Then, the skewed coordinates should satisfy 

$$
||{}^O {\bf 0} - {}^O {\bf u'}|| = ||{}^O {\bf 0} - {}^O {\bf x'}||.
$$

This is represented in the skewed coordinate as

$$
||{}^O T_S {}^S {\bf 0} - {}^O T_S {}^S {\bf u'}|| = ||{}^O T_S {}^S {\bf 0} - {}^O T_S {}^S {\bf x'}||.
$$

Then,

$$
||(1-G, -G, \cdots, -G)^T|| = ||(1-nG,1-nG,\cdots,1-nG)^T||
$$

is satisfied, since $${}^S {\bf u'} = (1,0,\cdots,0)^T$$ and $${}^S {\bf x'} = (1,1,\cdots, 1)^T$$.
From the above equation, 

$$
\begin{align}
(1-G)^2 + (n-1) \cdot G^2 &= (1-n \cdot G)^2 \cdot n \\
1 - 2\cdot G + G^2 + (n-1)\cdot G^2 &= n - 2 n^2 G + n^3 G^2 \nonumber\\
(n^3-n)\cdot G^2-2\cdot(n^2-1)\cdot G+(n-1) &= 0 \nonumber\\
n(n+1)\cdot G^2 - 2\cdot (n+1) \cdot G + 1 &= 0 \nonumber\\
\end{align}
$$

Therefore, 

$$
\begin{align}
G &= \frac{(n+1)-\sqrt{(n+1)^2 - n(n+1)}}{n(n+1)} \nonumber\\
&= \frac{1-1/\sqrt{n+1}}{n}.
\end{align}
$$

In order to compute the reverse formula, let's define $${}^S T_O$$ as

$$
\begin{equation}
    {}^S T_O = 
    \left[\begin{matrix} 
        1+F & F & \cdots & F \\ 
        F & 1+F & \cdots & F \\
        \cdots & \cdots & \ddots & \vdots \\
        F & F & \cdots & 1+F \\
    \end{matrix}\right]
\end{equation}
$$

The matrix should satisfy

$$
{}^S T_O \cdot {}^O {\bf x} = {}^S {\bf x}
$$

for an arbitrary $$n$$-dimensional point $${}^S {\bf x}=(x_0, x_1, \cdots, x_{n-1})^T$$. Then, $${}^O {\bf x}$$ is derived as below by $${}^O T_S$$:

$$
\begin{equation}
    {}^O {\bf x} = 
    \left(\begin{matrix} 
        x_0 - (x_0 + x_1 + \cdots + x_{n-1}) \cdot G \\ 
        x_1 - (x_0 + x_1 + \cdots + x_{n-1}) \cdot G \\
        \vdots \\
        x_{n-1} - (x_0 + x_1 + \cdots + x_{n-1}) \cdot G \\
    \end{matrix}\right)
\end{equation}
$$

When focusing the $$i$$-th element of the point $$\bf{x}$$, the below is satisfied.

$$
\begin{align}
    x_i &= (x_i - (\Sigma_i x_i) \cdot G)\cdot (1+F) + \Sigma_{j\neq i} \left(x_j - (\Sigma_i x_i)\cdot G\right)\cdot F \\
    x_i &= x_i + F \cdot \Sigma_i x_i - (\Sigma_i x_i)\cdot G\cdot (1+F) - (n-1)\cdot (\Sigma_i x_i) \cdot G \cdot F \nonumber \nonumber\\
    0 &= F \cdot \Sigma_i x_i - (\Sigma_i x_i)\cdot G - n \cdot (\Sigma_i x_i)\cdot G \cdot F \nonumber\\
    0 & = F - G - n \cdot G \cdot F \nonumber\\
\end{align}
$$

Therefore,

$$
\begin{align}
    F &= \frac{G}{1-n \cdot G} \\
    &= \frac{\sqrt{n+1} - 1}{n}. \nonumber \\
\end{align}
$$

In shader, `x_skew` is a point in the skewed coordinate, `x_orig` is the origin of the corresponding cell in the input coordinate, and `x0` denotes the internal coordinate inside the cell.
```glsl
const float F = 0.5 * (1.7320508076 - 1.);
const float G = 0.5 * (1. - 1./1.7320508076);
  
vec2 x_skew = st + dot(vec2(F), st);
vec2 i0 = floor(x_skew);
vec2 x_orig = i0 - dot(i0, vec2(G));
vec2 x0 = st - x_orig;
```

#### Simplicial subdivision

The below figure shows a total of six simplices in the three-dimensional coordinate. Among the $$n!$$ combinations, there are $$n\cdot(n-1)$$ simplices that include $${}^S (0,0,\cdots,0)$$ and $${}^S (1,1,\cdots,1)$$. 

|              x > y > z               |              y > x > z               |              z > x > y               |
|:------------------------------------:|:------------------------------------:|:------------------------------------:|
| <img class="image" referrerpolicy="no-referrer" src="https://i.imgur.com/tdpDDxH.png"> | <img class="image" referrerpolicy="no-referrer" src="https://i.imgur.com/m8lKwxh.png"> | <img class="image" referrerpolicy="no-referrer" src="https://i.imgur.com/xK4fTIg.png"> |

|              x > z > y               |              y > z > x               |              z > y > x               |
|:------------------------------------:|:------------------------------------:|:------------------------------------:|
| <img class="image" referrerpolicy="no-referrer" src="https://i.imgur.com/2EaTKea.png"> | <img class="image" referrerpolicy="no-referrer" src="https://i.imgur.com/l2NN4dv.png"> | <img class="image" referrerpolicy="no-referrer" src="https://i.imgur.com/mWkHXNi.png"> |

For an arbitrary point, it is possible to determine which simplex it belongs to according to the size order of each element. In the below code, I've only compared the magnitude of `x0.x` and `x0.y` since there are two simplices in the two-dimensional coordinate. Then, the position `i1` in the input coordinate is `i1 - vec2(G)` and the position `i2` in the input coordinate is `i2 - 2.0 * vec2(G)`. Thus, `x1` and `x2` denote the unskewed displacement vector from each vertex.

```glsl
vec2 i1 = vec2(0.0);
if (x0.x > x0.y) {
    i1 = vec2(1.0, 0.0);
} else {
    i1 = vec2(0.0, 1.0);
}
vec2 x1 = x0 - (i1 - vec2(G));
vec2 x2 = x0 - (vec2(1.0) - 2.0 * vec2(G));
```

#### Gradient selection
Likewise the above classic Perlin noise, I've generated a pseudo-random gradient vectors for each vertex.
```glsl
vec2 g0 = random2(i0);
vec2 g1 = random2(i0 + i1);
vec2 g2 = random2(i0 + vec2(1.0));
```

#### Kernel summation
Finally, compute the extrapolated value from summing the contributions of each vertex as below:
```glsl
vec3 t = max(0.5 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
t = t*t*t*t;

return 50.0 * dot(t, vec3(dot(x0, g0), dot(x1, g1), dot(x2, g2))) + 0.5;
```

A total code is here.
```glsl
precision mediump float;

varying vec2 v_position;

#define PI (3.141592)

float random (in vec2 x) {
    return fract(sin(dot(x, vec2(12.9898,54.233))) * 43758.5453123);
}

vec2 random2 (in vec2 x) {
    float magnitude = random(x * 142.214);
    float theta = random(x) * 2. * PI;
    return magnitude * vec2(cos(theta), sin(theta));
}

float simplex (vec2 st) {
    const float F = 0.5 * (1.7320508076 - 1.);
    const float G = 0.5 * (1. - 1./1.7320508076);

    vec2 x_skew = st + dot(vec2(F), st);
    vec2 i0 = floor(x_skew);
    vec2 x0 = st - (i0 - dot(i0, vec2(G)));

    vec2 i1 = vec2(0.0);
    if (x0.x > x0.y) {
        i1 = vec2(1.0, 0.0);
    } else {
        i1 = vec2(0.0, 1.0);
    }
    vec2 x1 = x0 - i1 + vec2(G);
    vec2 x2 = x0 - vec2(1.0) + 2.0 * vec2(G);

    vec2 g0 = random2(i0);
    vec2 g1 = random2(i0 + i1);
    vec2 g2 = random2(i0 + vec2(1.0));

    vec3 t = max(0.5 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
    t = t*t*t*t;

    return 30.0 * dot(t, vec3(dot(x0, g0), dot(x1, g1), dot(x2, g2))) + 0.5;
}

void main() {
    vec2 st = v_position * 6.;
    float value = Perlin(st);
    
    gl_FragColor = vec4(vec3(value), 1.);
}
```

This is a result.

<img class="imageWideFull" referrerpolicy="no-referrer" src="https://i.imgur.com/sTfBGZF.png">


[^wiki]: [Simplex noise](https://en.m.wikipedia.org/wiki/Simplex_noise)
[^shaderpattern]: [\[WebGL\] Shader Design Patterns](https://sangillee.com/2024-05-25-shader-design-patterns/)