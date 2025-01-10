---
title: "Shader Program"
categories:
 - WebGL
tags:
 - javascript
 - glsl
 - webgl
 - shader
header:
  teaser: /assets/image/thumbnail/webgl.jpg
excerpt_separator: <!--more-->
---

> GLSL (OpenGL Shading Language) is a programming language for simple program, Shader, that describes the color attribute of each vertex in parallel computation. Thus, all vertices do not know the status of other vertices nearby, i.e., vertices are blind to the others. But, if we use a `uniform` variable, all vertices can share the same value. Also, we can use `varying` variable to transfer a value of a vertex into its fragment shader. In this post, I'll summarize how to implement a basic shader program. The below image shows how to create a shader program. 

<!--more-->

<img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/TJMNJtu.png">

## Create vertex and fragment shaders
To create a vertex or a fragment shader, we need WebGL context, `gl`, and a shader source. The details about scripting source will be addressed in the following post. In this post, we will use a simple shader source. The shader variable returned from the below function will be used to create a program. `gl.shaderSource()` connects shader and source, and  `gl.compileShader()` compiles the shader source. By executing `gl.getShaderParameter()`, it returns the status of compile result.
```js
function createShader(gl, type, source) {
    const shader = gl.createShader(type); // gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}
```

## Create program
After creating the vertex and fragment shaders, it's about to create a program using the shaders as below. `gl.createProgram()` creates and initializes a program object, and `gl.attachShader()` connects the program and shader, then `gl.linkProgram()` connects vertex shader and fragment shader.
```js
function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}
```

Finally, `gl.useProgram()` notifies WebGL to use the program. 

## Create attribute variable
We can create the attributes of vertex such as position and normal. Using these attributes, we can configure its color physically. Given `value` of an attribute, we have to create buffer in advance. This buffer have to be created for every attribute, since it belongs to a single attribute. Next, `gl.bindBuffer` binds buffer to ARRAY_BUFFER and `gl.bufferData` initializes buffer with a format. Then, we can access the buffer through a `name` and its `attributeLocation`. `gl.enableVertexAttribArray` activates the attribute, and `gl.vertexAttribPointer` sets the value of attribute.
```js
function createAttribute(gl, program, name, size, value) {
    // create a buffer
    const buffer = gl.createBuffer();

    // bind it to ARRAY_BUFFER
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(value), gl.STATIC_DRAW);

    // look up where the vertex data needs to go.
    const attributeLocation = gl.getAttribLocation(program, name);

    // turn on the attribute
    gl.enableVertexAttribArray(attributeLocation);

    // tell the attribute how to get data out of buffer (ARRAY_BUFFER)
    const normalize = false; // don't normalize the data
    const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    const offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(attributeLocation, size, gl.FLOAT, normalize, stride, offset);
}
```

## Entire code
Below is an example using shader program. In the example, the color of canvas varies depending on the position of mouse pointer and coordinates. I'll explain the method of how to script vertex and fragment shaders in the next post.

{% include /assets/basic_shader.html %}

#### fragment shader
```glsl
// frag.js
const fragment = /* glsl */ `
precision mediump float;

uniform vec2 u_mousePosition;

varying vec2 v_position;
varying vec3 v_normal;

void main() {
    vec2 position = v_position;
    vec2 mousePosition = u_mousePosition;

    vec3 color = vec3(position, mousePosition.x);
    color *= mousePosition.y;

    gl_FragColor = vec4(color, 1.);
}
`
export default fragment
```

#### vertex shader
```glsl
// vert.js
const vertex = /* glsl */ `
precision mediump float;

attribute vec2 a_position;
attribute vec3 a_normal;

varying vec2 v_position;
varying vec3 v_normal;

