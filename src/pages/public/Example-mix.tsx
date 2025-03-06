/* eslint-disable */
/* tslint-disable */
/* istanbul ignore file */

import  { useState } from 'react';
import {
  Calendar,
  CheckSquare,
  Clock,
  ChevronLeft,
  Facebook,
  Instagram,
  Youtube,
  Search,
  MessageSquare,
  Edit,
  Edit3,
  Trash2,
  BrainCircuit,
  Image,
  PlayCircle,
  FileText,
  Mail
} from 'lucide-react';

// Define type for content item
interface ContentItem {
  id: number;
  title: string;
  type: string;
  channel: string;
  status: string;
  dimensions?: string;
  duration?: string;
  creator: string;
  lastUpdated: string;
  subject?: string;
  hashtags?: string[];
}

// Define type for scenario
interface Scenario {
  id: number;
  title: string;
  progress: number;
  tasks: number;
  completedTasks: number;
  status: string;
  channels: string[];
  connections: number[];
  description?: string;
  startDate?: string;
  endDate?: string;
  objective?: string;
  budget?: number;
  target?: {
    audience: string;
    locations: string;
    interests: string;
  };
  content?: ContentItem[];
}

// Define type for milestone
interface Milestone {
  id: number;
  title: string;
  date: string;
  status: string;
}

