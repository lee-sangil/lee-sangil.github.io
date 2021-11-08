---
layout: single
title: LARR DVS Dynamic Environments Dataset
author_profile: true
toc: true
toc_sticky: true
---

## File Formats
We provide the event camera datasets from the DAVIS240C in the following format.

### APS Images and DVS Events

We provide the time-stamped grayscale images, events, and IMU as a TAR.GZ file. 

* The **images** are stored as 240x180 8-bit monochrome images in PNG format.
* The **events** are stored as (t,x,y,p) in TXT format.
* Positive and negative events are marked as 1 or 0.

### Image Lists

We provide the list of images as a text file.
	
* Each line in the text file contains timestamp and image.
* The file may contain comments which begin with "#".

### Intrinsic Parameter

We provide the intrinsic parameter of each sequence in YAML format. The parameters are calculated by ROS camera_calibration package.

## Downloads (will be updated soon)

We provide the following TAR.GZ files containing image frames, events, imu data.

| preview | sequence name | duration | description |
|---------|---------------|:--------:|-------------|
| ![Alt Text](https://media.giphy.com/media/vFKqnCdLPNOKc/giphy.gif) | indoor1 <br> [TGZ](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_one_object_static.tgz)(0.26GB) | 0s | indoor/manual movement |
| ![Alt Text](https://media.giphy.com/media/vFKqnCdLPNOKc/giphy.gif) | outdoor1 <br> [TGZ](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_two_object_static.tgz)(0.29GB) | 0s | outdoor/day/one vehicle/camera stops later |
| ![Alt Text](https://media.giphy.com/media/vFKqnCdLPNOKc/giphy.gif) | outdoor2 <br> [TGZ](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_place_items.tgz)(0.22GB) | 0s | outdoor/day/one motorcycle/ |
| ![Alt Text](https://media.giphy.com/media/vFKqnCdLPNOKc/giphy.gif) | outdoor3 <br> [TGZ](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_flight_static.tgz)(0.64GB) | 0s | outdoor/night/three vehicles |

For questions, comments, or suggestions, please feel free to send me an email.
