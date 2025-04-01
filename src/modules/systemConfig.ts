// src/modules/systemConfig.ts

// Interfejs dla konfiguracji systemowej
export interface SystemConfig {
  // Flaga określająca, czy moduł nauki języków powinien być załadowany
  enableLanguageLearning: boolean;
  // Flaga określająca, czy moduł dashboardu powinien być załadowany
  enableDashboard: boolean;
  // Flaga określająca, czy ładować pluginy flow
  enableFlowPlugins?: boolean;
  // Flaga określająca, czy ładować pluginy dashboard
  enableDashboardPlugins?: boolean;
  // Dodaj tutaj inne opcje konfiguracyjne w przyszłości
}

// Domyślna konfiguracja systemu
export const defaultSystemConfig: SystemConfig = {
  enableLanguageLearning: false,
  enableDashboard: true,
  enableFlowPlugins: true,
  enableDashboardPlugins: true
};

// Slice Zustand dla konfiguracji systemowej
export const createSystemConfigSlice = (set: any, get: any) => ({
  // Stan konfiguracji systemu
  systemConfig: { ...defaultSystemConfig },
  
  // Getter dla konfiguracji systemowej
  getSystemConfig: () => get().systemConfig,
  
  // Metoda do aktualizacji konfiguracji systemowej
  updateSystemConfig: (config: Partial<SystemConfig>) => {
    set((state: any) => {
      state.systemConfig = {
        ...state.systemConfig,
        ...config
      };
    });
  },
  
  // Metoda do resetowania konfiguracji do wartości domyślnych
  resetSystemConfig: () => {
    set((state: any) => {
      state.systemConfig = { ...defaultSystemConfig };
    });
  }
});
