// src/templates/default/flowSteps/FbCampaignSummaryTemplate.tsx
import React, { useMemo } from "react";

import { useAppStore } from "@/lib/store";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { FlowStepProps } from "@/views/types";

const FbCampaignSummaryTemplate: React.FC<FlowStepProps> = ({
  node,
  onSubmit,
  onPrevious,
  isLastNode,
}) => {
  const processTemplate = useAppStore((state) => state.processTemplate);
  const getContextPath = useAppStore((state) => state.getContextPath);

  // Process assistant message with context variables
  const processedMessage = node.assistantMessage
    ? processTemplate(node.assistantMessage)
    : "";

  // Get campaign data from context
  const fbCampaign = getContextPath("fbCampaign") || {};
  const campaignStats = getContextPath("fbCampaignStats") || {};
  const campaignApi = getContextPath("fbCampaignApi") || {};
  const optimizations = getContextPath("fbCampaignOptimizations") || {};
  const campaignSummary = getContextPath("fbCampaignSummary") || "";

  // Generate daily stats for chart
  const dailyStatsData = useMemo(() => {
    const stats = campaignStats.stats || {};
    if (!stats || !fbCampaign.settings?.czas_trwania) return [];

    const daysCount = parseInt(fbCampaign.settings?.czas_trwania) || 7;
    // Generate daily data based on the campaign duration
    return Array.from({ length: daysCount }).map((_, index) => {
      const day = index + 1;
      const date = new Date();
      date.setDate(date.getDate() - (daysCount - day));

      // Create some variation for the chart data
      const randomFactor = 0.7 + Math.random() * 0.6;
      const dayMultiplier = (day / daysCount) * 1.5; // Growth trend over time

      return {
        day: `Dzień ${day}`,
        date: date.toLocaleDateString("pl-PL"),
        impressions: Math.round(
          (stats.impressions / daysCount) * randomFactor * dayMultiplier
        ),
        clicks: Math.round(
          (stats.clicks / daysCount) * randomFactor * dayMultiplier
        ),
        conversions: Math.round(
          (stats.conversions / daysCount) * randomFactor * dayMultiplier
        ),
        cost: Number(((stats.costSpent / daysCount) * randomFactor).toFixed(2)),
      };
    });
  }, [campaignStats.stats, fbCampaign.settings?.czas_trwania]);

  // Generate data for optimization impact chart
  const optimizationImpactData = useMemo(() => {
    if (!optimizations) return [];

    const baseValue = 100;
    return [
      {
        name: "Wyświetlenia",
        "Bez optymalizacji": baseValue,
        "Z optymalizacjami":
          optimizations.zwiększBudżet === "Tak"
            ? baseValue * 1.2
            : optimizations.rozszerzTargetowanie === "Tak"
            ? baseValue * 1.15
            : baseValue,
      },
      {
        name: "Kliknięcia",
        "Bez optymalizacji": baseValue,
        "Z optymalizacjami":
          optimizations.zmieńCTA === "Tak"
            ? baseValue * 1.25
            : optimizations.optymalizacjaStawek === "Tak"
            ? baseValue * 1.18
            : baseValue,
      },
      {
        name: "Konwersje",
        "Bez optymalizacji": baseValue,
        "Z optymalizacjami":
          optimizations.zmieńCTA === "Tak" &&
          optimizations.optymalizacjaStawek === "Tak"
            ? baseValue * 1.3
            : optimizations.zmieńCTA === "Tak"
            ? baseValue * 1.2
            : baseValue,
      },
      {
        name: "ROI",
        "Bez optymalizacji": baseValue,
        "Z optymalizacjami":
          optimizations.zwiększBudżet === "Tak" &&
          optimizations.optymalizacjaStawek === "Tak"
            ? baseValue * 1.35
            : optimizations.optymalizacjaStawek === "Tak"
            ? baseValue * 1.22
            : baseValue,
      },
    ];
  }, [optimizations]);

  // Format applied optimizations for display
  const appliedOptimizations = useMemo(() => {
    if (!optimizations) return [];

    const list = [];
    if (optimizations.zwiększBudżet === "Tak")
      list.push("Zwiększono dzienny budżet o 20%");
    if (optimizations.rozszerzTargetowanie === "Tak")
      list.push("Rozszerzono targetowanie o dodatkowe grupy demograficzne");
    if (optimizations.zmieńCTA === "Tak")
      list.push("Zmodyfikowano przycisk CTA");
    if (optimizations.optymalizacjaStawek === "Tak")
      list.push("Włączono automatyczną optymalizację stawek");

    return list;
  }, [optimizations]);

  // Handle continue
  const handleSubmit = () => {
    onSubmit({
      completed: true,
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-lg text-white">
        <h2 className="text-2xl font-bold mb-2">
          Podsumowanie kampanii Facebook
        </h2>
        <p className="text-blue-100">
          {fbCampaign.content?.tytuł_reklamy || "Kampania marketingowa"}
        </p>
        <div className="mt-3 flex items-center">
          <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-blue-600 font-bold mr-3">
            f
          </div>
          <div>
            <p className="font-medium">
              ID kampanii: {campaignApi.campaignApiResponse?.id || "N/A"}
            </p>
            <p className="text-sm text-blue-200">
              Czas trwania: {fbCampaign.settings?.czas_trwania || "7"} dni
            </p>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Summary text */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              Podsumowanie kampanii
            </h3>

            {typeof campaignSummary === "string" && campaignSummary ? (
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-line text-gray-700">
                  {campaignSummary}
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 p-3 rounded-md">
                <p className="text-yellow-700 text-sm">
                  Dane podsumowania kampanii nie są dostępne.
                </p>
              </div>
            )}
          </div>

          {/* Applied optimizations */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              Zastosowane optymalizacje
            </h3>

            {appliedOptimizations.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                {appliedOptimizations.map((opt, idx) => (
                  <li key={idx}>{opt}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">
                Nie zastosowano optymalizacji
              </p>
            )}
          </div>
        </div>

        {/* Right column - Charts */}
        <div className="lg:col-span-2 space-y-4">
          {/* Performance over time chart */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              Wydajność kampanii w czasie
            </h3>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dailyStatsData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="impressions"
                    name="Wyświetlenia"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="clicks"
                    name="Kliknięcia"
                    stroke="#82ca9d"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="conversions"
                    name="Konwersje"
                    stroke="#ff7300"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Optimization impact chart */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              Wpływ optymalizacji
            </h3>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  width={500}
                  height={300}
                  data={optimizationImpactData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Bez optymalizacji" fill="#8884d8" />
                  <Bar dataKey="Z optymalizacjami" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {campaignStats.stats && (
          <>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="text-sm font-medium text-blue-700 mb-1">
                Wyświetlenia
              </h3>
              <p className="text-2xl font-bold text-blue-900">
                {(campaignStats.stats.impressions || 0).toLocaleString()}
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <h3 className="text-sm font-medium text-green-700 mb-1">CTR</h3>
              <p className="text-2xl font-bold text-green-900">
                {campaignStats.stats.ctr || 0}%
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <h3 className="text-sm font-medium text-purple-700 mb-1">
                Konwersje
              </h3>
              <p className="text-2xl font-bold text-purple-900">
                {(campaignStats.stats.conversions || 0).toLocaleString()}
              </p>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
              <h3 className="text-sm font-medium text-amber-700 mb-1">
                Wydatki
              </h3>
              <p className="text-2xl font-bold text-amber-900">
                {(campaignStats.stats.costSpent || 0).toLocaleString()} PLN
              </p>
            </div>
          </>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between pt-4 border-t border-gray-200">
        <button onClick={onPrevious} className="px-4 py-2 bg-gray-200 rounded">
          Wstecz
        </button>

        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          {isLastNode ? "Zakończ" : "Dalej"}
        </button>
      </div>
    </div>
  );
};

export default FbCampaignSummaryTemplate;
