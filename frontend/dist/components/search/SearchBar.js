import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
const SearchBar = ({ inputCity, showSuggestions, suggestedCities, setInputCity, setShowSuggestions, handleSearch, handleCitySelect, isSearching, darkMode, searchRef, onSelectSuggestion }) => {
    return (_jsxs("form", { onSubmit: handleSearch, style: { marginBottom: '24px' }, children: [_jsxs("div", { ref: searchRef, style: { position: 'relative' }, children: [_jsx("input", { type: "text", value: inputCity, onChange: (e) => {
                            setInputCity(e.target.value);
                        }, placeholder: "Digite o nome da cidade", style: {
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                            backgroundColor: darkMode ? '#334155' : '#f1f5f9',
                            color: darkMode ? '#e2e8f0' : '#1e293b',
                            width: '100%'
                        } }), showSuggestions && suggestedCities.length > 0 && (_jsx("div", { style: {
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            backgroundColor: darkMode ? '#1e293b' : 'white',
                            border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                            borderRadius: '6px',
                            maxHeight: '200px',
                            overflowY: 'auto',
                            zIndex: 1000,
                            marginTop: '4px'
                        }, children: suggestedCities.map((suggestion, index) => (_jsx("div", { onClick: () => {
                                setInputCity(suggestion);
                                setShowSuggestions(false);
                                if (onSelectSuggestion) {
                                    onSelectSuggestion(suggestion);
                                }
                                else {
                                    handleCitySelect(suggestion);
                                }
                            }, style: {
                                padding: '8px 12px',
                                cursor: 'pointer',
                                borderBottom: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                                color: darkMode ? '#e2e8f0' : '#1e293b'
                            }, children: suggestion }, index))) }))] }), _jsx("button", { type: "submit", disabled: isSearching, style: {
                    padding: '10px 20px',
                    backgroundColor: darkMode ? '#3b82f6' : '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: isSearching ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    marginLeft: '8px'
                }, children: isSearching ? 'Buscando...' : 'Buscar' })] }));
};
export { SearchBar };
//# sourceMappingURL=SearchBar.js.map