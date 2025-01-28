---
title: "Edge-Based Robust RGB-D Visual Odometry Using 2-D Edge Divergence Minimization"
prefix: "IROS 2018"
categories:
 - Research
tags:
 - conference
 - edge
 - rgbd
 - visual odometry
header:
  teaser: /assets/image/thumbnail/IROS2018.png
conference: IROS
authors: Changhyeon Kim, Pyojin Kim, <u>Sangil Lee</u>, and H. Jin Kim
links: 
 - paper: 
   link: https://ieeexplore.ieee.org/abstract/document/8593594/
   name: "Paper"
 - video:
   link: https://www.youtube.com/watch?v=EoOIknh8EAs
   name: "Video"
 - bibtex: 
   name: "Bibtex"
excerpt_separator: <!--more-->
---

{% include video id="EoOIknh8EAs" provider="youtube" %}

**Abstract:** This paper proposes an edge-based robust RGB-D visual odometry (VO) using 2-D edge divergence minimization. Our approach focuses on enabling the VO to operate in more general environments subject to low texture and changing brightness, by employing image edge regions and their image gradient vectors within the iterative closest points (ICP) framework. For more robust and stable ICP-based optimization, we propose a robust edge matching criterion with image gradient vectors. In addition, to reduce a bad effect of outlier residuals, we propose an improved edge registration problem of 2-D edge divergence minimization in the manner of an iterative re-weight least squares (IRLS) motion estimation. To accelerate the proposed approach, a pixel sub-sampling method is employed. We evaluate estimation performance of our method in changing brightness conditions and low-textured scenes. Our approach shows more robust motion estimation than state-of-the-art methods while maintaining comparable accuracy in challenging image sequences at real-time (25 Hz) operation.

<!--more-->

## Bibtex <a id="bibtex"></a>
```
@inproceedings{kim2018edge,
  title={Edge-Based Robust RGB-D Visual Odometry Using 2-D Edge Divergence Minimization},
  author={Kim, Changhyeon and Kim, Pyojin and Lee, Sangil and Kim, H Jin},
  booktitle={2018 IEEE/RSJ International Conference on Intelligent Robots and Systems (IROS)},
  pages={1--9},
  year={2018},
  organization={IEEE}
}
```
