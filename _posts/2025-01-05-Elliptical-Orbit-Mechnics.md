---
title: "Elliptical Orbit Geometry and Mechanics"
categories:
 - Mathematics
tags:
 - astrodynamics
 - celestial mechanics
 - orbital mechanics
 - physics
header:
  teaser: /assets/image/thumbnail/2025-01-05-orbit-mechanics.jpeg
toc: true
toc_sticky: true
excerpt_separator: <!--more-->
---

> This post explains the mathematical principles and dynamics of elliptical orbits in celestial mechanics. To fully grasp how planets move and where they are at any given time, it begins by introducing the concept of planetary orbits as ellipses, following Johannes Kepler’s first law of planetary motion. Key orbital parameters such as semi-major axis, eccentricity, periapsis, and apoapsis are introduced to describe the orbit’s shape. Also, the orientation of the orbit plane are described by using longitude of the ascending node, inclination, and argument of periapsis. Additionally, the concept of mean anomaly, true anomaly, and eccentric anomaly is discussed to calculate the planet’s position at a given time. 

<!--more-->

## The Elliptical Orbits of Planets

Planets in the solar system travel around the Sun along paths that are not perfect circles but ellipses. This elliptical motion was first described by Johannes Kepler in his first law of planetary motion. An ellipse can be thought of as a “stretched-out” circle, characterized by its two focuses; one of which is occupied by the Sun. The ellipse centered at the origin can be mathematically expressed in Cartesian coordinates, 

$$
\frac{x^2}{a^2} + \frac{y^2}{b^2} = 1,
$$

where $$a$$ is the semi-major axis, i.e. the longest radius in the ellipse, and $$b$$ is the semi-minor axis, i.e. the shortest radius in the ellipse. To describe the shape of an ellipse, we also use a parameter called eccentricity, $$e~(0\leq e \lt 1)$$. Eccentricity is defined by $$e:={\sqrt{a^2-b^2}}/{a}$$, and two focuses are located at $$(\pm ea, 0)$$. Eccentricity quantifies how elongated the ellipse is, with a value of 0 indicating a perfect circle and values closer to 1 meaning a more elongated shape.

Elliptical orbits are often expressed in polar coordinates, where the position on the ellipse is described in terms of its distance from the right focus, $$r=\sqrt{(x - ea)^2 + y^2}$$, and its angle relative to the positive x-axis, $$\theta$$:

$$
r = \frac{a(1-e^2)}{1+e \cos \theta}
$$

To derive the above equation, we take one of the focuses, $$(ea, 0)$$, as the origin and use the formula that the sum of distances from two focuses to any point on the ellipse is equal to twice the semi-major axis.

Then, one focus is located at $$(0, 0)$$ and another focus is located at $$(-2ea, 0)$$. For an arbitrary point, $$(x, y)$$, on the ellipse, the sum of distances from two focuses satisfies

$$
\sqrt{x^2 + y^2} + \sqrt{(x+2ea)^2 + y^2} = 2a.
$$

Using $$\sqrt{x^2 + y^2} = r$$, we subtract $$r$$ from both sides and square them.

$$
(x+2ea)^2 + y^2 = (2a - r)^2
$$

Then, we substitute $$x$$ and $$y$$ with $$r \cos \theta$$ and $$r \sin \theta$$, respectively.

$$
r^2 + 4ea\cdot r \cos \theta + 4e^2a^2 = 4a^2 - 4ar + r^2
$$

By rearranging it, we obtain

$$
r = \frac{4a^2 - 4e^2a^2}{4a + 4ea \cdot \cos \theta} = \frac{a (1-e^2)}{1+e \cos \theta}
$$

## How to Compute a Planet’s Position in Orbit Plane

After defining the shape of the orbit of a planet, we have to determine the position of the plant at a given time. The actual position of a planet along its orbit at a specific time is referred to as the true anomaly. Calculating the true anomaly, however, requires a series of intermediate steps involving two additional angles, mean anomaly and eccentric anomaly.

<img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/HHls6bv.png">

### Mean anomaly

Mean anomaly is a hypothetical angle assuming the planet moves at a constant speed along a circular orbit with the same period as the elliptical orbit. The period of an elliptical orbit is $$T = \sqrt{\frac{4\pi^2}{Gm} a^3}$$, where $$G$$ is the gravitational constant and $$a$$ is the radius of orbit at apoapsis. Therefore, the radius of hypothetical circle for mean anomaly is also $$a$$ as shown in the above figure.

Mean anomaly, $$M$$, at arbitrary time $$t$$ is defined by

$$
M = \frac{2\pi}{T} (t-t_p), \tag{1}\label{eq:mean-anomaly}
$$

