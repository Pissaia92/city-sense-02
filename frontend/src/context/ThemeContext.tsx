import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useColorMode } from '@chakra-ui/react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const chakraColorMode = useColorMode();
  const [internalTheme, setInternalTheme] = useState<Theme>('dark');
  const currentTheme: Theme = chakraColorMode?.colorMode === 'dark' || 
                              chakraColorMode?.colorMode === 'light' ? 
                              chakraColorMode.colorMode : internalTheme;

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    let initialTheme: Theme = 'light';
    if (savedTheme) {
      initialTheme = savedTheme;
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      initialTheme = 'dark';
    }
    
    setInternalTheme(initialTheme);
    
    if (chakraColorMode && chakraColorMode.setColorMode) {
       if (chakraColorMode.colorMode !== initialTheme) {
         chakraColorMode.setColorMode(initialTheme);
       }
    } else {
       document.documentElement.setAttribute('data-theme', initialTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', internalTheme);
    localStorage.setItem('theme', internalTheme);
    
    if (chakraColorMode && chakraColorMode.setColorMode) {
       if (chakraColorMode.colorMode !== internalTheme) {
         chakraColorMode.setColorMode(internalTheme);
       }
    }
  }, [internalTheme, chakraColorMode]);

  const toggleTheme = useCallback(() => {
    setInternalTheme(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      if (chakraColorMode && chakraColorMode.toggleColorMode) {
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
