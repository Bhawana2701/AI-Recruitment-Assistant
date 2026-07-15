# speech_to_text.py
import whisper

model = None

def get_model():
    global model

    if model is None:
        model = whisper.load_model("base")

    return model

def transcribe(path):
    result = get_model().transcribe(path)
    return result["text"]