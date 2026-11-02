"""Word timings from faster-whisper. Usage: python3.13 -I asr_words.py <wav16k> [model] [lang]"""
import sys
sys.path.append('/root/.local/lib/python3.13/site-packages')
import soundfile as sf
from faster_whisper import WhisperModel
wav = sys.argv[1]; model = sys.argv[2] if len(sys.argv) > 2 else 'small'; lang = sys.argv[3] if len(sys.argv) > 3 else None
a, sr = sf.read(wav, dtype='float32')
if a.ndim > 1: a = a.mean(1)
m = WhisperModel(model, device='cpu', compute_type='int8')
segs, info = m.transcribe(a, language=lang, word_timestamps=True)
for s in segs:
    for w in s.words: print(f'{w.start:6.2f} {w.end:6.2f} {w.word.strip()}')
