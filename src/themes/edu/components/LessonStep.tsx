// src/themes/default/components/LessonStep.tsx
import React, { useState } from 'react';
import { ZodType } from 'zod';
import { BookOpen, ArrowRight, ArrowLeft, Download, PlayCircle, List, BookMarked } from 'lucide-react';

type KeyDefinition = {
  term: string;
  definition: string;
  example: string;
};

type Example = {
  problem: string;
  solution: string;
  explanation: string;
};

type LessonData = {
  title: string;
  description: string;
  theory: string;
  keyDefinitions: KeyDefinition[];
  examples: Example[];
};

type LessonStepProps<T> = {
  schema: ZodType<T>;
  jsonSchema?: any;
  data?: LessonData;
  onSubmit: (data: T) => void;
  submitLabel?: string;
};

export default function LessonStep<T>({
  schema,
  jsonSchema,
  data,
  onSubmit,
  submitLabel = "Kontynuuj do quizu"
}: LessonStepProps<T>) {
  const [activeTab, setActiveTab] = useState<'theory' | 'definitions' | 'examples'>('theory');
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
  const [currentDefinitionIndex, setCurrentDefinitionIndex] = useState(0);

  if (!data) {
    return (
      <div className="pt-6 text-center">
        <div className="animate-pulse">
          <div className="h-8 w-3/4 mx-auto bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-2/3 mx-auto bg-gray-200 rounded mb-8"></div>
          <div className="h-24 w-full bg-gray-200 rounded mb-4"></div>
          <div className="h-20 w-full bg-gray-200 rounded"></div>
        </div>
        <p className="mt-6 text-gray-600">Ładowanie lekcji...</p>
      </div>
    );
  }

  const { title, description, theory, keyDefinitions, examples } = data;
  const theoryParagraphs = theory.split('\n').filter(p => p.trim() !== '');

  const handleNext = () => {
    onSubmit(data as any);
  };

  const handleNextDefinition = () => {
    if (currentDefinitionIndex < keyDefinitions.length - 1) {
      setCurrentDefinitionIndex(prev => prev + 1);
    }
  };

  const handlePrevDefinition = () => {
    if (currentDefinitionIndex > 0) {
      setCurrentDefinitionIndex(prev => prev - 1);
    }
  };

  const handleNextExample = () => {
    if (currentExampleIndex < examples.length - 1) {
      setCurrentExampleIndex(prev => prev + 1);
    }
  };

  const handlePrevExample = () => {
    if (currentExampleIndex > 0) {
      setCurrentExampleIndex(prev => prev - 1);
    }
  };

  const renderTheory = () => (
    <div className="space-y-4">
      {theoryParagraphs.map((paragraph, index) => (
        <p key={index} className="text-gray-800 leading-relaxed">
          {paragraph}
        </p>
      ))}
    </div>
  );

  const renderDefinitions = () => {
    const definition = keyDefinitions[currentDefinitionIndex];
    
    return (
      <div className="h-full">
        <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
          <span>Definicja {currentDefinitionIndex + 1} z {keyDefinitions.length}</span>
          <div>
            <button 
              onClick={handlePrevDefinition} 
              disabled={currentDefinitionIndex === 0}
              className={`mr-2 p-1 rounded ${currentDefinitionIndex === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={handleNextDefinition} 
              disabled={currentDefinitionIndex === keyDefinitions.length - 1}
              className={`p-1 rounded ${currentDefinitionIndex === keyDefinitions.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-5 border border-gray-200 rounded-lg bg-white mb-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">{definition.term}</h3>
          <p className="text-gray-700 mb-4">{definition.definition}</p>
          <div className="bg-gray-50 p-3 rounded border border-gray-100">
            <p className="text-sm text-gray-600 mb-1 font-medium">Przykład:</p>
            <p className="text-gray-700">{definition.example}</p>
          </div>
        </div>
        
        <div className="flex justify-center">
          <div className="inline-flex">
            {keyDefinitions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentDefinitionIndex(index)}
                className={`w-2 h-2 mx-1 rounded-full ${index === currentDefinitionIndex ? 'bg-black' : 'bg-gray-300'}`}
              ></button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderExamples = () => {
    const example = examples[currentExampleIndex];
    
    return (
      <div className="h-full">
        <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
          <span>Przykład {currentExampleIndex + 1} z {examples.length}</span>
          <div>
            <button 
              onClick={handlePrevExample} 
              disabled={currentExampleIndex === 0}
              className={`mr-2 p-1 rounded ${currentExampleIndex === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={handleNextExample} 
              disabled={currentExampleIndex === examples.length - 1}
              className={`p-1 rounded ${currentExampleIndex === examples.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-5 border border-gray-200 rounded-lg bg-white mb-4">
          <div className="border-l-4 border-blue-500 pl-4 mb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Problem</h3>
            <p className="text-gray-700">{example.problem}</p>
          </div>
          
          <div className="border-l-4 border-green-500 pl-4 mb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Rozwiązanie</h3>
            <p className="text-gray-700">{example.solution}</p>
          </div>
          
          <div className="border-l-4 border-amber-500 pl-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Wyjaśnienie</h3>
            <p className="text-gray-700">{example.explanation}</p>
          </div>
        </div>
        
        <div className="flex justify-center">
          <div className="inline-flex">
            {examples.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentExampleIndex(index)}
                className={`w-2 h-2 mx-1 rounded-full ${index === currentExampleIndex ? 'bg-black' : 'bg-gray-300'}`}
              ></button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="pt-6">
      <h2 className="text-xl font-medium text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600 mb-6 text-sm">{description}</p>
      
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('theory')}
          className={`py-3 px-4 flex items-center text-sm font-medium ${
            activeTab === 'theory' 
              ? 'text-black border-b-2 border-black' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Teoria
        </button>
        <button
          onClick={() => setActiveTab('definitions')}
          className={`py-3 px-4 flex items-center text-sm font-medium ${
            activeTab === 'definitions' 
              ? 'text-black border-b-2 border-black' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <List className="w-4 h-4 mr-2" />
          Definicje {keyDefinitions?.length > 0 ? `(${keyDefinitions.length})` : ''}
        </button>
        <button
          onClick={() => setActiveTab('examples')}
          className={`py-3 px-4 flex items-center text-sm font-medium ${
            activeTab === 'examples' 
              ? 'text-black border-b-2 border-black' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <BookMarked className="w-4 h-4 mr-2" />
          Przykłady {examples?.length > 0 ? `(${examples.length})` : ''}
        </button>
      </div>
      
      <div className="min-h-[300px] mb-6">
        {activeTab === 'theory' && renderTheory()}
        {activeTab === 'definitions' && renderDefinitions()}
        {activeTab === 'examples' && renderExamples()}
      </div>
      
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <button
          onClick={() => {
            // Tutaj można zaimplementować eksport lekcji
            alert('Funkcja pobierania lekcji jest niedostępna w demo');
          }}
          className="px-4 py-2 border border-gray-200 rounded text-sm font-medium flex items-center text-gray-600 hover:bg-gray-50"
        >
          <Download className="w-4 h-4 mr-2" />
          Pobierz lekcję
        </button>
        
        <button
          onClick={handleNext}
          className="px-5 py-2.5 rounded transition-colors text-sm font-medium bg-black text-white hover:bg-gray-800 flex items-center"
        >
          <PlayCircle className="w-4 h-4 mr-2" />
          {submitLabel}
        </button>
      </div>
    </div>
  );
}