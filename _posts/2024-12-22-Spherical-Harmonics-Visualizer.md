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
<br/>

Spherical Harmonics (SH) are a set of mathematical functions that define the surface of a sphere in terms of angular coordinates (latitude and longitude). They are widely used in various fields, including quantum physics, chemistry, and, computer graphics, to represent data on spherical surfaces. Especially, it has been famous since it can be used in computer vision for rendering surface dependently with view direction. In the above interactive demo, you can control the coefficients of spherical harmonics, and see the result. _Red_, _Green_, _Blue_ modes describe each color using SH coefficients, and _Height_ transforms the shape of sphere.

Mathematically, spherical harmonics are solutions to Laplace’s equation in spherical coordinates. Each spherical harmonic is indexed by two integers: the degree $$\ell$$ (representing the resolution or detail) and the order $$m$$ (representing angular variation). They are expressed as:

$$
Y_\ell^m (\theta, \phi) = C \cdot P_\ell^m (\cos \theta) \cdot e^{i m \phi},
$$

where $$P_\ell^m (x)$$ is associated Legendre polynomial of degree $$m$$, $$\theta$$ is polar angle (0 to $$\pi$$), $$\phi$$ is azimuthal angle (0 to $$2\pi$$), and $$C$$ is a normalizing factor to

$$
\begin{align}
&\int {||Y_\ell^m (\theta, \phi)||^2} d\Omega \\\nonumber =& \int {||Y_\ell^m (\theta, \phi)||^2} \sin \theta d\theta\phi
\end{align}
$$

be one. 

For negative $$m$$, it is expressed as:

$$
Y_\ell^{m}(\theta, \phi) = (-1)^{\mid m\mid} Y_\ell^{\mid m\mid}(\theta, \phi)^*.
$$

## Associated Legendre Polynomials

Associated Legendre polynomials, denoted as $$P_\ell^m(x)$$, arise from solving Laplace’s equation in spherical coordinates. They are an extension of the standard Legendre polynomials $$P_\ell(x)$$, introduced by Adrien-Marie Legendre in the 18th century for solving problems in celestial mechanics and potential theories. 
  
When the azimuthal symmetry is broken (i.e., when the problem depends on both the polar and azimuthal angles), the solution involves a family of functions called the Associated Legendre polynomials. These polynomials are essential in spherical harmonics, quantum mechanics, and any field that involves spherical symmetry. The Legendre polynomials are solutions to Legendre’s differential equation:

$$
\frac{d}{dx} \left[ (1 - x^2) \frac{dP_\ell(x)}{dx} \right] + \ell(\ell+1)P_\ell(x) = 0.
$$

They can be defined explicitly using Rodrigues’ formula:

$$
P_\ell(x) = \frac{1}{2^\ell \ell!} \frac{d^\ell}{dx^\ell} \left( x^2 - 1 \right)^\ell,
$$

where $$\ell ~(\ell \geq 0)$$ is the degree of the polynomial. The Associated Legendre polynomials are derived from the Legendre polynomials by introducing the order $$m ~(\mid m\mid  \leq \ell)$$, using the formula:

$$
P_\ell^m(x) = (1 - x^2)^{m/2} \frac{d^m}{dx^m} P_\ell(x),
$$

where $$m$$ is the degree of angular variation, represented by the derivative. For negative degree, $$m$$, the Associated Legendre polynomials are related to those for positive $$\mid m\mid $$ by:

$$
P_\ell^{m}(x) = (-1)^{\mid m\mid } \frac{(\ell-\mid m\mid )!}{(\ell+\mid m\mid )!} P_\ell^{\mid m\mid }(x).
$$ 

This relationship ensures symmetry properties of the polynomials and is often used in spherical harmonics.

## Orthogonality

Spherical harmonic functions satisfy the orthogonality property:

$$
\int_{\Omega} Y_\ell^m(\theta, \phi) Y_{\ell{'}}^{m{'}*}(\theta, \phi) \, d\Omega = \delta_{\ell \ell{'}} \delta_{m m{'}},
$$

where $$\Omega$$ denotes the spherical surface (with integration over $$\theta$$ from $$0$$ to $$\pi$$ and $$\phi$$ from $$0$$ to $$2\pi$$), $$\delta_{\ell \ell{'}}$$ and $$\delta_{m m{'}}$$ are Kronecker delta functions, and the superscript $$*$$ denotes complex conjugation.

This orthogonality implies that spherical harmonics form an orthonormal basis, meaning any function $$f(\theta, \phi)$$ defined on the sphere can be uniquely decomposed into a weighted sum of spherical harmonics.

## Decomposition and Expansion
To represent a function $$f(\theta, \phi)$$ on the sphere using spherical harmonics, we need to compute its coefficients $$c_\ell^m$$. These coefficients are obtained via:

$$
c_\ell^m = \int_{\Omega} f(\theta, \phi) Y_\ell^{m*}(\theta, \phi) \, d\Omega
$$

Once the coefficients $$c_\ell^m$$ for $$\ell = 0, \ldots, L$$ are obtained, the original function $$f(\theta, \phi)$$ can be approximated using a finite series expansion of spherical harmonics:

$$
f(\theta, \phi) \approx \sum_{\ell=0}^L \sum_{m=-\ell}^\ell c_\ell^m Y_\ell^m(\theta, \phi),
$$

where $$L$$ is the maximum degree of harmonics used in the approximation. A higher $$L$$ captures finer details but increases computational cost. The image below shows the Earth's texture rendered as an expansion of spherical harmonics. As the value of $$L$$ increases, we can see more details emerging.

<img class="imageWideFull" referrerpolicy="no-referrer" src="https://i.imgur.com/xU3I2SJ.gif">
