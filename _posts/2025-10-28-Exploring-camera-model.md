---
title: "Exploring Camera Models, Focusing on Distortion."
categories:
 - Vision
tags:
 - calibration
 - camera
 - pinhole
 - brownconrady
 - kannalabrandt
 - scaramuzza
 - ucm
 - ds
 - matlab
header:
  teaser: /assets/image/thumbnail/2025-10-28-camera-models.jpg
excerpt_separator: <!--more-->
---

> This post delves into the specifics of various camera models, exploring the mathematical and geometric concepts used to represent how a camera captures the world. However, when capturing world scenes through a camera, images suffer from distortions due to the physical properties of the lens. These distortions can significantly degrade the performance of computer vision applications, 3D reconstruction, and image processing tasks. Especially, I focus on the distortion of various camera models. This post will introduce five camera models: Brown-Conrady distortion, Kannala-Brandt, Scaramuzza, Unified, and Double Sphere models, exploring their schematic representations, mathematical formulas, and parameter estimation methods.

## Camera model
A camera model defines projection and unprojection mappings. A projection formula maps world points to image points on the image plane, whereas an unprojection formula maps image points to world points in homogeneous coordinates. For a pinhole camera model, there are several mappings, and has an explicit distortion model; world-to-normalized-plane, distortion, and, normalized-plane-to-image-plane. Brown-Conrady distortion model is placed in the middle, and processed on the normalized image plane. On the other hand, for example, the world-to-normalized-plane mapping of Scaramuzza camera model includes a distortion model inside itself. In the article, I’ll focus on describing a mapping that includes distortion model. 

Additionally, in the below interactive demo, you can choose a camera model, control its coefficients, and verify their role. The initial value of their parameters is computed by the above optimization method. The Scaramuzza model will be added soon.

{% include /assets/distort_image.html %}

## Brown-Conrady Distortion Model
The Brown-Conrady model is one of the most commonly used distortion models for standard and moderately wide-angle lenses. It effectively handles both radial distortion and tangential distortion.

- radial distortion: this distortion causes straight lines to curve, especially towards the edges of the image, appearing either barrel-shaped (pushed out from the center) or pincushion-shaped (pulled in towards the center).
- tangential distortion: this occurs when the lens and image sensor are not perfectly aligned, resulting in a slight skewing or tilting of the image.

### Mathematical Formula
For a 3D point $$(X, Y, Z)$$, the relationship between an undistorted point $$(x, y) = (X/Z, Y/Z)$$ and a distorted point $$(x_{d}, y_{d})$$ in normalized image coordinates is modeled as:

$$
\begin{align}
x_d &= x + x_{\rm rad} + x_{\rm tan}, \\\nonumber
y_d &= y+ y_{\rm rad} + y_{\rm tan},
\end{align}
$$

where the radial distortion components are defined as:

$$
\begin{align}
x_{\rm rad} &= x (k_1 r^2 + k_2 r^4 + k_3 r^6 + \cdots), \\\nonumber
y_{\rm rad} &= y (k_1 r^2 + k_2 r^4 + k_3 r^6 + \cdots),
\end{align}
$$

tangential distortion components are defined as:

$$
\begin{align}
x_{\rm tan} &= \left(p_1 (r^2 + 2 x^2) + 2 p_2 x y \right) (1 + p_3 r^2 + p_4 r^4 + \cdots), \\\nonumber
y_{\rm tan} &= \left(2 p_1 x y + p_2 (r^2 + 2 y^2) \right) (1 + p_3 r^2 + p_4 r^4 + \cdots),
\end{align}
$$

where $$k_1, k_2, k_3, \ldots$$ are radial distortion coefficients, $$p_1, p_2, \ldots$$ are tangential distortion coefficients, and $$r = \sqrt{x^2 + y^2}$$ is radial distance from the image center. Then, image point $$\mathbf{p} = (u, v)$$ is given by

$$
\begin{align}
u &= f_x x_d + c_x, \nonumber\\
v &= f_y y_d + c_y.
\end{align}
$$

## Kannala-Brandt Model
The Kannala-Brandt model [^kannala] is practical for fisheye lenses, which can offer fields of view (FoV) up to 180 degrees, depending on the number of parameters. Unlike the Brown-Conrady distortion model, this model effectively handles the extreme non-linear distortions typical of fisheye lenses by directly mapping the incident light angle to pixel coordinates.

