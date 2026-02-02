---
title: "Derivation of the Kalman Filter from Bayesian Filter"
categories:
 - Vision
tags:
 - filter
 - kalman
 - bayes
 - bayesian
 - derivation
 - woodbury
header:
  teaser: /assets/image/thumbnail/2026-01-24-kalman-filter.gif
excerpt_separator: <!--more-->
---

> The Kalman Filter is a specialized implementation of the Bayesian Filter. It is widely used in various engineering fields due to its optimality and computational efficiency when applied to linear systems with Gaussian noise. Below is a step-by-step mathematical derivation of its update equations.

<!--more-->

{% include /assets/tracking_mouse_kf.html %}
<br/>

This interactive demo visualizes how a Kalman filter intelligently estimates movement in real-time. As you move your cursor or touch the screen, observe the interplay between three key elements: <span style="color:#2222ff;">the blue line</span> represents the ground truth of your pointer's actual path, while <span style="color:#00cc00;">the flickering green dots</span> simulate noisy and uncertain measurements. <span style="color:#ff00ff;">The magenta-filled circle</span> illustrates the filter's output, representing both the estimated position (the center) and the current degree of uncertainty (the size of the variance). By adjusting the controls in the corner, you can see the effect of these variables in real-time. If you increase the Measurement Noise (Q), the purple trail starts to ignore the erratic green dots and relies more on its own smooth prediction. Conversely, adjusting the Process Noise (R) changes how much the filter expects the movement itself to change suddenly, affecting how quickly the estimate follows your actual path.

## Assumptions

To derive the traditional Kalman Filter, we rely on three core assumptions:
- Linearity: both the state transition (motion) and measurement models are linear. Thus, the motion model is given by

  $$ x_t = A_t x_{t-1} + B_t u_t + w_t, $$
  
  and the measurement model is given by

  $$ z_t = C_t x_t + v_t. $$

- Gaussian initial state: the initial belief, $$bel(x_0)$$, is assumed to follow a Gaussian distribution. 
- Gaussian noise: the process noise, 

  $$w_t \sim \mathcal{N}(0, R_t),$$

  and measurement noise, 

  $$v_t \sim \mathcal{N}(0, Q_t),$$ 

  are zero-mean Gaussian distributions added to the state and measurement models, respectively.

## Derivation

Recall the two main steps of the Bayesian Filter:

- Prediction

$$
\overline{bel}(x_t) = \int p(x_t | x_{t-1}, u_t) bel(x_{t-1}) dx_{t-1}
$$

- Correction

$$
bel(x_t) = \eta p(z_t|x_t)\overline{bel}(x_t)
$$

### Prediction
In this step, we update the previous belief $$bel(x_{t-1})$$ one step forward in time using the motion model. Because the initial state and noises are Gaussian and motion/measurement models are linear, a belief at any time $$t$$, $$bel(x_t)$$ remains Gaussian. Let the mean and the covariance of $$bel(x_{t-1})$$ be $$\mu_{t-1}$$ and $$\Sigma_{t-1}$$, respectively. 

$$
bel(x_{t-1}) \sim \mathcal{N}(\mu_{t-1}, \Sigma_{t-1})
$$

We can also express $$bel(x_{t-1})$$ as

$$
\frac{1}{(2\pi)^{n/2} |\Sigma_{t-1}|^{1/2}} \exp\left({-\frac{1}{2}(x_{t-1} - \mu_{t-1})^T \Sigma_{t-1}^{-1} (x_{t-1} - \mu_{t-1})}\right),
$$

where $$n$$ is the dimension of the state vector, $$x_{t-1}$$. In the following, I'll regard the pre-multiplied value as $$\eta$$, i.e., 

$$
bel(x_{t-1}) = \eta \exp\left({-\frac{1}{2}(x_{t-1} - \mu_{t-1})^T \Sigma_{t-1}^{-1} (x_{t-1} - \mu_{t-1})}\right).
$$

Substituting the motion model into the Bayesian prediction equation, we obtain

$$
\begin{align}
\overline{bel}(x_t) &= \int p(x_t | x_{t-1}, u_t) bel(x_{t-1}) dx_{t-1} \\
&= \int \mathcal{N}(A_t x_{t-1} + B_t u_t, R_t) \mathcal{N}(\mu_{t-1}, \Sigma_{t-1}) dx_{t-1} \\
&= \eta \int \exp \left( {-\frac{1}{2}(x_t - A_t x_{t-1} - B_t u_t)^T R_t^{-1} (x_t - A_t x_{t-1} - B_t u_t)} {-\frac{1}{2}(x_{t-1} - \mu_{t-1})^T \Sigma_{t-1}^{-1} (x_{t-1} - \mu_{t-1})} \right) dx_{t-1}. 
\end{align}
$$

