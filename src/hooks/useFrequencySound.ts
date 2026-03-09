import { useRef, useState, useCallback } from 'react';

export type FrequencyHz = 396 | 417 | 528 | 639 | 741 | 852;

interface SoundInstance {
  ctx: AudioContext;
  oscillators: OscillatorNode[];
  masterGain: GainNode;
}

export function useFrequencySound() {
  const [activeFreq, setActiveFreq] = useState<FrequencyHz | null>(null);
  const instanceRef = useRef<SoundInstance | null>(null);

  const stopCurrent = useCallback((immediate = false) => {
    const inst = instanceRef.current;
    if (!inst) return;
    instanceRef.current = null;
    setActiveFreq(null);

    const { ctx, masterGain, oscillators } = inst;
    if (immediate) {
      oscillators.forEach((o) => { try { o.stop(); } catch (_) {} });
      ctx.close();
    } else {
      const now = ctx.currentTime;
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setValueAtTime(masterGain.gain.value, now);
      masterGain.gain.linearRampToValueAtTime(0, now + 1.8);
      setTimeout(() => {
        oscillators.forEach((o) => { try { o.stop(); } catch (_) {} });
        ctx.close();
      }, 2000);
    }
  }, []);

  const play = useCallback(
    (freq: FrequencyHz) => {
      if (instanceRef.current) stopCurrent(true);

      const ctx = new AudioContext();
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.32, ctx.currentTime + 3);
      masterGain.connect(ctx.destination);

      const oscillators: OscillatorNode[] = [];

      // Fundamental + 2nd and 3rd harmonics for richness
      [
        { mult: 1, amp: 1.0 },
        { mult: 2, amp: 0.22 },
        { mult: 3, amp: 0.07 },
      ].forEach(({ mult, amp }) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq * mult, ctx.currentTime);
        g.gain.setValueAtTime(amp, ctx.currentTime);
        osc.connect(g);
        g.connect(masterGain);
        osc.start();
        oscillators.push(osc);
      });

      instanceRef.current = { ctx, oscillators, masterGain };
      setActiveFreq(freq);
    },
    [stopCurrent],
  );

  const toggle = useCallback(
    (freq: FrequencyHz) => {
      if (activeFreq === freq) {
        stopCurrent(false);
      } else {
        play(freq);
      }
    },
    [activeFreq, stopCurrent, play],
  );

  return { activeFreq, toggle };
}
