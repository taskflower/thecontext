/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';

interface ChartDataExtractorProps {
  historicalData: any[];
  selectedHour: number;
  selectedDate: string | null;
  hourlyStats: any;
  selectedFactors: {
    windProduction: boolean;
    solarProduction: boolean;
    demandForecast: boolean;
    isWorkday: boolean;
  };
}

const ChartDataExtractor: React.FC<ChartDataExtractorProps> = ({
  historicalData,
  selectedHour,
  selectedDate,
  hourlyStats,
  selectedFactors,
}) => {
  const [promptText, setPromptText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Filter data for the selected hour
  const hourData = historicalData.filter(
    (d) => d.hour === selectedHour && (selectedDate === null || d.date <= selectedDate)
  );

  useEffect(() => {
    // Generate the text when data changes
    generatePromptText();
  }, [historicalData, selectedHour, selectedDate, hourlyStats, selectedFactors]);

  const generatePromptText = () => {
    let text = '';

    // 1. Overview Section
    text += '## Energy Market Data Analysis\n\n';
    text += `Selected Hour: ${selectedHour}:00\n`;
    text += `Date Range: ${selectedDate ? `Up to ${selectedDate}` : 'All available data'}\n\n`;

    // 2. Basic Statistics
    if (hourlyStats) {
      text += '### Price Difference Statistics\n\n';
      text += `- Total Data Points: ${hourlyStats.totalEntries}\n`;
      text += `- RB > RDN: ${hourlyStats.rbHigherCount} cases (${hourlyStats.rbHigherPercent}%)\n`;
      text += `- Average Price Difference: ${hourlyStats.avgPriceDiff} PLN/MWh\n`;
      text += `- Average Absolute Price Difference: ${hourlyStats.avgAbsPriceDiff} PLN/MWh\n\n`;
    }

    // 3. Energy Factors
    text += '### Energy Factors Data\n\n';

    if (selectedFactors.windProduction) {
      const avgWind = calculateAverage(hourData, 'windProduction');
      text += `- Average Wind Production: ${avgWind} MW\n`;
    }

    if (selectedFactors.solarProduction) {
      const avgSolar = calculateAverage(hourData, 'solarProduction');
      text += `- Average Solar Production: ${avgSolar} MW\n`;
    }

    if (selectedFactors.demandForecast) {
      const avgDemand = calculateAverage(hourData, 'demandForecast');
      text += `- Average Demand Forecast: ${avgDemand} MW\n`;
    }

    if (selectedFactors.isWorkday) {
      const workdayPercentage = hourData.length
        ? Math.round((hourData.filter((d) => d.isWorkday).length / hourData.length) * 100)
        : 0;
      text += `- Workday Percentage: ${workdayPercentage}%\n`;
    }

    text += '\n';

    // 4. Correlation Information
    text += '### Correlations with RB-RDN Price Difference\n\n';
    text += '- Wind Production: Medium to high negative correlation - Higher wind generation often results in lower RB prices\n';
    text += '- Solar Production: Medium negative correlation - High solar irradiance can reduce RB prices\n';
    text += '- Demand: Medium positive correlation - Higher demand increases the probability of high RB prices\n';
    text += '- Workday: Weak positive correlation - Workdays more often have higher RB prices\n\n';

    // 5. Raw Data Sample (limited to 10 records)
    text += '### Sample Data Points\n\n';
    text += 'date | hour | rdnPrice | rbPrice | priceDiff | windProduction | solarProduction | demandForecast | isWorkday\n';
    text += '---- | ---- | -------- | ------- | --------- | -------------- | --------------- | -------------- | ---------\n';

    const sampleData = hourData.slice(0, 10);
    sampleData.forEach((item) => {
      text += `${item.date} | ${item.hour} | ${item.rdnPrice} | ${item.rbPrice} | ${item.priceDiff} | ${item.windProduction} | ${item.solarProduction} | ${item.demandForecast} | ${item.isWorkday ? 'Yes' : 'No'}\n`;
    });

    // No "more records" message

    // 6. Imbalance vs Price Difference Data (if available)
    if (hourlyStats && hourlyStats.imbalanceVsPriceDiff && hourlyStats.imbalanceVsPriceDiff.length > 0) {
      text += '\n### Imbalance vs Price Difference Data Sample\n\n';
      text += 'imbalance (MW) | priceDiff (PLN/MWh)\n';
      text += '-------------- | ------------------\n';

      const sampleScatterData = hourlyStats.imbalanceVsPriceDiff.slice(0, 10);
      sampleScatterData.forEach((point: { imbalance: number; priceDiff: number; }) => {
        text += `${point.imbalance.toFixed(2)} | ${point.priceDiff.toFixed(2)}\n`;
      });

      // No "more points" message
    }

    setPromptText(text);
  };

  const calculateAverage = (data: any[], key: string) => {
    if (!data.length) return 0;
    return Math.round(data.reduce((sum, item) => sum + item[key], 0) / data.length);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(promptText).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      (err) => {
        console.error('Failed to copy text: ', err);
      }
    );
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Ekstraktor danych do promptów</h2>
        <button
          onClick={copyToClipboard}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {copied ? 'Skopiowano!' : 'Kopiuj do schowka'}
        </button>
      </div>

      <div className="border rounded-lg p-2 bg-gray-50">
        <pre className="whitespace-pre-wrap text-sm font-mono overflow-auto max-h-96">
          {promptText}
        </pre>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>
          Wyekstrahowane dane mogą być użyte w promptach dla systemów AI do analizy wzorców rynku energii
          i budowania modeli predykcyjnych dla różnic cen RB-RDN.
        </p>
      </div>
    </div>
  );
};

export default ChartDataExtractor;