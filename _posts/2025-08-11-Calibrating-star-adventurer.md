---
title: "Calibrating Skywatcher's Sky Adventurer"
prefix: "Astrophotography"
categories:
 - ETC
tags:
 - calibration
 - skywatcher
 - skyadventurer
 - astrophotography
 - startracker
header:
  teaser: /assets/image/thumbnail/2025-08-11-reticle.jpg
excerpt_separator: <!--more-->
---

> Preparing an equatorial mount for astrophotography requires a precise, multistep calibration process. The primary goal is to accurately align the mount's rotational axis with the Earth's axis of rotation. This guide outlines a four-step calibration process using Skywatcher's Sky Adventurer. Following these steps ensures that the mount can precisely track celestial objects, thereby enabling successful astrophotography.

<!--more-->

<img class="imageWideFull" referrerpolicy="no-referrer" src="https://i.imgur.com/uGDaz7W.png">

## Calibrate polar scope axis
This process aligns the polar scope's axis with the right ascension (RA) axis.
* Position the mount so that a bright, distant point is in the center of the polar scope.
* Rotate the mounting platform a half-turn.
* Check if the pointed object is still centered in the polar scope; if not, use the adjustment screws to correct the polar scope's axis direction.
* Repeat these steps several times to complete the calibration.

## Calibrate date and time graduation circles
This procedure ensures Polaris is positioned correctly on the celestial coordinates. 
* Rotate the mounting platform so that the date and time point to October 31st at 00:00.
* Adjusting polar scope calibration screw so that the '0' and '6' marks on the reticle are at the top and bottom of the mount.

| aligned date and time graduation circles | aligned polar scope reticle           |
| :----------------------------------------: | :-------------------------------------: |
| <img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/1CyVxq9.jpeg">    | <img class="image480" referrerpolicy="no-referrer" src="https://i.imgur.com/ng2VZJQ.jpeg"> |

## Adjust standard meridian (STDM) offset scale
Standard time and solar time differ because standard time follows socially agreed-upon time zones. This procedure corrects that difference. Such correction is essential in astronomy to improve equipment accuracy and achieve more precise observation results.
* Determine your current location (longitude and latitude) and the standard time zone based on UTC.
* Multiply the standard time zone offset by 15, since the Earth rotates 15° per hour.
* Calculate the difference between this multiplied value (the standard meridian) and your current longitude, and apply this value to the time meridian indicator.
* For example, if you are in Seoul and your coordinates are (37.51° N, 126.96° E), the standard time is UTC+09:00. Here, UTC+09:00 is based on 135° E. Therefore, the longitude offset is approximately 126.96° E − 135° E = −8° E (i.e., 8° W). Rotate the date graduation circle so that the time meridian indicator points to 8° W.

## Match date with time
* Rotate mounting platform to align with the current month, date, and time, based on standard time.
* Once Polaris is positioned properly according to the polar scope's reticle, the setup for astrophotography is complete.

Alternatively, you can use a polar scope application such as PS Align Pro. However, you should still follow the first step of the calibration process above and ensure the '0' and '6' on the reticle face the up and down directions of the mount, regardless of the longitude and latitude of the current location, before placing Polaris on the reticle.
