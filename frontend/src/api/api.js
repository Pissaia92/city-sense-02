// Check if environment variable is defined, otherwise use default value for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';

/**
 * Fetches IQV forecast for a specific city.
 * @param {string} city - City name.
 * @returns {Promise<Object>} IQV forecast data.
 */
export const fetchIQVData = async (city) => {
  // Encode city name for URL
  const encodedCity = encodeURIComponent(city);
  const url = `${API_BASE_URL}/api/predict/iqv?city=${encodedCity}`;
  
  try {
    const response = await fetch(url);
    
    // Check if response is OK (status 200-299)
    if (!response.ok) {
      // Try to read response body for more detailed error message
      let errorMessage = `HTTP Error: ${response.status} - ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMessage = errorData.detail;
        }
      } catch (e) {
        // If unable to parse JSON, use status text
        console.warn("Could not parse error body:", e);
      }
      throw new Error(errorMessage);
    }

    // Try to parse response as JSON
    const data = await response.json();
    return data;
    
  } catch (error) {
    // Handle network errors or other unexpected errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Failed to connect to server. Please check if backend is running.');
    }
    // Re-throw other errors
    throw error;
  }
};

/**
 * Checks API health.
 * @returns {Promise<Object>} API status.
 */
export const fetchHealthCheck = async () => {
  const response = await fetch(`${API_BASE_URL}/api/health`);
  if (!response.ok) {
    throw new Error(`Error checking API health: ${response.status}`);
  }
  return await response.json();
};