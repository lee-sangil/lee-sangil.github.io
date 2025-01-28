---
title: "Exposure Correction and Image Blending for Planar Panorama Stitching"
prefix: "ICCAS 2016"
categories:
 - Research
tags:
 - conference
 - panorama
 - blending
 - stitching
header:
  teaser: /assets/image/thumbnail/ICCAS2016.jpg
conference: ICCAS
authors: <u>Sangil Lee</u>, Seungjae Lee, Jaehyun Park, and H. Jin Kim
links: 
 - paper: 
   link: http://ieeexplore.ieee.org/abstract/document/7832309/
   name: "Paper"
 - bibtex: 
   name: "Bibtex"
excerpt_separator: <!--more-->
---

**Abstract:** In this paper, we propose a planar panorama stitching method to blend consecutive images captured by a multirotor equipped with a fish-eye camera. In addition, we suggest an exposure correction method to reduce the brightness difference between contiguous images, and a drift error correction method to compensate the estimated position of multirotor. In experiments, the multi-rotor flies at 35 meters above the ground, and the fish-eye camera attached in gimbals system takes pictures. Then we validate the performance of the algorithm with processing video frames. In order to supervise and observe a specific region, it is more efficient to blend multiple captured images, because it is possible to construct a planar map with higher resolution at low cost. In detail, first, geographic relation between consecutive images is estimated by using Euclidean homography. At the same time, the proposed algorithm estimates the position of multi-rotor on the planar map, so that it is possible to blend images with minimizing the variance of drift error. Then, the proposed algorithm uses histogram matching to compensate the different brightness of images. For this, we divide an image into three layers: background, foreground, and overexposure. Finally, we use multi-band blending to create a seamless panorama.

<!--more-->

## Bibtex <a id="bibtex"></a>
```
@inproceedings{lee2016exposure,
	title={Exposure correction and image blending for planar panorama stitching},
	author={Lee, Sangil and Lee, Seung Jae and Park, Jaehyun and Kim, H Jin},
	booktitle={Control, Automation and Systems (ICCAS), 2016 16th International Conference on},
	pages={128--131},
	year={2016},
	organization={IEEE}
}
```



