---
title: "[WebGL] Vertex and Fragment"
categories:
 - JavaScript
tags:
 - javascript
 - glsl
 - webgl
 - shader
header:
  teaser: /assets/image/thumbnail/webgl.jpg
---

> A shader program consists of vertex and fragment shaders. A vertex shader defines the geometric attributes of vertices, whereas fragment shader defines their color. In this post, I'll address how to create the vertex and fragment shaders and how to use them.

## Vertex shader
In vertex shader, we have to define the position of vertices, `gl_Position`, in `main()` function. `gl_Position` is a reserved variable, so its name can not be changed manually. The simple example of vertex shader is below:
```c
precision mediump float;

attribute vec2 a_position;
uniform float u_time;
varying vec2 v_position;

void main() {
    vec2 zeroToOne = a_position;
    v_position = a_position;

    // Convert from [0,1] to [-1,+1]
    vec2 clipSpace = zeroToOne * 2.0 - 1.0;
    clipSpace.y *= -1.;

    gl_Position = vec4(clipSpace, 0., 1.);
}
```
`precision mediump float` sets the precision of `float` as medium level. If needed, you can choose `lowp` or `highp`. The lower precision has low computational load but narrow range, and the opposite is true for higher precision. `lowp`, `mediump`, and `highp` represent a number with 9bit, 16bit, and 16bit at least, respectively. Their size depends on the system. [^precision]

`attribute vec2 a_position` declares an attribute variable that is defined outside. In the above example, `a_position` denotes the normalized position of pixel in the canvas, thus being represented as floating number of [0, 1]. Necessarily, since the clipspace of WebGL ranges from -1 to 1, don't forget to convert from [0, 1] to [-1, 1] outputing `clipspace`.

A uniform variable, `u_time`, is for denoting time in seconds passed from the beginning of the page. Notice that the attribute values are different for each pixel, whereas a uniform value is the same for all pixels. 

Lastly, `varying` is the reserved data type for sending the value of the data from vertex shader to fragment shader. In the above, vertex shader copies the value of `a_position` to `v_position`, since fragment shader can't use an attribute variable. 

## Fragment shader
The fragment shader describes the color of a pixel, `gl_FragColor`. The type of this reserved variable is `vec4` consisting of red, green, blue, alpha. 
```c
precision mediump float;
varying vec2 v_position;
uniform float u_time;

void main() {
    gl_FragColor = vec4(1., 0., 1., 1.);
}
```

## How to test
For efficient learning, you can edit and test GLSL code online [^editor] or here. In the below, I provide the live example for testing a vertex and a fragment shader codes. The provided attribute and uniform variables are `a_position`, `u_time`, `u_resolution`, and `u_mousePosition`. `a_position` denotes the normalized position of a pixel in the UV map of the canvas, `u_time` denotes a time passed after the loading of the page, `u_resolution` is the pixel dimension of the canvas, and `u_mousePosition` is the position of mouse with respect to the canvas. When you modify the below code, the result will change dynamically. 

{% include /assets/live_shader.html %}

[^editor]: [http://editor.thebookofshaders.com](http://editor.thebookofshaders.com)
[^precision]: [https://webgl2fundamentals.org/webgl/lessons/webgl-precision-issues.html](https://webgl2fundamentals.org/webgl/lessons/webgl-precision-issues.html)