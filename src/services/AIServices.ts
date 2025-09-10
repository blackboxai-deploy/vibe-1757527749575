// AI Services for Flowstate DJ App
// Mock implementations for stem analysis, harmonic matching, and intelligent recommendations

import { Track, StemAnalysis, HarmonicAnalysis, EnergyAnalysis, AudioFeatures, TransitionSuggestion, AIRecommendation } from '@/types';

export class AIServices {
  // Stem Analysis - Mock implementation
  static async analyzeStem(track: Track): Promise<StemAnalysis> {
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Mock stem analysis based on track characteristics
    const hasVocals = track.vocalType === 'vocal' || track.vocalType === 'mixed';
    
    return {
      vocals: hasVocals ? 0.7 + Math.random() * 0.3 : Math.random() * 0.2,
      drums: 0.8 + Math.random() * 0.2, // Most electronic tracks have prominent drums
      bass: track.genre.toLowerCase().includes('bass') ? 0.9 : 0.6 + Math.random() * 0.3,
      other: 0.5 + Math.random() * 0.4, // Synths, effects, etc.
      hasVocals,
      vocalClarity: hasVocals ? 0.8 + Math.random() * 0.2 : 0
    };
  }

  // Harmonic Analysis - Mock implementation with music theory
  static async analyzeHarmonic(track: Track): Promise<HarmonicAnalysis> {
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    const key = track.key || this.generateRandomKey();
    const mode = track.mode || (Math.random() > 0.5 ? 'major' : 'minor');
    
    return {
      key,
      mode,
      confidence: 0.75 + Math.random() * 0.25,
      compatibleKeys: this.getCompatibleKeys(key, mode),
      camelotKey: this.getCamelotKey(key, mode)
    };
  }

