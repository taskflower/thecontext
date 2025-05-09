// src/themes/default/components/GoogleAdsCampaignMonitor.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '@/auth/useAuth';
import { 
  BarChart, 
  RefreshCw,
  AlertTriangle,
  DollarSign,
  Search,
  Eye,
  MousePointer,
  ArrowRight,
  Filter,
  Download
} from 'lucide-react';

// Mock data directly in component to avoid dependencies
const mockCampaignsList = () => {
  // List of predefined campaigns
  const predefinedCampaigns = [
    {
      id: "1234567890",
      name: "Spring promotion - sports shoes",
      status: "ENABLED",
      budget: {
        amountMicros: 30000000, // 30 PLN
      },
      startDate: "20250401",
      endDate: "20250630",
      type: "SEARCH",
      metrics: {
        impressions: 5426,
        clicks: 287,
        ctr: 0.0529,
        averageCpc: 580000, // 0.58 PLN
        cost: 16646000, // 16.65 PLN
      }
    },
    {
      id: "2345678901",
      name: "Summer sale - clothing",
      status: "ENABLED",
      budget: {
        amountMicros: 50000000, // 50 PLN
      },
      startDate: "20250515",
      endDate: "20250815",
      type: "DISPLAY",
      metrics: {
        impressions: 12534,
        clicks: 453,
        ctr: 0.0361,
        averageCpc: 420000, // 0.42 PLN
        cost: 19026000, // 19.03 PLN
      }
    },
    {
      id: "3456789012",
      name: "Premium products - electronics",
      status: "PAUSED",
      budget: {
        amountMicros: 70000000, // 70 PLN
      },
      startDate: "20250310",
      endDate: undefined,
      type: "VIDEO",
      metrics: {
        impressions: 3245,
        clicks: 98,
        ctr: 0.0302,
        averageCpc: 830000, // 0.83 PLN
        cost: 8134000, // 8.13 PLN
      }
    },
    {
      id: "4567890123",
      name: "Local campaign - restaurant",
      status: "ENABLED",
      budget: {
        amountMicros: 20000000, // 20 PLN
      },
      startDate: "20250215",
      endDate: undefined,
      type: "SEARCH",
      metrics: {
        impressions: 1875,
        clicks: 145,
        ctr: 0.0773,
        averageCpc: 350000, // 0.35 PLN
        cost: 5075000, // 5.08 PLN
      }
    },
    {
      id: "5678901234",
      name: "Men's footwear - fall 2025",
      status: "PAUSED",
      budget: {
        amountMicros: 40000000, // 40 PLN
      },
      startDate: "20250801",
      endDate: "20251130",
      type: "DISPLAY",
      metrics: {
        impressions: 6789,
        clicks: 254,
        ctr: 0.0374,
        averageCpc: 490000, // 0.49 PLN
        cost: 12446000, // 12.45 PLN
      }
    },
    {
      id: "6789012345",
      name: "Holiday promotion 2025",
      status: "ENABLED",
      budget: {
        amountMicros: 60000000, // 60 PLN
      },
      startDate: "20251115",
      endDate: "20251224",
      type: "SEARCH",
      metrics: {
        impressions: 230,
        clicks: 12,
        ctr: 0.0522,
        averageCpc: 520000, // 0.52 PLN
        cost: 624000, // 0.62 PLN
      }
    },
    {
      id: "7890123456",
      name: "Women's jewelry",
      status: "ENABLED",
      budget: {
        amountMicros: 35000000, // 35 PLN
      },
      startDate: "20250301",
      endDate: undefined,
      type: "DISPLAY",
      metrics: {
        impressions: 8763,
        clicks: 321,
        ctr: 0.0366,
        averageCpc: 540000, // 0.54 PLN
        cost: 17334000, // 17.33 PLN
      }
    }
  ];

  // Generate additional random campaigns
  const generateRandomCampaigns = (count: number) => {
    const channels = ["SEARCH", "DISPLAY", "VIDEO"];
    const statuses = ["ENABLED", "PAUSED"];
    const productTypes = ["Shoes", "Clothes", "Electronics", "Cosmetics", "Accessories", "Furniture", "Sports", "Jewelry"];
    const campaignTypes = ["Seasonal", "Promotional", "Sale", "New collection", "Limited edition", "Bestsellers"];
    
    return Array.from({ length: count }).map((_, index) => {
      const impressions = Math.floor(Math.random() * 10000) + 100;
      const clicks = Math.floor(Math.random() * 500) + 5;
      const ctr = clicks / impressions;
      const averageCpc = Math.floor(Math.random() * 1000000) + 100000; // 0.1-1.1 PLN
      
      return {
        id: `random-${index}-${Date.now()}`,
        name: `${campaignTypes[Math.floor(Math.random() * campaignTypes.length)]} - ${productTypes[Math.floor(Math.random() * productTypes.length)]}`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        budget: {
          amountMicros: Math.floor(Math.random() * 50000000) + 10000000, // 10-60 PLN
        },
        startDate: "20250101",
        endDate: Math.random() > 0.5 ? "20251231" : undefined,
        type: channels[Math.floor(Math.random() * channels.length)],
        metrics: {
          impressions,
          clicks,
          ctr,
          averageCpc,
          cost: clicks * averageCpc,
        }
      };
    });
  };

  // Combine predefined campaigns with randomly generated ones
  const allCampaigns = [...predefinedCampaigns, ...generateRandomCampaigns(3)];
  
  // Return the data with a promise to simulate an API call with delay
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        success: true,
        data: allCampaigns
      });
    }, Math.random() * 800 + 500); // 500-1300ms delay
  });
};

