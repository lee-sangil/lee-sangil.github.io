---
title: "Low-latency and Scene-robust Optical Flow Stream and Angular Velocity Estimation"
categories:
 - Research
 - Journal
tags:
 - event camera
 - optical flow
 - angular velocity
header:
  teaser: /assets/image/thumbnail/Access2021.png
conference: Access
authors: <u>Sangil Lee</u> and H. Jin Kim
links:
 - paper: 
   link: https://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=9622228.pdf
   name: "Paper"
 - video:
   link: https://youtu.be/qYpf6pg0Gd0
   name: "Video"
 - bibtex: 
   name: "Bibtex"
---

{% include video id="qYpf6pg0Gd0" provider="youtube" %}

**Abstract:** Event cameras are bio-inspired sensors that capture intensity changes of pixels individually, and generate asynchronous and independent ``events''. Due to the fundamental difference from the conventional cameras, most research on event cameras builds a global event frame by grouping events according to their timestamps or their number to employ traditional computer vision algorithms. However, in order to take advantage of event cameras, it makes sense to generate asynchronous output on an event-by-event basis. In this paper, we propose an optical flow estimation algorithm with low latency and robustness to various scenes to utilize the advantage of the event camera by enhancing the existing optical flow algorithm. Furthermore, we estimate angular velocity with low latency using the proposed optical flow stream. For the validation of algorithms, we evaluate the accuracy and latency of optical flow with publicly available datasets. Moreover, we assess the performance of the proposed angular velocity estimation in comparison to the existing algorithms. Both validations suggest that our asynchronous optical flow shows comparable accuracy to the existing algorithms and the latency is reduced by half compared to the existing block matching algorithm on average. Also, our angular velocity estimation is superior to the existing algorithms in terms of accuracy and robustness while showing low latency within 15 ms consistently.

## Bibtex <a id="bibtex"></a>
```
@article{lee2021low,
  title={Low-Latency and Scene-Robust Optical Flow Stream and Angular Velocity Estimation},
  author={Lee, Sangil and Kim, H Jin},
  journal={IEEE Access},
  volume={9},
  pages={155988--155997},
  year={2021},
  publisher={IEEE}
}
```