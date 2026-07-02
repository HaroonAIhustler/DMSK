"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, ChevronDown, GraduationCap, Search } from "lucide-react";
import { fieldStudyGroups } from "@/data/fieldStudyGroups";

type FieldStudySelectProps = {
  value?: string;
  onSelect: (value: string) => void;
};

function groupForValue(value?: string) {
  if (!value) return "";
  return fieldStudyGroups.find((group) => group.options.includes(value))?.group ?? "";
}

export function FieldStudySelect({ value, onSelect }: FieldStudySelectProps) {
  const [selectedGroup, setSelectedGroup] = useState(groupForValue(value));
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const [isFieldOpen, setIsFieldOpen] = useState(false);
  const [query, setQuery] = useState("");
  const activeGroup = fieldStudyGroups.find((group) => group.group === selectedGroup);
  const fieldOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const options = activeGroup?.options ?? [];
    if (!normalized) return options;
    return options.filter((option) => option.toLowerCase().includes(normalized));
  }, [activeGroup, query]);

  return (
    <div className="field-study-select">
      <div className="city-select">
        <button
          aria-expanded={isGroupOpen}
          className={selectedGroup ? "dropdown-trigger dropdown-trigger--selected" : "dropdown-trigger"}
          type="button"
          onClick={() => setIsGroupOpen((current) => !current)}
        >
          <span>{selectedGroup || "Select main field"}</span>
          <ChevronDown size={20} />
        </button>

        {isGroupOpen ? (
          <div className="city-dropdown-panel">
            <div className="city-results">
              {fieldStudyGroups.map((group) => (
                <button
                  className={selectedGroup === group.group ? "city-option city-option--selected" : "city-option"}
                  key={group.group}
                  type="button"
                  onClick={() => {
                    setSelectedGroup(group.group);
                    setIsGroupOpen(false);
                    setIsFieldOpen(true);
                    setQuery("");
                  }}
                >
                  <span>
                    <GraduationCap size={17} />
                    {group.group}
                  </span>
                  {selectedGroup === group.group ? <CheckCircle2 size={18} /> : null}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="city-select">
        <button
          aria-expanded={isFieldOpen}
          className={value ? "dropdown-trigger dropdown-trigger--selected" : "dropdown-trigger"}
          disabled={!selectedGroup}
          type="button"
          onClick={() => setIsFieldOpen((current) => !current)}
        >
          <span>{value || "Search and select field of study"}</span>
          <ChevronDown size={20} />
        </button>

        {isFieldOpen && activeGroup ? (
          <div className="city-dropdown-panel">
            <label className="search-field">
              <Search size={18} />
              <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search course, e.g. BBA" />
            </label>

            <div className="city-results">
              {fieldOptions.map((option) => (
                <button
                  className={value === option ? "city-option city-option--selected" : "city-option"}
                  key={option}
                  type="button"
                  onClick={() => {
                    onSelect(option);
                    setQuery(option);
                    setIsFieldOpen(false);
                  }}
                >
                  <span>
                    <GraduationCap size={17} />
                    {option}
                  </span>
                  {value === option ? <CheckCircle2 size={18} /> : null}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
