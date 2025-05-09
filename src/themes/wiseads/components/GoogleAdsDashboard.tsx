// src/themes/default/components/GoogleAdsDashboard.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '@/auth/useAuth';
import { useFlow } from '@/core/context';
import { 
  DollarSign, 
  RefreshCw,
  Edit,
  AlertTriangle,
  MousePointer,
  Search,
  Eye
} from 'lucide-react';

// Mock data directly in component to avoid dependencies
const mockCampaignDetails = (campaignId: string) => {
  // Base data structure for each campaign
  const baseData = {
    success: true,
    data: {
      id: campaignId,
      name: `Product campaign ${campaignId.slice(-4)}`,
      status: Math.random() > 0.3 ? "ENABLED" : "PAUSED",
      budget: {
        amountMicros: Math.floor(Math.random() * 50000000) + 10000000, // 10-60 PLN
        delivery_method: "STANDARD"
      },
      advertisingChannelType: ["SEARCH", "DISPLAY", "VIDEO"][Math.floor(Math.random() * 3)],
      startDate: "20250201",
      endDate: Math.random() > 0.5 ? "20251201" : undefined,
      metrics: {
        impressions: Math.floor(Math.random() * 10000) + 100,
        clicks: Math.floor(Math.random() * 500) + 10,
        ctr: (Math.random() * 0.05) + 0.01, // 1-6%
        averageCpc: Math.floor(Math.random() * 1000000) + 100000, // 0.1-1.1 PLN
        cost: Math.floor(Math.random() * 50000000) + 1000000, // 1-51 PLN
        conversions: Math.floor(Math.random() * 20),
        conversionRate: Math.random() * 0.02,
      }
    }
  };

  // Predefined campaigns with specific IDs for more consistent data
  const predefinedCampaigns: Record<string, any> = {
    "1234567890": {
      success: true,
      data: {
        id: "1234567890",
        name: "Spring promotion - sports shoes",
        status: "ENABLED",
        budget: {
          amountMicros: 30000000, // 30 PLN
          delivery_method: "STANDARD"
        },
        advertisingChannelType: "SEARCH",
        startDate: "20250401",
        endDate: "20250630",
        metrics: {
          impressions: 5426,
          clicks: 287,
          ctr: 0.0529,
          averageCpc: 580000, // 0.58 PLN
          cost: 16646000, // 16.65 PLN
          conversions: 12,
          conversionRate: 0.0418
        }
      }
    },
    "2345678901": {
      success: true,
      data: {
        id: "2345678901",
        name: "Summer sale - clothing",
        status: "ENABLED",
        budget: {
          amountMicros: 50000000, // 50 PLN
          delivery_method: "STANDARD"
        },
        advertisingChannelType: "DISPLAY",
        startDate: "20250515",
        endDate: "20250815",
        metrics: {
          impressions: 12534,
          clicks: 453,
          ctr: 0.0361,
          averageCpc: 420000, // 0.42 PLN
          cost: 19026000, // 19.03 PLN
          conversions: 8,
          conversionRate: 0.0176
        }
      }
    }
  };

  // Add a delay to simulate network latency
  return new Promise(resolve => {
    setTimeout(() => {
      // Return predefined campaign if it exists, otherwise use base data
      resolve(predefinedCampaigns[campaignId] || baseData);
    }, Math.random() * 800 + 200); // 200-1000ms delay
  });
};

// Mock update campaign function
const mockUpdateCampaign = (campaignId: string, updateData: any) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        success: true,
        data: {
          id: campaignId,
          name: updateData.name || `Campaign ${campaignId.slice(-4)}`,
          status: updateData.status || "ENABLED",
          updatedAt: new Date().toISOString(),
          message: "Campaign was updated successfully"
        }
      });
    }, Math.random() * 800 + 500); // 500-1300ms delay
  });
};

interface GoogleAdsDashboardProps {
  data?: any;
  onSubmit: (data: any) => void;
  title?: string;
  description?: string;
  enableEdit?: boolean;
}

