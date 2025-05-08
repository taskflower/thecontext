// src/themes/default/widgets/EducationROIWidget.tsx
import React from 'react';
import { Brain, Clock, TrendingUp, Award } from 'lucide-react';

type EducationROIWidgetProps = {
  data?: {
    knowledgeGain?: number;     // przyrost wiedzy w procentach
    timeInvestment?: number;    // czas nauki w godzinach
    skillImprovement?: number;  // poprawa umiejętności w procentach
    completionRate?: number;    // stopień ukończenia materiału w procentach
    estimatedValue?: string;    // szacunkowa wartość zdobytej wiedzy (np. "wysoka", "średnia")
  };
  title?: string;
};

export default function EducationROIWidget({ 
  data = {}, 
  title = "Wskaźnik postępu edukacyjnego" 
}: EducationROIWidgetProps) {
  const { 
    knowledgeGain = 0, 
    timeInvestment = 0, 
    skillImprovement = 0, 
    completionRate = 0,
    estimatedValue = "nieznana" 
  } = data;
  
  // Określenie koloru dla wskaźnika ROI w zależności od wartości
  const getProgressColor = (value: number) => {
    if (value >= 80) return 'text-green-500';
    if (value >= 50) return 'text-green-400';
    if (value >= 30) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  const avgProgress = (knowledgeGain + skillImprovement + completionRate) / 3;
  const progressColor = getProgressColor(avgProgress);

  return (
    <div className="h-full">
      <div className="p-4 border-b border-gray-100">
        <h3 className="m-0 text-sm font-medium text-gray-900">{title}</h3>
      </div>
      
      <div className="p-4">
        <div className="space-y-3">
          <div className="bg-white p-3 rounded border border-gray-100 flex items-center">
            <div className="p-2 rounded-full bg-blue-50 mr-3">
              <Brain className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Przyrost wiedzy</p>
              <p className={`text-base font-medium ${getProgressColor(knowledgeGain)}`}>{knowledgeGain}%</p>
            </div>
          </div>
          
          <div className="bg-white p-3 rounded border border-gray-100 flex items-center">
            <div className="p-2 rounded-full bg-amber-50 mr-3">
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Zainwestowany czas</p>
              <p className="text-base font-medium">{timeInvestment} godz.</p>
            </div>
          </div>
          
          <div className="bg-white p-3 rounded border border-gray-100 flex items-center">
            <div className="p-2 rounded-full bg-green-50 mr-3">
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Poprawa umiejętności</p>
              <p className={`text-base font-medium ${getProgressColor(skillImprovement)}`}>{skillImprovement}%</p>
            </div>
          </div>
          
          <div className="bg-white p-3 rounded border border-gray-100 flex items-center">
            <div className="p-2 rounded-full bg-purple-50 mr-3">
              <Award className="h-4 w-4 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Ukończenie materiału</p>
              <p className={`text-base font-medium ${getProgressColor(completionRate)}`}>{completionRate}%</p>
            </div>
          </div>
        </div>
        
        <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-100">
          <div className="mb-2">
            <p className="text-xs font-medium text-gray-600">
              Średni postęp edukacyjny
            </p>
            <p className={`text-lg font-medium ${progressColor}`}>
              {Math.round(avgProgress)}%
            </p>
          </div>
          
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-300"
              style={{ 
                width: `${avgProgress}%`,
                backgroundColor: avgProgress >= 80 ? '#22c55e' : 
                               avgProgress >= 50 ? '#4ade80' : 
                               avgProgress >= 30 ? '#eab308' : '#ef4444'
              }}
            ></div>
          </div>
          
          <p className="mt-2 text-xs text-gray-600">
            Szacowana wartość zdobytej wiedzy: <span className="font-medium">{estimatedValue}</span>
          </p>
        </div>
      </div>
    </div>
  );
}   