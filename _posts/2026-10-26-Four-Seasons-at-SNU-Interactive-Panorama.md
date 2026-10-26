---
title: "Four Seasons at SNU: An Interactive Panorama"
lang: "en"
date: 2026-10-26
lang_ref: "2026-10-26-four-seasons-at-snu-interactive-panorama"
categories:
 - Playground
tags:
 - panorama
 - season
 - webgl
 - shader
 - interactive
header:
  teaser: /assets/image/thumbnail/2026-10-26-four-seasons-at-snu-interactive-panorama.gif
excerpt_separator: <!--more-->
---

> Seoul National University campus changes its appearance throughout the year. The interactive panorama shows the landscape in four seasons. You can use a mouse or a touch to control a viewing direction and a time.

<!--more-->

{% include /assets/campus_season_panorama.html %}
<br/>

The interactive demo above shows four seasons at Seoul National University (SNU). Move the mouse **left or right** over the panorama to look around the campus, and **up or down** to change the season. On a touchscreen, drag horizontally to pan and vertically to blend between seasons. You can also choose Spring, Summer, Autumn, or Winter with the buttons.

I also contributed this four-season panorama to the SNU Alumni Association newspaper, *총동창신문*. It appeared in the March 2023 issue (No. 540) as [“사진 한 컷: 서울대 사계절 파노라마”](https://www.snua.or.kr/magazine?md=v&seqidx=10945).

The source code for this interactive panorama is available in my [CampusSeason repository](https://github.com/lee-sangil/CampusSeason).

## Textures for seasons

Each season is stored and loaded as two images, the left and right halves of the panorama. The original panorama images are each 7256 × 1080 pixels, which exceeds the texture-size limit on a device whose maximum texture dimension is obtained by [`gl.getParameter(gl.MAX_TEXTURE_SIZE)`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getParameter). Splitting the image allows each half to fit that limit while keeping the full resolution.
