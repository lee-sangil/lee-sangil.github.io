---
title: "Shader Design Patterns"
prefix: "WebGL"
categories:
 - WebGL
tags:
 - glsl
 - webgl
 - shader
 - random
 - gradient
 - noise
 - fractal
header:
  teaser: /assets/image/thumbnail/webgl.jpg
excerpt_separator: <!--more-->
---

> Now, it's time to design a custom pattern to illustrate the shader. Since all vertex and fragment is "blind" to others, we have to script a code with different manner from the concurrent programming. Thus, the position and color of a vertex should be defined with its own attributes and the shared uniform values. Here, I'll address several techniques. For more information, please visit [https://thebookofshaders.com](https://thebookofshaders.com)

<!--more-->

## Basic Functions
* `step(th, x)`: return $$1$$ if $$\rm{th} \it < x$$, otherwise $$0$$.
* `smoothstep(th1, th2, x)`: return $$0$$ if $$x < \rm{th}_1$$, $$1$$ if $$\rm{th}_2 \it < x$$, otherwise smoothed interpolated value between \[0, 1\]
* mathematical operation
  * `abs(x)`: return absolute value, $$\|x\|$$
  * `sin, cos, tan, ...`: trigonometric functions
  * `min(x, y)`: return the smaller value
  * `max(x, y)`: return the larger value
  * `pow(x, y)`: return the value of $$x$$ to the power of $$y$$; $$~x^y$$
  * `dot(v, w)`: return the dot product of vectors $$v$$ and $$w$$; $$~v \cdot w$$
  * `cross(v, w)`: return the cross product of vectors $$v$$ and $$w$$; $$~v \times w$$
  * `mod(x, y)`: return the remainder of a division $$x/y$$; $$~x - y * \rm floor(\it x/y \rm)$$
  * `fract(x)`: return the fractional part of $$x$$; $$~x - \rm floor(\it x \rm)$$

* `mix(x, y, r)`: return the interpolated value between $$x$$ and $$y$$ with a weight $$r$$
* `clamp(x, th1, th2)`: return the truncated value of $$x$$ between $$\rm{th}_1$$ and $$\rm{th}_2$$, i.e., $$\rm min(max( \it x, \rm{th}_1), \rm{th}_2)$$
* `length(v)`: return the Euclidean length of vector $$v$$; $$~\|v\|$$
* `distance(v, w)`: return the Euclidean length of vector $$v-w$$; $$~\|v-w\|$$

Using the above fundamental functions, several techniques are addressed below. 

## Gradient
Gradient color shows a transition between multiple colors. To implement gradient color, we need $$n$$ colors and $$(n-1)$$ weight variables. 
`mix` makes you implement simple gradient easily. 
```glsl
varying vec2 v_position; // [0, 1]

void main() {
    vec3 color1 = vec3(1.0, 0.5, 0.5);
    vec3 color2 = vec3(0.5, 1.0, 1.0);
    gl_FragColor = vec4(mix(color1, color2, v_position.x), 1.0);
}
```
<img class="imageWideFull" referrerpolicy="no-referrer" src="https://i.imgur.com/B2F3nDT.png">

Or, you can use `smoothstep` so that the position of gradient boundary can be tuned. 
```glsl
varying vec2 v_position; // [0, 1]

void main() {
    vec3 color1 = vec3(1.0, 0.5, 0.5);
    vec3 color2 = vec3(0.5, 1.0, 1.0);
    float ratio = smoothstep(0.3, 0.7, v_position.x);
    gl_FragColor = vec4(mix(color1, color2, ratio), 1.0);
}
```
<img class="imageWideFull" referrerpolicy="no-referrer" src="https://i.imgur.com/WfJe18T.png">

Also, you can manually design the smoothing function. 
```glsl
varying vec2 v_position; // [0, 1]

float my_interp(in float a, in float b, in float x) {
    float z = (x-a)/(b-a);
    return z < 0.5 ? 2.0 * z * z : 1.0 - pow(-2.0 * z + 2.0, 2.0) / 2.0;
}

void main() {
    vec3 color1 = vec3(1.0, 0.5, 0.5);
    vec3 color2 = vec3(0.5, 1.0, 1.0);
    float ratio = my_interp(0.0, 1.0, v_position.x);
    gl_FragColor = vec4(mix(color1, color2, ratio), 1.0);
}
```
<img class="imageWideFull" referrerpolicy="no-referrer" src="https://i.imgur.com/c10JKTU.png">

If you want to generate a gradient using three colors, use `mix` twice with two weight variables.
```glsl
varying vec2 v_position; // [0, 1]

void main() {
    vec3 color1 = vec3(1.0, 0.5, 0.5);
    vec3 color2 = vec3(0.5, 1.0, 1.0);
    vec3 color3 = vec3(0.2, 0.5, 1.0);
    float ratio1 = smoothstep(0.0, 0.6, v_position.x);
    float ratio2 = smoothstep(0.4, 1.0, v_position.x);
    gl_FragColor = vec4(mix(mix(color1, color2, ratio1), color3, ratio2), 1.0);
}
```
<img class="imageWideFull" referrerpolicy="no-referrer" src="https://i.imgur.com/dfCRarK.png">

## Repetitive Pattern
When zooming out on most complicated natural texture, you can see they are patterned. To divide a range [0, 1] into multiple [0, 1] s, we use `fract()` function. 
```glsl
varying vec2 v_position; // [0, 1]

void main() {
    float ncol = 3.0;
    float nrow = 2.0;
    float x1 = fract(ncol * v_position.x);
    float y1 = fract(nrow * v_position.y);
    float idx_x1 = floor(ncol * v_position.x);
    float idx_y1 = floor(nrow * v_position.y);

    gl_FragColor = vec4(x1, y1, (idx_x1 + idx_y1) / 5.0, 1.0);
}
```
<img class="imageWideFull" referrerpolicy="no-referrer" src="https://i.imgur.com/Ow15yYa.png">

Likewise, if you want to generate a pattern inside a pattern, divide grids twice. 
```glsl
varying vec2 v_position; // [0, 1]

vec4 divide_cell(in vec2 parent, in vec2 size) {
    vec4 child = vec4(0.0);
    child.xy = fract(size * parent); // x, y position
    child.zw = floor(size * parent); // x, y index
    return child;
}

void main() {
    vec4 xy1 = divide_cell(v_position, vec2(3.0, 2.0));
    vec4 xy2 = divide_cell(xy1.xy, vec2(2.0, 2.0));

    gl_FragColor = vec4(xy2.x, xy2.y, mod(xy2.z + xy2.w, 2.0), 1.0);
}
```
<img class="imageWideFull" referrerpolicy="no-referrer" src="https://i.imgur.com/Crp8Idz.png">

## Random
Unfortunately, GLSL does not provide a true random number generator. Instead, we can generate a pseudo random number with a sinusoidal function of high amplitude with `fract`. `fract` transforms the value into the range [0, 1], and the sinusoidal function produces randomness by generating a different slope for each [0, 1] piece. Also, `fract(x^2)` can generate random number since their slopes are different for each piece. However, unlike the sinusoidal function, which is bounded on [-1, 1], `x^2` can exceed the maximum value of Float, thus outputting incorrect value.
```glsl
float random(in float x) {
    return fract(sin(x)*100000.0);
}
```

Using MATLAB, I've generated the histogram of the above random variable.

```matlab
x = linspace(0, pi, 10000);

figure();
set(gcf, 'Position', [680 557 720 480])

z = sin(x)*100000;
%% z = x.^2*100000;
%% z = x*100000;
X = z - floor(z);

subplot(211);
histogram(X, 'Normalization', 'pdf');
xlim([0, 1]);
grid on
xlabel('Value, X');
ylabel('PDF, f(X)');
set(gcf, 'color', 'w');

subplot(212);
plot(x, X, '.');
xlim([0, pi]);
ylabel('Value, X');
```

| formula | result |
|:-:|:-:|
|$$\rm sin(\it x)$$| <img class="imageWideFull" referrerpolicy="no-referrer" src="https://i.imgur.com/5PF9g8m.png">|
|$$x^2$$|<img class="imageWideFull" referrerpolicy="no-referrer" src="https://i.imgur.com/C0RTq75.png">|
|$$x$$|<img class="imageWideFull" referrerpolicy="no-referrer" src="https://i.imgur.com/maYqoqS.png">|

Above, the histogram of $$\rm sin(\it x \rm)$$, $$x^2$$, $$x$$ are shown. As mentioned before, sinusoidal and power functions show randomness, whereas linear function has a pattern. Please notice that they have a uniform distribution.

To generate a random number from two or more dimensional vector, we use dot product to produce a scalar number. 
```glsl
float random(in vec2 x) {
    return fract(sin(dot(x, vec2(12.9898,78.233)))*43758.5453123);
}
```

The above magic numbers can be chosen manually so that randomness is shown well.

## Noise
If we called a single independent noise as random, noise means the interpolated value between random values. Thus, noise functions have a continuity, whereas random functions show discontinuity. Below are the example of random and noise.

| random | noise |
|:-:|:-:|
|<img class="imageWideFull" referrerpolicy="no-referrer" src="https://i.imgur.com/tyQR3sc.png">|<img class="imageWideFull" referrerpolicy="no-referrer" src="https://i.imgur.com/Rb4cuG7.png">|

As mentioned above, all vertex and fragment is blind to others, so each fragment can not read the colors nearby. However, since the random function of GLSL generates pseudo-random output rather than true random, thus each fragment can read the value of adjacent fragments. 

```glsl
float random (in vec2 x) {
    return fract(sin(dot(x, vec2(12.9898,78.233))) * 43758.5453123);
}

float noise (in vec2 x) {
    vec2 i = floor(x);
    vec2 f = fract(x);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Cubic Hermine Curve. Same as SmoothStep()
    vec2 u = smoothstep(0., 1., f);

    // Mix 4 coorners percentages
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
```

In real world, a signal is the sum of sinusoids of multiple frequencies, and we can compute the amplitude of sinusoids of the specific frequency by Fourier transform. In noise pattern, a division number corresponds to a frequency of Fourier transform. Therefore, when we add multiple noises of different division size, a natural texture can be imitated.

```glsl
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

    // Mix 4 coorners percentages
    return mix(mix(tl, tr, u.x), mix(bl, br, u.x), u.y);
}

#define LEVELS 6
float fractal_noise (in vec2 x, in float scaling_amp, in float scaling_freq) {
    float n = 0.;
    float amplitude = 1. - scaling_amp; // ensure that the maximum value is 1.

    
    for (int i = 0; i < LEVELS; ++i) {
        n += amplitude * noise(x);
        amplitude *= scaling_amp;
        x *= scaling_freq;
    }

    return n;
}

void main() {
    gl_FragColor = vec4(vec3(fractal_noise(2.*v_position, 0.5, 2.)), 1.);
}
```

Also, you can compose multiple fractal noises and time variable to illustrate flowing textures such as smoke.
```glsl
void main() {
    vec3 color = vec3(0.5, 0.6, 0.7);

    float n = fractal_noise(2.*v_position, 0.5, 2.);
    float m = fractal_noise(2.*v_position + vec2(0.1, 0.12)*u_time + n, 0.5, 2.);

    gl_FragColor = vec4(mix(vec3(0.), color, m), 1.);
}
```

<img class="imageWideFull" referrerpolicy="no-referrer" src="https://i.imgur.com/mIonF22.gif">

[^bookofshader]: [The book of shaders](https://thebookofshaders.com)