const MarketingScenarioApp = () => {
  const [currentView, setCurrentView] = useState('scenariosList');
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedContentId, setSelectedContentId] = useState<number>(2);

  // Sample data
  const scenarios: Scenario[] = [
    {
      id: 1,
      title: "Summer Campaign 2025",
      progress: 65,
      tasks: 12,
      completedTasks: 8,
      status: "in-progress",
      channels: ["facebook", "instagram", "email"],
      connections: [2, 4],
      description: "Launch our summer collection with a focus on beach essentials and vacation outfits.",
      startDate: "2025-06-01",
      endDate: "2025-08-31",
      objective: "Increase summer collection sales by 30% compared to previous year",
      budget: 120000,
      target: {
        audience: "Fashion enthusiasts, 25-45 age group, vacation planners",
        locations: "US, Europe, Australia",
        interests: "Fashion, Travel, Summer activities"
      },
      content: [
        { id: 1, title: 'Summer Collection Hero Banner', type: 'image', channel: 'facebook', status: 'completed', dimensions: '1200x628px', creator: 'Alex D.', lastUpdated: 'May 3, 2025' },
        { id: 2, title: 'Summer Vibes Promotional Video', type: 'video', channel: 'instagram', status: 'completed', duration: '0:45', creator: 'James M.', lastUpdated: 'May 12, 2025' },
        { id: 3, title: 'Beach Collection Post Copy', type: 'text', channel: 'instagram', status: 'completed', hashtags: ['summervibes', 'beachfashion', 'summercollection'], creator: 'Sarah C.', lastUpdated: 'May 14, 2025' },
        { id: 4, title: 'Summer Sale Announcement Email', type: 'email', channel: 'email', status: 'in-progress', subject: 'Summer is here! Get 30% off our new collection', creator: 'Lisa F.', lastUpdated: 'May 19, 2025' }
      ]
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
      description: "Launch campaign for our new SmartHome product line including connected devices, mobile app and subscription service.",
      startDate: "2025-04-15",
      endDate: "2025-07-30",
      budget: 50000,
      target: {
        audience: "Homeowners, Tech-savvy professionals, 28-45 age group",
        locations: "US, Canada, UK",
        interests: "Smart technology, Home automation, IoT"
      }
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

  // Milestones for SmartHome
  const milestones: Milestone[] = [
    { id: 1, title: 'Campaign Assets Created', date: '2025-05-20', status: 'completed' },
    { id: 2, title: 'Campaign Launch', date: '2025-06-01', status: 'upcoming' },
    { id: 3, title: 'Mid-campaign Optimization', date: '2025-07-01', status: 'upcoming' },
    { id: 4, title: 'Campaign Close & Reporting', date: '2025-07-30', status: 'upcoming' }
  ];

  // Helper function to get channel icon
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'facebook':
        return <Facebook size={16} className="text-blue-600" />;
      case 'instagram':
        return <Instagram size={16} className="text-pink-600" />;
      case 'youtube':
        return <Youtube size={16} className="text-red-600" />;
      case 'email':
        return <MessageSquare size={16} className="text-purple-600" />;
      case 'google':
        return <Search size={16} className="text-yellow-600" />;
      default:
        return null;
    }
  };

  // Handle scenario selection
  const handleScenarioSelect = (id: number) => {
    const scenario = scenarios.find(s => s.id === id);
    if (scenario) {
      setSelectedScenario(scenario);
      setCurrentView('scenarioDetail');
    }
  };

  // Get selected content for Summer Campaign
  const selectedContent = selectedScenario?.content?.find(content => content.id === selectedContentId) || null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Scenarios List View */}
      {currentView === 'scenariosList' && (
        <div className="p-6 bg-gray-50">
          <h2 className="text-2xl font-bold mb-6">Lista scenariuszy marketingowych</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scenarios.map((scenario) => (
              <div
                key={scenario.id}
                className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white cursor-pointer"
                onClick={() => handleScenarioSelect(scenario.id)}
              >
                <div className="p-4">
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
                      <span>Postęp</span>
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
                      {scenario.completedTasks}/{scenario.tasks} zadań
                    </div>
                  </div>

                  {scenario.connections.length > 0 && (
                    <div className="mt-3 pt-2 border-t">
                      <p className="text-xs text-gray-500 mb-1">
                        Połączone z:
                      </p>  
                      <div className="flex flex-wrap gap-1">
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
          </div>
        </div>
      )}

      {/* Scenario Detail View */}
      {currentView === 'scenarioDetail' && selectedScenario && (
        <div className="flex flex-col min-h-screen bg-gray-50">
          {/* Navigation Bar */}
          <header className="bg-white border-b px-6 py-3">
            <div className="flex items-center">
              <button 
                className="mr-4 text-gray-500 hover:text-indigo-600"
                onClick={() => setCurrentView('scenariosList')}
              >
                <ChevronLeft size={20} />
              </button>
              <h1 className="text-xl font-bold">{selectedScenario.title}</h1>
              <div className="ml-3 px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-800">
                {selectedScenario.status === 'completed' ? 'Completed' : 
                 selectedScenario.status === 'in-progress' ? 'In Progress' : 
                 selectedScenario.status === 'todo' ? 'To Do' : selectedScenario.status}
              </div>
              {selectedScenario.startDate && (
                <div className="flex items-center text-sm text-gray-500 ml-4">
                  <Calendar size={14} className="mr-1" />
                  <span>{selectedScenario.startDate} to {selectedScenario.endDate}</span>
                </div>
              )}
              <div className="ml-auto flex space-x-2">
                <button className="px-3 py-1 border rounded-md text-sm hover:bg-gray-50">
                  Share
                </button>
                <button className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm">
                  <Edit3 size={16} className="inline mr-1" />
                  Edit Scenario
                </button>
              </div>
            </div>
            
            {/* Scenario Navigation */}
            <nav className="flex mt-4 border-b">
              <button 
                onClick={() => setActiveSection('overview')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeSection === 'overview' 
                    ? 'text-indigo-600 border-b-2 border-indigo-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Overview
              </button>
              {selectedScenario.content && (
                <button 
                  onClick={() => setActiveSection('content')}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeSection === 'content' 
                      ? 'text-indigo-600 border-b-2 border-indigo-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Content
                </button>
              )}
            </nav>
          </header>
          
          {/* Main Content Area */}
          <main className="flex-1 overflow-auto p-6">
            {/* Overview Section */}
            {activeSection === 'overview' && (
              <div className="space-y-6">
                {/* Progress card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium mb-4">Campaign Progress</h3>
                  <div className="flex items-center text-sm mb-2">
                    <span className="font-medium">Overall Completion:</span>
                    <span className="ml-2">{selectedScenario.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full mb-4">
                    <div 
                      className={`h-2 rounded-full ${
                        selectedScenario.status === "completed"
                          ? "bg-green-500"
                          : selectedScenario.progress > 60
                          ? "bg-indigo-600"
                          : selectedScenario.progress > 30
                          ? "bg-blue-500"
                          : "bg-amber-500"
                      }`}
                      style={{ width: `${selectedScenario.progress}%` }}
                    ></div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Tasks</p>
                      <p className="font-bold">{selectedScenario.completedTasks}/{selectedScenario.tasks}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Days Remaining</p>
                      <p className="font-bold">65</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Budget Used</p>
                      <p className="font-bold">${selectedScenario.id === 1 ? '78,000' : '15,000'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Description and target audience */}
                {selectedScenario.description && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-lg font-medium mb-3">Campaign Description</h3>
                      <p className="text-gray-700">{selectedScenario.description}</p>
                      {selectedScenario.objective && (
                        <div className="mt-4">
                          <h4 className="font-medium text-gray-700">Objective</h4>
                          <p className="text-gray-600">{selectedScenario.objective}</p>
                        </div>
                      )}
                    </div>
                    
                    {selectedScenario.target && (
                      <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium mb-3">Target Audience</h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Audience</p>
                            <p>{selectedScenario.target.audience}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Locations</p>
                            <p>{selectedScenario.target.locations}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Interests</p>
                            <p>{selectedScenario.target.interests}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Milestone timeline for SmartHome */}
                {selectedScenario.id === 2 && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Milestones</h3>
                      <button className="text-sm text-indigo-600">+ Add Milestone</button>
                    </div>
                    
                    <div className="space-y-4">
                      {milestones.map((milestone, index) => (
                        <div key={milestone.id} className="flex items-start">
                          <div className="flex flex-col items-center mr-4">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              milestone.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                            }`}>
                              {milestone.status === 'completed' ? (
                                <CheckSquare size={14} />
                              ) : (
                                <Clock size={14} />
                              )}
                            </div>
                            {index < milestones.length - 1 && (
                              <div className="w-0.5 h-10 bg-gray-200"></div>
                            )}
                          </div>
                          <div className="pt-1">
                            <p className="font-medium">{milestone.title}</p>
                            <p className="text-sm text-gray-500">{milestone.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Connected scenarios */}
                {selectedScenario.connections && selectedScenario.connections.length > 0 && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium mb-4">Connected Scenarios</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedScenario.connections.map((connId) => {
                        const connectedScenario = scenarios.find(s => s.id === connId);
                        return connectedScenario ? (
                          <div 
                            key={connId} 
                            className="border rounded-lg p-4 cursor-pointer"
                            onClick={() => handleScenarioSelect(connId)}
                          >
                            <h4 className="font-medium">{connectedScenario.title}</h4>
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                                <span>Progress</span>
                                <span>{connectedScenario.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 h-1.5 rounded-full">
                                <div 
                                  className={`h-1.5 rounded-full ${
                                    connectedScenario.status === "completed"
                                      ? "bg-green-500"
                                      : connectedScenario.progress > 60
                                      ? "bg-indigo-600"
                                      : connectedScenario.progress > 30
                                      ? "bg-blue-500"
                                      : "bg-amber-500"
                                  }`}
                                  style={{ width: `${connectedScenario.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
                
                {/* AI Credits */}
                <div className="mt-6 p-4 border-t">
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
              </div>
            )}
            
            {/* Content Section for Summer Campaign */}
            {activeSection === 'content' && selectedScenario.content && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">Campaign Content</h2>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 border rounded-md text-sm">Filter</button>
                    <button className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm">Add Content</button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1 space-y-4">
                    {selectedScenario.content.map((content) => (
                      <div
                        key={content.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          content.id === selectedContentId ? 'border-indigo-600 bg-indigo-50' : 'hover:border-gray-400'
                        }`}
                        onClick={() => setSelectedContentId(content.id)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            {content.type === 'image' && <Image size={18} className="text-indigo-600" />}
                            {content.type === 'video' && <PlayCircle size={18} className="text-indigo-600" />}
                            {content.type === 'text' && <FileText size={18} className="text-indigo-600" />}
                            {content.type === 'email' && <Mail size={18} className="text-indigo-600" />}
                            <h4 className="font-medium ml-2">{content.title}</h4>
                          </div>
                          <div className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                            {content.status}
                          </div>
                        </div>

                        <div className="flex items-center text-xs text-gray-500 mb-3">
                          {getChannelIcon(content.channel)}
                          <span className="ml-1 capitalize">{content.channel}</span>
                          {content.type === 'image' && content.dimensions && (
                            <span className="ml-2">• {content.dimensions}</span>
                          )}
                          {content.type === 'video' && content.duration && (
                            <span className="ml-2">• {content.duration}</span>
                          )}
                        </div>

                        <div className="flex justify-between text-xs text-gray-500">
                          <span>By {content.creator}</span>
                          <span>{content.lastUpdated}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="md:col-span-2">
                    {selectedContent ? (
                      <div className="border rounded-lg bg-white overflow-hidden">
                        <div className="p-4 border-b">
                          <div className="flex items-center mb-2">
                            {selectedContent.type === 'image' && <Image size={20} className="text-indigo-600" />}
                            {selectedContent.type === 'video' && <PlayCircle size={20} className="text-indigo-600" />}
                            {selectedContent.type === 'text' && <FileText size={20} className="text-indigo-600" />}
                            {selectedContent.type === 'email' && <Mail size={20} className="text-indigo-600" />}
                            <h3 className="font-medium ml-2">{selectedContent.title}</h3>
                          </div>
                          <div className="flex space-x-2 text-xs">
                            <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                              {selectedContent.status}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 rounded-full">
                              {selectedContent.type.charAt(0).toUpperCase() + selectedContent.type.slice(1)}
                            </span>
                            {selectedContent.channel && (
                              <span className="px-2 py-1 bg-gray-100 rounded-full flex items-center">
                                {getChannelIcon(selectedContent.channel)}
                                <span className="ml-1">{selectedContent.channel.charAt(0).toUpperCase() + selectedContent.channel.slice(1)}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {selectedContent.type === 'image' && (
                          <div className="p-4 flex justify-center">
                            <div className="w-full h-64 bg-gray-100 rounded flex items-center justify-center">
                              <div className="text-center">
                                <Image size={32} className="mx-auto text-gray-400 mb-2" />
                                <p className="text-sm text-gray-500">Summer Campaign Hero Image</p>
                                {selectedContent.dimensions && (
                                  <p className="text-xs text-gray-400">{selectedContent.dimensions}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {selectedContent.type === 'video' && (
                          <div className="p-4">
                            <div className="w-full h-64 bg-gray-800 rounded flex items-center justify-center">
                              <div className="text-center">
                                <PlayCircle size={48} className="mx-auto text-white mb-2" />
                                <p className="text-sm text-gray-300">Summer Campaign Promo Video</p>
                                {selectedContent.duration && (
                                  <p className="text-xs text-gray-400">{selectedContent.duration}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {selectedContent.type === 'text' && (
                          <div className="p-4">
                            <p className="text-sm text-gray-600 mb-3">
                              Discover our exclusive summer collection designed for comfort and style. Beat the heat with our lightweight fabrics while staying on trend.
                            </p>
                            {selectedContent.hashtags && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {selectedContent.hashtags.map((tag, idx) => (
                                  <span key={idx} className="text-xs text-blue-600">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {selectedContent.type === 'email' && (
                          <div className="p-4">
                            <div className="border rounded p-3 bg-gray-50">
                              <p className="text-sm font-medium mb-1">
                                Subject: {selectedContent.subject || "Summer is here! Get 30% off our new collection"}
                              </p>
                              <p className="text-xs text-gray-500 mb-3">
                                From: Your Brand &lt;no-reply@yourbrand.com&gt;
                              </p>
                              <div className="border-t pt-2">
                                <p className="text-sm">
                                  Hi [Customer Name], Our summer sale is finally here! Explore our new collection with exclusive deals up to 50% off. Limited time only.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="p-4 border-t bg-gray-50">
                          <div className="flex justify-between">
                            <div>
                              <p className="text-xs text-gray-500">Created by {selectedContent.creator}</p>
                              <p className="text-xs text-gray-500">Last updated: {selectedContent.lastUpdated}</p>
                            </div>
                            <div className="flex space-x-2">
                              <button className="p-1 text-gray-500 hover:text-indigo-600">
                                <Edit size={14} />
                              </button>
                              <button className="p-1 text-gray-500 hover:text-red-600">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="border rounded-lg p-8 h-full flex items-center justify-center bg-gray-50">
                        <div className="text-center text-gray-500">
                          <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                          <p>Select a content item to preview</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
};

export default MarketingScenarioApp;