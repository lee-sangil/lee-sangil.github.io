---
title: "Understanding the Variations of Cellular Noise"
prefix: "WebGL"
categories:
 - WebGL
tags:
 - glsl
 - webgl
 - shader
 - worley
 - voronoi
 - cellular
 - noise
header:
  teaser: /assets/image/thumbnail/2025-04-18-voronoi-diagram.gif
excerpt_separator: <!--more-->
---

> Cellular noise partitions space based on the distance to a set of seed points, producing organic, cell-like patterns. It finds applications in computer graphics, natural simulations, and generative art. In this post, we explore several variations of the cellular noise implemented in GLSL: Voronoise, boundary highlighting, weighted Voronoi, and hierarchical Voronoi. Each variation modifies either the distance metric or the visual representation of the cells to create distinct effects. Code examples are included to demonstrate how these patterns can be achieved using shader programming.

<!--more-->

A cellular noise, also called Worley noise and Voronoi noise, divides space into regions based on distance to a set of given points. Each point, often called a seed, creates a cell occupying positions that are closer to the seed point than to any other point. Theoretically, we must compute distance to all seed points to find its region. However, this is computationally expensive in shader code. In practice, we divide the canvas into a regular grid and place one seed point in each grid. This lets us limit our distance checks to the 9 neighboring grids around a pixel, significantly reducing computation while preserving the core structure. In the following sections, I’ll show various patterns that can be created using Voronoi geometry.

## Voronoi distance
This is the simplest version of cellular noise in GLSL. It computes the distances to the seed points of the 9 adjacent grids and outputs the smallest distance value.

<img class="image640" referrerpolicy="no-referrer" src="https://i.imgur.com/JwBeo9J.png">

```glsl
#ifdef GL_ES
precision mediump float;
#endif

#define N 5.

uniform vec2 u_resolution;

vec3 random3 (vec2 p)
{
  vec3 q = vec3( dot(p,vec2(127.1,311.7)), 
          dot(p,vec2(269.5,183.3)), 
          dot(p,vec2(419.2,371.9)) );
  return fract(sin(q)*43758.5453);
}

float voronoi (vec2 st) {
  // Tile the space
  vec2 i_st = floor(st);
  vec2 f_st = fract(st);

  float m_dist = N;

  for (int y= -1; y <= 1; y++)
  for (int x= -1; x <= 1; x++) {
    // Neighbor place in the grid
    vec2 neighbor = vec2(float(x),float(y));

    // Random position from current + neighbor place in the grid
    vec2 point = random3(i_st + neighbor).xy;

    // Distance to the point
    float dist = length(neighbor + point - f_st);

    // Keep the closer distance
    m_dist = min(m_dist, dist);
  }
  return m_dist;
}

void main() {
  vec2 st = gl_FragCoord.xy/u_resolution.xy;
  st.x *= u_resolution.x/u_resolution.y;

  float c = voronoi( N*(st) );
    
  gl_FragColor = vec4(vec3(c),1.0);
}
```

## Voronoi diagram
To determine not only the closest distance but also which seed the pixel belongs to, we store additional data: the grid coordinates of the closest seed point. This is done by replacing the `min` logic with an `if` condition that updates the result when a closer seed is found. The grid position `i_st + neighbor` of the closest seed becomes part of the return value, allowing us to color each region based on its seed’s position, creating a more defined cell-based diagram.

<img class="image640" referrerpolicy="no-referrer" src="https://i.imgur.com/m8k0R8v.png">

```glsl
vec3 voronoi (vec2 st) {
  // Tile the space
  vec2 i_st = floor(st);
  vec2 f_st = fract(st);

  vec3 m = vec3(N, 0., 0.);

  for (int y= -1; y <= 1; y++)
  for (int x= -1; x <= 1; x++) {
    // Neighbor place in the grid
    vec2 neighbor = vec2(float(x),float(y));

    // Random position from current + neighbor place in the grid
    vec2 point = random3(i_st + neighbor).xy;

    // Distance to the point
    float dist = length(neighbor + point - f_st);

    // Keep the closer distance
    if (dist < m.x) {
      m.x = min(m.x, dist);
      m.yz = i_st + neighbor;
    }
  }
  return m;
}

void main() {
  vec2 st = gl_FragCoord.xy/u_resolution.xy;
  st.x *= u_resolution.x/u_resolution.y;

  vec3 m = voronoi( N*st );
  vec3 color = random3( m.yz );
    
  gl_FragColor = vec4(color, 1.);
}
```

