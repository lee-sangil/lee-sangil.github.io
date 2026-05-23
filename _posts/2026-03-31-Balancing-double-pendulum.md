---
title: "Balancing a Double Pendulum with DQN and MuJoCo"
categories:
 - Robotics
tags:
 - mujoco
 - robotics
 - reinforcement-learning
 - dqn
 - simulation
 - pendulum
 - double-pendulum
 - python
 - javascript
header:
  teaser: /assets/image/thumbnail/2026-03-31-mujoco-inverting-double-pendulum-dqn.gif
excerpt_separator: <!--more-->
---

> A double pendulum consists of two pendulums attached to each other, and is a classic physical system that exhibits complex and chaotic motion. The balancing problem of double pendulum using only a single motor on the first joint is a well-known benchmark in control theory and robotics. This post implements a DQN agent in Python that learns the swing-up-and-balance task from scratch. The core challenges are reward design and state representation. We address them with energy-based function and an augmented observation vector. Also, we introduce the techniques to improve the DQN. 

<!--more-->

{% include /assets/mujoco_balancing_double_pendulum.html %}
<br/>

The demo above runs a trained agent via MuJoCo. The pendulum starts hanging down. You can toggle a \[Get Inverted\] button in the control panel to activate the agent. The agent applies torque to the first joint, swings both links and makes them inverted. The arc at the pivot indicates the direction and magnitude of the applied torque. Adjust mass, length, damping, and gravity with the sliders to see how the agent handles configurations on which it was not trained.

In Q-Network, the action-value function $$Q^\pi(s, a)$$ is the expected cumulative reward from taking action $$a$$ in state $$s$$ and following policy $$\pi$$ thereafter:

$$
Q^\pi(s, a) = \mathbb{E}\left[\sum_{t=0}^{\infty} \gamma^t r_t \;\middle|\; s_0 = s,\; a_0 = a\right],
$$

where $$\gamma \in (0, 1)$$ is a discount factor that weights the current rewards higher than the next ones and accounts for the uncertainty in future rewards. From this definition, a recursive relationship known as the Bellman equation follows:

