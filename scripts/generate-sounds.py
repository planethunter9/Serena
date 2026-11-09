#!/usr/bin/env python3
"""Gera os sons ambiente da Serena por síntese (sem gravações de terceiros,
portanto sem direitos de autor de ninguém).

Cada som é PERIÓDICO: o ruído é moldado no domínio da frequência (FFT de todo
o ficheiro) e os eventos (gotas, estalidos, notas…) dão a volta ao fim do
ficheiro. Assim o loop é perfeito, sem cortes nem cliques.

Uso:  python3 scripts/generate-sounds.py           (gera todos)
      python3 scripts/generate-sounds.py rain fire (só alguns)
Requer numpy, scipy e ffmpeg. Saída: assets/sounds/<id>.m4a (AAC estéreo).
"""

import os
import subprocess
import sys
import tempfile

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfiltfilt

SR = 44100
D = 90  # segundos por loop
N = SR * D
OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'sounds')
rng = np.random.default_rng(20261109)
t = np.arange(N) / SR
freqs = np.fft.rfftfreq(N, 1 / SR)


# ---------------------------------------------------------------- utilitários
def shaped_noise(shape, channels=2):
    """Ruído periódico com espetro |shape(f)| (FFT do ficheiro inteiro)."""
    g = shape(np.maximum(freqs, 1e-3))
    g[0] = 0
    out = []
    for _ in range(channels):
        spec = (rng.standard_normal(len(freqs)) + 1j * rng.standard_normal(len(freqs))) * g
        x = np.fft.irfft(spec, n=N)
        out.append(x / (np.std(x) + 1e-12))
    return np.stack(out, axis=1)


def band(lo, hi, slope=1.0):
    """Banda suave entre lo e hi (Hz), com inclinação 1/f^slope."""
    def s(f):
        hp = 1 / (1 + (lo / f) ** 4) if lo else 1
        lp = 1 / (1 + (f / hi) ** 4) if hi else 1
        return hp * lp / f ** (slope / 2)
    return s


def periodic_env(cycles_list, amps, phase=None):
    """Envolvente lenta e periódica (soma de sinusoides com nº inteiro de ciclos)."""
    e = np.zeros(N)
    for i, (c, a) in enumerate(zip(cycles_list, amps)):
        ph = rng.uniform(0, 2 * np.pi) if phase is None else phase
        e += a * np.sin(2 * np.pi * c * t / D + ph)
    return e


def add_event(buf, start, sig, pan=0.0):
    """Soma um evento (mono) ao buffer estéreo, dando a volta ao fim do ficheiro."""
    L = len(sig)
    idx = (start + np.arange(L)) % N
    gl = np.cos((pan + 1) * np.pi / 4)
    gr = np.sin((pan + 1) * np.pi / 4)
    np.add.at(buf[:, 0], idx, sig * gl)
    np.add.at(buf[:, 1], idx, sig * gr)


def circ_filter(x, shape):
    """Filtra um sinal (N amostras, estéreo) com um filtro de fase zero e circular."""
    g = shape(np.maximum(freqs, 1e-3))
    g[0] = 0
    return np.stack([np.fft.irfft(np.fft.rfft(x[:, c]) * g, n=N) for c in range(x.shape[1])], axis=1)


def reverb(x, seconds=3.5, mix=0.35, damp=4000):
    """Reverberação simples: convolução circular com ruído de decaimento exponencial."""
    L = int(seconds * SR)
    out = np.zeros_like(x)
    for c in range(2):
        ir = rng.standard_normal(L) * np.exp(-np.arange(L) / SR * (6.9 / seconds))
        b = butter(2, damp / (SR / 2), 'low', output='sos')
        ir = sosfiltfilt(b, ir)
        ir /= np.sqrt(np.sum(ir ** 2))
        irp = np.zeros(N)
        irp[:L] = ir
        out[:, c] = np.fft.irfft(np.fft.rfft(x[:, c]) * np.fft.rfft(irp), n=N)
    return (1 - mix) * x + mix * out * (np.std(x) / (np.std(out) + 1e-12))


def master(x, rms_db=-20.0, peak_db=-1.0):
    """Normaliza o volume (RMS) e limita os picos com um limitador suave."""
    x = x - x.mean(axis=0)
    x *= 10 ** (rms_db / 20) / (np.sqrt(np.mean(x ** 2)) + 1e-12)
    ceil = 10 ** (peak_db / 20)
    x = np.tanh(x / ceil) * ceil
    return x


