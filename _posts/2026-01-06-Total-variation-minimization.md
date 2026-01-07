---
title: "Denoising Image with Total Variation Minimization"
categories:
 - Vision
tags:
 - denoise
 - regularization
 - optimization
 - rof
 - primal-dual
 - chambolle-pock
header:
  teaser: /assets/image/thumbnail/2026-01-06-image-denoising.gif
excerpt_separator: <!--more-->
---

> Image denoising is a fundamental task in computer vision, aiming to recover a clean image from a noisy observation. Total variation minimization, introduced by Rudin, Osher, and Fatemi (ROF), addresses this by penalizing the image gradient and data fidelity. This post explores the mathematical derivation of the ROF model and implements it using the Chambolle-Pock Primal-Dual algorithm.

<!--more-->

{% include /assets/denoise_image.html %}
<br/>

The interactive demo above shows an image denoised using total variation minimization. It provides a viewing mode in which you can choose to display either the primal or the dual variables. The primal variable represents the denoised image itself. On the other hand, the dual variable visualizes 2D vectors encoded in the red and green channels, corresponding to the x- and y-directions, respectively, with both components linearly scaled from [-1, 1] to [0, 1], while the blue channel is fixed at 0.5. You can also adjust the parameter values and observe how the optimization process evolves.

## Image denoising

In the following image denoising scenario, we assume the observed image, $$f$$, is corrupted by additive zero-mean Gaussian noise, $$\eta$$:

$$f = u + \eta$$

To recover $$u$$, we solve an optimization problem that balances two competing goals

- Fidelity: the recovered image $$u$$ should be close to the observation, $$f$$.
    
- Regularization: the recovered image $$u$$ should not be overfitted to the observation, while enforcing smoothness. 

The general objective function to minimize is

$$ E(u) = \mathcal{R}(u) + \frac{1}{2\lambda} \|u - f\|_2^2$$

where $$\mathcal{R}(u)$$ is the regularizer and $$\lambda$$ controls the trade-off between two terms.

## Total variation minimization

$$\mathcal{R}(u)$$ determines the characteristics of the output. Especially, total variation (TV) regularizer is defined as $$L_1$$ norm. Since the $$L_1$$ norm is less sensitive to large outliers (edges) than the $$L_2$$ norm, it allows for sharp transitions while surpressing noisy fluctuations in flat areas to zero.

Therefore, the TV denoising model is defined as

$$\min_{u} \int_{\Omega} \|\nabla u\| dx + \frac{1}{2\lambda} \|u - f\|_2^2$$

where $$\Omega$$ is an image domain. 

## Primal-Dual method

However, the $$L_1$$ norm, ($$\|x\|$$), is non-differentiable at the origin, $$x=0$$.
To solve this efficiently, we use a dual norm to transform the minimization problem into a saddle-point problem.

### The dual formulation

Using the property of the $$L_1$$ norm, we can rewrite the TV term as

$$\|\nabla u\|_1 = \max_{\|p\|_\infty \le 1} \langle p, \nabla u \rangle$$

where $$p$$ is the dual variable. Then, the optimization problem becomes

$$\min_{u} \max_{\|p\|_\infty \le 1} {E(u, p)} = \min_{u} \max_{\|p\|_\infty \le 1} \left( \langle p, \nabla u \rangle + \frac{1}{2\lambda} \|u - f\|_2^2 \right)$$

### The Chambolle-Pock algorithm

The Chambolle-Pock algorithm updates the variables $$p$$ and $$u$$ iteratively.

- Dual update (gradient ascent on $$p$$)

First, we minimize the objective function with respect to $$p$$

$$
p^{n+1}=\arg\max_{p \in P}​ \left( {\langle p,\nabla \bar{u}^n \rangle + \frac{1}{2\lambda} \|u - f\|_2^2 − \frac{1}{2\sigma}\|p−p^n\|_2^2} \right)
$$

The term $$-\frac{1}{2\sigma} \|p - p^n\|_2^2$$ is a proximal penalty that ensures stability.
The minus sign of the proximal penalty preserves the concavity of the optimization problem.
Setting the derivative to zero yields

$$ \nabla \bar{u}^n - (p^{n+1}−p^n) = 0$$

