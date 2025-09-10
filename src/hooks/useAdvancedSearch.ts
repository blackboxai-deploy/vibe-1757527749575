"use client";

import { useState, useMemo, useCallback } from 'react';
import { Track, SearchFilters, AdvancedSearchState } from '@/types';

export interface UseAdvancedSearchProps {
  tracks: Track[];
  initialFilters?: Partial<SearchFilters>;
}

export const useAdvancedSearch = ({ tracks, initialFilters = {} }: UseAdvancedSearchProps) => {
  const defaultFilters: SearchFilters = {
    bpmRange: [60, 200],
    energy: ['low', 'medium', 'high'],
    vocalType: ['instrumental', 'vocal', 'acapella', 'mixed'],
    genres: [],
    yearRange: [2020, 2024],
    key: [],
    danceabilityRange: [0, 1],
    ...initialFilters,
  };

  const [searchState, setSearchState] = useState<AdvancedSearchState>({
    query: '',
    results: tracks,
    isSearching: false,
    filters: defaultFilters,
    sortBy: 'relevance',
    sortOrder: 'desc',
    source: 'local',
  });

  // Filter tracks based on current filters
  const filteredTracks = useMemo(() => {
    let filtered = tracks;

    // Text search
    if (searchState.query.trim()) {
      const searchTerm = searchState.query.toLowerCase().trim();
      filtered = filtered.filter(track => 
        track.title.toLowerCase().includes(searchTerm) ||
        track.artist.toLowerCase().includes(searchTerm) ||
        track.genre.toLowerCase().includes(searchTerm) ||
        (track.album && track.album.toLowerCase().includes(searchTerm))
      );
    }

    // BPM Range
    filtered = filtered.filter(track => 
      track.bpm >= searchState.filters.bpmRange[0] && 
      track.bpm <= searchState.filters.bpmRange[1]
    );

    // Energy levels
    if (searchState.filters.energy.length < 3) {
      filtered = filtered.filter(track => 
        searchState.filters.energy.includes(track.energy)
      );
    }

    // Vocal types
    if (searchState.filters.vocalType.length < 4) {
      filtered = filtered.filter(track => 
        searchState.filters.vocalType.includes(track.vocalType)
      );
    }

    // Genres
    if (searchState.filters.genres.length > 0) {
      filtered = filtered.filter(track => 
        searchState.filters.genres.includes(track.genre)
      );
    }

    // Year range
    if (searchState.filters.yearRange) {
      filtered = filtered.filter(track => 
        track.year && 
        track.year >= searchState.filters.yearRange![0] && 
        track.year <= searchState.filters.yearRange![1]
      );
    }

    // Key filter
    if (searchState.filters.key && searchState.filters.key.length > 0) {
      filtered = filtered.filter(track => 
        track.key && searchState.filters.key!.includes(track.key)
      );
    }

    // Danceability range
    if (searchState.filters.danceabilityRange) {
      filtered = filtered.filter(track => 
        track.danceability !== undefined &&
        track.danceability >= searchState.filters.danceabilityRange![0] && 
        track.danceability <= searchState.filters.danceabilityRange![1]
      );
    }

    return filtered;
  }, [tracks, searchState.query, searchState.filters]);

  // Sort tracks
  const sortedTracks = useMemo(() => {
    const sorted = [...filteredTracks];

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (searchState.sortBy) {
        case 'bpm':
          comparison = a.bpm - b.bpm;
          break;
        case 'energy':
          const energyOrder = { 'low': 0, 'medium': 1, 'high': 2 };
          comparison = energyOrder[a.energy] - energyOrder[b.energy];
          break;
        case 'popularity':
          comparison = (a.danceability || 0) - (b.danceability || 0);
          break;
        case 'date':
          comparison = (a.year || 0) - (b.year || 0);
          break;
        case 'relevance':
        default:
          // Relevance based on query match quality
          if (searchState.query.trim()) {
            const aScore = getRelevanceScore(a, searchState.query);
            const bScore = getRelevanceScore(b, searchState.query);
            comparison = bScore - aScore;
          } else {
            comparison = a.title.localeCompare(b.title);
          }
          break;
      }

      return searchState.sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [filteredTracks, searchState.sortBy, searchState.sortOrder, searchState.query]);

  // Update search query
  const updateQuery = useCallback((query: string) => {
    setSearchState(prev => ({
      ...prev,
      query,
      results: sortedTracks,
    }));
  }, [sortedTracks]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setSearchState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters },
      results: sortedTracks,
    }));
  }, [sortedTracks]);

  // Update sorting
  const updateSort = useCallback((sortBy: AdvancedSearchState['sortBy'], sortOrder?: AdvancedSearchState['sortOrder']) => {
    setSearchState(prev => ({
      ...prev,
      sortBy,
      sortOrder: sortOrder || prev.sortOrder,
      results: sortedTracks,
    }));
  }, [sortedTracks]);

  // Reset filters
  const resetFilters = useCallback(() => {
    setSearchState(prev => ({
      ...prev,
      filters: defaultFilters,
      query: '',
      results: tracks,
    }));
  }, [tracks, defaultFilters]);

  // Get available filter options
  const getFilterOptions = useMemo(() => {
    const genres = [...new Set(tracks.map(t => t.genre))].sort();
    const keys = [...new Set(tracks.map(t => t.key).filter(Boolean))].sort() as string[];
    const yearRange: [number, number] = [
      Math.min(...tracks.map(t => t.year || 2020)),
      Math.max(...tracks.map(t => t.year || 2024))
    ];
    const bpmRange: [number, number] = [
      Math.min(...tracks.map(t => t.bpm)),
      Math.max(...tracks.map(t => t.bpm))
    ];

    return {
      genres,
      keys,
      yearRange,
      bpmRange,
    };
  }, [tracks]);

  return {
    searchState: {
      ...searchState,
      results: sortedTracks,
    },
    updateQuery,
    updateFilters,
    updateSort,
    resetFilters,
    filterOptions: getFilterOptions,
    totalResults: sortedTracks.length,
    isFiltered: searchState.query.trim() !== '' || 
                JSON.stringify(searchState.filters) !== JSON.stringify(defaultFilters),
  };
};

// Helper function to calculate relevance score
function getRelevanceScore(track: Track, query: string): number {
  const searchTerm = query.toLowerCase().trim();
  let score = 0;

  // Exact matches get highest score
  if (track.title.toLowerCase() === searchTerm) score += 10;
  if (track.artist.toLowerCase() === searchTerm) score += 8;
  if (track.genre.toLowerCase() === searchTerm) score += 6;
  if (track.album?.toLowerCase() === searchTerm) score += 4;

  // Partial matches get lower scores
  if (track.title.toLowerCase().includes(searchTerm)) score += 5;
  if (track.artist.toLowerCase().includes(searchTerm)) score += 4;
  if (track.genre.toLowerCase().includes(searchTerm)) score += 3;
  if (track.album?.toLowerCase().includes(searchTerm)) score += 2;

  // Boost score for popular tracks
  if (track.danceability && track.danceability > 0.8) score += 2;
  if (track.energy === 'high') score += 1;

  return score;
}