// Spotify Web API Integration
// Note: This is a mock implementation for demo purposes
// In production, you would need to set up proper OAuth flow and use actual Spotify credentials

export interface SpotifyConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface SpotifySearchResult {
  tracks: {
    items: SpotifyTrack[];
    total: number;
    limit: number;
    offset: number;
  };
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string; id: string }>;
  album: {
    name: string;
    images: Array<{ url: string; height: number; width: number }>;
  };
  duration_ms: number;
  preview_url: string | null;
  external_ids: { isrc?: string };
  popularity: number;
}

export interface SpotifyAudioFeatures {
  id: string;
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
  time_signature: number;
}

export class SpotifyAPI {
  private config: SpotifyConfig;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor(config: SpotifyConfig) {
    this.config = config;
    // Config will be used for actual OAuth implementation
  }

  // Mock authentication - in production, implement proper OAuth flow
  async authenticate(): Promise<boolean> {
    try {
      // Mock successful authentication
      this.accessToken = 'mock_spotify_access_token_' + Date.now();
      this.tokenExpiry = Date.now() + (3600 * 1000); // 1 hour
      return true;
    } catch (error) {
      console.error('Spotify authentication failed:', error);
      return false;
    }
  }

  private async makeRequest(endpoint: string, params: Record<string, string> = {}): Promise<any> {
    // Mock API responses for demo
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with Spotify');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    // Mock responses based on endpoint
    if (endpoint.includes('/search')) {
      return this.getMockSearchResults(params.q || '');
    }
    
    if (endpoint.includes('/audio-features')) {
      return this.getMockAudioFeatures();
    }

    return {};
  }

  async searchTracks(query: string, limit: number = 20, offset: number = 0): Promise<SpotifySearchResult> {
    const endpoint = '/search';
    const params = {
      q: query,
      type: 'track',
      limit: limit.toString(),
      offset: offset.toString(),
    };

    return await this.makeRequest(endpoint, params);
  }

  async getAudioFeatures(trackId: string): Promise<SpotifyAudioFeatures> {
    const endpoint = `/audio-features/${trackId}`;
    return await this.makeRequest(endpoint);
  }

  async getMultipleAudioFeatures(trackIds: string[]): Promise<{ audio_features: SpotifyAudioFeatures[] }> {
    // For production, would use actual API endpoint
    const features = await Promise.all(
      trackIds.map(() => this.getMockAudioFeatures())
    );
    
    return { audio_features: features };
  }

  private getMockSearchResults(query: string): SpotifySearchResult {
    // Generate mock search results
    const mockTracks: SpotifyTrack[] = [
      {
        id: 'spotify_1',
        name: `${query} (Extended Mix)`,
        artists: [{ name: 'Spotify Artist', id: 'artist_1' }],
        album: {
          name: 'Spotify Album',
          images: [{ url: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/c23b5dda-f948-4dd5-a509-aaab1b33713a.png', height: 300, width: 300 }]
        },
        duration_ms: 240000,
        preview_url: 'https://example.com/preview.mp3',
        external_ids: { isrc: 'USUM71504277' },
        popularity: 75
      },
      {
        id: 'spotify_2',
        name: `${query} (Radio Edit)`,
        artists: [{ name: 'Another Spotify Artist', id: 'artist_2' }],
        album: {
          name: 'Hit Singles',
          images: [{ url: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/74287fb7-bf3d-4226-94aa-f30c19eabb48.png', height: 300, width: 300 }]
        },
        duration_ms: 180000,
        preview_url: 'https://example.com/preview2.mp3',
        external_ids: { isrc: 'GBUM71504278' },
        popularity: 85
      }
    ];

    return {
      tracks: {
        items: mockTracks,
        total: mockTracks.length,
        limit: 20,
        offset: 0
      }
    };
  }

  private getMockAudioFeatures(): SpotifyAudioFeatures {
    return {
      id: 'mock_feature_id',
      danceability: Math.random(),
      energy: Math.random(),
      key: Math.floor(Math.random() * 12),
      loudness: -5 - Math.random() * 10,
      mode: Math.round(Math.random()),
      speechiness: Math.random() * 0.3,
      acousticness: Math.random() * 0.5,
      instrumentalness: Math.random(),
      liveness: Math.random() * 0.3,
      valence: Math.random(),
      tempo: 80 + Math.random() * 120,
      time_signature: 4
    };
  }

  isAuthenticated(): boolean {
    return this.accessToken !== null && 
           this.tokenExpiry !== null && 
           Date.now() < this.tokenExpiry;
  }

  async refreshToken(): Promise<boolean> {
    // Mock token refresh
    if (this.tokenExpiry && Date.now() > this.tokenExpiry - 300000) { // 5 minutes before expiry
      return await this.authenticate();
    }
    return true;
  }

  logout(): void {
    this.accessToken = null;
    this.tokenExpiry = null;
  }
}

// Default instance with mock config
export const spotifyAPI = new SpotifyAPI({
  clientId: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || 'mock_client_id',
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET || 'mock_client_secret',
  redirectUri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI || 'http://localhost:3000/callback/spotify'
});