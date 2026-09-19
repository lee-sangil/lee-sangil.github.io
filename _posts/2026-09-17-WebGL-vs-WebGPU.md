---
title: "WebGL vs. WebGPU"
prefix: "WebGL"
lang: "en"
lang_ref: "2026-09-17-webgl-vs-webgpu"
categories:
 - WebGL
tags:
 - webgl
 - webgpu
 - shader
 - wgsl
 - glsl
 - compute
header:
  teaser: /assets/image/thumbnail/2026-09-17-webgl-webgpu.jpg
excerpt_separator: <!--more-->
---

> In May 2024, Three.js Shading Language (TSL) was introduced to support WebGPU. WebGPU supports general-purpose GPU computing, making it flexible in general-purpose GPU usage. In this post, I'll briefly describe how to deal with WebGPU compared to WebGL.  

<!--more-->

{% include /assets/webgl_vs_webgpu.html %}
<br/>

## Differences between WebGL and WebGPU

WebGL and WebGPU are both APIs designed for working with GPUs in a web environment, but they differ significantly in terms of their approach and level of control over the GPU. Here’s a detailed explanation of these differences.

1. GPU access approach

    WebGL is a browser-based API for rendering 2D and 3D graphics using the GPU. It works by creating a rendering context coupled with an HTML canvas element. This context acts as a bridge between the JavaScript application and the GPU. On the other hand, WebGPU is a next-generation web API designed for more direct GPU access. It builds upon modern graphics APIs like Vulkan, Metal, and Direct3D 12, allowing developers to leverage low-level GPU features for advanced performance and flexibility.

    - In WebGL, GPU control is indirect, as much of the GPU’s functionality is abstracted by the browser and GPU drivers. WebGL focuses mainly on rendering tasks, meaning it’s less suited for non-rendering workloads like general-purpose GPU computing (GPGPU).
    - WebGPU provides direct controls over GPU resources. WebGPU supports compute pipelines, enabling tasks beyond graphics rendering, such as machine learning or physics simulations.

2. Canvas and GPU Control

    - WebGL requires a canvas element. All GPU rendering happens through the WebGL context attached to a canvas, and the results are directly displayed there. GPU usage is tightly coupled to the canvas and rendering tasks.
    - In WebGPU, the canvas is optional. While it can be used for rendering, WebGPU also supports offscreen rendering and compute-only workloads, meaning that you can use the GPU for non-visual tasks without requiring a canvas. This decoupling provides developers with more flexibility.     

3. High-Level vs. Low-Level API

    - WebGL operates at a higher level of abstraction. The browser and the WebGL implementation manage many GPU details, which makes it easier to use but limits fine-grained control.
    - WebGPU is a lower-level API that exposes more of the GPU’s functionality to developers. While this adds complexity, it also allows for better performance and more advanced use cases.

## Translation between WebGL and WebGPU  

In this section, the WebGL and WebGPU examples render the same color gradient that maps UV coordinates and mouse position to color. Although the final output is the same, the way each API prepares GPU resources and submits draw commands per frame is fundamentally different.

- WebGL follows an immediate-mode API model. State (program, buffers, and uniform values) is set sequentially on the `gl` context, and `drawArrays` is called against that state. Shaders are written in GLSL as separate vertex and fragment source strings (as described in [Vertex and Fragment Shaders]({% post_url 2024-04-21-Vertex-and-fragment %})), then compiled through `createShader` → `compileShader` → `createProgram` → `linkProgram` (see [Shader Program Compilation]({% post_url 2024-04-06-Shader-program %})).

- WebGPU follows a declarative model. Vertex and fragment entry points are written together in a single WGSL module, and at pipeline-creation time all rendering state (vertex buffer layout, primitive topology, fragment target format) is fixed into one `GPURenderPipeline` object. For every frame, commands are recorded into a command encoder and submitted as a batch.  

| WebGL                                | WebGPU                               |   
| :----------------------------------: | :----------------------------------: |   
| <img class="imageWide" referrerpolicy="no-referrer" src="https://i.imgur.com/ynJy4hx.png"> | <img class="imageWide" referrerpolicy="no-referrer" src="https://i.imgur.com/LTMXx7E.png"> |   

Below, each corresponding stage of the two pipelines is shown side by side.       

### 1. Context Initialization

