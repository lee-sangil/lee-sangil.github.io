---
layout: single
title: LARR DVS Dynamic Environments Dataset
author_profile: true
toc: true
toc_sticky: true
sidebar:
  nav: "sidebar-category"
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

| Preview | Name | Download | Description |
|:-------:|------|----------|-------------|
| <img src="/assets/image/thumbnail/larr-dvs-de-dataset/indoor1_preview.gif" width=150/> | indoor1 | [TGZ](https://icsl.snu.ac.kr/sangillee/indoor1.tar.gz) (66MB) | • Indoor <br> • Manual movement |
| <img src="/assets/image/thumbnail/larr-dvs-de-dataset/outdoor1_preview.gif" width=150/> | outdoor1 | [TGZ](https://icsl.snu.ac.kr/sangillee/outdoor1.tar.gz) (12MB) | • Outdoor <br> • Day <br> • One vehicle <br> • Camera stops moving later |
| <img src="/assets/image/thumbnail/larr-dvs-de-dataset/outdoor2_preview.gif" width=150/> | outdoor2 | [TGZ](https://icsl.snu.ac.kr/sangillee/outdoor2.tar.gz) (9MB) | • Outdoor <br> • Day <br> • One motorcycle |
| <img src="/assets/image/thumbnail/larr-dvs-de-dataset/outdoor3_preview.gif" width=150/> | outdoor3 | [TGZ](https://icsl.snu.ac.kr/sangillee/outdoor3.tar.gz) (16MB) | • Outdoor <br> • Night <br> • Three vehicles |

For questions, comments, or suggestions, please feel free to send me an email.
