"use client";

import React, { useState, useRef } from 'react';
import { Track } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { audioManager } from '@/services/AudioManager';

interface AudioUploaderProps {
  onTrackUploaded: (track: Track) => void;
  className?: string;
}

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

export const AudioUploader: React.FC<AudioUploaderProps> = ({
  onTrackUploaded,
  className = "",
}) => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedFormats = ['.mp3', '.wav', '.ogg', '.m4a'];

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    processAudioFile(file);
  };

  const processAudioFile = async (file: File) => {
    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!supportedFormats.includes(fileExtension)) {
      alert(`❌ Formato no soportado. Use: ${supportedFormats.join(', ')}`);
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert('❌ Archivo muy grande. Máximo 50MB permitido.');
      return;
    }

    const trackId = `uploaded_${Date.now()}`;
    
    setUploadProgress({
      fileName: file.name,
      progress: 0,
      status: 'uploading'
    });

    try {
      // Simulate upload progress
      for (let i = 0; i <= 50; i += 10) {
        setUploadProgress(prev => prev ? { ...prev, progress: i } : null);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setUploadProgress(prev => prev ? { ...prev, status: 'processing', progress: 60 } : null);

      // Load audio file
      const success = await audioManager.loadTrack(file, trackId);
      
      if (!success) {
        throw new Error('Failed to load audio file');
      }

      // Get audio info
      const audioTrack = audioManager.getTrackInfo(trackId);
      if (!audioTrack) {
        throw new Error('Failed to get audio track info');
      }

      setUploadProgress(prev => prev ? { ...prev, progress: 80 } : null);

      // Create Track object with extracted metadata
      const track: Track = {
        id: trackId,
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
        artist: 'Local File',
        duration: Math.round(audioTrack.duration),
        bpm: 120 + Math.floor(Math.random() * 60), // Mock BPM detection
        genre: 'Uploaded',
        year: new Date().getFullYear(),
        energy: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
        vocalType: ['instrumental', 'vocal', 'mixed'][Math.floor(Math.random() * 3)] as 'instrumental' | 'vocal' | 'mixed',
        key: ['C', 'D', 'E', 'F', 'G', 'A', 'B'][Math.floor(Math.random() * 7)],
        mode: Math.random() > 0.5 ? 'major' : 'minor' as 'major' | 'minor',
        danceability: Math.random(),
        valence: Math.random(),
        acousticness: Math.random(),
        instrumentalness: Math.random(),
        // Audio-specific fields
        audioUrl: URL.createObjectURL(file),
        previewUrl: URL.createObjectURL(file),
      };

      setUploadProgress(prev => prev ? { ...prev, progress: 100, status: 'complete' } : null);

      // Call callback
      onTrackUploaded(track);

      // Clear progress after 2 seconds
      setTimeout(() => {
        setUploadProgress(null);
      }, 2000);

      console.log(`🎵 Audio file uploaded successfully: ${file.name}`);
      
    } catch (error) {
      console.error('❌ Error processing audio file:', error);
      setUploadProgress({
        fileName: file.name,
        progress: 0,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      // Clear error after 3 seconds
      setTimeout(() => {
        setUploadProgress(null);
      }, 3000);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  // Utility function for file size formatting (currently unused but kept for future use)
  // const formatFileSize = (bytes: number): string => {
  //   if (bytes === 0) return '0 Bytes';
  //   const k = 1024;
  //   const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  //   const i = Math.floor(Math.log(bytes) / Math.log(k));
  //   return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  // };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'uploading': return '⬆️';
      case 'processing': return '⚙️';
      case 'complete': return '✅';
      case 'error': return '❌';
      default: return '📁';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'uploading': return 'text-blue-400';
      case 'processing': return 'text-yellow-400';
      case 'complete': return 'text-green-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card 
        className={`p-6 border-2 border-dashed transition-all duration-300 cursor-pointer ${
          dragOver 
            ? 'border-blue-500 bg-blue-500/10' 
            : 'border-gray-600 bg-gray-800 hover:border-gray-500 hover:bg-gray-700'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="text-center space-y-4">
          <div className="text-4xl">
            {dragOver ? '⬇️' : '🎵'}
          </div>
          
          <div>
            <h3 className="text-white font-semibold text-lg mb-2">
              {dragOver ? 'Suelta tu archivo aquí' : 'Subir Archivo de Audio'}
            </h3>
            <p className="text-gray-400 text-sm">
              Arrastra y suelta o haz click para seleccionar
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {supportedFormats.map((format) => (
              <Badge 
                key={format}
                variant="outline" 
                className="text-xs border-gray-600 text-gray-400"
              >
                {format.toUpperCase()}
              </Badge>
            ))}
          </div>

          <p className="text-gray-500 text-xs">
            Máximo 50MB • Calidad recomendada: 320kbps o superior
          </p>
        </div>
      </Card>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={supportedFormats.join(',')}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Upload Progress */}
      {uploadProgress && (
        <Card className="p-4 bg-gray-800 border-gray-700">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xl">{getStatusIcon(uploadProgress.status)}</span>
                <span className={`font-medium ${getStatusColor(uploadProgress.status)}`}>
                  {uploadProgress.status === 'uploading' ? 'Subiendo...' :
                   uploadProgress.status === 'processing' ? 'Procesando...' :
                   uploadProgress.status === 'complete' ? 'Completado' :
                   'Error'}
                </span>
              </div>
              <span className="text-gray-400 text-sm">
                {uploadProgress.progress}%
              </span>
            </div>

            {/* File info */}
            <div>
              <p className="text-white text-sm font-medium truncate">
                {uploadProgress.fileName}
              </p>
              {uploadProgress.error && (
                <p className="text-red-400 text-xs mt-1">
                  Error: {uploadProgress.error}
                </p>
              )}
            </div>

            {/* Progress bar */}
            <Progress 
              value={uploadProgress.progress} 
              className="w-full"
            />

            {/* Status messages */}
            <div className="text-xs text-gray-400">
              {uploadProgress.status === 'uploading' && 'Cargando archivo...'}
              {uploadProgress.status === 'processing' && 'Analizando audio y extrayendo metadatos...'}
              {uploadProgress.status === 'complete' && '¡Archivo listo para usar en los decks!'}
              {uploadProgress.status === 'error' && 'Error procesando archivo. Intenta de nuevo.'}
            </div>
          </div>
        </Card>
      )}

      {/* Demo Tracks */}
      <Card className="p-4 bg-gray-800 border-gray-700">
        <h4 className="text-white font-medium mb-3">🎵 Tracks de Demostración</h4>
        <p className="text-gray-400 text-sm mb-3">
          Prueba el sistema de audio con estos tracks generados:
        </p>
        
        <div className="grid grid-cols-2 gap-2">
          {[
            { name: 'Bass Test', freq: 60, duration: 30 },
            { name: 'Mid Test', freq: 440, duration: 30 },
            { name: 'High Test', freq: 1000, duration: 30 },
            { name: 'Sweep Test', freq: 220, duration: 45 }
          ].map((demo, index) => (
            <Button
              key={index}
              onClick={async () => {
                const trackId = `demo_${demo.freq}_${Date.now()}`;
                const success = await audioManager.createDemoTrack(demo.freq, demo.duration, trackId);
                
                if (success) {
                  const track: Track = {
                    id: trackId,
                    title: demo.name,
                    artist: 'Flowstate Generator',
                    duration: demo.duration,
                    bpm: 120,
                    genre: 'Test Tone',
                    year: 2024,
                    energy: 'medium',
                    vocalType: 'instrumental',
                    key: 'C',
                    mode: 'major',
                    danceability: 0.5,
                    valence: 0.5,
                    acousticness: 0,
                    instrumentalness: 1,
                  };
                  
                  onTrackUploaded(track);
                  alert(`🎵 Demo track "${demo.name}" generado y listo para usar!`);
                }
              }}
              size="sm"
              variant="outline"
              className="text-xs border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              {demo.name}
            </Button>
          ))}
        </div>
        
        <p className="text-gray-500 text-xs mt-2">
          Los tracks de demo son tonos puros para probar el sistema de audio
        </p>
      </Card>
    </div>
  );
};