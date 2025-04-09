// src/templates/duolingo/widgets/LessonsWidget.tsx
import React from 'react';
import { WidgetProps } from 'template-registry-module';

const LessonsWidget: React.FC<WidgetProps> = ({ 
  data = [], 
  onSelect
}) => {
  // Grupowanie lekcji według poziomów
  const groupedLessons = data.reduce((acc: any, lesson: any) => {
    const level = lesson.lessonData?.level || 1;
    if (!acc[level]) {
      acc[level] = [];
    }
    acc[level].push(lesson);
    return acc;
  }, {});

  // Sortowanie poziomów
  const sortedLevels = Object.keys(groupedLessons)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div>
      {sortedLevels.map(level => (
        <div key={level} className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Poziom {level}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {groupedLessons[level].map((lesson: any) => {
              // Sprawdzenie, czy lekcja jest odblokowana (implementacja przykładowa)
              const isLocked = false; // W rzeczywistej aplikacji to byłoby określane przez stan postępu
              const isCompleted = false; // W rzeczywistej aplikacji to byłoby określane przez stan postępu
              
              return (
                <div 
                  key={lesson.id} 
                  onClick={() => !isLocked && onSelect && onSelect(lesson.id)}
                  className={`relative rounded-lg overflow-hidden shadow-md transition-all ${
                    isLocked ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:shadow-lg cursor-pointer'
                  }`}
                >
                  {/* Pasek kategorii */}
                  <div 
                    className={`h-2 w-full ${
                      lesson.lessonData?.category === 'basics' ? 'bg-blue-500' :
                      lesson.lessonData?.category === 'food' ? 'bg-orange-500' :
                      'bg-purple-500'
                    }`}
                  />
                  
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className={`font-semibold text-lg ${isLocked ? 'text-gray-500' : 'text-gray-800'}`}>
                        {lesson.name}
                      </h3>
                      
                      {/* Ikona statusu */}
                      {isCompleted ? (
                        <div className="bg-green-500 rounded-full p-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </div>
                      ) : isLocked ? (
                        <div className="bg-gray-300 rounded-full p-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                          </svg>
                        </div>
                      ) : null}
                    </div>
                    
                    <p className={`text-sm ${isLocked ? 'text-gray-400' : 'text-gray-600'}`}>
                      {lesson.description || `Ćwiczenia z kategorii: ${lesson.lessonData?.category || 'różne'}`}
                    </p>
                    
                    <div className="mt-3 flex items-center">
                      <div className={`px-2 py-1 rounded text-xs ${
                        isLocked ? 'bg-gray-200 text-gray-500' : 'bg-green-100 text-green-800'
                      }`}>
                        {lesson.lessonData?.language || 'angielski'}
                      </div>
                      
                      <div className="ml-auto flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`mr-1 ${isLocked ? 'text-gray-400' : 'text-gray-600'}`}>
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        <span className={`text-xs ${isLocked ? 'text-gray-400' : 'text-gray-600'}`}>
                          {lesson.nodes?.length || 0} pytań
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Nakładka dla zablokowanych lekcji */}
                  {isLocked && (
                    <div className="absolute inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center">
                      <div className="bg-white rounded-full p-2 shadow">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LessonsWidget;