"use client";

import React, { useState } from 'react';
import { Track } from '@/types';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { spotifyAPI } from '@/services/SpotifyAPI';
import { appleMusicAPI } from '@/services/AppleMusicAPI';

interface ExternalSearchBarProps {
  onTrackSelect: (track: Track, deckId: 'A' | 'B') => void;
  targetDeck?: 'A' | 'B';
  className?: string;
}

interface ExternalTrack {
  id: string;
  title: string;
  artist: string;
  duration: number;
  previewUrl?: string;
  source: 'spotify' | 'applemusic';
  albumArt?: string;
  popularity?: number;
}

export const ExternalSearchBar: React.FC<ExternalSearchBarProps> = ({
  onTrackSelect,
  targetDeck = 'A',
  className = "",
}) => {
  const [query, setQuery] = useState('');
  const [selectedDeck, setSelectedDeck] = useState<'A' | 'B'>(targetDeck);
  const [selectedService, setSelectedService] = useState<'all' | 'spotify' | 'applemusic'>('all');
  const [results, setResults] = useState<ExternalTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSpotifyAuth, setIsSpotifyAuth] = useState(false);
  const [isAppleMusicAuth, setIsAppleMusicAuth] = useState(false);

  const searchExternal = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    const searchResults: ExternalTrack[] = [];

    try {
      // Search Spotify
      if ((selectedService === 'all' || selectedService === 'spotify') && isSpotifyAuth) {
        try {
          const spotifyResults = await spotifyAPI.searchTracks(query, 10);
          const spotifyTracks: ExternalTrack[] = spotifyResults.tracks.items.map(track => ({
            id: `spotify_${track.id}`,
            title: track.name,
            artist: track.artists.map(a => a.name).join(', '),
            duration: Math.round(track.duration_ms / 1000),
            previewUrl: track.preview_url || undefined,
            source: 'spotify',
            albumArt: track.album.images[0]?.url,
            popularity: track.popularity
          }));
          searchResults.push(...spotifyTracks);
        } catch (error) {
          console.error('Spotify search failed:', error);
        }
      }

      // Search Apple Music
      if ((selectedService === 'all' || selectedService === 'applemusic') && isAppleMusicAuth) {
        try {
          const appleResults = await appleMusicAPI.searchTracks(query, 10);
          const appleTracks: ExternalTrack[] = appleResults.results.songs?.data.map(track => ({
            id: `apple_${track.id}`,
            title: track.attributes.name,
            artist: track.attributes.artistName,
            duration: Math.round(track.attributes.durationInMillis / 1000),
            previewUrl: track.attributes.previews[0]?.url,
            source: 'applemusic',
            albumArt: track.attributes.artwork.url.replace('{w}', '300').replace('{h}', '300'),
            popularity: 75 // Mock popularity for Apple Music
          })) || [];
          searchResults.push(...appleTracks);
        } catch (error) {
          console.error('Apple Music search failed:', error);
        }
      }

      // Mock results if no services are authenticated
      if (!isSpotifyAuth && !isAppleMusicAuth) {
        const mockResults: ExternalTrack[] = [
          {
            id: 'mock_1',
            title: `${query} (Extended Mix)`,
            artist: 'External Artist',
            duration: 240,
            previewUrl: 'https://example.com/preview1.mp3',
            source: 'spotify',
            albumArt: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/0ff2b931-59aa-4b05-b965-5d8a074f12f9.png',
            popularity: 85
          },
          {
            id: 'mock_2',
            title: `${query} (Radio Edit)`,
            artist: 'Another Artist',
            duration: 180,
            previewUrl: 'https://example.com/preview2.mp3',
            source: 'applemusic',
            albumArt: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/8a2635ff-7d79-4fa8-af2d-aa5a8e4b6bb5.png',
            popularity: 70
          }
        ];
        searchResults.push(...mockResults);
      }

      setResults(searchResults);
    } catch (error) {
      console.error('External search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSpotifyAuth = async () => {
    setIsSearching(true);
    try {
      const success = await spotifyAPI.authenticate();
      setIsSpotifyAuth(success);
    } catch (error) {
      console.error('Spotify auth failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAppleMusicAuth = async () => {
    setIsSearching(true);
    try {
      const success = await appleMusicAPI.authenticate();
      setIsAppleMusicAuth(success);
    } catch (error) {
      console.error('Apple Music auth failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const convertToTrack = (externalTrack: ExternalTrack): Track => {
    return {
      id: externalTrack.id,
      title: externalTrack.title,
      artist: externalTrack.artist,
      duration: externalTrack.duration,
      bpm: 120 + Math.floor(Math.random() * 60), // Mock BPM
      genre: 'Electronic', // Mock genre
      year: 2024,
      previewUrl: externalTrack.previewUrl,
      energy: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
      vocalType: ['vocal', 'instrumental', 'mixed'][Math.floor(Math.random() * 3)] as 'vocal' | 'instrumental' | 'mixed',
      key: ['C', 'D', 'E', 'F', 'G', 'A', 'B'][Math.floor(Math.random() * 7)],
      mode: Math.random() > 0.5 ? 'major' : 'minor' as 'major' | 'minor',
      danceability: Math.random(),
      valence: Math.random(),
      acousticness: Math.random() * 0.5,
      instrumentalness: Math.random(),
      ...(externalTrack.source === 'spotify' && { spotifyId: externalTrack.id.replace('spotify_', '') }),
      ...(externalTrack.source === 'applemusic' && { appleMusicId: externalTrack.id.replace('apple_', '') }),
    };
  };

  const handleTrackSelect = (externalTrack: ExternalTrack) => {
    const track = convertToTrack(externalTrack);
    onTrackSelect(track, selectedDeck);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getServiceIcon = (service: string): string => {
    switch (service) {
      case 'spotify': return '🎵';
      case 'applemusic': return '🍎';
      default: return '🎵';
    }
  };

  const getServiceColor = (service: string): string => {
    switch (service) {
      case 'spotify': return 'bg-green-500';
      case 'applemusic': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">External Music Search</h3>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className={isSpotifyAuth ? "border-green-500 text-green-400" : "border-gray-600 text-gray-400"}>
            🎵 Spotify {isSpotifyAuth ? "✓" : "✗"}
          </Badge>
          <Badge variant="outline" className={isAppleMusicAuth ? "border-red-500 text-red-400" : "border-gray-600 text-gray-400"}>
            🍎 Apple {isAppleMusicAuth ? "✓" : "✗"}
          </Badge>
        </div>
      </div>

      {/* Authentication */}
      {(!isSpotifyAuth || !isAppleMusicAuth) && (
        <Card className="p-4 bg-gray-800 border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white text-sm">Connect Music Services</span>
          </div>
          <div className="flex space-x-2">
            {!isSpotifyAuth && (
              <Button
                onClick={handleSpotifyAuth}
                disabled={isSearching}
                size="sm"
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                🎵 Connect Spotify
              </Button>
            )}
            {!isAppleMusicAuth && (
              <Button
                onClick={handleAppleMusicAuth}
                disabled={isSearching}
                size="sm"
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                🍎 Connect Apple Music
              </Button>
            )}
          </div>
          <p className="text-gray-400 text-xs mt-2">
            Connect to search millions of tracks and get 30-second previews
          </p>
        </Card>
      )}

      {/* Search Controls */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Load to:</span>
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

        <div className="flex space-x-2">
          <div className="flex-1">
            <Input
              placeholder="Search tracks, artists, or albums..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchExternal()}
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
            />
          </div>
          
          <Select value={selectedService} onValueChange={(value: any) => setSelectedService(value)}>
            <SelectTrigger className="w-32 bg-gray-800 border-gray-600 text-white">
              <SelectValue placeholder="Service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              <SelectItem value="spotify">Spotify</SelectItem>
              <SelectItem value="applemusic">Apple Music</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            onClick={searchExternal}
            disabled={isSearching || !query.trim()}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </div>

      {/* Search Results */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {isSearching && (
          <div className="text-center py-8">
            <div className="text-2xl mb-2">🔍</div>
            <p className="text-gray-400">Searching external services...</p>
          </div>
        )}

        {results.length === 0 && !isSearching && query && (
          <div className="text-center py-8">
            <div className="text-2xl mb-2">🚫</div>
            <p className="text-gray-400">No results found for "{query}"</p>
          </div>
        )}

        {results.map((track) => (
          <Card 
            key={track.id}
            className="p-3 bg-gray-800 border-gray-700 hover:bg-gray-700 cursor-pointer transition-colors"
            onClick={() => handleTrackSelect(track)}
          >
            <div className="flex items-center space-x-3">
              {/* Album Art */}
              {track.albumArt && (
                <img 
                  src={track.albumArt} 
                  alt="Album cover"
                  className="w-12 h-12 rounded object-cover"
                />
              )}
              
              {/* Track Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium truncate">
                  {track.title}
                </h4>
                <p className="text-gray-400 text-sm truncate">
                  {track.artist}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={`text-xs ${getServiceColor(track.source)} text-white`}>
                    {getServiceIcon(track.source)} {track.source}
                  </Badge>
                  <span className="text-gray-500 text-xs">
                    {formatTime(track.duration)}
                  </span>
                  {track.popularity && (
                    <span className="text-gray-500 text-xs">
                      {track.popularity}% popular
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col items-end space-y-1">
                {track.previewUrl && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-xs border-gray-600 text-gray-300 hover:bg-gray-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Implement preview player
                      console.log('Play preview:', track.previewUrl);
                    }}
                  >
                    🔊 Preview
                  </Button>
                )}
                <Button
                  size="sm"
                  className="h-6 px-2 text-xs bg-blue-500 hover:bg-blue-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTrackSelect(track);
                  }}
                >
                  Load to {selectedDeck}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Footer */}
      {results.length > 0 && (
        <div className="text-center text-xs text-gray-400 pt-2 border-t border-gray-700">
          Found {results.length} tracks from external services
        </div>
      )}
    </div>
  );
};