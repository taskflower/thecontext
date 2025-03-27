import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Panel content types
export type LeftPanelTab = 'workspace' | 'scenarios' | 'nodes' | 'edges'
export type BottomPanelTab = 'context' | 'filters' | 'conversation' | 'plugins' | 'exportimport' | ''

interface PanelState {
  // Left panel state
  showLeftPanel: boolean
  leftPanelTab: LeftPanelTab
  
  // Bottom panel state
  showBottomPanel: boolean
  bottomPanelTab: BottomPanelTab
  
  // Actions
  toggleLeftPanel: () => void
  setLeftPanelTab: (tab: LeftPanelTab) => void
  setShowLeftPanel: (show: boolean) => void
  
  toggleBottomPanel: (tab?: BottomPanelTab) => void
  setBottomPanelTab: (tab: BottomPanelTab) => void
}

export const usePanelStore = create<PanelState>()(
  persist(
    (set) => ({
      // Default states
      showLeftPanel: true,
      leftPanelTab: 'workspace',
      
      showBottomPanel: false,
      bottomPanelTab: '',
      
      // Left panel actions
      toggleLeftPanel: () => set((state) => ({ showLeftPanel: !state.showLeftPanel })),
      setLeftPanelTab: (tab) => set({ leftPanelTab: tab }),
      setShowLeftPanel: (show) => set({ showLeftPanel: show }),
      
      // Bottom panel actions
      toggleBottomPanel: (tab) => set((state) => {
        // If tab is specified, use it
        const tabToUse = tab || state.bottomPanelTab
        
        // If the same tab is clicked again, toggle the panel
        if (tabToUse === state.bottomPanelTab && state.showBottomPanel) {
          return { showBottomPanel: false }
        }
        
        // Otherwise, show the panel with the selected tab
        return { 
          showBottomPanel: true, 
          bottomPanelTab: tabToUse 
        }
      }),
      
      setBottomPanelTab: (tab) => set({ 
        bottomPanelTab: tab,
        showBottomPanel: true
      }),
    }),
    {
      name: 'panel-settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
)