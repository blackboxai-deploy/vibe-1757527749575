"use client";

import React, { useState, useEffect } from 'react';
import { Track, AudioFeatures } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AIServices } from '@/services/AIServices';

interface StemAnalyzerProps {
  track: Track | null;
  onAnalysisComplete?: (features: AudioFeatures) => void;
  className?: string;
}

export const StemAnalyzer: React.FC<StemAnalyzerProps> = ({
  track,
  onAnalysisComplete,
  className = "",
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [audioFeatures, setAudioFeatures] = useState<AudioFeatures | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  useEffect(() => {
    if (track && !isAnalyzing && !audioFeatures) {
      handleAnalyze();
    }
  }, [track]);

  const handleAnalyze = async () => {
    if (!track) return;

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAudioFeatures(null);

    try {
      // Simulate progressive analysis
      const progressSteps = [
        { step: 'Stem separation...', progress: 25 },
        { step: 'Harmonic analysis...', progress: 50 },
        { step: 'Energy detection...', progress: 75 },
        { step: 'Finalizing...', progress: 100 }
      ];

      for (const { progress } of progressSteps) {
        setAnalysisProgress(progress);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const features = await AIServices.getAudioFeatures(track);
      setAudioFeatures(features);
      onAnalysisComplete?.(features);
    } catch (error) {
      console.error('Stem analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
    }
  };

  const getStemColor = (stemType: string): string => {
    const colors = {
      vocals: 'bg-blue-500',
      drums: 'bg-red-500',
      bass: 'bg-green-500',
      other: 'bg-purple-500'
    };
    return colors[stemType as keyof typeof colors] || 'bg-gray-500';
  };

  const getStemIcon = (stemType: string): string => {
    const icons = {
      vocals: '🎤',
      drums: '🥁',
      bass: '🎸',
      other: '🎵'
    };
    return icons[stemType as keyof typeof icons] || '🎵';
  };

  if (!track) {
    return (
      <Card className={`p-6 bg-gray-900 border-gray-700 ${className}`}>
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-3">🎵</div>
          <h3 className="text-lg font-semibold mb-2">AI Stem Analysis</h3>
          <p className="text-sm">Load a track to analyze stems and audio features</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-4 bg-gray-900 border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold">AI Stem Analysis</h3>
          <p className="text-gray-400 text-sm truncate">{track.title}</p>
        </div>
        <Button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          size="sm"
          className="bg-blue-500 hover:bg-blue-600"
        >
          {isAnalyzing ? 'Analyzing...' : 'Re-analyze'}
        </Button>
      </div>

      {/* Analysis Progress */}
      {isAnalyzing && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white text-sm">Analyzing Audio...</span>
            <span className="text-gray-400 text-sm">{analysisProgress}%</span>
          </div>
          <Progress value={analysisProgress} className="w-full" />
        </div>
      )}

      {/* Stem Analysis Results */}
      {audioFeatures?.stems && (
        <div className="space-y-4 mb-6">
          <h4 className="text-white font-medium">Stem Separation</h4>
          
          {Object.entries(audioFeatures.stems).map(([stemType, value]) => {
            if (stemType === 'hasVocals' || stemType === 'vocalClarity') return null;
            
            const percentage = Math.round((value as number) * 100);
            
            return (
              <div key={stemType} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getStemIcon(stemType)}</span>
                    <span className="text-white text-sm capitalize">{stemType}</span>
                  </div>
                  <span className="text-gray-400 text-sm">{percentage}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`${getStemColor(stemType)} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}

          {/* Vocal Info */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-700">
            <div className="flex items-center space-x-2">
              <Badge 
                variant={audioFeatures.stems.hasVocals ? "default" : "outline"}
                className={audioFeatures.stems.hasVocals ? "bg-blue-500" : "border-gray-600 text-gray-400"}
              >
                {audioFeatures.stems.hasVocals ? "Has Vocals" : "Instrumental"}
              </Badge>
              {audioFeatures.stems.hasVocals && (
                <Badge variant="outline" className="border-gray-600 text-gray-400">
                  Clarity: {Math.round(audioFeatures.stems.vocalClarity * 100)}%
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Harmonic Analysis */}
      {audioFeatures?.harmonic && (
        <div className="space-y-3 mb-6">
          <h4 className="text-white font-medium">Harmonic Analysis</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-gray-400 text-xs uppercase tracking-wide">Key</div>
              <div className="text-white font-semibold text-lg">
                {audioFeatures.harmonic.key} {audioFeatures.harmonic.mode}
              </div>
              <div className="text-gray-400 text-xs">
                {Math.round(audioFeatures.harmonic.confidence * 100)}% confidence
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-gray-400 text-xs uppercase tracking-wide">Camelot</div>
              <div className="text-white font-semibold text-lg">
                {audioFeatures.harmonic.camelotKey}
              </div>
              <div className="text-gray-400 text-xs">
                DJ mixing notation
              </div>
            </div>
          </div>

          <div>
            <div className="text-gray-400 text-xs uppercase tracking-wide mb-2">Compatible Keys</div>
            <div className="flex flex-wrap gap-1">
              {audioFeatures.harmonic.compatibleKeys.slice(0, 6).map((key, index) => (
                <Badge 
                  key={index}
                  variant="outline" 
                  className="text-xs border-green-500 text-green-400"
                >
                  {key}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Energy Analysis */}
      {audioFeatures?.energy && (
        <div className="space-y-3">
          <h4 className="text-white font-medium">Energy Analysis</h4>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gray-800 rounded-lg p-2 text-center">
              <div className="text-gray-400 text-xs">Energy</div>
              <div className="text-white font-semibold">
                {Math.round(audioFeatures.energy.energy * 100)}%
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-2 text-center">
              <div className="text-gray-400 text-xs">Dance</div>
              <div className="text-white font-semibold">
                {Math.round(audioFeatures.energy.danceability * 100)}%
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-2 text-center">
              <div className="text-gray-400 text-xs">Mood</div>
              <div className="text-white font-semibold capitalize">
                {audioFeatures.energy.mood}
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Overall Vibe</span>
              <Badge 
                className={
                  audioFeatures.energy.mood === 'peak' ? 'bg-red-500' :
                  audioFeatures.energy.mood === 'energetic' ? 'bg-orange-500' :
                  audioFeatures.energy.mood === 'groovy' ? 'bg-yellow-500' :
                  audioFeatures.energy.mood === 'chill' ? 'bg-blue-500' : 'bg-gray-500'
                }
              >
                {audioFeatures.energy.mood}
              </Badge>
            </div>
            <p className="text-gray-300 text-xs mt-2">
              {audioFeatures.energy.valence > 0.7 ? 'Positive and uplifting' :
               audioFeatures.energy.valence > 0.4 ? 'Balanced emotional tone' :
               'Darker, more introspective'}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};