To simplify, we define the exponent as $$L_t = L_t(x_{t-1}, x_t) + L_t(x_t)$$ such that

$$
\overline{bel}(x_t) = \eta \int \exp \left({-L_t} \right) dx_{t-1}. 
$$

Our goal is to integrate out the variable, $$x_{t-1}$$, in the integrand. Since the integral of a Gaussian over its entire domain is a constant, we only need to focus on the $$x_t$$ terms remaining after $$x_{t-1}$$ is marginalized. 

$$
\begin{align}
\overline{bel}(x_t) &= \eta \int \exp \left({-L_t} \right) dx_{t-1} \\
&= \eta \int \exp \left({-L_t(x_{t-1}, x_t)} \right) \exp \left({-L_t(x_t)} \right) dx_{t-1} \\
&= \eta \exp \left({-L_t(x_t)} \right) \int \exp \left({-L_t(x_{t-1}, x_t)} \right) dx_{t-1} \\
&= \eta \prime \exp \left({-L_t(x_t)} \right) 
\end{align}
$$

In order to find the coefficients of the quadratic equation with respect to $$x_{t-1}$$, we use simple relationships: for a quadratic equation, $$f(x; m, S) = \frac{1}{2}(x-m)^T S (x-m)$$, it satisfies

$$
\begin{align}
f'(m) &= (m-m)^T S = 0, \\
f''(x) &= S. 
\end{align}
$$

Therefore, the first-order derivative of $$L_t$$ with respect to $$x_{t-1}$$ is

$$
\frac{\partial L_t}{\partial x_{t-1}} = -(x_t - A_t x_{t-1} - B_t u_t)^T R_t^{-1} A_t + (x_{t-1} - \mu_{t-1})^T \Sigma_{t-1}^{-1}, 
$$

and at the value $$x_{t-1}=m$$, the below satisfies

$$
-(x_t - A_t m - B_t u_t)^T R_t^{-1} A_t + (m - \mu_{t-1})^T \Sigma_{t-1}^{-1} =0,
$$

thus

$$
m = (A_t^T R_t^{-1} A_t + \Sigma_{t-1}^{-1})^{-1} (A_t^T R_t^{-1} x_t - A_t^T R_t^{-1} B_t u_t + \Sigma_{t-1}^{-1} \mu_{t-1}). 
$$

Also, the second-order derivative of $$L_t$$ with respect to $$x_{t-1}$$ yields 

$$
S = A_t^T R_t^{-1} A_t + \Sigma_{t-1}^{-1}. 
$$

Now, the perfect square equation of $$x_{t-1}$$, $$L_t(x_{t-1}, x_t)$$, is obtained. Consequently, the remaining term, $$L_t - L_t(x_{t-1}, x_t)$$ would be the second-order polynomial of $$x_t$$.

$$
\begin{align}
L_t(x_t) =& L_t - L_t(x_{t-1}, x_t) \\
=& \frac{1}{2}(x_t - A_t x_{t-1} - B_t u_t)^T R_t^{-1} (x_t - A_t x_{t-1} - B_t u_t) \\
&+ \frac{1}{2}(x_{t-1} - \mu_{t-1})^T \Sigma_{t-1}^{-1} (x_{t-1} - \mu_{t-1}) \\
&- \frac{1}{2} (x_{t-1} - m)^T S (x_{t-1} - m) \\
=& \frac{1}{2} (x_t^T R_t^{-1} x_t + u_t^T B_t^T R_t^{-1} B_t u_t - 2 x_t^T R_t^{-1} B_t u_t) \\
&+ \frac{1}{2} \mu_{t-1}^T \Sigma_{t-1}^{-1} \mu_{t-1} \\
&- \frac{1}{2} (A_t^T R_t^{-1} x_t - A_t^T R_t^{-1} B_t u_t + \Sigma_{t-1}^{-1} \mu_{t-1})^T S^{-1} (A_t^T R_t^{-1} x_t - A_t^T R_t^{-1} B_t u_t + \Sigma_{t-1}^{-1} \mu_{t-1}) \\
\end{align}
$$

We expand all terms and use the relationship between $$S$$ and $$\Sigma_{t-1}$$:

