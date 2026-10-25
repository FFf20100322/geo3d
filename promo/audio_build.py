"""生成旁白混音、淡 BGM、SRT 字幕，并输出抖音竖屏版与横屏版 MP4。"""
import json, os, subprocess, wave
import numpy as np

ROOT = r"F:\deep seek-harness\geo3d\promo"
AUD = os.path.join(ROOT, "audio")
FF = r"D:\FormatFactory\ffmpeg.exe"
DUR = 69.0


# ---------- 1. 合成淡 BGM ----------
def smooth(x, w):
    c = np.cumsum(np.insert(x, 0, 0))
    y = (c[w:] - c[:-w]) / w
    return np.pad(y, (w // 2, len(x) - len(y) - w // 2), mode="edge")


def make_bgm():
    sr, dur = 44100, DUR
    n = int(sr * dur)
    out = np.zeros(n)
    chords = [
        [220.00, 261.63, 329.63],  # Am
        [174.61, 220.00, 261.63],  # F
        [261.63, 329.63, 392.00],  # C
        [196.00, 246.94, 293.66],  # G
    ]
    bar = 8.0
    for i in range(int(np.ceil(dur / bar))):
        s = i * bar
        if s >= dur:
            break
        a, b = int(s * sr), min(int((s + bar) * sr), n)
        tt = np.arange(b - a) / sr
        env = np.clip(np.minimum(tt / 1.8, (tt[-1] - tt) / 1.8), 0, 1)
        notes = chords[i % len(chords)]
        for k, f in enumerate(notes):
            for det in (1.0, 1.0035):
                ph = 2 * np.pi * f * det * tt
                out[a:b] += (0.15 / (k + 1.2)) * env * (
                    np.sin(ph) + 0.26 * np.sin(2 * ph) + 0.10 * np.sin(3 * ph)
                )
        out[a:b] += 0.19 * env * np.sin(2 * np.pi * notes[0] / 2 * tt)

    y = smooth(out, 9)
    fade = np.ones(n)
    fi, fo = int(3 * sr), int(5 * sr)
    fade[:fi] = np.linspace(0, 1, fi)
    fade[-fo:] = np.linspace(1, 0, fo)
    y = y * fade
    y = y / np.max(np.abs(y)) * 0.55

    d = int(0.005 * sr)
    left = y
    right = np.concatenate([np.zeros(d), y[:-d]]) * 0.97
    stereo = np.stack([left, right], axis=1)
    pcm = (np.clip(stereo, -1, 1) * 32767).astype("<i2")

    path = os.path.join(AUD, "bgm.wav")
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(pcm.tobytes())
    return path


# ---------- 2. 字幕 ----------
def wav_dur(p):
    with wave.open(p) as w:
        return w.getnframes() / w.getframerate()


def ts(t):
    h = int(t // 3600)
    m = int(t % 3600 // 60)
    s = int(t % 60)
    ms = int(round((t - int(t)) * 1000))
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def split_line(text, width=11):
    parts = []
    for chunk in text.replace("：", "，").replace("；", "，").split("，"):
        chunk = chunk.strip("，。 ")
        while len(chunk) > width:
            parts.append(chunk[:width])
            chunk = chunk[width:]
        if chunk:
            parts.append(chunk)
    return parts


def make_srt(lines):
    out = []
    for i, it in enumerate(lines, 1):
        seg = split_line(it["text"])
        rows = seg[:3] if len(seg) <= 3 else seg[:2] + ["".join(seg[2:])]
        body = "\n".join(rows)
        out.append(
            f"{i}\n{ts(it['at'])} --> {ts(min(it['at'] + it['dur'], DUR))}\n{body}\n"
        )
    path = os.path.join(ROOT, "geo3d.srt")
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(out))
    return path


# ---------- 3. 混音 + 输出 ----------
def mux(video, outfile, lines, bgm, label=""):
    args = [FF, "-y", "-hide_banner", "-loglevel", "error", "-i", video]
    for it in lines:
        args += ["-i", it["path"]]
    args += ["-i", bgm]

    fc = []
    for i, it in enumerate(lines, 1):
        fc.append(
            f"[{i}:a]adelay={int(it['at']*1000)}:all=1,"
            f"aformat=sample_rates=48000:channel_layouts=stereo,volume=1.0[v{i}]"
        )
    fc.append(f"[{len(lines)+1}:a]volume=0.11,afade=t=in:st=0:d=3,afade=t=out:st=64:d=5[bg]")
    mixin = "".join(f"[v{i}]" for i in range(1, len(lines) + 1))
    fc.append(
        f"{mixin}[bg]amix=inputs={len(lines)+1}:normalize=0:dropout_transition=0,"
        f"loudnorm=I=-16:TP=-1.5:LRA=11[aout]"
    )
    args += [
        "-filter_complex", ";".join(fc),
        "-map", "0:v", "-map", "[aout]",
        "-c:v", "copy", "-c:a", "aac", "-b:a", "128k", "-ar", "48000",
        "-t", str(DUR), "-movflags", "+faststart", outfile,
    ]
    subprocess.run(args, check=True)
    print(f"{label} -> {outfile}  {os.path.getsize(outfile)/1048576:.1f} MB")


def main():
    items = json.load(open(os.path.join(ROOT, "vo.json"), encoding="utf-8"))
    lines = []
    for it in items:
        p = os.path.join(AUD, f"vo-{it['id']}.wav")
        it["path"] = p
        it["dur"] = wav_dur(p)
        lines.append(it)
        print(f"{it['id']:4s} at {it['at']:5.1f}  len {it['dur']:5.2f}  end {it['at']+it['dur']:5.2f}")
    bgm = make_bgm()
    print("bgm:", bgm)
    print("srt:", make_srt(lines))
    mux(os.path.join(ROOT, "out", "geo3d-douyin.mp4"),
        os.path.join(ROOT, "out", "geo3d-douyin-final.mp4"), lines, bgm, "竖屏")
    mux(os.path.join(ROOT, "out", "geo3d-60s.mp4"),
        os.path.join(ROOT, "out", "geo3d-landscape-final.mp4"), lines, bgm, "横屏")


if __name__ == "__main__":
    main()