where $$T = \sqrt{\frac{4\pi^2}{Gm} a^3}$$ is an orbit period and $$t_p$$ is the time through the periapsis. 

### Eccentric anomaly

Eccentric anomaly is an intermediate angle that relates the mean anomaly to the true anomaly through the geometry of the ellipse. It denotes an angle between semi-major axis and a point on the auxiliary circle whose $$x$$ position is the same with true position.

Eccentric anomaly, $$E$$, is computed from

$$
M = E - e \cdot \sin E,\tag{2}\label{eq:ecc-anomaly}
$$
^eq-ecc-anomaly

where $$e$$ is the eccentricity, and the above equation is called as Kepler's equation. 

<img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/UGOPv1q.png">

To derive Kepler's equation, we use Kepler's second law of planetary motion: A line segment joining a planet and the Sun sweeps out equal areas during equal intervals of time[^wiki-kepler-law]. In the above figure, the green and blue areas must be the same ratio to the orbital areas, according to Kepler's second law. The size of the green area, $$S_E$$, is as follows.

$$
S_E = \frac{1}{2} a^2 E - \frac{1}{2} ae \cdot a\sin E
$$

Consequently, the size of the blue area is 

$$
S = \frac{b}{a} S_1 = \frac{1}{2} a b (E - e \sin E).\tag{3}\label{eq:kepler-second-law}
$$

Therefore, $$S_M$$ and $$S$$ satisfy

$$
\frac{S_M}{\pi a^2} = \frac{M a^2}{2 \pi a^2} = \frac{S}{\pi a b}.
$$

By substituting $$S$$ with Eq. \eqref{eq:kepler-second-law} at the above equation, finally, we obtain Eq. \eqref{eq:ecc-anomaly}.

For a given $$M$$, $$E$$ can be solved by the manner of optimization. Let $$f(E) = E - e \cdot \sin E - M$$. Then, we want the value of $$f(E)$$ to be zero. Since $$f'(E) = 1 - e \cdot \cos E$$, we can update $$E$$ iteratively by Newton-Raphson method:

$$
\begin{align}
E_{i+1} &= E_i - f(E_i)/f'(E_i) \\\nonumber
&= E_i - \frac{E_i - e \cdot \sin E_i - M}{1 - e \cdot \cos E_i}. 
\end{align}
$$

### True anomaly

Lastly, true anomaly is derived from

$$
\cos \theta = \frac{\cos E - e}{1 - e\cdot \cos E}, \tag{4}\label{eq:true-anomaly}
$$

where $$E$$ is an eccentric anomaly and $$e$$ is the eccentricity. 

From the above figure, using the $$x$$ values of two points corresponding to true and eccentric anomalies are the same with each other, the below equation can be established.

$$
ea + r \cos\theta = a \cos E
$$

By substituting $$r$$ with $$a(1-e^2)/(1+e \cos\theta)$$, the above equation will be modified as

$$
\frac{a(1-e^2)\cos \theta}{1+e\cos\theta} = a (\cos E - e).
$$

By rearranging the equation in terms of $$\theta$$, finally, we obtain Eq. \eqref{eq:true-anomaly}.

To avoid numerical issue at $$E$$ is near $$\pm\pi$$, when we use a relationship

$$
\tan^2 \frac{E}{2} = \frac{1 - \cos E}{1 + \cos E},
$$

then, we obtain

$$
\tan \frac{\theta}{2} = \sqrt{\frac{1 + e}{1 - e}} \tan \frac{E}{2}. 
$$

Finally, we can compute the position of a planet at a specific time and describe the motion of a planet using these three anomalies.

## Orientation of Orbit Plane

The elliptical orbits of planets are not perfectly aligned with one another; instead, as shown in the below figure, each orbit is tilted relative to a reference plane known as the ecliptic plane (the plane of Earth’s orbit around the Sun). This tilt introduces additional complexity when describing planetary motion.

<img class="image640" referrerpolicy="no-referrer" src="https://i.imgur.com/Ecwjw9L.jpeg">

### Orbit Parameters
To describe the orientation of a planet’s orbit in three-dimensional space, three angular parameters are used:

* **Longitude of the ascending node, $$\Omega$$**: The angle between the reference direction and the ascending node. 

* **Inclination, $$i$$**: The angle between the planet’s orbital plane and the reference plane.

* **Argument of periapsis, $$\omega$$**: The angle between the ascending node and the periapsis.

These parameters fully specify the orientation of a planet’s orbit and provide a framework for tracking its position. For a satellite orbiting a planet, the plane of reference is usually the plane containing the planet's equator [^wiki_inclination]. For planets in the Solar system, the reference plane and the reference direction are usually the ecliptic, the orbit plane of Earth, and the vernal equinox direction, respectively. 

* **Vernal equinox direction, ♈︎**: The direction pointing to the sun from the earth when the sun passes through the ascending node of the earth. 

