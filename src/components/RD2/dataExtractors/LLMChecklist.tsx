/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';

interface LLMChecklistProps {
  selectedHour: number;
  selectedFactors: {
    windProduction: boolean;
    solarProduction: boolean;
    demandForecast: boolean;
    isWorkday: boolean;
  };
  predictionScenario?: {
    windProduction: number;
    solarProduction: number;
    demandForecast: number;
    isWorkday: boolean;
    hour: number;
  } | null;
  historicalData: any[];
}

const LLMChecklist: React.FC<LLMChecklistProps> = ({
  selectedHour,
  selectedFactors,
  predictionScenario,
  historicalData
}) => {
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  
  // Calculate averages from historical data for the selected hour
  const calculateAverage = (key: string) => {
    const hourData = historicalData.filter(d => d.hour === selectedHour);
    if (!hourData.length) return 0;
    return Math.round(hourData.reduce((sum, item) => sum + item[key], 0) / hourData.length);
  };
  
  const avgWindProduction = calculateAverage('windProduction');
  const avgSolarProduction = calculateAverage('solarProduction');
  const avgDemandForecast = calculateAverage('demandForecast');
  const rbHigherCount = historicalData.filter(d => 
    d.hour === selectedHour && d.rbPrice > d.rdnPrice
  ).length;
  const totalCount = historicalData.filter(d => d.hour === selectedHour).length;
  const rbHigherPercent = totalCount ? Math.round((rbHigherCount / totalCount) * 100) : 0;
  
  // Generate the checklist for the LLM
  const generateLLMChecklist = () => {
    let prompt = `# Energy Market Price Prediction - JSON Output Format\n\n`;
    
    prompt += `## Task\n`;
    prompt += `Based on the provided factors and analysis, calculate the expected RB price and difference between RB and RDN prices for hour ${selectedHour}:00. Return ONLY a JSON object with these two values.\n\n`;
    
    prompt += `## Output Format Requirements\n`;
    prompt += `- Return ONLY a valid JSON object without any additional text\n`;
    prompt += `- Include exactly two fields:\n`;
    prompt += `  - \`rbPrice\`: The predicted Real-Time Balancing Market price in PLN/MWh (integer)\n`;
    prompt += `  - \`rbRdnDifference\`: The predicted difference between RB and RDN prices in PLN/MWh (integer)\n`;
    prompt += `- Do not include any explanations, analysis, or commentary\n`;
    prompt += `- Do not use markdown formatting in your output\n\n`;
    
    prompt += `## Example Expected Output\n`;
    prompt += `\`\`\`json\n`;
    prompt += `{\n`;
    prompt += `  "rbPrice": 275,\n`;
    prompt += `  "rbRdnDifference": -27\n`;
    prompt += `}\n`;
    prompt += `\`\`\`\n\n`;
    
    prompt += `## Important Note\n`;
    prompt += `Your output must be valid JSON that can be directly parsed by a program. Any text outside the JSON object will cause parsing errors.\n\n`;
    
    prompt += `## Context\n`;
    prompt += `You are an AI assistant helping energy traders predict the Real-Time Balancing Market (RB) price and its difference from the Day-Ahead Market (RDN) price for hour ${selectedHour}:00.\n\n`;
    
    prompt += `## Historical Data Analysis\n`;
    prompt += `- In historical data, RB > RDN occurs in ${rbHigherPercent}% of cases for hour ${selectedHour}:00\n`;
    
    prompt += `## Key Factors to Consider\n`;
    
    // Add factors based on user selection
    if (selectedFactors.windProduction) {
      prompt += `### Wind Production\n`;
      prompt += `- Average wind production for this hour: ${avgWindProduction} MW\n`;
      
      if (predictionScenario) {
        prompt += `- Predicted wind production: ${predictionScenario.windProduction} MW\n`;
        prompt += `- ${predictionScenario.windProduction > avgWindProduction ? 'Higher' : 'Lower'} than average\n`;
        prompt += `- Impact: ${predictionScenario.windProduction > avgWindProduction ? 
          'Higher wind production typically leads to LOWER RB prices (negative correlation)' : 
          'Lower wind production typically leads to HIGHER RB prices (negative correlation)'}\n`;
      }
      prompt += `- Analysis needed: Compare to historical patterns at similar wind production levels\n\n`;
    }
    
    if (selectedFactors.solarProduction) {
      prompt += `### Solar Production\n`;
      prompt += `- Average solar production for this hour: ${avgSolarProduction} MW\n`;
      
      if (predictionScenario) {
        prompt += `- Predicted solar production: ${predictionScenario.solarProduction} MW\n`;
        prompt += `- ${predictionScenario.solarProduction > avgSolarProduction ? 'Higher' : 'Lower'} than average\n`;
        prompt += `- Impact: ${predictionScenario.solarProduction > avgSolarProduction ? 
          'Higher solar production typically leads to LOWER RB prices (negative correlation)' : 
          'Lower solar production typically leads to HIGHER RB prices (negative correlation)'}\n`;
      }
      prompt += `- Analysis needed: Evaluate significance based on time of day (solar has minimal impact during night hours)\n\n`;
    }
    
    if (selectedFactors.demandForecast) {
      prompt += `### Electricity Demand\n`;
      prompt += `- Average demand forecast for this hour: ${avgDemandForecast} MW\n`;
      
      if (predictionScenario) {
        prompt += `- Predicted demand: ${predictionScenario.demandForecast} MW\n`;
        prompt += `- ${predictionScenario.demandForecast > avgDemandForecast ? 'Higher' : 'Lower'} than average\n`;
        prompt += `- Impact: ${predictionScenario.demandForecast > avgDemandForecast ? 
          'Higher demand typically leads to HIGHER RB prices (positive correlation)' : 
          'Lower demand typically leads to LOWER RB prices (positive correlation)'}\n`;
      }
      prompt += `- Analysis needed: Consider demand elasticity and available generation capacity\n\n`;
    }
    
    if (selectedFactors.isWorkday) {
      prompt += `### Day Type\n`;
      
      if (predictionScenario) {
        prompt += `- Predicted day type: ${predictionScenario.isWorkday ? 'Workday' : 'Weekend/Holiday'}\n`;
        prompt += `- Impact: ${predictionScenario.isWorkday ? 
          'Workdays typically have more volatile pricing and higher likelihood of RB > RDN' : 
          'Weekends/holidays typically have more stable pricing and lower likelihood of RB > RDN'}\n`;
      }
      prompt += `- Analysis needed: Check for patterns specific to workdays vs non-workdays\n\n`;
    }
    
    prompt += `## Hour-Specific Considerations\n`;
    if (selectedHour >= 6 && selectedHour <= 9) {
      prompt += `- Morning ramp-up period: Typically higher volatility as demand increases\n`;
    } else if (selectedHour >= 17 && selectedHour <= 21) {
      prompt += `- Evening peak period: Often experiences highest prices and volatility\n`;
    } else if (selectedHour >= 0 && selectedHour <= 5) {
      prompt += `- Overnight period: Usually lower prices and more predictable\n`;
    } else {
      prompt += `- Mid-day period: Price often influenced by solar production and industrial demand\n`;
    }
    
    return prompt;
  };
  
  const promptText = generateLLMChecklist();
  
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
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">Asystent LLM - Checklist</h2>
        <button
          onClick={() => setShowPrompt(!showPrompt)}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          {showPrompt ? 'Ukryj prompt' : 'Pokaż prompt dla LLM'}
        </button>
      </div>
      
      <div className="bg-blue-50 p-3 rounded-lg mb-4">
        <p className="text-blue-800">
          To narzędzie generuje prompt dla asystenta AI, aby przewidział cenę RB oraz różnicę RB-RDN
          w formacie JSON do dalszego przetwarzania.
        </p>
      </div>
      
      {showPrompt && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Prompt dla asystenta LLM:</h3>
            <button
              onClick={copyToClipboard}
              className="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            >
              {copied ? 'Skopiowano!' : 'Kopiuj do schowka'}
            </button>
          </div>
          
          <div className="border rounded-lg p-3 bg-gray-50 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm font-mono">
              {promptText}
            </pre>
          </div>
        </div>
      )}
      
      <div className="mt-4">
        <h3 className="font-medium mb-2">Kluczowe czynniki do analizy:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {selectedFactors.windProduction && (
            <div className="p-3 border rounded-lg bg-blue-50">
              <div className="font-medium text-blue-800">Produkcja wiatrowa</div>
              <div className="text-sm mt-1">
                <div>Średnia: {avgWindProduction} MW</div>
                {predictionScenario && (
                  <div>Prognoza: {predictionScenario.windProduction} MW</div>
                )}
                <div className="mt-1">
                  Wpływ: Wyższa produkcja wiatrowa → Niższe ceny RB (korelacja ujemna)
                </div>
              </div>
            </div>
          )}
          
          {selectedFactors.solarProduction && (
            <div className="p-3 border rounded-lg bg-yellow-50">
              <div className="font-medium text-yellow-800">Produkcja słoneczna</div>
              <div className="text-sm mt-1">
                <div>Średnia: {avgSolarProduction} MW</div>
                {predictionScenario && (
                  <div>Prognoza: {predictionScenario.solarProduction} MW</div>
                )}
                <div className="mt-1">
                  Wpływ: Wyższa produkcja słoneczna → Niższe ceny RB (korelacja ujemna)
                </div>
              </div>
            </div>
          )}
          
          {selectedFactors.demandForecast && (
            <div className="p-3 border rounded-lg bg-purple-50">
              <div className="font-medium text-purple-800">Zapotrzebowanie</div>
              <div className="text-sm mt-1">
                <div>Średnia: {avgDemandForecast} MW</div>
                {predictionScenario && (
                  <div>Prognoza: {predictionScenario.demandForecast} MW</div>
                )}
                <div className="mt-1">
                  Wpływ: Wyższe zapotrzebowanie → Wyższe ceny RB (korelacja dodatnia)
                </div>
              </div>
            </div>
          )}
          
          {selectedFactors.isWorkday && (
            <div className="p-3 border rounded-lg bg-gray-50">
              <div className="font-medium text-gray-800">Typ dnia</div>
              <div className="text-sm mt-1">
                {predictionScenario && (
                  <div>Prognoza: {predictionScenario.isWorkday ? 'Dzień roboczy' : 'Weekend/Święto'}</div>
                )}
                <div className="mt-1">
                  Wpływ: Dni robocze → Częściej wyższe ceny RB (słaba korelacja dodatnia)
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-green-50 rounded-lg">
        <h3 className="font-medium text-green-800 mb-1">Statystyka historyczna:</h3>
        <p>
          Dla godziny {selectedHour}:00, cena RB jest wyższa od RDN w {rbHigherPercent}% przypadków
          (na podstawie {totalCount} historycznych rekordów)
        </p>
      </div>
      
          
     
    </div>
  );
};

export default LLMChecklist;