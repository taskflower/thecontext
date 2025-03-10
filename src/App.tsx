import React, { useEffect } from 'react';
// import { useAppStore } from './plugins-system/store';
// import { PluginManager } from './plugins-system/PluginManager';
// import { PluginsDashboard } from './plugins-system/PluginsDashboard';
import { usePluginInstaller } from './plugins-system/pluginInstaller';

import CategoryFolderGraph from './modules/grph';

const App: React.FC = () => {
 // const { counter, increment, decrement } = useAppStore();
 const { installDevPlugins } = usePluginInstaller();
 
 useEffect(() => {
   installDevPlugins();
 }, []);
 
 return (
   <div className="container mx-auto p-6 max-w-6xl">
     <header className="mb-8">
       <h1 className="text-3xl font-bold text-blue-800 mb-2">React Plugin System</h1>
       <p className="text-gray-600">Extensible application architecture with plugin support</p>
     </header>
     
     <main className="space-y-8">
       {/* <Card className="w-full shadow-md">
         <CardHeader className="bg-gray-50 rounded-t-lg">
           <CardTitle className="text-xl font-bold">Core Application</CardTitle>
         </CardHeader>
         <CardContent className="p-6">
           <div className="flex flex-col items-center justify-center py-4">
             <p className="text-2xl font-medium mb-4">Counter: {counter}</p>
             <div className="flex space-x-4">
               <Button 
                 variant="outline" 
                 size="icon" 
                 onClick={decrement}
                 className="h-10 w-10 rounded-full"
               >
                 <Minus size={20} />
               </Button>
               <Button 
                 variant="outline" 
                 size="icon" 
                 onClick={increment}
                 className="h-10 w-10 rounded-full"
               >
                 <Plus size={20} />
               </Button>
             </div>
           </div>
         </CardContent>
       </Card> */}
       
       {/* <Tabs defaultValue="dashboard" className="w-full">
         <TabsList className="grid w-full grid-cols-2 mb-8">
           <TabsTrigger value="dashboard">Plugins Dashboard</TabsTrigger>
           <TabsTrigger value="manager">Plugin Manager</TabsTrigger>
         </TabsList>
         
         <TabsContent value="dashboard">
           <PluginsDashboard />
         </TabsContent>
         
         <TabsContent value="manager">
           <PluginManager />
         </TabsContent>
       </Tabs> */}
       <CategoryFolderGraph/>
     </main>
     
     <footer className="mt-8 text-center text-gray-500 text-sm">
       <p>React Plugin System Demo - Built with shadcn/ui</p>
     </footer>
   </div>
 );
};

export default App;