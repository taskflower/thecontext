/**
 * Add widget dialog component
 */
import  { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {  Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Layout, BadgeCheck } from 'lucide-react';
import { useWidgetStore } from './widgetStore';
import { getAllWidgets, getWidgetsByCategories } from './widgetRegistry';

interface AddWidgetDialogProps {
  dashboardId: string;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Add widget dialog
 */
export function AddWidgetDialog({ dashboardId, isOpen, onClose }: AddWidgetDialogProps) {
  const [title, setTitle] = useState('');
  const [search, setSearch] = useState('');
  const [selectedWidgetType, setSelectedWidgetType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  
  // Get all available widgets
  const allWidgets = useMemo(() => 
    getAllWidgets().sort((a, b) => a.name.localeCompare(b.name))
  , []);
  
  // Get widgets by category
  const widgetsByCategory = useMemo(() => 
    getWidgetsByCategories()
  , []);
  
  // Filter widgets by search
  const filteredWidgets = useMemo(() => {
    if (!search) {
      return allWidgets;
    }
    
    const searchLower = search.toLowerCase();
    return allWidgets.filter(widget => 
      widget.name.toLowerCase().includes(searchLower) || 
      (widget.description && widget.description.toLowerCase().includes(searchLower))
    );
  }, [allWidgets, search]);
  
  // Get add widget function
  const addWidget = useWidgetStore(state => state.addWidget);
  
  // Handle widget selection
  const handleSelectWidget = (type: string) => {
    setSelectedWidgetType(type);
    
    // Set default title based on widget name
    const widget = allWidgets.find(w => w.type === type);
    if (widget && (!title || title === '')) {
      setTitle(widget.name);
    }
  };
  
  // Handle adding widget
  const handleAddWidget = () => {
    if (!selectedWidgetType || !title.trim()) {
      return;
    }
    
    // Get widget info
    const widget = allWidgets.find(w => w.type === selectedWidgetType);
    if (!widget) {
      return;
    }
    
    // Add widget
    addWidget(dashboardId, {
      title: title.trim(),
      widgetType: selectedWidgetType,
      height: widget.defaultHeight || 300,
      config: widget.defaultConfig || {},
    });
    
    // Close dialog
    onClose();
    
    // Reset form
    setTitle('');
    setSearch('');
    setSelectedWidgetType(null);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Widget</DialogTitle>
          <DialogDescription>
            Select a widget to add to your dashboard
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-4 mt-4">
          {/* Widget selection section */}
          <div className="flex-1">
            <div className="relative mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search widgets..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">
                  All
                </TabsTrigger>
                {Object.keys(widgetsByCategory).map(category => (
                  <TabsTrigger key={category} value={category}>
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <TabsContent value="all" className="mt-0">
                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2 rounded-md">
                  {filteredWidgets.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No widgets match your search
                    </div>
                  ) : (
                    filteredWidgets.map(widget => (
                      <Card 
                        key={widget.type}
                        className={`p-3 cursor-pointer border transition-colors ${
                          selectedWidgetType === widget.type 
                            ? 'border-primary bg-primary/5' 
                            : 'border-transparent hover:bg-muted/50'
                        }`}
                        onClick={() => handleSelectWidget(widget.type)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-sm">{widget.name}</h3>
                            {widget.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {widget.description}
                              </p>
                            )}
                          </div>
                          {selectedWidgetType === widget.type && (
                            <BadgeCheck className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
              
              {Object.entries(widgetsByCategory).map(([category, widgets]) => (
                <TabsContent key={category} value={category} className="mt-0">
                  <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2 rounded-md">
                    {widgets.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        No widgets in this category
                      </div>
                    ) : (
                      widgets.map(widget => (
                        <Card 
                          key={widget.type}
                          className={`p-3 cursor-pointer border transition-colors ${
                            selectedWidgetType === widget.type 
                              ? 'border-primary bg-primary/5' 
                              : 'border-transparent hover:bg-muted/50'
                          }`}
                          onClick={() => handleSelectWidget(widget.type)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-sm">{widget.name}</h3>
                              {widget.description && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {widget.description}
                                </p>
                              )}
                            </div>
                            {selectedWidgetType === widget.type && (
                              <BadgeCheck className="h-4 w-4 text-primary" />
                            )}
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
          
          {/* Widget configuration section */}
          <div className="w-[200px] border-l pl-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="widget-title">Widget Title</Label>
                <Input
                  id="widget-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter title"
                  className="mt-1"
                />
              </div>
              
              {selectedWidgetType && (
                <div className="pt-2">
                  <div className="text-center">
                    <Layout className="h-16 w-16 mx-auto text-primary/20" />
                    <p className="text-sm mt-2">
                      {allWidgets.find(w => w.type === selectedWidgetType)?.name}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddWidget}
            disabled={!selectedWidgetType || !title.trim()}
          >
            Add Widget
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddWidgetDialog;