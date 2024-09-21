---
title: "Interpolation Methods"
categories:
 - WebGL
tags:
 - glsl
 - webgl
 - shader
 - interpolation
header:
  teaser: /assets/image/thumbnail/interpolation.jpg
excerpt_separator: <!--more-->
---

> This article provides an overview of interpolation methods including flat, linear, and cubic, along with examples. I'll provide a simple example to use them. These interpolation methods aim to compute a value inside vertices and, further, advanced interpolation methods aim to make smooth value changes anywhere. Especially, it is important to make cell boundaries smooth when generating noise functions[^noise].

<!--more-->

## Flat
This is the simplest method for filling values inside predefined values. In this method, the value between two points remains constant until the next data point is reached. For example, in GLSL, a noise function using flat interpolation can be written as
```glsl
float random (in vec2 x) {
  return fract(sin(dot(x, vec2(12.9898,54.233))) * 43758.5453123);
}

float noiseFlat (in vec2 x) {
  return random(floor(x));
}

void main() {
  vec2 st = v_position * 6.;
  float value = noiseFlat(st);
  gl_FragColor = vec4(vec3(value), 1.);
}
```

However, this method results in discontinuities at the data points unless successive points have the same value.

## Linear
Contrary to flat interpolation, linear interpolation can provide continuity. Given a point, the distance of a vertex from the point determines its contribution to the point. Then, the normalized contribution, `t`, is used to compute an interpolated value. When `t=0`, the interpolation function yields `x`, in case of `t=1`, `y` is outputted. This nature is the same for all interpolation methods. In here, the value of contribution, `t`, is proportional to the distance from the `x`, i.e., `0`. This is implemented in the following code
```c
float interp(float x, float y, float t) {
    return x + (y - x) * t;
}
```

In GLSL, a noise function using linear interpolation can be written as
```glsl
float noiseLinear (in vec2 x) {
  vec2 i = floor(x);
  vec2 f = fract(x);

  float tl = random(i); // top-left corner
  float tr = random(i + vec2(1.0, 0.0)); // top-right corner
  float bl = random(i + vec2(0.0, 1.0)); // bottom-left corner
  float br = random(i + vec2(1.0, 1.0)); // bottom-right corner

  return mix(mix(tl, tr, f.x), mix(bl, br, f.x), f.y);
}
```

The below figure shows flat, linear, and cubic interpolation results for given several points in a one-dimensional axis. A cubic interpolation will be discussed in the next section.

<img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/jXqoQjv.png">

As shown in the above figure, flat interpolation method shows discontinuities at the data points. Linear interpolation has a continuous curve, but its slope is discontinuous at data points. On the other hand, cubic interpolation shows continuity both in itself and in its derivatives. The following cubic interpolation method additionally aims to smoothen interpolation function at these points. 

## Cubic
When the degree of polynomial equation increases, we can adjust the shape of its curve flexibly. In case of the above linear interpolation, it can only satisfy two equations at the given two points:

$$
\begin{align}
f(0) = x, \nonumber\\
f(1) = y,
\end{align}
$$

where

$$
f(t) = a_1 t + a_0.
$$

Two parameters of linear equation are not enough to manipulate their slopes. Unlike linear interpolation, cubic interpolation can satisfy more conditions. Since cubic equations have four parameters, so we can adjust the slope of both endpoints. 

Let a cubic equation be:

$$
f(t) = a_3 t^3 + a_2 t^2 + a_1 t + a_0.
$$

Then, the value of cubic equation and its derivatives at two points are as below. 

$$
\begin{align}
f(0) &= a_0, \nonumber\\
f(1) &= a_3 + a_2 + a_1 + a_0, \nonumber\\
f'(0) &= a_1, \nonumber\\
f'(1) &= 3 a_3 + 2 a_2 + a_1. \nonumber
\end{align}
$$

To intersect two points and smoothen its curve at them, let the slope be zero. Then,

$$
\begin{align}
a_0 &= x, \nonumber \\
a_3 + a_2 + a_1 + a_0 &= y \nonumber \\
a_1 &= 0, \nonumber \\
3 a_3 + 2 a_2 + a_1 &= 0
\end{align}
$$

are satisfied. Thus, we can obtain

$$
\begin{align}
a_0 &= x,\nonumber \\
a_1 &= 0,\nonumber \\
a_2 &= 3 (y - x),\nonumber \\
a_3 &= -2 (y - x),
\end{align}
$$

and

$$
\begin{align}
z &= -2 \cdot (y-x) \cdot t^3 + 3 \cdot (y-x) \cdot t^2 + x \nonumber \\
&= (-2 t^3 + 3 t^2) \cdot y + (1 - (-2 t^3 + 3 t^2)) \cdot x \nonumber \\
&= g(t) \cdot y + (1 - g(t)) \cdot x,
\end{align}
$$

where

$$ 
g(t) = -2 t^3 + 3 t^2.
$$

Using a stepping function, $$g(t)$$, the above interpolation method can be represented as the form of linear interpolation.

On the other hand, let the slope be the average of change between two points on either side. In other words, 

