import React, { useState } from 'react';
import { 
  Calendar,
  ChevronLeft,
  Facebook, 
  Instagram, 
  MessageSquare,
  Target,
  Users,
  CheckCircle,
  Edit,
  Trash2,
  Image,
  PlayCircle,
  FileText,
  Mail
} from 'lucide-react';

// Channel Icon Component
const ChannelIcon = ({ channel }) => {
  switch(channel) {
    case 'facebook': return <Facebook size={16} className="text-blue-600" />;
    case 'instagram': return <Instagram size={16} className="text-pink-600" />;
    case 'email': return <MessageSquare size={16} className="text-purple-600" />;
    default: return null;
  }
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const getStatusStyles = () => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'delayed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusStyles()}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Task Item Component
const TaskItem = ({ task, onToggleComplete }) => (
  <div className="flex items-center p-3 border-b last:border-0 hover:bg-gray-50">
    <button 
      onClick={() => onToggleComplete(task.id)}
      className={`w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center mr-3
        ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}
    >
      {task.completed && <CheckCircle size={16} className="text-white" />}
    </button>
    <div className="flex-1">
      <p className={`${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
        {task.title}
      </p>
      <div className="flex mt-1">
        <div className="flex items-center text-xs text-gray-500 mr-3">
          <Calendar size={12} className="mr-1" />
          <span>{task.dueDate}</span>
        </div>
        {task.assignee && (
          <div className="flex items-center text-xs text-gray-500">
            <Users size={12} className="mr-1" />
            <span>{task.assignee}</span>
          </div>
        )}
      </div>
    </div>
    <StatusBadge status={task.status} />
  </div>
);

// Timeline Item Component
const TimelineItem = ({ item }) => (
  <div className="relative pl-6 pb-6">
    <div className="absolute left-0 top-0 h-full w-px bg-gray-200"></div>
    <div className={`absolute left-0 top-0 w-5 h-5 rounded-full -ml-2.5 ${
      item.completed ? 'bg-green-500' : 'bg-gray-200'
    }`}></div>
    
    <div className="bg-white rounded-lg border p-4">
      <div className="flex justify-between mb-2">
        <h4 className="font-medium">{item.title}</h4>
        <StatusBadge status={item.status} />
      </div>
      <p className="text-sm text-gray-600 mb-3">{item.description}</p>
      
      <div className="flex justify-between text-xs text-gray-500">
        <div className="flex items-center">
          <Calendar size={12} className="mr-1" />
          <span>{item.date}</span>
        </div>
        {item.assignee && (
          <div className="flex items-center">
            <Users size={12} className="mr-1" />
            <span>{item.assignee}</span>
          </div>
        )}
      </div>
    </div>
  </div>
);

// Content Card Component
const ContentCard = ({ content, isSelected, onClick }) => {
  const getIconByType = (type) => {
    switch(type) {
      case 'image': return <Image size={18} className="text-indigo-600" />;
      case 'video': return <PlayCircle size={18} className="text-indigo-600" />;
      case 'text': return <FileText size={18} className="text-indigo-600" />;
      case 'email': return <Mail size={18} className="text-indigo-600" />;
      default: return <FileText size={18} className="text-indigo-600" />;
    }
  };
  
  return (
    <div 
      className={`border rounded-lg p-4 cursor-pointer transition-all ${
        isSelected ? 'border-indigo-600 bg-indigo-50' : 'hover:border-gray-400'
      }`}
      onClick={() => onClick(content.id)}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center">
          {getIconByType(content.type)}
          <h4 className="font-medium ml-2">{content.title}</h4>
        </div>
        <StatusBadge status={content.status} />
      </div>
      
      <div className="flex items-center text-xs text-gray-500 mb-3">
        <ChannelIcon channel={content.channel} />
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
  );
};

// Content Preview Panel
const ContentPreviewPanel = ({ content }) => {
  if (!content) return null;
  
  const getIconByType = (type) => {
    switch(type) {
      case 'image': return <Image size={20} className="text-indigo-600" />;
      case 'video': return <PlayCircle size={20} className="text-indigo-600" />;
      case 'text': return <FileText size={20} className="text-indigo-600" />;
      case 'email': return <Mail size={20} className="text-indigo-600" />;
      default: return <FileText size={20} className="text-indigo-600" />;
    }
  };

  return (
    <div className="border rounded-lg bg-white overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex items-center mb-2">
          {getIconByType(content.type)}
          <h3 className="font-medium ml-2">{content.title}</h3>
        </div>
        <div className="flex space-x-2 text-xs">
          <StatusBadge status={content.status} />
          <span className="px-2 py-1 bg-gray-100 rounded-full">
            {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
          </span>
          {content.channel && (
            <span className="px-2 py-1 bg-gray-100 rounded-full flex items-center">
              <ChannelIcon channel={content.channel} />
              <span className="ml-1">{content.channel.charAt(0).toUpperCase() + content.channel.slice(1)}</span>
            </span>
          )}
        </div>
      </div>
      
      {content.type === 'image' && (
        <div className="p-4 flex justify-center">
          <div className="w-full h-64 bg-gray-100 rounded flex items-center justify-center">
            <div className="text-center">
              <Image size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Summer Campaign Hero Image</p>
              {content.dimensions && (
                <p className="text-xs text-gray-400">{content.dimensions}</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {content.type === 'video' && (
        <div className="p-4">
          <div className="w-full h-64 bg-gray-800 rounded flex items-center justify-center">
            <div className="text-center">
              <PlayCircle size={48} className="mx-auto text-white mb-2" />
              <p className="text-sm text-gray-300">Summer Campaign Promo Video</p>
              {content.duration && (
                <p className="text-xs text-gray-400">{content.duration}</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {content.type === 'text' && (
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-3">
            {content.text || "Discover our exclusive summer collection designed for comfort and style. Beat the heat with our lightweight fabrics while staying on trend."}
          </p>
          {content.hashtags && (
            <div className="flex flex-wrap gap-1 mt-2">
              {content.hashtags.map((tag, idx) => (
                <span key={idx} className="text-xs text-blue-600">#{tag}</span>
              ))}
            </div>
          )}
        </div>
      )}
      
      {content.type === 'email' && (
        <div className="p-4">
          <div className="border rounded p-3 bg-gray-50">
            <p className="text-sm font-medium mb-1">Subject: {content.subject}</p>
            <p className="text-xs text-gray-500 mb-3">From: Your Brand &lt;no-reply@yourbrand.com&gt;</p>
            <div className="border-t pt-2">
              <p className="text-sm">
                {content.body || "Hi [Customer Name], Our summer sale is finally here! Explore our new collection with exclusive deals up to 50% off. Limited time only."}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="p-4 border-t bg-gray-50">
        <div className="flex justify-between">
          <div>
            <p className="text-xs text-gray-500">Created by {content.creator}</p>
            <p className="text-xs text-gray-500">Last updated: {content.lastUpdated}</p>
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
  );
};

// Main Summer Campaign Component
const SummerCampaignFlow = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedContentId, setSelectedContentId] = useState(null);
  
  // Campaign data
  const campaign = {
    id: 1,
    title: 'Summer Campaign 2025',
    status: 'in-progress',
    progress: 65,
    dateRange: 'Jun 1, 2025 - Aug 31, 2025',
    objective: 'Increase summer collection sales by 30% compared to previous year',
    budget: '$120,000',
    channels: ['facebook', 'instagram', 'email'],
    tasks: [
      { id: 1, title: 'Define campaign objectives and KPIs', completed: true, status: 'completed', dueDate: 'Apr 5, 2025', assignee: 'Maria K.' },
      { id: 2, title: 'Create campaign brief and creative guidelines', completed: true, status: 'completed', dueDate: 'Apr 12, 2025', assignee: 'Tom L.' },
      { id: 3, title: 'Develop content calendar for all channels', completed: true, status: 'completed', dueDate: 'Apr 20, 2025', assignee: 'Sarah C.' },
      { id: 4, title: 'Design hero banner and key visuals', completed: true, status: 'completed', dueDate: 'May 2, 2025', assignee: 'Alex D.' },
      { id: 5, title: 'Produce promotional video for Instagram/Facebook', completed: true, status: 'completed', dueDate: 'May 10, 2025', assignee: 'James M.' },
      { id: 6, title: 'Create Instagram story templates and post creatives', completed: true, status: 'completed', dueDate: 'May 15, 2025', assignee: 'Alex D.' },
      { id: 7, title: 'Set up email automation sequence', completed: true, status: 'completed', dueDate: 'May 18, 2025', assignee: 'Lisa F.' },
      { id: 8, title: 'Configure Facebook/Instagram ad campaigns', completed: true, status: 'completed', dueDate: 'May 22, 2025', assignee: 'Maria K.' },
      { id: 9, title: 'Launch teaser campaign on social media', completed: false, status: 'in-progress', dueDate: 'May 25, 2025', assignee: 'Sarah C.' },
      { id: 10, title: 'Send first promotional email to subscribers', completed: false, status: 'pending', dueDate: 'May 30, 2025', assignee: 'Lisa F.' },
      { id: 11, title: 'Launch main campaign across all channels', completed: false, status: 'pending', dueDate: 'Jun 1, 2025', assignee: 'Maria K.' },
      { id: 12, title: 'Weekly performance review and optimization', completed: false, status: 'pending', dueDate: 'Jun - Aug, 2025', assignee: 'Team' }
    ],
    timeline: [
      { id: 1, title: 'Planning Phase', description: 'Define strategy, audience, and campaign goals', date: 'Apr 1-15, 2025', status: 'completed', completed: true, assignee: 'Marketing Team' },
      { id: 2, title: 'Creative Development', description: 'Design visual assets and content for all channels', date: 'Apr 16 - May 15, 2025', status: 'completed', completed: true, assignee: 'Creative Team' },
      { id: 3, title: 'Campaign Setup', description: 'Configure ad accounts, email sequences, and tracking', date: 'May 16-25, 2025', status: 'in-progress', completed: false, assignee: 'Digital Marketing Team' },
      { id: 4, title: 'Teaser Launch', description: 'Release teaser content across social media channels', date: 'May 26-31, 2025', status: 'pending', completed: false, assignee: 'Content Team' },
      { id: 5, title: 'Full Campaign Launch', description: 'Activate all channels with main campaign', date: 'Jun 1, 2025', status: 'pending', completed: false, assignee: 'Marketing Team' },
      { id: 6, title: 'Mid-Campaign Review', description: 'Analyze initial performance and make adjustments', date: 'Jul 15, 2025', status: 'pending', completed: false, assignee: 'Analytics Team' },
      { id: 7, title: 'Campaign Closure', description: 'End campaign and prepare final reports', date: 'Aug 31, 2025', status: 'pending', completed: false, assignee: 'Marketing Team' }
    ],
    content: [
      { id: 1, title: 'Summer Collection Hero Banner', type: 'image', channel: 'facebook', status: 'completed', dimensions: '1200x628px', creator: 'Alex D.', lastUpdated: 'May 3, 2025' },
      { id: 2, title: 'Summer Vibes Promotional Video', type: 'video', channel: 'instagram', status: 'completed', duration: '0:45', creator: 'James M.', lastUpdated: 'May 12, 2025' },
      { id: 3, title: 'Beach Collection Post Copy', type: 'text', channel: 'instagram', status: 'completed', hashtags: ['summervibes', 'beachfashion', 'summercollection'], creator: 'Sarah C.', lastUpdated: 'May 14, 2025' },
      { id: 4, title: 'Summer Sale Announcement Email', type: 'email', channel: 'email', status: 'in-progress', subject: 'Summer is here! Get 30% off our new collection', creator: 'Lisa F.', lastUpdated: 'May 19, 2025' }
    ]
  };

  // Toggle task completion
  const toggleTaskComplete = (taskId) => {
    // This would update the task completion status in a real app
    console.log(`Toggling task ${taskId} completion status`);
  };

  // Get selected content
  const selectedContent = campaign.content.find(c => c.id === selectedContentId);

  // Get overall campaign metrics
  const getOverallProgress = () => {
    const completedTasks = campaign.tasks.filter(task => task.completed).length;
    return Math.round((completedTasks / campaign.tasks.length) * 100);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900">
      {/* Navigation Bar */}
      <header className="bg-white border-b px-6 py-3">
        <div className="flex items-center">
          <button className="mr-4 text-gray-500 hover:text-indigo-600">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">{campaign.title}</h1>
          <StatusBadge status={campaign.status} className="ml-3" />
          <div className="flex items-center text-sm text-gray-500 ml-4">
            <Calendar size={14} className="mr-1" />
            <span>{campaign.dateRange}</span>
          </div>
          <div className="ml-auto flex space-x-2">
            <button className="px-3 py-1 border rounded-md text-sm hover:bg-gray-50">
              Share
            </button>
            <button className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm">
              Edit Campaign
            </button>
          </div>
        </div>
        
        {/* Campaign Navigation */}
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
          <button 
            onClick={() => setActiveSection('tasks')}
            className={`px-4 py-2 text-sm font-medium ${
              activeSection === 'tasks' 
                ? 'text-indigo-600 border-b-2 border-indigo-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Tasks
          </button>
          <button 
            onClick={() => setActiveSection('timeline')}
            className={`px-4 py-2 text-sm font-medium ${
              activeSection === 'timeline' 
                ? 'text-indigo-600 border-b-2 border-indigo-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Timeline
          </button>
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
        </nav>
      </header>
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-auto p-6">
        {/* Overview Section */}
        {activeSection === 'overview' && (
          <div className="space-y-6">
            {/* Campaign Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-bold mb-4">Campaign Objective</h3>
                <div className="flex items-start mb-4">
                  <Target size={20} className="text-indigo-600 mr-3 mt-0.5" />
                  <p className="text-gray-700">{campaign.objective}</p>
                </div>
                <div className="flex items-start">
                  <Users size={20} className="text-indigo-600 mr-3 mt-0.5" />
                  <div>
                    <p className="text-gray-700 font-medium">Target Audience</p>
                    <p className="text-sm text-gray-600">25-45 year olds, fashion enthusiasts, summer travelers</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-bold mb-4">Campaign Progress</h3>
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium">Overall Progress</span>
                    <span>{getOverallProgress()}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full">
                    <div 
                      className="h-2 bg-indigo-600 rounded-full"
                      style={{ width: `${getOverallProgress()}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Tasks Completed</span>
                    <span>{campaign.tasks.filter(t => t.completed).length}/{campaign.tasks.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Budget Spent</span>
                    <span>$78,000/$120,000</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Timeline</span>
                    <span>Week 8/14</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Channel Summary */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-bold mb-4">Channel Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {campaign.channels.map(channel => (
                  <div key={channel} className="border rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-2">
                        <ChannelIcon channel={channel} />
                      </div>
                      <h4 className="font-medium">{channel.charAt(0).toUpperCase() + channel.slice(1)}</h4>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Content Items</span>
                        <span>{campaign.content.filter(c => c.channel === channel).length}</span>
                      </div>
                      {channel === 'facebook' && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span>Ad Sets</span>
                            <span>3</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Budget</span>
                            <span>$45,000</span>
                          </div>
                        </>
                      )}
                      {channel === 'instagram' && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span>Post Types</span>
                            <span>Feed, Stories, Reels</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Budget</span>
                            <span>$35,000</span>
                          </div>
                        </>
                      )}
                      {channel === 'email' && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span>Email Sequences</span>
                            <span>4</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Budget</span>
                            <span>$15,000</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Tasks Section */}
        {activeSection === 'tasks' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Campaign Tasks</h2>
              <div className="flex space-x-2">
                <button className="px-3 py-1 border rounded-md text-sm">Filter</button>
                <button className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm">Add Task</button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium">
                    {campaign.tasks.filter(t => t.completed).length} of {campaign.tasks.length} tasks completed
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-2 py-1 text-xs border rounded">Sort</button>
                    <button className="px-2 py-1 text-xs border rounded">Group By</button>
                  </div>
                </div>
              </div>
              
              <div className="divide-y">
                {campaign.tasks.map(task => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    onToggleComplete={toggleTaskComplete} 
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Timeline Section */}
        {activeSection === 'timeline' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Campaign Timeline</h2>
              <button className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm">Add Phase</button>
            </div>
            
            <div className="bg-white rounded-lg border p-6">
              <div className="space-y-0">
                {campaign.timeline.map(item => (
                  <TimelineItem key={item.id} item={item} />
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Content Section */}
        {activeSection === 'content' && (
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
                {campaign.content.map(content => (
                  <ContentCard 
                    key={content.id} 
                    content={content}
                    isSelected={content.id === selectedContentId}
                    onClick={setSelectedContentId}
                  />
                ))}
              </div>
              
              <div className="md:col-span-2">
                {selectedContent ? (
                  <ContentPreviewPanel content={selectedContent} />
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
  );
};

export default SummerCampaignFlow