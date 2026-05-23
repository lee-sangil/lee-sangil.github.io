---
title: "Policy Gradient Methods: REINFORCE, Actor-Critic, A3C, and A2C"
categories:
 - Robotics
tags:
 - robotics
 - reinforcement-learning
 - policy-gradient
 - reinforce
 - derivation
 - actor-critic
 - a3c
 - a2c
 - python
header:
  teaser: /assets/image/thumbnail/2026-05-23-policy-gradient.gif
excerpt_separator: <!--more-->
---

> The previous post derived DQN, DDQN, and Dueling DQN. These value-based methods learn Q-function and follow a policy that maximizes Q-function. This approach works well for discrete action spaces but cannot be applied when actions are continuous, since the maximization step is no longer processed. On the other hand, policy gradient methods parameterize the policy directly and differentiate the expected return with respect to its parameters. This post reviews the three well-known algorithms of policy gradient methods — REINFORCE, Actor-Critic, A3C, and A2C.

<!--more-->

Policy gradient methods estimate the gradient of the expected return over trajectories sampled under the current policy and apply stochastic gradient ascent. They are inherently on-policy: the gradient estimator is only valid for data collected under the same policy that is being optimized, so each batch of trajectories is used instantly and then forgot. This post derives the basic policy gradient estimator in REINFORCE, then follows the chain of refinements through Actor-Critic, A3C, and A2C.

## REINFORCE

REINFORCE[^ref-reinforce] is the direct application of the policy gradient theorem. Its purpose is to show that expected return can be optimized by gradient ascent without differentiating through the environment dynamics.

The derivation proceeds in four steps: (1) express the gradient as an expectation, (2) apply the log-derivative trick to make sampling possible, (3) remove the environment dynamics from the gradient, and (4) replace the full trajectory return with the per-timestep return-to-go using causality.
 
### Derivations

Let $$\pi_\theta(a\vert s)$$ be a policy parameterized by $$\theta$$. The objective is the expected discounted return over trajectories $$\tau = (s_0, a_0, r_0, s_1, \ldots, s_T, a_T, r_T)$$ sampled from $$\pi_\theta$$:

$$
J(\theta) = \mathbb{E}_{\tau \sim \pi_\theta}\left[ R(\tau) \right] = \int p_\theta(\tau)\ R(\tau)\ d\tau, 
$$

where $$R(\tau) = \sum_{t=0}^{T} \gamma^t r_t$$ is the total discounted return. The trajectory probability is:
 
$$
p_\theta(\tau) = p(s_0) \prod_{t=0}^{T} \pi_\theta(a_t\vert s_t)\, p(s_{t+1}\vert s_t, a_t).\tag{1}\label{eq:trajectory}
$$

Then, the gradient of the objective with respect to $$\theta$$ is

$$
\nabla_\theta J(\theta) = \nabla_\theta \int p_\theta(\tau)\, R(\tau)\, d\tau = \int \nabla_\theta p_\theta(\tau) \cdot R(\tau)\, d\tau. \tag{2}\label{eq:gradient}
$$

The exchange of gradient and integral is valid when $$p_\theta(\tau)$$ is differentiable in $$\theta$$ and $$p_\theta(\tau) R(\tau)$$ is integrable.

For any positive function $$f(\theta) > 0$$, the identity $$\nabla_\theta f = f \cdot \nabla_\theta \log f$$ holds. Since $$p_\theta(\tau) > 0$$ for all trajectories with nonzero probability, we can apply this to $$p_\theta(\tau)$$:

$$
\nabla_\theta p_\theta(\tau) = p_\theta(\tau) \cdot \nabla_\theta \log p_\theta(\tau).
$$

Substituting it into Eq. \eqref{eq:gradient} yields

$$
\nabla_\theta J(\theta) = \int p_\theta(\tau) \cdot \nabla_\theta \log p_\theta(\tau) \cdot R(\tau)\, d\tau = \mathbb{E}_{\tau \sim \pi_\theta}\left[ \nabla_\theta \log p_\theta(\tau) \cdot R(\tau) \right].
$$
 
The gradient is now an expectation over trajectories, which can be estimated by sampling. However, $$\nabla_\theta \log p_\theta(\tau)$$ still contains the environment dynamics $$p(s_{t+1}\vert s_t, a_t)$$.

Taking the log of both sides of Eq. \eqref{eq:trajectory},
 
