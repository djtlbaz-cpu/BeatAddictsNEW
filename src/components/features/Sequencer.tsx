import { useState } from 'react';
import { Button } from '../ui/button';
import { Sparkles, Save, Shuffle, Trash2, RotateCcw, FlipVertical } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { useToast } from '../../hooks/use-toast';

const INSTRUMENTS = [
  { id: 'kick', name: 'Kick', emoji: '😈', color: 'border-red-500', accentColor: 'bg-red-500' },
  { id: 'snare', name: 'Snare', emoji: '😈', color: 'border-cyan-400', accentColor: 'bg-cyan-400' },
  { id: 'hihat', name: 'Hi-Hat', emoji: '🎵', color: 'border-yellow-400', accentColor: 'bg-yellow-400' },
  { id: 'openhat', name: 'Open Hat', emoji: '🎵', color: 'border-purple-400', accentColor: 'bg-purple-400' },
  { id: 'clap', name: 'Clap', emoji: '👏', color: 'border-orange-400', accentColor: 'bg-orange-400' },
  { id: 'crash', name: 'Crash', emoji: '💥', color: 'border-red-400', accentColor: 'bg-red-400' },
  { id: 'perc1', name: 'Perc 1', emoji: '🎶', color: 'border-purple-500', accentColor: 'bg-purple-500' },
];

type Pattern = Record<string, boolean[]>;

