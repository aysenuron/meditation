import { useRef, useState, useCallback } from 'react';

type SoundType = 'rain' | 'forest' | 'ocean' | 'whitenoise' | null;

export function useAmbientSound() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<AudioNode[]>([]);
  const [currentSound, setCurrentSound] = useState<SoundType>(null);

  const getCtx = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    return audioCtxRef.current;
  };

  const stopAll = useCallback(() => {
    nodesRef.current.forEach((n) => {
      try {
        (n as OscillatorNode).stop?.();
      } catch {
        // ignore
      }
      try {
        n.disconnect();
      } catch {
        // ignore
      }
    });
    nodesRef.current = [];
    setCurrentSound(null);
  }, []);

  const createWhiteNoise = (ctx: AudioContext, gain: number = 0.1): AudioNode[] => {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const gainNode = ctx.createGain();
    gainNode.gain.value = gain;
    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start();
    return [source, gainNode];
  };

  const play = useCallback(
    (type: SoundType) => {
      stopAll();
      if (!type) return;
      const ctx = getCtx();
      if (ctx.state === 'suspended') ctx.resume();
      const nodes: AudioNode[] = [];

      if (type === 'whitenoise') {
        nodes.push(...createWhiteNoise(ctx, 0.15));
      } else if (type === 'rain') {
        const [src, gainNode] = createWhiteNoise(ctx, 0.2);
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1000;
        (gainNode as GainNode).disconnect();
        (src as AudioBufferSourceNode).connect(filter);
        filter.connect(ctx.destination);
        nodes.push(src, gainNode, filter);
      } else if (type === 'forest') {
        const [src, gainNode] = createWhiteNoise(ctx, 0.05);
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 400;
        (gainNode as GainNode).disconnect();
        (src as AudioBufferSourceNode).connect(filter);
        filter.connect(ctx.destination);
        [320, 480, 640].forEach((freq) => {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.value = freq;
          const g = ctx.createGain();
          g.gain.value = 0.01;
          osc.connect(g);
          g.connect(ctx.destination);
          osc.start();
          nodes.push(osc, g);
        });
        nodes.push(src, gainNode, filter);
      } else if (type === 'ocean') {
        const [src, gainNode] = createWhiteNoise(ctx, 0.15);
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 500;
        (gainNode as GainNode).disconnect();
        (src as AudioBufferSourceNode).connect(filter);
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.1;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 200;
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start();
        filter.connect(ctx.destination);
        nodes.push(src, gainNode, filter, lfo, lfoGain);
      }

      nodesRef.current = nodes;
      setCurrentSound(type);
    },
    [stopAll],
  );

  const toggle = useCallback(
    (type: SoundType) => {
      if (currentSound === type) {
        stopAll();
      } else {
        play(type);
      }
    },
    [currentSound, play, stopAll],
  );

  return { play, stop: stopAll, toggle, currentSound };
}
