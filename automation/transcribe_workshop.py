import os
import sys
import time
import json
import torch
import whisper

# Optimize for Apple M4 CPU multi-threading
torch.set_num_threads(8)

def format_timestamp(seconds: float) -> str:
    hrs = int(seconds // 3600)
    mins = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    ms = int(round((seconds - int(seconds)) * 1000))
    return f"{hrs:02d}:{mins:02d}:{secs:02d}.{ms:03d}"

def format_timestamp_short(seconds: float) -> str:
    hrs = int(seconds // 3600)
    mins = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    return f"{hrs:02d}:{mins:02d}:{secs:02d}"

def to_srt(segments) -> str:
    srt_lines = []
    for i, seg in enumerate(segments, start=1):
        start = format_timestamp(seg['start']).replace('.', ',')
        end = format_timestamp(seg['end']).replace('.', ',')
        text = seg['text'].strip()
        srt_lines.append(f"{i}\n{start} --> {end}\n{text}\n")
    return "\n".join(srt_lines)

def to_readable_transcript(segments) -> str:
    lines = []
    for seg in segments:
        start_str = format_timestamp_short(seg['start'])
        end_str = format_timestamp_short(seg['end'])
        text = seg['text'].strip()
        lines.append(f"[{start_str} - {end_str}] {text}")
    return "\n".join(lines)

def main():
    audio_path = sys.argv[1] if len(sys.argv) > 1 else "/Users/prateekmayani/Documents/Zoom/2026-10-22 19.00.20 AI Influencer Workshop - 22nd October, 7 PM/audio1898052133.m4a"
    out_dir = sys.argv[2] if len(sys.argv) > 2 else os.path.dirname(audio_path)
    model_name = sys.argv[3] if len(sys.argv) > 3 else "small"
    task = sys.argv[4] if len(sys.argv) > 4 else "translate" # default to translate for high-accuracy English text

    print(f"==================================================")
    print(f"🎙️ Whisper Workshop Transcription Pipeline")
    print(f"==================================================")
    print(f"Audio Path : {audio_path}")
    print(f"Output Dir : {out_dir}")
    print(f"Model      : {model_name}")
    print(f"Task       : {task}")
    print(f"==================================================\n")

    if not os.path.exists(audio_path):
        print(f"❌ Error: Audio file not found at {audio_path}")
        sys.exit(1)

    print(f"Loading Whisper model '{model_name}' on CPU...")
    t0 = time.time()
    model = whisper.load_model(model_name, device="cpu")
    print(f"Model loaded in {time.time() - t0:.2f}s\n")

    print("Transcribing audio (processing 1h 43m of audio)...")
    t1 = time.time()
    
    # We provide a helpful initial prompt so Whisper captures technical & workshop terms accurately
    initial_prompt = "AI Influencer Workshop by Prateek Mayani. Character creation, Midjourney, face swap, voice cloning, lip sync, Instagram growth and monetization."
    
    options = {
        "task": task,
        "fp16": False,
        "verbose": True
    }
    if task == "transcribe":
        options["language"] = "hi"
        options["initial_prompt"] = initial_prompt

    result = model.transcribe(audio_path, **options)
    elapsed = time.time() - t1
    print(f"\n✅ Transcription completed in {elapsed / 60:.2f} minutes ({elapsed:.1f}s)")
    print(f"Detected Language : {result.get('language')}")
    print(f"Total Segments    : {len(result.get('segments', []))}")

    segments = result.get('segments', [])

    # File names
    prefix = f"transcript_workshop_22_oct_{task}"
    txt_path = os.path.join(out_dir, f"{prefix}.txt")
    srt_path = os.path.join(out_dir, f"{prefix}.srt")
    json_path = os.path.join(out_dir, f"{prefix}.json")

    # 1. Plain text with timestamps
    readable_text = to_readable_transcript(segments)
    with open(txt_path, "w", encoding="utf-8") as f:
        f.write(readable_text)
    print(f"Saved readable transcript: {txt_path}")

    # 2. SRT format
    srt_text = to_srt(segments)
    with open(srt_path, "w", encoding="utf-8") as f:
        f.write(srt_text)
    print(f"Saved SRT subtitle file : {srt_path}")

    # 3. JSON dump for programmatic usage
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump({
            "workshop_date": "22nd October 2026",
            "task": task,
            "duration_seconds": segments[-1]['end'] if segments else 0,
            "segments": segments
        }, f, ensure_ascii=False, indent=2)
    print(f"Saved JSON transcript   : {json_path}")

    # Also save a copy to the workspace artifacts / docs
    ws_txt_path = os.path.join("/Users/prateekmayani/Documents/aif-superprofile-funnel/automation", f"{prefix}.txt")
    with open(ws_txt_path, "w", encoding="utf-8") as f:
        f.write(readable_text)
    print(f"Saved copy to workspace : {ws_txt_path}")

    print("\n🎉 All transcript files generated successfully!")

if __name__ == "__main__":
    main()