$$
\begin{align}
S &= A_t^T R_t^{-1} A_t + \Sigma_{t-1}^{-1} \\
S^{-1} \Sigma_{t-1}^{-1} &= I - S^{-1} A_t^T R_t^{-1} A_t \\
\Sigma_{t-1}^{-1} S^{-1} &= I - A_t^T R_t^{-1} A_t S^{-1}
\end{align}
$$

Then, we obtain

$$
L_t(x_t) = \frac{1}{2} (x_t - A_t \mu_{t-1} - B_t u_t)^T (R_t^{-1} - R_t^{-1}A_t S^{-1} A_t^T R_t^{-1}) (x_t - A_t \mu_{t-1} - B_t u_t).
$$

From the belief of $$x_t$$, 

$$
\overline{bel} (x_t) = \eta’ \exp \left({-L_t(x_t)} \right),
$$

we can see that the belief of $$x_t$$ is also distributed as a Gaussian:

$$
\overline{bel} (x_t) \sim \mathcal{N}(A_t \mu_{t-1} + B_t u_t, (R_t^{-1} - R_t^{-1}A_t S^{-1} A_t^T R_t^{-1})^{-1})
$$

Moreover, using Woodbury identity, the covariance can be simplified as

$$
\begin{align}
&R_t^{-1} - R_t^{-1}A_t S^{-1} A_t^T R_t^{-1} \\
&= R_t^{-1} - R_t^{-1}A_t (A_t^T R_t^{-1} A_t + \Sigma_{t-1}^{-1})^{-1} A_t^T R_t^{-1} \\
&= (R_t + A_t \Sigma_{t-1} A_t^T)^{-1},
\end{align}
$$

yielding

$$
\overline{bel} (x_t) \sim \mathcal{N}(A_t \mu_{t-1} + B_t u_t, A_t \Sigma_{t-1} A_t^T + R_t) := \mathcal{N}(\bar{\mu}_t, \bar{\Sigma}_t). 
$$

Consequently, the prediction step is as below:

$$
\begin{align}
\bar{\mu}_t &= A_t \mu_{t-1} + B_t u_t \\
\bar{\Sigma}_t &= A_t \Sigma_{t-1} A_t^T + R_t
\end{align}
$$

### Correction

Using the measurement model and the above correction step of the Bayesian filter, we obtain

$$
\begin{align}
bel(x_t) &= \eta p(z_t|x_t)\overline{bel}(x_t) \\
&= \eta \mathcal{N}(C_t x_t, Q_t)\mathcal{N}(\bar{\mu}_t, \bar{\Sigma}_t).  \\
\end{align}
$$

Similar to the prediction step, the exponent is 

$$
M_t := \frac{1}{2} (z_t - C_t x_t)^T Q_t^{-1} (z_t - C_t x_t) + \frac{1}{2} (x_t - \bar{\mu}_t)^T \bar{\Sigma}_t^{-1} (x_t - \bar{\mu}_t)
$$

such that $$bel(x_t) = \eta\prime \exp \left(-M_t \right)$$.

When we compute the derivatives of $$M_t$$, 

$$
\begin{align}
&\frac{\partial M_t}{\partial x_t}\bigg\rvert_{x_t=\mu_t} = - (z_t - C_t x_t)^T Q_t^{-1} C_t + (x_t - \bar{\mu}_t)^T \bar{\Sigma}_t^{-1} = 0 \\
&\frac{\partial^2 M_t}{\partial x_t^2} = C_t^T Q_t^{-1} C_t + \bar{\Sigma}_t^{-1}, \\
\end{align}
$$

we obtain the covariance and the mean of $$bel(x_t)$$,

$$
\begin{align}
\Sigma_t &= (C_t^T Q_t^{-1} C_t + \bar{\Sigma}_t^{-1})^{-1}\\
\mu_t &= (C_t^T Q_t^{-1} C_t + \bar{\Sigma}_t^{-1})^{-1} (C_t^T Q_t^{-1} z_t + \bar{\Sigma}_t^{-1}\bar{\mu}_t)\\
&= \Sigma_t (C_t^T Q_t^{-1} z_t + (\Sigma_t^{-1} - C_t^T Q_t^{-1} C_t)\bar{\mu}_t) \\
&= \bar{\mu}_t + \Sigma_t C_t^T Q_t^{-1} (z_t - C_t\bar{\mu}_t) \\
&= \bar{\mu}_t + K_t (z_t - C_t\bar{\mu}_t), \\
\end{align}
$$

