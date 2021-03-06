---
title: "Real-time Object-aware Monocular Depth Estimation in Onboard Systems"
categories:
 - Research
 - Journal
tags:
 - real-time
 - monocular
 - depth estimation
header:
  teaser: /assets/image/thumbnail/IJCAS2021.jpg
conference: IJCAS
authors: <u>Sangil Lee</u>, Chungkeun Lee, Haram Kim, and H. Jin Kim
links:
 - video:
   link: https://www.youtube.com/watch?v=xw5C1FYHHLU
   name: "Video"
 - bibtex: 
   name: "Bibtex"
---

**Abstract:** This paper proposes the object depth estimation in real-time, using only a monocular camera in an onboard computer with a low-cost GPU. Our algorithm estimates scene depth from a sparse feature-based visual odometry algorithm and detects/tracks objects' bounding box by utilizing the existing object detection algorithm in parallel. Both algorithms share their results, i.e., feature, motion, and bounding boxes, to handle static and dynamic objects in the scene. We validate the scene depth accuracy of sparse features with KITTI and its ground-truth depth map made from LiDAR observations quantitatively, and the depth of detected object with the Hyundai driving datasets and satellite maps qualitatively. We compare the depth map of our algorithm with the result of (un-) supervised monocular depth estimation algorithms. The validation shows that our performance is comparable to that of monocular depth estimation algorithms which train depth indirectly (or directly) from stereo image pairs (or depth image), and better than that of algorithms trained with monocular images only, in terms of the error and the accuracy. Also, we confirm that our computational load is much lighter than the learning-based methods, while showing comparable performance.

## Bibtex <a id="bibtex"></a>
```
```