def note(freq, dur, harm=(1.0, 0.35, 0.12, 0.05), decay=1.6, attack=0.025, detune=0.0):
    """Nota tipo sino/piano suave (sinusoides com decaimento)."""
    n = int(dur * SR)
    tt = np.arange(n) / SR
    s = np.zeros(n)
    for k, a in enumerate(harm, start=1):
        s += a * np.sin(2 * np.pi * freq * k * (1 + detune * k) * tt) * np.exp(-tt * decay * (1 + 0.6 * (k - 1)))
    s *= 0.5 - 0.5 * np.cos(np.pi * np.minimum(1, tt / attack))  # ataque suave
    rel = int(0.3 * SR)
    s[-rel:] *= np.cos(np.linspace(0, np.pi / 2, rel)) ** 2  # fim sem corte
    return s


def write(name, x):
    os.makedirs(OUT, exist_ok=True)
    x = master(x)
    with tempfile.TemporaryDirectory() as d:
        wav = os.path.join(d, name + '.wav')
        wavfile.write(wav, SR, (x * 32767).astype(np.int16))
        dst = os.path.join(OUT, name + '.m4a')
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', dst], check=True)
    print(f'{name}: {os.path.getsize(dst) / 1e6:.1f} MB')


# ---------------------------------------------------------------- sons
def rain():
    # Base: chuva ao longe (ruído rosa entre 400 Hz e 9 kHz) + grave suave.
    bed = shaped_noise(band(500, 8000, 1.2)) * 0.22 + shaped_noise(band(60, 400, 1.6)) * 0.12
    x = bed * (1 + 0.12 * periodic_env([1, 2, 3], [1, .6, .4]))[:, None]
    # Gotas pequenas (muitas) e gotas próximas (poucas, mais graves).
    for count, (flo, fhi), (dlo, dhi), amp in [(30000, (2500, 7000), (.004, .012), .45), (1400, (800, 2400), (.010, .035), .9)]:
        for _ in range(count):
            f = rng.uniform(flo, fhi)
            dur = rng.uniform(dlo, dhi)
            n = int(dur * SR * 4)
            tt = np.arange(n) / SR
            sig = np.sin(2 * np.pi * f * tt * (1 - 0.15 * tt / (dur * 4))) * np.exp(-tt / dur) * amp * rng.uniform(.2, 1)
            sig *= np.minimum(1, tt / 0.0006)  # sem clique no início da gota
            add_event(x, rng.integers(N), sig, rng.uniform(-.9, .9))
    return circ_filter(x, band(30, 12000, 0))


def ocean():
    # 9 ondas em 90 s (≈ 6 por minuto, o ritmo da respiração lenta).
    period = D / 9
    ph = (t % period) / period
    # Subida lenta (~40 %), rebentação, recuo longo.
    wave = np.where(ph < .4, (ph / .4) ** 2, np.exp(-(ph - .4) / .22))
    var = 1 + 0.25 * periodic_env([1, 2], [1, .5])
    low = shaped_noise(band(40, 500, 2.0))
    mid = shaped_noise(band(300, 2500, 1.2))
    hiss = shaped_noise(band(1500, 9000, 0.6))
    # A espuma (agudos) chega um pouco depois do pico.
    wave_late = np.roll(wave, int(0.9 * SR))
    x = (low * (0.35 + 0.65 * wave)[:, None] * 0.9 +
         mid * (0.15 + 0.85 * wave)[:, None] * 0.55 +
         hiss * (0.05 + 0.95 * wave_late ** 1.5)[:, None] * 0.35) * var[:, None]
    x[:, 1] = np.roll(x[:, 1], int(0.25 * SR))  # largura estéreo
    return x


