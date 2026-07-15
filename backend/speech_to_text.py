# speech_to_text.py
import whisper

model = None

def transcribe(video_path):
    global model

    if model is None:
        model = whisper.load_model("base")

    result = model.transcribe(video_path)
    return result["text"]