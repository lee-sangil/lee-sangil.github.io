---
title: "When Looking at a Parabola in Perspective"
categories:
 - Mathematics
tags:
 - parabola
 - perspective
header:
  teaser: /assets/image/thumbnail/2025-03-08-parabola.gif
excerpt_separator: <!--more-->
---

> Projecting a 3D object onto a 2D plane often involves transforming geometric equations into a perspective view. Here’s a fun observation: when you view a parabolic curve drawn on the xz-plane from the xy-plane through a perspective projection, the curve can appear as an ellipse. The animation below shows the transition between a parabolic curve and an ellipse depending on the change in projection. Let’s see how that happens. This post shows how a parabola equation is represented and transformed in perspective projection, with a particular focus on the derivation of this transformation. 

<!--more-->

<img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/6PEQ0Zn.gif">

## Problem definition

Let us imagine a parabolic curve drawn on a plane parallel to the xz-plane, defined by

$$
\begin{align}
z &= a x^2 + b x + c,\\\nonumber
y &= d,
\end{align}
$$

where $$a, b, c$$, and $$d$$ are constants, and $$x, y, z$$ represent the Cartesian coordinates. When a perspective transformation is applied, the 3D coordinates are projected onto the 2D plane using the following equations.

$$
\begin{align}
u &= x/z, \\
v &= y/z, \nonumber
\end{align}
$$

where $$u$$ and $$v$$ are the projected coordinates on the 2D plane. For simplicity, the focal length and principal point are assumed to be $$1$$ and $$0$$, respectively. 

## Problem solving

By substituting the parabola equation into perspective projection formula, we can rewrite the equation as:

$$
\begin{align}
u &= \frac{x}{a x^2 + b x + c}, \\
v &= \frac{d}{a x^2 + b x + c}. \nonumber
\end{align}
$$

To eliminate the variable $$x$$, we rearrange the expressions to obtain:

$$
a u^2 + \frac{b}{d} u v + \frac{c}{d^2} v^2 = \frac{a x^2 + b x + c}{(a x^2 + b x + c)^2} = \frac{1}{a x^2 + b x + c} = \frac{1}{d} v
$$

Finally, we obtain:

$$
a u^2 + \frac{b}{d} u + \frac{c}{d^2} v^2 - \frac{1}{d} v = 0
$$

This is the perspective-transformed equation relating $$u$$ and $$v$$. Although our original quadratic equation was a parabola in the xz‑plane, the perspective projection creates a conic equation, including circle, ellipse, hyperbola, that passes the origin.

## Special case

When $$a = 1, b = 0, c = 1$$ and $$d = 1$$, the parabolic equation is:

$$
z = x^2 + 1
$$

at $$y=1$$ plane. When viewing this parabola through a perspective projection, it appears as a circle:

$$
\begin{align}
u^2 + v^2 - v &= 0, \\\nonumber
u^2 + (v-\frac{1}{2})^2 &= \frac{1}{4}
\end{align}
$$

The animation at the top describes the transition between the above parabola and circle.

