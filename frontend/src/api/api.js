// Verifica se a variável de ambiente está definida, senão usa um valor padrão para desenvolvimento
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Busca a previsão de IQV para uma cidade específica.
 * @param {string} city - Nome da cidade.
 * @returns {Promise<Object>} Dados da previsão de IQV.
 */
export const fetchIQVData = async (city) => {
  // Codifica o nome da cidade para URL
  const encodedCity = encodeURIComponent(city);
  const url = `${API_URL}/api/predict/iqv?city=${encodedCity}`;
  
  try {
    const response = await fetch(url);
    
    // Verifica se a resposta é OK (status 200-299)
    if (!response.ok) {
      // Tenta ler o corpo da resposta para obter uma mensagem de erro mais detalhada
      let errorMessage = `Erro HTTP: ${response.status} - ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMessage = errorData.detail;
        }
      } catch (e) {
        // Se não conseguir parsear o JSON, usa o status text
        console.warn("Não foi possível parsear o corpo do erro:", e);
      }
      throw new Error(errorMessage);
    }

    // Tenta parsear a resposta como JSON
    const data = await response.json();
    return data;
    
  } catch (error) {
    // Trata erros de rede ou outros erros inesperados
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Falha na conexão com o servidor. Verifique se o backend está rodando.');
    }
    // Re-lança outros erros
    throw error;
  }
};

/**
 * Verifica a saúde da API.
 * @returns {Promise<Object>} Status da API.
 */
export const fetchHealthCheck = async () => {
  const response = await fetch(`${API_URL}/api/health`);
  if (!response.ok) {
    throw new Error(`Erro ao verificar saúde da API: ${response.status}`);
  }
  return await response.json();
};