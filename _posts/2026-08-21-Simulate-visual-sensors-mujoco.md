---
title: "Simulate Visual Sensors in MuJoCo"
lang: "en"
lang_ref: "2026-08-23-simulate-visual-sensors"
categories:
 - Robotics
tags:
 - mujoco
 - robotics
 - simulation
 - vision
 - camera
 - depth
 - lidar
 - rangefinder
header:
  teaser: /assets/image/thumbnail/2026-08-23-simulate-visual-sensors.jpg
excerpt_separator: <!--more-->
---

> MuJoCo provides two fundamentally different mechanisms for visual sensing. Camera-based sensors (RGB, depth, segmentation) are implemented through offscreen OpenGL rendering via the `mujoco.Renderer` class. Rangefinder-based sensors (LiDAR) are native MuJoCo sensors that use CPU raycasting and write their outputs directly to `mjData.sensordata`. This post covers both mechanisms, then attaches an RGB camera to the end-effector of a robot arm.

<!--more-->

{% include /assets/mujoco_visual_sensor.html %}
<br/>

A sensor in MuJoCo is any quantity that the engine computes and stores in `data.sensordata` during `mj_step` or `mj_forward`. MuJoCo’s built-in sensor types include accelerometers, gyroscopes, force/torque sensors, joint position/velocity sensors, and rangefinders. Camera rendering, however, is not part of these sensor types. It is handled separately through OpenGL-based offscreen rendering, producing pixel arrays rather than scalar sensor values. This difference requires a different observation pipeline. Rangefinder outputs are available immediately after a physics step, while camera images require an explicit rendering process.

## Define an MJCF scene

