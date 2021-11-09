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

| Preview | Name | Description |
|:-------:|------|-------------|
| <img src="/assets/image/thumbnail/indoor1_image.gif" width=200/> <img src="/assets/image/thumbnail/indoor1_event.gif" width=200/> | indoor1 <br> [TGZ](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_one_object_static.tgz)(0.26GB) | <ul> <li>Indoor</li> <li>Manual movement</li> </ul> |
| <img src="/assets/image/thumbnail/outdoor1_image.gif" width=200/> <img src="/assets/image/thumbnail/outdoor1_event.gif" width=200/> | outdoor1 <br> [TGZ](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_two_object_static.tgz)(0.29GB) | * Outdoor <br> * Day <br> * One vehicle <br> * Camera stops later |
| <img src="/assets/image/thumbnail/outdoor2_image.gif" width=200/> <img src="/assets/image/thumbnail/outdoor2_event.gif" width=200/> | outdoor2 <br> [TGZ](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_place_items.tgz)(0.22GB) | - Outdoor <br> - Day <br> - One motorcycle |
| <img src="/assets/image/thumbnail/outdoor3_image.gif" width=200/> <img src="/assets/image/thumbnail/outdoor3_event.gif" width=200/> | outdoor3 <br> [TGZ](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_flight_static.tgz)(0.64GB) | • Outdoor <br> • Night <br> • Three vehicles |

For questions, comments, or suggestions, please feel free to send me an email.
