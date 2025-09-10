export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number; // in seconds
  bpm: number;
  genre: string;
  album?: string;
  year?: number;
  audioUrl?: string;
  previewUrl?: string; // 30-second preview
  // Advanced analysis fields
  energy: 'low' | 'medium' | 'high';
  vocalType: 'instrumental' | 'vocal' | 'acapella' | 'mixed';
  key?: string; // Musical key (C, D, E, etc.)
  mode?: 'major' | 'minor';
  danceability?: number; // 0-1
  valence?: number; // 0-1 (musical positivity)
  acousticness?: number; // 0-1
  instrumentalness?: number; // 0-1
  // External API data
  spotifyId?: string;
  appleMusicId?: string;
  isrc?: string;
  waveformUrl?: string;
}

export interface DeckState {
  id: 'A' | 'B';
  currentTrack: Track | null;
  isPlaying: boolean;
  position: number; // position in seconds
  volume: number; // 0-100
  isCueSet: boolean;
  cuePosition?: number;
  hasRealAudio?: boolean; // Indicates if deck has real audio loaded
}

export interface SearchState {
  query: string;
  results: Track[];
  isSearching: boolean;
}

export interface SuggestionItem {
  id: string;
  type: 'track' | 'playlist' | 'artist';
  title: string;
  description: string;
}

export type PlaybackState = 'playing' | 'paused' | 'stopped';

export interface AppState {
  deckA: DeckState;
  deckB: DeckState;
  searchState: SearchState;
  suggestions: SuggestionItem[];
  isDarkMode: boolean;
  isLoading: boolean;
}

// Advanced Search Types
export interface SearchFilters {
  bpmRange: [number, number];
  energy: ('low' | 'medium' | 'high')[];
  vocalType: ('instrumental' | 'vocal' | 'acapella' | 'mixed')[];
  genres: string[];
  yearRange?: [number, number];
  key?: string[];
  danceabilityRange?: [number, number];
}

export interface AdvancedSearchState extends SearchState {
  filters: SearchFilters;
  sortBy: 'relevance' | 'bpm' | 'energy' | 'popularity' | 'date';
  sortOrder: 'asc' | 'desc';
  source: 'local' | 'spotify' | 'applemusic' | 'all';
}

// Audio Analysis Types
export interface StemAnalysis {
  vocals: number; // 0-1 strength
  drums: number;
  bass: number;
  other: number;
  hasVocals: boolean;
  vocalClarity: number;
}

export interface HarmonicAnalysis {
  key: string;
  mode: 'major' | 'minor';
  confidence: number;
  compatibleKeys: string[];
  camelotKey?: string;
}

export interface EnergyAnalysis {
  energy: number; // 0-1
  danceability: number;
  valence: number;
  tempo: number;
  loudness: number;
  mood: 'chill' | 'groovy' | 'energetic' | 'peak' | 'breakdown';
}

export interface AudioFeatures {
  stems: StemAnalysis;
  harmonic: HarmonicAnalysis;
  energy: EnergyAnalysis;
  waveform?: number[];
  peaks?: number[];
}

// AI Recommendation Types
export interface TransitionSuggestion {
  fromTrack: Track;
  toTrack: Track;
  reason: string;
  confidence: number;
  bpmDiff: number;
  keyCompatibility: number;
  energyMatch: number;
  suggestedMixPoint: number; // seconds into from track
}

export interface AIRecommendation {
  track: Track;
  reason: string;
  confidence: number;
  category: 'similar' | 'complement' | 'transition' | 'energy' | 'harmonic';
}

// External API Types
export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { name: string };
  duration_ms: number;
  preview_url?: string;
  audio_features?: SpotifyAudioFeatures;
  external_ids?: { isrc: string };
}

export interface SpotifyAudioFeatures {
  danceability: number;
  energy: number;
  key: number;
  loudness: number;
  mode: number;
  speechiness: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  valence: number;
  tempo: number;
}

export interface AppleMusicTrack {
  id: string;
  attributes: {
    name: string;
    artistName: string;
    albumName: string;
    durationInMillis: number;
    previews?: Array<{ url: string }>;
    genreNames: string[];
    releaseDate: string;
    isrc?: string;
  };
}

// Authentication Types
export interface AuthState {
  spotify: {
    isAuthenticated: boolean;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
  };
  appleMusic: {
    isAuthenticated: boolean;
    userToken?: string;
    developerToken?: string;
  };
}

// UI State Types
export interface UIState {
  showAdvancedSearch: boolean;
  showStemAnalysis: boolean;
  showWaveforms: boolean;
  showAIRecommendations: boolean;
  activePanel: 'search' | 'analysis' | 'ai' | 'suggestions';
}