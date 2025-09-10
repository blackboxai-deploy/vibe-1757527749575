"use client";

import React, { useState, useEffect } from 'react';
import { Track, AIRecommendation, TransitionSuggestion } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AIServices } from '@/services/AIServices';

interface AIRecommendationsProps {
  currentTrack: Track | null;
  allTracks: Track[];
  onTrackSelect: (track: Track, deckId: 'A' | 'B') => void;
  targetDeck?: 'A' | 'B';
  className?: string;
}

export const AIRecommendations: React.FC<AIRecommendationsProps> = ({
  currentTrack,
  allTracks,
  onTrackSelect,
  targetDeck = 'B',
  className = "",
}) => {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [transitions, setTransitions] = useState<TransitionSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'recommendations' | 'transitions'>('recommendations');

  useEffect(() => {
    if (currentTrack && allTracks.length > 0) {
      loadRecommendations();
    }
  }, [currentTrack, allTracks]);

  const loadRecommendations = async () => {
    if (!currentTrack) return;

    setIsLoading(true);
    try {
      const [recs, trans] = await Promise.all([
        AIServices.getRecommendations(currentTrack, allTracks, 8),
        AIServices.getTransitionSuggestions(currentTrack, allTracks)
      ]);
      
      setRecommendations(recs);
      setTransitions(trans);
    } catch (error) {
      console.error('Failed to load AI recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryColor = (category: string): string => {
    const colors = {
      similar: 'bg-blue-500',
      complement: 'bg-green-500',
      transition: 'bg-purple-500',
      energy: 'bg-orange-500',
      harmonic: 'bg-pink-500'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500';
  };

  const getCategoryIcon = (category: string): string => {
    const icons = {
      similar: '🎵',
      complement: '🎯',
      transition: '🔄',
      energy: '⚡',
      harmonic: '🎹'
    };
    return icons[category as keyof typeof icons] || '🎵';
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentTrack) {
    return (
      <Card className={`p-6 bg-gray-900 border-gray-700 ${className}`}>
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-3">🤖</div>
          <h3 className="text-lg font-semibold mb-2">AI Recommendations</h3>
          <p className="text-sm">Load a track to get intelligent mixing suggestions</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-4 bg-gray-900 border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold flex items-center space-x-2">
            <span>🤖</span>
            <span>AI Recommendations</span>
          </h3>
          <p className="text-gray-400 text-sm">Based on: {currentTrack.title}</p>
        </div>
        <Button
          onClick={loadRecommendations}
          disabled={isLoading}
          size="sm"
          className="bg-purple-500 hover:bg-purple-600"
        >
          {isLoading ? 'Analyzing...' : 'Refresh'}
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-2 mb-4">
        <Button
          onClick={() => setActiveTab('recommendations')}
          variant={activeTab === 'recommendations' ? 'default' : 'outline'}
          size="sm"
          className={activeTab === 'recommendations' 
            ? 'bg-blue-500 hover:bg-blue-600' 
            : 'border-gray-600 text-gray-300 hover:bg-gray-700'
          }
        >
          Recommendations ({recommendations.length})
        </Button>
        <Button
          onClick={() => setActiveTab('transitions')}
          variant={activeTab === 'transitions' ? 'default' : 'outline'}
          size="sm"
          className={activeTab === 'transitions' 
            ? 'bg-purple-500 hover:bg-purple-600' 
            : 'border-gray-600 text-gray-300 hover:bg-gray-700'
          }
        >
          Transitions ({transitions.length})
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white text-sm">AI Analysis in Progress...</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-100"></div>
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse delay-200"></div>
            </div>
          </div>
          <Progress value={50} className="w-full" />
          <p className="text-gray-400 text-xs">Analyzing harmonic compatibility, energy levels, and mixing patterns...</p>
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && !isLoading && (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {recommendations.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <div className="text-2xl mb-2">🔍</div>
              <p className="text-sm">No recommendations available</p>
            </div>
          ) : (
            recommendations.map((rec, index) => (
              <Card key={index} className="p-3 bg-gray-800 border-gray-700 hover:bg-gray-700 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Track Info */}
                    <div>
                      <h4 className="text-white font-medium text-sm truncate">
                        {rec.track.title}
                      </h4>
                      <p className="text-gray-400 text-xs truncate">
                        {rec.track.artist}
                      </p>
                    </div>

                    {/* Category and Confidence */}
                    <div className="flex items-center space-x-2">
                      <Badge className={`text-xs ${getCategoryColor(rec.category)} text-white`}>
                        {getCategoryIcon(rec.category)} {rec.category}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        <Progress value={rec.confidence * 100} className="w-12 h-1" />
                        <span className="text-gray-400 text-xs">
                          {Math.round(rec.confidence * 100)}%
                        </span>
                      </div>
                    </div>

                    {/* Reason */}
                    <p className="text-gray-300 text-xs leading-relaxed">
                      {rec.reason}
                    </p>

                    {/* Track Details */}
                    <div className="flex items-center space-x-3 text-xs text-gray-400">
                      <span>{rec.track.bpm} BPM</span>
                      <span>{rec.track.energy}</span>
                      <span>{formatTime(rec.track.duration)}</span>
                      {rec.track.key && <span>{rec.track.key}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-1 ml-3">
                    <Button
                      size="sm"
                      className="h-6 px-2 text-xs bg-blue-500 hover:bg-blue-600"
                      onClick={() => onTrackSelect(rec.track, targetDeck)}
                    >
                      Load to {targetDeck}
                    </Button>
                    <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                      {rec.track.genre}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Transitions Tab */}
      {activeTab === 'transitions' && !isLoading && (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {transitions.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <div className="text-2xl mb-2">🔄</div>
              <p className="text-sm">No transition suggestions available</p>
            </div>
          ) : (
            transitions.map((transition, index) => (
              <Card key={index} className="p-3 bg-gray-800 border-gray-700">
                <div className="space-y-3">
                  {/* Transition Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🔄</span>
                      <span className="text-white font-medium text-sm">
                        Perfect Transition
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Progress value={transition.confidence * 100} className="w-16 h-2" />
                      <span className="text-gray-400 text-xs">
                        {Math.round(transition.confidence * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* From → To */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-gray-400">From:</span>
                      <span className="text-white">{transition.fromTrack.title}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-gray-400">To:</span>
                      <span className="text-white">{transition.toTrack.title}</span>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-gray-900 rounded p-2 text-center">
                      <div className="text-gray-400">BPM Diff</div>
                      <div className="text-white font-semibold">
                        ±{transition.bpmDiff}
                      </div>
                    </div>
                    <div className="bg-gray-900 rounded p-2 text-center">
                      <div className="text-gray-400">Key Match</div>
                      <div className="text-white font-semibold">
                        {Math.round(transition.keyCompatibility * 100)}%
                      </div>
                    </div>
                    <div className="bg-gray-900 rounded p-2 text-center">
                      <div className="text-gray-400">Energy</div>
                      <div className="text-white font-semibold">
                        {Math.round(transition.energyMatch * 100)}%
                      </div>
                    </div>
                  </div>

                  {/* Mix Point */}
                  <div className="bg-gray-900 rounded p-2">
                    <div className="text-gray-400 text-xs mb-1">Suggested Mix Point</div>
                    <div className="text-white text-sm">
                      {formatTime(transition.suggestedMixPoint)} into {transition.fromTrack.title}
                    </div>
                  </div>

                  {/* Reason */}
                  <p className="text-gray-300 text-xs leading-relaxed bg-gray-900 rounded p-2">
                    💡 {transition.reason}
                  </p>

                  {/* Load Button */}
                  <Button
                    size="sm"
                    className="w-full bg-purple-500 hover:bg-purple-600"
                    onClick={() => onTrackSelect(transition.toTrack, targetDeck)}
                  >
                    Load Transition to Deck {targetDeck}
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Status Footer */}
      <div className="mt-4 pt-3 border-t border-gray-700 text-xs text-gray-400">
        <div className="flex items-center justify-between">
          <span>AI Engine: Flowstate Neural Network</span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Active</span>
          </div>
        </div>
      </div>
    </Card>
  );
};