---
title: "A Derivation of Depth Filter"
categories:
 - Mathematics
tags:
 - visual odometry
 - depth filter
 - derivation
header:
  teaser: /assets/image/thumbnail/depth_filter.png
excerpt_separator: <!--more-->
---

> The depth filter is a useful component in monocular camera visual odometry systems, such as SVO (Semi-Direct Visual Odometry) [^svo] [^mono]. It is designed to estimate depth values from a sequence of images captured by a single camera. The filter operates under the assumption of Gaussian measurement noise, which represents the uncertainty inherent in the image measurements, and uniform outlier noise, which accounts for spurious measurements or anomalies in the data. In this post, we will derive the equations of the depth filter. We will start by explaining the underlying assumptions. This includes formulating the probabilistic models for the noise characteristics and how they influence the depth estimates. Additionally, we will discuss how the depth filter integrates new measurements over time to refine and update the depth values, ensuring robust and accurate visual odometry.

<!--more-->

## Likelihood and posterior model
Depth filter assumes that depth is measured from a combination of the Gaussian and Uniform distributions. For estimating true depth, the likelihood of measurement, $$x_n$$, is defined below:

$$
p(x_n|Z,\pi) := \pi N(x_n|Z,\tau^2) + (1-\pi) U(x_n|Z_{\textrm{min}},Z_{\textrm{max}}), \tag{1}\label{eq:model}
$$

where $$Z$$ and $$\tau$$ is a parameter of the Gaussian distribution of true depth, $$\pi$$ is a ratio of inlier, and $$Z_{\textrm{min}}, Z_{\textrm{max}}$$ is a range of Uniform distribution. Then the posterior probability is here:

$$
\begin{align}
    &p(Z,\pi|x_1,...x_n)\nonumber\\
    &=\frac{p(x_1,...,x_n|Z,\pi)p(Z,\pi)}{p(x_1,...,x_n)} && \because \textrm{Bayes's rule} \nonumber\\
    &=\frac{p(x_1,...,x_{n-1}|Z,\pi)p(x_n|Z,\pi)p(Z,\pi)}{p(x_1,...,x_n)} && \because \textrm{$x_i$ are independent}\nonumber\\
    &=\frac{p(Z,\pi|x_1,...,x_{n-1})p(x_1,...,x_{n-1})p(x_n|Z,\pi)}{p(x_1,...,x_n)}.\nonumber
\end{align}
$$

From the above equations, the posterior probability is proportional to the previous posterior:

$$
p(Z,\pi|x_1,...x_n) \propto p(Z,\pi|x_1,...,x_{n-1})p(x_n|Z,\pi).
$$

Let us re-parametrize $$x_1,...,x_n$$ to $$a_n,b_n,\mu_n,\sigma_n$$, satisfying below:

$$
\begin{align}
    p(Z,\pi|a_n,b_n,\mu_n,\sigma_n) &\propto p(Z,\pi|a_{n-1},b_{n-1},\mu_{n-1},\sigma_{n-1})p(x_n|Z,\pi) \\
    p(Z,\pi|a_n,b_n,\mu_n,\sigma_n) &:= N(Z|\mu_n,\sigma_n^2)Beta(\pi|a_n,b_n),\\\tag{2}\label{eq:propagation}
\end{align}
$$

where $$\Pi \sim Beta(a,b)$$ is the Beta distribution with two positive shape parameters, denoted by $$a$$ and $$b$$, and its probability density function is:

$$
Beta(\pi|a,b) = \frac{\pi^{a-1}(1-\pi)^{b-1}}{\int_0^1{u^{a-1}(1-u)^{b-1}du}} = \frac{B(\pi;a,b)}{B(a,b)}.
$$

and beta function, $$B(a,b)$$, is defined by

$$
B(a,b) := \int_0^1{u^{a-1}(1-u)^{b-1}du} = \frac{\Gamma(a)\Gamma(b)}{\Gamma(a+b)},\nonumber
$$

and its incomplete form is
$$
B(x;a,b) := x^{a-1}(1-x)^{b-1}.\nonumber
$$

Also gamma function, $$\Gamma(z)$$, is defined by

$$
    \Gamma(z) := \int_0^\infty{x^{z-1}e^{-x}dx},\nonumber
$$

and, for positive integer $$n$$,

$$
\Gamma(n) := (n-1)!\nonumber
$$

Then, expectation of random variable, $$Z$$, and its square are

$$
\begin{align}
    E(Z)&=\int{Z p(Z,\pi|a_n,b_n,\mu_n,\sigma_n) dZd\pi} \nonumber\\ 
    &= \int{Z N(Z|\mu_n,\sigma_n^2)Beta(\pi|a_n,b_n) dZd\pi} \nonumber\\
    &= \int{Z N(Z|\mu_n,\sigma_n^2) dZ} \nonumber\\
    &= \mu_n,\\\tag{3}\label{eq:meanZ}
\end{align}
$$

$$
\begin{align}
    E(Z^2)&=\int{Z^2 p(Z,\pi|a_n,b_n,\mu_n,\sigma_n) dZd\pi} \nonumber\\&= \int{Z^2 N(Z|\mu_n,\sigma_n^2) dZ} \nonumber\\
    &= \mu_n^2+\sigma_n^2,\\\tag{4}\label{eq:varZ}
\end{align}
$$

and expectation of random variable, $$\pi$$, and its square are

$$
\begin{align}
    E(\pi)&=\int{\pi p(Z,\pi|a_n,b_n,\mu_n,\sigma_n) dZd\pi} \nonumber\\ &= \int{\pi Beta(\pi|a_n,b_n) d\pi} \nonumber\\
    &= \int{\pi \frac{B(\pi;a_n,b_n)}{B(a_n,b_n)}d\pi} \nonumber\\&= \frac{1}{B(a_n,b_n)}\int{B(\pi;a_n+1,b_n)d\pi} \nonumber\\ 
    &= \frac{\Gamma(a_n+b_n)}{\Gamma(a_n)\Gamma(b_n)}\cdot\frac{\Gamma(a_n+1)\Gamma(b_n)}{\Gamma(a_n+b_n+1)} \nonumber\\
    &= \frac{a_n}{a_n+b_n},\\\tag{5}\label{eq:meanpi}
\end{align}
$$

$$
\begin{align}
    E(\pi^2)&=\int{\pi^2 p(Z,\pi|a_n,b_n,\mu_n,\sigma_n) dZd\pi} \nonumber\\&= \int{\pi^2 Beta(\pi|a_n,b_n) d\pi} \nonumber\\ 
    &= \frac{\Gamma(a_n+b_n)}{\Gamma(a_n)\Gamma(b_n)}\cdot\frac{\Gamma(a_n+2)\Gamma(b_n)}{\Gamma(a_n+b_n+2)} \nonumber\\
    &= \frac{a_n (a_n+1)}{(a_n+b_n)(a_n+b_n+1)}.\\\tag{6}\label{eq:varpi}
\end{align}
$$

## Update parameters
Now, we update model parameter $$a_{n-1}, b_{n-1}, \mu_{n-1}, \sigma_{n-1}$$ using Eq. \eqref{eq:model} and \eqref{eq:propagation}.

$$
\begin{align}
    p&(Z,\pi|a_n,b_n,\mu_n,\sigma_n) \propto \hspace{1mm} p(Z,\pi|a_{n-1},b_{n-1},\mu_{n-1},\sigma_{n-1})p(x_n|Z,\pi) \nonumber\\
    =& N(Z|\mu_{n-1},\sigma_{n-1}^2)Beta(\pi|a_{n-1},b_{n-1}) (\pi N(x_n|Z,\tau^2) + (1-\pi) U(x_n|Z_{\textrm{min}},Z_{\textrm{max}})) \nonumber\\
    =& N(Z|\mu_{n-1},\sigma_{n-1}^2)\frac{B(\pi;a_{n-1}+1,b_{n-1})}{B(a_{n-1},b_{n-1})} \cdot N(x_n|Z,\tau^2) + \nonumber\\
    & N(Z|\mu_{n-1},\sigma_{n-1}^2)\frac{B(\pi;a_{n-1},b_{n-1}+1)}{B(a_{n-1},b_{n-1})} \cdot U(x_n|Z_{\textrm{min}},Z_{\textrm{max}}) \nonumber\\
    =& N(Z|\mu_{n-1},\sigma_{n-1}^2)\frac{a_{n-1}}{a_{n-1}+b_{n-1}}\frac{B(\pi;a_{n-1}+1,b_{n-1})}{B(a_{n-1}+1,b_{n-1})} \cdot N(x_n|Z,\tau^2) + \nonumber\\
    & N(Z|\mu_{n-1},\sigma_{n-1}^2)\frac{b_{n-1}}{a_{n-1}+b_{n-1}}\frac{B(\pi;a_{n-1},b_{n-1}+1)}{B(a_{n-1},b_{n-1}+1)} \cdot U(x_n|Z_{\textrm{min}},Z_{\textrm{max}})\nonumber\\
    =& N(Z|\mu_{n-1},\sigma_{n-1}^2)\frac{a_{n-1}}{a_{n-1}+b_{n-1}}Beta(\pi|a_{n-1}+1,b_{n-1}) \cdot N(x_n|Z,\tau^2) + \nonumber\\
    & N(Z|\mu_{n-1},\sigma_{n-1}^2)\frac{b_{n-1}}{a_{n-1}+b_{n-1}}Beta(\pi|a_{n-1},b_{n-1}+1) \cdot U(x_n|Z_{\textrm{min}},Z_{\textrm{max}}). \\\tag{7}\label{eq:update}
\end{align}
$$

From the above equation, note that the parameter of beta function, $$a, b$$, are increased by 1 relative to the term Gaussian and Uniform distributions, respectively. Then, we expect the mean and the variance of the posterior, $$p(Z,\pi \rvert a_n,b_n,\mu_n,\sigma_n)$$. For simplicity, we define constant $$\hat{C_1}$$ and $$\hat{C_2}$$, which satisfy

$$
\begin{align}
	\hat{C_1} N(Z|m,s^2) &:= N(Z|\mu_{n-1},\sigma_{n-1}^2) N(x_n|Z,\tau^2), \hspace{1em} \\
	\hat{C_2} &:= U(x_n|Z_{\textrm{min}},Z_{\textrm{max}}) = \frac{1}{Z_{\textrm{max}}-Z_{\textrm{min}}},\nonumber
\end{align}
$$

so that the Eq. \eqref{eq:update} will be

$$
\begin{align}
    p(Z,\pi|a_n,b_n,\mu_n,\sigma_n) \propto & \hspace{1mm} \hat{C_1} \frac{a_{n-1}}{a_{n-1}+b_{n-1}} N(Z|m,s^2) Beta(\pi|a_{n-1}+1,b_{n-1}) + \nonumber\\ &\hat{C_2} \frac{b_{n-1}}{a_{n-1}+b_{n-1}} N(Z|\mu_{n-1},\sigma_{n-1}^2)Beta(\pi|a_{n-1},b_{n-1}+1).\\\tag{8}\label{eq:simpleupdate}
\end{align}
$$

$$m, s$$ are calculated from

$$
\begin{align}
    &N(Z|\mu_{n-1},\sigma_{n-1}^2) N(x_n|Z,\tau^2) \nonumber\\
    &= \frac{1}{2\pi \tau\sigma_{n-1}}\exp\left(-\frac{(Z-\mu_{n-1})^2}{2\sigma_{n-1}^2}-\frac{(x_n-Z)^2}{2\tau^2}\right) \nonumber\\
    &= \frac{1}{2\pi \tau\sigma_{n-1}}\exp\left(-\frac{\tau^2(Z-\mu_{n-1})^2+\sigma_{n-1}^2(x_n-Z)^2}{2\tau^2\sigma_{n-1}^2}\right) \nonumber\\
    &= \frac{1}{2\pi \tau\sigma_{n-1}}\exp\left(-\frac{(\tau^2+\sigma_{n-1}^2)Z^2 - 2(\tau^2 \mu_{n-1}+\sigma_{n-1}^2x_n)Z+\tau^2 \mu_{n-1}^2 + \sigma_{n-1}^2 x_n^2}{2\tau^2\sigma_{n-1}^2}\right) \nonumber\\
    &= \frac{1}{2\pi \tau\sigma_{n-1}}\exp\left(-\frac{\tau^2 \mu_{n-1}^2 + \sigma_{n-1}^2 x_n^2}{2\tau^2\sigma_{n-1}^2}\right)\exp\left(-\frac{(\tau^2+\sigma_{n-1}^2)Z^2 - 2(\tau^2 \mu_{n-1}+\sigma_{n-1}^2x_n)Z}{2\tau^2\sigma_{n-1}^2}\right) \nonumber
\end{align}
$$

Here, let $$m = \frac{(\tau^2 \mu_{n-1}+\sigma_{n-1}^2x_n)}{(\tau^2+\sigma_{n-1}^2)}$$ and $$s^2 = \frac{\tau^2\sigma_{n-1}^2}{(\tau^2+\sigma_{n-1}^2)}$$, then

$$
\begin{align}
    &N(Z|\mu_{n-1},\sigma_{n-1}^2) N(x_n|Z,\tau^2) \nonumber\\
    &= \frac{1}{2\pi \tau\sigma_{n-1}}\exp\left(-\frac{\tau^2 \mu_{n-1}^2 + \sigma_{n-1}^2 x_n^2}{2\tau^2\sigma_{n-1}^2}\right)\exp\left(-\frac{Z^2 - 2\frac{(\tau^2 \mu_{n-1}+\sigma_{n-1}^2x_n)}{(\tau^2+\sigma_{n-1}^2)}Z}{2\frac{\tau^2\sigma_{n-1}^2}{(\tau^2+\sigma_{n-1}^2)}}\right) \nonumber\\
    &= \frac{1}{\sqrt{2\pi (\tau^2+\sigma_{n-1}^2)}}\exp\left(-\frac{\tau^2 \mu_{n-1}^2 + \sigma_{n-1}^2 x_n^2}{2\tau^2\sigma_{n-1}^2}+\frac{m^2}{2s^2}\right) \cdot \frac{1}{\sqrt{2 \pi s^2}}\exp\left(-\frac{(Z - m)^2}{2s^2}\right) \nonumber\\
    &= \hat{C_1} \cdot N(Z|m,s^2). \nonumber
\end{align}
$$

Therefore,

$$
\begin{align}
    \hat{C_1} &:= \frac{1}{\sqrt{2\pi (\tau^2+\sigma_{n-1}^2)}}\exp\left(-\frac{\mu_{n-1}^2}{2\sigma_{n-1}^2}-\frac{x_n^2}{2\tau^2}+\frac{m^2}{2s^2}\right) \nonumber\\&= \frac{1}{\sqrt{2\pi (\tau^2+\sigma_{n-1}^2)}}\exp\left(-\frac{(x_n-\mu_{n-1})^2}{2(\tau^2+\sigma_{n-1}^2)}\right) \nonumber
\end{align}
$$

Finally, Eq. \eqref{eq:simpleupdate} with unknown scaling constant $$C$$ is a probability satisfying below:

$$
\begin{align}
    \int{p(Z,\pi|a_n,b_n,\mu_n,\sigma_n)dZd\pi} =& \frac{1}{C} \int{\hat{C_1} \frac{a_{n-1}}{a_{n-1}+b_{n-1}} N(Z|m,s^2) Beta(\pi|a_{n-1}+1,b_{n-1})} + \nonumber\\ &\hat{C_2} \frac{b_{n-1}}{a_{n-1}+b_{n-1}} N(Z|\mu_{n-1},\sigma_{n-1}^2)Beta(\pi|a_{n-1},b_{n-1}+1) dZd\pi \nonumber\\
    =& \frac{1}{C} (\frac{a_{n-1}}{a_{n-1}+b_{n-1}}\hat{C_1}+\frac{b_{n-1}}{a_{n-1}+b_{n-1}}\hat{C_2}) = 1.
\end{align}
$$

For simplicity, 

$$
\begin{align}
    C_1 := \frac{a_{n-1}}{a_{n-1}+b_{n-1}} \frac{\hat{C_1}}{C}, \hspace{1em} 
    C_2 := \frac{b_{n-1}}{a_{n-1}+b_{n-1}} \frac{\hat{C_2}}{C} \nonumber
\end{align}
$$

Now, expectation of random variable, $$Z$$, and its square are

$$
\begin{align}
    E(Z)&=\int{Z p(Z,\pi|a_n,b_n,\mu_n,\sigma_n) dZd\pi} \nonumber\\ 
    &= \int{Z \Big\{C_1 N(Z|m,s^2) Beta(\pi|a_{n-1}+1,b_{n-1}) + C_2 N(Z|\mu_{n-1},\sigma_{n-1}^2)Beta(\pi|a_{n-1},b_{n-1}+1)\Big\} dZd\pi} \nonumber\\
    &= \int{Z \Big\{C_1 N(Z|m,s^2) + C_2 N(Z|\mu_{n-1},\sigma_{n-1}^2)\Big\} dZ} \nonumber\\
    &= C_1 m + C_2 \mu_{n-1}
\end{align}\\\tag{9}\label{eq:meanZnew}
$$

$$
\begin{align}
    E(Z^2)&=\int{Z^2 p(Z,\pi|a_n,b_n,\mu_n,\sigma_n) dZd\pi} \nonumber\\ 
    &= C_1 (m^2+s^2) + C_2 (\mu_{n-1}^2+\sigma_{n-1}^2)
\end{align}\\\tag{10}\label{eq:varZnew}
$$

and expectation of random variable, $$\pi$$, and its square are

$$
\begin{align}
    E(\pi)&=\int{\pi p(Z,\pi|a_n,b_n,\mu_n,\sigma_n) dZd\pi} \nonumber\\ 
    &= \int{\pi \Big\{C_1 N(Z|m,s^2) Beta(\pi|a_{n-1}+1,b_{n-1}) + C_2 N(Z|\mu_{n-1},\sigma_{n-1}^2)Beta(\pi|a_{n-1},b_{n-1}+1)\Big\} dZd\pi} \nonumber\\
    &= \int{\pi \Big\{C_1 Beta(\pi|a_{n-1}+1,b_{n-1}) + C_2 Beta(\pi|a_{n-1},b_{n-1}+1)\Big\} d\pi} \nonumber\\
    &= \int{C_1 \frac{B(\pi;a_{n-1}+2,b_{n-1})}{B(a_{n-1}+1,b_{n-1})} + C_2 \frac{B(\pi;a_{n-1}+1,b_{n-1}+1)}{B(a_{n-1},b_{n-1}+1)} d\pi} \nonumber\\
    &= C_1 \left(\frac{a_{n-1}+1}{a_{n-1}+b_{n-1}+1}\right) + C_2 \left(\frac{a_{n-1}}{a_{n-1}+b_{n-1}+1}\right)
\end{align}\\\tag{11}\label{eq:meanpinew}
$$

$$
\begin{align}
    E(\pi^2)&=\int{\pi^2 p(Z,\pi|a_n,b_n,\mu_n,\sigma_n) dZd\pi} \nonumber\\ 
    &= \int{C_1 \frac{B(\pi;a_{n-1}+3,b_{n-1})}{B(a_{n-1}+1,b_{n-1})} + C_2 \frac{B(\pi;a_{n-1}+2,b_{n-1}+1)}{B(a_{n-1},b_{n-1}+1)} d\pi} \nonumber\\
    &= C_1 \frac{(a_{n-1}+1)(a_{n-1}+2)}{(a_{n-1}+b_{n-1}+1)(a_{n-1}+b_{n-1}+2)} + C_2 \frac{(a_{n-1})(a_{n-1}+1)}{(a_{n-1}+b_{n-1}+1)(a_{n-1}+b_{n-1}+2)}
\end{align}\\\tag{12}\label{eq:varpinew}
$$

By comparing Eqs. \eqref{eq:meanZ}, \eqref{eq:varZ}, \eqref{eq:meanpi}, and \eqref{eq:varpi} with Eqs. \eqref{eq:meanZnew}, \eqref{eq:varZnew}, \eqref{eq:meanpinew}, and \eqref{eq:varpinew}, we obtain

$$
\begin{align}
    \mu_n &= C_1 m + C_2 \mu_{n-1} \nonumber\\
    \mu_n^2+\sigma_n^2 &= C_1 (m^2+s^2) + C_2 (\mu_{n-1}^2+\sigma_{n-1}^2) \nonumber\\
    \frac{a_n}{a_n+b_n} &= C_1 \left(\frac{a_{n-1}+1}{a_{n-1}+b_{n-1}+1}\right) + C_2 \left(\frac{a_{n-1}}{a_{n-1}+b_{n-1}+1}\right) \nonumber\\
    \frac{a_n (a_n+1)}{(a_n+b_n)(a_n+b_n+1)} &= C_1 \frac{(a_{n-1}+1)(a_{n-1}+2)}{(a_{n-1}+b_{n-1}+1)(a_{n-1}+b_{n-1}+2)} + C_2 \frac{(a_{n-1})(a_{n-1}+1)}{(a_{n-1}+b_{n-1}+1)(a_{n-1}+b_{n-1}+2)} \nonumber
\end{align}
$$

Therefore, 

$$
\begin{align}
    \mu_n &= C_1 m + C_2 \mu_{n-1} \nonumber\\
    \sigma_n^2 &= C_1 (m^2+s^2) + C_2 (\mu_{n-1}^2+\sigma_{n-1}^2)-\mu_n^2 \nonumber\\
    a_n &= \frac{[2]-[1]}{[1]-[2]/[1]} \nonumber\\
    b_n &= a_n\frac{1-[1]}{[1]}, \nonumber
\end{align}
$$

where

$$
\begin{align}
    &[1]: C_1 \left(\frac{a_{n-1}+1}{a_{n-1}+b_{n-1}+1}\right) + C_2 \left(\frac{a_{n-1}}{a_{n-1}+b_{n-1}+1}\right) \nonumber\\
    &[2]: C_1 \frac{(a_{n-1}+1)(a_{n-1}+2)}{(a_{n-1}+b_{n-1}+1)(a_{n-1}+b_{n-1}+2)} + C_2 \frac{(a_{n-1})(a_{n-1}+1)}{(a_{n-1}+b_{n-1}+1)(a_{n-1}+b_{n-1}+2)}. \nonumber
\end{align}
$$

[^svo]: [https://www.zora.uzh.ch/id/eprint/125453/1/ICRA14_Forster.pdf](https://www.zora.uzh.ch/id/eprint/125453/1/ICRA14_Forster.pdf)
[^mono]: [https://link.springer.com/article/10.1007/s12555-020-0654-8](https://link.springer.com/article/10.1007/s12555-020-0654-8)