$$
Q^{\pi}(s, a) = \mathbb{E}_{s'\sim p(\cdot|s,a)}\left[r + \gamma \mathbb{E}_{a'\sim\pi(\cdot|s')}\left[ Q^{\pi}(s', a')\right]\right]
$$

The outer expectation accounts for stochastic state transitions through action, $$p(s'\vert s,a)$$, and the inner expectation accounts for a stochastic policy $$\pi(a'\vert s')$$. Also, $$r$$ is the received reward in the current state and $$Q(s', a')$$ is the expected reward from taking action $$a'$$ in the next state $$s'$$ to which transitioned from the state $$s$$ through the current action $$a$$. 

In this post, we simplify both of expectations. A MuJoCo, classical physics simulation, is deterministic so the outer expectation drops. Besides, the policy of DQN is greedy, that is, it selects the best action with the highest Q-value, so the inner expectation reduces to
 
$$
Q(s, a) = r + \gamma \max_{a'} Q(s', a').
$$

Once $$Q(s, a)$$ is estimated for all $$s, a$$, the optimal policy is obtained by $$a^* = \arg\max_a Q(s, a)$$.

Deep Q-Network (DQN) approximates $$Q(s, a)$$ with a neural network parameterized by $$\theta$$, i.e., $$Q_\theta(s,a) \approx Q(s,a)$$. It is trained to minimize the temporal-difference (TD) error:

$$
\mathcal{L}(\theta) = \mathbb{E}\left[\left(r + \gamma \max_{a'} Q_{\theta}(s', a') - Q_\theta(s, a)\right)^2\right]
$$

Transitions $$(s, a, r, s')$$ are sampled from episodes. Like Q-Network, the best action is $$\arg\max_a Q_\theta(s, a)$$ at each state. 

DQN additionally employs two techniques: experience replay, which breaks temporal correlation by sampling transitions uniformly from a stored buffer, and a target network, which is a periodically-synced copy of the Q-network used to compute stable regression targets. With a target network parameterized by $$\color{red}{\theta^-}$$, TD error is re-defined as

$$
\mathcal{L}(\theta) = \mathbb{E}\left[\left(r + \gamma \max_{a'} Q_{\color{red}{\theta^-}}(s', a') - Q_\theta(s, a)\right)^2\right]
$$

In the following content, we apply DQN to swing up and balance a double pendulum modeled in MuJoCo. The agent applies torque only to the first joint and learns when to pump energy, when to catch the pendulum near the top, and when to stabilize it. 


## MuJoCo model

MuJoCo loads models from MJCF (XML). The double pendulum consists of two rigid links connected by hinge joints.

```xml
<mujoco model="double_pendulum">
  <option gravity="0 0 -9.81" timestep="0.005" integrator="RK4">
    <flag warmstart="enable"/>
  </option>
  <worldbody>
    <body name="link1" pos="0 0 0">
      <joint name="joint1" type="hinge" axis="0 1 0" damping="0.2"
             armature="0.01"/>
      <geom type="capsule" size="0.04"
            fromto="0 0 0 0 0 -0.5" mass="1"/>
      <body name="link2" pos="0 0 -0.5">
        <joint name="joint2" type="hinge" axis="0 1 0" damping="0.2"
               armature="0.01"/>
        <geom type="capsule" size="0.04"
              fromto="0 0 0 0 0 -0.5" mass="1"/>
      </body>
    </body>
  </worldbody>
  <actuator>
    <motor name="torque1" joint="joint1" ctrlrange="-5 5"/>
  </actuator>
</mujoco>
```

`link1` is attached to the world at the origin via `joint1`, a hinge rotating around the y-axis. `link2` is attached to the tip of `link1` via `joint2`. Each link has length 0.5 m and mass 1 kg. Only `joint1` is actuated, and its motor produces torque in $$[-5, 5]$$ Nm. With gravity in $$-z$$ and the hinge axis along $$y$$, the pendulum swings in the $$xz$$-plane. At $$\theta_1 = \theta_2 = 0$$, links hang straight down. At $$\theta_1 = \pi, \theta_2 = 0$$, they are inverted. 

The simulation timestep is set to 0.005 s with the RK4 integrator. This small timestep prevents numerical divergence when large torques create high angular velocities. Joint damping of 0.2 and armature of 0.01 further stabilize the simulation by adding energy decay and rotor inertia to each joint.

## State space

MuJoCo stores generalized coordinates in `data.qpos` and velocities in `data.qvel`. The raw state is $$(\theta_1, \omega_1, \theta_2, \omega_2)$$. However, feeding raw angles directly into the network introduces a discontinuity at $$\pm\pi$$. Encoding each angle as $$(\cos\theta, \sin\theta)$$ removes this issue and provides a smooth representation. For efficient training, angular velocities are normalized by the heuristic maximum value to keep all inputs in a comparable range. 

Moreover, the network receives two additional physical quantities: the normalized mechanical energy and tip height. These values give the network direct access to the quantity that the reward function depends on, reducing the representational burden.

$$ \mathbf{s} = [\cos\theta_1, \sin\theta_1, \hat{\omega_1}, \cos\theta_2, \sin\theta_2, \hat{\omega_2}, \hat{E}, \hat{h}] $$

$$\hat{\omega_*}$$ is the normalized angular velocity as mentioned before, $$\hat{E}$$ is the current energy normalized to $$[0, 1]$$ between the hanging equilibrium and the inverted equilibrium. $$\hat{h}$$ is the tip height normalized to $$[-1, 1]$$, where zero value means the height of the first joint.

## Action space

DQN operates on a finite set of actions. We discretize the continuous torque range $$[-5, 5]$$ into nine levels:

$$
a \in \{\pm5.0, \pm3.75, \pm2.5, \pm1.25, 0.0\}
$$

The agent selects an action at each state and the corresponding torque is applied to the first joint. If the input is discretized too finely, the training time may take too long.

## Rewards

The swing-up task demands a reward that provides gradient from any state, not just near the goal only. To help agents get closer to their goal, we need to provide rewards all over the state map. Thus, we can discover episodes where agents reach their goal, and their training will speed up. We combine five terms, each targeting a different aspect of the task.

### Energy reward

The total mechanical energy at the inverted equilibrium $$(\theta_1=\pi, \theta_2=0, \dot\theta=0)$$ is a known constant: 

$$ 
E_{\text{target}} = m_1 g \frac{l_1}{2} + m_2 g (l_1 + \frac{l_2}{2}),
$$

where the ground level is set to the height of the first joint. 

For given physical coefficients,

$$
\begin{align}
l_1 &= 0.5, ~\rm length~of~link~1~[m] \\
l_2 &= 0.5, ~\rm length~of~link~2~[m] \\
m_1 &= 1.0, ~\rm mass~of~link~1~[kg] \\
m_2 &= 1.0, ~\rm mass~of~link~2~[kg] \\
g &= 9.81, ~\rm gravity~[m/s^2] \\
\end{align}
$$

and the moments of inertia,

$$
\begin{align}
I_1 &= \frac{1}{12} m_1 l_1^2, \\
I_2 &= \frac{1}{12} m_2 l_2^2, \\
\end{align}
$$

the mechanical energy of the pendulum is computed as below:

$$
\begin{align}
PE &= -m_1 g \frac{l_1}{2} \cos\theta_1 - m_2 g \left(l_1 \cos\theta_1 + \frac{l_2}{2} \cos(\theta_1+\theta_2) \right) \\
KE &= \frac{1}{2} I_1 \omega_1^2 + \frac{1}{2} I_2 (\omega_1 + \omega_2)^2 \\ &+ \frac{1}{2} m_1 \left(\frac{l_1}{2}\omega_1\right)^2 + \frac{1}{2} m_2 \left( l_1^2 \omega_1^2 + \left(\frac{l_2}{2}\right)^2 (\omega_1 + \omega_2)^2 + l_1 l_2 \cos\theta_2 \omega_1 (\omega_1 + \omega_2) \right) \\
E &= KE + PE
\end{align}
$$

From the above equation, the potential energy at the inverted and hanging positions are

$$
\begin{align}
PE_{\rm inverted} &= E_{\rm target} = m_1 g \frac{l_1}{2} + m_2 g (l_1 + \frac{l_2}{2}), \\
PE_{\rm hanging} &= -m_1 g \frac{l_1}{2} - m_2 g (l_1 + \frac{l_2}{2}). \\
\end{align}
$$

Like angular velocity in state space, the energy reward linearly maps the current energy from the hanging minimum to the inverted maximum, then clips to $$[0, 1.5]$$: 

```python
E_current = self._compute_energy()
E_normalized = (E_current - PE_HANGING) / (E_TARGET - PE_HANGING)
E_normalized = np.clip(E_normalized, 0.0, 1.5)
energy_reward = E_normalized
```

This provides continuous signal from the very first step and enhances convergence. At the hanging position, $$\hat{E} \approx 0$$. As the agent pumps energy, the reward increases linearly toward 1.0. The upper clip at 1.5 allows slight overshoot without unbounded reward. 

### Height reward

The height of the second link's tip provides a direct geometric signal for how close the pendulum is to vertical:

```python
tip_h = self._tip_height()
tip_norm = (tip_h / (L1 + L2) + 1.0) / 2.0
height_reward = tip_norm
```

The tip height based on the first joint is computed as 

$$
h_{tip} = -l_1\cos\theta_1 -l_2\cos(\theta_1+\theta_2),
$$

which reaches its maximum, $$L_1 + L_2$$, when both links point straight up. Similar to energy reward, height reward is also normalized to $$[-1, 1]$$.

### Balance reward

A discrete reward of balancing is added when both links are within 30° of vertical-up. This large reward makes the inverted region strongly attractive once the agent discovers it:

```python
balance_reward = 5.0 if self._is_inverted() else 0.0
```

### Work penalties

Velocity and torque penalties are applied conditionally. During swing-up, high velocities and large torques are necessary, so penalties are kept small. Once inverted, the agent should minimize oscillation, so penalties increase:

```python
vel_penalty = 0.0
if self._is_inverted():
    w1, w2 = self.data.qvel[0], self.data.qvel[1]
    vel_penalty = 0.01 * (w1**2 + w2**2)

torque_coef = 0.05 if self._is_inverted() else 0.01
torque_penalty = torque_coef * torque ** 2
```

Therefore, the full reward is

$$ r = \hat{E} + \hat{h} + b_{\text{inv}} - p_{\text{vel}} - p_{\text{torque}}. $$

## Q-network

The Q-network maps the 8-dimensional state to Q-values for each of the 9 actions. A two-layer MLP with 256 hidden units per layer handles this:

```python
class QNetwork(nn.Module):
    def __init__(self, state_dim: int, action_dim: int, hidden: int = 256):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(state_dim, hidden),
            nn.ReLU(),
            nn.Linear(hidden, hidden),
            nn.ReLU(),
            nn.Linear(hidden, action_dim),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x)
```

The output layer has no activation, because Q-values are unbounded real numbers.

## DQN agent

The agent holds two networks: Q-Network with $$\theta$$ and target Q-Network with $$\theta^{-}$$. The TD target uses the target network for both action selection and evaluation:

$$ y = r + \gamma \max_{a'} Q_{\theta^-}(s', a') $$

The target network is updated via Polyak averaging (soft update) with a small $$\tau$$ every training step:

$$ \theta^{-} \leftarrow \tau \cdot \theta + (1 - \tau) \cdot \theta^{-} $$

Also, action selection uses $$\epsilon$$-greedy exploration. An $$\epsilon$$ is a probability that the agent selects an action randomly. A large value of $$\epsilon$$ encourages the exploration, whereas a smaller $$\epsilon$$ focuses on the exploitation. For efficient training, $$\epsilon$$ starts at 1.0 and decays with each episode. 

## Train the agent

The training loop runs thousands of episodes. Each episode starts from the hanging-down equilibrium with small perturbation. A curriculum gradually increases the noise over training, forcing the agent to generalize across initial conditions.

A gradient update is performed after the buffer has accumulated enough. The replay buffer accumulates diverse transitions between updates. After training a model and running MuJoCo simulator, we can see the below result.

<img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/hfNf5cU.gif">

## DQN extensions

### Double DQN

The vanilla DQN uses the target network for both selecting the best action and evaluating the value. The $$\max$$ operator in $$\max_{a'} Q_{\theta^-}(s', a')$$ introduces a systematic positive bias: if $$Q$$ contains estimation noise, the action with the highest noisy value is selected, and its overestimated value is used as the target. Over a training, this bias accumulates and can slow convergence or destabilize training.

Double DQN decouples action selection from value evaluation. The online network $$Q_\theta$$ selects the best action $$a^*$$, and the target network $$Q_{\theta^-}$$ evaluates it:

$$
\begin{align}
a^* &= \arg\max_{a'} Q_{\theta}(s', a')\\
y &= r + \gamma\, Q_{\theta^-}(s', a^*)
\end{align}
$$

Since the online and target networks have partially independent parameters, the selection noise and evaluation noise are decorrelated. The overestimation is reduced without introducing any additional computational cost. The rest of the agent (replay buffer, $$\epsilon$$-greedy, soft update, Huber loss) remains identical to vanilla DQN.

### Dueling DQN

The vanilla Q-network maps state directly to $$Q(s, a)$$ for all actions through a single stream. The Dueling architecture splits this into two separate streams after a shared feature extractor. The value stream $$V(s)$$ estimates how good a state is regardless of action. The advantage stream $$A(s, a)$$ estimates the relative benefit of each action compared to the average. They are combined at the end of the network as
 
$$
Q(s, a) = V(s) + A(s, a) - \frac{1}{|\mathcal{A}|}\sum_{a'} A(s, a'). 
$$
 
Subtracting the mean advantage is important for making the decomposition well-defined. Without it, $$Q(s,a) = V(s) + A(s,a)$$ has a degree of freedom: adding any constant $$c$$ to $$V$$ and subtracting $$c$$ from $$A$$ leaves $$Q$$ unchanged, so the network cannot learn unique $$V$$ and $$A$$.
 
The mean subtraction resolves this. Taking the average over all actions on both sides of the equation:
 
$$
\frac{1}{|\mathcal{A}|}\sum_a Q(s, a) = V(s) + \frac{1}{|\mathcal{A}|}\sum_a A(s, a) - \frac{1}{|\mathcal{A}|}\sum_{a'} A(s, a')
$$
 
The last two terms cancel, leaving
 
$$
V(s) = \frac{1}{|\mathcal{A}|}\sum_a Q(s, a). 
$$
 
This constrains $$V(s)$$ to converge to the mean Q-value over actions for that state. Consequently, $$A(s, a)$$ represents the deviation of each action from this mean, and $$\frac{1}{\vert \mathcal{A} \vert }\sum_a A(s,a) = 0$$ is enforced. The theoretical definition $$V(s) = \max_a Q(s,a)$$ of DQN would require subtracting $$\max_a A$$ instead, but the original paper (Wang et al., 2016) found that mean subtraction produces more stable gradients during training.

```python
class DuelingQNetwork(nn.Module):
    def __init__(self, state_dim: int, action_dim: int, hidden: int = 256):
        super().__init__()
        self.feature = nn.Sequential(
            nn.Linear(state_dim, hidden), nn.ReLU(),
            nn.Linear(hidden, hidden),    nn.ReLU(),
        )
        self.value_stream = nn.Sequential(
            nn.Linear(hidden, hidden // 2), nn.ReLU(),
            nn.Linear(hidden // 2, 1),
        )
        self.advantage_stream = nn.Sequential(
            nn.Linear(hidden, hidden // 2), nn.ReLU(),
            nn.Linear(hidden // 2, action_dim),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        feat = self.feature(x)
        value = self.value_stream(feat)
        advantage = self.advantage_stream(feat)
        return value + advantage - advantage.mean(dim=1, keepdim=True)
```

This decomposition is particularly effective for the swing-up task. During the swinging phase, many torque values produce similar rewards, so the state value dominates the Q-value and the advantage differences are small. In these transitions, the value stream is updated efficiently. On the other hand, during balancing, the correct torque is critical and the advantage stream differentiates actions sharply. Transitions in the balancing region force the advantage stream to update efficiently. The Dueling architecture learns both regimes more efficiently than a flat network that must jointly represent $$V$$ and $$A$$ for every state-action pair.

Combining Dueling architecture with Double DQN yields Dueling Double DQN. The network structure changes to Dueling, and the TD target changes to Double DQN. Everything else — environment, reward, replay buffer, training loop, hyperparameters — remains identical to vanilla DQN. The training curves below compare the two variants:

|Algorithm|Training history|
|:--:|:--:|
|DQN | <img class="imageWide" referrerpolicy="no-referrer" src="https://i.imgur.com/u2sPMt3.png"> |
|Dueling Double DQN | <img class="imageWide" referrerpolicy="no-referrer" src="https://i.imgur.com/8CKZgXJ.png"> |

## Wrap-up

We implement vanilla DQN and Dueling Double DQN, and they can learn swing-up-and-balance problem on the double pendulum. The Dueling Double DQN typically shows faster convergence due to reduced overestimation and better value decomposition. 

Further improvements are possible with prioritized experience replay, which trains transitions with high TD error more frequently. For tasks requiring continuous torque output, policy gradient methods such as SAC (Soft Actor-Critic) or PPO (Proximal Policy Optimization) don't need to discretize action and can achieve smoother control profiles.