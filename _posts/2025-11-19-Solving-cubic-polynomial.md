---
title: "Solving the Roots of a Cubic Polynomial"
categories:
 - Mathematics
tags:
 - polynomial
 - cubic
 - root
header:
  teaser: /assets/image/thumbnail/2025-11-19-cubic-complex-plane.jpg
excerpt_separator: <!--more-->
---

> This article explains how to solve roots of a cubic polynomial in the complex plane. I use the depressed form of the cubic polynomial and Cardano's formula. Additionally, I demonstrate an interactive demo which visualizes the roots of a cubic polynomial. 

<!--more-->

{% include /assets/cubic_polynomial.html %}
<br/>

There is a cubic polynomial which has a single variable, $$x$$, and its highest exponent is 3:

$$
f(x): a x^3 + b x^2 + c x + d = 0,
$$

where $$a \neq 0$$, $$b$$, $$c$$, $$d$$ are real numbers. 

## Tschirnhaus transformation

Using Tschirnhaus transformation can eliminate $$x^2$$ term and depress the cubic polynomial for simplicity. Let $$x$$ be $$(y-p)$$ and substitute $$x$$ in the cubic polynomial. 

$$
\begin{align}
f(y-p) &= a (y-p)^3 + b (y-p)^2 + c (y-p) + d \\
&= a y^3 + (-3ap + b) y^2 + (3ap^2 -2 bp + c)y + (-ap^3 + bp^2 -cp + d) \\
&= 0
\end{align}
$$

When we set $$p=\frac{b}{3a}$$, the coefficient of $$y^2$$ term becomes zero. Then, let's rearrange the polynomial, making the coefficient of $$y^3$$ term be 1:

$$
g(y): y^3 + q y + r = 0,
$$

where 

$$
\begin{align}
q &= \frac{3ac-b^2}{3a^2},\\
r &= \frac{2b^3-9abc+27a^2d}{27a^3}.\\
\end{align}
$$

## Cardano's formula

Let the root $$y$$ can be decomposed as into $$u$$, $$v$$, such that

$$
y = u+v. 
$$

Then, the depressed cubic polynomial is transformed into

$$
\begin{align}
&(u+v)^3 + q(u+v) + r \nonumber \\
&= u^3 + 3u^2v + 3uv^2 + 3uv^3 + q(u+v) + r \nonumber\\
&= u^3 + v^3 + r + (u+v)(3uv+q) = 0. 
\end{align}
$$

For arbitrary $$q$$, $$r$$, when $$u$$ and $$v$$ satisfy $$u^3+v^3=-r$$, $$uv = -q/3$$, the above equation is established. If $$u+v = 0$$ is satisfied, $$r$$ should be zero, which is a special case. Then, what we can do is to find $$u$$, $$v$$ using the above both equations and solve $$x = u+v-p$$. When we cube the latter equation, we obtain

$$
\begin{align}
u^3+v^3&=-r, \\
u^3v^3 &= -q^3/27. 
\end{align}
$$

Let $$m=u^3$$, $$n=v^3$$ for simplicity. Then $$m$$, $$n$$ satisfy

$$
\begin{align}
m+n &=-r, \\
mn &= -q^3/27,
\end{align}
$$

and this means $$m$$, $$n$$ are the roots of the below quadratic polynomial:

$$
t^2 + rt -\frac{q^3}{27}
$$

Therefore, $$m$$, $$n$$ are obtained as

$$
\begin{align}
m &= -\frac{r}{2} + \frac{1}{2}\sqrt{r^2 + \frac{4}{27}q^3}, \\
n &= -\frac{r}{2} - \frac{1}{2}\sqrt{r^2 + \frac{4}{27}q^3}. \\
\end{align}
$$

Also, $$u$$, $$v$$ are computed by

$$
\begin{align}
u &= \sqrt[3]{m},~ \omega\sqrt[3]{m}, \text{ or }~ \omega^2\sqrt[3]{m},\\
v &= \sqrt[3]{n},~ \omega\sqrt[3]{n}, \text{ or }~ \omega^2\sqrt[3]{n}, \\
\end{align}
$$

where $$\sqrt[3]{m}$$, $$\sqrt[3]{n}$$ are the real cube root of $$m$$, $$n$$, and $$\omega=-\frac{1}{2} + \frac{\sqrt{3}}{2}i$$ is a complex number such that $$\omega^3=1$$ is satisfied. Since $$uv=-q/3$$ is a real number, the possible combinations of $$u$$, $$v$$ are

$$
\begin{align}
(u, v) = &(\sqrt[3]{m}, \sqrt[3]{n}),\\&(\omega\sqrt[3]{m}, \omega^2\sqrt[3]{n}),\\&(\omega^2\sqrt[3]{m}, \omega\sqrt[3]{n}). 
\end{align}
$$

In summary, for a cubic polynomial,

$$
a x^3 + b x^2 + c x + d = 0,
$$

the roots are

$$
\begin{align}
x_1 &= \sqrt[3]{-\frac{r}{2} + \frac{1}{2}\sqrt{r^2 + \frac{4}{27}q^3}} + \sqrt[3]{-\frac{r}{2} - \frac{1}{2}\sqrt{r^2 + \frac{4}{27}q^3}},\\
x_2 &= (-\frac{1}{2} + \frac{\sqrt{3}}{2}i)\sqrt[3]{-\frac{r}{2} + \frac{1}{2}\sqrt{r^2 + \frac{4}{27}q^3}} + (-\frac{1}{2} - \frac{\sqrt{3}}{2}i)\sqrt[3]{-\frac{r}{2} - \frac{1}{2}\sqrt{r^2 + \frac{4}{27}q^3}},\\
x_3 &= (-\frac{1}{2} - \frac{\sqrt{3}}{2}i)\sqrt[3]{-\frac{r}{2} + \frac{1}{2}\sqrt{r^2 + \frac{4}{27}q^3}} + (-\frac{1}{2} + \frac{\sqrt{3}}{2}i)\sqrt[3]{-\frac{r}{2} - \frac{1}{2}\sqrt{r^2 + \frac{4}{27}q^3}},
\end{align}
$$

where 

$$
\begin{align}
q &= \frac{3ac-b^2}{3a^2},\\
r &= \frac{2b^3-9abc+27a^2d}{27a^3}.\\
\end{align}
$$