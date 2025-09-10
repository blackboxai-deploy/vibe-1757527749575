// Real Audio Engine for Flowstate DJ App
// Implements Web Audio API for professional audio mixing

export interface AudioTrack {
  id: string;
  audioBuffer?: AudioBuffer;
  audioUrl?: string;
  duration: number;
  isLoaded: boolean;
}

export interface DeckAudioState {
  id: 'A' | 'B';
  audioTrack: AudioTrack | null;
  isPlaying: boolean;
  position: number;
  volume: number;
  startTime: number;
  pauseTime: number;
}

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private masterGainNode: GainNode | null = null;
  private deckAGainNode: GainNode | null = null;
  private deckBGainNode: GainNode | null = null;
  private crossfaderGainA: GainNode | null = null;
  private crossfaderGainB: GainNode | null = null;
  private deckASource: AudioBufferSourceNode | null = null;
  private deckBSource: AudioBufferSourceNode | null = null;
  
  // Deck states
  private deckAState: DeckAudioState = {
    id: 'A',
    audioTrack: null,
    isPlaying: false,
    position: 0,
    volume: 0.75,
    startTime: 0,
    pauseTime: 0
  };
  
  private deckBState: DeckAudioState = {
    id: 'B',
    audioTrack: null,
    isPlaying: false,
    position: 0,
    volume: 0.75,
    startTime: 0,
    pauseTime: 0
  };

  private crossfaderPosition: number = 0.5; // 0 = full A, 1 = full B
  private masterVolume: number = 0.8;

  constructor() {
    this.initializeAudioContext();
  }

  private async initializeAudioContext() {
    try {
      // Only initialize in browser environment
      if (typeof window === 'undefined') {
        console.log('🎵 AudioEngine: Server-side environment detected, skipping initialization');
        return;
      }

      // Create AudioContext (handle both prefixed and non-prefixed)
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass();
      
      // Create the audio graph
      this.setupAudioGraph();
      
      console.log('🎵 AudioEngine initialized successfully');
      console.log('Sample Rate:', this.audioContext.sampleRate);
      console.log('State:', this.audioContext.state);
      
      // Resume context if suspended (browser policy)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
    } catch (error) {
      console.error('❌ Failed to initialize AudioContext:', error);
    }
  }

  private setupAudioGraph() {
    if (!this.audioContext) return;

    // Create gain nodes for audio routing
    this.masterGainNode = this.audioContext.createGain();
    this.deckAGainNode = this.audioContext.createGain();
    this.deckBGainNode = this.audioContext.createGain();
    this.crossfaderGainA = this.audioContext.createGain();
    this.crossfaderGainB = this.audioContext.createGain();

    // Set initial values
    this.masterGainNode.gain.value = this.masterVolume;
    this.deckAGainNode.gain.value = this.deckAState.volume;
    this.deckBGainNode.gain.value = this.deckBState.volume;
    
    // Setup crossfader (center position)
    this.updateCrossfader(this.crossfaderPosition);

    // Connect the audio graph:
    // Deck A: source → deckAGain → crossfaderGainA → masterGain → destination
    // Deck B: source → deckBGain → crossfaderGainB → masterGain → destination
    this.crossfaderGainA.connect(this.masterGainNode);
    this.crossfaderGainB.connect(this.masterGainNode);
    this.masterGainNode.connect(this.audioContext.destination);

    console.log('🎛️ Audio graph setup complete');
  }

  // Load audio file and convert to AudioBuffer
  async loadAudioFile(file: File): Promise<AudioTrack> {
    if (!this.audioContext) {
      throw new Error('AudioContext not initialized');
    }

    try {
      console.log('🎵 Loading audio file:', file.name);
      
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      const audioTrack: AudioTrack = {
        id: `track_${Date.now()}`,
        audioBuffer,
        audioUrl: URL.createObjectURL(file),
        duration: audioBuffer.duration,
        isLoaded: true
      };

      console.log('✅ Audio file loaded successfully');
      console.log('Duration:', audioTrack.duration, 'seconds');
      console.log('Sample Rate:', audioBuffer.sampleRate);
      console.log('Channels:', audioBuffer.numberOfChannels);

      return audioTrack;
    } catch (error) {
      console.error('❌ Failed to load audio file:', error);
      throw error;
    }
  }

  // Load track to specific deck
  loadTrackToDeck(audioTrack: AudioTrack, deckId: 'A' | 'B') {
    console.log(`🎵 Loading track to Deck ${deckId}:`, audioTrack.id);
    
    if (deckId === 'A') {
      // Stop current track if playing
      if (this.deckAState.isPlaying) {
        this.stopDeck('A');
      }
      this.deckAState.audioTrack = audioTrack;
      this.deckAState.position = 0;
    } else {
      // Stop current track if playing
      if (this.deckBState.isPlaying) {
        this.stopDeck('B');
      }
      this.deckBState.audioTrack = audioTrack;
      this.deckBState.position = 0;
    }
  }

  // Play/Resume deck
  async playDeck(deckId: 'A' | 'B'): Promise<boolean> {
    if (!this.audioContext || !this.masterGainNode) {
      console.error('❌ AudioContext not ready');
      return false;
    }

    // Ensure AudioContext is running
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    const deckState = deckId === 'A' ? this.deckAState : this.deckBState;
    
    if (!deckState.audioTrack?.audioBuffer) {
      console.error(`❌ No audio loaded in Deck ${deckId}`);
      return false;
    }

    if (deckState.isPlaying) {
      console.log(`⚠️ Deck ${deckId} is already playing`);
      return true;
    }

    try {
      // Create new source node
      const source = this.audioContext.createBufferSource();
      source.buffer = deckState.audioTrack.audioBuffer;
      
      // Connect to appropriate gain node
      const gainNode = deckId === 'A' ? this.deckAGainNode : this.deckBGainNode;
      const crossfaderGain = deckId === 'A' ? this.crossfaderGainA : this.crossfaderGainB;
      
      if (!gainNode || !crossfaderGain) {
        throw new Error('Gain nodes not initialized');
      }
      
      source.connect(gainNode);
      gainNode.connect(crossfaderGain);
      
      // Store source reference
      if (deckId === 'A') {
        this.deckASource = source;
      } else {
        this.deckBSource = source;
      }
      
      // Start playback from current position
      const startTime = this.audioContext.currentTime;
      source.start(startTime, deckState.position);
      
      // Update state
      deckState.isPlaying = true;
      deckState.startTime = startTime - deckState.position;
      
      console.log(`▶️ Deck ${deckId} started playing from position ${deckState.position}s`);
      
      // Handle track end
      source.onended = () => {
        if (deckState.isPlaying) {
          this.stopDeck(deckId);
          console.log(`🔚 Deck ${deckId} finished playing`);
        }
      };
      
      return true;
    } catch (error) {
      console.error(`❌ Failed to play Deck ${deckId}:`, error);
      return false;
    }
  }

  // Pause deck
  pauseDeck(deckId: 'A' | 'B') {
    const deckState = deckId === 'A' ? this.deckAState : this.deckBState;
    const source = deckId === 'A' ? this.deckASource : this.deckBSource;
    
    if (!deckState.isPlaying || !source || !this.audioContext) {
      return;
    }
    
    // Calculate current position
    const currentTime = this.audioContext.currentTime;
    deckState.position = currentTime - deckState.startTime;
    deckState.pauseTime = currentTime;
    
    // Stop source
    try {
      source.stop();
    } catch (error) {
      console.warn(`Warning stopping source for Deck ${deckId}:`, error);
    }
    
    // Update state
    deckState.isPlaying = false;
    
    // Clear source reference
    if (deckId === 'A') {
      this.deckASource = null;
    } else {
      this.deckBSource = null;
    }
    
    console.log(`⏸️ Deck ${deckId} paused at position ${deckState.position}s`);
  }

  // Stop deck
  stopDeck(deckId: 'A' | 'B') {
    const deckState = deckId === 'A' ? this.deckAState : this.deckBState;
    const source = deckId === 'A' ? this.deckASource : this.deckBSource;
    
    if (!deckState.isPlaying || !source) {
      deckState.position = 0;
      deckState.isPlaying = false;
      return;
    }
    
    // Stop source
    try {
      source.stop();
    } catch (error) {
      console.warn(`Warning stopping source for Deck ${deckId}:`, error);
    }
    
    // Reset state
    deckState.isPlaying = false;
    deckState.position = 0;
    deckState.startTime = 0;
    deckState.pauseTime = 0;
    
    // Clear source reference
    if (deckId === 'A') {
      this.deckASource = null;
    } else {
      this.deckBSource = null;
    }
    
    console.log(`⏹️ Deck ${deckId} stopped`);
  }

  // Update deck volume
  setDeckVolume(deckId: 'A' | 'B', volume: number) {
    const gainNode = deckId === 'A' ? this.deckAGainNode : this.deckBGainNode;
    const deckState = deckId === 'A' ? this.deckAState : this.deckBState;
    
    if (!gainNode) return;
    
    // Clamp volume between 0 and 1
    const clampedVolume = Math.max(0, Math.min(1, volume));
    
    // Smooth volume change to avoid clicks
    gainNode.gain.setTargetAtTime(clampedVolume, this.audioContext!.currentTime, 0.01);
    deckState.volume = clampedVolume;
    
    console.log(`🔊 Deck ${deckId} volume set to ${Math.round(clampedVolume * 100)}%`);
  }

  // Update master volume
  setMasterVolume(volume: number) {
    if (!this.masterGainNode) return;
    
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.masterGainNode.gain.setTargetAtTime(clampedVolume, this.audioContext!.currentTime, 0.01);
    this.masterVolume = clampedVolume;
    
    console.log(`🔊 Master volume set to ${Math.round(clampedVolume * 100)}%`);
  }

  // Update crossfader position
  setCrossfader(position: number) {
    this.crossfaderPosition = Math.max(0, Math.min(1, position));
    this.updateCrossfader(this.crossfaderPosition);
  }

  private updateCrossfader(position: number) {
    if (!this.crossfaderGainA || !this.crossfaderGainB || !this.audioContext) return;
    
    // Crossfader curve (equal power)
    const gainA = Math.cos((position * Math.PI) / 2);
    const gainB = Math.sin((position * Math.PI) / 2);
    
    this.crossfaderGainA.gain.setTargetAtTime(gainA, this.audioContext.currentTime, 0.01);
    this.crossfaderGainB.gain.setTargetAtTime(gainB, this.audioContext.currentTime, 0.01);
    
    console.log(`🎚️ Crossfader: A=${Math.round(gainA * 100)}% B=${Math.round(gainB * 100)}%`);
  }

  // Get current position of deck
  getCurrentPosition(deckId: 'A' | 'B'): number {
    const deckState = deckId === 'A' ? this.deckAState : this.deckBState;
    
    if (!deckState.isPlaying || !this.audioContext) {
      return deckState.position;
    }
    
    return this.audioContext.currentTime - deckState.startTime;
  }

  // Get deck state
  getDeckState(deckId: 'A' | 'B'): DeckAudioState {
    const deckState = deckId === 'A' ? this.deckAState : this.deckBState;
    
    // Update position if playing
    if (deckState.isPlaying && this.audioContext) {
      deckState.position = this.audioContext.currentTime - deckState.startTime;
    }
    
    return { ...deckState };
  }

  // Check if audio context is ready
  isReady(): boolean {
    return this.audioContext !== null && this.audioContext.state === 'running';
  }

  // Get audio context info
  getAudioInfo() {
    if (!this.audioContext) return null;
    
    return {
      sampleRate: this.audioContext.sampleRate,
      state: this.audioContext.state,
      currentTime: this.audioContext.currentTime,
      baseLatency: this.audioContext.baseLatency || 0,
      outputLatency: (this.audioContext as any).outputLatency || 0
    };
  }
}

// Create singleton instance only in browser
export const audioEngine = typeof window !== 'undefined' ? new AudioEngine() : null as any;