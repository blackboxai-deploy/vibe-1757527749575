"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import { Track } from '@/types';
import { audioEngine, AudioTrack } from '@/services/AudioEngine';

interface SampleAudioGeneratorProps {
  onTrackLoaded: (track: Track & { audioTrack: AudioTrack }, deckId: 'A' | 'B') => void;
  targetDeck?: 'A' | 'B';
  className?: string;
}

export const SampleAudioGenerator: React.FC<SampleAudioGeneratorProps> = ({
  onTrackLoaded,
  targetDeck = 'A',
  className = "",
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<'A' | 'B'>(targetDeck);

  // Generate a simple audio sample using Web Audio API
  const generateSampleAudio = async (type: 'beat' | 'bass' | 'melody' | 'noise') => {
    if (!audioEngine) {
      alert('❌ AudioEngine no está disponible');
      return;
    }

    setIsGenerating(true);

    try {
      console.log(`🎵 Generating ${type} sample...`);

      // Create AudioContext if needed
      const audioContext = (audioEngine as any).audioContext;
      if (!audioContext) {
        throw new Error('AudioContext not initialized');
      }

      // Generate audio based on type
      const duration = 30; // 30 seconds
      const sampleRate = audioContext.sampleRate;
      const length = sampleRate * duration;
      const audioBuffer = audioContext.createBuffer(2, length, sampleRate);

      // Fill the buffer with generated audio
      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const channelData = audioBuffer.getChannelData(channel);
        
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate;
          let sample = 0;

          switch (type) {
            case 'beat':
              // Generate a kick drum pattern at 128 BPM
              const beatInterval = 60 / 128; // Time between beats
              const beatPhase = (t % beatInterval) / beatInterval;
              if (beatPhase < 0.1) {
                sample = Math.sin(2 * Math.PI * 60 * t) * Math.exp(-beatPhase * 50);
              }
              // Add hi-hat
              if ((t * 4) % 1 < 0.05) {
                sample += (Math.random() - 0.5) * 0.3 * Math.exp(-(t * 4 % 1) * 20);
              }
              break;

            case 'bass':
              // Generate a bass line
              const bassFreq = 80 + Math.sin(t * 0.5) * 20;
              sample = Math.sin(2 * Math.PI * bassFreq * t) * 0.8;
              // Add some harmonic content
              sample += Math.sin(2 * Math.PI * bassFreq * 2 * t) * 0.3;
              break;

            case 'melody':
              // Generate a simple melody
              const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88]; // C major scale
              const noteIndex = Math.floor((t * 2) % notes.length);
              const freq = notes[noteIndex];
              const envelope = Math.max(0, 1 - ((t * 2) % 1));
              sample = Math.sin(2 * Math.PI * freq * t) * envelope * 0.5;
              break;

            case 'noise':
              // Generate filtered noise
              sample = (Math.random() - 0.5) * 0.3;
              // Simple low-pass filter effect
              if (i > 0) {
                sample = sample * 0.1 + channelData[i - 1] * 0.9;
              }
              break;
          }

          channelData[i] = sample * 0.5; // Master volume
        }
      }

      // Create AudioTrack object
      const audioTrack: AudioTrack = {
        id: `sample_${type}_${Date.now()}`,
        audioBuffer,
        duration,
        isLoaded: true
      };

      // Create corresponding Track object
      const track: Track & { audioTrack: AudioTrack } = {
        id: audioTrack.id,
        title: `Sample ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        artist: 'Flowstate Generator',
        duration,
        bpm: type === 'beat' ? 128 : 120,
        genre: 'Generated',
        year: new Date().getFullYear(),
        energy: type === 'beat' || type === 'bass' ? 'high' : 'medium',
        vocalType: 'instrumental',
        key: 'C',
        mode: 'major',
        danceability: type === 'beat' ? 0.9 : 0.6,
        valence: 0.7,
        acousticness: 0.1,
        instrumentalness: 1.0,
        audioTrack
      };

      // Load to AudioEngine
      audioEngine.loadTrackToDeck(audioTrack, selectedDeck);

      // Notify parent
      onTrackLoaded(track, selectedDeck);

      console.log(`✅ ${type} sample generated and loaded to Deck ${selectedDeck}`);
      
      alert(`🎉 ¡Sample de ${type} generado exitosamente!\n\n` +
            `🎵 ${track.title}\n` +
            `⏱️ Duración: ${duration} segundos\n` +
            `🥁 BPM: ${track.bpm}\n` +
            `🎛️ Cargado en Deck ${selectedDeck}`);

    } catch (error) {
      console.error(`❌ Failed to generate ${type} sample:`, error);
      alert(`❌ Error al generar sample de ${type}. Verifica que el audio esté habilitado.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const samples = [
    {
      type: 'beat' as const,
      title: 'Kick + Hi-Hat',
      description: 'Patrón de batería 128 BPM',
      icon: '🥁',
      color: 'bg-red-500 hover:bg-red-600'
    },
    {
      type: 'bass' as const,
      title: 'Bass Line',
      description: 'Línea de bajo profunda',
      icon: '🎸',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      type: 'melody' as const,
      title: 'Melody',
      description: 'Melodía en C mayor',
      icon: '🎹',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      type: 'noise' as const,
      title: 'White Noise',
      description: 'Ruido filtrado',
      icon: '📻',
      color: 'bg-gray-500 hover:bg-gray-600'
    }
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">🎵 Generador de Audio</h3>
        <p className="text-gray-400 text-sm">
          Genera samples de audio para probar el sistema de audio real
        </p>
      </div>

      {/* Deck Selection */}
      <div className="flex items-center justify-center space-x-2">
        <span className="text-sm text-gray-400">Cargar en:</span>
        <Button
          onClick={() => setSelectedDeck('A')}
          size="sm"
          variant={selectedDeck === 'A' ? 'default' : 'outline'}
          className={selectedDeck === 'A' 
            ? 'bg-blue-500 hover:bg-blue-600' 
            : 'border-gray-600 text-gray-300 hover:bg-gray-700'
          }
        >
          Deck A
        </Button>
        <Button
          onClick={() => setSelectedDeck('B')}
          size="sm"
          variant={selectedDeck === 'B' ? 'default' : 'outline'}
          className={selectedDeck === 'B' 
            ? 'bg-blue-500 hover:bg-blue-600' 
            : 'border-gray-600 text-gray-300 hover:bg-gray-700'
          }
        >
          Deck B
        </Button>
      </div>

      {/* Sample Generators */}
      <div className="grid grid-cols-2 gap-3">
        {samples.map((sample) => (
          <Card 
            key={sample.type}
            className="p-4 bg-gray-800 border-gray-700 hover:bg-gray-700 transition-colors"
          >
            <div className="text-center space-y-3">
              <div className="text-3xl">{sample.icon}</div>
              <div>
                <h4 className="text-white font-semibold text-sm">
                  {sample.title}
                </h4>
                <p className="text-gray-400 text-xs">
                  {sample.description}
                </p>
              </div>
              <Button
                onClick={() => generateSampleAudio(sample.type)}
                disabled={isGenerating}
                size="sm"
                className={`w-full ${sample.color} text-white`}
              >
                {isGenerating ? '⏳ Generando...' : '🎵 Generar'}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Instructions */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-blue-400 text-sm font-medium">
            Audio Real Habilitado
          </span>
        </div>
        <p className="text-gray-400 text-xs leading-relaxed">
          Estos samples se generan usando Web Audio API y se pueden reproducir inmediatamente. 
          Úsalos para probar los controles de volumen, crossfader y análisis de stems.
        </p>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Audio Engine:</span>
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${
            audioEngine?.isReady() ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span>{audioEngine?.isReady() ? 'Listo para generar' : 'Inicializando...'}</span>
        </div>
      </div>
    </div>
  );
};