## Theoretical Voronoi boundary

To visualize cell boundaries, we may use the distance field and apply `smoothstep` to reveal border areas. I've substitute `gl_FragColor = vec4(vec3(smoothstep(0., 1.4142, c)),1.0)` for `gl_FragColor = vec4(vec3(c),1.0)`. However, this produces inconsistent boundary thickness and blurry image. A more precise approach involves calculating the distance from a point to the actual Voronoi edge—defined as the perpendicular bisector between two seed points.

To compute it, we need the position of the closest seed point and its neighboring seed points. When two seed points (the closest seed point, $$p_a$$, and a one of neighboring seed points, $$p_b$$) are given, the boundary between them is appeared at the middle of them, and its directional vector is perpendicular to the line segment between them, $$p_a - p_b$$. Thus, the distance from the boundary to a point, $$x$$, can be computed by the inner product between the line vector $$p_a - p_b$$ and $$x - p_c$$, where $$p_c$$ is an arbitrary point along the boundary. $$p_c = 0.5 * (p_a + p_b)$$ is a great choice. 

Finally, in the below code, there are two for-statements. The first one finds the closest seed point, and the second one computes the distance from all neighboring seed points. The following interactive image shows the difference between the above Voronoi distance and Voronoi boundaries described here. 

{% include assets/image_comparison_slider.html image_left="/assets/image/thumbnail/2025-04-20-voronoi-distance.png" image_right="/assets/image/thumbnail/2025-04-20-voronoi-boundary.png" text_left="Distance" text_right="Boundary" index=0 %}

```glsl
// Created by inigo quilez - iq/2013
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
// http://www.iquilezles.org/www/articles/voronoilines/voronoilines.htm
// Edited by Sangil Lee

#ifdef GL_ES
precision mediump float;
#endif

#define N 5.

uniform vec2 u_resolution;

vec3 random3 (vec2 p)
{
  vec3 q = vec3( dot(p,vec2(127.1,311.7)), 
          dot(p,vec2(269.5,183.3)), 
          dot(p,vec2(419.2,371.9)) );
  return fract(sin(q)*43758.5453);
}

float voronoi( in vec2 x ) {
  vec2 i_st = floor(x);
  vec2 f_st = fract(x);

  // first pass: regular voronoi
  vec2 closest_neighbor, closest_point;
  float min_dist = N;
  for (int j= -1; j <= 1; j++)
  for (int i= -1; i <= 1; i++) {
    vec2 neighbor = vec2(float(i),float(j));
    vec2 point = random3(i_st + neighbor).xy;

    float dist = length(neighbor + point - f_st);

    if ( dist < min_dist ) {
      min_dist = dist;
      closest_point = neighbor + point;
      closest_neighbor = neighbor;
    }
  }

  // second pass: distance to borders
  min_dist = N;
  for (int j= -2; j <= 2; j++)
  for (int i= -2; i <= 2; i++) {
    if (i == 0 && j == 0) continue;
    vec2 neighbor = closest_neighbor + vec2(float(i),float(j));
    vec2 point = random3(i_st + neighbor).xy;

    vec2 second_closest_point = neighbor + point;

    min_dist = min(min_dist, dot( 0.5*(closest_point+second_closest_point) - f_st, normalize(second_closest_point-closest_point) ));
  }
  return min_dist;
}

void main() {
  vec2 st = gl_FragCoord.xy/u_resolution.xy;
  st.x *= u_resolution.x/u_resolution.y;

  // Scale
  float c = voronoi(st*N);

  // borders
  vec3 color = vec3(0.);
  color = mix( vec3(1.0), color, smoothstep( 0.0, 0.05, c ) );
  gl_FragColor = vec4(color,1.0);
}
```

## Weighted Voronoi noise
In previous versions, all seeds used the same distance function, resulting in evenly sized cells. To introduce variety, we apply a weight to the distance, making some cells appear larger or smaller. A simple modification replaces `length(x - y)` with `1.0 / w * length(x - y)`. The weight `w` is randomly assigned per seed. This creates a dynamic, irregular cellular texture.

<img class="image640" referrerpolicy="no-referrer" src="https://i.imgur.com/Tf1FQgV.png">

