import pickle
from pathlib import Path
from fastai.vision.all import load_learner

class PatchedUnpickler(pickle.Unpickler):
    def find_class(self, module, name):
        if module == "pathlib":
            if name == "WindowsPath" or name == "PosixPath":
                return Path
        return super().find_class(module, name)

pickle.Unpickler = PatchedUnpickler

learner = load_learner("models/breed_model.pkl")
learner.export(fname="models/breed_model.pkl")
print("✅ Model re-exported successfully on Linux!")