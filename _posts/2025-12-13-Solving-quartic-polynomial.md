---
title: "Solving the Roots of a Quartic Polynomial"
categories:
 - Mathematics
tags:
 - polynomial
 - quartic
 - root
header:
  teaser: /assets/image/thumbnail/2025-12-13-quartic-complex-plane.jpg
excerpt_separator: <!--more-->
---

> This article explains how to solve roots of a quartic polynomial in the complex plane. I use the depressed form of the quartic polynomial and Descartes' method. Additionally, I demonstrate an interactive demo which visualizes the roots of a quartic polynomial. 

<!--more-->

{% include /assets/quartic_polynomial.html %}
<br/>

There is a quartic polynomial which has a single variable, $$x$$, and its highest exponent is 4:

$$
f(x): a x^4 + b x^3 + c x^2 + d x + e = 0,
$$

where $$a \neq 0$$, $$b$$, $$c$$, $$d$$, $$e$$ are real numbers. 

## Tschirnhaus transformation

Using Tschirnhaus transformation can eliminate $$x^3$$ term and depress the quartic polynomial for simplicity. Let $$x$$ be $$(y-p)$$ and substitute $$x$$ in the quartic polynomial. 

$$
\begin{align}
f(y-p) =&~ a (y-p)^4 + b (y-p)^3 + c (y-p)^2 + d (y-p) + e \\
=&~ a y^4 + (-4ap + b) y^3 + (6ap^2 -3 bp + c)y^2 +\\
&~ (-4ap^3 + 3bp^2 -2cp + d)y + (ap^4 - bp^3 + cp^2 - dp + e) \\
=&~ 0
\end{align}
$$

When we set $$p=\frac{b}{4a}$$, the coefficient of $$y^3$$ term becomes zero. Then, let's rearrange the polynomial, making the coefficient of $$y^4$$ term be 1:

$$
g(y): y^4 + q y^2 + r y + s = 0,
$$

where 

$$
\begin{align}
q &= \frac{-3b^2+8ac}{8a^2},\\
r &= \frac{b^3-4abc+8a^2d}{8a^3},\\
s &= \frac{-3b^4+16ab^2c-64a^2bd+256a^3e}{256a^4}. \\
\end{align}
$$

## Descartes' method

Let the above quartic polynomial can be represented as the multiplication of two quadratic polynomials:

$$
\begin{align}
&y^4 + q y^2 + r y + s \\
&= (y^2 + ky + m)(y^2 + ly + n) \\
&= y^4 + (k+l)y^3 + (kl+m+n) y^2 + (kn+lm)y + mn
\end{align}
$$

Using that the coefficient of $$y^3$$ is zero, we obtain $$k+l=0$$. Thus, after eliminating $$l$$, the coefficients satisfy

$$
\begin{align}
m+n-k^2&=q, \\
k(n-m)&=r, \\
mn&=s. 
\end{align}
$$

For $$k=0$$, $$m+n=q$$ and $$mn=s$$ satisfy, thus $$m$$ and $$n$$ are the roots of the following quadratic polynomial:

$$
t^2 - qt + s = 0
$$

Consequently, 

$$
m, n = \frac{q}{2} \pm \frac{\sqrt{q^2-4s}}{2}. 
$$

Also, the above polynomial of $$y$$ can be rearranged as

$$
(y^2 + m)(y^2 + n) = 0. 
$$

Therefore, we obtain four roots:

$$
\begin{align}
y_1 &= \sqrt{-m},\\
y_2 &= -\sqrt{-m}, \\
y_3 &= \sqrt{-n}, \\
y_4 &= -\sqrt{-n},
\end{align}
$$

and

$$
\begin{align}
x_1 &= \sqrt{-\frac{q}{2}+ \frac{\sqrt{q^2-4s}}{2}}-p,\\
x_2 &= -\sqrt{-\frac{q}{2}+ \frac{\sqrt{q^2-4s}}{2}}-p, \\
x_3 &= \sqrt{-\frac{q}{2}- \frac{\sqrt{q^2-4s}}{2}}-p, \\
x_4 &= -\sqrt{-\frac{q}{2} - \frac{\sqrt{q^2-4s}}{2}}-p,
\end{align}
$$