void main() {
    vec2 zeroToOne = a_position;

    // convert coordinate from (x, y): ([0, 1], [0, 1]) to (x, y): ([-1, 1], [1, -1])
    vec2 clipSpace = zeroToOne * 2.0 - 1.0;
    clipSpace.y *= -1.;

    // deliver vertex attributes to fragment shader
    v_position = a_position;
    v_normal = a_normal;

    gl_Position = vec4(clipSpace, 0., 1.);
}
`
export default vertex
```

#### script
```js
import fragment from './frag.js'
import vertex from './vert.js'

// create canvas element
const canvas = document.createElement('canvas');
document.body.appendChild(canvas);

canvas.style.width = '100%';
canvas.style.height = '100%';

// get webgl context
const gl = canvas.getContext('webgl');
if (!gl) alert('WebGL is not supported by your browser');

// get dpr value
const dpr = window.devicePixelRatio;

// create shaders
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertex);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragment);

// create shader program
const program = createProgram(gl, vertexShader, fragmentShader);

// use program
gl.useProgram(program);

// enable to cull back face
gl.enable(gl.CULL_FACE);
gl.cullFace(gl.BACK); // BACK (default), FRONT, FRONT_AND_BACK

// In default, if the winding order of vertices is CCW, their triangle create a front face
gl.frontFace(gl.CCW); // CCW (default), CW

// create attributes
createAttribute(gl, program, "a_position", 2, [
    0, 0,
    0, 1,
    1, 1,
    0, 0,
    1, 1,
    1, 0,
]);
createAttribute(gl, program, "a_normal", 3, [
    1, 0, 0,
    0, 1, 1,
    0, 0, 1,
    1, 0, 0,
    0, 0, 1,
    0, 1, 1,
]);

// look up uniform locations
const u_mousePosition = gl.getUniformLocation(program, "u_mousePosition");

// update uniform value with a range: [0, 1]
canvas.addEventListener('mousemove', function(evt){
    const invScaleW = 1 / canvas.width;
    const invScaleH = 1 / canvas.height;
    gl.uniform2f(u_mousePosition, dpr*evt.offsetX * invScaleW, dpr*evt.offsetY * invScaleH);
});
canvas.addEventListener('touchmove', function(evt){
    const invScaleW = 1 / canvas.width;
    const invScaleH = 1 / canvas.height;
    gl.uniform2f(u_mousePosition, dpr*evt.changedTouches[0].offsetX * invScaleW, dpr*evt.changedTouches[0].offsetY * invScaleH);
});

// update the dimension of canvas
window.addEventListener('resize', resize);
resize();

// render
window.requestAnimationFrame(render);

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

function createAttribute(gl, program, name, size, value) {
    // create a buffer
    const buffer = gl.createBuffer();

    // bind it to ARRAY_BUFFER
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(value), gl.STATIC_DRAW);

    // look up where the vertex data needs to go.
    const attributeLocation = gl.getAttribLocation(program, name);

    // turn on the attribute
    gl.enableVertexAttribArray(attributeLocation);

    // tell the attribute how to get data out of buffer (ARRAY_BUFFER)
    const normalize = false; // don't normalize the data
    const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    const offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(attributeLocation, size, gl.FLOAT, normalize, stride, offset);
}

function resize() {
    // get displayed canvas size in pixels
    const displayWidth  = Math.round(canvas.clientWidth * dpr);
    const displayHeight = Math.round(canvas.clientHeight * dpr);

    // update canvas size
    canvas.width = displayWidth;
    canvas.height = displayHeight;

    // update gl viewport size
    gl.viewport(0, 0, canvas.width, canvas.height);
}

function render() {
    // set color to clear canvas
    gl.clearColor(0, 0, 0, 0);

    // clear the canvas with the above color
    gl.clear(gl.COLOR_BUFFER_BIT);

    // draw triangles
    const primitiveType = gl.TRIANGLES;
    const offset = 0;
    const count = 6;
    gl.drawArrays(primitiveType, offset, count);

    requestAnimationFrame(render.bind(this));
}
```