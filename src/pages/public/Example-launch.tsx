import { useState } from 'react';
import { 

  BrainCircuit, 
  Facebook, 
  Instagram, 
  Youtube, 
  Search, 
  MessageSquare,
  Plus,
  Calendar,
  Clock,
  ArrowLeft,
  BarChart2,
  CheckSquare,
  Edit3,
  Users,
  Target,
  Send
} from 'lucide-react';

const SmartHomeScenario = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Scenario Details
  const scenario = { 
    id: 2, 
    title: 'Product Launch - SmartHome', 
    progress: 30, 
    tasks: 15, 
    completedTasks: 5, 
    status: 'in-progress',
    channels: ['facebook', 'youtube', 'google'],
    connections: [1, 3],
    description: 'Launch campaign for our new SmartHome product line including connected devices, mobile app and subscription service.',
    startDate: '2025-04-15',
    endDate: '2025-07-30',
    budget: 50000,
    target: {
      audience: 'Homeowners, Tech-savvy professionals, 28-45 age group',
      locations: 'US, Canada, UK',
      interests: 'Smart technology, Home automation, IoT'
    },
    team: [
      { id: 1, name: 'Anna Johnson', role: 'Campaign Manager', avatar: '/api/placeholder/32/32' },
      { id: 2, name: 'Mike Chen', role: 'Content Creator', avatar: '/api/placeholder/32/32' },
      { id: 3, name: 'Sarah Williams', role: 'Social Media Manager', avatar: '/api/placeholder/32/32' },
      { id: 4, name: 'David Kim', role: 'Ads Specialist', avatar: '/api/placeholder/32/32' }
    ]
  };
  
  // Tasks for this scenario
  const tasks = [
    { id: 1, title: 'Create product feature highlights', status: 'completed', assignee: 'Mike Chen', dueDate: '2025-04-30' },
    { id: 2, title: 'Design Facebook campaign visuals', status: 'completed', assignee: 'Sarah Williams', dueDate: '2025-05-10' },
    { id: 3, title: 'Produce demo video for YouTube', status: 'completed', assignee: 'Mike Chen', dueDate: '2025-05-15' },
    { id: 4, title: 'Set up Google Ads campaign structure', status: 'completed', assignee: 'David Kim', dueDate: '2025-05-12' },
    { id: 5, title: 'Write product launch blog post', status: 'completed', assignee: 'Anna Johnson', dueDate: '2025-05-20' },
    { id: 6, title: 'Schedule social media announcement posts', status: 'in-progress', assignee: 'Sarah Williams', dueDate: '2025-05-25' },
    { id: 7, title: 'Create email newsletter for existing customers', status: 'in-progress', assignee: 'Anna Johnson', dueDate: '2025-05-30' },
    { id: 8, title: 'Launch Facebook ads campaign', status: 'todo', assignee: 'Sarah Williams', dueDate: '2025-06-01' },
    { id: 9, title: 'Launch Google ads campaign', status: 'todo', assignee: 'David Kim', dueDate: '2025-06-01' },
    { id: 10, title: 'Publish YouTube demo video', status: 'todo', assignee: 'Mike Chen', dueDate: '2025-06-01' },
    { id: 11, title: 'Monitor initial campaign performance', status: 'todo', assignee: 'Anna Johnson', dueDate: '2025-06-15' },
    { id: 12, title: 'Create mid-campaign report', status: 'todo', assignee: 'Anna Johnson', dueDate: '2025-06-30' },
    { id: 13, title: 'Adjust campaigns based on initial data', status: 'todo', assignee: 'David Kim', dueDate: '2025-07-05' },
    { id: 14, title: 'Create testimonial stories from early adopters', status: 'todo', assignee: 'Mike Chen', dueDate: '2025-07-15' },
    { id: 15, title: 'Produce final campaign report', status: 'todo', assignee: 'Anna Johnson', dueDate: '2025-07-30' }
  ];
  
  // Milestones
  const milestones = [
    { id: 1, title: 'Campaign Assets Created', date: '2025-05-20', status: 'completed' },
    { id: 2, title: 'Campaign Launch', date: '2025-06-01', status: 'upcoming' },
    { id: 3, title: 'Mid-campaign Optimization', date: '2025-07-01', status: 'upcoming' },
    { id: 4, title: 'Campaign Close & Reporting', date: '2025-07-30', status: 'upcoming' }
  ];
  
  // Helper function to get channel icon
  const getChannelIcon = (channel: string) => {
    switch(channel) {
      case 'facebook': return <Facebook size={16} className="text-blue-600" />;
      case 'instagram': return <Instagram size={16} className="text-pink-600" />;
      case 'youtube': return <Youtube size={16} className="text-red-600" />;
      case 'email': return <MessageSquare size={16} className="text-purple-600" />;
      case 'google': return <Search size={16} className="text-yellow-600" />;
      default: return null;
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
                <button className="flex items-center w-full p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                  <ArrowLeft size={18} className="mr-3" />
                  <span>Back to Scenarios</span>
                </button>
              </li>
              <li className="pt-4">
                <button 
                  onClick={() => setActiveTab('overview')}
                  className={`flex items-center w-full p-2 rounded-md ${activeTab === 'overview' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <Target size={18} className="mr-3" />
                  <span>Overview</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('tasks')}
                  className={`flex items-center w-full p-2 rounded-md ${activeTab === 'tasks' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <CheckSquare size={18} className="mr-3" />
                  <span>Tasks</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('analytics')}
                  className={`flex items-center w-full p-2 rounded-md ${activeTab === 'analytics' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <BarChart2 size={18} className="mr-3" />
                  <span>Analytics</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('team')}
                  className={`flex items-center w-full p-2 rounded-md ${activeTab === 'team' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <Users size={18} className="mr-3" />
                  <span>Team</span>
                </button>
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
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">{scenario.title}</h1>
              <button className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm flex items-center">
                <Edit3 size={16} className="mr-2" />
                Edit Scenario
              </button>
            </div>
            
            <div className="flex items-center mt-4 text-sm space-x-4">
              <div className="flex items-center">
                <Calendar size={16} className="mr-1 text-gray-500" />
                <span>{scenario.startDate} to {scenario.endDate}</span>
              </div>
              <div className="flex items-center">
                <div className="mr-1 px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-800">In Progress</div>
              </div>
              <div className="flex space-x-1">
                {scenario.channels.map((channel, idx) => (
                  <div key={idx} className="p-1 bg-gray-100 rounded">
                    {getChannelIcon(channel)}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Progress card */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium mb-4">Campaign Progress</h3>
                <div className="flex items-center text-sm mb-2">
                  <span className="font-medium">Overall Completion:</span>
                  <span className="ml-2">{scenario.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full mb-4">
                  <div 
                    className="h-2 rounded-full bg-amber-500"
                    style={{ width: `${scenario.progress}%` }}
                  ></div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Tasks</p>
                    <p className="font-bold">{scenario.completedTasks}/{scenario.tasks}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Days Remaining</p>
                    <p className="font-bold">65</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Budget Used</p>
                    <p className="font-bold">$15,000</p>
                  </div>
                </div>
              </div>
              
              {/* Milestone timeline */}
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
              
              {/* Description and target audience */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium mb-3">Campaign Description</h3>
                  <p className="text-gray-700">{scenario.description}</p>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium mb-3">Target Audience</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Audience</p>
                      <p>{scenario.target.audience}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Locations</p>
                      <p>{scenario.target.locations}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Interests</p>
                      <p>{scenario.target.interests}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Connected scenarios */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium mb-4">Connected Scenarios</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium">Summer Campaign 2025</h4>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>65%</span>
                      </div>
                      <div className="w-full bg-gray-200 h-1.5 rounded-full">
                        <div 
                          className="h-1.5 rounded-full bg-indigo-600"
                          style={{ width: '65%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium">Holiday Season Planning</h4>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>10%</span>
                      </div>
                      <div className="w-full bg-gray-200 h-1.5 rounded-full">
                        <div 
                          className="h-1.5 rounded-full bg-amber-500"
                          style={{ width: '10%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b flex justify-between items-center">
                  <h3 className="text-lg font-medium">Campaign Tasks</h3>
                  <div className="flex space-x-2">
                    <select className="text-sm border rounded-md px-2 py-1">
                      <option>All Tasks</option>
                      <option>Completed</option>
                      <option>In Progress</option>
                      <option>To Do</option>
                    </select>
                    <button className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm flex items-center">
                      <Plus size={14} className="mr-1" />
                      Add Task
                    </button>
                  </div>
                </div>
                
                <div className="divide-y">
                  {tasks.map(task => (
                    <div key={task.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center">
                        <div className={`w-5 h-5 rounded-md mr-3 flex items-center justify-center ${
                          task.status === 'completed' ? 'bg-green-100 text-green-600' : 
                          task.status === 'in-progress' ? 'bg-amber-100 text-amber-600' : 
                          'bg-gray-100 text-gray-400'
                        }`}>
                          {task.status === 'completed' && <CheckSquare size={12} />}
                          {task.status === 'in-progress' && <Clock size={12} />}
                        </div>
                        <div>
                          <p className={task.status === 'completed' ? 'line-through text-gray-500' : ''}>{task.title}</p>
                          <p className="text-xs text-gray-500">Assigned to: {task.assignee}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-4">Due: {task.dueDate}</span>
                        <button className="p-1 text-gray-400 hover:text-indigo-600">
                          <Edit3 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium mb-4">Campaign Performance</h3>
                <div className="flex justify-between items-center mb-6">
                  <div className="text-sm space-x-2">
                    <button className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md">Last 7 days</button>
                    <button className="px-3 py-1 text-gray-500 hover:bg-gray-100 rounded-md">Last 30 days</button>
                    <button className="px-3 py-1 text-gray-500 hover:bg-gray-100 rounded-md">All time</button>
                  </div>
                  <select className="text-sm border rounded-md px-2 py-1">
                    <option>All Channels</option>
                    <option>Facebook</option>
                    <option>YouTube</option>
                    <option>Google Ads</option>
                  </select>
                </div>
                
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center mb-6">
                  <div className="text-center">
                    <BarChart2 size={32} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Campaign metrics visualization</p>
                    <p className="text-xs text-gray-400">Performance data will appear here once the campaign launches</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-xs text-gray-500">Impressions</p>
                    <p className="text-xl font-bold">-</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-xs text-gray-500">Reach</p>
                    <p className="text-xl font-bold">-</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-xs text-gray-500">Engagement</p>
                    <p className="text-xl font-bold">-</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-xs text-gray-500">Conversions</p>
                    <p className="text-xl font-bold">-</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium mb-4">Channel Breakdown</h3>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Data will be available after launch</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium mb-4">Audience Insights</h3>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Data will be available after launch</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'team' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b flex justify-between items-center">
                  <h3 className="text-lg font-medium">Campaign Team</h3>
                  <button className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm flex items-center">
                    <Plus size={14} className="mr-1" />
                    Add Team Member
                  </button>
                </div>
                
                <div className="divide-y">
                  {scenario.team.map(member => (
                    <div key={member.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center">
                        <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full mr-3" />
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-gray-500">{member.role}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 text-sm border rounded-md flex items-center">
                          <MessageSquare size={14} className="mr-1" />
                          Message
                        </button>
                        <button className="px-3 py-1 text-sm border rounded-md flex items-center">
                          <CheckSquare size={14} className="mr-1" />
                          View Tasks
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium mb-4">Team Activity</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      <img src="/api/placeholder/32/32" alt="User" className="w-8 h-8 rounded-full" />
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 flex-1">
                      <div className="flex justify-between items-start">
                        <p><span className="font-medium">Mike Chen</span> completed task <span className="text-indigo-600">Produce demo video for YouTube</span></p>
                        <span className="text-xs text-gray-500">1h ago</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      <img src="/api/placeholder/32/32" alt="User" className="w-8 h-8 rounded-full" />
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 flex-1">
                      <div className="flex justify-between items-start">
                        <p><span className="font-medium">Sarah Williams</span> started working on <span className="text-indigo-600">Schedule social media announcement posts</span></p>
                        <span className="text-xs text-gray-500">3h ago</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      <img src="/api/placeholder/32/32" alt="User" className="w-8 h-8 rounded-full" />
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 flex-1">
                      <div className="flex justify-between items-start">
                        <p><span className="font-medium">Anna Johnson</span> started working on <span className="text-indigo-600">Create email newsletter for existing customers</span></p>
                        <span className="text-xs text-gray-500">5h ago</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      <img src="/api/placeholder/32/32" alt="User" className="w-8 h-8 rounded-full" />
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 flex-1">
                      <div className="flex justify-between items-start">
                        <p><span className="font-medium">David Kim</span> completed task <span className="text-indigo-600">Set up Google Ads campaign structure</span></p>
                        <span className="text-xs text-gray-500">Yesterday</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <div className="flex">
                    <input type="text" className="flex-1 border rounded-l-md px-3 py-2 text-sm" placeholder="Post an update or comment..." />
                    <button className="bg-indigo-600 text-white px-3 py-2 rounded-r-md">
                      <Send size={16} />
                    </button>
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

export default SmartHomeScenario;