### Mathematical Formula
The Kannala-Brandt model uses an odd-polynomial equation to map the incident angle $$\theta$$ to the distorted radius $$r_d$$:

$$
r_d = 1 + k_1 \theta^3 + k_2 \theta^5 + k_3 \theta^7 + k_4 \theta^9 + \cdots,
$$

where $$k_1, k_2, k_3, k_4, \ldots$$ are distortion coefficients and, for a 3D point $$(X, Y, Z)$$, $$\theta = \tan^{-1}(\frac{\sqrt{X^2 + Y^2}}{Z})$$ is the angle between the optical axis and the incoming light ray.

Then, the position of the distorted point, $$(x_d, y_d)$$, in the normalized image coordinates is obtained by

$$
\begin{align}
x_d &= \frac{r_d}{r} X, \nonumber\\
y_d &= \frac{r_d}{r} Y,
\end{align}
$$

where $$r=\sqrt{X^2 + Y^2}$$ is the 3D point's radial distance from the image center. Then, image point $$\mathbf{p} = (u, v)$$ is given by

$$
\begin{align}
u &= f_x x_d + c_x, \nonumber\\
v &= f_y y_d + c_y.
\end{align}
$$


## Scaramuzza Model
The Scaramuzza model[^scaramuzza] was introduced by Davide Scaramuzza to handle omnidirectional cameras, including fisheye and catadioptric systems. Unlike parametric models such as Unified or Double Sphere which will be described below, this model utilizes a polynomial equation to describe the mapping from world space to the image plane, making it more flexible for cameras with extreme distortions.

The Scaramuzza model does not assume a specific optical design (e.g., single viewpoint projection). Instead, it directly models the camera’s mapping using a Taylor series expansion, which makes it well-suited for non-single viewpoint cameras like catadioptric and ultra-wide fisheye lenses.

### Mathematical Formula
For a 3D point $$(X, Y, Z)$$ in the camera coordinates, the Scaramuzza projection model maps it to the image plane using

$$
\begin{align}
X &= \lambda u, \nonumber\\
Y &= \lambda v, \nonumber\\
Z &= \lambda (a_0 + a_2 \rho^2 + a_3 \rho^3 + a_4 \rho^4), \\
\end{align}
$$

where $$(u, v)$$ are the ideal image projections of the 3D point, $$\lambda$$ is a scalar factor, $$a_0, a_2, a_3, a_4$$ are polynomial coefficients, and $$\rho = \sqrt{u^2+v^2}$$ is radial distance from image center in pixels.

To compute the projected image point from a 3D point, we need to modify the above equation. Using $$X, Y$$, we can derive, $$X^2 + Y^2 = \lambda^2 (u^2 + v^2)$$, thus obtaining

$$\lambda = \frac{\sqrt{X^2+Y^2}}{\rho}.$$

By substituting $$\lambda$$ with the above formula into the relationship between $$Z$$ and $$\rho$$, we obtain

$$
f(\rho) = a_0 - \frac{Z}{\sqrt{X^2+Y^2}}\rho + a_2 \rho^2 + a_3 \rho^3 + a_4 \rho^4 = 0. 
$$

For given coefficients $$a_0, \ldots, a_4$$ and 3D point, we can solve the polynomial equation for $$\rho_r$$, such that $$f(\rho_r)=0$$. Consequently, $$(u_c, v_c)$$ are derived as follows:

$$
\begin{align}
u_c &= \frac{\rho_r}{\sqrt{X^2+Y^2}} X \nonumber\\
v_c &= \frac{\rho_r}{\sqrt{X^2+Y^2}} Y \\
\end{align}
$$

Then, the distorted point $$(u, v)$$ is obtained by

$$
\begin{align}
\begin{bmatrix} u \\ v \end{bmatrix} = \begin{pmatrix} c & d \\ e & 1 \end{pmatrix} \begin{bmatrix} u_c \\ v_c \end{bmatrix} + \begin{bmatrix} c_x \\ c_y \end{bmatrix},
\end{align}
$$

