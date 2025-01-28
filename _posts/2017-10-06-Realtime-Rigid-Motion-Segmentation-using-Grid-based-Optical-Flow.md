---
title: "Real-time Rigid Motion Segmentation using Grid-based Optical Flow"
prefix: "SMC 2017"
categories:
 - Research
tags:
 - conference
 - motion segmentation
 - optical flow
 - real-time
header:
  teaser: /assets/image/thumbnail/SMC2017.png
conference: SMC
authors: <u>Sangil Lee</u> and H. Jin Kim
links: 
 - paper: 
   link: http://www.smc2017.org/SMC2017_Papers/media/files/0359.pdf
   name: "Paper"
 - bibtex: 
   name: "Bibtex"
excerpt_separator: <!--more-->
---

**Abstract:** In the paper, we propose a rigid motion segmentation algorithm with the grid-based optical flow. The algorithm selects several adjacent points among grid-based optical flows to estimate motion hypothesis based on a so-called entropy and generates motion hypotheses between two images, thus separates objects which move independently of each other. The grid-based entropy is accumulated as a new motion hypothesis generated and the high value of entropy means that the motion has been estimated inaccurately in the corresponding grid. The motion hypothesis is estimated by three-dimensional rigid transformation and classified by the open-source implementation of density-based spatial clustering of applications with noise (DBSCAN). For the evaluation of the proposed algorithm, we use a self-made dataset captured by ASUS Xtion Pro live RGB-D camera. Our algorithm implemented in the unoptimized MATLAB code spends 170 ms of average computational time per frame, showing the potential for the application to the robust real-time visual odometry.

<!--more-->

## Bibtex <a id="bibtex"></a>
```
@article{leereal,
	title={Real-time Rigid Motion Segmentation using Grid-based Optical Flow},
	author={Lee, Sangil and Kim, H Jin},
	booktitle = {IEEE International Conference on Systems, Man, and Cybernetics (SMC)},
	year = {2017},
}
```



