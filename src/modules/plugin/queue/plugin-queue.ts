import { usePluginStore } from '../store';
import { PluginResult } from '../types';

export class PluginQueue {
  // Dodanie pluginu na koniec kolejki
  static addToQueue(pluginId: string): void {
    usePluginStore.getState().queuePlugin(pluginId);
  }

  // Usunięcie pluginu z kolejki
  static removeFromQueue(pluginId: string): void {
    usePluginStore.getState().removeFromQueue(pluginId);
  }

  // Pobranie aktualnej kolejki
  static getQueue(): string[] {
    return usePluginStore.getState().queue;
  }

  // Wykonanie całej kolejki
  static async executeQueue(initialInput: string): Promise<PluginResult[]> {
    return usePluginStore.getState().executeQueue(initialInput);
  }

  // Wyczyszczenie kolejki
  static clearQueue(): void {
    usePluginStore.getState().clearQueue();
  }

  // Sprawdzenie, czy kolejka jest pusta
  static isEmpty(): boolean {
    return usePluginStore.getState().queue.length === 0;
  }

  // Sprawdzenie, czy przetwarzanie jest w toku
  static isProcessing(): boolean {
    return usePluginStore.getState().processing;
  }

  // Przesunięcie pluginu w kolejce
  static moveInQueue(pluginId: string, newPosition: number): void {
    const store = usePluginStore.getState();
    const currentQueue = [...store.queue];
    const currentIndex = currentQueue.indexOf(pluginId);
    
    if (currentIndex === -1) return;
    
    // Usuń z obecnej pozycji
    currentQueue.splice(currentIndex, 1);
    
    // Dodaj na nowej pozycji
    const boundedPosition = Math.max(0, Math.min(newPosition, currentQueue.length));
    currentQueue.splice(boundedPosition, 0, pluginId);
    
    // Aktualizuj kolejkę
    usePluginStore.setState({ queue: currentQueue });
  }
}