where $$c, d, e$$ are elements of stretch matrix, and $$(c_x, c_y)$$ are distortion center in image plane. For a special case, if $$d = e = a_2 = a_3 = a_4 = 0$$, Scaramuzza model can explain a pinhole model whose $$f_x = c a_0, f_y = a_0$$, because the root of the above polynomial equation is 

$$
\rho_r = \frac{\sqrt{X^2+Y^2}}{Z} a_0,
$$

and it satisfies

$$
\begin{align}
u &= \frac{c a_0 X}{Z} + c_x, \nonumber\\
v &= \frac{a_0 Y}{Z} + c_y.
\end{align}
$$

## Unified Camera Model

The Unified Camera Model[^mei], also known as the Mei camera model, is designed for omnidirectional cameras. It combines a pinhole camera model with a spherical projection, enabling the handling of both standard and fisheye lenses. The model utilizes a single effective viewpoint, which simplifies 3D reconstruction tasks.

<img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/5pyDWBP.gif">

### Mathematical Formula
For a 3D point $$\mathbf{P} = (X, Y, Z)$$ in the camera frame, its projection onto unit sphere is 

$$
\overrightarrow{OS} = \frac{1}{\sqrt{X^2+Y^2+Z^2}} (X, Y, Z) := \frac{1}{d} (X, Y, Z),
$$

where $$d = \sqrt{X^2+Y^2+Z^2}$$ is the 3D point’s distance from the center of the unit sphere. Due to the shift parameter, $$\xi$$, the corresponding point is represented in the pinhole camera coordinate as 

$$
\overrightarrow{PS} = (\frac{X}{d} , \frac{Y}{d} , \frac{Z}{d} + \xi).
$$

Then, the normalized image point $$\mathbf{x} = [x, y]^T$$ is given by

$$
\begin{align}
x &= \frac{X/d}{Z/d + \xi} = \frac{X}{Z + \xi d}, \\
y &= \frac{Y/d}{Z/d + \xi} = \frac{Y}{Z + \xi d}, \\
\end{align}
$$

where $$\xi$$ is the model parameter defining the camera’s effective viewpoint shift. Next, it optionally utilizes Brown-Conrady distortion model to describe the distorted image point:

$$
\begin{align}
u &= f_x x_d + c_x = f_x (x + x_{\rm rad} + x_{\rm tan}) + c_x, \nonumber\\
v &= f_y y_d + c_y = f_y (y + y_{\rm rad} + y_{\rm tan}) + c_y.
\end{align}
$$

Otherwise, 

$$
\begin{align}
u &= f_x x + c_x, \nonumber\\
v &= f_y y + c_y.
\end{align}
$$

## Double Sphere Model
The Double Sphere camera model[^usenko] is an extension of the Unified Camera Model. It introduces a second virtual unit sphere, providing better accuracy for extreme FoV lenses (over 180 degrees). Below figure is the schematic representation of the Double Sphere camera model. A 3D point penetrates through the first and the second unit sphere, successively, and is projected onto the image plane of pinhole camera model. 

<img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/ZH7xqIs.gif">

### Mathematical Formula
For a 3D point $$\mathbf{X} = (X, Y, Z)$$, its projection onto the first unit sphere is

$$
\overrightarrow{OS} = \frac{1}{\sqrt{X^2+Y^2+Z^2}}(X, Y, Z) := \frac{1}{d_1} (X,Y,Z),
$$

where $$d_1=\sqrt{X^2+Y^2+Z^2}$$ is the 3D point’s distance from the center of the first sphere. Then, as the same manner with the Unified Camera model, the intersection between the ray and the second sphere is computed by

$$
\begin{align}
\overrightarrow{QS} &= (\frac{X}{d_1} , \frac{Y}{d_1} , \frac{Z}{d_1} + \xi), \nonumber\\
\overrightarrow{QT} &= \frac{1}{\sqrt{(X/d_1)^2+(Y/d_1)^2+(Z/d_1+\xi)^2}} (\frac{X}{d_1} , \frac{Y}{d_1} , \frac{Z}{d_1} + \xi) \nonumber\\
&= \frac{1}{\sqrt{X^2+Y^2+(Z+\xi d_1)^2}} (X, Y, Z + \xi d_1) \nonumber\\
&:= \frac{1}{d_2} (X, Y, Z + \xi d_1) \nonumber \\
\overrightarrow{PT} &= (\frac{X}{d_2}, \frac{Y}{d_2}, \frac{Z + \xi d_1}{d_2} + \frac{\alpha}{1-\alpha})
\end{align}
$$