WebGL obtains a rendering context synchronously from the canvas. WebGPU requests a GPU adapter and device asynchronously, then configures the canvas context with that device.

**WebGL**
```js
const canvas = document.getElementById('webgl');
const gl = canvas.getContext('webgl');   
```

**WebGPU**
```js
const canvas = document.getElementById('webgpu');
const adapter = await navigator.gpu.requestAdapter();
const device = await adapter.requestDevice();
const context = canvas.getContext('webgpu');

const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
context.configure({
        device,
        format: presentationFormat,      
        alphaMode: 'premultiplied',      
});
```

### 2. Shader Writing

WebGL shaders are GLSL, written as two separate source strings, with `attribute`/`uniform`/`varying` qualifiers. WebGPU shaders are WGSL, written in a single module, with `struct` declarations explicitly defining input/output layout. In GLSL, the entry point is strictly a function named `void main()`, while in WGSL, entry points use user-defined function names prefixed with stage attributes like `@vertex`, `@fragment`, or `@compute`.

**WebGL (GLSL)**
```glsl
// Vertex
precision mediump float;

attribute vec2 a_position;
uniform vec2 u_mouse;
uniform vec2 u_resolution;
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

```glsl
// Fragment
precision mediump float;

uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_time;
varying vec2 v_position;

void main() {
        vec2 st = gl_FragCoord.xy / u_resolution.xy;
        gl_FragColor = vec4(st, u_mouse.x, 1.0);
}
```

**WebGPU (WGSL)**
```rust
struct Uniforms {
        mouse : vec2<f32>,
        resolution : vec2<f32>,
        time : f32,
};

@group(0) @binding(0) var<uniform> ubo : Uniforms;

struct VertexOutput {
        @builtin(position) position : vec4<f32>,
        @location(0) v_position : vec2<f32>,
};

@vertex
fn vs_main(@location(0) a_position : vec2<f32>) -> VertexOutput {
        var out: VertexOutput;
        let clipSpace = a_position * 2.0 - 1.0;
        out.position = vec4<f32>(clipSpace.x, -clipSpace.y, 0.0, 1.0);
        out.v_position = a_position;     
        return out;
}

@fragment
fn fs_main(@builtin(position) fragCoord : vec4<f32>) -> @location(0) vec4<f32> {  
        let st = fragCoord.xy / ubo.resolution;
        return vec4<f32>(st, ubo.mouse.x, 1.0);
}
```

GLSL variables are matched by name. The shaders above declare `a_position`, `u_mouse`, `u_resolution`, and `u_time`. Then, the JS code looks up those same string identifiers at runtime to get a location handle. On the other hand, WGSL does not use a lookup-by-name mechanism. Instead, every resource is assigned by indexing numbers with qualifiers (`@location`, `@group`, `@binding`), and those numbers must match exactly on the JavaScript side too. Note that the compiler does not check these matches.

### 3. Shader Compilation & Pipeline Creation

WebGL compiles and links each shader stage manually, checking status at every step. WebGPU compiles the module once, then describes the entire pipeline (vertex, fragment, cull mode) in a single `createRenderPipeline` call.

**WebGL**
```js
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertex);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragment);
const program = createProgram(gl, vertexShader, fragmentShader);
gl.useProgram(program);

gl.enable(gl.CULL_FACE);
gl.cullFace(gl.BACK);
gl.frontFace(gl.CCW);

function createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source); 
        gl.compileShader(shader);        

        const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (success) return shader;      

        console.log(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
        const program = gl.createProgram();  
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        const success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (success) return program;      

        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
}
```

**WebGPU**
```js
const shaderModule = device.createShaderModule({ code: shaderSource });       

const pipeline = device.createRenderPipeline({
        layout: device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] }),
        vertex: {
                module: shaderModule,        
                entryPoint: 'vs_main',       
                buffers: [{
                        arrayStride: 8,
                        attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x2' }]
                }]
        },
        fragment: {
                module: shaderModule,        
                entryPoint: 'fs_main',       
                targets: [{ format: presentationFormat }]
        },
        primitive: {
                topology: 'triangle-list',   
                cullMode: 'back'
        }
});
```

### Complete Code Comparison

Below are the complete standalone examples for both APIs, drawing the interactive mouse-tracking gradient.

<details markdown="1">
<summary>WebGL</summary>

```js
const canvas = document.getElementById('webgl');
const dpr = window.devicePixelRatio || 1;
const gl = canvas.getContext('webgl');   

