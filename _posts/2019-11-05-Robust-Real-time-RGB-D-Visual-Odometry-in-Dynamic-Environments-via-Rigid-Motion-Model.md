---
title: "Robust Real-time RGB-D Visual Odometry in Dynamic Environments via Rigid Motion Model"
categories:
 - Research
tags:
 - conference
 - real-time
 - visual odometry
 - dynamic environment
header:
  teaser: /assets/image/thumbnail/IROS2019.jpg
conference: IROS
authors: <u>Sangil Lee</u>, Clark Youngdong Son, and H. Jin Kim
links: 
 - paper: 
   link: https://ieeexplore.ieee.org/abstract/document/8968208
   name: "Paper"
 - video:
   link: https://www.youtube.com/watch?v=G-fS2iqzi1w
   name: "Video"
 - dataset: 
   link: /_pages/icsl-de-dataset/index.html
   name: "Dataset"
 - bibtex: 
   name: "Bibtex"
excerpt_separator: <!--more-->
---

{% include video id="G-fS2iqzi1w" provider="youtube" %}

**Abstract:** In the paper, we propose a robust real-time visual odometry in dynamic environments via rigid-motion model updated by scene flow. The proposed algorithm consists of spatial motion segmentation and temporal motion tracking. The spatial segmentation first generates several motion hypotheses by using a grid-based scene flow and clusters the extracted motion hypotheses, separating objects that move independently of one another. Further, we use a dual-mode motion model to consistently distinguish between the static and dynamic parts in the temporal motion tracking stage. Finally, the proposed algorithm estimates the pose of a camera by taking advantage of the region classified as static parts. In order to evaluate the performance of visual odometry under the existence of dynamic rigid objects, we use self-collected dataset containing RGB-D images and motion capture data for ground-truth. We compare our algorithm with state-of-the-art visual odometry algorithms. The validation results suggest that the proposed algorithm can estimate the pose of a camera robustly and accurately in dynamic environments.

<!--more-->

## Bibtex <a id="bibtex"></a>
```
@inproceedings{lee2019robust,
  title={Robust Real-time RGB-D Visual Odometry in Dynamic Environments via Rigid Motion Model},
  author={Lee, Sangil and Son, Clark Youngdong and Kim, H Jin},
  booktitle={2019 IEEE/RSJ International Conference on Intelligent Robots and Systems (IROS)},
  pages={6891--6898},
  year={2019},
  organization={IEEE}
}
```
