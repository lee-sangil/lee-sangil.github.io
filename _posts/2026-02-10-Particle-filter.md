---
title: "Derivation of the Particle Filter from Bayesian Filter"
categories:
 - Vision
tags:
 - filter
 - particle
 - bayes
 - bayesian
 - derivation
 - monte-carlo
header:
  teaser: /assets/image/thumbnail/2026-02-10-particle-filter.gif
excerpt_separator: <!--more-->
---

> The Particle Filter is a sequential Monte Carlo implementation of the Bayesian Filter. Unlike the Kalman Filter, it does not require linearity or Gaussian assumptions, making it suitable for highly nonlinear systems and non-Gaussian distributions. Instead of representing the belief with a mean and covariance, it approximates the posterior distribution using a set of discrete samples, or particles. This post provides a step-by-step mathematical derivation of the particle filter algorithm.

<!--more-->

{% include /assets/tracking_mouse_pf.html %}
<br/>

This interactive demo visualizes how a particle filter solves the ambiguous localization problem in real-time. Click to place identical <span style="color:#00cc00;">green landmarks</span> throughout the space, then move your cursor or touch to control a robot that can only measure the distance to its nearest landmark within the <span style="color:#2255ee;">blue dashed detection range</span>. <span style="color:#ff9900;">The orange particles</span> represent the robot's belief about its position. As you move the robot, impossible position hypotheses receive lower weights and are gradually eliminated through reweighting and resampling, causing the particles to converge toward the true position. Adjust the detection range to see how limited sensing affects localization speed, or modify the motion and measurement noise to observe the filter's robustness. When you leave the demo, particles are automatically reset.

## Assumptions
The Kalman Filter provides optimal state estimation under two key constraints:

- Linear system dynamics and measurement models
- Gaussian noise distributions

However, many real-world systems violate these assumptions. Consider a robot localizing itself in a multi-modal environment where multiple hypotheses about its location are plausible, or a tracking system with highly nonlinear dynamics. In such cases, the belief distribution $$bel(x_t)$$ cannot be adequately represented by a single Gaussian.

The Particle Filter addresses these limitations by representing the belief distribution using a finite set of weighted samples (particles), enabling it to approximate arbitrary probability distributions. It operates under the general Bayesian filtering framework with the following properties:

 - Non-Linearity: The state transition and measurement models can be non-linear:

  $$
 \begin{align}
 x_t &= f(x_{t-1}, u_t, w_t) \\
 z_t &= h(x_t, v_t)
 \end{align}
 $$

 - Non-Gaussian noise: The process noise $$w_t$$ and measurement noise $$v_t$$ can follow any arbitrary probability distribution.
 - Non-Parametric representation: The belief $$bel(x_t)$$ is not restricted to a functional form (like a Gaussian). Instead, it is represented by a set of $$M$$ weighted particles.

## Particles

The core idea of the Particle Filter is to represent the continuous belief distribution $$bel(x_t)$$ using a discrete set of $$M$$ weighted particles:

$$
\mathcal{X}_t = {(x_t^{(i)}, w_t^{(i)}) : i = 1, \ldots, M},
$$

where

- $$x_t^{(i)}$$ is the $$i$$-th particle (a hypothesis about the state at time $$t$$)
- $$w_t^{(i)}$$ is the importance weight of the $$i$$-th particle, such that $$\sum_{i=1}^{M} w_t^{(i)} = 1.$$

The belief distribution is approximated as

$$
bel(x_t) \approx \sum_{i=1}^{M} w_t^{(i)} \delta(x_t - x_t^{(i)}),
$$

where $$\delta(\cdot)$$ is the Dirac delta function. This representation can approximate any probability distribution given sufficiently many particles.

## Derivation from Bayesian Filter

Recall the two fundamental steps of the Bayesian Filter

- Prediction:

$$
\overline{bel}(x_t) = \int p(x_t \vert x_{t-1}, u_t) bel(x_{t-1}) dx_{t-1}
$$

- Correction:

$$
bel(x_t) = \eta p(z_t \vert x_t)\overline{bel}(x_t)
$$

We now derive how each step is implemented using particles.

### Prediction Step

Starting with the particle representation at time $$t-1$$:

$$
bel(x_{t-1}) \approx \sum_{i=1}^{M} w_{t-1}^{(i)} \delta(x_{t-1} - x_{t-1}^{(i)}),
$$

substitute this into the prediction equation:

$$
\begin{align}
\overline{bel}(x_t) &= \int p(x_t \vert x_{t-1}, u_t) bel(x_{t-1}) dx_{t-1} \\
&\approx \int p(x_t \vert x_{t-1}, u_t) \sum_{i=1}^{M} w_{t-1}^{(i)} \delta(x_{t-1} - x_{t-1}^{(i)}) dx_{t-1} \\
&= \sum_{i=1}^{M} w_{t-1}^{(i)} \int p(x_t \vert x_{t-1}, u_t) \delta(x_{t-1} - x_{t-1}^{(i)}) dx_{t-1} \\
&= \sum_{i=1}^{M} w_{t-1}^{(i)} p(x_t \vert x_{t-1}^{(i)}, u_t).
\end{align}
$$

The key insight is that the Dirac delta function selects the value at $$x_{t-1} = x_{t-1}^{(i)}$$, yielding the transition probability conditioned on each particle from the previous time step.

Now, each term $$p(x_t \vert x_{t-1}^{(i)}, u_t)$$ is a continuous probability distribution over $$x_t$$. In principle, we could represent this distribution using multiple samples