def stream():
    bed = shaped_noise(band(250, 4000, 0.9)) * 0.14
    x = bed * (1 + 0.15 * periodic_env([2, 5, 7], [1, .7, .5]))[:, None]
    # Bolhas: pequenas sinusoides com subida de tom (o "gorgolejar").
    for _ in range(int(70 * D)):
        f0 = rng.uniform(350, 1600)
        dur = rng.uniform(.008, .035)
        n = int(dur * SR * 4)
        tt = np.arange(n) / SR
        f = f0 * (1 + 2.5 * tt / (dur * 4))
        sig = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / dur) * rng.uniform(.15, .7)
        sig *= np.minimum(1, tt / 0.001)
        add_event(x, rng.integers(N), sig, rng.uniform(-.8, .8))
    return circ_filter(x, band(80, 7000, 0))


def breathing():
    # Respiração guiada a 6 ciclos/min: inspirar 4 s (som sobe), expirar 6 s (desce).
    period, inhale = 10.0, 4.0
    ph = t % period
    up = np.clip(ph / inhale, 0, 1)
    down = np.clip(1 - (ph - inhale) / (period - inhale), 0, 1)
    env = np.where(ph < inhale, 0.5 - 0.5 * np.cos(np.pi * up), 0.5 - 0.5 * np.cos(np.pi * down))
    # "Sopro" de ar: ruído filtrado que fica mais brilhante no inspirar.
    dark = shaped_noise(band(150, 900, 1.2))
    bright = shaped_noise(band(600, 4000, 0.8))
    breath = (dark * 0.7 + bright * 0.5 * env[:, None]) * (0.15 + 0.85 * env)[:, None] * 0.6
    # Acorde suave por baixo (Ré maior), a respirar com o som.
    pad = np.zeros((N, 2))
    for f in (146.83, 220.0, 293.66, 369.99):
        for c, det in ((0, 0.998), (1, 1.002)):
            fq = round(f * det * D) / D  # nº inteiro de ciclos → loop sem corte
            pad[:, c] += np.sin(2 * np.pi * fq * t) * (0.25 if f < 200 else 0.16)
    pad *= (0.35 + 0.65 * env)[:, None]
    x = breath + pad * 0.5
    # Sino suave no início de cada fase (agudo = inspirar, grave = expirar).
    for k in range(int(D / period)):
        add_event(x, int(k * period * SR), note(880, 3, decay=1.4) * 0.35, -0.2)
        add_event(x, int((k * period + inhale) * SR), note(587.33, 3.5, decay=1.2) * 0.3, 0.2)
    return reverb(x, 3.0, 0.3)