```glsl
// The MIT License
// Copyright © 2025 Sangil Lee

#ifdef GL_ES
precision mediump float;
#endif

#define N 5.

uniform vec2 u_resolution;
uniform float u_time;

vec3 random3 (vec2 p)
{
  vec3 q = vec3( dot(p,vec2(127.1,311.7)), 
          dot(p,vec2(269.5,183.3)), 
          dot(p,vec2(419.2,371.9)) );
  return fract(sin(q)*43758.5453);
}

float my_dist (vec2 x, vec2 y, float w) {
  return 1./w * length(x-y);
}

float voronoi (vec2 st) {
  // Tile the space
  vec2 i_st = floor(st);
  vec2 f_st = fract(st);

  float m_dist = N;

  for (int y= -2; y <= 2; y++)
  for (int x= -2; x <= 2; x++) {
    // Neighbor place in the grid
    vec2 neighbor = vec2(float(x),float(y));

    // Random position from current + neighbor place in the grid
    vec2 point = random3(i_st + neighbor).xy;

    // Distance to the point
    float weight = 0.2 + 0.8*random3(i_st + neighbor).z;
    float dist = my_dist(neighbor + point, f_st, weight);

    // Keep the closer distance
    m_dist = min(m_dist, dist);
  }
  return m_dist;
}

void main() {
  vec2 st = gl_FragCoord.xy/u_resolution.xy;
  st.x *= u_resolution.x/u_resolution.y;

  float c = voronoi( N*(st) );
    
  gl_FragColor = vec4(vec3(c*0.5),1.0);
}
```

## Practical Voronoi boundary
For weighted Voronoi above, computing exact boundaries is not straightforward. Instead, we approximate the boundaries using finite differences. We assign each seed a unique ID, then evaluate the Voronoi function three times: one for the value of Voronoi value, another one for computing u-axis differential, and the other one for computing v-axis differential. 

To certainly distinguish the belonging cell from its adjacent cells, I assign ID of a cell as `x * N + y`, where `x` and `y` are the position of the corresponding grid. Next, I define a small displacement vector, `e = vec2(2.,0.)`. Then, `c = voronoi(st)` is the value of Voronoi noise, `ca = voronoi(st + e.xy / u_resolution)` and `cb = voronoi(st + e.yx / u_resolution)` are u-axis differential and v-axis differential maps, respectively. Finally, a fragment that satisfies `abs(c.y-ca.y) + abs(c.y-cb.y) > 0` belongs to boundaries. This technique allows us to highlight boundaries even when we can’t derive them analytically. The following interactive image shows the difference between the above weighted Voronoi noise and its boundaries. 

{% include assets/image_comparison_slider.html image_left="/assets/image/thumbnail/2025-04-20-voronoi-weighted.png" image_right="/assets/image/thumbnail/2025-04-20-voronoi-diagram.png" text_left="Distance" text_right="Boundary" index=1 %}

```glsl
// The MIT License
// Copyright © 2015 Inigo Quilez
// Edited by Sangil Lee

#ifdef GL_ES
precision mediump float;
#endif

#define N 5.

uniform vec2 u_resolution;

vec3 random3 (vec2 p)
{
  vec3 q = vec3( dot(p,vec2(127.1,311.7)), 
          dot(p,vec2(269.5,183.3)), 
          dot(p,vec2(419.2,371.9)) );
  return fract(sin(q)*43758.5453);
}

float my_dist (vec2 x, vec2 y, float w) {
  return 1./w * pow(length(x-y), 2.0);
}

vec2 voronoi (vec2 st) {
  // Tile the space
  vec2 i_st = floor(st);
  vec2 f_st = fract(st);

  float m_dist = N;
  float m_id;

  for (int y= -2; y <= 2; y++)
  for (int x= -2; x <= 2; x++) {
    // Neighbor place in the grid
    vec2 neighbor = vec2(float(x),float(y));

    // Random position from current + neighbor place in the grid
    vec2 point = random3(i_st + neighbor).xy;

    // Distance to the point
    float weight = 0.2 + 0.8*random3(i_st + neighbor).z;
    float dist = my_dist(neighbor + point, f_st, weight);

    // Keep the closer distance
    if (dist < m_dist) {
      m_dist = dist;
      m_id = (i_st + neighbor).x * N + (i_st + neighbor).y;
    }
  }
  return vec2(m_dist, m_id);
}

void main() {
  vec2 st = gl_FragCoord.xy/u_resolution.xy;
  st.x *= u_resolution.x/u_resolution.y;

  vec2 e = vec2(2.,0.);
  vec2 c = voronoi( N*(st) );
  vec2 ca = voronoi( N*(st + e.xy/u_resolution) );
  vec2 cb = voronoi( N*(st + e.yx/u_resolution) );
  
  vec3 col = random3(vec2(c.y));
  col *= 1.-smoothstep(0., 0.001, abs(c.y-ca.y) + abs(c.y-cb.y));
  
  gl_FragColor = vec4( col, 1.0 );
}
```

