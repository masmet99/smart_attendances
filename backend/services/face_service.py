from insightface.app import FaceAnalysis
import cv2
import numpy as np

app = FaceAnalysis()

app.prepare(
    ctx_id=-1,
    det_size=(640, 640)
)

print("InsightFace CPU Loaded")


def extract_embedding(image_path):

    image = cv2.imread(image_path)

    if image is None:
        return None

    faces = app.get(image)

    if len(faces) == 0:
        return None

    embedding = faces[0].embedding

    return embedding.tolist()


def compare_embeddings(
    embedding1,
    embedding2
):

    embedding1 = np.array(embedding1)
    embedding2 = np.array(embedding2)

    similarity = np.dot(
        embedding1,
        embedding2
    ) / (
        np.linalg.norm(embedding1)
        * np.linalg.norm(embedding2)
    )

    return float(similarity)