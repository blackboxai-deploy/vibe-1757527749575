"use client";

import React, { useState, useEffect } from 'react';
import { DeckState, Track } from '@/types';
import { DeckController } from '@/components/deck/DeckController';
import { SearchBar } from '@/components/search/SearchBar';
import { AdvancedSearchFilters } from '@/components/search/AdvancedSearchFilters';
import { ExternalSearchBar } from '@/components/search/ExternalSearchBar';
import { SuggestionPanel } from '@/components/suggestions/SuggestionPanel';
import { StemAnalyzer } from '@/components/analysis/StemAnalyzer';
import { AIRecommendations } from '@/components/ai/AIRecommendations';
import { RandomTrackButton } from '@/components/common/RandomTrackButton';
import { AudioSettings } from '@/components/audio/AudioSettings';
import { AudioUploader } from '@/components/audio/AudioUploader';
import { RealCrossfader } from '@/components/audio/RealCrossfader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch';
import enhancedTracks from '@/data/enhancedMockTracks.json';
import { audioManager } from '@/services/AudioManager';

export const HomeScreen: React.FC = () => {
  // Deck States
  const [deckA, setDeckA] = useState<DeckState>({
    id: 'A',
    currentTrack: null,
    isPlaying: false,
    position: 0,
    volume: 75,
    isCueSet: false,
  });

  const [deckB, setDeckB] = useState<DeckState>({
    id: 'B',
    currentTrack: null,
    isPlaying: false,
    position: 0,
    volume: 75,
    isCueSet: false,
  });

  // UI States
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showSearch, setShowSearch] = useState(true);
  const [showAudioSettings, setShowAudioSettings] = useState(false);
  const [activePanel, setActivePanel] = useState<'search' | 'external' | 'analysis' | 'ai' | 'upload'>('search');
  const [selectedAnalysisTrack, setSelectedAnalysisTrack] = useState<Track | null>(null);
  const [uploadedTracks, setUploadedTracks] = useState<Track[]>([]);
  const [audioReady, setAudioReady] = useState(false);

  // Initialize audio system
  useEffect(() => {
    const initAudio = async () => {
      const initialized = await audioManager.initializeAudioContext();
      setAudioReady(initialized);
      
      if (initialized) {
        // Set up audio callbacks
        audioManager.setCallbacks(
          (trackId: string, position: number) => {
            // Update position for UI - handled by individual deck controllers
          },
          (deckId: string) => {
            // Handle track end
            if (deckId === 'A') {
              setDeckA(prev => ({ ...prev, isPlaying: false, position: 0 }));
            } else {
              setDeckB(prev => ({ ...prev, isPlaying: false, position: 0 }));
            }
          }
        );
        
        console.log('🎵 Real audio system initialized successfully!');
      } else {
        console.warn('⚠️ Audio system initialization failed. Running in simulation mode.');
      }
    };

    initAudio();

    // Cleanup on unmount
    return () => {
      audioManager.cleanup();
    };
  }, []);

  // Handle uploaded tracks
  const handleTrackUploaded = (track: Track) => {
    setUploadedTracks(prev => [...prev, track]);
    console.log(`🎵 New track added to library: ${track.title}`);
  };

  // Combined tracks (original + uploaded)
  const allAvailableTracks = [...(enhancedTracks as Track[]), ...uploadedTracks];

  // Advanced Search Hook
  const {
    searchState,
    updateQuery,
    updateFilters,
    updateSort,
    resetFilters,
    filterOptions,
    totalResults,
    isFiltered
  } = useAdvancedSearch({ 
    tracks: allAvailableTracks,
    initialFilters: {
      bpmRange: [60, 200],
      energy: ['low', 'medium', 'high'],
      vocalType: ['instrumental', 'vocal', 'acapella', 'mixed'],
      genres: [],
    }
  });

  // Progress simulation for playing tracks
  useEffect(() => {
    const interval = setInterval(() => {
      setDeckA(prev => {
        if (prev.isPlaying && prev.currentTrack) {
          const newPosition = prev.position + 1;
          if (newPosition >= prev.currentTrack.duration) {
            return { ...prev, isPlaying: false, position: 0 };
          }
          return { ...prev, position: newPosition };
        }
        return prev;
      });

      setDeckB(prev => {
        if (prev.isPlaying && prev.currentTrack) {
          const newPosition = prev.position + 1;
          if (newPosition >= prev.currentTrack.duration) {
            return { ...prev, isPlaying: false, position: 0 };
          }
          return { ...prev, position: newPosition };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Deck A Controls
  const handleDeckAPlay = () => {
    if (!deckA.currentTrack) return;
    setDeckA(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const handleDeckAStop = () => {
    setDeckA(prev => ({ ...prev, isPlaying: false, position: 0 }));
  };

  const handleDeckAVolumeChange = (volume: number) => {
    setDeckA(prev => ({ ...prev, volume }));
  };

  const handleDeckAPositionChange = (position: number) => {
    setDeckA(prev => ({ ...prev, position }));
  };

  // Deck B Controls
  const handleDeckBPlay = () => {
    if (!deckB.currentTrack) return;
    setDeckB(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const handleDeckBStop = () => {
    setDeckB(prev => ({ ...prev, isPlaying: false, position: 0 }));
  };

  const handleDeckBVolumeChange = (volume: number) => {
    setDeckB(prev => ({ ...prev, volume }));
  };

  const handleDeckBPositionChange = (position: number) => {
    setDeckB(prev => ({ ...prev, position }));
  };

  // Track Loading
  const handleTrackSelect = (track: Track, deckId: 'A' | 'B') => {
    if (deckId === 'A') {
      setDeckA(prev => ({ 
        ...prev, 
        currentTrack: track, 
        isPlaying: false, 
        position: 0 
      }));
      // Auto-select for analysis if no track is selected
      if (!selectedAnalysisTrack) {
        setSelectedAnalysisTrack(track);
      }
    } else {
      setDeckB(prev => ({ 
        ...prev, 
        currentTrack: track, 
        isPlaying: false, 
        position: 0 
      }));
      // Auto-select for analysis if no track is selected
      if (!selectedAnalysisTrack) {
        setSelectedAnalysisTrack(track);
      }
    }
  };

  // Analysis Track Selection
  const handleAnalysisTrackSelect = (deckId: 'A' | 'B') => {
    const track = deckId === 'A' ? deckA.currentTrack : deckB.currentTrack;
    if (track) {
      setSelectedAnalysisTrack(track);
      setActivePanel('analysis');
    }
  };

  const getBPMDifference = (): string | null => {
    if (!deckA.currentTrack || !deckB.currentTrack) return null;
    const diff = Math.abs(deckA.currentTrack.bpm - deckB.currentTrack.bpm);
    return diff === 0 ? 'Perfect Match!' : `${diff} BPM difference`;
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-white">
            <span className="text-blue-500">Flow</span>state
          </h1>
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => {
                setShowSearch(!showSearch);
                if (!showSearch) setActivePanel('search');
              }}
              variant={showSearch ? 'default' : 'outline'}
              size="sm"
              className={showSearch 
                ? 'bg-blue-500 hover:bg-blue-600' 
                : 'border-gray-600 text-gray-300 hover:bg-gray-700'
              }
            >
              🔍 Search
            </Button>
            <Button
              onClick={() => setShowSuggestions(!showSuggestions)}
              variant={showSuggestions ? 'default' : 'outline'}
              size="sm"
              className={showSuggestions 
                ? 'bg-purple-500 hover:bg-purple-600' 
                : 'border-gray-600 text-gray-300 hover:bg-gray-700'
              }
            >
              💡 AI Panel
            </Button>
            <Button
              onClick={() => {
                setShowSearch(true);
                setActivePanel('analysis');
              }}
              variant={activePanel === 'analysis' ? 'default' : 'outline'}
              size="sm"
              className={activePanel === 'analysis' 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'border-gray-600 text-gray-300 hover:bg-gray-700'
              }
            >
              🎛️ Analysis
            </Button>
            <Button
              onClick={() => setShowAudioSettings(true)}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              🎚️ Audio
            </Button>
            {audioReady && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-green-500/20 rounded border border-green-500/30">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-xs font-semibold">REAL AUDIO</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Main Content */}
        <main className={`flex-1 p-4 transition-all duration-300 ${showSuggestions ? 'mr-80' : ''}`}>
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* BPM Sync Info */}
            {deckA.currentTrack && deckB.currentTrack && (
              <Card className="p-4 bg-gray-900 border-gray-700">
                <div className="flex items-center justify-center space-x-4">
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">BPM Sync Status</p>
                    <p className="text-white font-semibold">
                      {getBPMDifference()}
                    </p>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </Card>
            )}

            {/* Decks Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DeckController
                deck={deckA}
                onPlay={handleDeckAPlay}
                onPause={handleDeckAPlay}
                onStop={handleDeckAStop}
                onVolumeChange={handleDeckAVolumeChange}
                onPositionChange={handleDeckAPositionChange}
                onTrackLoad={(track) => handleTrackSelect(track, 'A')}
                realAudioEnabled={audioReady}
              />
              
              <DeckController
                deck={deckB}
                onPlay={handleDeckBPlay}
                onPause={handleDeckBPlay}
                onStop={handleDeckBStop}
                onVolumeChange={handleDeckBVolumeChange}
                onPositionChange={handleDeckBPositionChange}
                onTrackLoad={(track) => handleTrackSelect(track, 'B')}
                realAudioEnabled={audioReady}
              />
            </div>

            {/* Real Crossfader */}
            <RealCrossfader />

            {/* Enhanced Search Section */}
            {showSearch && (
              <Card className="p-4 bg-gray-900 border-gray-700">
                <Tabs value={activePanel} onValueChange={(value) => setActivePanel(value as any)} className="w-full">
                  <TabsList className="grid w-full grid-cols-5 bg-gray-800">
                    <TabsTrigger value="search" className="text-sm">🔍 Local Search</TabsTrigger>
                    <TabsTrigger value="upload" className="text-sm">📁 Upload Audio</TabsTrigger>
                    <TabsTrigger value="external" className="text-sm">🌐 External APIs</TabsTrigger>
                    <TabsTrigger value="analysis" className="text-sm">🎛️ AI Analysis</TabsTrigger>
                    <TabsTrigger value="ai" className="text-sm">🤖 AI Suggestions</TabsTrigger>
                  </TabsList>

                  <TabsContent value="search" className="space-y-4">
                    {/* Advanced Search Filters */}
                    <AdvancedSearchFilters
                      filters={searchState.filters}
                      onFiltersChange={updateFilters}
                      onReset={resetFilters}
                      filterOptions={filterOptions}
                    />
                    
                    {/* Search Results */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          placeholder="Search tracks, artists, genres..."
                          value={searchState.query}
                          onChange={(e) => updateQuery(e.target.value)}
                          className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                        />
                        <div className="flex items-center space-x-2 ml-3">
                          <select
                            value={searchState.sortBy}
                            onChange={(e) => updateSort(e.target.value as any)}
                            className="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                          >
                            <option value="relevance">Relevance</option>
                            <option value="bpm">BPM</option>
                            <option value="energy">Energy</option>
                            <option value="popularity">Popularity</option>
                            <option value="date">Date</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">
                          {totalResults} tracks {isFiltered && '(filtered)'}
                        </span>
                        {isFiltered && (
                          <Button
                            onClick={resetFilters}
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-white h-6 px-2"
                          >
                            Clear all filters
                          </Button>
                        )}
                      </div>

                      <SearchBar
                        tracks={searchState.results}
                        onTrackSelect={handleTrackSelect}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="upload">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-semibold">🎵 Upload Your Music</h3>
                        {uploadedTracks.length > 0 && (
                          <Badge variant="secondary" className="bg-green-500 text-white">
                            {uploadedTracks.length} uploaded
                          </Badge>
                        )}
                      </div>
                      
                      <AudioUploader onTrackUploaded={handleTrackUploaded} />
                      
                      {uploadedTracks.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-white font-medium">📚 Your Uploaded Tracks</h4>
                          <div className="max-h-64 overflow-y-auto space-y-2">
                            {uploadedTracks.map((track) => (
                              <Card 
                                key={track.id}
                                className="p-3 bg-gray-800 border-gray-700 hover:bg-gray-700 cursor-pointer transition-colors"
                                onClick={() => handleTrackSelect(track, 'A')}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h5 className="text-white font-medium text-sm">{track.title}</h5>
                                    <p className="text-gray-400 text-xs">{track.artist} • {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}</p>
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button
                                      size="sm"
                                      className="h-6 px-2 text-xs bg-blue-500 hover:bg-blue-600"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleTrackSelect(track, 'A');
                                      }}
                                    >
                                      → A
                                    </Button>
                                    <Button
                                      size="sm"
                                      className="h-6 px-2 text-xs bg-blue-500 hover:bg-blue-600"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleTrackSelect(track, 'B');
                                      }}
                                    >
                                      → B
                                    </Button>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="external">
                    <ExternalSearchBar
                      onTrackSelect={handleTrackSelect}
                      targetDeck="A"
                    />
                  </TabsContent>

                  <TabsContent value="analysis" className="space-y-4">
                    {/* Track Selection for Analysis */}
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="text-white text-sm">Analyze:</span>
                      <Button
                        onClick={() => handleAnalysisTrackSelect('A')}
                        disabled={!deckA.currentTrack}
                        size="sm"
                        variant={selectedAnalysisTrack?.id === deckA.currentTrack?.id ? 'default' : 'outline'}
                        className={selectedAnalysisTrack?.id === deckA.currentTrack?.id 
                          ? 'bg-blue-500 hover:bg-blue-600' 
                          : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                        }
                      >
                        Deck A {deckA.currentTrack && `(${deckA.currentTrack.title})`}
                      </Button>
                      <Button
                        onClick={() => handleAnalysisTrackSelect('B')}
                        disabled={!deckB.currentTrack}
                        size="sm"
                        variant={selectedAnalysisTrack?.id === deckB.currentTrack?.id ? 'default' : 'outline'}
                        className={selectedAnalysisTrack?.id === deckB.currentTrack?.id 
                          ? 'bg-blue-500 hover:bg-blue-600' 
                          : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                        }
                      >
                        Deck B {deckB.currentTrack && `(${deckB.currentTrack.title})`}
                      </Button>
                    </div>

                    <StemAnalyzer
                      track={selectedAnalysisTrack}
                      onAnalysisComplete={(features) => {
                        console.log('Analysis complete:', features);
                      }}
                    />
                  </TabsContent>

                  <TabsContent value="ai">
                    <AIRecommendations
                      currentTrack={selectedAnalysisTrack || deckA.currentTrack || deckB.currentTrack}
                      allTracks={allAvailableTracks}
                      onTrackSelect={handleTrackSelect}
                      targetDeck="B"
                    />
                  </TabsContent>
                </Tabs>
              </Card>
            )}
          </div>
        </main>

        {/* AI Suggestions Panel */}
        <div className={`fixed inset-y-0 right-0 w-96 bg-gray-900 border-l border-gray-700 transform transition-transform duration-300 ease-in-out z-50 ${showSuggestions ? 'translate-x-0' : 'translate-x-full'}`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">AI Control Center</h2>
            <Button
              onClick={() => setShowSuggestions(false)}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white h-8 w-8 p-0"
            >
              ✕
            </Button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4 h-full overflow-y-auto pb-20">
            {/* Quick Analysis */}
            <Card className="p-3 bg-gray-800 border-gray-700">
              <h4 className="text-white font-medium mb-3">Quick Analysis</h4>
              <div className="space-y-2">
                <Button
                  onClick={() => handleAnalysisTrackSelect('A')}
                  disabled={!deckA.currentTrack}
                  size="sm"
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  🎛️ Analyze Deck A
                </Button>
                <Button
                  onClick={() => handleAnalysisTrackSelect('B')}
                  disabled={!deckB.currentTrack}
                  size="sm"
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  🎛️ Analyze Deck B
                </Button>
              </div>
            </Card>

            {/* AI Recommendations Compact */}
            <AIRecommendations
              currentTrack={deckA.currentTrack || deckB.currentTrack}
              allTracks={enhancedTracks as Track[]}
              onTrackSelect={handleTrackSelect}
              targetDeck={deckA.currentTrack ? 'B' : 'A'}
              className="max-h-80"
            />

            {/* Mixing Tips */}
            <Card className="p-3 bg-gray-800 border-gray-700">
              <h4 className="text-white font-medium mb-3">🎚️ Mixing Tips</h4>
              <div className="space-y-3 text-sm">
                {deckA.currentTrack && deckB.currentTrack && (
                  <>
                    <div className="bg-gray-900 rounded p-2">
                      <div className="text-gray-400">BPM Difference</div>
                      <div className="text-white">
                        {Math.abs(deckA.currentTrack.bpm - deckB.currentTrack.bpm)} BPM 
                        {Math.abs(deckA.currentTrack.bpm - deckB.currentTrack.bpm) <= 5 
                          ? ' ✅ Perfect for mixing' 
                          : ' ⚠️ Consider tempo adjustment'
                        }
                      </div>
                    </div>
                    
                    {deckA.currentTrack.key && deckB.currentTrack.key && (
                      <div className="bg-gray-900 rounded p-2">
                        <div className="text-gray-400">Key Compatibility</div>
                        <div className="text-white">
                          {deckA.currentTrack.key} → {deckB.currentTrack.key}
                          {deckA.currentTrack.key === deckB.currentTrack.key 
                            ? ' ✅ Perfect match' 
                            : ' 🎹 Check harmonic mixing'
                          }
                        </div>
                      </div>
                    )}

                    <div className="bg-gray-900 rounded p-2">
                      <div className="text-gray-400">Energy Flow</div>
                      <div className="text-white">
                        {deckA.currentTrack.energy} → {deckB.currentTrack.energy}
                        {deckA.currentTrack.energy === deckB.currentTrack.energy 
                          ? ' ✅ Smooth energy' 
                          : ' 🌊 Energy transition'
                        }
                      </div>
                    </div>
                  </>
                )}

                {(!deckA.currentTrack || !deckB.currentTrack) && (
                  <div className="text-gray-400 text-center py-4">
                    Load tracks to both decks for mixing analysis
                  </div>
                )}
              </div>
            </Card>

            {/* Status */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-blue-400 text-sm font-medium">
                  AI System Active
                </span>
              </div>
              <p className="text-gray-400 text-xs mt-1">
                Real-time analysis and recommendations powered by Flowstate AI
              </p>
            </div>
          </div>
        </div>

        {/* Random Track Button - Fixed at Bottom */}
        <RandomTrackButton
          tracks={allAvailableTracks}
          onTrackSelect={handleTrackSelect}
        />

        {/* Audio Settings Modal */}
        <AudioSettings
          isOpen={showAudioSettings}
          onClose={() => setShowAudioSettings(false)}
        />
      </div>
    </div>
  );
};