where $$d_2 = \sqrt{X^2+Y^2+(Z+\xi d_1)^2}$$ for simplicity, $$\xi$$ is a parameter that control the distance between two unit spheres, and $$\alpha$$ is a parameter that determine the balance between UCM (for $$\alpha=0$$) and Double Sphere models. Therefore, image point $$\mathbf{p} = [u, v]^T$$ is given by

$$
\begin{align}
u &= \frac{f_x (1-\alpha) X}{(1-\alpha)(Z + \xi d_1) + \alpha d_2} + c_x, \\
v &= \frac{f_y (1-\alpha) Y}{(1-\alpha)(Z + \xi d_1) + \alpha d_2} + c_y,
\end{align}
$$

where $$f_x, f_y$$ are focal lengths, and $$c_x, c_y$$ are principal point in pixels. Optionally, it can utilize Brown-Conrady distortion model to improve the accuracy:

$$
\begin{align}
u &= f_x d\left(\frac{(1-\alpha) X}{(1-\alpha)(Z + \xi d_1) + \alpha d_2}\right) + c_x, \\
v &= f_y d\left(\frac{(1-\alpha) Y}{(1-\alpha)(Z + \xi d_1) + \alpha d_2}\right) + c_y,
\end{align}
$$

where $$d(\cdot)$$ distorts a point using Brown-Conrady distortion model. 

## Estimating Camera Intrinsic Parameters