def pad_music(chords, chord_dur, bells_per_min, scale, octave_shift=1.0, brightness=3000, bell_amp=0.22):
    """Música ambiente: acordes longos com transições suaves + notas soltas tipo piano."""
    x = np.zeros((N, 2))
    cn = int(chord_dur * SR)
    fade = int(min(4.0, chord_dur / 2) * SR)
    for i, chord in enumerate(chords * int(round(D / chord_dur / len(chords)))):
        seg = np.zeros((cn + fade, 2))
        tt = np.arange(cn + fade) / SR
        for f in chord:
            f *= octave_shift
            for c, det in ((0, 0.997), (1, 1.003)):
                v = np.sin(2 * np.pi * f * det * tt) + 0.3 * np.sin(2 * np.pi * 2 * f * det * tt + 1) + 0.1 * np.sin(2 * np.pi * 3 * f * tt)
                # vibrato de volume muito lento, diferente em cada voz
                v *= 1 + 0.15 * np.sin(2 * np.pi * rng.uniform(.05, .15) * tt + rng.uniform(0, 6))
                seg[:, c] += v / len(chord)
        w = np.ones(cn + fade)
        w[:fade] = np.sin(np.linspace(0, np.pi / 2, fade)) ** 2
        w[-fade:] = np.cos(np.linspace(0, np.pi / 2, fade)) ** 2
        seg *= w[:, None]
        idx = (i * cn + np.arange(cn + fade)) % N
        np.add.at(x[:, 0], idx, seg[:, 0])
        np.add.at(x[:, 1], idx, seg[:, 1])
    x = circ_filter(x, band(40, brightness, 0))
    # Notas soltas (escala pentatónica), espaçadas e calmas.
    n_bells = int(bells_per_min * D / 60)
    starts = np.sort(rng.choice(np.arange(0, N, SR // 4), n_bells, replace=False))
    for s in starts:
        f = rng.choice(scale) * octave_shift
        add_event(x, int(s), note(f, 5, decay=0.9, harm=(1, .25, .08)) * bell_amp * rng.uniform(.5, 1), rng.uniform(-.6, .6))
    return reverb(x, 4.5, 0.45, damp=3500)


def calm_music():
    # Ré maior: Dmaj9 – Bm7 – Gmaj7 – Asus2, 11,25 s cada (≈ 60 bpm, lento).
    chords = [[146.83, 220.0, 277.18, 329.63], [123.47, 185.0, 220.0, 293.66],
              [98.0, 196.0, 246.94, 293.66], [110.0, 164.81, 246.94, 329.63]]
    scale = [587.33, 659.25, 739.99, 880.0, 987.77, 1174.66]
    return pad_music(chords, D / 8, 14, scale)


def sleep_music():
    # Mais grave, mais escuro e mais lento: Fmaj7 – Am7 – Cmaj7 – G6sus, 22,5 s cada.
    chords = [[87.31, 130.81, 164.81, 220.0], [110.0, 130.81, 164.81, 196.0],
              [65.41, 130.81, 164.81, 246.94], [98.0, 146.83, 164.81, 220.0]]
    scale = [349.23, 392.0, 440.0, 523.25, 587.33]
    return pad_music(chords, D / 4, 5, scale, brightness=1600, bell_amp=0.15)


def brown():
    x = shaped_noise(band(25, 1200, 2.0))
    return x * (1 + 0.05 * periodic_env([1, 3], [1, .5]))[:, None]


def pink():
    return shaped_noise(band(30, 14000, 1.0))


def night():
    # Vento suave + grilos a vários tons e distâncias (sem sons súbitos).
    wind = shaped_noise(band(80, 900, 1.5)) * np.clip(0.5 + 0.18 * periodic_env([1, 2, 3], [1, .7, .4]), 0.15, None)[:, None] * 0.6
    x = wind
    for carrier, rate, every, amp, pan in [(4400, 32, .9, .10, -.6), (4700, 28, 1.3, .07, .5), (5100, 35, .7, .05, .1), (3900, 26, 1.7, .06, -.2)]:
        pulse = int(SR / rate)
        tt = np.arange(int(pulse * .55)) / SR
        chirp = np.sin(2 * np.pi * carrier * tt) * np.sin(np.pi * tt / tt[-1]) ** 2
        n_groups = int(D / every)
        for g in range(n_groups):
            base = int((g * every + rng.uniform(-.05, .05)) * SR)
            if rng.random() < .12:  # pausas naturais
                continue
            for p in range(3):
                add_event(x, base + p * pulse, chirp * amp * rng.uniform(.7, 1), pan)
    return reverb(x, 1.8, 0.25, damp=6000)


def fire():
    # "Rugido" grave da lareira + estalidos (muitos pequenos, poucos maiores).
    roar = shaped_noise(band(40, 600, 1.8)) * np.clip(0.6 + 0.15 * periodic_env([2, 5, 9, 13], [1, .7, .5, .4]), 0.25, None)[:, None] * 0.7
    hiss = shaped_noise(band(2000, 9000, 0.5)) * 0.06
    x = roar + hiss
    for count, (dlo, dhi), amp, (flo, fhi) in [(2600, (.0008, .003), .5, (1500, 6000)), (180, (.004, .012), 1.0, (600, 2500))]:
        for _ in range(count):
            dur = rng.uniform(dlo, dhi)
            n = int(dur * SR * 5)
            tt = np.arange(n) / SR
            burst = rng.standard_normal(n) * np.exp(-tt / dur)
            f = rng.uniform(flo, fhi)
            burst = burst + np.sin(2 * np.pi * f * tt) * np.exp(-tt / dur)
            # amplitude com cauda pesada: a maioria baixinhos, alguns mais nítidos
            a = amp * min(1.0, rng.pareto(3) * .25 + .05)
            add_event(x, rng.integers(N), burst * a, rng.uniform(-.7, .7))
    return circ_filter(x, band(30, 10000, 0))


SOUNDS = {
    'rain': rain, 'ocean': ocean, 'stream': stream, 'breathing': breathing, 'calm_music': calm_music,
    'sleep_music': sleep_music, 'brown': brown, 'pink': pink, 'night': night, 'fire': fire,
}

if __name__ == '__main__':
    names = sys.argv[1:] or list(SOUNDS)
    for name in names:
        write(name, SOUNDS[name]())
