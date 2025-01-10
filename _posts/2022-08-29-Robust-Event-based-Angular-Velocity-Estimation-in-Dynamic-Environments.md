---
title: "Robust Event-based Angular Velocity Estimation in Dynamic Environments"
categories:
 - Research
tags:
 - dissertation
 - event camera
 - optical flow
 - angular velocity
 - dynamic environment
header:
  teaser: /assets/image/thumbnail/PhdDissertation.png
conference: Dissertation
authors: <u>Sangil Lee</u> and H. Jin Kim
links:
 - paper: 
   link: /assets/download/sangillee_dissertation.pdf
   name: "Paper"
 - presentation:
   link: /assets/download/sangillee_dissertation_ppt.pdf
   name: "Presentation"
 - dataset: 
   link: /_pages/larr-dvs-de-dataset/index.html
   name: "Dataset"
excerpt_separator: <!--more-->
---

**Abstract:** This dissertation addresses the problem of estimating the angular velocity of the event camera with robustness to a dynamic environment where moving objects exist. These vision-based navigation problems have been mainly dealt with in frame-based cameras. The traditional frame-based cameras such as monocular or RGB-D image sensors capture the whole frame of absolute intensity and/or depth, thus making them easy to recognize temporary environments. However, even under the common illumination conditions, these sensors require a certain amount of time to collect light during which data is not output, thus latency occurs. Also, a video with a high dynamic range, e.g., a 14-bit raw image, is not usually used for computer vision due to its extremely high data bandwidth, and the general 8-bit image sequences easily lose their intensity data under overexposure or underexposure environments. Contrary to the conventional cameras that produce frames, events cameras operate asynchronously by imitating the human eye. Event cameras respond to the intensity changes in the temporal domain and generate an event that is triggered at the pixel whose intensity has changed. Due to the nature of the event cameras, they output data stream with low latency and high time resolution in us units. Besides, the event cameras only perceive relative intensity, they can have a higher dynamic range of more than 120 dB, whereas the standard cameras have 60 dB approximately. I take these advantages of the event cameras to detect moving objects and estimate the ego-motion of the camera in dynamic environments.

<!--more-->

The first part of the dissertation focuses on asynchronously estimating optical flow streams with low latency and robustness to various scenes. Due to the fundamental difference between traditional and event cameras, most existing algorithms construct event frames by stacking the timestamp value of many events and exploit the legacy of traditional computer vision algorithms. However, this approach increases latency in proportion to the size of a time window, and the size has to be set heuristically. I estimate an optical flow stream with very low latency by enhancing the existing block matching algorithm. The locally estimated optical flow is more accurate than that of the method using a global event frame, in front of irregularly textured scenes. To validate the latency of optical flow, I present the result of angular velocity estimation by using the proposed optical flow stream. Then, the latency is computed by the optimization approach comparing the estimated and ground-truth angular velocity. The evaluation results suggest that the proposed optical flow has very low latency while showing comparable accuracy to event-frame-based algorithms. Besides, the performance of angular velocity estimation is superior to the other existing algorithms in terms of accuracy and robustness with low latency under 15 ms consistently.

The second part of the dissertation proposes an angular velocity estimation with motion segmentation. Unlike traditional cameras, since event cameras detect intensity changes, their event data can be dominated by a small but fast-moving object. To eliminate the influence from the movement of an undesirable object, I utilize the optical flow stream of the first work and intra-pixel-area method and separate an image frame into the static and dynamic regions. Moreover, since event cameras do not produce events at stationary, a classification model should be addressed in the temporal domain and be able to segment motion temporally. Thus, I employ the dual-mode motion model to update models that determine the region occupied by moving objects. Then, the angular velocity of ego-motion is estimated from a bunch of optical flows belonging to the static region. The evaluation results suggest that the proposed algorithm divides the image frame into static and dynamic parts successfully and estimates the angular velocity robustly in dynamic environments.