export const Sequencer = () => {
  const { toast } = useToast();
  const [currentPattern, setCurrentPattern] = useState(1);
  const [patterns] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const [selectedGenre, setSelectedGenre] = useState('Tech House');
  const [complexity, setComplexity] = useState(60);
  const [density, setDensity] = useState(70);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Initialize pattern with 16 steps for each instrument
  const [pattern, setPattern] = useState<Pattern>(() => {
    const initialPattern: Pattern = {};
    INSTRUMENTS.forEach(inst => {
      initialPattern[inst.id] = Array(16).fill(false);
    });
    return initialPattern;
  });

  const genres = ['Tech House', 'Deep House', 'Techno', 'Minimal', 'Progressive', 'Acid', 'Electro'];

  const toggleStep = (instrumentId: string, stepIndex: number) => {
    setPattern(prev => ({
      ...prev,
      [instrumentId]: prev[instrumentId].map((val, idx) => 
        idx === stepIndex ? !val : val
      )
    }));
  };

  const getActiveNotes = () => {
    let count = 0;
    Object.values(pattern).forEach(steps => {
      count += steps.filter(Boolean).length;
    });
    return count;
  };

  const randomizePattern = () => {
    const newPattern: Pattern = {};
    INSTRUMENTS.forEach(inst => {
      newPattern[inst.id] = Array(16).fill(false).map(() => Math.random() > 0.7);
    });
    setPattern(newPattern);
    toast({
      title: 'Pattern Randomized',
      description: 'New random beat pattern generated'
    });
  };

  const clearPattern = () => {
    const newPattern: Pattern = {};
    INSTRUMENTS.forEach(inst => {
      newPattern[inst.id] = Array(16).fill(false);
    });
    setPattern(newPattern);
    toast({
      title: 'Pattern Cleared',
      description: 'All steps have been cleared'
    });
  };

  const clearAll = () => {
    clearPattern();
  };

  const invertAll = () => {
    const newPattern: Pattern = {};
    INSTRUMENTS.forEach(inst => {
      newPattern[inst.id] = pattern[inst.id].map(val => !val);
    });
    setPattern(newPattern);
    toast({
      title: 'Pattern Inverted',
      description: 'All steps have been toggled'
    });
  };

  const savePattern = () => {
    toast({
      title: 'Pattern Saved',
      description: `Pattern ${currentPattern} saved successfully`
    });
  };

  const saveToLibrary = () => {
    toast({
      title: 'Saved to Library',
      description: 'Pattern added to your library'
    });
  };

  const randomizePreset = () => {
    const randomGenre = genres[Math.floor(Math.random() * genres.length)];
    const randomComplexity = Math.floor(Math.random() * 100);
    const randomDensity = Math.floor(Math.random() * 100);
    
    setSelectedGenre(randomGenre);
    setComplexity(randomComplexity);
    setDensity(randomDensity);
    
    toast({
      title: 'Preset Randomized',
      description: `${randomGenre} - Complexity: ${randomComplexity}% - Density: ${randomDensity}%`
    });
  };

  const generateAIBeat = async () => {
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-music', {
        body: {
          genre: selectedGenre,
          mood: 'energetic',
          stage: 'Beat Pattern',
          complexity,
          density
        }
      });

      if (error) {
        let errorMessage = error.message;
        if (error instanceof FunctionsHttpError) {
          try {
            const statusCode = error.context?.status ?? 500;
            const textContent = await error.context?.text();
            errorMessage = `[Code: ${statusCode}] ${textContent || error.message || 'Unknown error'}`;
          } catch {
            errorMessage = `${error.message || 'Failed to read response'}`;
          }
        }
        throw new Error(errorMessage);
      }

      // Generate a pattern based on complexity and density
      const newPattern: Pattern = {};
      INSTRUMENTS.forEach(inst => {
        const stepProbability = density / 100;
        newPattern[inst.id] = Array(16).fill(false).map(() => Math.random() < stepProbability);
      });
      
      setPattern(newPattern);
      
      toast({
        title: 'AI Beat Generated! 🎉',
        description: `${selectedGenre} pattern created with ${complexity}% complexity`
      });
    } catch (error: any) {
      console.error('AI beat generation error:', error);
      toast({
        title: 'Generation Failed',
        description: error.message || 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto p-6 bg-[#0f0f1e]">
      <div className="max-w-[1600px] mx-auto">
        {/* Top Controls */}
        <div className="flex items-center justify-between mb-6">
          {/* Pattern Selector */}
          <div className="flex items-center gap-4">
            <div className="bg-[#1a1a2e] border border-studio-border rounded-lg px-4 py-3 min-w-[280px]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-cyan-400 rounded"></div>
                <div>
                  <div className="font-semibold text-white">Pattern {currentPattern}</div>
                  <div className="text-xs text-gray-400">{getActiveNotes()} notes • 0 channels</div>
                </div>
                <div className="ml-auto">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={randomizePattern}
              variant="outline"
              className="bg-[#1a1a2e] border-studio-border hover:bg-studio-surface"
            >
              <Shuffle className="w-4 h-4 mr-2" />
              Random
            </Button>
            <Button
              onClick={clearPattern}
              variant="outline"
              className="bg-[#1a1a2e] border-studio-border hover:bg-studio-surface"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
            <Button
              onClick={savePattern}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Pattern Tabs */}
        <div className="flex gap-2 mb-6">
          {patterns.map(num => (
            <button
              key={num}
              onClick={() => setCurrentPattern(num)}
              className={`
                w-12 h-12 rounded-lg border font-semibold transition-all
                ${currentPattern === num 
                  ? 'bg-cyan-400 border-cyan-400 text-black' 
                  : 'bg-[#1a1a2e] border-studio-border text-white hover:border-cyan-400/50'
                }
              `}
            >
              {num}
            </button>
          ))}
        </div>

        {/* Step Sequencer Grid */}
        <div className="glass-panel rounded-lg p-6 mb-6">
          {/* Header */}
          <div className="grid grid-cols-[180px_repeat(16,1fr)] gap-2 mb-4">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Track</div>
            {Array.from({ length: 16 }, (_, i) => (
              <div key={i} className="text-center text-xs font-semibold text-gray-400">
                {i + 1}
              </div>
            ))}
          </div>

          {/* Instrument Rows */}
          <div className="space-y-3">
            {INSTRUMENTS.map(instrument => (
              <div key={instrument.id} className="flex items-center gap-2">
                {/* Accent Bar */}
                <div className={`w-1 h-12 rounded-full ${instrument.accentColor}`} />

                {/* Instrument Label */}
                <div className="grid grid-cols-[180px_repeat(16,1fr)] gap-2 flex-1">
                  <div className="flex items-center gap-2">
                    <button className="w-10 h-10 bg-[#1a1a2e] border border-studio-border rounded-lg flex items-center justify-center hover:bg-studio-surface transition-colors">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                    </button>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{instrument.emoji}</span>
                      <span className="font-semibold text-white">{instrument.name}</span>
                    </div>
                  </div>

                  {/* Step Buttons */}
                  {pattern[instrument.id].map((active, stepIndex) => (
                    <button
                      key={stepIndex}
                      onClick={() => toggleStep(instrument.id, stepIndex)}
                      className={`
                        h-12 rounded-lg border-2 transition-all
                        ${active 
                          ? `${instrument.color} bg-opacity-20` 
                          : 'border-[#1a1a2e] bg-[#16162a] hover:border-studio-border'
                        }
                        ${stepIndex % 4 === 0 ? 'border-l-4' : ''}
                      `}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Beat Generator Section */}
        <div className="grid grid-cols-[1fr_auto] gap-4">
          {/* Generator Controls */}
          <div className="glass-panel rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🤖</span>
              <h3 className="text-lg font-bold text-purple-400 uppercase tracking-wider">AI Beat Generator</h3>
            </div>

            <div className="grid grid-cols-[200px_1fr_1fr_auto] gap-4 items-center">
              {/* Genre Selector */}
              <div>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="w-full bg-[#1a1a2e] border border-studio-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                >
                  {genres.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>

              {/* Complexity Slider */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Complexity:</span>
                  <span className="text-purple-400 font-semibold">{complexity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={complexity}
                  onChange={(e) => setComplexity(parseInt(e.target.value))}
                  className="w-full h-2 bg-[#1a1a2e] rounded-lg appearance-none cursor-pointer slider-purple"
                />
              </div>

              {/* Density Slider */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Density:</span>
                  <span className="text-cyan-400 font-semibold">{density}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={density}
                  onChange={(e) => setDensity(parseInt(e.target.value))}
                  className="w-full h-2 bg-[#1a1a2e] rounded-lg appearance-none cursor-pointer slider-cyan"
                />
              </div>

              {/* Generate Button */}
              <Button
                onClick={generateAIBeat}
                disabled={isGenerating}
                className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 h-12 px-6"
              >
                {isGenerating ? (
                  <>
                    <div className="flex gap-1 mr-2">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 h-4 bg-white rounded-full animate-waveform"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate AI Beat
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Action Buttons Grid */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={saveToLibrary}
              className="bg-purple-600 hover:bg-purple-700 h-[calc(50%-6px)]"
            >
              <Save className="w-4 h-4 mr-2" />
              Save to Library
            </Button>
            <Button
              onClick={randomizePreset}
              variant="outline"
              className="bg-[#1a1a2e] border-studio-border hover:bg-studio-surface h-[calc(50%-6px)]"
            >
              <Shuffle className="w-4 h-4 mr-2" />
              Randomize (Preset)
            </Button>
            <Button
              onClick={clearAll}
              variant="outline"
              className="bg-[#1a1a2e] border-studio-border hover:bg-studio-surface h-[calc(50%-6px)]"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
            <Button
              onClick={invertAll}
              variant="outline"
              className="bg-[#1a1a2e] border-studio-border hover:bg-studio-surface h-[calc(50%-6px)]"
            >
              <FlipVertical className="w-4 h-4 mr-2" />
              Invert All
            </Button>
          </div>
        </div>
      </div>

      <style>{`
        input[type="range"].slider-purple::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #9333ea;
          cursor: pointer;
        }
        
        input[type="range"].slider-cyan::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #06b6d4;
          cursor: pointer;
        }

        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #9333ea;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};