// shaders source code
const vertex = `
attribute vec2 a_position;
varying vec2 v_position;
void main() {
    gl_Position = vec4(a_position * 2. - 1., 0.0, 1.0);
}
`;
const fragment = `
precision mediump float;
uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_time;
varying vec2 v_position;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    gl_FragColor = vec4(st, u_mouse.x, 1.0);
}
`;
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

// look up uniform locations
const u_mouse = gl.getUniformLocation(program, "u_mouse");
const u_resolution = gl.getUniformLocation(program, "u_resolution");
const u_time = gl.getUniformLocation(program, "u_time");

let is_mouse_down = false;
let mouse_position = [0, 0];

// update uniform value with a range: [0, 1]
canvas.addEventListener('mousedown', function(evt){
    is_mouse_down = true;
    mouse_position[0] = dpr * evt.clientX;
    mouse_position[1] = dpr * evt.clientY;
});
window.addEventListener('mouseup', function(evt){
    is_mouse_down = false;
});
canvas.addEventListener('mouseleave', function(evt){
    is_mouse_down = false;
});
canvas.addEventListener('mousemove', function(evt){
    evt.preventDefault();
    const invScaleW = 1 / canvas.width;  
    const invScaleH = 1 / canvas.height; 
    const rect = evt.target.getBoundingClientRect();
    const x = evt.clientX - rect.left;   
    const y = evt.clientY - rect.top;    
    gl.uniform2f(u_mouse, dpr * x * invScaleW, dpr * y * invScaleH);

    if (is_mouse_down) {
        mouse_position[0] = dpr * evt.clientX;
        mouse_position[1] = dpr * evt.clientY;
    }
});

