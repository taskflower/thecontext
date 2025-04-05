/**
 * Theme System
 * Provides a unified theming mechanism to replace multiple template sets
 */
import React, { createContext, useContext, useMemo } from 'react';

/**
 * Available theme variants
 */
export type ThemeVariant = 'default' | 'alternative' | 'bigballs' | 'elearning';

/**
 * Theme component types
 */
export type ThemeComponentType = 
  | 'assistantMessage'
  | 'userInput'
  | 'header'
  | 'navigationButtons'
  | 'contextUpdateInfo';

/**
 * Base styles for a theme component
 */
export interface ThemeComponentStyles {
  container?: React.CSSProperties;
  header?: React.CSSProperties;
  content?: React.CSSProperties;
  icon?: React.CSSProperties;
  label?: React.CSSProperties;
  input?: React.CSSProperties;
  button?: React.CSSProperties;
  primary?: React.CSSProperties;
  secondary?: React.CSSProperties;
}

/**
 * Complete theme definition
 */
export interface Theme {
  name: ThemeVariant;
  description: string;
  components: Record<ThemeComponentType, ThemeComponentStyles>;
  variables: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
    borderRadius: string;
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
  };
}

/**
 * Theme context
 */
interface ThemeContextType {
  currentTheme: ThemeVariant;
  setTheme: (theme: ThemeVariant) => void;
  getStyles: (component: ThemeComponentType) => ThemeComponentStyles;
}

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: 'default',
  setTheme: () => {},
  getStyles: () => ({}),
});

/**
 * Theme definitions
 */
