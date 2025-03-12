import Dashboard from "./modules/Dashboard";
import { PluginInitializer } from "./modules/plugins_system/initPlugins";
import { initScenarioSync } from "./modules/scenarios_module/scenarioSync";
import { registerStores } from './modules/plugins_system/registerStores';
const App: React.FC = () => {
  /* TODO - przeanalizuj sens scenarioSync a w całej architwkturze systemu, 
  mechanika workspeces została dodana stosunkowo pozno  */
  initScenarioSync();
  /* TODO - przeanalizuj sens registerStores a w całej architwkturze systemu, 
  mechanika pluginow powinna miec dostep z poziomu samego pluginu  */
  registerStores();
  return (
    <div className="container mx-auto p-6">
      <main className="space-y-8">
        <Dashboard />
        <PluginInitializer />
      </main>

      <footer className="mt-8 text-center text-gray-500 text-sm">
        <p>React Plugin System Demo - Built with shadcn/ui</p>
      </footer>
    </div>
  );
};

export default App;