## Voronoise
As similar to the relationship between random and noise, voronoise (Voronoi + noise) uses a smoothing approach to obtain the interpolated value among the neighboring seed points. Instead of relying solely on the closest seed, we consider contributions from all nearby seeds, weighted inversely by distance. 

In the below example, the program does not only find the closest seed point and the distance from it, but also consider the attribute of all neighboring seed points and the distance from them. The distance is transformed to a weight by a custom weighting function. A small distance yields a large weight:
`w = 1.0 - smoothstep(0.0,1.4142,dist)`. 

To reduce the smoothing visual, we can choose a high value of `k` in `pow(w, k)`. Then the weight of the closest seed point will increase, whereas the remaining will decrease. The following interactive image shows the difference between Voronoi diagram and Voronoise. 

{% include assets/image_comparison_slider.html image_left="/assets/image/thumbnail/2025-04-20-voronoi-cell.png" image_right="/assets/image/thumbnail/2025-04-20-voronoi-smooth.png" text_left="Voronoi" text_right="Voronoise" index=2 %}

```glsl
// The MIT License
// Copyright © 2014 Inigo Quilez
// Edited by Sangil Lee

#ifdef GL_ES
precision mediump float;
#endif

#define N 5.

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

vec3 random3( vec2 p )
{
  vec3 q = vec3( dot(p,vec2(127.1,311.7)), 
          dot(p,vec2(269.5,183.3)), 
          dot(p,vec2(419.2,371.9)) );
  return fract(sin(q)*43758.5453);
}

float voronoise( in vec2 p, float k )
{
  vec2 i = floor(p);
  vec2 f = fract(p);
  
  vec2 a = vec2(0.0);
  for( int y = -2; y <= 2; y++ )
  for( int x = -2; x <= 2; x++ )
  {
    vec2 neighbor = vec2(x, y);
    vec2 point = random3(i + neighbor).xy;
    float dist = length(neighbor + point - f);
    
    float w = 1.0 - smoothstep(0.0,1.4142,dist);
    w = pow(w, k);
    float color = random3(i + neighbor).z;
    a += vec2(color*w, w);
  }

  return a.x/a.y;
}

void main()
{
  vec2 st = gl_FragCoord.xy/u_resolution.xy;
  st.x *= u_resolution.x/u_resolution.y;
  
  float c = voronoise( N*st, 10. );
  gl_FragColor = vec4( c, c, c, 1. );
}
```

## Hierarchical Voronoi
Hierarchical Voronoi diagrams are built by layering multiple levels of Voronoi patterns, similar to fractals. To implement a hierarchical structure, we need an additional parameter for each grid, which determine the level of hierarchy. Following example describes the fundamentals of hierarchical Voronoi, making easy to understand. 

In the example below, there are a 3x3 grid whose boundary is drawn by red lines, and an additional function, `level()`, that outputs 1 for the central grid only, otherwise 0. If the value of `level` is equal to 0, `md = min(md, d)` is executed like as the simple Voronoi noise. On the other hand, for the higher level of grid, we divide the grid into quarters, and find the closest distance. 

<img class="image240" referrerpolicy="no-referrer" src="https://i.imgur.com/GBYkYJJ.png">

