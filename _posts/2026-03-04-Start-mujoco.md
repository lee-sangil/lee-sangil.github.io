---
title: "Getting Started with MuJoCo on macOS"
categories:
 - Robotics
tags:
 - mujoco
 - robotics
 - simulation
 - mjcf
 - macos
 - python
 - javascript
header:
  teaser: /assets/image/thumbnail/2026-03-04-start-mujoco.gif
excerpt_separator: <!--more-->
---

> MuJoCo (Multi-Joint dynamics with Contact) is a physics engine mainly developed by Emo Todorov and maintained by Google DeepMind. It is widely used in robotics, reinforcement learning research, and biomechanics. This post covers installation on macOS, importing model, and running simulations in Python and Javascript.

MuJoCo represents a mechanical system as a collection of rigid bodies connected by joints. The state of the system is described by generalized coordinates, positions and velocities. At each timestep, MuJoCo computes contact forces, applies actuator forces, integrates the equations of motion, and updates positions and velocities.

## Installation

**Python**: The official Python bindings are distributed as the `mujoco` package on PyPI. The package bundles a copy of the MuJoCo shared library. To install MuJoCo, just run the below command:

```bash
pip install mujoco
```

Also, to verify the installation, run

```bash
python -c "import mujoco; print(mujoco.__version__)"
```

