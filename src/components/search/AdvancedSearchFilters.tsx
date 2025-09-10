"use client";

import React from 'react';
import { SearchFilters } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';


interface AdvancedSearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: Partial<SearchFilters>) => void;
  onReset: () => void;
  filterOptions: {
    genres: string[];
    keys: string[];
    yearRange: [number, number];
    bpmRange: [number, number];
  };
  className?: string;
}

export const AdvancedSearchFilters: React.FC<AdvancedSearchFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
  filterOptions,
  className = "",
}) => {
  const energyOptions = [
    { value: 'low', label: 'Low Energy', color: 'bg-blue-500' },
    { value: 'medium', label: 'Medium Energy', color: 'bg-yellow-500' },
    { value: 'high', label: 'High Energy', color: 'bg-red-500' },
  ] as const;

  const vocalOptions = [
    { value: 'instrumental', label: 'Instrumental', icon: '🎵' },
    { value: 'vocal', label: 'Vocal', icon: '🎤' },
    { value: 'acapella', label: 'Acapella', icon: '🗣️' },
    { value: 'mixed', label: 'Mixed', icon: '🎼' },
  ] as const;

  const handleEnergyChange = (energy: 'low' | 'medium' | 'high', checked: boolean) => {
    const newEnergy = checked 
      ? [...filters.energy, energy]
      : filters.energy.filter(e => e !== energy);
    onFiltersChange({ energy: newEnergy });
  };

  const handleVocalTypeChange = (vocalType: 'instrumental' | 'vocal' | 'acapella' | 'mixed', checked: boolean) => {
    const newVocalType = checked 
      ? [...filters.vocalType, vocalType]
      : filters.vocalType.filter(v => v !== vocalType);
    onFiltersChange({ vocalType: newVocalType });
  };

  const handleGenreToggle = (genre: string) => {
    const newGenres = filters.genres.includes(genre)
      ? filters.genres.filter(g => g !== genre)
      : [...filters.genres, genre];
    onFiltersChange({ genres: newGenres });
  };

  const handleKeyToggle = (key: string) => {
    const newKeys = filters.key?.includes(key)
      ? filters.key.filter(k => k !== key)
      : [...(filters.key || []), key];
    onFiltersChange({ key: newKeys });
  };

  return (
    <Card className={`p-4 bg-gray-900 border-gray-700 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Advanced Filters</h3>
        <Button
          onClick={onReset}
          variant="outline"
          size="sm"
          className="border-gray-600 text-gray-300 hover:bg-gray-700 h-8 px-3"
        >
          Reset All
        </Button>
      </div>

      {/* BPM Range */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-white text-sm font-medium">BPM Range</label>
          <span className="text-gray-400 text-sm">
            {filters.bpmRange[0]} - {filters.bpmRange[1]} BPM
          </span>
        </div>
        <Slider
          value={filters.bpmRange}
          onValueChange={(value) => onFiltersChange({ bpmRange: value as [number, number] })}
          min={filterOptions.bpmRange[0]}
          max={filterOptions.bpmRange[1]}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>{filterOptions.bpmRange[0]}</span>
          <span>{filterOptions.bpmRange[1]}</span>
        </div>
      </div>

      {/* Energy Levels */}
      <div className="space-y-3">
        <label className="text-white text-sm font-medium">Energy Levels</label>
        <div className="grid grid-cols-3 gap-2">
          {energyOptions.map(({ value, label, color }) => (
            <div key={value} className="flex items-center space-x-2">
              <Checkbox
                id={`energy-${value}`}
                checked={filters.energy.includes(value)}
                onCheckedChange={(checked) => handleEnergyChange(value, checked as boolean)}
              />
              <label 
                htmlFor={`energy-${value}`}
                className="text-sm text-gray-300 cursor-pointer flex items-center space-x-1"
              >
                <div className={`w-2 h-2 rounded-full ${color}`}></div>
                <span>{label}</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Vocal Types */}
      <div className="space-y-3">
        <label className="text-white text-sm font-medium">Vocal Types</label>
        <div className="grid grid-cols-2 gap-2">
          {vocalOptions.map(({ value, label, icon }) => (
            <div key={value} className="flex items-center space-x-2">
              <Checkbox
                id={`vocal-${value}`}
                checked={filters.vocalType.includes(value)}
                onCheckedChange={(checked) => handleVocalTypeChange(value, checked as boolean)}
              />
              <label 
                htmlFor={`vocal-${value}`}
                className="text-sm text-gray-300 cursor-pointer flex items-center space-x-1"
              >
                <span>{icon}</span>
                <span>{label}</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Genres */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-white text-sm font-medium">Genres</label>
          {filters.genres.length > 0 && (
            <Button
              onClick={() => onFiltersChange({ genres: [] })}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white h-6 px-2 text-xs"
            >
              Clear ({filters.genres.length})
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
          {filterOptions.genres.map((genre) => (
            <Badge
              key={genre}
              variant={filters.genres.includes(genre) ? "default" : "outline"}
              className={`cursor-pointer text-xs ${
                filters.genres.includes(genre)
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'border-gray-600 text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => handleGenreToggle(genre)}
            >
              {genre}
            </Badge>
          ))}
        </div>
      </div>

      {/* Musical Keys */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-white text-sm font-medium">Musical Keys</label>
          {filters.key && filters.key.length > 0 && (
            <Button
              onClick={() => onFiltersChange({ key: [] })}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white h-6 px-2 text-xs"
            >
              Clear ({filters.key.length})
            </Button>
          )}
        </div>
        <div className="grid grid-cols-6 gap-1">
          {filterOptions.keys.map((key) => (
            <Badge
              key={key}
              variant={filters.key?.includes(key) ? "default" : "outline"}
              className={`cursor-pointer text-xs justify-center ${
                filters.key?.includes(key)
                  ? 'bg-purple-500 hover:bg-purple-600 text-white'
                  : 'border-gray-600 text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => handleKeyToggle(key)}
            >
              {key}
            </Badge>
          ))}
        </div>
      </div>

      {/* Danceability Range */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-white text-sm font-medium">Danceability</label>
          <span className="text-gray-400 text-sm">
            {Math.round(filters.danceabilityRange![0] * 100)}% - {Math.round(filters.danceabilityRange![1] * 100)}%
          </span>
        </div>
        <Slider
          value={filters.danceabilityRange}
          onValueChange={(value) => onFiltersChange({ danceabilityRange: value as [number, number] })}
          min={0}
          max={1}
          step={0.1}
          className="w-full"
        />
      </div>

      {/* Year Range */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-white text-sm font-medium">Year Range</label>
          <span className="text-gray-400 text-sm">
            {filters.yearRange![0]} - {filters.yearRange![1]}
          </span>
        </div>
        <Slider
          value={filters.yearRange}
          onValueChange={(value) => onFiltersChange({ yearRange: value as [number, number] })}
          min={filterOptions.yearRange[0]}
          max={filterOptions.yearRange[1]}
          step={1}
          className="w-full"
        />
      </div>

      {/* Active Filters Summary */}
      {(filters.genres.length > 0 || (filters.key && filters.key.length > 0) || 
        filters.energy.length < 3 || filters.vocalType.length < 4) && (
        <div className="pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white text-sm font-medium">Active Filters</span>
            <span className="text-gray-400 text-xs">
              {filters.genres.length + (filters.key?.length || 0) + 
               (3 - filters.energy.length) + (4 - filters.vocalType.length)} filters
            </span>
          </div>
          <div className="text-xs text-gray-400 space-y-1">
            {filters.genres.length > 0 && (
              <div>Genres: {filters.genres.join(', ')}</div>
            )}
            {filters.key && filters.key.length > 0 && (
              <div>Keys: {filters.key.join(', ')}</div>
            )}
            {filters.energy.length < 3 && (
              <div>Energy: {filters.energy.join(', ')}</div>
            )}
            {filters.vocalType.length < 4 && (
              <div>Vocal: {filters.vocalType.join(', ')}</div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};