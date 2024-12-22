---
title: "Spherical Harmonics Visualizer"
categories:
 - Mathematics
tags:
 - spherical harmonics
 - computer graphics
 - javascript
 - three.js
 - glsl
 - webgl
 - shader
header:
  teaser: /assets/image/thumbnail/2024-12-22-spherical-harmonics.jpg
excerpt_separator: <!--more-->
---

> This article introduces Spherical Harmonics (SH) and explains their mathematical foundation and applications. It covers how SH functions are used to represent data on spherical surfaces, particularly in computer graphics, including 3D Gaussian Splatting field. The interactive demo allows users to manipulate SH coefficients and observe their effects on color representation (Red, Green, Blue) and the deformation of a spherical surface (Height). The article also explains the role of Associated Legendre polynomials in SH. The article aims to provide an intuitive understanding of SH.

<!--more-->

{% include /assets/spherical_harmonics.html %}

Spherical Harmonics (SH) are a set of mathematical functions that define the surface of a sphere in terms of angular coordinates (latitude and longitude). They are widely used in various fields, including quantum physics, chemistry, and, computer graphics, to represent data on spherical surfaces. Especially, it has been famous since it can be used in computer vision for rendering surface dependently with view direction. In the above interactive demo, you can control the coefficients of spherical harmonics, and see the result. _Red_, _Green_, _Blue_ modes describe each color using SH coefficients, and _Height_ transforms the shape of sphere.

Mathematically, spherical harmonics are solutions to Laplace’s equation in spherical coordinates. Each spherical harmonic is indexed by two integers: the degree $$l$$ (representing the resolution or detail) and the order $$m$$ (representing angular variation). They are expressed as:

$$
Y_l^m (\theta, \phi) = C \cdot P_l^m (\cos \theta) \cdot e^{i m \phi},
$$

where $$P_l^m (x)$$ is associated Legendre polynomial of degree $$m$$, $$\theta$$ is polar angle (0 to $$\pi$$), $$\phi$$ is azimuthal angle (0 to $$2\pi$$), and $$C$$ is a normalizing factor to

$$
\begin{align}
&\int {||Y_l^m (\theta, \phi)||^2} d\Omega \\\nonumber =& \int {||Y_l^m (\theta, \phi)||^2} \sin \theta d\theta\phi
\end{align}
$$

be one. 

For negative $$m$$, it is expressed as:

$$
Y_l^{m}(\theta, \phi) = (-1)^{\mid m\mid} Y_l^{\mid m\mid}(\theta, \phi)^*.
$$

## Associated Legendre Polynomials

Associated Legendre polynomials, denoted as $$P_l^m(x)$$, arise from solving Laplace’s equation in spherical coordinates. They are an extension of the standard Legendre polynomials $$P_l(x)$$, introduced by Adrien-Marie Legendre in the 18th century for solving problems in celestial mechanics and potential theories. 
  
When the azimuthal symmetry is broken (i.e., when the problem depends on both the polar and azimuthal angles), the solution involves a family of functions called the Associated Legendre polynomials. These polynomials are essential in spherical harmonics, quantum mechanics, and any field that involves spherical symmetry. The Legendre polynomials are solutions to Legendre’s differential equation:

$$
\frac{d}{dx} \left[ (1 - x^2) \frac{dP_l(x)}{dx} \right] + l(l+1)P_l(x) = 0.
$$

They can be defined explicitly using Rodrigues’ formula:

$$
P_l(x) = \frac{1}{2^l l!} \frac{d^l}{dx^l} \left( x^2 - 1 \right)^l,
$$

where $$l ~(l \geq 0)$$ is the degree of the polynomial. The Associated Legendre polynomials are derived from the Legendre polynomials by introducing the order $$m ~(\mid m\mid  \leq l)$$, using the formula:

$$
P_l^m(x) = (1 - x^2)^{m/2} \frac{d^m}{dx^m} P_l(x),
$$

where $$m$$ is the degree of angular variation, represented by the derivative. For negative degree, $$m$$, the Associated Legendre polynomials are related to those for positive $$\mid m\mid $$ by:

$$
P_l^{m}(x) = (-1)^{\mid m\mid } \frac{(l-\mid m\mid )!}{(l+\mid m\mid )!} P_l^{\mid m\mid }(x).
$$ 

This relationship ensures symmetry properties of the polynomials and is often used in spherical harmonics.