$$
\begin{align}
f(n) &= a_0 = x_n, \nonumber \\
f(n+1) &= a_3 + a_2 + a_1 + a_0 = x_{n+1} \nonumber \\
f'(n) &= a_1 = 0.5 \cdot (x_{n+1} - x_{n-1}), \nonumber \\
f'(n+1) &= 3 a_3 + 2 a_2 + a_1 = 0.5 \cdot (x_{n+2} - x_{n}).
\end{align}
$$

should be satisfied. Then, we can obtain

$$
\begin{align}
a_0 &= x_n, \nonumber \\
a_1 &= 0.5 x_{n+1} - 0.5 x_{n-1}, \nonumber \\
a_2 &= -0.5 x_{n+2} + 2 x_{n+1} - 2.5 x_n + x_{n-1}, \nonumber \\
a_3 &= 0.5 x_{n+2} - 1.5 x_{n+1} + 1.5 x_n - 0.5 x_{n-1}. \nonumber \\
\end{align}
$$

In contrast with the previous zero-slope cubic interpolation, note that the above cubic interpolation equation can not be factorized in the linear interpolation form. When I show an example of the above interpolation methods given several random points, the derivatives of each interpolation methods are

<img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/yBM60Kq.png">

You can see that functions of cubic interpolation method are differentiable at everywhere, thus continuous in the first derivatives.

To implement cubic interpolation in two-dimensional space, we can refer this page, [Bicubic interpolation](https://en.wikipedia.org/wiki/Bicubic_interpolation). But, due to its heavy computation, I've used an approximated method by computing the interpolated values along the x and y axis independently. 
```glsl
float curve (in float x0, in float x1, in float x2, in float x3, in float t) {
  float a_0 = x1;
  float a_1 = 0.5 * x2 - 0.5 * x0;
  float a_2 = -0.5 * x3 + 2.0 * x2 - 2.5 * x1 + x0;
  float a_3 = 0.5 * x3 - 1.5 * x2 + 1.5 * x1 - 0.5 * x0;
  return a_3 * t * t * t + a_2 * t * t + a_1 * t + a_0;
}

float noiseCurve (in vec2 x) {
  vec2 i = floor(x);
  vec2 f = fract(x);

  // v_00, v_10, v_20, v_30
  // v_01, v_11, v_21, v_31
  // v_02, v_12, v_22, v_32
  // v_03, v_13, v_23, v_33

  float v_00 = random(i + vec2(-1.0, -1.0));
  float v_01 = random(i + vec2(-1.0, 0.0));
  float v_02 = random(i + vec2(-1.0, 1.0));
  float v_03 = random(i + vec2(-1.0, 2.0));

  float v_10 = random(i + vec2(0.0, -1.0));
  float v_11 = random(i + vec2(0.0, 0.0));
  float v_12 = random(i + vec2(0.0, 1.0));
  float v_13 = random(i + vec2(0.0, 2.0));

  float v_20 = random(i + vec2(1.0, -1.0));
  float v_21 = random(i + vec2(1.0, 0.0));
  float v_22 = random(i + vec2(1.0, 1.0));
  float v_23 = random(i + vec2(1.0, 2.0));

  float v_30 = random(i + vec2(2.0, -1.0));
  float v_31 = random(i + vec2(2.0, 0.0));
  float v_32 = random(i + vec2(2.0, 1.0));
  float v_33 = random(i + vec2(2.0, 2.0));

  float v_0x = curve(v_00, v_01, v_02, v_03, f.y);
  float v_1x = curve(v_10, v_11, v_12, v_13, f.y);
  float v_2x = curve(v_20, v_21, v_22, v_23, f.y);
  float v_3x = curve(v_30, v_31, v_32, v_33, f.y);

  return curve(v_0x, v_1x, v_2x, v_3x, f.x);
}
```

The error between the original and the approximated method is negligible and can be ignored enough. I've illustrated each interpolation result for random data points and its error.

|                Original                 |               Approximate               |                Error                 |
|:---------------------------------------:|:---------------------------------------:|:------------------------------------:|
| <img class="image240" referrerpolicy="no-referrer" src="https://i.imgur.com/J5GFxWj.png"> | <img class="image240" referrerpolicy="no-referrer" src="https://i.imgur.com/cwNd3mb.png"> | <img class="image240" referrerpolicy="no-referrer" src="https://i.imgur.com/Lu6JxY2.png"> |

Finally, depending on the interpolation methods, the noise functions can be generated as

|                 Flat                 |                Linear                |          Cubic (zero slope)          |                Cubic                 |
|:------------------------------------:|:------------------------------------:|:------------------------------------:|:------------------------------------:|
| <img class="image240" referrerpolicy="no-referrer" src="https://i.imgur.com/R3fAcQd.png"> | <img class="image240" referrerpolicy="no-referrer" src="https://i.imgur.com/IWwjUbX.png"> | <img class="image240" referrerpolicy="no-referrer" src="https://i.imgur.com/9B9tKmg.png"> | <img class="image240" referrerpolicy="no-referrer" src="https://i.imgur.com/VBZOw1d.png"> |

[^noise]: [\[WebGL\] Noise Functions](https://sangillee.com/2024-07-14-noise-functions/)