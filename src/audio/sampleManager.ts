export interface LoadedSample {
  id: string;
  name: string;
  duration: number;
  buffer: AudioBuffer;
  file: File;
}

const supportedAudioTypes = [
  "audio/wav",
  "audio/x-wav",
  "audio/mpeg",
  "audio/mp3",
  "audio/ogg",
  "audio/wave",
  "audio/webm",
  "audio/flac",
];

export const isSupportedAudioFile = (file: File): boolean => {
  return (
    file.type.startsWith("audio/") || supportedAudioTypes.includes(file.type)
  );
};

export const loadAudioFile = async (
  audioCtx: AudioContext,
  file: File,
): Promise<LoadedSample> => {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = await new Promise<AudioBuffer>((resolve, reject) => {
    audioCtx.decodeAudioData(arrayBuffer, resolve, reject);
  });

  return {
    id: `${file.name}-${Date.now()}`,
    name: file.name,
    duration: buffer.duration,
    buffer,
    file,
  };
};

export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};