canvas.addEventListener('touchstart', function(evt){
    is_mouse_down = true;
    mouse_position[0] = dpr * evt.targetTouches[0].clientX;
    mouse_position[1] = dpr * evt.targetTouches[0].clientY;
});
window.addEventListener('touchend', function(evt){
    is_mouse_down = false;
});
canvas.addEventListener('touchmove', function(evt){
    evt.preventDefault();
    const invScaleW = 1 / canvas.width;  
    const invScaleH = 1 / canvas.height; 
    const rect = evt.target.getBoundingClientRect();
    const x = evt.targetTouches[0].clientX - rect.left;
    const y = evt.targetTouches[0].clientY - rect.top;
    gl.uniform2f(u_mouse, dpr * x * invScaleW, dpr * y * invScaleH);
    if (is_mouse_down) {
        mouse_position[0] = dpr * evt.targetTouches[0].clientX;
        mouse_position[1] = dpr * evt.targetTouches[0].clientY;
    }
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
    gl.uniform2f(u_resolution, canvas.width, canvas.height);
}

function render(t) {
    gl.uniform1f(u_time, t * 0.001);     

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
</details>

<details markdown="1">
<summary>WebGPU</summary>

```js
async function init() {
    if (!navigator.gpu) {
        alert("WebGPU is not supported by your browser.");
        return;
    }

    const canvas = document.getElementById('webgpu');
    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter.requestDevice();
    const context = canvas.getContext('webgpu');

    const dpr = window.devicePixelRatio || 1;
    const presentationFormat = navigator.gpu.getPreferredCanvasFormat();

    context.configure({
        device,
        format: presentationFormat,      
        alphaMode: 'premultiplied',      
    });

    // WGSL shader
    const shaderSource = `
        struct Uniforms {
            mouse : vec2<f32>,
            resolution : vec2<f32>,      
            time : f32,
        };

        @group(0) @binding(0) var<uniform> ubo : Uniforms;

        struct VertexOutput {
            @builtin(position) position : vec4<f32>,
            @location(0) v_position : vec2<f32>,
        };

        @vertex
        fn vs_main(@location(0) a_position : vec2<f32>) -> VertexOutput {
            var out: VertexOutput;       
            let clipSpace = a_position * 2.0 - 1.0;
            out.position = vec4<f32>(clipSpace.x, -clipSpace.y, 0.0, 1.0);        
            out.v_position = a_position; 
            return out;
        }

        @fragment
        fn fs_main(@builtin(position) fragCoord : vec4<f32>) -> @location(0) vec4<f32> {
            let st = fragCoord.xy / ubo.resolution;
            return vec4<f32>(st, ubo.mouse.x, 1.0);
        }
    `;

    const shaderModule = device.createShaderModule({ code: shaderSource });       

    // vertex data
    const vertices = new Float32Array([  
        0, 0,  0, 1,  1, 1,
        0, 0,  1, 1,  1, 0,
    ]);
    const vertexBuffer = device.createBuffer({
        size: vertices.byteLength,       
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(vertexBuffer, 0, vertices);

    // uniform buffer
    // data: vec2(8) + vec2(8) + float(4) = 20 bytes.
    // WebGPU uniform buffers require 16-byte alignment for members, so we use 32 bytes.
    const uniformBuffer = device.createBuffer({
        size: 32,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const bindGroupLayout = device.createBindGroupLayout({
        entries: [{
            binding: 0,
            visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
            buffer: { type: 'uniform' }  
        }]
    });

    const bindGroup = device.createBindGroup({
        layout: bindGroupLayout,
        entries: [{
            binding: 0,
            resource: { buffer: uniformBuffer }
        }]
    });

    // create pipeline
    const pipeline = device.createRenderPipeline({
        layout: device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] }),
        vertex: {
            module: shaderModule,        
            entryPoint: 'vs_main',       
            buffers: [{
                arrayStride: 8,
                attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x2' }]
            }]
        },
        fragment: {
            module: shaderModule,        
            entryPoint: 'fs_main',       
            targets: [{ format: presentationFormat }]
        },
        primitive: {
            topology: 'triangle-list',   
            cullMode: 'back'
        }
    });

    let mousePos = [0, 0];
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mousePos[0] = (e.clientX - rect.left) * dpr;
        mousePos[1] = (e.clientY - rect.top) * dpr;
    });

    const renderPassDescriptor = {       
        colorAttachments: [{
            view: undefined,
            clearValue: { r: 0, g: 0, b: 0, a: 1 },
            loadOp: 'clear', // 'clear' or 'load'
            storeOp: 'store', // 'store' or 'discard'
        }]
    };

    function render(time) {
        // Update uniforms
        const uniformData = new Float32Array(5);
        uniformData[0] = mousePos[0] / canvas.width;  // u_mouse.x
        uniformData[1] = mousePos[1] / canvas.height; // u_mouse.y
        uniformData[2] = canvas.width;                // u_resolution.x
        uniformData[3] = canvas.height;               // u_resolution.y
        uniformData[4] = time * 0.001;                // u_time
        device.queue.writeBuffer(uniformBuffer, 0, uniformData);

                // select a texture to be rendered
        renderPassDescriptor.colorAttachments[0].view = context.getCurrentTexture().createView();

        const commandEncoder = device.createCommandEncoder();
        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor); 
        passEncoder.setPipeline(pipeline);
        passEncoder.setBindGroup(0, bindGroup);
        passEncoder.setVertexBuffer(0, vertexBuffer);
        passEncoder.draw(6);
        passEncoder.end();

        device.queue.submit([commandEncoder.finish()]);
        requestAnimationFrame(render);   
    }

    function resize() {
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        // WebGPU context configuration remains the same, it will adapt to canvas size
    }

    window.addEventListener('resize', resize);
    resize();
    requestAnimationFrame(render);       
}

init();
```
</details>

## Use of GPGPU

The WebGL and WebGPU benchmarks below run the same particle simulation: update each particle's position and velocity, then render it. But each API pushes that work onto the GPU differently. WebGL has no dedicated GPGPU API, so it borrows the graphics pipeline to mimic GPGPU, while WebGPU has a native compute shader. They differ in the way they store data, express the computation, and switch between passes each frame.

### Expressing the computation

In the WebGL code, `computeProg` is just a fragment shader. We draw a fullscreen quad, but the result is not rendered on the screen. Instead, it's written into an offscreen framebuffer.

```js
this.computeProg = this.createProgram('webgl-compute-vs', 'webgl-compute-fs');    
this.renderProg = this.createProgram('webgl-render-vs', 'webgl-render-fs');       
```

```js
gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texB, 0);
// ...
gl.useProgram(this.computeProg);
// ...
gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);  
```

To store and compute the position and velocity of particles, WebGL stores data in each texel of a texture: (R, G, B, A) = (px, py, vx, vy). Inside the shader, we read the previous position and velocity with `texture2D` and write the new values out through `gl_FragColor`:

```glsl
vec4 data = texture2D(u_currPosition, uv);
vec2 pos = data.xy;
vec2 vel = data.zw;
// ...physics update...
gl_FragColor = vec4(pos, vel);
```

WebGPU computes the particles' motion directly. The shader has a `@compute` entry point, and `dispatchWorkgroups` runs as many workgroups as we need. `workgroup_size` can be multiples of 32 or 64 for computational efficiency. You can read the limit of it from `device.limits.maxComputeWorkgroupSizeX`.

```rust
@compute @workgroup_size(64) fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    let i = id.x; if(i >= arrayLength(&p)) { return; }
    var pt = p[i];
    // ...physics update...
    p[i] = pt;
}
```

```js
cPass.dispatchWorkgroups(Math.ceil(this.numParticles / 64)); // 64 workgroups     
```

### Read/write the data

As shown above, WebGL packs position and velocity into a single `RGBA32F` texture pixel. However, a fragment shader can only write to the currently-bound framebuffer, and cannot read from the same texture it's writing to. So, we need a ping-pong technique, swapping two textures every frame: one for writing and another for reading.

```js
this.texA = this.createTexture();        
this.texB = this.createTexture();        
```

On the other hand, WebGPU just keeps everything in one storage buffer.

```rust
struct P { pos: vec2<f32>, vel: vec2<f32> };
@group(0) @binding(0) var<storage, read_write> p: array<P>;
```

Reading and writing within the same buffer is allowed, so there's no need to swap.

### Switching between passes

Since WebGL swaps two textures, it also swaps between two programs with `gl.useProgram` every frame. Besides, it toggles `gl.bindFramebuffer` between the offscreen target and `null`; calling `gl.bindFramebuffer(gl.FRAMEBUFFER, null)` tells the GPU to use the default canvas.

```js
gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
gl.useProgram(this.computeProg);
// ...compute draw call...

gl.bindFramebuffer(gl.FRAMEBUFFER, null);
gl.viewport(0, 0, this.canvas.width, this.canvas.height);
gl.useProgram(this.renderProg);
```

WebGPU has two pipelines (compute, render) as well, but there's no "current" program. A single `commandEncoder` records both passes and submits them together:      

```js
const cPass = enc.beginComputePass();    
cPass.setPipeline(this.cPipe);
cPass.setBindGroup(0, this.cGroup);      
cPass.dispatchWorkgroups(Math.ceil(this.numParticles / 64));
cPass.end();

const rPass = enc.beginRenderPass({ colorAttachments: [/* ... */] });
rPass.setPipeline(this.rPipe);
rPass.setBindGroup(0, this.rGroup);      
rPass.draw(this.numParticles);
rPass.end();

this.device.queue.submit([enc.finish()]);
```

### Looking up a particle's position     

WebGL's render-pass vertex shader takes an `a_index` attribute and samples `u_positionMap` to read the position of particles. `texture2D(u_positionMap, a_index)` returns the position and velocity of a particle.

```glsl
attribute vec2 a_index;
uniform sampler2D u_positionMap;
void main() {
    vec4 data = texture2D(u_positionMap, a_index);
    gl_Position = vec4(data.xy, 0.0, 1.0);
}
```

WebGPU's vertex shader needs no additional attribute. It uses the built-in `@builtin(vertex_index)` as an index into the storage buffer, and accesses the buffer directly.

```rust
@vertex fn vs(@builtin(vertex_index) i: u32) -> @builtin(position) vec4<f32> {    
    return vec4<f32>(p[i].pos, 0.0, 1.0);
}
```

The entire code for the above description follows below.

<details markdown="1">
<summary>WebGL vs. WebGPU Benchmarks in Particle Simulation</summary>

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>WebGL vs WebGPU Performance Benchmark</title>
    <script src="https://unpkg.com/stats.js@0.17.0/build/stats.min.js"></script>  
    <script src="https://cdnjs.cloudflare.com/ajax/libs/dat-gui/0.7.9/dat.gui.min.js"></script>
    <style>
        body { margin: 0; overflow: hidden; background-color: #111; font-family: sans-serif; }
        #render { display: block; width: 100vw; height: 100vh; }
    </style>
</head>
<body>
    <script id="webgl-compute-fs" type="x-shader/x-fragment">
        precision highp float;
        uniform sampler2D u_currPosition;
        uniform vec2 u_mouse;
        uniform float u_dt;
        uniform vec2 u_resolution;       

        void main() {
            vec2 uv = gl_FragCoord.xy / u_resolution;
            vec4 data = texture2D(u_currPosition, uv);
            vec2 pos = data.xy;
            vec2 vel = data.zw;

            vec2 dir = u_mouse - pos;    
            float dist = length(dir);    
            vec2 force = normalize(dir) * 1.0 / (dist * dist + 0.05);

            vel += (force - 2. * vel) * u_dt;
            pos += vel * u_dt;

            gl_FragColor = vec4(pos, vel);
        }
    </script>
    <script id="webgl-compute-vs" type="x-shader/x-vertex">
        attribute vec2 a_position;       
        void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
    </script>
    <script id="webgl-render-vs" type="x-shader/x-vertex">
        attribute vec2 a_index;
        uniform sampler2D u_positionMap; 
        void main() {
            vec4 data = texture2D(u_positionMap, a_index);
            gl_Position = vec4(data.xy, 0.0, 1.0);
            gl_PointSize = 1.0;
        }
    </script>
    <script id="webgl-render-fs" type="x-shader/x-fragment">
        precision mediump float;
        void main() { gl_FragColor = vec4(0.0, 1.0, 1.0, 1.0); }
    </script>

    <script type="module">
        // FPS Stats Setup
        const stats = new Stats();       
        stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild(stats.dom);

        const CONFIG = {
            mode: 'WebGL',
            textureSize: 512, // Default 512x512 = 262,144 particles
        };

        const SIZE_OPTIONS = {
            '16K': 128,
            '65K': 256,
            '262K': 512,
            '1M': 1024,
        };

        let currentApp = null;
        let mouse = { x: 0, y: 0 };      

        window.addEventListener('mousemove', e => {
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
        });

        // ---------------------------------------------------------
        // WebGL Implementation
        // ---------------------------------------------------------
        class WebGLApp {
            constructor(canvas, size) {  
                this.canvas = canvas;    
                this.gl = canvas.getContext('webgl');
                const gl = this.gl;      

                if (!gl.getExtension('OES_texture_float')) alert("Float texture not supported");

                this.width = size;       
                this.height = size;      
                this.numParticles = size * size;

                this.computeProg = this.createProgram('webgl-compute-vs', 'webgl-compute-fs');
                this.renderProg = this.createProgram('webgl-render-vs', 'webgl-render-fs');

                this.texA = this.createTexture();
                this.texB = this.createTexture();
                this.framebuffer = gl.createFramebuffer();

                this.quadBuf = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuf);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

                // Create index buffer for rendering particles
                const indices = new Float32Array(this.numParticles * 2);
                for(let i=0; i<this.numParticles; i++) {
                    const x = i % this.width;
                    const y = Math.floor(i / this.width);
                    indices[i*2+0] = (x + 0.5) / this.width;
                    indices[i*2+1] = (y + 0.5) / this.height;
                }
                this.idxBuf = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, this.idxBuf);
                gl.bufferData(gl.ARRAY_BUFFER, indices, gl.STATIC_DRAW);

                this.running = true;     
                this.loop();
            }

            createProgram(vsId, fsId) {  
                const gl = this.gl;      
                const vs = gl.createShader(gl.VERTEX_SHADER);
                gl.shaderSource(vs, document.getElementById(vsId).text);
                gl.compileShader(vs);    
                if(!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(vs));

                const fs = gl.createShader(gl.FRAGMENT_SHADER);
                gl.shaderSource(fs, document.getElementById(fsId).text);
                gl.compileShader(fs);    
                if(!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(fs));

                const p = gl.createProgram();
                gl.attachShader(p, vs);  
                gl.attachShader(p, fs);  
                gl.linkProgram(p);       
                return p;
            }

            createTexture() {
                const gl = this.gl;      
                const t = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, t);
                const data = new Float32Array(this.numParticles * 4);
                for(let i=0; i<data.length; i+=4) {
                    data[i] = Math.random() * 2 - 1;
                    data[i+1] = Math.random() * 2 - 1;
                    // data[i+2] = 0; data[i+3] = 0; // initial velocity
                }
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.FLOAT, data);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                return t;
            }

            loop() {
                if(!this.running) return;
                stats.begin(); // Start Measure

                const gl = this.gl;      

                // Compute
                gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
                gl.viewport(0, 0, this.width, this.height);
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texB, 0);

                gl.useProgram(this.computeProg);
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, this.texA);
                gl.uniform1i(gl.getUniformLocation(this.computeProg, "u_currPosition"), 0);
                gl.uniform2f(gl.getUniformLocation(this.computeProg, "u_mouse"), mouse.x, mouse.y);
                gl.uniform1f(gl.getUniformLocation(this.computeProg, "u_dt"), 0.016);
                gl.uniform2f(gl.getUniformLocation(this.computeProg, "u_resolution"), this.width, this.height);

                gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuf);
                const aPos = gl.getAttribLocation(this.computeProg, "a_position");
                gl.enableVertexAttribArray(aPos);
                gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

                // Render
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                gl.viewport(0, 0, this.canvas.width, this.canvas.height);
                gl.clearColor(0,0,0,1);  
                gl.clear(gl.COLOR_BUFFER_BIT);

                gl.useProgram(this.renderProg);
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, this.texB);
                gl.uniform1i(gl.getUniformLocation(this.renderProg, "u_positionMap"), 0);
                gl.bindBuffer(gl.ARRAY_BUFFER, this.idxBuf);
                const aIdx = gl.getAttribLocation(this.renderProg, "a_index");    
                gl.enableVertexAttribArray(aIdx);
                gl.vertexAttribPointer(aIdx, 2, gl.FLOAT, false, 0, 0);
                gl.drawArrays(gl.POINTS, 0, this.numParticles);

                let t = this.texA; this.texA = this.texB; this.texB = t;

                stats.end(); // End Measure
                requestAnimationFrame(() => this.loop());
            }

            destroy() { this.running = false; }
        }

        // ---------------------------------------------------------
        // WebGPU Implementation
        // ---------------------------------------------------------
        class WebGPUApp {
            constructor(canvas, size) {  
                this.canvas = canvas;    
                this.numParticles = size * size;
                this.running = true;     
                this.init();
            }

            async init() {
                if (!navigator.gpu) return;
                const adapter = await navigator.gpu.requestAdapter();
                const device = await adapter.requestDevice();
                this.device = device;    
                this.context = this.canvas.getContext('webgpu');
                this.format = navigator.gpu.getPreferredCanvasFormat();
                this.context.configure({ device, format: this.format });

                const common = `struct P { pos: vec2<f32>, vel: vec2<f32> }; struct U { m: vec2<f32>, dt: f32 };`;
                const cShader = `${common}
                    @group(0) @binding(0) var<storage, read_write> p: array<P>;   
                    @group(0) @binding(1) var<uniform> u: U;
                    @compute @workgroup_size(64) fn main(@builtin(global_invocation_id) id: vec3<u32>) {
                        let i = id.x; if(i >= arrayLength(&p)) { return; }        
                        var pt = p[i];   
                        let dir = u.m - pt.pos;
                        let dist = length(dir);
                        let force = normalize(dir) * 1.0 / (dist * dist + 0.05);  
                        pt.vel += (force - 2. * pt.vel) * u.dt;
                        pt.pos += pt.vel * u.dt;
                        p[i] = pt;       
                    }`;
                const rShader = `${common}
                    @group(0) @binding(0) var<storage, read> p: array<P>;
                    @vertex fn vs(@builtin(vertex_index) i: u32) -> @builtin(position) vec4<f32> {
                        return vec4<f32>(p[i].pos, 0.0, 1.0);
                    }
                    @fragment fn fs() -> @location(0) vec4<f32> { return vec4<f32>(1.0, 0.0, 1.0, 1.0); }`;

                const pData = new Float32Array(this.numParticles * 4);
                for(let i=0; i<pData.length; i+=4) {
                    pData[i] = Math.random() * 2 - 1; pData[i+1] = Math.random() * 2 - 1;
                    // pData[i+2] = 0; pData[i+3] = 0; // initial velocity        
                }
                this.pBuf = device.createBuffer({ size: pData.byteLength, usage: GPUBufferUsage.STORAGE|GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST, mappedAtCreation: true });
                new Float32Array(this.pBuf.getMappedRange()).set(pData);
                this.pBuf.unmap();       
                this.uBuf = device.createBuffer({ size: 16, usage: GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST });      

                this.cPipe = device.createComputePipeline({ layout: 'auto', compute: { module: device.createShaderModule({ code: cShader }), entryPoint: 'main' } });
                this.rPipe = device.createRenderPipeline({ layout: 'auto', vertex: { module: device.createShaderModule({ code: rShader }), entryPoint: 'vs' }, fragment: { module: device.createShaderModule({ code: rShader }), entryPoint: 'fs', targets: [{ format: this.format }] }, primitive: { topology: 'point-list' } });      

                this.cGroup = device.createBindGroup({ layout: this.cPipe.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer: this.pBuf } }, { binding: 1, resource: { buffer: this.uBuf } }] });
                this.rGroup = device.createBindGroup({ layout: this.rPipe.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer: this.pBuf } }] });     

                this.loop();
            }

            loop() {
                if(!this.running) return;

                stats.begin();

                this.device.queue.writeBuffer(this.uBuf, 0, new Float32Array([mouse.x, mouse.y, 0.016]));
                const enc = this.device.createCommandEncoder();

                const cPass = enc.beginComputePass();
                cPass.setPipeline(this.cPipe);
                cPass.setBindGroup(0, this.cGroup);
                cPass.dispatchWorkgroups(Math.ceil(this.numParticles / 64));      
                cPass.end();

                const rPass = enc.beginRenderPass({ colorAttachments: [{ view: this.context.getCurrentTexture().createView(), loadOp: 'clear', clearValue: {r:0,g:0,b:0,a:1}, storeOp: 'store' }] });        
                rPass.setPipeline(this.rPipe);
                rPass.setBindGroup(0, this.rGroup);
                rPass.draw(this.numParticles);
                rPass.end();

                this.device.queue.submit([enc.finish()]);

                stats.end(); // End Measure
                requestAnimationFrame(() => this.loop());
            }
            destroy() { this.running = false; }
        }

        // ---------------------------------------------------------
        // Manager
        // ---------------------------------------------------------
        async function init() {
            const hasWebGPU = !!navigator.gpu;
            const gui = new dat.GUI({ width: 300 });

            // GUI: Mode Switch
            gui.add(CONFIG, 'mode', ['WebGL', 'WebGPU']).onChange(val => {        
                if(val === 'WebGPU' && !hasWebGPU) {
                    alert("WebGPU not supported!");
                    CONFIG.mode = 'WebGL';
                    return;
                }
                resetApp();
            });

            // GUI: Particle Count       
            gui.add(CONFIG, 'textureSize', SIZE_OPTIONS).name('Particle number').onChange(() => {
                resetApp();
            });

            function resetApp() {        
                if(currentApp) currentApp.destroy();

                // erase old canvas and create new one
                const old = document.querySelector('#render');
                if(old) old.remove();    
                const c = document.createElement('canvas');
                c.setAttribute('id', 'render');

                c.width = window.innerWidth;
                c.height = window.innerHeight;
                document.body.appendChild(c);

                const size = parseInt(CONFIG.textureSize);

                if(CONFIG.mode === 'WebGL') currentApp = new WebGLApp(c, size);   
                else currentApp = new WebGPUApp(c, size);
            }

            // Initial Start
            resetApp();

            // Handle Resize
            window.addEventListener('resize', () => {
                const c = document.querySelector('#render');
                if(c) { c.width = window.innerWidth; c.height = window.innerHeight; }
            });
        }

        init();
    </script>
</body>
</html>
```
</details>

## Wrap-up
WebGL is well-suited for rendering graphics on a canvas in a browser, offering simplicity and broad compatibility. However, it abstracts most of the GPU’s functionality, making it less versatile for modern needs, especially non-rendering tasks. WebGPU exposes GPU resources more directly and supports compute pipelines, so it fits workloads that need lower-level control, such as GPGPU tasks or more advanced rendering techniques.

## References
- [https://webgpufundamentals.org](https://webgpufundamentals.org/webgpu/lessons/webgpu-fundamentals.html)
- [https://gemini.google.com](https://gemini.google.com/share/f23e79dea16d)