Accurately estimating camera model parameters is a must-have step in ensuring the precision of computer vision systems. This typically involves the multiple steps as mentioned in [Calibrating Cameras with Zhang's Method]({% post_url 2025-07-27-Calibrating-cameras-zhang-method %}).

To accommodate various camera models, we need to make modifications to how projection is applied and how parameters are parsed within the optimization framework. From the MATLAB code of the above post, we make the `project` and `parse_param` functions to handle different camera models.

### MATLAB implementation for various distortion models

Each model has its dedicated projection function that implements its mathematical transformation as explained above. 

#### Brown-Conrady distortion model

```matlab
function uv = project(xyz, coeffs)
% Implements pinhole camera model and Brown-Conrady distortion model
% coeffs = [fx, fy, s, cx, cy, k1, k2, p1, p2, k3]

coeffs_cell = num2cell(coeffs);
[fx, fy, s, cx, cy, k1, k2, p1, p2, k3] = deal(coeffs_cell{:});

x = xyz(1,:);
y = xyz(2,:);
z = xyz(3,:);

x = x./z;
y = y./z;
r2 = x.^2 + y.^2;

% Radial distortion
radial_factor = 1 + k1*r2 + k2*r2.^2 + k3*r2.^3;

% Tangential distortion
tangential_x = 2*p1*x.*y + p2*(r2 + 2*x.^2);
tangential_y = p1*(r2 + 2*y.^2) + 2*p2*x.*y;

% Apply distortion
x_d = x .* radial_factor + tangential_x;
y_d = y .* radial_factor + tangential_y;

uv = [fx * x_d + cx; fy * y_d + cy];

end
```

#### Kannala-Brandt model

```matlab
function uv = project(xyz, coeffs)
% Implements Kannala-Brandt camera model
% coeffs = [fx, fy, s, cx, cy, k1, k2, k3, k4]

coeffs_cell = num2cell(coeffs);
[fx, fy, s, cx, cy, k1, k2, k3, k4] = deal(coeffs_cell{:});

x = xyz(1,:);
y = xyz(2,:);
z = xyz(3,:);

% Calculate incident angle theta and azimuthal angle phi
r = sqrt(x.^2 + y.^2); % Distance in XY plane
theta = atan2(r, z);   % Angle from Z-axis

% Apply Kannala-Brandt polynomial to get distorted radius rd
rd = theta + k1*theta.^3 + k2*theta.^5 + k3*theta.^7 + k4*theta.^9;

% Calculate distorted 2D coordinates
xy = [rd .* x ./ r; rd .* y ./ r];
uv = [fx * xy(1,:) + s * xy(2,:) + cx; fy * xy(2,:) + cy];

end
```

#### Scaramuzza model

```matlab
function uv = project(xyz, coeffs)
% Implements Scaramuzza (Omnidirectional) distortion model
% coeffs = [c, d, e, cx, cy, a0, a2, a3, a4]

coeffs_cell = num2cell(coeffs);
[c, d, e, cx, cy, a0, a2, a3, a4] = deal(coeffs_cell{:});

x = xyz(1,:);
y = xyz(2,:);
z = xyz(3,:);

rho = zeros(1, length(z));

for i = 1:length(z)
    X = x(i);
    Y = y(i);
    Z = z(i);
    r_n = roots([a4, a3, a2, -Z / sqrt(X^2 + Y^2), a0]);
    r_n = r_n(imag(r_n) == 0 & r_n > 0);
    r_n = real(r_n);

    if isempty(r_n)
        rho(i) = nan; % to ignore in the optimization loop
    else
        rho(i) = min(r_n);
    end
end

r = sqrt(x.^2 + y.^2);
u = rho .* x ./ r;
v = rho .* y ./ r;

uv = [c*u + d*v + cx; e*u + v + cy];

end
```

In the above function, a for-loop can degenerate the computing performance. Thus, to boost the performance, we compute the coefficients of the inverse polynomial equation in advance using multiple samples. A high value of `sample_ratio` ensures a high accuracy at a large incident angle, however increasing non-linearity and the degree of the inverse polynomial equation.
```matlab
function inv_coeffs = find_poly_inv(coeffs, num_sample, sample_ratio, error_thres, max_degree)
% This function finds the inverse form of the given polynomial function.
% This function is used for making the projection computation of Scaramuzza
% model faster.
theta = linspace(0, pi * sample_ratio, num_sample);
rho = zeros(1, length(theta));

a0 = coeffs(1);
a2 = coeffs(2);
a3 = coeffs(3);
a4 = coeffs(4);

for i = 1:length(theta)
    % theta is an incident angle, theta = atan2(sqrt(X^2+Y^2), Z)
    % -Z/sqrt(X^2+Y^2) = -tan(pi/2 - theta)
    r_n = roots([a4, a3, a2, -tan(pi/2 - theta(i)), a0]);
    r_n = r_n(imag(r_n) == 0 & r_n > 0);
    r_n = real(r_n);

    if isempty(r_n)
        rho(i) = nan;
    else
        rho(i) = min(r_n);
    end
end

error_max = Inf;
degree = 1;

while (error_max > error_thres) && (degree < max_degree)
    isValid = ~isnan(rho);
    inv_coeffs = polyfit(theta(isValid), rho(isValid), degree);
    rho_inv = polyval(inv_coeffs, theta);
    error_max = max(abs(rho - rho_inv));
    degree = degree + 1;
end

end
```

```matlab
function uv = project(xyz, coeffs)
% Implements Scaramuzza (Omnidirectional) distortion model
% coeffs = [c, d, e, cx, cy, a0, a2, a3, a4]
x = xyz(1,:);
y = xyz(2,:);
z = xyz(3,:);

coeffs_cell = num2cell(coeffs);
[c, d, e, cx, cy, a0, a2, a3, a4] = deal(coeffs_cell{:});

inv_coeffs = find_poly_inv([a0, a2, a3, a4], 100, 0.9, 0.01, 25);
r = sqrt(x.^2 + y.^2);
theta = atan2(r, z);
rho = polyval(inv_coeffs, theta);

u = rho .* x ./ r;
v = rho .* y ./ r;

uv = [c*u + d*v + cx; e*u + v + cy];

end
```

#### Unified Camera model

```matlab
function uv = project(xyz, coeffs)
% Implements Unified Camera Model (Mei Model) distortion
% coeffs = [fx, fy, s, cx, cy, xi, k1, k2, p1, p2]

coeffs_cell = num2cell(coeffs);
[fx, fy, s, cx, cy, xi, k1, k2, p1, p2] =  = deal(coeffs_cell{:});

x = xyz(1,:);
y = xyz(2,:);
z = xyz(3,:);

% Project to spherical coordinates
d = sqrt(x.^2 + y.^2 + z.^2);

% Apply unified projection
x_p = x ./ (z + xi*d);
y_p = y ./ (z + xi*d);

% Apply radial and tangential distortion (similar to Brown-Conrady)
r2 = x_p.^2 + y_p.^2;
radial_factor = 1 + k1*r2 + k2*r2.^2;
tangential_x = 2*p1*x_p.*y_p + p2*(r2 + 2*x_p.^2);
tangential_y = p1*(r2 + 2*y_p.^2) + 2*p2*x_p.*y_p;

x_d = x_p .* radial_factor + tangential_x;
y_d = y_p .* radial_factor + tangential_y;

uv = [fx * x_d + s * y_d + cx; fy * y_d + cy];

end
```

#### Double sphere model

```matlab
function uv = project(xyz, coeffs)
% Implements Double Sphere distortion model
% coeffs = [fx, fy, s, cx, cy, xi, alpha, k1, k2, p1, p2]

coeffs_cell = num2cell(coeffs);
[fx, fy, s, cx, cy, xi, alpha, k1, k2, p1, p2] = deal(coeffs_cell{:});

x_p = xyz(1,:);
y_p = xyz(2,:);
z_p = xyz(3,:);

% Intermediate calculations
d1 = sqrt(x_p.^2 + y_p.^2 + z_p.^2);
d2 = sqrt(x_p.^2 + y_p.^2 + (z_p + xi*d1).^2);

x = (1-alpha) * x_p ./ ((1-alpha)*(z_p+xi*d1) + alpha*d2);
y = (1-alpha) * y_p ./ ((1-alpha)*(z_p+xi*d1) + alpha*d2);

% Apply radial and tangential distortion (similar to Brown-Conrady)
r2 = x.^2 + y.^2;
radial_factor = 1 + k1*r2 + k2*r2.^2;
tangential_x = 2*p1*x.*y + p2*(r2 + 2*x.^2);
tangential_y = p1*(r2 + 2*y.^2) + 2*p2*x.*y;

x_d = x .* radial_factor + tangential_x;
y_d = y .* radial_factor + tangential_y;

uv = [fx * x_d + s * y_d + cx; fy * y_d + cy];

end
```

### Optimization

Using the above `project` and `parse_param` functions depending on distortion model, and the common optimization algorithm in [Calibrating Cameras with Zhang's Method]({% post_url 2025-07-27-Calibrating-cameras-zhang-method %}), we can find the intrinsic and extrinsic parameters of the camera. 

## Wrap-up

Understanding and selecting the appropriate camera model is important for achieving accurate image correction and 3D reconstructions. Whether dealing with standard, wide-angle, or fisheye lenses, each model offers appropriate strengths.

- The Brown-Conrady model is well-suited for standard applications.
- The Kannala-Brandt and Double Sphere models are good for wide fields of view.
- The Unified (Mei) camera model is good for slightly-wide fields of view.
- The Unified (Mei) and Double Sphere camera models have no polynomial equation, thus they are computationally inexpensive and have an explicit closed-form inverse.
- The Scaramuzza model provides a non-parametric solution for complex camera systems that do not adhere to a single viewpoint assumption.

[^kannala]: Juho Kannala and Sami S Brandt, [A Generic Camera Model and Calibration Method for Conventional, Wide-angle, and Fish-eye Lenses](https://oulu3dvision.github.io/calibgeneric/Kannala_Brandt_calibration.pdf), 2006.
[^scaramuzza]: Davide Scaramuzza, et. al., [A Flexible Technique for Accurate Omnidirectional Camera Calibration and Structure from Motion](https://rpg.ifi.uzh.ch/docs/ICVS06_scaramuzza.pdf), 2006.
[^usenko]: Vladyslav Usenko, et. al., [The Double Sphere Camera Model](https://arxiv.org/pdf/1807.08957), 2018.
[^mei]: Christopher Mei and Patrick Rives, [Single View Point Omnidirectional Camera Calibration from Planar Grids](https://www.robots.ox.ac.uk/~cmei/articles/single_viewpoint_calib_mei_07.pdf), 2007.