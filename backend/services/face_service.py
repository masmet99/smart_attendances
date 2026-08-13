from insightface.app import FaceAnalysis
import cv2
import numpy as np

print("START FACE SERVICE")

app = FaceAnalysis(
    name="buffalo_s"
)

app.prepare(
    ctx_id=-1,
    det_size=(128, 128)
)

print("FACE MODEL LOADED")


def extract_embedding(image):

    if image is None:
        return None

    faces = app.get(image)

    if len(faces) == 0:
        return None

    return faces[0].embedding.tolist()


def extract_embedding_from_bytes(file_bytes):

    np_array = np.frombuffer(
        file_bytes,
        np.uint8
    )

    image = cv2.imdecode(
        np_array,
        cv2.IMREAD_COLOR
    )

    return extract_embedding(image)


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