$$
p(x_t \vert x_{t-1}^{(i)}, u_t) \approx \frac{1}{K} \sum_{k=1}^{K} \delta(x_t - x_t^{(i,k)}), \quad \text{where } x_t^{(i,k)} \sim p(x_t \vert x_{t-1}^{(i)}, u_t).
$$

However, for computational efficiency, the Particle Filter uses only one sample per particle ($$K=1$$)

$$
p(x_t \vert x_{t-1}^{(i)}, u_t) \approx \delta(x_t - x_t^{(i)}), \quad \text{where } x_t^{(i)} \sim p(x_t \vert x_{t-1}^{(i)}, u_t).
$$

This is the sampling step of the Particle Filter. Each particle $$x_{t-1}^{(i)}$$ generates a new particle $$x_t^{(i)}$$ by sampling from the motion model. The predicted belief is then

$$
\overline{bel}(x_t) \approx \sum_{i=1}^{M} w_{t-1}^{(i)} \delta(x_t - x_t^{(i)}).
$$

Note that this single-sample approximation introduces error, but as $$M \to \infty$$, the overall approximation converges to the true posterior. The weights remain unchanged during the prediction step: $$\bar{w}_t^{(i)} = w_{t-1}^{(i)}$$.

### Correction Step

The correction step incorporates the measurement $$z_t$$:

$$
\begin{align}
bel(x_t) &= \eta p(z_t \vert x_t)\overline{bel}(x_t) \\
&\approx \eta p(z_t \vert x_t) \sum_{i=1}^{M} \bar{w}_t^{(i)} \delta(x_t - x_t^{(i)}) \\
&= \eta \sum_{i=1}^{M} \bar{w}_t^{(i)} p(z_t \vert x_t) \delta(x_t - x_t^{(i)}) \\
&= \eta \sum_{i=1}^{M} \bar{w}_t^{(i)} p(z_t \vert x_t^{(i)}) \delta(x_t - x_t^{(i)}).
\end{align}
$$

The measurement likelihood $$p(z_t \vert x_t)$$ is evaluated at each particle location $$x_t^{(i)}$$. This yields the weight update equation

$$
w_t^{(i)} \propto \bar{w}_t^{(i)} p(z_t \vert x_t^{(i)}),
$$

because

$$
bel(x_t) \approx \sum_{i=1}^{M} w_t^{(i)} \delta(x_{t} - x_{t}^{(i)}).
$$

Since $$\bar{w}_t^{(i)} = w_{t-1}^{(i)}$$, we can write

$$
w_t^{(i)} \propto w_{t-1}^{(i)} p(z_t \vert x_t^{(i)}).
$$

To ensure the weights sum to one, we normalize

$$
w_t^{(i)} = \frac{w_{t-1}^{(i)} p(z_t \vert x_t^{(i)})}{\sum_{j=1}^{M} w_{t-1}^{(j)} p(z_t \vert x_t^{(j)})}.
$$

This is the reweighting step. Particles that are more consistent with the measurement receive higher weights.

### Degeneracy Problem and Resampling

A fundamental issue with Sequential Importance Sampling is weight degeneracy: after several iterations, most particles have negligible weights, and only a few particles contribute to the belief representation. This occurs because

1. The variance of importance weights increases over time
2. A small number of particles dominate the particle set

To quantify degeneracy, we compute the effective sample size:

$$
N_{\text{eff}} = \frac{1}{\sum_{i=1}^{M} (w_t^{(i)})^2}.
$$

When $$N_{\text{eff}}$$ is small (typically $$N_{\text{eff}} < M/2$$), the particle set is considered degenerate.

The solution is resampling: we draw a new set of $$M$$ particles from the current particle set, where the probability of selecting particle $$x_t^{(i)}$$ is proportional to its weight $$w_t^{(i)}$$. After resampling:

- All new particles have uniform weights: $$w_t^{(i)} = 1/M$$
- Particles with high weights are replicated multiple times
- Particles with low weights are likely discarded

Mathematically, resampling draws particles from the belief probability:

$$
\tilde{x}_t^{(i)} \sim bel(x_t),
$$

yielding a new particle set $$\{\tilde{x}_t^{(i)}, 1/M\}_{i=1}^{M}$$. 

## Wrap-up

Combining all steps, the particle filter algorithm at time $$t$$ is

1. Sampling (Prediction): For $$i = 1, \ldots, M$$
   
   $$x_t^{(i)} \sim p(x_t \vert x_{t-1}^{(i)}, u_t)$$

1. Weighting (Correction): For $$i = 1, \ldots, M$$
   
   $$w_t^{(i)} = w_{t-1}^{(i)} \cdot p(z_t \vert x_t^{(i)})$$

1. Normalization: For $$i = 1, \ldots, M$$
   
   $$w_t^{(i)} = \frac{w_t^{(i)}}{\sum_{j=1}^{M} w_t^{(j)}}$$

1. Resampling (if needed): If $$N_{\text{eff}} < N_{\text{threshold}}$$
- Draw $$M$$ particles $${\tilde{x}_t^{(i)}}_{i=1}^{M}$$ from $$\{x_t^{(i)}, w_t^{(i)}\}_{i=1}^{M}$$
- Set $$x_t^{(i)} \leftarrow \tilde{x}_t^{(i)}$$ and $$w_t^{(i)} \leftarrow 1/M$$ for all $$i$$

The Particle Filter implements Bayesian filtering through prediction, correction, and resampling. Unlike the Kalman Filter, the Particle Filter does not require linearity or Gaussian assumptions and can represent multi-modal distributions. It is widely used in robotics for localization, tracking, and SLAM problems where nonlinearity or non-Gaussian noise make the Kalman Filter inadequate. However, it requires careful tuning of the number of particles and resampling strategy.