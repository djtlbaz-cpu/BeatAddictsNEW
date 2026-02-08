import { Sparkles, Waves, Music2, Zap, Mic, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';
import { useState } from 'react';
import { AIGenerationStage } from '../../types';
import { supabase } from '../../lib/supabase';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { useToast } from '../../hooks/use-toast';

const stages: AIGenerationStage[] = [
  { id: '1', name: 'Beat Pattern', description: 'Generate rhythm foundation', icon: 'drum', completed: false },
  { id: '2', name: 'Melody', description: 'Create harmonic progression', icon: 'music', completed: false },
  { id: '3', name: 'Bassline', description: 'Add low-end groove', icon: 'waves', completed: false },
  { id: '4', name: 'Bass Drop', description: 'Build energy and impact', icon: 'zap', completed: false }
];

export const AIStudio = () => {
  const { toast } = useToast();
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [generatedContent, setGeneratedContent] = useState<Record<string, string>>({});
  const [completedStages, setCompletedStages] = useState<Set<number>>(new Set());

  const genres = ['Electronic', 'Hip Hop', 'House', 'Trap', 'Lo-Fi', 'Ambient'];
  const moods = ['Energetic', 'Chill', 'Dark', 'Uplifting', 'Minimal', 'Epic'];

  const generateStage = async (stageIndex: number) => {
    const stage = stages[stageIndex];
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-music', {
        body: {
          genre: selectedGenre,
          mood: selectedMood,
          stage: stage.name
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

      setGeneratedContent(prev => ({
        ...prev,
        [stage.name]: data.content
      }));
      
      setCompletedStages(prev => new Set([...prev, stageIndex]));
      
      return true;
    } catch (error: any) {
      console.error(`Stage ${stage.name} generation error:`, error);
      toast({
        title: `Failed to generate ${stage.name}`,
        description: error.message || 'Please try again',
        variant: 'destructive'
      });
      return false;
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setCurrentStage(0);
    setCompletedStages(new Set());
    setGeneratedContent({});
    
    // Generate each stage sequentially
    for (let i = 0; i < stages.length; i++) {
      setCurrentStage(i);
      const success = await generateStage(i);
      
      if (!success) {
        setIsGenerating(false);
        return;
      }
      
      // Wait a bit between stages for better UX
      if (i < stages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    }
    
    setIsGenerating(false);
    toast({
      title: 'Track Generated! 🎉',
      description: 'Your AI-powered music is ready. Check the stages below for details.'
    });
  };

  return (
    <div className="glass-panel rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">AI Music Generator</h2>
          <p className="text-sm text-muted-foreground">Collaborate with AI to create your track</p>
        </div>
      </div>

      {/* Genre Selection */}
      <div className="mb-6">
        <label className="text-sm font-semibold mb-2 block">Select Genre</label>
        <div className="grid grid-cols-3 gap-2">
          {genres.map(genre => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`
                px-4 py-3 rounded-lg border transition-all
                ${selectedGenre === genre
                  ? 'bg-neon-purple border-neon-purple text-white'
                  : 'bg-studio-panel border-studio-border hover:border-neon-purple/50'
                }
              `}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Mood Selection */}
      <div className="mb-6">
        <label className="text-sm font-semibold mb-2 block">Select Mood</label>
        <div className="grid grid-cols-3 gap-2">
          {moods.map(mood => (
            <button
              key={mood}
              onClick={() => setSelectedMood(mood)}
              className={`
                px-4 py-3 rounded-lg border transition-all
                ${selectedMood === mood
                  ? 'bg-neon-cyan border-neon-cyan text-white'
                  : 'bg-studio-panel border-studio-border hover:border-neon-cyan/50'
                }
              `}
            >
              {mood}
            </button>
          ))}
        </div>
      </div>

      {/* Generation Stages */}
      <div className="mb-6">
        <label className="text-sm font-semibold mb-3 block">Generation Stages</label>
        <div className="space-y-3">
          {stages.map((stage, index) => {
            const isActive = index === currentStage && isGenerating;
            const isCompleted = completedStages.has(index);
            const hasContent = generatedContent[stage.name];
            
            return (
              <div key={stage.id}>
                <div
                  className={`
                    flex items-center gap-4 p-4 rounded-lg border transition-all cursor-pointer
                    ${isActive ? 'bg-neon-purple/10 border-neon-purple animate-pulse-glow' : ''}
                    ${isCompleted ? 'bg-studio-surface border-neon-cyan' : ''}
                    ${!isActive && !isCompleted ? 'bg-studio-panel border-studio-border' : ''}
                  `}
                  onClick={() => hasContent && setGeneratedContent(prev => ({ ...prev, [`${stage.name}_expanded`]: !prev[`${stage.name}_expanded`] }))}
                >
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center
                    ${isCompleted ? 'bg-neon-cyan' : isActive ? 'bg-neon-purple' : 'bg-studio-surface'}
                  `}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : (
                      <>
                        {stage.icon === 'drum' && <Music2 className="w-5 h-5" />}
                        {stage.icon === 'music' && <Music2 className="w-5 h-5" />}
                        {stage.icon === 'waves' && <Waves className="w-5 h-5" />}
                        {stage.icon === 'zap' && <Zap className="w-5 h-5" />}
                      </>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{stage.name}</div>
                    <div className="text-sm text-muted-foreground">{stage.description}</div>
                  </div>
                  {isActive && (
                    <div className="flex gap-1">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="w-2 h-2 bg-neon-purple rounded-full animate-waveform"
                          style={{ animationDelay: `${i * 0.2}s` }}
                        />
                      ))}
                    </div>
                  )}
                  {isCompleted && <ChevronRight className="w-5 h-5 text-neon-cyan" />}
                </div>
                
                {/* Show generated content when expanded */}
                {hasContent && generatedContent[`${stage.name}_expanded`] && (
                  <div className="mt-2 p-4 bg-studio-dark rounded-lg border border-studio-border">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{generatedContent[stage.name]}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={!selectedGenre || !selectedMood || isGenerating}
        className="w-full bg-gradient-to-r from-neon-purple to-neon-cyan hover:shadow-xl hover:shadow-neon-purple/50 transition-all h-12 text-lg font-semibold"
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
            <Sparkles className="w-5 h-5 mr-2" />
            Generate Track
          </>
        )}
      </Button>

      {/* Premium Voice Cloning CTA */}
      <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-neon-pink/10 to-neon-purple/10 border border-neon-pink/30">
        <div className="flex items-center gap-3 mb-2">
          <Mic className="w-5 h-5 text-neon-pink" />
          <span className="font-semibold">Premium: AI Voice Cloning</span>
          <span className="ml-auto text-xs bg-neon-pink/20 px-2 py-1 rounded-full text-neon-pink">PRO</span>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Add professional vocals to your AI-generated tracks with custom voice cloning
        </p>
        <Button variant="outline" size="sm" className="border-neon-pink/50 hover:bg-neon-pink/10 text-neon-pink">
          Upgrade to Add Vocals
        </Button>
      </div>
    </div>
  );
};
