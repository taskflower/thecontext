import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { initialPluginsState, PluginsState } from '../plugin-state';
import { createPluginActions, PluginActions } from '../plugin-actions';


// Główny store pluginów
export const usePluginStore = create<PluginsState & PluginActions>()(
  persist(
    (set, get, api) => ({
      ...initialPluginsState,
      ...createPluginActions(set, get, api)
    }),
    {
      name: 'plugin-store',
      // Zapisujemy tylko stany aktywacji pluginów i historię do localStorage
      partialize: (state) => ({
        plugins: Object.fromEntries(
          Object.entries(state.plugins).map(([id, plugin]) => [id, { active: plugin.active }])
        ),
        history: state.history.slice(-20) // Zapisujemy tylko ostatnie 20 wykonań
      })
    }
  )
);

// Funkcja do inicjalizacji pluginów przy starcie aplikacji
export const initializePluginStore = () => {
  // Po załadowaniu strony, możemy tutaj zarejestrować domyślne pluginy
  // oraz wykonać inne operacje inicjalizacyjne
};