```glsl
// The MIT License
// Copyright © 2015 Inigo Quilez
// Edited by Sangil Lee

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;

#define N 3.

float level(vec2 p)
{
  if (p.x == 1. && p.y == 1.)
    return 1.;
  return 0.;
}

float voronoi(vec2 st)
{
  vec2 n = floor(st);
  
  float md = 1e10;
  for( int i=-1; i<=1; i++ )
  for( int j=-1; j<=1; j++ ) {
    vec2 g1 = n + vec2(float(i),float(j));
    vec3 rr = vec3(0.5, 0.5, level(g1));
    vec2 o = g1 + rr.xy;
    float d = length(o - st);
    float z = rr.z;
    
    if( z == 0. ) {
      md = min(md, d);
    } else {
      for( int k=0; k<=1; k++ )
      for( int l=0; l<=1; l++ ) {
        vec2 g2 = g1 + vec2(float(k),float(l))/2.0;
        rr = vec3(0.5, 0.5, level(g2));
        o = g2 + rr.xy/2.0;
        d = length(o - st);
        z = rr.z;
          
        md = min(md, d);
      }
    }       
  }
  return md;
}

void main()
{
  vec2 st = gl_FragCoord.xy/u_resolution.xy;
  st.x *= u_resolution.x/u_resolution.y;
  
  st *= N;
  
  float c = voronoi(st);
  vec3 color = vec3(c);
  
  // Draw cell center
  color += 1.-smoothstep(0., .05, c);

  // Draw grid
  color.r += step(.98, fract(st.x)) + step(.98, fract(st.y));
  
  gl_FragColor = vec4(color, 1.0);
}
```

A hierarchical Voronoi with randomized levels is shown below. This creates a visual hierarchy where some regions are coarser and others more detailed, mimicking structures found in nature.

<img class="image640" referrerpolicy="no-referrer" src="https://i.imgur.com/IJ7Uooe.png">

```glsl
// The MIT License
// Copyright © 2015 Inigo Quilez
// Edited by Sangil Lee

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;

#define LEVEL 2
#define N 5.

vec3 rand3(vec2 p)
{
  vec3 q = vec3( dot(p,vec2(127.1,311.7)), 
          dot(p,vec2(269.5,183.3)), 
          dot(p,vec2(419.2,371.9)) );
  return fract(sin(q)*43758.5453);
}

float voronoi(vec2 st)
{
  vec2 n = floor(st);
  
  float md = 1e10;
  for( int i=-1; i<=1; i++ )
  for( int j=-1; j<=1; j++ ) {
    vec2 g1 = n + vec2(float(i),float(j));
    vec3 rr = rand3( g1 );
    vec2 o = g1 + rr.xy;
    float d = length(o - st);
    float z = rr.z;
    
    #if LEVEL > 0
    if( z < 0.75 )
    #endif            
    {
      md = min(md, d);
    }
    #if LEVEL > 0
    else {
      for( int k=0; k<=1; k++ )
      for( int l=0; l<=1; l++ ) {
        vec2 g2 = g1 + vec2(float(k),float(l))/2.0;
        rr = rand3( g2 );
        o = g2 + rr.xy/2.0;
        d = length(o - st);
        z = rr.z;
        
        #if LEVEL > 1
        if( z < 0.75 )
        #endif                    
        {
          md = min(md, d);
        }
        #if LEVEL > 1
        else {
          for( int n=0; n<=1; n++ )
          for( int m=0; m<=1; m++ ) {
            vec2 g3 = g2 + vec2(float(m),float(n))/4.0;
            rr = rand3( g3 );
            o = g3 + rr.xy/4.0;
            d = length(o - st);
            z = rr.z;

            md = min(md, d);
          }
        }
        #endif
      }
    }
    #endif        
  }
  return md;
}

void main()
{
  vec2 st = gl_FragCoord.xy/u_resolution.xy;
  st.x *= u_resolution.x/u_resolution.y;
  
  float c = voronoi(N*st);
  gl_FragColor = vec4(c, c, c, 1.0);
}
```

You can notice that subdivision code is repeated in for-statement as a hierarchy level increases. Thus, we can also implement the hierarchical Voronoi using a recursive function, however, GLSL does not support recursive functions unfortunately.

## Wrap-up
Using the above various versions of Voronoi noise, we can create various fractal Brownian motion. The following are some examples. 

| Voronoi distance                     | Voronoise                            |
| :----------------------------------: | :----------------------------------: |
| <img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/mLNAvH3.png"> | <img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/Kj0WfFU.png"> |

| Boundary                             | Distance from boundary               |
| :----------------------------------: | :----------------------------------: |
| <img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/iwT9Fua.png"> | <img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/tRMPD1M.png"> |

[^shaderpattern]: [\[WebGL\] Shader Design Patterns](https://sangillee.com/2024-05-25-shader-design-patterns/)