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

## Downloads

We provide the following TAR.GZ files containing image frames, events, imu data.

<!-- | sequence name | duration | length | min valid depth | description |
|---------------|:--------:|:------:|:-------------------------:|-------------|
| one-object-static <br> [TGZ](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_one_object_static.tgz)(0.26GB), [bag](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_one_object_static.bag)(0.97GB), [rawlog](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_one_object_static.rawlog)(8KB) | 23.15s | 0.00m  | 75.65% | One object moves |
| two-object-static <br> [TGZ](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_two_object_static.tgz)(0.29GB), [bag](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_two_object_static.bag)(1.1GB), [rawlog](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_two_object_static.rawlog)(8KB) | 24.70s | 0.00m  | 45.67% | Two objects move |
| place-items <br> [TGZ](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_place_items.tgz)(0.22GB), [bag](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_place_items.bag)(0.76GB), [rawlog](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_place_items.rawlog)(7KB) | 39.91s | 0.00m | 27.70% | Place items on table |
| uav-flight-static <br> [TGZ](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_flight_static.tgz)(0.64GB), [bag](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_flight_static.bag)(2.9GB), [rawlog](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_flight_static.rawlog)(24KB) | 45.41s | 1.906m | 67.59% | UAV hovers |
| fast-object <br> [TGZ](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_fast_object.tgz)(0.55GB), [bag](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_fast_object.bag)(2.2GB), [rawlog](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_fast_object.rawlog)(18KB) | 32.99s | 10.84m | 75.73% | Object moves quickly     |
| slow-object <br> [TGZ](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_slow_object.tgz)(1.3GB), [bag](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_slow_object.bag)(4.3GB), [rawlog](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_slow_object.rawlog)(36KB) | 66.60s | 10.03m | 85.33% | Object moves slowly     |
| close-approach <br> [TGZ](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_close_approach.tgz)(0.75GB), [bag](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_close_approach.bag)(3.1GB), [rawlog](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_close_approach.rawlog)(26KB) | 47.57s | 5.441m | 14.19% | Object approaches closely  |
| leading-pioneer <br> [TGZ](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_leading_pioneer.tgz)(0.84GB), [bag](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_leading_pioneer.bag)(3.1GB), [rawlog](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_leading_pioneer.rawlog)(26KB) | 48.11s | 12.41m | 58.29% | Pioneer follows person  |
| uav-flight-circular <br> [TGZ](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_flight_circular.tgz)(1.2GB), [bag](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_flight_circular.bag)(5.3GB), [rawlog](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_flight_circular.rawlog)(45KB) | 82.48s | 24.42m | 68.41% | UAV follows circular trajectory with a radius of 1 m  | -->

For questions, comments, or suggestions, please feel free to send me an email.