**JavaScript**: MuJoCo provides official WebAssembly (WASM) bindings in the [google-deepmind/mujoco](https://github.com/google-deepmind/mujoco) repository. You can install the package using `npm`:

```bash
npm install mujoco-js
```

Also, you can verify the installation by checking the version of MuJoCo. `mj_version()` returns an integer-formed version. 

```js
import loadMujoco from 'mujoco-js';
const mujoco = await loadMujoco();
console.log(mujoco.mj_version()); // e.g. 338 for version 3.3.8
```

## Load a model

**Python**: `MjModel` is loaded from an XML file path

```python
import mujoco

model = mujoco.MjModel.from_xml_path("double_pendulum.xml")
data  = mujoco.MjData(model)
```

or an XML string

```python
import mujoco

xml_string = `
<mujoco model="{model_name}">
	...
</mujoco>
`
model = mujoco.MjModel.from_xml_string(xml_string)
data  = mujoco.MjData(model)
```

**JavaScript**: The WASM module has no access to the host filesystem. Instead, the MJCF XML is written to the virtual filesystem, `mujoco.FS`, then loaded via `MjModel.loadFromXML`:

```js
import loadMujoco from 'mujoco-js';
const mujoco = await loadMujoco();

xml_string = `
<mujoco model="{model_name}">
	...
</mujoco>
`
mujoco.FS.mkdir("/working");
mujoco.FS.mount(mujoco.MEMFS, { root: "." }, "/working");
mujoco.FS.writeFile("/working/scene.xml", xml_string);

const model = mujoco.MjModel.loadFromXML("/working/scene.xml");
const data  = new mujoco.MjData(model);
```

Once the loading API is in place, a pre-built MJCF model can be sourced from an existing library, or we can configure it directly in MJCF.

### Import open-source models

[**MuJoCo Menagerie**](https://github.com/google-deepmind/mujoco_menagerie) is the canonical model library maintained by Google DeepMind. It contains physically accurate MJCF models for robotic arms, humanoids, quadrupeds, mobile manipulators, drones, and biomechanical systems. Each model directory contains a `<model>.xml` (kinematic and physical description), a `scene.xml` (ground plane, light, and camera), and mesh assets in `assets/`.

<img class="image640" referrerpolicy="no-referrer" src="https://i.imgur.com/1rR4cZl.jpeg">

```bash
git clone https://github.com/google-deepmind/mujoco_menagerie.git
python -m mujoco.viewer --mjcf mujoco_menagerie/unitree_go2/scene.xml
```

[**Robosuite**](https://github.com/ARISE-Initiative/robosuite) is a manipulation-focused simulation framework built on MuJoCo, developed by the ARISE Initiative. It provides standardized benchmark tasks (Lift, Stack, NutAssembly, PickPlace, Door, etc.) and a modular API for composing new environments from robot models, arenas, and objects. Each environment exposes a Gym-style interface. On macOS, the viewer requires `mjpython` for the same reason as the passive viewer.

<img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/OyIiJQh.png">

```python
# pip install robosuite
import robosuite as suite

env = suite.make("Lift", robots="Panda", has_renderer=True)
obs = env.reset()
for _ in range(1000):
    action = env.action_space.sample()
    obs, reward, done, info = env.step(action)
    env.render()
```

[**Robot Descriptions**](https://github.com/robot-descriptions/robot_descriptions.py) provides programmatic access to MuJoCo Menagerie models and other MJCF/URDF robot descriptions.

```python
import mujoco
# pip install robot_descriptions
from robot_descriptions.loaders.mujoco import load_robot_description

model = load_robot_description("panda_mj_description")
data  = mujoco.MjData(model)
```

[**DeepMind Control Suite**](https://github.com/google-deepmind/dm_control) bundles a set of benchmark control tasks (cartpole, cheetah, humanoid, etc.) defined as MJCF models with reward functions.

<img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/tHsAp2A.jpeg">

```python
# pip install dm_control
from dm_control import suite

env = suite.load(domain_name="cheetah", task_name="run")
time_step = env.reset()
print(time_step.observation)
```

### Design a custom model

An MJCF model is an XML document rooted at `<mujoco>`. The key elements are:

- `<worldbody>`: kinematic tree root. All bodies are nested here.
- `<body>`: a rigid body. Contains `<geom>`, `<joint>`, and child `<body>` elements.
- `<geom>`: a collision and/or visual geometry attached to a body.
- `<joint>`: a degree of freedom connecting a body to its parent.
- `<actuator>`: an actuator attached to a joint. Common types: `motor`, `position`, `velocity`.

For example, the following MJCF defines a double pendulum:

```xml
<mujoco model="double_pendulum">
  <option timestep="0.002" integrator="RK4"/>

  <worldbody>
    <light pos="0 0 3" dir="0 0 -1"/>
    <geom name="floor" type="plane" size="1 1 0.1" rgba=".9 .9 .9 1"/>

    <body name="link1" pos="0 0 1">
      <joint name="hinge1" type="hinge" axis="0 1 0"/>
      <geom type="capsule" fromto="0 0 0  0 0 -0.5" size="0.04" rgba=".8 .2 .2 1"/>

      <body name="link2" pos="0 0 -0.5">
        <joint name="hinge2" type="hinge" axis="0 1 0"/>
        <geom type="capsule" fromto="0 0 0  0 0 -0.5" size="0.04" rgba=".2 .4 .8 1"/>
      </body>
    </body>
  </worldbody>

  <actuator>
    <motor name="torque1" joint="hinge1" gear="50" ctrllimited="true" ctrlrange="-1 1"/>
  </actuator>
</mujoco>
```

`timestep` in `option` tag sets the integration step in seconds. `integrator="RK4"` selects fourth-order Runge–Kutta; the default is semi-implicit Euler. Joint axes are expressed in the body’s local frame. `gear` scales the control input. For more information, visit [MuJoCo Documentation](https://mujoco.readthedocs.io/en/stable/XMLreference.html).

## Run a Simulation

### Write a Script

The core simulation loop uses three objects: `mujoco.MjModel` (compiled model, read-only at runtime), `mujoco.MjData` (mutable simulation state — positions, velocities, forces), and `mujoco.mj_step` (advances the simulation by `model.opt.timestep` seconds).

```python
import mujoco
import numpy as np

model = mujoco.MjModel.from_xml_path("double_pendulum.xml")
data  = mujoco.MjData(model)

# Set initial joint angles (radians)
data.qpos[0] = np.pi / 4   # hinge1
data.qpos[1] = np.pi / 6   # hinge2

# Run for 5 seconds and record joint angles
duration   = 5.0
trajectory = []

while data.time < duration:
    mujoco.mj_step(model, data)
    trajectory.append(data.qpos.copy())

trajectory = np.array(trajectory)
print(f"Simulated {len(trajectory)} steps")
print(f"Final qpos: {trajectory[-1]}")
```

`data.qpos` is a NumPy array of length `model.nq` (number of generalized position coordinates). In the above example, `nq == nv == 1`. `data.time` is automatically incremented by `model.opt.timestep` each call to `mj_step`. For more information, visit [MuJoCo Documentation](https://mujoco.readthedocs.io/en/stable/programming/simulation.html).

### Launch the Viewer

MuJoCo includes an interactive GUI viewer.

**Standalone**: launches a managed viewer directly from the command line as a standalone app. 

```bash
python -m mujoco.viewer --mjcf double_pendulum.xml
```

**Managed viewer**: `launch` runs its own physics loop at real-time rate. Use this when no custom stepping logic is needed.

```python
import mujoco
import mujoco.viewer

model = mujoco.MjModel.from_xml_path("double_pendulum.xml")
data  = mujoco.MjData(model)

mujoco.viewer.launch(model, data)
```

**Passive viewer**: The passive viewer allows user code to control the loop. On macOS, the passive viewer (`mujoco.viewer.launch_passive`) requires the main thread to perform rendering. The `mjpython` launcher, installed alongside the package, satisfies this constraint. Use `mjpython` instead of `python`:

```python
# run with: mjpython script.py
import mujoco
import mujoco.viewer
import time

model = mujoco.MjModel.from_xml_path("double_pendulum.xml")
data  = mujoco.MjData(model)

with mujoco.viewer.launch_passive(model, data) as viewer:
    start = time.time()
    while viewer.is_running() and time.time() - start < 10:
        mujoco.mj_step(model, data)
        viewer.sync()
```

`viewer.sync()` pushes the updated `data` state to the renderer. The `with` block ensures the viewer window closes on exit. The viewer can be seen as the below. 

<img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/o48Enkj.gif">

## Wrap-Up

This post covered the setup pipeline for MuJoCo on macOS. We started with Python and JavaScript installation, then looked at how to source pre-built models from online. Also, we have designed a custom MJCF model from scratch, and finished with a simulation loop and viewer usage. In the following post, I will build on this foundation by training a reinforcement learning agent on a MuJoCo model.