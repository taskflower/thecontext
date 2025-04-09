// src/templates/duolingo/widgets/ProgressWidget.tsx
import React from 'react';
import { WidgetProps } from 'template-registry-module';

const ProgressWidget: React.FC<WidgetProps> = ({ data = {} }) => {
  const progressData = data as any;
  
  const {
    level = 1,
    points = 0,
    streak = 0,
    completedLessons = [],
    totalLessons = 10, // Przykładowa wartość
    currentLanguage = 'angielski',
    nextLevel = 200 // Przykładowa wartość, ile punktów potrzeba do następnego poziomu
  } = progressData;
  
  // Obliczanie procentowego postępu do następnego poziomu
  const levelProgress = Math.min(Math.round((points / nextLevel) * 100), 100);
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Twój postęp</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Poziom */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 mr-2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <span className="text-sm font-medium text-blue-700">Poziom</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{level}</p>
          <div className="mt-2 bg-blue-100 rounded-full h-2.5">
            <div 
              className="bg-blue-500 h-2.5 rounded-full" 
              style={{ width: `${levelProgress}%` }}
            ></div>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {points} / {nextLevel} punktów do poziomu {level + 1}
          </p>
        </div>
        
        {/* Seria */}
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500 mr-2">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
              <line x1="6" y1="1" x2="6" y2="4"/>
              <line x1="10" y1="1" x2="10" y2="4"/>
              <line x1="14" y1="1" x2="14" y2="4"/>
            </svg>
            <span className="text-sm font-medium text-orange-700">Seria</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{streak} dni</p>
          <p className="mt-1 text-xs text-gray-500">
            {streak > 0 
              ? `Świetnie! Uczysz się już ${streak} dni z rzędu`
              : 'Rozpocznij swoją serię już dziś!'}
          </p>
        </div>
        
        {/* Ukończone lekcje */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mr-2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span className="text-sm font-medium text-green-700">Ukończone lekcje</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {completedLessons.length} / {totalLessons}
          </p>
          <div className="mt-2 bg-green-100 rounded-full h-2.5">
            <div 
              className="bg-green-500 h-2.5 rounded-full" 
              style={{ width: `${(completedLessons.length / totalLessons) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Aktualnie uczone języki */}
      <div className="mt-4">
        <h3 className="text-md font-medium text-gray-700 mb-2">Uczony język</h3>
        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {currentLanguage.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-800">
              {currentLanguage.charAt(0).toUpperCase() + currentLanguage.slice(1)}
            </p>
            <p className="text-xs text-gray-500">
              {completedLessons.length} ukończonych lekcji
            </p>
          </div>
          <div className="ml-auto">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Aktywny
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressWidget;