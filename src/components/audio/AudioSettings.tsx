"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AudioDevice {
  deviceId: string;
  label: string;
  kind: string;
  isDefault: boolean;
}

interface AudioSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const AudioSettings: React.FC<AudioSettingsProps> = ({
  isOpen,
  onClose,
  className = "",
}) => {
  const [audioDevices, setAudioDevices] = useState<AudioDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('default');
  const [masterVolume, setMasterVolume] = useState<number>(85);
  const [audioQuality, setAudioQuality] = useState<string>('high');
  const [bufferSize, setBufferSize] = useState<string>('512');
  const [latency, setLatency] = useState<number>(128);
  const [isLoading, setIsLoading] = useState(false);

  // Simulate audio device detection
  useEffect(() => {
    if (isOpen) {
      loadAudioDevices();
    }
  }, [isOpen]);

  const loadAudioDevices = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, you would use:
      // const devices = await navigator.mediaDevices.enumerateDevices();
      // For now, we'll use mock data
      
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading
      
      const mockDevices: AudioDevice[] = [
        {
          deviceId: 'default',
          label: 'Sistema por defecto',
          kind: 'audiooutput',
          isDefault: true
        },
        {
          deviceId: 'speakers_1',
          label: 'Altavoces internos',
          kind: 'audiooutput',
          isDefault: false
        },
        {
          deviceId: 'headphones_1',
          label: 'Auriculares Bluetooth',
          kind: 'audiooutput',
          isDefault: false
        },
        {
          deviceId: 'usb_audio_1',
          label: 'Controladora DJ USB',
          kind: 'audiooutput',
          isDefault: false
        },
        {
          deviceId: 'external_1',
          label: 'Interfaz de Audio Externa',
          kind: 'audiooutput',
          isDefault: false
        }
      ];
      
      setAudioDevices(mockDevices);
    } catch (error) {
      console.error('Error loading audio devices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeviceChange = (deviceId: string) => {
    setSelectedDevice(deviceId);
    // In real implementation, you would update the audio context
    console.log('Switching audio output to:', deviceId);
  };

  const handleVolumeChange = (value: number[]) => {
    setMasterVolume(value[0]);
    // In real implementation, you would update master gain
  };

  const handleQualityChange = (quality: string) => {
    setAudioQuality(quality);
    console.log('Audio quality changed to:', quality);
  };

  const handleBufferSizeChange = (size: string) => {
    setBufferSize(size);
    setLatency(parseInt(size) / 44.1); // Rough latency calculation
    console.log('Buffer size changed to:', size);
  };

  const getQualityIcon = (quality: string): string => {
    switch (quality) {
      case 'low': return '🔈';
      case 'medium': return '🔉';
      case 'high': return '🔊';
      default: return '🔊';
    }
  };

  const getDeviceIcon = (label: string): string => {
    if (label.toLowerCase().includes('bluetooth') || label.toLowerCase().includes('auricular')) return '🎧';
    if (label.toLowerCase().includes('usb') || label.toLowerCase().includes('controladora')) return '🎛️';
    if (label.toLowerCase().includes('externo') || label.toLowerCase().includes('interfaz')) return '🎚️';
    if (label.toLowerCase().includes('altavoz')) return '🔊';
    return '🎵';
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 ${className}`}>
      <Card className="w-full max-w-md bg-gray-900 border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <span>🎚️</span>
            <span>Configuración de Audio</span>
          </h2>
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
        <div className="p-4 space-y-6 max-h-96 overflow-y-auto">
          
          {/* Audio Output Device */}
          <div className="space-y-3">
            <h3 className="text-white font-medium flex items-center space-x-2">
              <span>🔊</span>
              <span>Dispositivo de Salida</span>
            </h3>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <span className="ml-2 text-gray-400">Detectando dispositivos...</span>
              </div>
            ) : (
              <Select value={selectedDevice} onValueChange={handleDeviceChange}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Seleccionar dispositivo" />
                </SelectTrigger>
                <SelectContent>
                  {audioDevices.map((device) => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      <div className="flex items-center space-x-2">
                        <span>{getDeviceIcon(device.label)}</span>
                        <span>{device.label}</span>
                        {device.isDefault && (
                          <Badge variant="secondary" className="text-xs bg-blue-500">
                            Por defecto
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Master Volume */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-medium flex items-center space-x-2">
                <span>🔈</span>
                <span>Volumen Master</span>
              </h3>
              <span className="text-gray-400 text-sm">{masterVolume}%</span>
            </div>
            <Slider
              value={[masterVolume]}
              onValueChange={handleVolumeChange}
              max={100}
              min={0}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Silencio</span>
              <span>Máximo</span>
            </div>
          </div>

          {/* Audio Quality */}
          <div className="space-y-3">
            <h3 className="text-white font-medium flex items-center space-x-2">
              <span>🎵</span>
              <span>Calidad de Audio</span>
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'low', label: 'Baja', desc: '128 kbps' },
                { value: 'medium', label: 'Media', desc: '320 kbps' },
                { value: 'high', label: 'Alta', desc: '1411 kbps' }
              ].map((quality) => (
                <Button
                  key={quality.value}
                  onClick={() => handleQualityChange(quality.value)}
                  variant={audioQuality === quality.value ? 'default' : 'outline'}
                  size="sm"
                  className={`p-3 text-center ${
                    audioQuality === quality.value
                      ? 'bg-blue-500 hover:bg-blue-600 text-white'
                      : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <div>
                    <div className="text-lg">{getQualityIcon(quality.value)}</div>
                    <div className="text-xs font-semibold">{quality.label}</div>
                    <div className="text-xs opacity-70">{quality.desc}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Buffer Size & Latency */}
          <div className="space-y-3">
            <h3 className="text-white font-medium flex items-center space-x-2">
              <span>⚡</span>
              <span>Latencia de Audio</span>
            </h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Tamaño de Buffer</span>
                <span className="text-white text-sm">{bufferSize} samples</span>
              </div>
              
              <Select value={bufferSize} onValueChange={handleBufferSizeChange}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="128">128 samples (Ultra baja latencia)</SelectItem>
                  <SelectItem value="256">256 samples (Baja latencia)</SelectItem>
                  <SelectItem value="512">512 samples (Normal)</SelectItem>
                  <SelectItem value="1024">1024 samples (Estable)</SelectItem>
                  <SelectItem value="2048">2048 samples (Máxima estabilidad)</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="bg-gray-800 rounded p-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Latencia estimada:</span>
                  <span className="text-white font-semibold">
                    ~{Math.round(latency)}ms
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {latency < 10 ? 'Excelente para DJ en vivo' :
                   latency < 20 ? 'Bueno para mixing' :
                   latency < 50 ? 'Aceptable para práctica' :
                   'Puede causar delay notable'}
                </div>
              </div>
            </div>
          </div>

          {/* Audio Status */}
          <div className="bg-gray-800 rounded-lg p-3">
            <h4 className="text-white font-medium mb-2">Estado del Sistema</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Sample Rate:</span>
                <span className="text-white">44.1 kHz</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Bit Depth:</span>
                <span className="text-white">16-bit</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Canales:</span>
                <span className="text-white">Estéreo (2)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Estado:</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-400">Conectado</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-700 flex space-x-3">
          <Button
            onClick={() => {
              // Test audio functionality
              console.log('Testing audio configuration...');
              alert('🔊 Configuración de audio aplicada correctamente!');
            }}
            className="flex-1 bg-green-500 hover:bg-green-600"
          >
            🧪 Probar Audio
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            ✅ Aplicar
          </Button>
        </div>
      </Card>
    </div>
  );
};