const themes: Record<ThemeVariant, Theme> = {
  default: {
    name: 'default',
    description: 'Clean, professional design',
    components: {
      assistantMessage: {
        container: {
          padding: '16px',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          margin: '12px 0'
        },
        header: {
          display: 'flex',
          alignItems: 'center',
          marginBottom: '8px'
        },
        content: {
          lineHeight: '1.6'
        },
        icon: {
          marginRight: '8px',
          color: '#6366f1'
        }
      },
      userInput: {
        container: {
          padding: '16px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          margin: '12px 0'
        },
        input: {
          width: '100%',
          padding: '12px',
          borderRadius: '6px',
          border: '1px solid #e2e8f0'
        },
        button: {
          padding: '8px 16px',
          backgroundColor: '#6366f1',
          color: '#fff',
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer'
        }
      },
      header: {
        container: {
          padding: '16px',
          backgroundColor: '#fff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        },
        label: {
          fontWeight: 'bold',
          fontSize: '16px'
        }
      },
      navigationButtons: {
        container: {
          display: 'flex',
          justifyContent: 'space-between',
          margin: '16px 0'
        },
        button: {
          padding: '8px 16px',
          backgroundColor: '#6366f1',
          color: '#fff',
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer'
        }
      },
      contextUpdateInfo: {
        container: {
          padding: '12px',
          backgroundColor: '#eef2ff',
          borderRadius: '6px',
          margin: '12px 0',
          fontSize: '14px'
        },
        label: {
          fontWeight: 'bold',
          marginRight: '8px'
        }
      }
    },
    variables: {
      primaryColor: '#6366f1',
      secondaryColor: '#8b5cf6',
      backgroundColor: '#ffffff',
      textColor: '#333333',
      fontFamily: 'sans-serif',
      borderRadius: '8px',
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px'
      }
    }
  },
  
  alternative: {
    name: 'alternative',
    description: 'Dark mode design',
    components: {
      assistantMessage: {
        container: {
          padding: '16px',
          backgroundColor: '#2d3748',
          borderRadius: '8px',
          margin: '12px 0',
          color: '#f7fafc'
        },
        header: {
          display: 'flex',
          alignItems: 'center',
          marginBottom: '8px'
        },
        content: {
          lineHeight: '1.6'
        },
        icon: {
          marginRight: '8px',
          color: '#90cdf4'
        }
      },
      userInput: {
        container: {
          padding: '16px',
          backgroundColor: '#1a202c',
          borderRadius: '8px',
          border: '1px solid #4a5568',
          margin: '12px 0'
        },
        input: {
          width: '100%',
          padding: '12px',
          borderRadius: '6px',
          border: '1px solid #4a5568',
          backgroundColor: '#2d3748',
          color: '#f7fafc'
        },
        button: {
          padding: '8px 16px',
          backgroundColor: '#90cdf4',
          color: '#1a202c',
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer'
        }
      },
      header: {
        container: {
          padding: '16px',
          backgroundColor: '#1a202c',
          borderBottom: '1px solid #4a5568',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#f7fafc'
        },
        label: {
          fontWeight: 'bold',
          fontSize: '16px'
        }
      },
      navigationButtons: {
        container: {
          display: 'flex',
          justifyContent: 'space-between',
          margin: '16px 0'
        },
        button: {
          padding: '8px 16px',
          backgroundColor: '#90cdf4',
          color: '#1a202c',
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer'
        }
      },
      contextUpdateInfo: {
        container: {
          padding: '12px',
          backgroundColor: '#2c5282',
          borderRadius: '6px',
          margin: '12px 0',
          fontSize: '14px',
          color: '#ebf8ff'
        },
        label: {
          fontWeight: 'bold',
          marginRight: '8px'
        }
      }
    },
    variables: {
      primaryColor: '#90cdf4',
      secondaryColor: '#63b3ed',
      backgroundColor: '#1a202c',
      textColor: '#f7fafc',
      fontFamily: 'sans-serif',
      borderRadius: '8px',
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px'
      }
    }
  },
  
  bigballs: {
    name: 'bigballs',
    description: 'Playful, rounded design',
    components: {
      assistantMessage: {
        container: {
          padding: '20px',
          backgroundColor: '#ebf8ff',
          borderRadius: '20px',
          margin: '16px 0',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        },
        header: {
          display: 'flex',
          alignItems: 'center',
          marginBottom: '12px'
        },
        content: {
          lineHeight: '1.7',
          fontSize: '16px'
        },
        icon: {
          marginRight: '12px',
          color: '#3182ce',
          fontSize: '24px'
        }
      },
      userInput: {
        container: {
          padding: '20px',
          backgroundColor: '#fff',
          borderRadius: '20px',
          border: '2px solid #bee3f8',
          margin: '16px 0',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        },
        input: {
          width: '100%',
          padding: '16px',
          borderRadius: '16px',
          border: '2px solid #bee3f8',
          fontSize: '16px'
        },
        button: {
          padding: '12px 24px',
          backgroundColor: '#3182ce',
          color: '#fff',
          borderRadius: '20px',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '16px'
        }
      },
      header: {
        container: {
          padding: '20px',
          backgroundColor: '#fff',
          borderBottom: '2px solid #bee3f8',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: '20px 20px 0 0',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
        },
        label: {
          fontWeight: 'bold',
          fontSize: '20px',
          color: '#3182ce'
        }
      },
      navigationButtons: {
        container: {
          display: 'flex',
          justifyContent: 'space-between',
          margin: '20px 0'
        },
        button: {
          padding: '12px 24px',
          backgroundColor: '#3182ce',
          color: '#fff',
          borderRadius: '20px',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '16px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }
      },
      contextUpdateInfo: {
        container: {
          padding: '16px',
          backgroundColor: '#ebf8ff',
          borderRadius: '16px',
          margin: '16px 0',
          fontSize: '16px',
          border: '2px solid #bee3f8'
        },
        label: {
          fontWeight: 'bold',
          marginRight: '8px',
          color: '#3182ce'
        }
      }
    },
    variables: {
      primaryColor: '#3182ce',
      secondaryColor: '#4299e1',
      backgroundColor: '#ffffff',
      textColor: '#2d3748',
      fontFamily: 'system-ui, sans-serif',
      borderRadius: '20px',
      spacing: {
        xs: '6px',
        sm: '12px',
        md: '20px',
        lg: '28px',
        xl: '36px'
      }
    }
  },
  
  elearning: {
    name: 'elearning',
    description: 'Educational theme',
    components: {
      assistantMessage: {
        container: {
          padding: '16px',
          backgroundColor: '#f0fff4',
          borderRadius: '8px',
          margin: '12px 0',
          borderLeft: '4px solid #48bb78'
        },
        header: {
          display: 'flex',
          alignItems: 'center',
          marginBottom: '8px'
        },
        content: {
          lineHeight: '1.8',
          fontSize: '16px'
        },
        icon: {
          marginRight: '8px',
          color: '#48bb78'
        }
      },
      userInput: {
        container: {
          padding: '16px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          margin: '12px 0'
        },
        input: {
          width: '100%',
          padding: '12px',
          borderRadius: '6px',
          border: '1px solid #e2e8f0',
          fontSize: '16px'
        },
        button: {
          padding: '8px 16px',
          backgroundColor: '#48bb78',
          color: '#fff',
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer',
          fontWeight: '500'
        }
      },
      header: {
        container: {
          padding: '16px',
          backgroundColor: '#f0fff4',
          borderBottom: '1px solid #c6f6d5',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        },
        label: {
          fontWeight: 'bold',
          fontSize: '18px',
          color: '#276749'
        }
      },
      navigationButtons: {
        container: {
          display: 'flex',
          justifyContent: 'space-between',
          margin: '16px 0'
        },
        button: {
          padding: '8px 16px',
          backgroundColor: '#48bb78',
          color: '#fff',
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer'
        }
      },
      contextUpdateInfo: {
        container: {
          padding: '12px',
          backgroundColor: '#c6f6d5',
          borderRadius: '6px',
          margin: '12px 0',
          fontSize: '14px'
        },
        label: {
          fontWeight: 'bold',
          marginRight: '8px',
          color: '#276749'
        }
      }
    },
    variables: {
      primaryColor: '#48bb78',
      secondaryColor: '#38a169',
      backgroundColor: '#ffffff',
      textColor: '#333333',
      fontFamily: 'system-ui, sans-serif',
      borderRadius: '8px',
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px'
      }
    }
  }
};

/**
 * Theme Provider component
 */
export interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: ThemeVariant;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialTheme = 'default'
}) => {
  const [theme, setTheme] = React.useState<ThemeVariant>(initialTheme);
  
  const contextValue = useMemo(() => ({
    currentTheme: theme,
    setTheme,
    getStyles: (component: ThemeComponentType) => themes[theme].components[component]
  }), [theme]);
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to use the theme system
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * Higher-order component to apply theme styles
 */
export function withTheme<T extends object>(
  Component: React.ComponentType<T & { styles: ThemeComponentStyles }>,
  componentType: ThemeComponentType
) {
  return (props: T) => {
    const { getStyles } = useTheme();
    const styles = getStyles(componentType);
    
    return <Component {...props} styles={styles} />;
  };
}

export default {
  ThemeProvider,
  useTheme,
  withTheme,
  themes
};