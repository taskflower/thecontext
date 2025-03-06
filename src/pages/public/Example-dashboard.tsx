import { useState } from "react";
import {
  Network,
  BrainCircuit,
  Facebook,
  Instagram,
  Youtube,
  Search,
  MessageSquare,
  Plus,
  Trash2,
  Edit,
} from "lucide-react";
import { AppLink } from "@/components/common";

const MarketingBackoffice = () => {
  const [activeTab, setActiveTab] = useState("scenarios");

  // Sample data
  const scenarios = [
    {
      id: 1,
      title: "Summer Campaign 2025",
      progress: 65,
      tasks: 12,
      completedTasks: 8,
      status: "in-progress",
      channels: ["facebook", "instagram", "email"],
      connections: [2, 4],
    },
    {
      id: 2,
      title: "Product Launch - SmartHome",
      progress: 30,
      tasks: 15,
      completedTasks: 5,
      status: "in-progress",
      channels: ["facebook", "youtube", "google"],
      connections: [1, 3],
    },
    {
      id: 3,
      title: "Holiday Season Planning",
      progress: 10,
      tasks: 20,
      completedTasks: 2,
      status: "todo",
      channels: ["facebook", "email", "instagram"],
      connections: [2, 5],
    },
    {
      id: 4,
      title: "Email Automation Workflow",
      progress: 100,
      tasks: 6,
      completedTasks: 6,
      status: "completed",
      channels: ["email"],
      connections: [1],
    },
    {
      id: 5,
      title: "Corporate Rebrand Campaign",
      progress: 45,
      tasks: 24,
      completedTasks: 11,
      status: "in-progress",
      channels: ["facebook", "youtube", "instagram", "google", "email"],
      connections: [3],
    },
  ];

  // Helper function to get channel icon
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "facebook":
        return <Facebook size={16} className="text-blue-600" />;
      case "instagram":
        return <Instagram size={16} className="text-pink-600" />;
      case "youtube":
        return <Youtube size={16} className="text-red-600" />;
      case "email":
        return <MessageSquare size={16} className="text-purple-600" />;
      case "google":
        return <Search size={16} className="text-yellow-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <nav className="w-64 border-r bg-white dark:bg-gray-800 flex flex-col">
          <div className="flex-1 overflow-auto p-2">
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => setActiveTab("scenarios")}
                  className={`flex items-center w-full p-2 rounded-md ${
                    activeTab === "scenarios"
                      ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <Network size={18} className="mr-3" />
                  <span>Scenarios</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("connections")}
                  className={`flex items-center w-full p-2 rounded-md ${
                    activeTab === "connections"
                      ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <BrainCircuit size={18} className="mr-3" />
                  <span>API Connections</span>
                </button>
                <AppLink
                  forcePublic
                  to="/example-mix"
                  className="flex px-2 mb-3 mt-1 items-center"
                >
                  <Network size={18} className="mr-3" /> Scenarios mix
                </AppLink>
                <AppLink
                  forcePublic
                  to="/example-flow"
                  className="flex px-2 mb-3 mt-1 items-center"
                >
                  <Network size={18} className="mr-3" /> Flow
                </AppLink>
                <AppLink
                  forcePublic
                  to="/example-launch"
                  className="flex px-2 mb-3 mt-1 items-center"
                >
                  <Network size={18} className="mr-3" /> Launch
                </AppLink>
                <AppLink
                  forcePublic
                  to="/example-campagin"
                  className="flex px-2 mb-3 mt-1 items-center"
                >
                  <Network size={18} className="mr-3" /> Campaginn
                </AppLink>
                <AppLink
                  forcePublic
                  to="/example-email"
                  className="flex px-2 mb-3 mt-1 items-center"
                >
                  <Network size={18} className="mr-3" /> Email
                </AppLink>

                <AppLink
                  forcePublic
                  to="/example-cattering"
                  className="flex px-2 mb-3 mt-1 items-center"
                >
                  <Network size={18} className="mr-3" /> Cattering
                </AppLink>
              </li>
            </ul>
          </div>

          <div className="p-4 border-t">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                <BrainCircuit size={16} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-xs font-medium">AI Credits</p>
                <p className="text-sm font-bold">750 remaining</p>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {activeTab === "scenarios" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Marketing Scenarios</h2>
                <div className="flex space-x-2">
                  <button className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-md text-sm">
                    <Plus size={16} className="mr-2" />
                    Create Scenario
                  </button>
                </div>
              </div>

              {/* Scenarios with connections visualization */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">
                    Scenario Connections Map
                  </h3>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 text-sm rounded-md bg-gray-100">
                      Rearrange
                    </button>
                    <button className="px-3 py-1 text-sm rounded-md bg-gray-100">
                      Zoom
                    </button>
                  </div>
                </div>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Network size={32} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">
                      Scenario connection visualization
                    </p>
                    <p className="text-xs text-gray-400">
                      Shows how your marketing scenarios are interrelated
                    </p>
                  </div>
                </div>
              </div>

              {/* Scenarios Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scenarios.map((scenario) => (
                  <div
                    key={scenario.id}
                    className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-4 bg-white">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{scenario.title}</h4>
                        <div className="flex space-x-1">
                          <button className="p-1 text-gray-500 hover:text-indigo-600">
                            <Edit size={14} />
                          </button>
                          <button className="p-1 text-gray-500 hover:text-red-600">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="mt-2">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{scenario.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 h-1.5 rounded-full">
                          <div
                            className={`h-1.5 rounded-full ${
                              scenario.status === "completed"
                                ? "bg-green-500"
                                : scenario.progress > 60
                                ? "bg-indigo-600"
                                : scenario.progress > 30
                                ? "bg-blue-500"
                                : "bg-amber-500"
                            }`}
                            style={{ width: `${scenario.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="mt-3 flex justify-between items-center">
                        <div className="flex space-x-1.5">
                          {scenario.channels.map((channel, idx) => (
                            <div key={idx} className="p-1 bg-gray-100 rounded">
                              {getChannelIcon(channel)}
                            </div>
                          ))}
                        </div>
                        <div className="text-sm text-gray-600">
                          {scenario.completedTasks}/{scenario.tasks} tasks
                        </div>
                      </div>

                      {/* Connected Scenarios */}
                      {scenario.connections.length > 0 && (
                        <div className="mt-3 pt-2 border-t">
                          <p className="text-xs text-gray-500 mb-1">
                            Connected to:
                          </p>
                          <div className="flex space-x-1">
                            {scenario.connections.map((connId) => {
                              const connectedScenario = scenarios.find(
                                (s) => s.id === connId
                              );
                              return (
                                <div
                                  key={connId}
                                  className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded"
                                >
                                  {connectedScenario?.title.substring(0, 15)}
                                 
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add New Scenario Card */}
                <div className="border border-dashed rounded-lg overflow-hidden hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-center h-64">
                  <div className="text-center p-6">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-2">
                      <Plus size={24} className="text-indigo-600" />
                    </div>
                    <p className="font-medium text-indigo-600">
                      Create New Scenario
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Start building your marketing workflow
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "connections" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">API Connections</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <Facebook size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Facebook Marketing API</h3>
                      <p className="text-xs text-green-600">Connected</p>
                    </div>
                    <button className="ml-auto text-sm bg-gray-100 px-3 py-1 rounded-md">
                      Configure
                    </button>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Used in 3 scenarios</p>
                    <p className="mt-1">Last synced: Today, 9:45 AM</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center mr-3">
                      <Instagram size={20} className="text-pink-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Instagram Graph API</h3>
                      <p className="text-xs text-green-600">Connected</p>
                    </div>
                    <button className="ml-auto text-sm bg-gray-100 px-3 py-1 rounded-md">
                      Configure
                    </button>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Used in 2 scenarios</p>
                    <p className="mt-1">Last synced: Today, 10:12 AM</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                      <Youtube size={20} className="text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">YouTube Data API</h3>
                      <p className="text-xs text-green-600">Connected</p>
                    </div>
                    <button className="ml-auto text-sm bg-gray-100 px-3 py-1 rounded-md">
                      Configure
                    </button>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Used in 1 scenario</p>
                    <p className="mt-1">Last synced: Yesterday, 4:30 PM</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                      <Search size={20} className="text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Google Ads API</h3>
                      <p className="text-xs text-green-600">Connected</p>
                    </div>
                    <button className="ml-auto text-sm bg-gray-100 px-3 py-1 rounded-md">
                      Configure
                    </button>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Used in 2 scenarios</p>
                    <p className="mt-1">Last synced: Today, 8:15 AM</p>
                  </div>
                </div>

                <div className="border border-dashed rounded-lg p-6 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-3">
                      <Plus size={24} className="text-indigo-600" />
                    </div>
                    <p className="font-medium">Connect New API</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Integrate with more marketing platforms
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MarketingBackoffice;
