// frontend/src/context/ThemeContext.tsx
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useColorMode } from '@chakra-ui/react'; // Para tentar sincronizar

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Tenta usar o hook do Chakra primeiro
  const chakraColorMode = useColorMode();
  const [internalTheme, setInternalTheme] = useState<Theme>('dark');

  // Determina o tema real (prioriza o do Chakra se disponível e consistente)
  const currentTheme: Theme = chakraColorMode?.colorMode === 'dark' || 
                             chakraColorMode?.colorMode === 'light' ? 
                             chakraColorMode.colorMode : internalTheme;

  // Carrega o tema inicial
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    let initialTheme: Theme = 'light';
    if (savedTheme) {
      initialTheme = savedTheme;
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      initialTheme = 'dark';
    }
    
    setInternalTheme(initialTheme);
    
    // Se o Chakra estiver disponível, tenta sincronizar
    if (chakraColorMode && chakraColorMode.setColorMode) {
       // Apenas define se for diferente para evitar loops
       if (chakraColorMode.colorMode !== initialTheme) {
         chakraColorMode.setColorMode(initialTheme);
       }
    } else {
       // Fallback: define no DOM se Chakra não estiver pronto
       document.documentElement.setAttribute('data-theme', initialTheme);
    }
  }, []); // Executa apenas uma vez na montagem

  // Atualiza o DOM e localStorage sempre que o tema interno muda
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', internalTheme);
    localStorage.setItem('theme', internalTheme);
    
    // Se o Chakra estiver disponível, tenta sincronizar
    if (chakraColorMode && chakraColorMode.setColorMode) {
       if (chakraColorMode.colorMode !== internalTheme) {
         chakraColorMode.setColorMode(internalTheme);
       }
    }
  }, [internalTheme, chakraColorMode]);

  const toggleTheme = useCallback(() => {
    setInternalTheme(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      // Se o Chakra estiver disponível, tenta sincronizar imediatamente
      if (chakraColorMode && chakraColorMode.toggleColorMode) {
        // Verifica se o Chakra já está no modo correto
        if (chakraColorMode.colorMode !== newTheme) {
            chakraColorMode.toggleColorMode();
        }
      }
      return newTheme;
    });
  }, [chakraColorMode]);

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