export default function GoogleAdsDashboard({
  data,
  onSubmit,
  title = "Google Ads Campaign Dashboard",
  description,
  enableEdit = true
}: GoogleAdsDashboardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [campaignData, setCampaignData] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const { getToken } = useAuth();
  const { get } = useFlow();

  // Get data from context
  const campaignBasic = get('campaign-basic');
  const campaignCreationResult = get('campaign-creation-result');
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    campaignName: campaignBasic?.campaignName || '',
    campaignBudget: campaignBasic?.campaignBudget || 0,
    campaignStatus: campaignBasic?.campaignStatus || 'PAUSED'
  });

  useEffect(() => {
    fetchCampaignData();
  }, []);

  const fetchCampaignData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get campaign ID from result
      const campaignId = campaignCreationResult?.campaignId || data?.selectedCampaign || "1234567890";
      if (!campaignId) {
        throw new Error("Missing campaign identifier");
      }

      // Use mock API directly
      const response: any = await mockCampaignDetails(campaignId);
        
      // Check if response status is valid
      if (!response.success) {
        throw new Error(response.error?.message || "Error fetching campaign data");
      }

      // Process response
      setCampaignData(response.data);
      
      // Update edit form state
      setEditForm({
        campaignName: response.data.name || campaignBasic?.campaignName || '',
        campaignBudget: response.data.budget?.amountMicros 
          ? response.data.budget.amountMicros / 1000000 
          : campaignBasic?.campaignBudget || 0,
        campaignStatus: response.data.status || campaignBasic?.campaignStatus || 'PAUSED'
      });
      
    } catch (err: any) {
      console.error("Error fetching campaign data:", err);
      setError(err.message || "An error occurred while fetching campaign data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCampaign = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get campaign ID from result
      const campaignId = campaignCreationResult?.campaignId || data?.selectedCampaign || "1234567890";
      if (!campaignId) {
        throw new Error("Missing campaign identifier");
      }

      // Prepare update data
      const updateData = {
        name: editForm.campaignName,
        budget: {
          amount_micros: Math.round(editForm.campaignBudget * 1000000),
        },
        status: editForm.campaignStatus
      };

      // Use mock update directly
      const response: any = await mockUpdateCampaign(campaignId, updateData);
        
      // Check if response status is valid
      if (!response.success) {
        throw new Error(response.error?.message || "Error updating campaign");
      }

      // Refresh data
      await fetchCampaignData();
      
      // Close edit modal
      setShowEditModal(false);
      
    } catch (err: any) {
      console.error("Error updating campaign:", err);
      setError(err.message || "An error occurred while updating the campaign");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to render performance chart
  const renderPerformanceChart = () => {
    // Simple bar chart with mock data
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const mockImpressions = [150, 220, 180, 250, 300, 210, 190];
    const mockClicks = [8, 12, 9, 15, 20, 11, 8];
    
    const maxValue = Math.max(...mockImpressions);
    
    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-2">
          <div className="flex space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
              <span className="text-xs text-gray-500">Impressions</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
              <span className="text-xs text-gray-500">Clicks</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-end h-48 space-x-2">
          {days.map((day, index) => (
            <div key={day} className="flex-1 flex flex-col items-center">
              <div className="w-full flex flex-col items-center space-y-1">
                <div 
                  className="w-full bg-blue-400 rounded-t" 
                  style={{ height: `${(mockImpressions[index] / maxValue) * 120}px` }}
                ></div>
                <div 
                  className="w-1/2 bg-green-400 rounded-t" 
                  style={{ height: `${(mockClicks[index] / maxValue) * 120 * 10}px` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">{day}</div>
            </div>
          ))}
        </div>
        
        <div className="text-xs text-gray-400 text-center mt-2">
          * Data shown for the last 7 days
        </div>
      </div>
    );
  };
  
  // Function to render performance indicators
  const renderPerformanceIndicators = () => {
    // Use data from API or mock values
    const ctr = campaignData?.metrics?.ctr || 0.025; // 2.5%
    const conversionRate = campaignData?.metrics?.conversionRate || 0.015; // 1.5%
    const averageCpc = campaignData?.metrics?.averageCpc || 120000; // 0.12 PLN in micro units
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-1">
            <MousePointer className="w-4 h-4 text-blue-500" />
            <h4 className="text-sm font-medium text-gray-700">CTR</h4>
          </div>
          <p className="text-xl font-semibold text-gray-900">{(ctr * 100).toFixed(2)}%</p>
          <p className="text-xs text-gray-500 mt-2">
            Click-Through Rate
          </p>
        </div>
        
        <div className="bg-white p-4 rounded shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-1">
            <DollarSign className="w-4 h-4 text-green-500" />
            <h4 className="text-sm font-medium text-gray-700">Avg. CPC</h4>
          </div>
          <p className="text-xl font-semibold text-gray-900">{(averageCpc / 1000000).toFixed(2)} PLN</p>
          <p className="text-xs text-gray-500 mt-2">
            Average cost per click
          </p>
        </div>
        
        <div className="bg-white p-4 rounded shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-1">
            <TrendingUp className="w-4 h-4 text-purple-500" />
            <h4 className="text-sm font-medium text-gray-700">Conversions</h4>
          </div>
          <p className="text-xl font-semibold text-gray-900">{(conversionRate * 100).toFixed(2)}%</p>
          <p className="text-xs text-gray-500 mt-2">
            Conversion rate (estimated)
          </p>
        </div>
      </div>
    );
  };
  
  // Render recommendations
  const renderRecommendations = () => {
    // Mock recommendations
    const recommendations = [
      {
        id: 1,
        title: 'Increase campaign budget',
        description: 'Campaign is performing well, increasing budget may bring more conversions.',
        impact: 'high'
      },
      {
        id: 2,
        title: 'Add new keywords',
        description: 'Consider adding long-tail keywords to increase visibility.',
        impact: 'medium'
      },
      {
        id: 3,
        title: 'Optimize display hours',
        description: 'Most conversions happen between 10-14 hours, consider increasing bids during this time.',
        impact: 'low'
      }
    ];
    
    const getImpactBadge = (impact: string) => {
      const classes = {
        high: 'bg-green-100 text-green-800',
        medium: 'bg-blue-100 text-blue-800',
        low: 'bg-gray-100 text-gray-800'
      };
      
      const labels = {
        high: 'High impact',
        medium: 'Medium impact',
        low: 'Low impact'
      };
      
      return (
        <span className={`text-xs px-2 py-1 rounded ${classes[impact as keyof typeof classes]}`}>
          {labels[impact as keyof typeof labels]}
        </span>
      );
    };
    
    return (
      <div className="space-y-4">
        {recommendations.map(rec => (
          <div key={rec.id} className="bg-white p-4 rounded border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start">
              <h4 className="text-sm font-medium text-gray-900">{rec.title}</h4>
              {getImpactBadge(rec.impact)}
            </div>
            <p className="text-xs text-gray-600 mt-2">{rec.description}</p>
          </div>
        ))}
      </div>
    );
  };
  
  // Render loading state
  if (isLoading && !campaignData) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
        <h2 className="text-xl font-medium text-gray-900">{title}</h2>
        <p className="text-gray-600 text-center max-w-md">
          Loading campaign data. This may take a moment...
        </p>
      </div>
    );
  }

  // Render error state
  if (error && !campaignData) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-medium text-red-700">Error loading data</h2>
        <div className="bg-red-50 p-4 rounded border border-red-200 text-red-800 text-sm max-w-lg">
          <p>{error}</p>
        </div>
        <button
          onClick={fetchCampaignData}
          className="mt-6 px-5 py-2.5 rounded transition-colors text-sm font-medium bg-black text-white hover:bg-gray-800"
        >
          Try again
        </button>
      </div>
    );
  }

  // Edit modal
  const renderEditModal = () => {
    if (!showEditModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Edit campaign</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campaign name
              </label>
              <input
                type="text"
                value={editForm.campaignName}
                onChange={(e) => setEditForm({...editForm, campaignName: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Daily budget (PLN)
              </label>
              <input
                type="number"
                value={editForm.campaignBudget}
                onChange={(e) => setEditForm({...editForm, campaignBudget: parseFloat(e.target.value)})}
                min="1"
                step="0.01"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum amount Google Ads can spend on your campaign each day.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campaign status
              </label>
              <select
                value={editForm.campaignStatus}
                onChange={(e) => setEditForm({...editForm, campaignStatus: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="PAUSED">Paused</option>
                <option value="ENABLED">Active</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                When a campaign is paused, ads aren't shown and you aren't charged.
              </p>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Advanced options</h4>
              
              <div className="bg-blue-50 border border-blue-100 rounded p-3 mb-4">
                <p className="text-xs text-blue-700">
                  Additional settings, such as ad scheduling, location targeting, and advanced bidding strategies, are available in the full Google Ads panel.
                </p>
              </div>
              
              <div className="flex items-center mb-4">
                <input
                  id="optimize-conversions"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="optimize-conversions" className="ml-2 block text-sm text-gray-700">
                  Optimize campaign for conversions (not CPC)
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="enable-accelerated-delivery"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="enable-accelerated-delivery" className="ml-2 block text-sm text-gray-700">
                  Enable accelerated ad delivery
                </label>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateCampaign}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Main dashboard view
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      {renderEditModal()}
      
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-medium text-gray-900">{title}</h2>
            {description && <p className="text-gray-500 text-sm mt-1">{description}</p>}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={fetchCampaignData}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4 mr-1.5" />
              Refresh
            </button>
            
            {enableEdit && (
              <button
                onClick={() => setShowEditModal(true)}
                className="inline-flex items-center px-3 py-1.5 bg-blue-600 rounded text-sm text-white hover:bg-blue-700"
              >
                <Edit className="w-4 h-4 mr-1.5" />
                Edit campaign
              </button>
            )}
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-50 rounded border border-red-200 text-red-700 text-sm">
          <p className="flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2" />
            {error}
          </p>
        </div>
      )}
      
      <div className="p-6">
        {/* Main metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Campaign status */}
          <div className="bg-white p-4 rounded shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${
                campaignData?.status === 'ENABLED' ? 'bg-green-500' : 'bg-yellow-500'
              }`}></div>
              <h3 className="text-sm font-medium text-gray-700">Status</h3>
            </div>
            <p className="text-base font-medium text-gray-900">
              {campaignData?.status === 'ENABLED' ? 'Active' : 'Paused'}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {campaignData?.status === 'ENABLED' 
                ? 'Campaign is displaying in Google Ads and collecting data' 
                : 'Campaign is paused and not showing in search results'}
            </p>
          </div>
          
          {/* Daily budget */}
          <div className="bg-white p-4 rounded shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-medium text-gray-700">Daily budget</h3>
            </div>
            <p className="text-base font-medium text-gray-900">
              {campaignData?.budget?.amountMicros 
                ? (campaignData.budget.amountMicros / 1000000).toFixed(2) 
                : '0.00'} PLN
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Maximum daily amount to spend
            </p>
          </div>
          
          {/* Impressions */}
          <div className="bg-white p-4 rounded shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-2">
              <Eye className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-medium text-gray-700">Impressions</h3>
            </div>
            <p className="text-base font-medium text-gray-900">
              {campaignData?.metrics?.impressions?.toLocaleString() || '0'}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Total number of ad impressions
            </p>
          </div>
          
          {/* Clicks */}
          <div className="bg-white p-4 rounded shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-2">
              <MousePointer className="w-4 h-4 text-green-500" />
              <h3 className="text-sm font-medium text-gray-700">Clicks</h3>
            </div>
            <p className="text-base font-medium text-gray-900">
              {campaignData?.metrics?.clicks?.toLocaleString() || '0'}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Number of ad clicks
            </p>
          </div>
        </div>
        
        {/* Analytics cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Performance metrics */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-full">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-medium text-gray-900">Performance metrics</h3>
              </div>
              <div className="p-4">
                {renderPerformanceIndicators()}
              </div>
            </div>
          </div>
          
          {/* Card 2: Campaign summary */}
          <div>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-full">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-medium text-gray-900">Campaign summary</h3>
              </div>
              <div className="divide-y divide-gray-100">
                <div className="flex justify-between py-3 px-4">
                  <span className="text-sm text-gray-500">Campaign ID</span>
                  <span className="text-sm font-medium text-gray-900">{campaignData?.id || campaignCreationResult?.campaignId || 'N/A'}</span>
                </div>
                
                <div className="flex justify-between py-3 px-4">
                  <span className="text-sm text-gray-500">Campaign name</span>
                  <span className="text-sm font-medium text-gray-900">{campaignData?.name || campaignBasic?.campaignName || 'N/A'}</span>
                </div>
                
                <div className="flex justify-between py-3 px-4">
                  <span className="text-sm text-gray-500">Campaign type</span>
                  <span className="text-sm font-medium text-gray-900">
                    {campaignData?.advertisingChannelType === 'SEARCH' ? 'Search' : 
                     campaignData?.advertisingChannelType === 'DISPLAY' ? 'Display network' : 
                     campaignData?.advertisingChannelType === 'VIDEO' ? 'Video' : 
                     campaignBasic?.advertisingChannel === 'SEARCH' ? 'Search' : 
                     campaignBasic?.advertisingChannel === 'DISPLAY' ? 'Display network' : 
                     campaignBasic?.advertisingChannel === 'VIDEO' ? 'Video' : 'N/A'}
                  </span>
                </div>
                
                <div className="flex justify-between py-3 px-4">
                  <span className="text-sm text-gray-500">Start date</span>
                  <span className="text-sm font-medium text-gray-900">
                    {campaignData?.startDate ? 
                      `${campaignData.startDate.slice(0, 4)}-${campaignData.startDate.slice(4, 6)}-${campaignData.startDate.slice(6, 8)}` :
                      campaignBasic?.campaignStartDate || 'N/A'}
                  </span>
                </div>
                
                <div className="flex justify-between py-3 px-4">
                  <span className="text-sm text-gray-500">End date</span>
                  <span className="text-sm font-medium text-gray-900">
                    {campaignData?.endDate ? 
                      `${campaignData.endDate.slice(0, 4)}-${campaignData.endDate.slice(4, 6)}-${campaignData.endDate.slice(6, 8)}` :
                      campaignBasic?.campaignEndDate || 'No end date'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Chart and recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-full">
              <div className="p-4 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-gray-900">Campaign performance</h3>
                  <div className="inline-flex rounded-md shadow-sm text-xs">
                    <button className="py-1 px-2 border border-r-0 border-gray-300 rounded-l-md bg-white text-gray-700 hover:bg-gray-50">
                      7 days
                    </button>
                    <button className="py-1 px-2 border border-r-0 border-gray-300 bg-blue-50 text-blue-700">
                      30 days
                    </button>
                    <button className="py-1 px-2 border border-gray-300 rounded-r-md bg-white text-gray-700 hover:bg-gray-50">
                      90 days
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {renderPerformanceChart()}
              </div>
            </div>
          </div>
          
          {/* Recommendations */}
          <div>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-full">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-medium text-gray-900">Recommendations</h3>
              </div>
              <div className="p-4">
                {renderRecommendations()}
              </div>
            </div>
          </div>
        </div>
        
        {/* Keywords */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
          <div className="p-4 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-gray-900">Keywords</h3>
              <button className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800">
                <Search className="w-3 h-3 mr-1" />
                Manage keywords
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Keyword
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Impressions
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clicks
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CTR
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg. CPC
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Example keywords - we can use data from context or generate sample data */}
                {['sports shoes', 'men\'s footwear', 'shoe promotion', 'cheap shoes', 'best shoes']
                  .map((keyword: string, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {keyword}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {Math.floor(Math.random() * 1000)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {Math.floor(Math.random() * 100)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(Math.random() * 5).toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(Math.random() * 2).toFixed(2)} PLN
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Continue button */}
        <div className="flex justify-end">
          <button
            onClick={() => onSubmit(campaignData || {})}
            className="px-5 py-2.5 rounded transition-colors text-sm font-medium bg-black text-white hover:bg-gray-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// Calendar component if it's missing from lucide-react imports
export const Calendar = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

// TrendingUp component if it's missing from lucide-react imports
export const TrendingUp = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
);