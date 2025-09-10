"use client";

import React, { useState } from 'react';
import { Track } from '@/types';
import { Button } from '@/components/ui/button';

interface RandomTrackButtonProps {
  tracks: Track[];
  onTrackSelect: (track: Track, deckId: 'A' | 'B') => void;
  className?: string;
}

export const RandomTrackButton: React.FC<RandomTrackButtonProps> = ({
  tracks,
  onTrackSelect,
  className = "",
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleRandomSelect = async () => {
    if (tracks.length === 0) {
      alert('⚠️ No hay tracks disponibles en la librería');
      return;
    }

    setIsLoading(true);
    setIsAnimating(true);

    // Simulate loading with multiple random selections for dramatic effect
    const animationDuration = 1500;
    const steps = 8;
    const stepDuration = animationDuration / steps;

    for (let i = 0; i < steps; i++) {
      await new Promise(resolve => setTimeout(resolve, stepDuration));
      // Visual feedback during animation can be added here
    }

    // Select a random track
    const randomIndex = Math.floor(Math.random() * tracks.length);
    const selectedTrack = tracks[randomIndex];

    // Load to Deck A (Deck 1)
    onTrackSelect(selectedTrack, 'A');

    // Show success alert
    alert('🎉 ¡Track perfecto para cerrar la noche!\n\n' + 
          `🎵 ${selectedTrack.title}\n` +
          `🎤 ${selectedTrack.artist}\n` +
          `⚡ ${selectedTrack.energy.toUpperCase()} energy\n` +
          `🎹 ${selectedTrack.key || 'Unknown'} ${selectedTrack.mode || ''}\n` +
          `🥁 ${selectedTrack.bpm} BPM`);

    setIsLoading(false);
    setIsAnimating(false);
  };

  return (
    <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 ${className}`}>
      <Button
        onClick={handleRandomSelect}
        disabled={isLoading || tracks.length === 0}
        className={`
          relative overflow-hidden
          h-16 px-8 rounded-full
          bg-gradient-to-r from-red-600 to-red-500
          hover:from-red-700 hover:to-red-600
          disabled:from-gray-600 disabled:to-gray-500
          text-white font-bold text-lg
          shadow-2xl
          border-4 border-red-400/30
          transition-all duration-300
          ${isAnimating ? 'animate-pulse scale-110' : 'hover:scale-105'}
          ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {/* Animated background effect */}
        <div className={`
          absolute inset-0 
          bg-gradient-to-r from-red-400/20 to-red-300/20
          ${isAnimating ? 'animate-ping' : ''}
        `} />
        
        {/* Button content */}
        <div className="relative flex items-center space-x-3">
          <div className={`text-2xl ${isAnimating ? 'animate-spin' : ''}`}>
            {isLoading ? '🎲' : '🎵'}
          </div>
          <div className="flex flex-col items-start">
            <span className="text-lg font-bold">
              {isLoading ? 'Seleccionando...' : 'SURPRISE ME!'}
            </span>
            <span className="text-xs opacity-80">
              {isLoading ? 'Mezclando magia...' : 'Track aleatorio → Deck A'}
            </span>
          </div>
          <div className={`text-xl ${isAnimating ? 'animate-bounce' : ''}`}>
            🚀
          </div>
        </div>

        {/* Glow effect */}
        <div className={`
          absolute inset-0 rounded-full
          shadow-[0_0_30px_rgba(239,68,68,0.4)]
          ${isAnimating ? 'shadow-[0_0_50px_rgba(239,68,68,0.8)]' : ''}
          transition-all duration-300
        `} />

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-red-500/20 rounded-full flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </Button>

      {/* Track count indicator */}
      <div className="absolute -top-3 -right-3 bg-white text-red-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg">
        {tracks.length}
      </div>

      {/* Floating particles effect (optional enhancement) */}
      {isAnimating && (
        <>
          <div className="absolute top-0 left-0 w-2 h-2 bg-red-400 rounded-full animate-ping" 
               style={{ animationDelay: '0s' }} />
          <div className="absolute top-2 right-0 w-1 h-1 bg-red-300 rounded-full animate-ping" 
               style={{ animationDelay: '0.2s' }} />
          <div className="absolute bottom-2 left-2 w-1 h-1 bg-red-400 rounded-full animate-ping" 
               style={{ animationDelay: '0.4s' }} />
          <div className="absolute bottom-0 right-2 w-2 h-2 bg-red-300 rounded-full animate-ping" 
               style={{ animationDelay: '0.6s' }} />
        </>
      )}
    </div>
  );
};