where $$K_t := \Sigma_t C_t^T Q_t^{-1}$$ is a Kalman gain. Consequently, the correction step is as below:

$$
\begin{align}
\mu_t &= \bar{\mu}_t + \Sigma_t C_t^T Q_t^{-1} (z_t - C_t\bar{\mu}_t) \\
\Sigma_t &= (C_t^T Q_t^{-1} C_t + \bar{\Sigma}_t^{-1})^{-1}
\end{align}
$$

### Computation efficiency

In most practical applications, the dimension of the state vector ($$n$$) is significantly larger than the dimension of the measurement vector ($$l$$). That is, for $$A_t \in \mathbb{R}^{m \times n}$$, $$B_t \in \mathbb{R}^{m\times k}$$, $$R_t \in \mathbb{R}^{m\times m}$$, $$C_t \in \mathbb{R}^{l\times m}$$, $$Q_t \in \mathbb{R}^{l\times l}$$, $$l$$ is smaller than $$n$$. In this case, directly inverting the $$n \times n$$ matrix $$\Sigma_t$$ is computationally expensive.

By applying the Matrix Inversion Lemma, we can rewrite the Kalman Gain. When we substitute $$\Sigma_t$$ of $$K_t$$ with $$\bar{\Sigma}_t$$, we obtain

$$
\begin{align}
K_t &= (C_t^T Q_t^{-1} C_t + \bar{\Sigma}_t^{-1})^{-1} C_t^T Q_t^{-1} \\
&= (\bar{\Sigma}_t - \bar{\Sigma}_t C_t^T (Q_t + C_t \bar{\Sigma}_t C_t^T)^{-1} C_t \bar{\Sigma}_t) C_t^T Q_t^{-1} ~\because {\rm Woodbury ~identity}\\
&= \bar{\Sigma}_t C_t^T (I - (Q_t + C_t \bar{\Sigma}_t C_t^T)^{-1} C_t \bar{\Sigma}_t C_t^T) Q_t^{-1} \\
&= \bar{\Sigma}_t C_t^T (Q_t + C_t \bar{\Sigma}_t C_t^T)^{-1}(Q_t + C_t \bar{\Sigma}_t C_t^T - C_t \bar{\Sigma}_t C_t^T) Q_t^{-1}\\
&= \bar{\Sigma}_t C_t^T (Q_t + C_t \bar{\Sigma}_t C_t^T)^{-1} \\
\end{align}
$$

Since the dimension of $$Q_t$$ and $$C_t \bar{\Sigma}_t C_t^T$$ is $$l$$, that is smaller than $$n$$, $$K_t$$ can be computed with less computational loads. This form is not only more efficient but also allows us to update the covariance without an explicit large-matrix inversion:

$$
\begin{align}
K_t C_t &= \Sigma_t C_t^T Q_t^{-1} C_t \\&= \Sigma_t (\Sigma_t^{-1} - \bar{\Sigma}_t^{-1}) \\
&= I - \Sigma_t \bar{\Sigma}_t^{-1}
\end{align}
$$

Then, $$\Sigma_t = (I - K_t C_t) \bar{\Sigma}_t$$ is derived. 

### Wrap-up

Finally, update equations can be summarized as follows:

- Prediction

$$
\begin{align}
\bar{\mu}_t &= A_t \mu_{t-1} + B_t u_t \\
\bar{\Sigma}_t &= A_t \Sigma_{t-1} A_t^T + R_t
\end{align}
$$

- Correction

$$
\begin{align}
K_t &= \bar{\Sigma}_t C_t^T (Q_t + C_t \bar{\Sigma}_t C_t^T)^{-1} \\
\mu_t &= \bar{\mu}_t + K_t (z_t - C_t\bar{\mu}_t) \\
\Sigma_t &= (I - K_t C_t) \bar{\Sigma}_t \\
\end{align}
$$

The Kalman Filter is a recursive algorithm that maintains a Gaussian belief over time. From the above derivation, we can observe that the product of two Gaussians is another Gaussian, and it provides the optimal estimate for linear systems under Gaussian noise. By exploiting the property that the mean value is minimizing the variance, we also derive the above update equations by minimizing error variance. 

However, its practical application is often limited by the assumptions we used for its derivation; linearity and Gaussian. To overcome these challenges, we can consider its variants, such as Extended KF, Unscented KF for non-linear system, or particle filter for non-Gaussian distributions. 