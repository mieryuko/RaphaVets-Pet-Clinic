from fastai.vision.all import *
from pathlib import Path
import re
import random  # Needed for RegexLabeller

def main():
    # ---------------------------
    # 1️⃣ Download and inspect dataset
    # ---------------------------
    path = untar_data(URLs.PETS)  # Oxford-IIIT Pet Dataset
    print(f"Dataset downloaded to: {path}")
    print(f"Number of images: {len(list((path/'images').iterdir()))}")

    # ---------------------------
    # 2️⃣ Label function using RegexLabeller
    # ---------------------------
    # Captures full breed name before the _<id>.<ext>
    # Use RegexLabeller on the filename only
    def labeller(fname):
        # fname is a Path object; we apply regex to fname.name
        m = re.match(r'(.+)_\d+\.[A-Za-z]+$', fname.name)
        return m.group(1).lower() if m else ''

    # Test labeller
    sample_files = random.sample(list((path/'images').iterdir()), 20)
    print("\nSample breed names from dataset:")
    for f in sample_files:
        print(f"File: {f.name}, Breed: {labeller(f).lower()}")

    # ---------------------------
    # 3️⃣ Create DataLoaders
    # ---------------------------
    dblock = DataBlock(
        blocks=(ImageBlock, CategoryBlock),
        get_items=get_image_files,
        splitter=RandomSplitter(valid_pct=0.2, seed=42),
        get_y=labeller,               # <- use RegexLabeller here
        item_tfms=Resize(460),
        batch_tfms=aug_transforms(size=224)
    )

    dls = dblock.dataloaders(path/'images', bs=32, num_workers=0)
    dls.show_batch(max_n=4, figsize=(8,8))

    # ---------------------------
    # 4️⃣ Create Learner
    # ---------------------------
    learn = vision_learner(dls, resnet34, metrics=[error_rate, accuracy])

    # ---------------------------
    # 5️⃣ Find learning rate
    # ---------------------------
    print("Finding optimal learning rate...")
    lr_finder = learn.lr_find()
    print(f"Suggested learning rate (valley): {lr_finder.valley}")

    # ---------------------------
    # 6️⃣ Fine-tune with early stopping
    # ---------------------------
    from fastai.callback.tracker import EarlyStoppingCallback, SaveModelCallback

    print("Starting fine-tuning with early stopping...")
    learn.fine_tune(
        10,
        base_lr=lr_finder.valley,
        cbs=[
            EarlyStoppingCallback(monitor='valid_loss', patience=2),
            SaveModelCallback(monitor='accuracy')
        ]
    )

    # ---------------------------
    # 7️⃣ Export trained model
    # ---------------------------
    ml_service_root = Path(__file__).resolve().parents[1]
    export_path = ml_service_root / "models" / "breed_model.pkl"
    export_path.parent.mkdir(parents=True, exist_ok=True)
    learn.export(export_path)
    print(f"Model exported to: {export_path}")


if __name__ == "__main__":
    main()
