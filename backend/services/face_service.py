from insightface.app import FaceAnalysis

print("START FACE SERVICE")

app = FaceAnalysis()

app.prepare(
    ctx_id=-1,
    det_size=(640, 640)
)

print("FACE MODEL LOADED")


def extract_embedding(image_path):

    print("DUMMY EMBEDDING")

    return [0.1] * 512


def compare_embeddings(
    embedding1,
    embedding2
):

    return 0.9