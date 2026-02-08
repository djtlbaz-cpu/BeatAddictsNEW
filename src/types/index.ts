export interface Track {
  id: string;
  name: string;
  type: 'drums' | 'melody' | 'bass' | 'vocals' | 'fx';
  volume: number;
  pan: number;
  muted: boolean;
  solo: boolean;
  color: string;
  pattern: boolean[][];
}

export interface Project {
  id: string;
  name: string;
  bpm: number;
  tracks: Track[];
  createdAt: string;
  updatedAt: string;
}

export interface AIGenerationStage {
  id: string;
  name: string;
  description: string;
  icon: string;
  completed: boolean;
}

export interface Sample {
  id: string;
  name: string;
  category: 'kick' | 'snare' | 'hihat' | 'clap' | 'perc' | 'synth' | 'bass';
  url: string;
  duration: number;
}

export interface PulseMessage {
  id: string;
  type: 'user' | 'pulse';
  content: string;
  timestamp: string;
}
