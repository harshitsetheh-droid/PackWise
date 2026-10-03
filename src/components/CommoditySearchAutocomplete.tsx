import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, ChevronDown, Check } from 'lucide-react';
import { Commodity } from '../types/packaging';
import { COMMODITIES_DATABASE } from '../data/commodities';
import { useDebounce } from '../hooks/useDebounce';
import { VoiceInputButton } from './VoiceInputButton';

interface CommoditySearchAutocompleteProps {
  selectedCommodityName: string;
  onSelectCommodity: (commodity: Commodity) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export const CommoditySearchAutocomplete: React.FC<CommoditySearchAutocompleteProps> = ({
  selectedCommodityName,
  onSelectCommodity,
  placeholder = 'Type food name...',
  label,
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState<string>(selectedCommodityName);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync internal search term when parent changes selection
  useEffect(() => {
    setSearchTerm(selectedCommodityName);
  }, [selectedCommodityName]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce search term by 150ms for optimal keystroke performance
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 150);

  // Filter suggestions dynamically using debounced query
  const filteredSuggestions = useMemo(() => {
    const query = debouncedSearchTerm.trim().toLowerCase();
    if (!query) return COMMODITIES_DATABASE;

    return COMMODITIES_DATABASE.filter((comm) => {
      const nameMatch = comm.name.toLowerCase().includes(query);
      const categoryMatch = comm.category.toLowerCase().includes(query);
      const spoilageMatch = comm.primary_spoilage_factors.some((factor) =>
        factor.toLowerCase().includes(query)
      );
      return nameMatch || categoryMatch || spoilageMatch;
    });
  }, [debouncedSearchTerm]);

  const handleSelect = (comm: Commodity) => {
    setSearchTerm(comm.name);
    onSelectCommodity(comm);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchTerm('');
    setIsOpen(true);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="text-xs font-bold text-slate-700 block mb-1">
          {label}
        </label>
      )}

      {/* Search Input Box */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-emerald-800 absolute left-3 pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsOpen(false);
            } else if (e.key === 'Enter' && filteredSuggestions.length > 0) {
              e.preventDefault();
              handleSelect(filteredSuggestions[0]);
            }
          }}
          placeholder={placeholder}
          className="w-full text-xs font-bold pl-9 pr-20 py-2.5 rounded-xl bg-white hover:bg-slate-50 focus:bg-white text-slate-900 border border-[#e1e7dc] focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 shadow-2xs transition-all placeholder:text-slate-400 placeholder:font-normal"
        />

        <div className="absolute right-2 flex items-center gap-1">
          <VoiceInputButton
            onTranscript={(text) => {
              setSearchTerm(text);
              setIsOpen(true);
            }}
            size="sm"
            tooltip="Speak food commodity name"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="p-1 rounded-md text-emerald-900 bg-emerald-100 hover:bg-emerald-200 transition-colors"
            title="Toggle suggestions list"
          >
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Autocomplete Suggestions Dropdown - Spacious layout with no crowding */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-80 sm:w-[420px] max-w-[92vw] bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-80 flex flex-col animate-in fade-in zoom-in-95 duration-100">
          {/* Header */}
          <div className="bg-slate-50 px-3.5 py-2 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-semibold text-slate-700">
              {filteredSuggestions.length > 0
                ? `Matching "${searchTerm || 'All'}" (${filteredSuggestions.length} found)`
                : `No foods matching "${searchTerm}"`}
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Click to select
            </span>
          </div>

          {/* List */}
          <div className="overflow-y-auto divide-y divide-slate-100 flex-1">
            {filteredSuggestions.map((comm) => {
              const isSelected =
                selectedCommodityName.toLowerCase() === comm.name.toLowerCase();

              return (
                <button
                  type="button"
                  key={comm.id}
                  onClick={() => handleSelect(comm)}
                  className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between gap-3 hover:bg-emerald-50/70 transition-colors group cursor-pointer ${
                    isSelected ? 'bg-emerald-50/90' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 shadow-2xs flex items-center justify-center text-base shrink-0 group-hover:scale-105 transition-transform">
                      {comm.icon || '🍏'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-950 truncate">
                          {comm.name}
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full shrink-0 font-medium">
                          {comm.category}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5 truncate">
                        <span>Moisture: {comm.moisture_percent}%</span>
                        <span className="text-slate-300">•</span>
                        <span>pH: {comm.pH}</span>
                        <span className="text-slate-300">•</span>
                        <span>Resp: {comm.respiration_rate}</span>
                        <span className="text-slate-300">•</span>
                        <span>{comm.typical_shelf_life_days}d shelf</span>
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-300">
                      <Check className="w-3 h-3 text-emerald-700" />
                      <span>Active</span>
                    </div>
                  )}
                </button>
              );
            })}

            {filteredSuggestions.length === 0 && (
              <div className="p-5 text-center text-xs text-slate-500">
                <p className="font-semibold text-slate-700">No commodity found for "{searchTerm}"</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Try typing standard names like "Apple", "Potato", "Rice", "Paneer", "Milk"
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
