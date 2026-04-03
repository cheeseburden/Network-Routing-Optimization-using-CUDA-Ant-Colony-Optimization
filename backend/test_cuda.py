import numba.cuda
import numpy as np
try:
    arr = np.array([1, 2, 3])
    d_arr = numba.cuda.to_device(arr)
    print("to_device OK")
except Exception as e:
    print("Error type:", type(e))
    print("Error:", e)
