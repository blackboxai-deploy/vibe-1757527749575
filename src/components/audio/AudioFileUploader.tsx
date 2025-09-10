"use client";

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { audioEngine, AudioTrack } from '@/services/AudioEngine';
import { Track } from '@/types';

interface AudioFileUploaderProps {
  onTrackLoaded: (track: Track & { audioTrack: AudioTrack }, deckId: 'A' | 'B') => void;
  targetDeck?: 'A' | 'B';
  className?: string;
}

export const AudioFileUploader: React.FC<AudioFileUploaderProps> = ({
  onTrackLoaded,
  targetDeck = 'A',
  className = "",
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<'A' | 'B'>(targetDeck);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Check file type
    if (!file.type.startsWith('audio/')) {
      alert('❌ Por favor selecciona un archivo de audio válido (MP3, WAV, etc.)');
      return;
    }

    // Check file size (limit to 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      alert('❌ El archivo es demasiado grande. Máximo 100MB.');
      return;
    }

    await loadAudioFile(file);
  };

  const loadAudioFile = async (file: File) => {
    setIsLoading(true);
    setProgress(0);

    try {
      console.log('🎵 Starting to load audio file:', file.name);
      
      // Simulate progress for user feedback
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Load audio file through AudioEngine
      if (!audioEngine) {
        throw new Error('AudioEngine not available');
      }
      const audioTrack = await audioEngine.loadAudioFile(file);
      
      clearInterval(progressInterval);
      setProgress(100);

      // Create Track object compatible with our existing system
      const track: Track & { audioTrack: AudioTrack } = {
        id: audioTrack.id,
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
        artist: 'Local File',
        duration: Math.round(audioTrack.duration),
        bpm: 120 + Math.floor(Math.random() * 60), // Mock BPM
        genre: 'Upload',
        year: new Date().getFullYear(),
        energy: 'medium' as const,
        vocalType: 'mixed' as const,
        key: 'C',
        mode: 'major' as const,
        danceability: 0.7,
        valence: 0.6,
        acousticness: 0.3,
        instrumentalness: 0.4,
        audioTrack: audioTrack
      };

      // Load to AudioEngine
      if (audioEngine) {
        audioEngine.loadTrackToDeck(audioTrack, selectedDeck);
      }

      // Notify parent component
      onTrackLoaded(track, selectedDeck);

      console.log('✅ Audio file loaded successfully to Deck', selectedDeck);
      
      // Success feedback
      setTimeout(() => {
        alert(`🎉 ¡Audio cargado exitosamente en Deck ${selectedDeck}!\n\n` +
              `🎵 ${track.title}\n` +
              `⏱️ Duración: ${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}\n` +
              `📊 Tamaño: ${(file.size / (1024 * 1024)).toFixed(1)} MB`);
      }, 500);

    } catch (error) {
      console.error('❌ Failed to load audio file:', error);
      alert('❌ Error al cargar el archivo de audio. Verifica que sea un formato válido.');
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Deck Selection */}
      <div className="flex items-center space-x-2">
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

      {/* Upload Area */}
      <Card 
        className={`
          p-6 border-2 border-dashed transition-all duration-200 cursor-pointer
          ${dragOver 
            ? 'border-blue-500 bg-blue-500/10' 
            : 'border-gray-600 bg-gray-800 hover:border-gray-500'
          }
          ${isLoading ? 'pointer-events-none opacity-75' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={!isLoading ? openFileDialog : undefined}
      >
        <div className="text-center space-y-4">
          {/* Icon */}
          <div className={`text-6xl ${dragOver ? 'animate-bounce' : ''}`}>
            {isLoading ? '⏳' : '🎵'}
          </div>

          {/* Text */}
          <div>
            <h3 className="text-white font-semibold text-lg">
              {isLoading ? 'Cargando Audio...' : 'Cargar Archivo de Audio'}
            </h3>
            <p className="text-gray-400 text-sm mt-2">
              {isLoading 
                ? 'Procesando archivo, por favor espera...'
                : 'Arrastra y suelta tu archivo MP3/WAV aquí o haz click para seleccionar'
              }
            </p>
          </div>

          {/* Progress Bar */}
          {isLoading && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-blue-400 text-sm">
                Cargando... {progress}%
              </p>
            </div>
          )}

          {/* Supported Formats */}
          {!isLoading && (
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {['MP3', 'WAV', 'AAC', 'M4A', 'OGG'].map((format) => (
                <span 
                  key={format}
                  className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded"
                >
                  {format}
                </span>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* File Input (Hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        disabled={isLoading}
      />

      {/* Instructions */}
      <div className="bg-gray-800/50 rounded-lg p-3 text-xs text-gray-400">
        <h4 className="font-semibold mb-1">💡 Consejos:</h4>
        <ul className="space-y-1">
          <li>• Formatos soportados: MP3, WAV, AAC, M4A, OGG</li>
          <li>• Tamaño máximo: 100MB por archivo</li>
          <li>• Para mejor rendimiento, usa archivos de calidad media</li>
          <li>• El audio se reproducirá inmediatamente después de cargar</li>
        </ul>
      </div>

      {/* Audio Engine Status */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Audio Engine:</span>
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${
            audioEngine?.isReady() ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span>{audioEngine?.isReady() ? 'Listo' : 'Inicializando...'}</span>
        </div>
      </div>
    </div>
  );
};