On the other hands, for a non-zero $$k \neq 0$$, let us solve the polynomial. Please remind the below equations. 

$$
\begin{align}
m+n-k^2&=q, \\
k(n-m)&=r, \\
mn&=s. 
\end{align}
$$

By multiplying the first row by $$k$$ and adding/subtracting the second row, we obtain

$$
\begin{align}
2mk &= k^3 + qk - r, \\
2nk &= k^3 + qk + r. 
\end{align}
$$

Then, by multiplying the third row by $$k^2$$ and multiplying $$m$$ and $$n$$ above, a cubic polynomial of $$k^2$$ is derived.

$$
\begin{align}
(k^3 + qk - r)(k^3 + qk + r) &= 4sk^2\\
(k^2)^3 + 2q (k^2)^2 + (q^2-4s)(k^2) -r^2 &= 0
\end{align}
$$

By using Cardano’s formula, we can obtain the roots of the above cubic polynomial. Let the roots be $$u^2$$, $$v^2$$, $$w^2$$. Then, the roots of six-degree polynomial of $$k$$ are $$\pm u$$, $$\pm v$$, $$\pm w$$. 

Let’s get back to the depressed quartic polynomial:

$$
\begin{align}
&(y^2 + ky + m)(y^2 + ly + n) \\
&= (y^2 + ky + m)(y^2 - ky + n) = 0. 
\end{align}
$$

From two quadratic polynomials, the roots are 

$$
\begin{align}
y_1 &= -\frac{k}{2}+\frac{\sqrt{k^2-4m}}{2} \\
y_2 &= -\frac{k}{2}-\frac{\sqrt{k^2-4m}}{2} \\
y_3 &= \frac{k}{2}+\frac{\sqrt{k^2-4n}}{2} \\
y_4 &= \frac{k}{2}-\frac{\sqrt{k^2-4n}}{2} \\
\end{align}
$$

Since $$k$$ is the root of the above six-degree polynomial, and is $$u$$, $$v$$, or $$w$$. For now, let $$k=u$$. Then, 

$$
\begin{align}
m &= \frac{u^3 + qu - r}{2u}, \\
n &= \frac{u^3 + qu + r}{2u}. 
\end{align}
$$

and 

$$
\begin{align}
y_1 &= -\frac{u}{2}+\frac{\sqrt{u^2-4m}}{2} \\
&= \frac{u}{2}+\frac{\sqrt{u^3-2(u^3+qu-r)}}{2u} \\
&= \frac{u}{2}+\frac{\sqrt{u^3-2u^3+(u^2+v^2+w^2)u\pm2uvw)}}{2u} \\
&= \frac{u}{2}+\frac{\sqrt{v^2+w^2\pm2vw}}{2} \\
&= \frac{u \pm v \pm w}{2}, \\
\end{align}
$$

where $$u^2+v^2+w^2=-2q$$ and $$u^2v^2w^2=-r$$ from the relationship between coefficients and roots. Similarly, we can obtain

$$
\begin{align}
y_2 &= \frac{u \mp v \pm w}{2}, \\
y_3 &= \frac{-u \pm v \pm w}{2}, \\
y_4 &= \frac{—u \mp v \pm w}{2}. \\
\end{align}
$$

Even if we assume $$k=v$$ or $$w$$, the roots are derived as the same with the above. Because of three $$\pm$$ signs, there are 8 combinations of $$u$$, $$v$$, $$w$$. We can obtain the roots by computing the value of the quartic polynomial with 8 candidates and finding roots that produce zero.

In summary, for a quartic polynomial,

$$
a x^4 + b x^3 + c x^2 + d x + e = 0,
$$

The roots are among the values below.

$$
x_* = \frac{\pm u \pm v \pm w}{2} - p
$$

where $$u^2$$, $$v^2$$, $$w^2$$ are the roots of the cubic polynomial, $$h(t): t^3 + 2q t^2 + (q^2-4s)t -r^2 = 0$$, and

$$
\begin{align}
q &= \frac{-3b^2+8ac}{8a^2},\\
r &= \frac{b^3-4abc+8a^2d}{8a^3},\\
s &= \frac{-3b^4+16ab^2c-64a^2bd+256a^3e}{256a^4}. \\
\end{align}
$$