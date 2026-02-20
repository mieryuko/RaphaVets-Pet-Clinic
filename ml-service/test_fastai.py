# test_fastai.py
"""
A lightweight test script to verify FastAI installation, DataLoaders, and training on a tiny dataset.
Safe for CPU or GPU. Avoids NaNs and CUDA IPC warnings.
"""

from fastai.vision.all import *
from fastai.data.external import URLs, untar_data
import torch

print("🖥 Current device:", default_device())

# Download tiny MNIST_SAMPLE dataset
path = untar_data(URLs.MNIST_SAMPLE)

# Create a small DataLoader
dls = ImageDataLoaders.from_folder(
    path,
    bs=16,           # tiny batch size for quick test
    num_workers=0    # prevent CUDA IPC warnings on Windows
)

# Create a small CNN learner
# pretrained=False to avoid ImageNet weight size mismatch
learn = vision_learner(dls, resnet18, pretrained=False, metrics=accuracy)

print("📦 FastAI imports and DataLoaders work!")
print("🚀 Starting a tiny training run...")

# Fine-tune for 1 epoch (very fast)
learn.fine_tune(1)

print("✅ Test training completed successfully!")

# Clear GPU memory (optional)
torch.cuda.empty_cache()