We start with a minimal scene containing a ground plane, a few objects, and a fixed camera. The [camera](https://mujoco.readthedocs.io/en/latest/XMLreference.html#body-camera) is defined with a `name`, `output`, `pos`, orientation (`quat`, `xyaxes`, etc.), `fovy`, and `resolution` attributes. Note that `fovx` (horizontal field of view) is computed automatically based on the image size and `fovy`. Some attributes, such as `resolution` and `output`, are not used for rendering, but for documentation. 

```xml
<mujoco model="sensor_demo">
  <visual>
    <global offwidth="640" offheight="480"/>
  </visual>

  <asset>
    <texture type="2d" name="grid" builtin="checker"
             width="512" height="512" rgb1=".1 .2 .3" rgb2=".2 .3 .4"/>
    <material name="grid" texture="grid" texrepeat="4 4" texuniform="true"/>
  </asset>

  <worldbody>
    <light pos="0 0 3" dir="0 0 -1" diffuse=".8 .8 .8"/>
    <geom type="plane" size="5 5 0.1" material="grid"/>

    <body name="red_box" pos="0.5 0 0.15">
      <geom type="box" size="0.15 0.15 0.15" rgba="1 0 0 1"/>
    </body>

    <body name="green_sphere" pos="-0.3 0.4 0.1">
      <geom type="sphere" size="0.1" rgba="0 1 0 1"/>
    </body>

    <body name="blue_cylinder" pos="0 -0.5 0.2">
      <geom type="cylinder" size="0.08 0.2" rgba="0 0 1 1"/>
    </body>

    <camera name="fixed_cam" output="rgb" pos="1.5 -1.5 1.8" xyaxes="1 1 0 -0.5 0.5 1"
            fovy="60" resolution="640 480"/>
  </worldbody>
</mujoco>
```

The `resolution` attribute sets the camera’s pixel dimensions. However, the size of rendered image is determined by the `width` and `height` attributes of Renderer. The `<visual>/<global>` element’s `offwidth` and `offheight` specify the maximum offscreen framebuffer size. These values must be at least as large as the camera resolution.

## Render RGB images

`mujoco.Renderer` wraps the OpenGL offscreen framebuffer. After constructing a `Renderer` with the desired resolution, the rendering pipeline calls: (1) `update_scene` to populate the internal scene graph from `mjData`, and (2) `render` to produce a pixel array.

```python
import mujoco
import numpy as np
import matplotlib.pyplot as plt

model = mujoco.MjModel.from_xml_string(XML)
data = mujoco.MjData(model)
mujoco.mj_forward(model, data)

renderer = mujoco.Renderer(model, height=480, width=640)
renderer.update_scene(data, camera="fixed_cam")
rgb = renderer.render()  # shape: (480, 640, 3), dtype: uint8
```

`update_scene` fetches either a camera name (string) or a camera index (integer). The returned array from `render` is an `(H, W, 3)` uint8 array in RGB order. The RGB image captured by the camera is rendered as follows:

<img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/cU0mv2g.png">

## Render depth images

`Renderer` instance can switch between RGB and depth modes. Calling `enable_depth_rendering` changes the output of `render` from an RGB array to a single-channel float array.

```python
renderer.enable_depth_rendering()
renderer.update_scene(data, camera="fixed_cam")
depth = renderer.render()  # shape: (480, 640), dtype: float32
renderer.disable_depth_rendering()
```

The returned depth values are in meters, measured along the camera’s optical axis. Pixels that see no geometry (background) receive the farthest distance. The near and far clipping planes are determined by `model.vis.map.znear` and `model.vis.map.zfar`. 

<img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/RdkCqS2.png">

## Render segmentation masks

MuJoCo can also produce per-pixel segmentation masks. Each pixel encodes two integers: the `geom` ID and the object type. This is useful for instance-level object detection in simulation.

```python
renderer.enable_segmentation_rendering()
renderer.update_scene(data, camera="fixed_cam")
seg = renderer.render()  # shape: (480, 640, 2), dtype: int32
renderer.disable_segmentation_rendering()

geom_ids = seg[:, :, 0]   # -1 for background
geom_types = seg[:, :, 1]
```

The first channel stores `model.geom` IDs (with -1 for background). The second channel stores `mjtObj` enum values identifying the object type, 5 for `geom` object. The below figure shows the IDs of the scene.

<img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/04vhAfj.png">

## Simulate LiDAR with rangefinder sensors

Unlike camera, which is defined directly inside `<body>` as part of the kinematic tree, [rangefinder](https://mujoco.readthedocs.io/en/latest/XMLreference.html#sensor-rangefinder) is defined inside `<sensor>` and references a `site` by name. The position and orientation of a sensor is defined by the corresponding `site`. MuJoCo’s `rangefinder` sensor casts a ray along the positive z-axis of a referenced `site` and returns the distance to the nearest `geom` intersection. A single rangefinder produces one scalar value per step. To simulate a 2D LiDAR scan, we create an array of `site` at uniform angular range.

The `<replicate>` tag duplicates internal contents with incremental transformations. It operates within the `<worldbody>`, not on `<sensor>`. Thus, the sites are replicated implicitly, but the corresponding sensor entries must be listed explicitly.

```xml
<mujoco model="lidar_demo">
  <worldbody>
    <light pos="0 0 3" dir="0 0 -1"/>
    <geom type="plane" size="5 5 0.1"/>
    <geom type="box" pos="2 0 0.5" size="0.5 0.5 0.5" rgba="1 0 0 1"/>
    <geom type="cylinder" pos="0 2 0.3" size="0.3 0.3" rgba="0 1 0 1"/>

    <body name="lidar_origin" pos="0 0 0.5">
      <!-- 1-degree angular resolution over 360 degrees -->
      <replicate count="360" sep="-" offset="0 0 0" euler="0 0 1">
        <site name="ray" size="0.01" pos="0.05 0 0"
              rgba="0.5 0.5 0.5 0.3"/>
      </replicate>
    </body>
  </worldbody>

  <sensor>
    <!-- Each replicated site generates ray-0 through ray-359 -->
    <rangefinder site="ray-000" cutoff="10"/>
    <rangefinder site="ray-001" cutoff="10"/>
    <!-- ... repeat for all 360 sites ... -->
    <rangefinder site="ray-359" cutoff="10"/>
  </sensor>
</mujoco>
```

The `<replicate>` element’s `euler` attribute specifies the incremental rotation applied between each copy. Here, `0 0 1` rotates each successive site by 1 degree around the z-axis. The `sep="-"` attribute determines the separator used when generating unique names: `ray` becomes `ray-000`, `ray-001`, etc. The `cutoff` attribute sets the maximum detection range. Rays that hit nothing within this distance return -1 in `sensordata`. Because raycasting operates on the CPU via `mj_ray`, it scales linearly with the number of rays. For 360 rays, this remains fast enough for real-time simulation. By the way, since manually writing 360 sensor entries is impractical, we can generate the MJCF programmatically:

```python
import mujoco
import numpy as np
import matplotlib.pyplot as plt

N_RAYS = 180

# Build sensor XML
sensor_lines = []
for i in range(N_RAYS):
    sensor_lines.append(f'    <rangefinder name="rf_{i}" site="ray-{i:03d}" cutoff="10"/>')
sensor_xml = "\n".join(sensor_lines)

XML = f"""
<mujoco model="lidar_demo">
  <worldbody>
    <light pos="0 0 3" dir="0 0 -1"/>
    <geom type="plane" size="5 5 0.1"/>
    <geom type="box" pos="2 0 0.5" size="0.5 0.5 0.5" rgba="1 0 0 1"/>
    <geom type="cylinder" pos="0 2 0.3" size="0.3 0.3" rgba="0 1 0 1"/>

    <!-- 1. Room boundaries -->
    <geom type="box" pos="0 4 0.5" size="4.1 0.1 0.5"/>  <!-- top -->
    <geom type="box" pos="0 -4 0.5" size="4.1 0.1 0.5"/> <!-- bottom -->
    <geom type="box" pos="4 0 0.5" size="0.1 4 0.5"/>    <!-- right -->
    <geom type="box" pos="-4 0 0.5" size="0.1 4 0.5"/>   <!-- left -->

    <body name="lidar_origin" pos="0 0 0.5">
      <replicate count="{N_RAYS}" sep="-" offset="0 0 0" euler="0 0 {360/N_RAYS}">
        <site name="ray" zaxis="1 0 0" size="0.01" pos="0.05 0 0"
              rgba="0.5 0.5 0.5 0.3"/>
      </replicate>
    </body>
  </worldbody>

  <sensor>
{sensor_xml}
  </sensor>
</mujoco>
"""

model = mujoco.MjModel.from_xml_string(XML)
data = mujoco.MjData(model)
mujoco.mj_forward(model, data)

# Extract rangefinder readings
distances = data.sensordata[:N_RAYS].copy()
# -1 means no intersection within cutoff
distances[distances < 0] = 10.0

# Convert to polar coordinates for plotting
angles = np.linspace(0, 2 * np.pi, N_RAYS, endpoint=False)

fig, ax = plt.subplots(subplot_kw={"projection": "polar"})
ax.scatter(angles, distances, s=1)
ax.set_rmax(10)
ax.set_title("2D LiDAR Scan")
plt.show()
```

<img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/76Swstj.png">

## Attach a sensor to the public model

Now, we load the Universal Robots UR10e from MuJoCo Menagerie and attach visual sensors to its end-effector link. Menagerie provides the UR10e model in `ur10e.xml`, which can be loaded via the `robot_descriptions` package or by cloning the repository directly. The UR10e's kinematic chain ends at the `wrist_3_link` gripper. We add a camera and a LiDAR to `wrist_3_link` so that it moves with the end-effector.

### Add a camera

Since camera elements cannot be added to a model after compilation, we must modify the model specification before calling `compile`. MuJoCo introduced the `MjSpec` API for programmatic model editing. It parses an MJCF file into an editable object, exposes methods like `add_camera`, `add_site`, and `add_sensor`, and finally produces an `MjModel` via `compile`.

```python
import mujoco
from robot_descriptions import ur10e_mj_description
from matplotlib import pyplot as plt

# import UR10e model
spec = mujoco.MjSpec.from_file(ur10e_mj_description.MJCF_PATH)

# Find the hand body and attach a camera to it
hand = spec.body("wrist_3_link")
hand.add_camera(
    name="ee_cam",
    pos=[0, 0, 0],
    xyaxes=[1, 0, 0, 0, -1, 0],
    fovy=60,
)

model = spec.compile()
data = mujoco.MjData(model)
mujoco.mj_forward(model, data)

# Render RGB from end-effector camera
renderer = mujoco.Renderer(model, height=240, width=320)
renderer.update_scene(data, camera="ee_cam")
rgb = renderer.render()

# Render depth from end-effector camera
renderer.enable_depth_rendering()
renderer.update_scene(data, camera="ee_cam")
depth = renderer.render()
renderer.disable_depth_rendering()

fig, axes = plt.subplots(1, 2, figsize=(12, 5))
axes[0].imshow(rgb)
axes[0].set_title("End-Effector RGB")
axes[0].axis("off")

axes[1].imshow(depth, cmap="viridis")
axes[1].set_title("End-Effector Depth")
axes[1].axis("off")

plt.tight_layout()
plt.show()
```

The `MjSpec.from_file` call automatically resolves mesh and texture asset paths relative to the XML file’s directory. 

The camera’s `xyaxes` attribute defines its orientation by specifying its local x and y axes in the parent body’s frame. Setting `xyaxes=[1, 0, 0, 0, -1, 0]` aligns the camera’s x-axis with the hand’s x-axis and the camera’s y-axis with the hand’s negative y-axis. Since MuJoCo cameras look along their local negative z-axis, this configuration results in the camera viewing along the hand’s positive z-direction. 

The camera moves rigidly with the end-effector as the arm configuration changes. Every call to `mj_forward` or `mj_step` updates the camera’s world-frame pose based on the current joint positions in `data.qpos`. Subsequent `update_scene` and `render` calls then produce images from the updated viewpoint.

### Add a rangefinder array

The LiDAR built in the above section uses `<replicate>` because the sites were written by hand in XML. Here we are already looping in Python, so `<replicate>` is unnecessary. Each site and its corresponding sensor can be added directly through the looping. 

```python
N_RAYS = 180
angles = np.linspace(0, 2 * np.pi, N_RAYS, endpoint=False)

for i, angle in enumerate(angles):
    site = hand.add_site(
        name=f"ray_{i:03d}",
        pos=[0, 0, 0.05],
        zaxis=[np.cos(angle), np.sin(angle), 0],
        size=[0.005],
    )
    rf = spec.add_sensor(
        name=f"rf_{i:03d}",
        type=mujoco.mjtSensor.mjSENS_RANGEFINDER,
        objtype=mujoco.mjtObj.mjOBJ_SITE,
        objname=site.name,
        cutoff=5,
    )
    rf.intprm[0] = 1  # request the "dist" data field

model = spec.compile()
data = mujoco.MjData(model)
mujoco.mj_forward(model, data)

distances = data.sensordata[-N_RAYS:].copy()
```

`hand.add_site` and `spec.add_sensor` mirror `hand.add_camera` from the previous step: they append an element to the spec and return a handle to it, so `data.qpos`/`mj_forward` work exactly as before. `objtype`/`objname` on the sensor assigns the target object, i. e., `site="ray-000"`, from the XML. `rf.intprm[0]` is a bit-mask value that represents the types of output data. `1=(1<<mjRAYDATA_DIST)=(1<<0)` makes the rangefinder produce a distance value only. 

### Reusing a custom sensor rig across models

The loop above only makes sense for the UR10e model. If the same 180-ray LiDAR should be mounted on a different robot later, it is preferable to define it once as an independent `MjSpec` and reuse it onto whichever public model, rather than duplicating the loop. 

```python
lidar = mujoco.MjSpec()
lidar.modelname = "lidar_ring"
mount = lidar.worldbody.add_body(name="mount")

for i, angle in enumerate(angles):
    site = mount.add_site(
        name=f"ray_{i:03d}",
        zaxis=[np.cos(angle), np.sin(angle), 0],
        size=[0.005],
    )
    rf = lidar.add_sensor(
        name=f"rf_{i:03d}",
        type=mujoco.mjtSensor.mjSENS_RANGEFINDER,
        objtype=mujoco.mjtObj.mjOBJ_SITE,
        objname=site.name,
        cutoff=5,
    )
    rf.intprm[0] = 1

mount_site = hand.add_site(name="lidar_mount", pos=[0, 0, 0.05])
spec.attach(lidar, site=mount_site, prefix="lidar_")
model = spec.compile()
```

`MjSpec.attach` attaches an entire subtree of a spec to another at a chosen `site` (or `frame`). So `rf_000` … `rf_179` are re-linked to the copied `ray_000` … `ray_179` sites automatically. `prefix` avoids name collisions if the XML file has elements with the same names. This separates the sensor rig's definition from the target robot, so the same `lidar` spec can later be attached to a different Menagerie model simply.
