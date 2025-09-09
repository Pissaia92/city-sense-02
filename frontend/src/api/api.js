const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const fetchUsers = async () => {
  try {
    const response = await fetch(`${API_URL}/api/health`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching health:', error);
    throw error;
  }
};

// Adicionar funções para os endpoints reais
export const fetchIQV = async (city) => {
  try {
    const response = await fetch(`${API_URL}/api/iqv?city=${encodeURIComponent(city)}`);
    console.log('IQV API Response:', response.status, response.statusText);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const text = await response.text();
    console.log('IQV Response text:', text);
    return JSON.parse(text);
  } catch (error) {
    console.error('Error fetching IQV:', error);
    throw error;
  }
};

export const fetchForecast = async (city) => {
  try {
    const response = await fetch(`${API_URL}/api/forecast?city=${encodeURIComponent(city)}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching forecast:', error);
    throw error;
  }
};

export const fetchSuggestions = async (query) => {
  try {
    const response = await fetch(`${API_URL}/api/suggestions?query=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    throw error;
  }
};