and we project $$p^{n+1}$$ onto the surface of $$L_\infty$$ ball:

$$p^{n+1} = \text{proj}_P (p^n + \sigma \nabla \bar{u}^n)$$ 

The projection ensures the dual constraint, $$P = \{p: \|p\|_\infty \le 1\}$$, by normalizing with $$L_1$$ norm.

- Primal update (gradient descent on $$u$$)

Using the adjoint operator property $$\langle p, \nabla u \rangle = \langle \nabla^* p, u \rangle = \langle -\text{div } p, u \rangle$$, we minimize the objective function with respect to $$u$$

$$u^{n+1} = \arg\min_{u} \left( \langle -\text{div } p^{n+1}, u \rangle + \frac{1}{2\lambda} \|u - f\|_2^2 + \frac{1}{2\tau} \|u - u^n\|_2^2 \right)$$

The term $$\frac{1}{2\tau} \|u - u^n\|_2^2$$ is a proximal penalty that ensures stability. Setting the derivative to zero yields

$$
-\text{div } p^{n+1} + \frac{1}{\lambda}(u^{n+1} - f) + \frac{1}{\tau} (u^{n+1} - u^n) = 0
$$

and

$$u^{n+1} = \frac{u^n + \tau \text{div } p^{n+1} + \frac{\tau}{\lambda} f}{1 + \frac{\tau}{\lambda}}. $$

- Over-relaxation

To accelerate convergence, we update an auxiliary variable for faster convergence:

$$\bar{u}^{n+1} = u^{n+1} + \theta(u^{n+1} - u^n)$$

Typically, $$\theta=1$$ is used. 

## Example code

The following implementation uses the derived formulas to denoise an image.

```matlab
function u = tv_denoise(f, lambda, iter)
    % f: Noisy input, lambda: Regularization weight, iter: Iterations
    [rows, cols] = size(f);
    f = double(f);
    
    % Parameters for convergence (L^2 <= 8)
    L = sqrt(8);
    tau = 0.01;
    sigma = 1/(L^2 * tau);
    theta = 1;
    
    % Initialize variables
    u = f;
    u_bar = f;
    p = zeros(rows, cols, 2);
    
    for i = 1:iter
        % Dual Update
        ux = [diff(u_bar, 1, 2), zeros(rows, 1)];
        uy = [diff(u_bar, 1, 1); zeros(1, cols)];
        p(:,:,1) = p(:,:,1) + sigma * ux;
        p(:,:,2) = p(:,:,2) + sigma * uy;
        
        % Magnitude for projection
        L_infty = max(abs(p(:,:,1)), abs(p(:,:,2)));
        p(:,:,1) = p(:,:,1) ./ max(1, L_infty);
        p(:,:,2) = p(:,:,2) ./ max(1, L_infty);
        
        % Primal Update
        u_old = u;
        div_p = [p(:,1,1), diff(p(:,:,1), 1, 2)] + ...
                [p(1,:,2); diff(p(:,:,2), 1, 1)];
        
        u = (u + tau * div_p + (tau/lambda) * f) / (1 + tau/lambda);
        
        % Relaxation
        u_bar = u + theta * (u - u_old);
    end
end
```

## Other regularizers

- $$L_2$$ norm, $$\|\nabla u\|_2^2$$: penalizes high frequencies globally, leading to isotropic diffusion. This results in blurry edges because the squared norm penalizes large gradients rather than small gradients. Since $$L_2$$ norm is differentiable for all values, we don't need to use dual variable to solve the optimization problem.

- Huber norm, $$h_{\epsilon} (\nabla u)$$: is a hybrid of the $$L_1$$ and $$L_2$$ norms, uses $$L_2$$ norm for small values and $$L_1$$ norm for large values. It prevents a staircase effect in $$L_1$$ regularizer, while being less sensitive to large gradients than $$L_2$$ regularizer. To apply Huber norm to the above optimization problem, 

## Wrap-up

TV Minimization via the Primal-Dual method is good for image denoising. Unlike simple filters, it explicitly models the presence of edges using the $$L_1$$ norm of the gradient. While it can introduce a staircase effect, it can preserve the structural integrity of a noisy image well.