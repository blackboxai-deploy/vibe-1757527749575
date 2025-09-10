// AudioManager - Sistema central de gestión de audio real para Flowstate DJ
// Maneja Web Audio API, reproducción, mezcla y efectos en tiempo real

export interface AudioTrack {
  id: string;
  audioBuffer: AudioBuffer;
  source?: AudioBufferSourceNode;
  gainNode?: GainNode;
  isPlaying: boolean;
  startTime: number;
  pausedAt: number;
  duration: number;
  currentTime: number;
}

export interface AudioEffects {
  volume: number;
  highEQ: number;
  midEQ: number;
  lowEQ: number;
  highpassFilter: number;
  lowpassFilter: number;
}

export class AudioManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private deckAGain: GainNode | null = null;
  private deckBGain: GainNode | null = null;
  private crossfaderGain: GainNode | null = null;
  
  private tracks: Map<string, AudioTrack> = new Map();
  private animationFrame: number | null = null;
  
  // Callbacks for UI updates
  private onPositionUpdate?: (deckId: string, position: number, duration: number) => void;
  private onTrackEnd?: (deckId: string) => void;

  constructor() {
    // Don't initialize immediately - wait for client-side initialization
  }

  // Initialize Web Audio API context
  async initializeAudioContext(): Promise<boolean> {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      console.warn('AudioManager: Not in browser environment, skipping initialization');
      return false;
    }

    try {
      // Check for Web Audio API support
      if (!window.AudioContext && !(window as any).webkitAudioContext) {
        console.warn('AudioManager: Web Audio API not supported');
        return false;
      }

      // Create audio context with optimal settings
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        latencyHint: 'interactive', // Low latency for real-time performance
        sampleRate: 44100
      });

      // Create master audio chain: source -> deckGain -> crossfader -> masterGain -> destination
      this.masterGain = this.audioContext.createGain();
      this.deckAGain = this.audioContext.createGain();
      this.deckBGain = this.audioContext.createGain();
      this.crossfaderGain = this.audioContext.createGain();

      // Connect audio chain
      this.deckAGain.connect(this.crossfaderGain);
      this.deckBGain.connect(this.crossfaderGain);
      this.crossfaderGain.connect(this.masterGain);
      this.masterGain.connect(this.audioContext.destination);

      // Set initial volumes
      this.masterGain.gain.value = 0.8;
      this.deckAGain.gain.value = 0.75;
      this.deckBGain.gain.value = 0.75;

      // Resume context if suspended (required by browser policies)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      console.log('🎵 AudioManager initialized successfully');
      this.startPositionTracking();
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize audio context:', error);
      return false;
    }
  }

  // Load audio file and create audio track
  async loadTrack(file: File, trackId: string): Promise<boolean> {
    if (!this.audioContext) {
      console.error('Audio context not initialized');
      return false;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      const audioTrack: AudioTrack = {
        id: trackId,
        audioBuffer,
        isPlaying: false,
        startTime: 0,
        pausedAt: 0,
        duration: audioBuffer.duration,
        currentTime: 0
      };

      this.tracks.set(trackId, audioTrack);
      console.log(`🎵 Track loaded: ${file.name} (${audioBuffer.duration.toFixed(2)}s)`);
      
      return true;
    } catch (error) {
      console.error(`❌ Failed to load track ${trackId}:`, error);
      return false;
    }
  }

  // Load track from URL (for previews or demo tracks)
  async loadTrackFromURL(url: string, trackId: string): Promise<boolean> {
    if (!this.audioContext) {
      console.error('Audio context not initialized');
      return false;
    }

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      const audioTrack: AudioTrack = {
        id: trackId,
        audioBuffer,
        isPlaying: false,
        startTime: 0,
        pausedAt: 0,
        duration: audioBuffer.duration,
        currentTime: 0
      };

      this.tracks.set(trackId, audioTrack);
      console.log(`🎵 Track loaded from URL: ${url} (${audioBuffer.duration.toFixed(2)}s)`);
      
      return true;
    } catch (error) {
      console.error(`❌ Failed to load track from URL ${trackId}:`, error);
      return false;
    }
  }

  // Play track on specific deck
  async playTrack(trackId: string, deckId: 'A' | 'B'): Promise<boolean> {
    if (!this.audioContext) return false;

    const track = this.tracks.get(trackId);
    if (!track || !track.audioBuffer) return false;

    try {
      // Resume audio context if needed
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Stop current source if playing
      if (track.source) {
        track.source.stop();
        track.source.disconnect();
      }

      // Create new source and gain nodes
      track.source = this.audioContext.createBufferSource();
      track.gainNode = this.audioContext.createGain();
      
      track.source.buffer = track.audioBuffer;
      
      // Connect to appropriate deck
      const deckGain = deckId === 'A' ? this.deckAGain : this.deckBGain;
      track.source.connect(track.gainNode);
      track.gainNode!.connect(deckGain!);

      // Set initial gain
      track.gainNode.gain.value = 1.0;

      // Handle track end
      track.source.onended = () => {
        if (track.isPlaying) {
          track.isPlaying = false;
          track.currentTime = 0;
          track.pausedAt = 0;
          this.onTrackEnd?.(deckId);
        }
      };

      // Calculate start offset for resume functionality
      const offset = track.pausedAt || 0;
      track.source.start(0, offset);
      track.startTime = this.audioContext.currentTime - offset;
      track.isPlaying = true;
      track.pausedAt = 0;

      console.log(`▶️ Playing track ${trackId} on deck ${deckId} from ${offset.toFixed(2)}s`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to play track ${trackId}:`, error);
      return false;
    }
  }

  // Pause track
  pauseTrack(trackId: string): boolean {
    const track = this.tracks.get(trackId);
    if (!track || !track.isPlaying || !this.audioContext) return false;

    try {
      if (track.source) {
        track.source.stop();
        track.source.disconnect();
      }

      track.pausedAt = this.audioContext.currentTime - track.startTime;
      track.isPlaying = false;
      track.currentTime = track.pausedAt;

      console.log(`⏸️ Paused track ${trackId} at ${track.pausedAt.toFixed(2)}s`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to pause track ${trackId}:`, error);
      return false;
    }
  }

  // Stop track
  stopTrack(trackId: string): boolean {
    const track = this.tracks.get(trackId);
    if (!track) return false;

    try {
      if (track.source) {
        track.source.stop();
        track.source.disconnect();
      }

      track.isPlaying = false;
      track.pausedAt = 0;
      track.currentTime = 0;
      track.startTime = 0;

      console.log(`⏹️ Stopped track ${trackId}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to stop track ${trackId}:`, error);
      return false;
    }
  }

  // Set deck volume (0-1)
  setDeckVolume(deckId: 'A' | 'B', volume: number): void {
    const gain = deckId === 'A' ? this.deckAGain : this.deckBGain;
    if (gain) {
      // Smooth volume changes to prevent audio pops
      const currentTime = this.audioContext?.currentTime || 0;
      gain.gain.setTargetAtTime(Math.max(0, Math.min(1, volume)), currentTime, 0.01);
    }
  }

  // Set master volume (0-1)
  setMasterVolume(volume: number): void {
    if (this.masterGain && this.audioContext) {
      const currentTime = this.audioContext.currentTime;
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, volume)), currentTime, 0.01);
    }
  }

  // Set crossfader position (-1 to 1: -1=full A, 0=center, 1=full B)
  setCrossfader(position: number): void {
    if (!this.deckAGain || !this.deckBGain || !this.audioContext) return;

    const currentTime = this.audioContext.currentTime;
    const clampedPosition = Math.max(-1, Math.min(1, position));
    
    // Calculate gain values for smooth crossfading
    const gainA = clampedPosition <= 0 ? 1 : 1 - clampedPosition;
    const gainB = clampedPosition >= 0 ? 1 : 1 + clampedPosition;

    this.deckAGain.gain.setTargetAtTime(gainA, currentTime, 0.01);
    this.deckBGain.gain.setTargetAtTime(gainB, currentTime, 0.01);
  }

  // Get track info
  getTrackInfo(trackId: string): AudioTrack | null {
    return this.tracks.get(trackId) || null;
  }

  // Get current playback position
  getCurrentTime(trackId: string): number {
    const track = this.tracks.get(trackId);
    if (!track || !this.audioContext) return 0;

    if (track.isPlaying) {
      return this.audioContext.currentTime - track.startTime;
    } else {
      return track.pausedAt;
    }
  }

  // Seek to specific position
  seekTo(trackId: string, position: number, deckId: 'A' | 'B'): boolean {
    const track = this.tracks.get(trackId);
    if (!track) return false;

    const wasPlaying = track.isPlaying;
    
    // Stop current playback
    this.stopTrack(trackId);
    
    // Set new position
    track.pausedAt = Math.max(0, Math.min(track.duration, position));
    
    // Resume if was playing
    if (wasPlaying) {
      this.playTrack(trackId, deckId);
    }

    return true;
  }

  // Start position tracking for UI updates
  private startPositionTracking(): void {
    const updatePositions = () => {
      this.tracks.forEach((track, trackId) => {
        if (track.isPlaying && this.audioContext) {
          track.currentTime = this.audioContext.currentTime - track.startTime;
          
          // Check if track ended
          if (track.currentTime >= track.duration) {
            this.stopTrack(trackId);
          } else {
            this.onPositionUpdate?.(trackId, track.currentTime, track.duration);
          }
        }
      });

      this.animationFrame = requestAnimationFrame(updatePositions);
    };

    updatePositions();
  }

  // Set callback functions
  setCallbacks(
    onPositionUpdate: (deckId: string, position: number, duration: number) => void,
    onTrackEnd: (deckId: string) => void
  ): void {
    this.onPositionUpdate = onPositionUpdate;
    this.onTrackEnd = onTrackEnd;
  }

  // Clean up resources
  cleanup(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    this.tracks.forEach((_, trackId) => {
      this.stopTrack(trackId);
    });

    this.tracks.clear();

    if (this.audioContext) {
      this.audioContext.close();
    }
  }

  // Get audio context state
  getAudioContextState(): string {
    return this.audioContext?.state || 'closed';
  }

  // Check if audio is supported
  static isAudioSupported(): boolean {
    return !!(window.AudioContext || (window as any).webkitAudioContext);
  }

  // Create demo tracks with tone generation
  async createDemoTrack(frequency: number, duration: number, trackId: string): Promise<boolean> {
    if (!this.audioContext) return false;

    try {
      const sampleRate = this.audioContext.sampleRate;
      const arrayBuffer = this.audioContext.createBuffer(2, sampleRate * duration, sampleRate);
      
      for (let channel = 0; channel < arrayBuffer.numberOfChannels; channel++) {
        const channelData = arrayBuffer.getChannelData(channel);
        
        for (let i = 0; i < channelData.length; i++) {
          // Generate tone with envelope
          const t = i / sampleRate;
          const envelope = Math.min(1, Math.min(t * 10, (duration - t) * 10)); // Fade in/out
          channelData[i] = Math.sin(frequency * 2 * Math.PI * t) * envelope * 0.3;
        }
      }

      const audioTrack: AudioTrack = {
        id: trackId,
        audioBuffer: arrayBuffer,
        isPlaying: false,
        startTime: 0,
        pausedAt: 0,
        duration: duration,
        currentTime: 0
      };

      this.tracks.set(trackId, audioTrack);
      console.log(`🎵 Demo track created: ${frequency}Hz, ${duration}s`);
      
      return true;
    } catch (error) {
      console.error(`❌ Failed to create demo track:`, error);
      return false;
    }
  }
}

// Global instance
export const audioManager = new AudioManager();