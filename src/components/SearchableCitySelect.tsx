"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, ChevronDown, MapPin, Search } from "lucide-react";
import { searchCities } from "@/lib/calculator";

type SearchableCitySelectProps = {
  selectedCity?: string;
  state?: string;
  onSelect: (city: string, state: string) => void;
};

export function SearchableCitySelect({ selectedCity, state, onSelect }: SearchableCitySelectProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const displayValue = selectedCity && state ? `${selectedCity}, ${state}` : "Search and select city";
  const results = useMemo(() => searchCities(query), [query]);

  return (
    <div className="city-select">
      <button
        aria-expanded={isOpen}
        className={selectedCity ? "dropdown-trigger dropdown-trigger--selected" : "dropdown-trigger"}
        type="button"
        onClick={() => setIsOpen((current) => !current)}
      >
        <span>{displayValue}</span>
        <ChevronDown size={20} />
      </button>

      {isOpen ? (
        <div className="city-dropdown-panel">
          <label className="search-field">
            <Search size={18} />
            <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search city, e.g. Bengaluru" />
          </label>

          <div className="city-results">
            {results.map((option) => (
              <button
                className={selectedCity === option.city && state === option.state ? "city-option city-option--selected" : "city-option"}
                key={`${option.city}-${option.state}`}
                type="button"
                onClick={() => {
                  onSelect(option.city, option.state);
                  setQuery(`${option.city}, ${option.state}`);
                  setIsOpen(false);
                }}
              >
                <span>
                  <MapPin size={17} />
                  {option.city}, {option.state}
                </span>
                {selectedCity === option.city && state === option.state ? <CheckCircle2 size={18} /> : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
