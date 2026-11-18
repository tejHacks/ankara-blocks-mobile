"""Synthesise Ankara Blocks' sound effects (stdlib only) into assets/sfx/*.wav.

Run: python3 tool/make-sfx.py
"""
import math, os, random, struct, wave

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "sfx")
os.makedirs(OUT, exist_ok=True)
random.seed(11)


def write(name, s, gain=0.8):
    peak = max(1e-9, max(abs(x) for x in s))
    with wave.open(os.path.join(OUT, f"{name}.wav"), "w") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(b"".join(struct.pack("<h", int(x / peak * gain * 32767)) for x in s))


def n(d):
    return range(int(SR * d))


# pick up — soft wooden "tok"
tok = [math.sin(2 * math.pi * 900 * (i / SR)) * math.exp(-(i / SR) * 60) for i in n(0.08)]
# place — chunkier "clack" (two partials + click)
clack = [(math.sin(2 * math.pi * 520 * t) + 0.6 * math.sin(2 * math.pi * 1310 * t)) * math.exp(-t * 38) + 0.3 * random.uniform(-1, 1) * math.exp(-t * 400)
         for t in (i / SR for i in n(0.14))]
# invalid — low thud
thud = [math.sin(2 * math.pi * (110 + 60 * math.exp(-t * 30)) * t) * math.exp(-t * 18) for t in (i / SR for i in n(0.22))]
# clear — shaker sweep rising
sweep, prev = [], 0.0
for i in n(0.35):
    t = i / SR
    x = random.uniform(-1, 1); y = x - prev; prev = x
    sweep.append(y * math.sin(math.pi * t / 0.35) * (0.4 + t * 2))
# combo — talking-drum hit (pitch bends down)
drum = []
ph = 0.0
for i in n(0.5):
    t = i / SR
    f = 180 + 160 * math.exp(-t * 9)
    ph += 2 * math.pi * f / SR
    drum.append(math.sin(ph) * math.exp(-t * 6) + 0.15 * random.uniform(-1, 1) * math.exp(-t * 80))
# new best — short highlife-style guitar sting (plucked arpeggio, C major)
sting = [0.0] * int(SR * 1.2)
for k, f in enumerate([523.25, 659.25, 783.99, 1046.5]):
    start = int(SR * 0.09 * k)
    for i in range(int(SR * 0.8)):
        t = i / SR
        v = sum(math.sin(2 * math.pi * f * h * t) / h ** 1.5 for h in (1, 2, 3)) * math.exp(-t * 5)
        if start + i < len(sting):
            sting[start + i] += v

for name, s in [("pickup", tok), ("place", clack), ("invalid", thud), ("clear", sweep), ("combo", drum), ("best", sting)]:
    write(name, s)
    print("wrote", name)
