"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { audioManager } from '@/services/AudioManager';

interface RealCrossfaderProps {
  onCrossfaderChange?: (position: number) => void;
  className?: string;
}

export const RealCrossfader: React.FC<RealCrossfaderProps> = ({
  onCrossfaderChange,
  className = "",
}) => {
  const [crossfaderPosition, setCrossfaderPosition] = useState(0); // -1 to 1
  const [isDragging, setIsDragging] = useState(false);
  const [masterVolume, setMasterVolume] = useState(80);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Handle crossfader changes
  useEffect(() => {
    // Update audio manager with crossfader position
    audioManager.setCrossfader(crossfaderPosition);
    onCrossfaderChange?.(crossfaderPosition);
  }, [crossfaderPosition, onCrossfaderChange]);

  // Handle master volume changes
  useEffect(() => {
    audioManager.setMasterVolume(masterVolume / 100);
  }, [masterVolume]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updateCrossfaderPosition(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    updateCrossfaderPosition(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updateCrossfaderPosition = (clientX: number) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const width = rect.width;
    
    // Convert to -1 to 1 range
    const position = (x / width) * 2 - 1;
    const clampedPosition = Math.max(-1, Math.min(1, position));
    
    setCrossfaderPosition(clampedPosition);
  };

  // Add global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const getCrossfaderPercentage = (): number => {
    return ((crossfaderPosition + 1) / 2) * 100;
  };

  const getChannelVolume = (channel: 'A' | 'B'): number => {
    if (channel === 'A') {
      return crossfaderPosition <= 0 ? 100 : Math.round((1 - crossfaderPosition) * 100);
    } else {
      return crossfaderPosition >= 0 ? 100 : Math.round((1 + crossfaderPosition) * 100);
    }
  };

  const getChannelColor = (channel: 'A' | 'B'): string => {
    const volume = getChannelVolume(channel);
    if (volume > 80) return 'text-green-400';
    if (volume > 40) return 'text-yellow-400';
    if (volume > 0) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <Card className={`p-4 bg-gray-900 border-gray-700 ${className}`}>
      {/* Header */}
      <div className="text-center mb-4">
        <h3 className="text-white font-semibold flex items-center justify-center space-x-2">
          <span>🎚️</span>
          <span>Master Crossfader</span>
        </h3>
        <p className="text-gray-400 text-sm">Real-time audio mixing control</p>
      </div>

      {/* Crossfader Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-2 text-sm">
          <div className={`flex items-center space-x-2 ${getChannelColor('A')}`}>
            <Badge variant="outline" className="border-blue-500 text-blue-400 font-bold">A</Badge>
            <span>{getChannelVolume('A')}%</span>
          </div>
          <div className={`flex items-center space-x-2 ${getChannelColor('B')}`}>
            <span>{getChannelVolume('B')}%</span>
            <Badge variant="outline" className="border-blue-500 text-blue-400 font-bold">B</Badge>
          </div>
        </div>

        <div
          ref={sliderRef}
          className={`relative bg-gray-700 h-8 rounded-full cursor-pointer transition-colors ${
            isDragging ? 'bg-gray-600' : 'hover:bg-gray-600'
          }`}
          onMouseDown={handleMouseDown}
        >
          {/* Crossfader Handle */}
          <div
            className={`absolute top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-100 ${
              isDragging ? 'scale-110 shadow-2xl' : 'hover:scale-105'
            }`}
            style={{ left: `calc(${getCrossfaderPercentage()}% - 0.75rem)` }}
          />
        </div>
      </div>

      {/* Master Volume */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white text-sm">Master Volume</span>
          <span className="text-gray-400 text-sm">{masterVolume}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={masterVolume}
          onChange={(e) => setMasterVolume(Number(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>
    </Card>
  );
};