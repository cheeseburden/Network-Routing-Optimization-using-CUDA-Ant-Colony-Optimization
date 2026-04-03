import os
os.environ["NUMBAPRO_NVVM"] = r"C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v13.2\nvvm\bin\x64\nvvm64_40_0.dll"
os.environ["NUMBAPRO_LIBDEVICE"] = r"C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v13.2\nvvm\libdevice"

from app.runner import run_optimization
print(run_optimization()["message"])