$$
\log p_\theta(\tau) = \log p(s_0) + \sum_{t=0}^{T} \log \pi_\theta(a_t\vert s_t) + \sum_{t=0}^{T} \log p(s_{t+1}\vert s_t, a_t).
$$
 
Differentiating it with respect to $$\theta$$ yields

$$
\begin{align}
\nabla_\theta \log p_\theta(\tau) &= \underbrace{\nabla_\theta \log p(s_0)}_{=~0} + \sum_{t=0}^{T} \nabla_\theta \log \pi_\theta(a_t\vert s_t) + \underbrace{\sum_{t=0}^{T} \nabla_\theta \log p(s_{t+1}\vert s_t, a_t)}_{=~0} \\
&= \sum_{t=0}^{T} \nabla_\theta \log \pi_\theta(a_t\vert s_t).
\end{align}
$$
 
The initial state distribution $$p(s_0)$$ and the transition dynamics $$p(s_{t+1}\vert s_t, a_t)$$ are determined by the environment and do not depend on $$\theta$$, so their gradients vanish. This modifies Eq. \eqref{eq:gradient} into

$$
\nabla_\theta J(\theta) = \mathbb{E}_{\tau \sim \pi_\theta}\left[ \left( \sum_{t=0}^{T} \nabla_\theta \log \pi_\theta(a_t\vert s_t) \right) \cdot R(\tau) \right].
$$
 
This is the trajectory-level form of the policy gradient. The dynamics are still present implicitly in the distribution over $$\tau$$, but they do not appear in the gradient computation itself. This is what makes the estimator be model-free.

