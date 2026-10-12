"""Word-level timestamps of a song's lyrics (whisper small, int8). Usage: lyrics.py <model_dir> <wav> [language]"""
import sys, json
sys.path.append('/root/.local/lib/python3.11/site-packages')
from faster_whisper import WhisperModel
md, p = sys.argv[1], sys.argv[2]; lang = sys.argv[3] if len(sys.argv) > 3 else None
m = WhisperModel('small', device='cpu', compute_type='int8', download_root=md)
segs, info = m.transcribe(p, beam_size=5, vad_filter=False, language=lang, word_timestamps=True, condition_on_previous_text=False)
out = []
for s in segs:
    print(f'[{s.start:6.2f}-{s.end:6.2f}] {s.text.strip()}')
    for w in s.words: out.append([round(w.start, 3), round(w.end, 3), w.word.strip(), round(w.probability, 2)])
print(json.dumps(out))
