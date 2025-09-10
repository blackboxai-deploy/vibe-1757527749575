"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface SuggestionItem {
  id: string;
  type: 'track' | 'playlist' | 'artist' | 'mix';
  title: string;
  description: string;
  category: string;
}

interface SuggestionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const SuggestionPanel: React.FC<SuggestionPanelProps> = ({
  isOpen,
  onClose,
  className = "",
}) => {
  // Mock suggestions data
  const suggestions: SuggestionItem[] = [
    {
      id: "1",
      type: "track",
      title: "Similar BPM Tracks",
      description: "Tracks that match your current deck's BPM for seamless mixing",
      category: "Smart Mixing"
    },
    {
      id: "2", 
      type: "playlist",
      title: "Peak Hour Bangers",
      description: "High-energy tracks perfect for the dance floor",
      category: "Curated Playlists"
    },
    {
      id: "3",
      type: "mix",
      title: "Harmonic Matching",
      description: "Tracks in compatible keys for smooth transitions",
      category: "AI Recommendations"
    },
    {
      id: "4",
      type: "artist",
      title: "Trending Artists",
      description: "Hot new artists making waves in electronic music",
      category: "What's Hot"
    },
    {
      id: "5",
      type: "track",
      title: "Genre Crossover",
      description: "Perfect tracks to transition between different genres",
      category: "Mixing Tips"
    },
    {
      id: "6",
      type: "playlist",
      title: "Warm-Up Sets",
      description: "Smooth, groovy tracks to start your set",
      category: "Set Building"
    },
    {
      id: "7",
      type: "mix",
      title: "Build-Up Tracks",
      description: "Tracks that gradually increase energy for perfect builds",
      category: "Energy Management"
    },
    {
      id: "8",
      type: "track",
      title: "Crowd Favorites",
      description: "Tracks that never fail to get the crowd moving",
      category: "Proven Hits"
    }
  ];

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'track': return '🎵';
      case 'playlist': return '📄';
      case 'artist': return '🎤';
      case 'mix': return '🎛️';
      default: return '🎵';
    }
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'track': return 'bg-blue-500';
      case 'playlist': return 'bg-green-500';
      case 'artist': return 'bg-purple-500';
      case 'mix': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-y-0 right-0 w-80 bg-gray-900 border-l border-gray-700 transform transition-transform duration-300 ease-in-out z-50 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white">Suggestions</h2>
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white h-8 w-8 p-0"
        >
          ✕
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 h-full overflow-y-auto pb-20">
        {/* Status */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-blue-400 text-sm font-medium">
              AI Suggestions Active
            </span>
          </div>
          <p className="text-gray-400 text-xs mt-1">
            Analyzing your mixing patterns to provide better recommendations
          </p>
        </div>

        {/* Suggestions List */}
        <div className="space-y-3">
          {suggestions.map((suggestion) => (
            <Card 
              key={suggestion.id}
              className="p-3 bg-gray-800 border-gray-700 hover:bg-gray-700 cursor-pointer transition-colors"
            >
              <div className="flex items-start space-x-3">
                <div className={`w-8 h-8 ${getTypeColor(suggestion.type)} rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                  {getTypeIcon(suggestion.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="text-white font-medium text-sm truncate">
                      {suggestion.title}
                    </h4>
                    <Badge variant="outline" className="text-xs border-gray-600 text-gray-400 ml-2">
                      {suggestion.category}
                    </Badge>
                  </div>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    {suggestion.description}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <Badge 
                      variant="secondary" 
                      className="text-xs bg-gray-700 text-gray-300"
                    >
                      {suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1)}
                    </Badge>
                    <Button
                      size="sm"
                      className="h-6 px-2 text-xs bg-blue-500 hover:bg-blue-600"
                    >
                      Explore
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Footer Info */}
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <h4 className="text-white text-sm font-medium mb-2">Pro Tip</h4>
          <p className="text-gray-400 text-xs leading-relaxed">
            Use the suggestions to discover new tracks that complement your current selection. 
            The AI analyzes tempo, key, and energy levels to recommend perfect matches.
          </p>
        </div>
      </div>
    </div>
  );
};