  // Energy Analysis - Mock implementation
  static async analyzeEnergy(track: Track): Promise<EnergyAnalysis> {
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));

    const energyMap = { 'low': 0.3, 'medium': 0.6, 'high': 0.9 };
    const baseEnergy = energyMap[track.energy] + (Math.random() * 0.2 - 0.1);

    return {
      energy: Math.max(0, Math.min(1, baseEnergy)),
      danceability: track.danceability || (0.5 + Math.random() * 0.5),
      valence: track.valence || Math.random(),
      tempo: track.bpm,
      loudness: -5 - Math.random() * 10,
      mood: this.determineMood(baseEnergy, track.valence || 0.5)
    };
  }

  // Complete Audio Features Analysis
  static async getAudioFeatures(track: Track): Promise<AudioFeatures> {
    const [stems, harmonic, energy] = await Promise.all([
      this.analyzeStem(track),
      this.analyzeHarmonic(track),
      this.analyzeEnergy(track)
    ]);

    return {
      stems,
      harmonic,
      energy,
      waveform: this.generateMockWaveform(),
      peaks: this.generateMockPeaks()
    };
  }

  // AI Recommendations based on current track
  static async getRecommendations(currentTrack: Track, allTracks: Track[], count: number = 5): Promise<AIRecommendation[]> {
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));

    const recommendations: AIRecommendation[] = [];
    const otherTracks = allTracks.filter(t => t.id !== currentTrack.id);

    // Similar BPM tracks
    const similarBPM = otherTracks
      .filter(t => Math.abs(t.bpm - currentTrack.bpm) <= 5)
      .slice(0, 2);
    
    similarBPM.forEach(track => {
      recommendations.push({
        track,
        reason: `Similar BPM (${track.bpm} vs ${currentTrack.bpm})`,
        confidence: 0.9,
        category: 'similar'
      });
    });

    // Same genre tracks
    const sameGenre = otherTracks
      .filter(t => t.genre === currentTrack.genre)
      .slice(0, 2);
    
    sameGenre.forEach(track => {
      if (!recommendations.find(r => r.track.id === track.id)) {
        recommendations.push({
          track,
          reason: `Same genre: ${track.genre}`,
          confidence: 0.8,
          category: 'similar'
        });
      }
    });

    // Compatible key tracks (harmonic mixing)
    if (currentTrack.key) {
      const compatibleKeys = this.getCompatibleKeys(currentTrack.key, currentTrack.mode || 'major');
      const harmonicMatches = otherTracks
        .filter(t => t.key && compatibleKeys.includes(t.key))
        .slice(0, 2);

      harmonicMatches.forEach(track => {
        if (!recommendations.find(r => r.track.id === track.id)) {
          recommendations.push({
            track,
            reason: `Harmonic match: ${currentTrack.key} → ${track.key}`,
            confidence: 0.85,
            category: 'harmonic'
          });
        }
      });
    }

    // Energy progression
    const energyMap = { 'low': 1, 'medium': 2, 'high': 3 };
    const currentEnergyLevel = energyMap[currentTrack.energy];
    const nextEnergyTracks = otherTracks
      .filter(t => {
        const trackEnergyLevel = energyMap[t.energy];
        return trackEnergyLevel === currentEnergyLevel + 1 || trackEnergyLevel === currentEnergyLevel;
      })
      .slice(0, 2);

    nextEnergyTracks.forEach(track => {
      if (!recommendations.find(r => r.track.id === track.id)) {
        recommendations.push({
          track,
          reason: `Energy progression: ${currentTrack.energy} → ${track.energy}`,
          confidence: 0.75,
          category: 'energy'
        });
      }
    });

    return recommendations.slice(0, count);
  }

  // Generate transition suggestions between two tracks
  static async getTransitionSuggestions(fromTrack: Track, allTracks: Track[]): Promise<TransitionSuggestion[]> {
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

    const suggestions: TransitionSuggestion[] = [];
    const candidates = allTracks.filter(t => t.id !== fromTrack.id);

    for (const toTrack of candidates.slice(0, 5)) {
      const bpmDiff = Math.abs(toTrack.bpm - fromTrack.bpm);
      const keyCompatibility = this.calculateKeyCompatibility(fromTrack.key, toTrack.key);
      const energyMatch = this.calculateEnergyMatch(fromTrack.energy, toTrack.energy);
      
      const confidence = (
        (bpmDiff <= 5 ? 0.4 : Math.max(0, 0.4 - (bpmDiff - 5) * 0.02)) +
        keyCompatibility * 0.3 +
        energyMatch * 0.3
      );

      if (confidence > 0.5) {
        suggestions.push({
          fromTrack,
          toTrack,
          reason: this.generateTransitionReason(fromTrack, toTrack, bpmDiff, keyCompatibility, energyMatch),
          confidence,
          bpmDiff,
          keyCompatibility,
          energyMatch,
          suggestedMixPoint: fromTrack.duration - 30 - Math.random() * 30 // Last 30-60 seconds
        });
      }
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
  }

  // Helper Methods
  private static generateRandomKey(): string {
    const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return keys[Math.floor(Math.random() * keys.length)];
  }

  private static getCompatibleKeys(key: string, mode: 'major' | 'minor'): string[] {
    // Simplified harmonic compatibility (Circle of Fifths)
    const majorKeys: Record<string, string[]> = {
      'C': ['F', 'G', 'Am', 'Dm', 'Em'],
      'D': ['G', 'A', 'Bm', 'Em', 'F#m'],
      'E': ['A', 'B', 'C#m', 'F#m', 'G#m'],
      'F': ['Bb', 'C', 'Dm', 'Gm', 'Am'],
      'G': ['C', 'D', 'Em', 'Am', 'Bm'],
      'A': ['D', 'E', 'F#m', 'Bm', 'C#m'],
      'B': ['E', 'F#', 'G#m', 'C#m', 'D#m']
    };

    const minorKeys: Record<string, string[]> = {
      'Am': ['Dm', 'Em', 'C', 'F', 'G'],
      'Bm': ['Em', 'F#m', 'D', 'G', 'A'],
      'Cm': ['Fm', 'Gm', 'Eb', 'Ab', 'Bb'],
      'Dm': ['Gm', 'Am', 'F', 'Bb', 'C'],
      'Em': ['Am', 'Bm', 'G', 'C', 'D'],
      'F#m': ['Bm', 'C#m', 'A', 'D', 'E'],
      'Gm': ['Cm', 'Dm', 'Bb', 'Eb', 'F']
    };

    const keyName = mode === 'minor' ? key + 'm' : key;
    return (mode === 'major' ? majorKeys[keyName] : minorKeys[keyName]) || [];
  }

  private static getCamelotKey(key: string, mode: 'major' | 'minor'): string {
    // Camelot Wheel notation for DJ mixing
    const camelotMap: Record<string, string> = {
      'C': '8B', 'G': '9B', 'D': '10B', 'A': '11B', 'E': '12B', 'B': '1B', 'F#': '2B', 'Db': '3B',
      'Ab': '4B', 'Eb': '5B', 'Bb': '6B', 'F': '7B',
      'Am': '8A', 'Em': '9A', 'Bm': '10A', 'F#m': '11A', 'C#m': '12A', 'G#m': '1A', 'D#m': '2A',
      'A#m': '3A', 'Fm': '4A', 'Cm': '5A', 'Gm': '6A', 'Dm': '7A'
    };

    const keyName = mode === 'minor' ? key + 'm' : key;
    return camelotMap[keyName] || '1A';
  }

  private static determineMood(energy: number, valence: number): 'chill' | 'groovy' | 'energetic' | 'peak' | 'breakdown' {
    if (energy < 0.4 && valence > 0.6) return 'chill';
    if (energy < 0.6 && valence > 0.5) return 'groovy';
    if (energy > 0.8 && valence > 0.7) return 'peak';
    if (energy > 0.6) return 'energetic';
    return 'breakdown';
  }

  private static calculateKeyCompatibility(key1?: string, key2?: string): number {
    if (!key1 || !key2) return 0.5;
    if (key1 === key2) return 1.0;
    
    // Simple compatibility based on circle of fifths
    const distance = Math.abs(this.getKeyNumber(key1) - this.getKeyNumber(key2));
    const minDistance = Math.min(distance, 12 - distance);
    return Math.max(0, 1 - minDistance / 6);
  }

  private static calculateEnergyMatch(energy1: string, energy2: string): number {
    const energyMap = { 'low': 0, 'medium': 1, 'high': 2 };
    const diff = Math.abs(energyMap[energy1 as keyof typeof energyMap] - energyMap[energy2 as keyof typeof energyMap]);
    return Math.max(0, 1 - diff / 2);
  }

  private static getKeyNumber(key: string): number {
    const keyMap: Record<string, number> = {
      'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
      'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
    };
    return keyMap[key.replace('m', '')] || 0;
  }

  private static generateTransitionReason(fromTrack: Track, toTrack: Track, bpmDiff: number, keyComp: number, energyMatch: number): string {
    const reasons = [];
    
    if (bpmDiff <= 2) reasons.push('Perfect BPM match');
    else if (bpmDiff <= 5) reasons.push('Similar BPM');
    
    if (keyComp > 0.8) reasons.push('Harmonic compatibility');
    if (energyMatch > 0.8) reasons.push('Energy flow');
    if (fromTrack.genre === toTrack.genre) reasons.push('Same genre');
    
    return reasons.join(' + ') || 'Good transition candidate';
  }

  private static generateMockWaveform(): number[] {
    // Generate mock waveform data
    const samples = 1000;
    const waveform = [];
    
    for (let i = 0; i < samples; i++) {
      const t = i / samples;
      // Create a complex waveform with multiple frequencies
      const value = Math.sin(t * Math.PI * 40) * 0.5 +
                   Math.sin(t * Math.PI * 80) * 0.3 +
                   Math.sin(t * Math.PI * 120) * 0.2 +
                   (Math.random() - 0.5) * 0.1;
      waveform.push(Math.max(-1, Math.min(1, value)));
    }
    
    return waveform;
  }

  private static generateMockPeaks(): number[] {
    // Generate peak detection data
    const peaks = [];
    for (let i = 0; i < 50; i++) {
      peaks.push(Math.random());
    }
    return peaks;
  }
}