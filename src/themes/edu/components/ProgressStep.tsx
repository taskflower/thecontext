// src/themes/default/components/ProgressStep.tsx
import React, { useState, useEffect } from 'react';
import { ZodType } from 'zod';
import { BarChart, Calendar, Award, Clock, ArrowUpRight, RotateCcw, Star, Filter } from 'lucide-react';
import { useFlow } from '../../../core/context';

type ProgressStats = {
  totalLessons: number;
  completedLessons: number;
  averageScore: number;
  bestSubject: string;
  learningStreak: number;
  totalTimeSpent: number; // w minutach
  lastActive: string;
};

type SubjectProgress = {
  subject: string;
  lessonsCompleted: number;
  totalLessons: number;
  averageScore: number;
  lastLesson: string;
  color: string;
};

type LessonHistoryItem = {
  id: string;
  title: string;
  subject: string;
  date: string;
  score: number;
};

type ProgressStepProps<T> = {
  schema: ZodType<T>;
  jsonSchema?: any;
  data?: T;
  onSubmit: (data: T) => void;
  progressStats: ProgressStats;
  subjectProgress: SubjectProgress[];
  lessonHistory: LessonHistoryItem[];
};

export default function ProgressStep<T>({
  schema,
  jsonSchema,
  data,
  onSubmit,
  progressStats,
  subjectProgress,
  lessonHistory
}: ProgressStepProps<T>) {
  const { get } = useFlow();
  const [activeTab, setActiveTab] = useState<'overview' | 'subjects' | 'history'>('overview');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pobieranie danych z kontekstu, jeśli nie zostały przekazane jako props
  useEffect(() => {
    if (!progressStats && !subjectProgress && !lessonHistory) {
      const savedLessons = get('saved-lessons') || [];
      
      // Tutaj można przetworzyć savedLessons na dane potrzebne do widgetów
      // To jest tylko przykład przetwarzania
      
      // Symulacja submitu - w rzeczywistej aplikacji należy przygotować prawdziwe dane
      onSubmit({} as T);
    }
  }, []);

  const handleResetFilters = () => {
    setFilterSubject('all');
    setSortBy('date');
    setSortOrder('desc');
  };

  // Filtrowanie i sortowanie historii lekcji
  const filteredHistory = React.useMemo(() => {
    let filtered = [...(lessonHistory || [])];
    
    if (filterSubject !== 'all') {
      filtered = filtered.filter(item => item.subject === filterSubject);
    }
    
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else { // score
        return sortOrder === 'asc' ? a.score - b.score : b.score - a.score;
      }
    });
    
    return filtered;
  }, [lessonHistory, filterSubject, sortBy, sortOrder]);

  // Unikalny zestaw przedmiotów do filtrowania
  const subjects = React.useMemo(() => {
    const subjectSet = new Set<string>();
    lessonHistory?.forEach(item => subjectSet.add(item.subject));
    return ['all', ...Array.from(subjectSet)];
  }, [lessonHistory]);

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center">
          <div className="p-3 rounded-full bg-blue-50 mr-3">
            <BarChart className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Postęp lekcji</p>
            <p className="text-lg font-medium">
              {progressStats?.completedLessons || 0}/{progressStats?.totalLessons || 0}
            </p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center">
          <div className="p-3 rounded-full bg-green-50 mr-3">
            <Award className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Średnia ocena</p>
            <p className="text-lg font-medium">
              {progressStats?.averageScore || 0}%
            </p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center">
          <div className="p-3 rounded-full bg-purple-50 mr-3">
            <Calendar className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Seria dni nauki</p>
            <p className="text-lg font-medium">
              {progressStats?.learningStreak || 0} dni
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-5 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium mb-4">Informacje szczegółowe</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Czas nauki (łącznie)</span>
            <span className="font-medium flex items-center">
              <Clock className="w-4 h-4 mr-1 text-gray-500" />
              {progressStats?.totalTimeSpent || 0} min
            </span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Najlepszy przedmiot</span>
            <span className="font-medium">
              {progressStats?.bestSubject || 'Brak danych'}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Ostatnia aktywność</span>
            <span className="font-medium">
              {progressStats?.lastActive || 'Nieznana'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSubjects = () => (
    <div className="space-y-6">
      {subjectProgress?.map((subject, index) => (
        <div key={index} className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium">{subject.subject}</h3>
            <span className="text-sm font-medium text-gray-500">
              {subject.lessonsCompleted}/{subject.totalLessons} lekcji
            </span>
          </div>
          
          <div className="w-full h-2 bg-gray-100 rounded-full mb-2">
            <div 
              className="h-full rounded-full" 
              style={{ 
                width: `${(subject.lessonsCompleted / subject.totalLessons) * 100}%`,
                backgroundColor: subject.color || '#000' 
              }}
            ></div>
          </div>
          
          <div className="flex justify-between text-sm text-gray-500">
            <span>Średnia: {subject.averageScore}%</span>
            <span>Ostatnia lekcja: {subject.lastLesson}</span>
          </div>
        </div>
      ))}
      
      {(!subjectProgress || subjectProgress.length === 0) && (
        <div className="bg-gray-50 p-6 text-center rounded-lg border border-gray-200">
          <p className="text-gray-500">Brak danych o postępach w przedmiotach</p>
        </div>
      )}
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex-grow max-w-xs">
          <label className="block text-sm font-medium text-gray-700 mb-1">Przedmiot</label>
          <div className="relative">
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="block w-full rounded-md border border-gray-200 py-2 pl-3 pr-10 text-sm focus:outline-none"
            >
              {subjects.map((subject, index) => (
                <option key={index} value={subject}>
                  {subject === 'all' ? 'Wszystkie przedmioty' : subject}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex-grow max-w-xs">
          <label className="block text-sm font-medium text-gray-700 mb-1">Sortuj według</label>
          <div className="flex">
            <button
              onClick={() => {
                setSortBy('date');
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              }}
              className={`px-3 py-2 text-sm border ${
                sortBy === 'date' 
                  ? 'bg-black text-white border-black' 
                  : 'bg-white text-gray-600 border-gray-200'
              } rounded-l`}
            >
              Data {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => {
                setSortBy('score');
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              }}
              className={`px-3 py-2 text-sm border ${
                sortBy === 'score' 
                  ? 'bg-black text-white border-black' 
                  : 'bg-white text-gray-600 border-gray-200'
              } rounded-r border-l-0`}
            >
              Wynik {sortBy === 'score' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>
        
        <div className="flex items-end">
          <button
            onClick={handleResetFilters}
            className="px-3 py-2 border border-gray-200 rounded text-sm text-gray-600 hover:bg-gray-50 flex items-center"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </button>
        </div>
      </div>
      
      {filteredHistory.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lekcja
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Przedmiot
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Wynik
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredHistory.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{item.subject}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{item.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${item.score >= 80 ? 'bg-green-100 text-green-800' : 
                        item.score >= 60 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {item.score}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-gray-50 p-6 text-center rounded-lg border border-gray-200">
          <p className="text-gray-500">
            {filterSubject !== 'all' 
              ? `Brak historii lekcji dla przedmiotu: ${filterSubject}` 
              : 'Brak historii lekcji'}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="pt-6">
      <h2 className="text-xl font-medium text-gray-900 mb-2">Twoje postępy w nauce</h2>
      <p className="text-gray-600 mb-6 text-sm">
        Śledź swoje postępy, analizuj wyniki i planuj dalszą naukę
      </p>
      
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-4 flex items-center text-sm font-medium ${
            activeTab === 'overview' 
              ? 'text-black border-b-2 border-black' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <BarChart className="w-4 h-4 mr-2" />
          Podsumowanie
        </button>
        <button
          onClick={() => setActiveTab('subjects')}
          className={`py-3 px-4 flex items-center text-sm font-medium ${
            activeTab === 'subjects' 
              ? 'text-black border-b-2 border-black' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Star className="w-4 h-4 mr-2" />
          Przedmioty
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`py-3 px-4 flex items-center text-sm font-medium ${
            activeTab === 'history' 
              ? 'text-black border-b-2 border-black' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Historia
        </button>
      </div>
      
      <div className="min-h-[300px] mb-6">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'subjects' && renderSubjects()}
        {activeTab === 'history' && renderHistory()}
      </div>
      
      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={() => onSubmit(data as T)}
          className="px-5 py-2.5 rounded transition-colors text-sm font-medium bg-black text-white hover:bg-gray-800 flex items-center"
        >
          <ArrowUpRight className="w-4 h-4 mr-2" />
          Przejdź do nauki
        </button>
      </div>
    </div>
  );}