Lastly, we can replace $$R(\tau)$$ with the return-to-go. By expanding $$R(\tau) = \sum_{t'=0}^{T} \gamma^{t'} r_{t'}$$ inside the double sum, we obtain
 
$$
\nabla_\theta J(\theta) = \mathbb{E}_{\tau \sim \pi_\theta}\left[ \sum_{t=0}^{T} \nabla_\theta \log \pi_\theta(a_t\vert s_t) \cdot \sum_{t'=0}^{T} \gamma^{t'} r_{t'} \right].
$$
 
Let's consider the terms where $$t' < t$$ only. The reward $$r_{t'}$$ depends only on the history up to time $$t'$$, which is determined before action $$a_t$$ is chosen. Conditioning on $$s_t$$, the reward $$r_{t'}$$ is fixed and factors out of the expectation over $$a_t$$:
 
$$
\mathbb{E}_\tau\left[ \nabla_\theta \log \pi_\theta(a_t\vert s_t) \cdot \gamma^{t'} r_{t'} \right] = \mathbb{E}_{s_t}\left[ \gamma^{t'} r_{t'} \cdot \mathbb{E}_{a_t \sim \pi_\theta(\cdot\vert s_t)}\left[ \nabla_\theta \log \pi_\theta(a_t\vert s_t) \right] \right].\tag{3}\label{eq:causality}
$$
 
Here, the inner expectation is identically zero:
 
$$
\begin{align}
\mathbb{E}_{a \sim \pi_\theta(\cdot\vert s)}\left[ \nabla_\theta \log \pi_\theta(a\vert s) \right] &= \int \pi_\theta(a\vert s) \cdot \frac{\nabla_\theta \pi_\theta(a\vert s)}{\pi_\theta(a\vert s)}\, da \\&= \int \nabla_\theta \pi_\theta(a\vert s)\, da \\&= \nabla_\theta \int \pi_\theta(a\vert s)\, da \\&= 0.
\end{align}
$$
 
This holds because $$\pi_\theta(\cdot\vert s)$$ is a probability distribution that sums up to 1 for all $$\theta$$, so its gradient is zero. Therefore, all terms with $$t' < t$$ vanish, and only $$t' \geq t$$ survives. Defining the return-to-go $$G_t = \sum_{t'=t}^{T} \gamma^{t'-t} r_{t'}$$:
 
$$
\nabla_\theta J(\theta) = \mathbb{E}_{\tau \sim \pi_\theta}\left[ \sum_{t=0}^{T} \gamma^t \nabla_\theta \log \pi_\theta(a_t\vert s_t) \cdot G_t \right].
$$

Finally, this is the REINFORCE estimator. It updates the parameter, $$\theta$$, using gradient ascent for the trajectory of each episode.
 
### Implementation
 
The implementation has three parts: a policy network that outputs action distribution parameters, a rollout loop that stores log-probabilities, and an update step that weights each log-probability by its return-to-go.
 
```python
import torch
import torch.nn as nn
import torch.nn.functional as F

class PolicyNet(nn.Module):
    def __init__(self, state_dim, action_dim, hidden=128):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(state_dim, hidden), nn.Tanh(),
            nn.Linear(hidden, action_dim),
        )
 
    def forward(self, s):
        return self.net(s)  # logits

policy = PolicyNet(state_dim, action_dim)

def select_action(state):
    mean, log_std = policy(state)
    dist = Normal(mean, log_std.exp())

    action = dist.rsample()
    log_probs.append(dist.log_prob(action).sum(-1).squeeze(0))
    return action


def compute_returns(rewards, gamma=0.99):
    G, returns = 0.0, []
    for r in reversed(rewards):
        G = r + gamma * G
        returns.insert(0, G)
    return torch.tensor(returns, dtype=torch.float32)
 
 
def reinforce_update(optimizer, log_probs, rewards, gamma=0.99):
    returns = compute_returns(rewards, gamma)
    log_probs = torch.stack(log_probs)
    loss = -(log_probs * returns).sum()
    
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()
```
 
During rollout, an action is sampled from the current policy and its log-probability is stored. After the episode ends, the returns are computed by reversing the reward sequence, and the loss is the negative sum of $$\log \pi_\theta(a_t\vert s_t) \cdot G_t$$ across the trajectory. The negative sign converts gradient ascent on $$J$$ into gradient descent on the loss.
 
### Limitations
 
REINFORCE algorithm has two structural problems. First, every trajectory must come from the current $$\pi_\theta$$ and is discarded after one update, which makes sample efficiency poor. Second, a Monte Carlo return $$G_t$$ is computed from a whole trajectory, so the gradient estimate has high variance. Noisy estimates require small learning rates and many episodes to converge. The following algorithm addresses the variance problem by replacing $$G_t$$ with a learned approximation, the action-value function $$Q^\pi(s, a)$$.
 
## Actor-Critic

REINFORCE weights $$\nabla_\theta \log \pi_\theta(a_t\vert s_t)$$ by the Monte Carlo return $$G_t$$. The return $$G_t$$ is an unbiased but high-variance sample of $$Q^\pi(s_t, a_t)$$. Actor-Critic replaces $$G_t$$ with a learned critic $$Q_\phi(s_t, a_t)$$ that approximates $$Q^\pi$$. This reduces variance because the critic provides a consistent estimate across trajectories, but it introduces approximation bias between $$Q_\phi$$ and $$Q^\pi$$.

### Derivation

$$G_t$$ is a single-sample estimate of $$Q^\pi(s_t, a_t)$$ which is defined as

$$
\begin{align}
Q^\pi(s_t, a_t) &= \mathbb{E}\left[\sum_{t' = t}^{\infty} \gamma^{t'} r_{t'} \;\middle\vert \; s = s_t,\; a = a_t\right], \\&= \mathbb{E} \left[ G_t \,\middle\vert \, s_t, a_t \right].
\end{align}
$$

We can replace $$G_t$$ with $$Q^\pi(s_t, a_t)$$ inside the policy gradient without changing the expected gradient by the tower property of conditional expectation. Starting from the REINFORCE estimator:

$$
\mathbb{E}_\tau\left[ \nabla_\theta \log \pi_\theta(a_t\vert s_t) \cdot G_t \right].
$$

Apply iterated expectation by first conditioning on $$(s_t, a_t)$$:

$$
= \mathbb{E}_{s_t, a_t}\left[ \mathbb{E}_{\tau_{t+1:T}}\left[ \nabla_\theta \log \pi_\theta(a_t\vert s_t) \cdot G_t \,\middle\vert \, s_t, a_t \right] \right].
$$

Inside the inner expectation, $$(s_t, a_t)$$ is fixed. Thus, the remaining random variables in $$\tau$$ are those from time $$t+1$$ onward: the transitions $$s_{t+1}, a_{t+1}, r_{t+1}, \ldots$$. Since $$\nabla_\theta \log \pi_\theta(a_t\vert s_t)$$ depends only on $$(s_t, a_t)$$, it is a constant with respect to this inner expectation and factors out:

$$
= \mathbb{E}_{s_t, a_t}\left[ \nabla_\theta \log \pi_\theta(a_t\vert s_t) \cdot \underbrace{\mathbb{E}_{\tau_{t+1:T}}\left[ G_t \,\middle\vert \, s_t, a_t \right]}_{= Q^\pi(s_t, a_t)} \right].
$$

This gives the state-action form of the policy gradient theorem:

$$
\nabla_\theta J(\theta) = \mathbb{E}_{\tau \sim \pi_\theta}\left[ \nabla_\theta \log \pi_\theta(a\vert s) \cdot Q^\pi(s, a) \right].
$$

In Actor-Critic, a parameterized critic $$Q_\phi(s, a)$$ is trained to approximate $$Q^\pi$$ by minimizing the TD error:

$$
\mathcal{L}(\phi) = \mathbb{E}\left[ \left( Q_\phi(s_t, a_t) - (r_t + \gamma\, Q_\phi(s_{t+1}, a_{t+1})) \right)^2 \right].
$$

The actor loss uses the learned critic in place of $$Q^\pi$$:

$$
\mathcal{L}(\theta) = -\mathbb{E}\left[ \nabla_\theta \log \pi_\theta(a_t\vert s_t) \cdot Q_\phi(s_t, a_t) \right].
$$

### Implementation

The critic takes $$(s, a)$$ as input and outputs a scalar Q-value. The actor and critic have separate networks and separate optimizers.

```python
import torch.nn.functional as F

def actor_critic_update(s, a, r, s_next, a_next, gamma=0.99):
    # Critic update: one-step TD on Q
    with torch.no_grad():
        q_target = r + gamma * q_net(s_next, a_next)
 
    q_val = q_net(s, a)
    q_loss = F.mse_loss(q_val, q_target)
    
    q_opt.zero_grad()
    q_loss.backward()
    q_opt.step()
 
    # Actor update: weight log-prob by Q
    policy = policy_net(s)
    log_prob = compute_log_prob(policy, a)
    policy_loss = -(log_prob * q_val) # prevent from propagating gradients into the q_net
    
    policy_opt.zero_grad()
    policy_loss.backward()
    policy_opt.step()
```
 
### Limitations
 
The critic $$Q_\phi(s, a)$$ takes the state-action pair as input. For continuous or high-dimensional action spaces, this increases the input dimensionality and makes the critic harder to train. Additionally, online single-step updates are noisy: each gradient is computed from one transition.
 
A3C addresses both issues by switching the critic to $$V_\phi(s)$$ and batching updates across parallel workers.
 
## A3C

A3C (Asynchronous Advantage Actor-Critic)[^ref-a3c] makes two changes to Actor-Critic. First, it switches the critic from $$Q_\phi(s, a)$$ to $$V_\phi(s)$$. The advantage is then estimated from the TD residual rather than requiring a state-action critic. Second, it runs multiple workers in parallel, each collecting rollouts independently and applying gradients to a shared set of parameters asynchronously.
 
### Switch the critic from $$Q$$ to $$V$$
 
A state-dependent baseline $$b(s_t)$$ can be subtracted from $$Q^\pi(s_t, a_t)$$ without biasing the gradient. The proof reuses the identity from Eq. \eqref{eq:causality}. Multiplying both sides by any function $$b(s)$$ that does not depend on $$a$$:
 
$$
\mathbb{E}_{a \sim \pi_\theta}\left[ \nabla_\theta \log \pi_\theta(a\vert s) \cdot b(s) \right] = b(s) \cdot \mathbb{E}_{a \sim \pi_\theta}\left[ \nabla_\theta \log \pi_\theta(a\vert s) \right] = 0.
$$
 
Choosing $$b(s_t) = V^\pi(s_t)$$ subtracts $$V^\pi$$ from $$Q^\pi$$ without changing the expected gradient, giving the advantage:
 
$$
A^\pi(s_t, a_t) = Q^\pi(s_t, a_t) - V^\pi(s_t).
$$
 
Since only $$V^\pi$$ needs to be approximated, the advantage is estimated by the TD residual:
 
$$
\hat{A}_t = r_t + \gamma V_\phi(s_{t+1}) - V_\phi(s_t).
$$
 
This is a one-step bootstrap estimate of $$A^\pi$$. It has lower variance than $$G_t - V_\phi(s_t)$$ but introduces bias when $$V_\phi$$ is inaccurate.
 
### Asynchronous parallel workers
 
Each worker maintains a local copy of the parameters, collects a $$T$$-step rollout from its own environment instance, computes gradients, and applies them to the shared global parameters without waiting for other workers. Different workers explore different parts of the state space at different times, which reduces correlation in the training data. 

### Combined loss for shared network

A3C uses a shared network for actor and critic, with a combined loss over each $$T$$-step rollout:

$$
\mathcal{L}(\theta, \phi) = -\mathbb{E}_t[\log \pi_\theta(a_t\vert s_t) \cdot \hat{A}_t] + c_v\, \mathbb{E}_t[(\hat{R}_t - V_\phi(s_t))^2] - c_e\, \mathbb{E}_t[\mathcal{H}(\pi_\theta(\cdot\vert s_t))],
$$

where $$c_v$$ is the value loss coefficient and $$c_e$$ is an entropy regularization coefficient. The entropy term is added to the loss to prevent the policy from collapsing to a near-deterministic distribution.

The bootstrapped return at step $$t$$ of a rollout of length $$T$$ is:

$$
\hat{R}_t = \sum_{k=t}^{T-1} \gamma^{k-t} r_k + \gamma^{T-t} V_\phi(s_T),
$$

where $$V_\phi(s_T)$$ is the bootstrap value at the end of the rollout. The advantage is then $$\hat{A}_t = \hat{R}_t - V_\phi(s_t)$$.
 
### Limitations
 
Asynchronous updates lead to the stale gradient problem. While worker A computes a gradient based on its local parameter copy, worker B may have already updated the shared parameters. Worker A's gradient is then applied to parameters that have moved, which can degrade update quality. A2C eliminates this issue.
 
## A2C
 
A2C (Advantage Actor-Critic)[^ref-a2c] replaces A3C's asynchronous updates with synchronous updates. All workers collect their rollouts, gradients are averaged across the batch and applied as a single update to the shared parameters. This eliminates the stale gradient problem and makes the implementation simpler. The network structure and combined loss are identical to A3C.

<img class="image480" referrerpolicy="no-referrer" src="/assets/image/thumbnail/2026-05-23-policy-gradient.gif">

The animation above shows an A2C agent learning to navigate a 5×5 grid with obstacles. Each cell is colored by the critic's value estimate $$V(s)$$ — green means high expected return, while red means low — and the four arrows from each cell center show the actor's policy $$\pi(a \vert s)$$, where arrow length is proportional to the probability of choosing that direction.

Early in training, the value map is nearly uniform and the arrows point in arbitrary directions, meaning the agent has no preference yet. As episodes progress, the critic learns to assign higher values to cells closer to the goal, and the arrows gradually align into coherent paths that route around obstacles. By the end of training, the arrows form a clear flow field guiding the agent from any reachable cell toward the goal.

### Limitations
 
A2C is still on-policy and uses each rollout for a single gradient step. Two issues remain. First, the one-step TD residual is biased early in training when $$V_\phi$$ is far from $$V^\pi$$. A more sophisticated advantage estimator would interpolate between Monte Carlo and one-step TD. Second, and more fundamentally, large gradient steps on the policy loss can move $$\pi_\theta$$ far from the distribution that produced the rollouts, which destabilizes training.

## Wrap-up
 
|     | REINFORCE | Actor-Critic | A3C | A2C |
|:---:|:---:|:---:|:---:|:---:|
| Gradient | MC return $$G_t$$ | $$Q_\phi(s, a)$$ | $$\hat{A}_t$$ | $$\hat{A}_t$$ |
| Critic | none | $$Q_\phi(s, a)$$ | $$V_\phi(s)$$ | $$V_\phi(s)$$ |
| Update | per episode | per step | $$T$$-step rollout | $$T$$-step rollout |
| Parallelization | none | none | async workers | sync workers |
 
REINFORCE establishes the policy gradient identity. Actor-Critic replaces the Monte Carlo return with a learned $$Q$$-critic via the tower property. A3C simplifies the critic to $$V$$, introduces the advantage estimator via the TD residual, and parallelizes data collection with asynchronous workers. A2C replaces asynchronous with synchronous updates, eliminating stale gradients. All four share the on-policy constraint that data from old policies cannot be reused. The next post shows how to relax that constraint partially through importance sampling, while keeping the updates stable.

[^ref-reinforce]: [Simple Statistical Gradient-following Algorithms for Connectionist Reinforcement Learning](https://link.springer.com/article/10.1007/BF00992696)
[^ref-a3c]: [Asynchronous Methods for Deep Reinforcement Learning](https://arxiv.org/abs/1602.01783)
[^ref-a2c]: [OpenAI Baselines: ACKTR & A2C](https://openai.com/index/openai-baselines-acktr-a2c/)