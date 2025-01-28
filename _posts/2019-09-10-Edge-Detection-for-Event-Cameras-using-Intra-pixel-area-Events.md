---
title: "Edge Detection for Event Cameras using Intra-pixel-area Events"
prefix: "BMVC 2019"
categories:
 - Research
tags:
 - conference
 - edge
 - event camera
 - lifetime
header:
  teaser: /assets/image/thumbnail/BMVC2019.png
conference: BMVC
authors: <u>Sangil Lee</u>, Haram Kim, and H. Jin Kim
links: 
 - paper: 
   link: https://bmvc2019.org/wp-content/uploads/papers/1140-paper.pdf
   name: "Paper"
 - video:
   link: https://www.youtube.com/watch?v=3n5IKMP6SDU
   name: "Video"
 - bibtex: 
   name: "Bibtex"
excerpt_separator: <!--more-->
---

{% include video id="3n5IKMP6SDU" provider="youtube" %}

**Abstract:** In this work, we propose an edge detection algorithm by estimating a lifetime of an event produced from dynamic vision sensor, also known as event camera. The event camera, unlike traditional CMOS camera, generates sparse event data at a pixel whose log-intensity changes. Due to this characteristic, theoretically, there is only one or no event at the specific time, which makes it difficult to grasp the world captured by the camera at a particular moment. In this work, we present an algorithm that keeps the event alive until the corresponding event is generated in a nearby pixel so that the shape of an edge is preserved. Particularly, we consider a pixel area to fit a plane on Surface of Active Events (SAE) and call the point inside the pixel area closest to the plane as a intra-pixel-area event. These intra-pixel-area events help the fitting plane algorithm to estimate life time robustly and precisely. Our algorithm performs better in terms of sharpness and similarity metric than the accumulation of events over fixed counts or time intervals, when compared with the existing edge detection algorithms, both qualitatively and quantitatively.

<!--more-->

## Bibtex <a id="bibtex"></a>
```
@article{leeedge,
  title={Edge Detection for Event Cameras using Intra-pixel-area Events},
  author={Lee, Sangil and Kim, Haram and Kim, H Jin},
  booktitle={bmvc},
  year={2019}
}
```
