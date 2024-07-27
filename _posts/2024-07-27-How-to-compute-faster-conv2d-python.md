---
title: "[Python] How to Compute Faster 2-D Convolution in Python"
categories:
 - Python
tags:
 - convolution
 - numpy
 - image processing
header:
  teaser: /assets/image/thumbnail/python.jpg
excerpt_separator: <!--more-->
---

>In image processing, 2-D convolution is a highly useful operation. It can be used for tasks such as blurring, morphology, edge detection, and sharpening. In Python, a naive 2-D convolution method has a time complexity of $$O(H \cdot W \cdot k^2)$$ for an $$(H \times W)$$ image and a $$(k \times k)$$ kernel. This post introduces the use of `np.lib.stride_tricks` for enhancing performance of the convolution algorithm. The functions in this library directly access memory, so care must be taken when writing data to memory.

<!--more-->

A basic implementation of 2-D convolution can be illustrated with the following code:
```python
import numpy as np
import time

def conv2d(x, kernel):
    H, W = x.shape
    H_k, W_k = kernel.shape
    kernel_width_half = H_k // 2

    out = np.zeros_like(x)
    x_pad = np.pad(x, kernel_width_half)

    for i in range(0, H):
        for j in range(0, W):
            for m in range(0, H_k):
                for n in range(0, W_k):
                    out[i][j] += x_pad[i+m][j+n] * kernel[m][n]

    return out
```

This method involves multiple nested for-loops, which can lead to computation time increment as the size of the input matrix grows. For instance, with a 320x240 image and a 3x3 kernel, this 2-D convolution algorithm takes about 500 ms on a MacBook Air with an M1 processor.

To improve the performance of the 2-D convolution algorithm, `np.lib.stride_tricks.as_strided()` can be utilized. Essentially, this function creates a new array with the desired shape and strides. Strides refer to the number of bytes to skip when moving one step in a specific dimension. For example, let us consider the numpy array `x = np.array([[1,2],[3,4]], dtype=np.int64)`. The raw data bytes of `x` can be viewed as:
```python
x = np.array([[1,2],[3,4]], dtype=np.int64)
print(x.tobytes())
# b'\x01\x00\x00\x00\x00\x00\x00\x00 \x02\x00\x00\x00\x00\x00\x00\x00 \x03\x00\x00\x00\x00\x00\x00\x00 \x04\x00\x00\x00\x00\x00\x00\x00'
```

Here, `x[0]` corresponds to `b'\x01\x00\x00\x00 \x00\x00\x00\x00'` and `x[1]` to `b'\x02\x00\x00\x00 \x00\x00\x00\x00'`, because the stride of `x` along the column axis is 8 bytes. In the same manner, the stride along the row axis is 16 bytes.

```python
print(x.strides)
# (16, 8)
```

Thus, `np.lib.stride_tricks.as_strided(x, (4,), (8,))` results in `[1,2,3,4]`, and `np.lib.stride_tricks.as_strided(x, (4,), (4,))` results in `[1, 8589934592, 2, 12884901888]`, where `b'\x00\x00\x00\x00 \x02\x00\x00\x00'` corresponds to $$256^4 \times 2 = 8,589,934,592$$ and `b'\x00\x00\x00\x00 \x03\x00\x00\x00'` corresponds to $$256^4 \times 3 = 12,884,901,888$$.

Returning to the 2-D convolution method, for an $$H \times W$$ matrix `x` and an $$M \times N$$ kernel, `kernel`, padding the matrix with `x_pad = np.pad(x, ((M//2, M//2), (N//2, N//2)))` and using `np.lib.stride_tricks.as_strided(x_pad, (H, W, M, N), x_pad.strides + x_pad.strides)` creates a tensor of size $$H \times W \times M \times N$$. Each 2-D sub-matrix formed by the third and fourth dimensions will be element-wise multiplied by the kernel. The final output matrix is obtained using `np.einsum('klij,ij->kl', sub_matrices, kernel)`, which employs Einstein summation convention. In the first argument, `klij` represents the first to fourth dimensions of the `sub_matrices` tensor, and `ij` represents the dimensions of the kernel matrix. Hence, `klij,ij->kl` denotes:

$$
O_{kl} = \sum_{i,j} S_{klij} \cdot K_{ij}
$$

where $$S$$ is the `sub_matrices` tensor, $$K$$ is the `kernel` matrix, and $$O$$ is the output matrix. The full enhanced 2-D convolution code is as follows:
```python
def fast_conv2d(x, kernel):
    H, W = x.shape
    H_k, W_k = kernel.shape
    kernel_width_half = H_k // 2
    
    x_pad = np.pad(x, kernel_width_half)

    sub_matrices = np.lib.stride_tricks.as_strided(x_pad, (H, W, H_k, W_k), x_pad.strides*2)
    return np.einsum('klij,ij->kl', sub_matrices, kernel)
```

In the above code, `np.lib.stride_tricks.as_strided(x_pad, (H, W, H_k, W_k), x_pad.strides*2)` can be replaced with `np.lib.stride_tricks.sliding_window_view(x_pad, (H_k, W_k))`.
```python
def fast_conv2d(x, kernel):
    H_k, W_k = kernel.shape
    kernel_width_half = H_k // 2
    
    x_pad = np.pad(x, kernel_width_half)

    sub_matrices = np.lib.stride_tricks.sliding_window_view(x_pad, (H_k, W_k))
    return np.einsum('klij,ij->kl', sub_matrices, kernel)
```

Comparing the computation times of the three methods above, it is shown that the latter two methods are significantly faster. Additionally, `as_strided()` performs slightly better than `sliding_window_view()`. The error bars in the graph below are exaggerated to represent three times the standard deviation.

<img class="image640" referrerpolicy="no-referrer" src="https://imgur.com/tOv3cZD.png">