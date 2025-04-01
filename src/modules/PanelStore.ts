import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Panel content types
export type LeftPanelTab = 'workspace' | 'scenarios' | 'nodes' | 'edges'
export type BottomPanelTab = 'context' | 'filters' | 'conversation' | 'plugins' | 'exportimport' | 'appmanagement' | ''

// Dialog types
export type DialogType = 'editNode' | 'editEdge' | 'configurePlugin' | 'editPluginOptions' | 'addNode' | 'addEdge'

interface PanelState {
  // Left panel state
  showLeftPanel: boolean
  leftPanelTab: LeftPanelTab
  
  // Bottom panel state
  showBottomPanel: boolean
  bottomPanelTab: BottomPanelTab
  
  // Dialog state
  activeDialog: DialogType | null
  dialogProps: {
    nodeId?: string
    edgeId?: string
  }
  
  // Left panel actions
  toggleLeftPanel: () => void
  setLeftPanelTab: (tab: LeftPanelTab) => void
  setShowLeftPanel: (show: boolean) => void
  
  // Bottom panel actions
  toggleBottomPanel: (tab?: BottomPanelTab) => void
  setBottomPanelTab: (tab: BottomPanelTab) => void
  
  // Dialog actions
  openDialog: (dialog: DialogType, props?: { nodeId?: string, edgeId?: string }) => void
  closeDialog: () => void
}

export const usePanelStore = create<PanelState>()(
  persist(
    (set) => ({
      // Default states
      showLeftPanel: true,
      leftPanelTab: 'workspace',
      
      showBottomPanel: false,
      bottomPanelTab: '',
      
      // Dialog state - not persisted to localStorage
      activeDialog: null,
      dialogProps: {},
      
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
      
      // Dialog actions
      openDialog: (dialog, props = {}) => set({
        activeDialog: dialog,
        dialogProps: props
      }),
      
      closeDialog: () => set({
        activeDialog: null,
        dialogProps: {}
      })
    }),
    {
      name: 'panel-settings',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist panel state, not dialog state
        showLeftPanel: state.showLeftPanel,
        leftPanelTab: state.leftPanelTab,
        showBottomPanel: state.showBottomPanel,
        bottomPanelTab: state.bottomPanelTab
      })
    }
  )
)