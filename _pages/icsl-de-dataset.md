---
layout: single
author_profile: true
toc: true
toc_sticky: true
---

# ICSL Dynamic Environments Dataset

## File Formats
We provide the RGB-D datasets from the ASUS Xtion Pro live in the following format.

### Color Images and Depth Maps

We provide the time-stamped color and depth images as a tar.gz file (TGZ). 

* The **color** images are stored as 640x480 8-bit RGB images in PNG format.
* The **depth** images are stored as 640x480 16-bit monochrome images in PNG format.
* The color and depth images are already rectified using OpenNI driver from PrimeSense.
* The depth images are scaled by a factor of 1000, i.e., a pixel value of 1000 in the depth image denotes a distance of 1 meter from the camera. A pixel value of 0 means missing data.

### Ground-truth Trajectories

We provide the ground-truth trajectories as a text file containing the translation and orientation of the camera in a fixed coordinate (Vicon). 

* Each line in the text file contains a single pose.
* The format of each line is 'time tx ty tz qx qy qz qw' as denoted in the text file.
* **time** (float) gives the UNIX system time.
* **tx ty tz** (3 floats) give the position of the color camera with respect to the fixed coordinates as defined by motion capture system.
* **qx qy qz qw** (4 floats) give the orientation of the color camera in form of a unit quaternion with respect to the fixed coordinates as defined by the motion capture system.

### Image Lists

We provide the list of the color and depth images as a text file.
	
* Each line in the text file contains synchronized timestamp and image (color or depth).
* The file may contain comments which begin with "#".
* We also provide **associations.txt** to make easy to evaluate ORB-SLAM algorithm.

### Intrinsic Parameter

Although we provide the intrinsic parameter of the camera in each dataset, values are shown below:

```
fx = 537.5999075271789 # focal length x
fy = 539.0333244312846 # focal length y
cx = 316.1486739642859 # optical center x
cy = 245.5186676348365 # optical center y

# depth scale for the 16-bit image
factor = 1000

# radial distortion coefficient
k1 = 0.035426591276682
k2 = -0.047648000294533
k3 = -0.207042022821082

# tangential distortion coefficient
p1 = 0.001070852971683
p2 = 0.001266157687369
```

The above values are calculated by MATLAB calibration toolbox, and the color and depth images are rectified in order to the pixels in the color and depth images correspond one-to-one.

## Downloads

We provide the following .tgz files containing RGB-D sequences and supplementary material (i.e. ground-truth, camera intrinsic, etc). 

| sequence name | duration | length | min <br> valid depth [\%] | description |
|---------------|:--------:|:------:|:-------------------:|-------------|
| one-object-static <br> [TGZ](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_one_object_static.tgz)(0.26GB), [bag](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_one_object_static.bag)(0.97GB), [rawlog](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_one_object_static.rawlog)(8KB) | 23.15s | 0.00m  | 75.65% | One object moves |
| two-object-static <br> [TGZ](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_two_object_static.tgz)(0.29GB), [bag](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_two_object_static.bag)(1.1GB), [rawlog](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_two_object_static.rawlog)(8KB) | 24.70s | 0.00m  | 45.67% | Two objects move |
| place-items <br> [TGZ](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_place_items.tgz)(0.22GB), [bag](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_place_items.bag)(0.76GB), [rawlog](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_place_items.rawlog)(7KB) | 39.91s | 0.00m | 27.70% | Place items on table |
| uav-flight-static <br> [TGZ](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_flight_static.tgz)(0.64GB), [bag](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_flight_static.bag)(2.9GB), [rawlog](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_flight_static.rawlog)(24KB) | 45.41s | 1.906m | 67.59% | UAV hovers |
| fast-object <br> [TGZ](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_fast_object.tgz)(0.55GB), [bag](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_fast_object.bag)(2.2GB), [rawlog](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_fast_object.rawlog)(18KB) | 32.99s | 10.84m | 75.73% | Object moves quickly     |
| slow-object <br> [TGZ](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_slow_object.tgz)(1.3GB), [bag](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_slow_object.bag)(4.3GB), [rawlog](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_slow_object.rawlog)(36KB) | 66.60s | 10.03m | 85.33% | Object moves slowly     |
| close-approach <br> [TGZ](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_close_approach.tgz)(0.75GB), [bag](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_close_approach.bag)(3.1GB), [rawlog](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_close_approach.rawlog)(26KB) | 47.57s | 5.441m | 14.19% | Object approaches closely  |
| leading-pioneer <br> [TGZ](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_leading_pioneer.tgz)(0.84GB), [bag](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_leading_pioneer.bag)(3.1GB), [rawlog](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_leading_pioneer.rawlog)(26KB) | 48.11s | 12.41m | 58.29% | Pioneer follows person  |
| uav-flight-circular <br> [TGZ](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_flight_circular.tgz)(1.2GB), [bag](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_flight_circular.bag)(5.3GB), [rawlog](https://icsl.snu.ac.kr/sangillee/rgbd_dataset_flight_circular.rawlog)(45KB) | 82.48s | 24.42m | 68.41% | UAV follows circular trajectory with a radius of 1 m  |

We describe datasets in terms of duration, length, and min valid depth ratio. The duration and length literally mean the total time and the distance it moved, respectively. The min valid depth ratio is a minimum percentage of the valid depth pixels among the entire depth frame. In the foregoing table, datasets belonging to the **Static Camera** were recorded by the situation where the camera is fixed on a certain point and one or two objects are moving around in front of the camera. On the other hand, datasets belonging to the **Non-static Camera** were recorded by the non-stationary camera, i.e. hand-held or attached to robot.

For questions, comments, or suggestions, please feel free to send me an email.