* **Ascending node, ☊**: The point where the planet crosses the reference plane (e.g., the ecliptic plane) moving upward.

* **Descending node, ☋**: The opposite point of the ascending node.

## How to Compute a Planet's Position in Reference Coordinates

To mathematically describe the orbital orientation of a planet, we can use a coordinate transformation process. To convert the coordinates from the orbital plane to the reference frame (ecliptic plane), we apply three successive rotations:

1. Rotate by $$\Omega$$ (longitude of the ascending node):

This aligns the ascending node with the inclination axis in the ecliptic plane.

$$
\mathrm{R}_z (\Omega) =
\begin{bmatrix}
\cos \Omega & -\sin \Omega & 0 \\
\sin \Omega & \cos \Omega & 0 \\
0 & 0 & 1
\end{bmatrix}
$$

2. Rotate by $$i$$ (inclination):

This tilts the orbital plane relative to the ecliptic plane.

$$
\mathrm{R}_x (i) =
\begin{bmatrix}
1 & 0 & 0 \\
0 & \cos i & -\sin i \\
0 & \sin i & \cos i
\end{bmatrix}
$$

3. Rotate by $$\omega$$ (argument of periapsis):

This accounts for the rotation of the ellipse within its orbital plane.

$$
\mathrm{R}_z (\omega) =
\begin{bmatrix}
\cos \omega & -\sin \omega & 0 \\
\sin \omega & \cos \omega & 0 \\
0 & 0 & 1
\end{bmatrix}
$$

A successively-multiplied rotation matrix, $$\mathrm{R}_z (\Omega)~ \mathrm{R}_x (i) ~ \mathrm{R}_z (\omega)$$, finally, transforms the planet's 2D position in the orbital plane into a 3D position in reference coordinates:

$$
\begin{align}
\mathbf{p}_\text{ref} &= 

\begin{bmatrix}
x_\text{ref} \\
y_\text{ref} \\
z_\text{ref}
\end{bmatrix} \\

&=

\begin{bmatrix}
\cos \Omega & -\sin \Omega & 0 \\
\sin \Omega & \cos \Omega & 0 \\
0 & 0 & 1
\end{bmatrix}

\begin{bmatrix}
1 & 0 & 0 \\
0 & \cos i & -\sin i \\
0 & \sin i & \cos i
\end{bmatrix}

\begin{bmatrix}
\cos \omega & -\sin \omega & 0 \\
\sin \omega & \cos \omega & 0 \\
0 & 0 & 1
\end{bmatrix}

\begin{bmatrix}
r \cos \theta \\
r \sin \theta \\
0
\end{bmatrix},
\end{align}
$$

where $$r=a (1-e^2)/(1+e \cos \theta)$$ is radial distance from the center of the orbit, and $$\theta$$ is the true anomaly at a given time.

### How to Determine a Planet's Position at a Given Time

Finally, the last remaining term needed to determine a planet's position at a given time is $$t_p$$ in Eq. \eqref{eq:mean-anomaly}. Instead of using a time offset in Eq. \eqref{eq:mean-anomaly}, I've used mean anomaly offset, $$M_0$$:

$$
M = \frac{2 \pi}{T}t + M_{0}
$$

$$M_0$$ represents the planetary mean anomaly at the autumn equinox of 2000, i.e. 17:27 UTC on September 22, 2000. Then, Earth’s position is determined as the autumnal equinox point. To determine the position of other planets and their moons, I've used software such as Stellarium to identify the right ascension and declination of them in Earth’s coordinates. By finding the intersection (or nearest point) of each planet’s and moon’s orbit with a ray extending in the direction of their respective right ascension and declination from Earth’s center, the positions of all celestial bodies can be computed.

<img class="imageWideFull" referrerpolicy="no-referrer" src="https://i.imgur.com/3QxMEFk.png">

The figure above shows the dot product between the ray and the vector $$\mathbf{v} = \mathbf{x}_{\text{obj}} - \mathbf{x}_{\text{earth}}$$ as a function of the true anomaly (orbital phase) of each planet or moon. $$\mathbf{x}_{obj}$$ and $$\mathbf{x}_{earth}$$ are the 3D position of a celestial object and the Earth in the reference coordinates. When the dot product is close to 1, it means the direction of the ray matches the direction of the planet or moon at that point in its orbit. These orbital phases represent the true anomaly values for each planet or moon at the autumnal equinox of the year 2000.

[^wiki-kepler-law]: [Kepler's_laws_of_planetary_motion](https://en.wikipedia.org/wiki/Kepler%27s_laws_of_planetary_motion)
[^wiki_inclination]: [Orbital_inclination](https://en.wikipedia.org/wiki/Orbital_inclination)