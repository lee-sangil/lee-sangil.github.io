---
title: "Setting up ROS Development Environment on MacOS using Docker"
categories:
 - ETC
tags:
 - ros
 - docker
 - x11
 - xquartz
 - macos
header:
  teaser: /assets/image/thumbnail/2025-03-01-ros-docker-on-mac.jpg
excerpt_separator: <!--more-->
---

> Setting up ROS using Docker allows for a clean and efficient development environment on macOS. This post guides installing Docker, pulling and running ROS images, configuring XQuartz for GUI support, and launching containers with X11 forwarding. Following steps help to run ROS tools like rviz and rqt seamlessly on macOS terminal.

<!--more-->

## Docker on macOS

Docker provides an isolated environment to run Linux applications, making it an ideal choice for ROS development on macOS. Since macOS does not natively support Linux containers, Docker runs a lightweight Linux virtual machine in the background.

### Install Docker

1. Download and install [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/).
2. Or, you can use `brew` to install Docker:
   ```sh
   brew install --cask docker
   ```

3. Open Docker and verify whether it is running.

<img class="imageWide" referrerpolicy="no-referrer" src="https://i.imgur.com/nDJ0OYs.png">

### Pull a ROS Docker image

Once Docker is installed, the next step is to pull a ROS image and run a container. You can find the official Docker images at [Docker Hub](https://hub.docker.com/),

<img class="imageWide" referrerpolicy="no-referrer" src="https://i.imgur.com/P7QrJmz.png">

or Docker Desktop. 

<img class="imageWide" referrerpolicy="no-referrer" src="https://i.imgur.com/yBeZAq8.png">

I've chosen ROS noetic image (for Ubuntu 20.04) and run:
```sh
docker pull ros:noetic-ros-core
```

If you want to pull a ROS image with more pre-installed tools, you can choose a larger one, such as `ros:noetic-robot` or `ros:noetic-perception`, by checking the image size. 

### Run a ROS container

To create and access a ROS Docker container, run:
```sh
docker run -it ros:noetic /bin/bash
```

Also, if you want to open a new terminal of the container, use:
```sh
docker exec -it [container name] /bin/bash
```

Other basic Docker commands are as follows.
```sh
# Show the available images
docker images

# Show the history of an image
docker history [image name]

# Show the running containers
docker ps

# Show all containers
docker ps -a

# Execute a command in a running container
docker exec [container name] [command]

# Create a new image from the changed container
docker commit -m [description] [container name] [image repository]:[tag]
```

After installing ROS packages by following [ROS installation](https://wiki.ros.org/noetic/Installation/Ubuntu), I've obtained below error when executing `rqt_graph`.

<img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/qMtqdqa.png">

Since containers are isolated environments, so they cannot directly access the host system’s display server. Thus, GUI applications (such as `rviz` or `rqt`) will not work without X server which acts as a bridge between host and client machines. To enable GUI support, we need to set up an X server, specifically, xQuartz on macOS.

## Install X server (XQuartz) on macOS

Since ROS tools rely on X11 for graphical applications, we need to install and configure XQuartz, an X server implementation for macOS.

1. Download and install [XQuartz](https://www.xquartz.org/), or use `brew`:
   ```sh
   brew install --cask xquartz
   ```
2. Restart your computer after installation.
3. Open XQuartz and go to __Preferences → Security__.
4. Check __Allow connections from network clients__.

<img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/Ng1262d.png">

## Run Docker with X server configuration

To allow the Docker container to use the X server, we need to:
- Allow connections using `xhost`.
- Pass environment variables when starting the container.

Here’s a script to run a ROS container with GUI support:
```sh
# run_docker.sh
#!/bin/bash
PS_NAME=sangillee

xhost + # allow any host to connect to the X server
xhost + $(hostname) # specifically allow the local machine to connect
export HOSTNAME=$(hostname)

docker stop $PS_NAME 2>/dev/null # stop container with the same name to prevent conflict
docker rm $PS_NAME 2>/dev/null # remove the container with the same name

docker run \
    --name $PS_NAME \
    -e QT_X11_NO_MITSHM=1 \
    -e DISPLAY=host.docker.internal:0 \
    --hostname $(hostname) \
    --network host \
    -v /tmp/.X11-unix:/tmp/.X11-unix \
    -it $1 /bin/bash
```

**Explanation of key options**
- `-e QT_X11_NO_MITSHM=1`: do not use shared memory for container
- `-e DISPLAY=host.docker.internal:0`: pass the display environment variable to the container.
- `-v /tmp/.X11-unix:/tmp/.X11-unix`: mount the X11 socket for communication.
- `--network host`: use the host network for better performance and connectivity.

Now, inside the container, we can run ROS GUI applications, `rqt_graph`.

<img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/tOvsJUs.png">

## Conclusion

By using Docker and XQuartz, we can run ROS on macOS with full GUI support. This approach allows for a clean development environment without modifying the system. 