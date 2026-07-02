"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, ChevronDown, Search } from "lucide-react";

type SearchableOptionSelectProps = {
  options: string[];
  value?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  onSelect: (value: string) => void;
};

function displayTextFor(option: string) {
  return option.replace(/Digital Marketing/g, "AI Digital Marketing").replace(/digital marketing/g, "AI digital marketing");
}

export function SearchableOptionSelect({
  options,
  value,
  placeholder = "Search and select option",
  searchPlaceholder = "Search",
  onSelect
}: SearchableOptionSelectProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return options;
    return options.filter((option) => option.toLowerCase().includes(normalized) || displayTextFor(option).toLowerCase().includes(normalized));
  }, [options, query]);

  return (
    <div className="city-select">
      <button
        aria-expanded={isOpen}
        className={value ? "dropdown-trigger dropdown-trigger--selected" : "dropdown-trigger"}
        type="button"
        onClick={() => setIsOpen((current) => !current)}
      >
        <span>{value ? displayTextFor(value) : placeholder}</span>
        <ChevronDown size={20} />
      </button>

      {isOpen ? (
        <div className="city-dropdown-panel">
          <label className="search-field">
            <Search size={18} />
            <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder={searchPlaceholder} />
          </label>

          <div className="city-results">
            {results.map((option) => (
              <button
                className={value === option ? "city-option city-option--selected" : "city-option"}
                key={option}
                type="button"
                onClick={() => {
                  onSelect(option);
                  setQuery(displayTextFor(option));
                  setIsOpen(false);
                }}
              >
                <span>{displayTextFor(option)}</span>
                {value === option ? <CheckCircle2 size={18} /> : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