// Mock empty campaigns list for testing the empty state
const mockEmptyCampaignsList = () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        success: true,
        data: []
      });
    }, Math.random() * 500 + 200); // 200-700ms delay
  });
};

// Mock API error for testing error handling
const mockCampaignsListError = () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        success: false,
        error: {
          code: "API_ERROR",
          message: "An error occurred while retrieving the campaign list. Please try again later."
        }
      });
    }, Math.random() * 500 + 200); // 200-700ms delay
  });
};

interface CampaignSummary {
  id: string;
  name: string;
  status: string;
  budget: {
    amountMicros: number;
  };
  metrics: {
    impressions: number;
    clicks: number;
    ctr: number;
    averageCpc: number;
    cost: number;
  };
  startDate: string;
  endDate?: string;
  type: string;
}

interface GoogleAdsCampaignMonitorProps {
  onSubmit: (data: any) => void;
  title?: string;
  description?: string;
  workspaceSlug?: string;
  // Add a property for testing - if true, use empty campaigns list
  useEmptyData?: boolean;
  // Add a property for testing - if true, simulate API error
  simulateError?: boolean;
}

export default function GoogleAdsCampaignMonitor({
  onSubmit,
  title = "Google Ads Campaign Monitor",
  description,
  workspaceSlug,
  useEmptyData = false,
  simulateError = false
}: GoogleAdsCampaignMonitorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('LAST_30_DAYS');
  const { getToken } = useAuth();

  useEffect(() => {
    fetchCampaigns();
  }, [useEmptyData, simulateError]);

  const fetchCampaigns = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Choose which mock data to use based on props (for testing)
      let response: any;
      
      if (simulateError) {
        response = await mockCampaignsListError();
      } else if (useEmptyData) {
        response = await mockEmptyCampaignsList();
      } else {
        response = await mockCampaignsList();
      }
        
      // Check if response status is valid
      if (!response.success) {
        throw new Error(response.error?.message || "Error fetching campaign list");
      }

      // Process response
      setCampaigns(response.data || []);
      
    } catch (err: any) {
      console.error("Error fetching campaigns:", err);
      setError(err.message || "An error occurred while fetching campaign list");
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalMetrics = () => {
    if (!campaigns || campaigns.length === 0) return { impressions: 0, clicks: 0, cost: 0, ctr: 0 };
    
    const totals = campaigns.reduce((acc, campaign) => {
      const metrics = campaign.metrics || { impressions: 0, clicks: 0, cost: 0, ctr: 0 };
      return {
        impressions: acc.impressions + (metrics.impressions || 0),
        clicks: acc.clicks + (metrics.clicks || 0),
        cost: acc.cost + (metrics.cost || 0),
        ctr: 0 // calculated below
      };
    }, { impressions: 0, clicks: 0, cost: 0, ctr: 0 });
    
    // Calculate total CTR
    totals.ctr = totals.impressions > 0 ? totals.clicks / totals.impressions : 0;
    
    return totals;
  };

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(campaign => {
    if (selectedStatus === 'ALL') return true;
    return campaign.status === selectedStatus;
  });

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    if (dateString.length === 8) {
      return `${dateString.slice(0, 4)}-${dateString.slice(4, 6)}-${dateString.slice(6, 8)}`;
    }
    
    return dateString;
  };

  // Render loading state
  if (isLoading && campaigns.length === 0) {
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
  if (error && campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-medium text-red-700">Error loading data</h2>
        <div className="bg-red-50 p-4 rounded border border-red-200 text-red-800 text-sm max-w-lg">
          <p>{error}</p>
        </div>
        <button
          onClick={fetchCampaigns}
          className="mt-6 px-5 py-2.5 rounded transition-colors text-sm font-medium bg-black text-white hover:bg-gray-800"
        >
          Try again
        </button>
      </div>
    );
  }

  // Main metrics
  const totals = getTotalMetrics();
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-medium text-gray-900">{title}</h2>
            {description && <p className="text-gray-500 text-sm mt-1">{description}</p>}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={fetchCampaigns}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-700 bg-white hover:bg-gray-50"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
            
            <button
              onClick={() => onSubmit({ action: 'create-new' })}
              className="inline-flex items-center px-3 py-1.5 bg-blue-600 rounded text-sm text-white hover:bg-blue-700"
            >
              <Search className="w-4 h-4 mr-1.5" />
              New campaign
            </button>
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
        {/* Filters and action buttons */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <div className="relative inline-block">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-gray-300 rounded text-sm text-gray-700 h-9 pl-8 pr-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">All statuses</option>
                <option value="ENABLED">Active</option>
                <option value="PAUSED">Paused</option>
                <option value="REMOVED">Removed</option>
              </select>
              <Filter className="w-4 h-4 text-gray-500 absolute left-2 top-2.5" />
            </div>
            
            <div className="relative inline-block">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="border border-gray-300 rounded text-sm text-gray-700 h-9 pl-8 pr-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="TODAY">Today</option>
                <option value="YESTERDAY">Yesterday</option>
                <option value="LAST_7_DAYS">Last 7 days</option>
                <option value="LAST_30_DAYS">Last 30 days</option>
                <option value="THIS_MONTH">This month</option>
                <option value="LAST_MONTH">Last month</option>
              </select>
              <Calendar className="w-4 h-4 text-gray-500 absolute left-2 top-2.5" />
            </div>
          </div>
          
          <div className="flex gap-2">
            <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-700 bg-white hover:bg-gray-50">
              <Download className="w-4 h-4 mr-1.5" />
              Export
            </button>
          </div>
        </div>
        
        {/* Metrics summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Impressions */}
          <div className="bg-white p-4 rounded shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-2">
              <Eye className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-medium text-gray-700">Impressions</h3>
            </div>
            <p className="text-base font-medium text-gray-900">
              {totals.impressions.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Total impressions across all campaigns
            </p>
          </div>
          
          {/* Clicks */}
          <div className="bg-white p-4 rounded shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-2">
              <MousePointer className="w-4 h-4 text-green-500" />
              <h3 className="text-sm font-medium text-gray-700">Clicks</h3>
            </div>
            <p className="text-base font-medium text-gray-900">
              {totals.clicks.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Total clicks from all campaigns
            </p>
          </div>
          
          {/* CTR */}
          <div className="bg-white p-4 rounded shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-medium text-gray-700">Average CTR</h3>
            </div>
            <p className="text-base font-medium text-gray-900">
              {(totals.ctr * 100).toFixed(2)}%
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Average click-through rate
            </p>
          </div>
          
          {/* Cost */}
          <div className="bg-white p-4 rounded shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="w-4 h-4 text-red-500" />
              <h3 className="text-sm font-medium text-gray-700">Total cost</h3>
            </div>
            <p className="text-base font-medium text-gray-900">
              {(totals.cost / 1000000).toFixed(2)} PLN
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Total spending on all campaigns
            </p>
          </div>
        </div>
        
        {/* Campaigns table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
          <div className="p-4 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-gray-900">Campaign list</h3>
              <p className="text-sm text-gray-500">
                Showing {filteredCampaigns.length} of {campaigns.length} campaigns
              </p>
            </div>
          </div>
          
          {campaigns.length === 0 ? (
            <div className="p-8 flex flex-col items-center justify-center text-center">
              <Search className="w-12 h-12 text-gray-300 mb-4" />
              <h4 className="text-gray-500 font-medium mb-2">No campaigns found</h4>
              <p className="text-sm text-gray-400 max-w-md mb-6">
                No Google Ads campaigns were found. Create your first campaign to start advertising your products or services.
              </p>
              <button 
                className="inline-flex items-center px-4 py-2 bg-blue-600 rounded text-sm text-white hover:bg-blue-700"
                onClick={() => onSubmit({ action: 'create-new' })}
              >
                <Search className="w-4 h-4 mr-2" />
                Create new campaign
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Campaign name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Budget
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
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCampaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {campaign.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {campaign.id.slice(-8)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          campaign.status === 'ENABLED' ? 'bg-green-100 text-green-800' : 
                          campaign.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {campaign.status === 'ENABLED' ? 'Active' : 
                           campaign.status === 'PAUSED' ? 'Paused' : 
                           campaign.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {campaign.budget?.amountMicros ? (campaign.budget.amountMicros / 1000000).toFixed(2) : '0.00'} PLN
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {campaign.metrics?.impressions?.toLocaleString() || '0'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {campaign.metrics?.clicks?.toLocaleString() || '0'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {campaign.metrics?.ctr ? (campaign.metrics.ctr * 100).toFixed(2) : '0.00'}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {campaign.metrics?.averageCpc ? (campaign.metrics.averageCpc / 1000000).toFixed(2) : '0.00'} PLN
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => {
                            // Navigate to campaign details
                            onSubmit({ 
                              selectedCampaign: campaign.id,
                              action: 'view-details'
                            });
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Details <ArrowRight className="w-3 h-3 inline-block ml-1" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Campaign performance chart */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
          <div className="p-4 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-gray-900">Campaign performance over time</h3>
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
          
          <div className="p-6 h-64">
            {campaigns.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center h-full">
                <BarChart className="w-12 h-12 text-gray-300 mb-4" />
                <h4 className="text-gray-500 font-medium">No data to display</h4>
                <p className="text-sm text-gray-400 max-w-md">
                  Create a campaign to see performance data over time.
                </p>
              </div>
            ) : (
              <div className="h-full">
                {/* Simple performance chart using mock data */}
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
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
                        <span className="text-xs text-gray-500">Cost</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-end h-48 space-x-2">
                    {/* Chart for last 30 days - using mock data */}
                    {Array.from({ length: 7 }).map((_, index) => {
                      const dayImpressionsHeight = 100 * Math.random();
                      const dayClicksHeight = 20 * Math.random();
                      const dayCostHeight = 40 * Math.random();
                      
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div className="w-full flex flex-col items-center space-y-1">
                            <div 
                              className="w-full bg-blue-400 rounded-t" 
                              style={{ height: `${dayImpressionsHeight}px` }}
                            ></div>
                            <div 
                              className="w-1/2 bg-green-400 rounded-t" 
                              style={{ height: `${dayClicksHeight}px` }}
                            ></div>
                            <div 
                              className="w-3/4 bg-red-400 rounded-t" 
                              style={{ height: `${dayCostHeight}px` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">D{index+1}</div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="text-xs text-gray-400 text-center mt-2">
                    * Data shown for selected period
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer and continue button */}
        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-500">
            Data updated every 24 hours. Last update: {new Date().toLocaleDateString()}
          </p>
          
          <button
            onClick={() => onSubmit({ action: 'done' })}
            className="px-5 py-2.5 rounded transition-colors text-sm font-medium bg-black text-white hover:bg-gray-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// Calendar component needed for the filter
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

// TrendingUp component for the metrics
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