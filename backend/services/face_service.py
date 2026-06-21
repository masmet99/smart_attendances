from insightface.app import FaceAnalysis
import cv2
import numpy as np

app = FaceAnalysis()

try:

    app.prepare(
        ctx_id=0,
        det_size=(640, 640)
    )

    print("InsightFace GPU Loaded")

except Exception as e:

    print("GPU NOT AVAILABLE:", e)

    app.prepare(
        ctx_id=-1,
        det_size=(640, 640)
    )

    print("InsightFace CPU Loaded")