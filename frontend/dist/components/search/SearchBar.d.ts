import React from 'react';
interface SearchBarProps {
    inputCity: string;
    showSuggestions: boolean;
    suggestedCities: string[];
    setInputCity: React.Dispatch<React.SetStateAction<string>>;
    setShowSuggestions: React.Dispatch<React.SetStateAction<boolean>>;
    handleSearch: (e: React.FormEvent) => void;
    handleCitySelect: (city: string) => void;
    isSearching: boolean;
    darkMode: boolean;
    searchRef?: React.RefObject<HTMLDivElement>;
    onSelectSuggestion?: (suggestion: string) => void;
}
declare const SearchBar: React.FC<SearchBarProps>;
export { SearchBar };
//# sourceMappingURL=SearchBar.d.ts.map