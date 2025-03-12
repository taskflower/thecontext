// src/plugins/text-analyzer/index.tsx
import React, { useState } from 'react';
import { 
  PluginBase, 
  PluginComponentProps, 
  PluginProcessInput, 
  PluginProcessResult 
} from '../PluginInterface';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";

// Plugin config type
interface TextAnalyzerConfig {
  includeWordCount: boolean;
  includeSentenceCount: boolean;
  includeReadingTime: boolean;
  includeCharacterCount: boolean;
}

// Analysis result type
interface AnalysisResult {
  wordCount?: number;
  sentenceCount?: number;
  readingTimeMinutes?: number;
  characterCount?: number;
}

class TextAnalyzerPlugin extends PluginBase {
  constructor() {
    super({
      id: 'text-analyzer',
      name: 'Text Analyzer',
      description: 'Analyzes text for word count, sentences, and reading time',
      version: '1.0.0',
      defaultConfig: {
        includeWordCount: true,
        includeSentenceCount: true,
        includeReadingTime: true,
        includeCharacterCount: false
      }
    });
  }
  
  // Configuration component
  ConfigComponent: React.FC<PluginComponentProps> = ({ 
    config, 
    onConfigChange = () => {} 
  }) => {
    const pluginConfig = { ...this.defaultConfig, ...config } as TextAnalyzerConfig;
    
    const handleToggle = (key: keyof TextAnalyzerConfig) => {
      onConfigChange({ [key]: !pluginConfig[key] });
    };
    
    return (
      <div className="space-y-4">
        <h3 className="font-medium">Text Analyzer Configuration</h3>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="wordCount" 
              checked={pluginConfig.includeWordCount}
              onCheckedChange={() => handleToggle('includeWordCount')}
            />
            <Label htmlFor="wordCount">Word count</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="sentenceCount" 
              checked={pluginConfig.includeSentenceCount}
              onCheckedChange={() => handleToggle('includeSentenceCount')}
            />
            <Label htmlFor="sentenceCount">Sentence count</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="readingTime" 
              checked={pluginConfig.includeReadingTime}
              onCheckedChange={() => handleToggle('includeReadingTime')}
            />
            <Label htmlFor="readingTime">Estimated reading time</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="characterCount" 
              checked={pluginConfig.includeCharacterCount}
              onCheckedChange={() => handleToggle('includeCharacterCount')}
            />
            <Label htmlFor="characterCount">Character count</Label>
          </div>
        </div>
      </div>
    );
  };
  
  // Main view component
  ViewComponent: React.FC<PluginComponentProps> = ({ 
    config,
    onConfigChange = () => {}
  }) => {
    const [text, setText] = useState('');
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    
    const pluginConfig = { ...this.defaultConfig, ...config } as TextAnalyzerConfig;
    
    const analyzeText = () => {
      if (!text.trim()) {
        setAnalysis(null);
        return;
      }
      
      const results: AnalysisResult = {};
      
      // Word count
      if (pluginConfig.includeWordCount) {
        results.wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
      }
      
      // Sentence count
      if (pluginConfig.includeSentenceCount) {
        results.sentenceCount = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
      }
      
      // Reading time
      if (pluginConfig.includeReadingTime) {
        const wordsPerMinute = 200; // Average reading speed
        const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
        results.readingTimeMinutes = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
      }
      
      // Character count
      if (pluginConfig.includeCharacterCount) {
        results.characterCount = text.length;
      }
      
      setAnalysis(results);
    };
    
    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="textInput">Text to analyze</Label>
          <Textarea
            id="textInput"
            placeholder="Enter text to analyze..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            className="mt-1 font-sans"
          />
        </div>
        
        <Button 
          onClick={analyzeText}
          disabled={!text.trim()}
        >
          Analyze Text
        </Button>
        
        {analysis && (
          <Card className="p-4 bg-slate-50">
            <h4 className="font-medium mb-2">Analysis Results</h4>
            <ul className="space-y-1">
              {analysis.wordCount !== undefined && (
                <li>Word count: <span className="font-medium">{analysis.wordCount}</span></li>
              )}
              {analysis.sentenceCount !== undefined && (
                <li>Sentence count: <span className="font-medium">{analysis.sentenceCount}</span></li>
              )}
              {analysis.readingTimeMinutes !== undefined && (
                <li>Estimated reading time: <span className="font-medium">{analysis.readingTimeMinutes} min</span></li>
              )}
              {analysis.characterCount !== undefined && (
                <li>Character count: <span className="font-medium">{analysis.characterCount}</span></li>
              )}
            </ul>
          </Card>
        )}
      </div>
    );
  };
  
  // Results component
  ResultComponent: React.FC<PluginComponentProps> = ({ 
    nodeId,
    config
  }) => {
    // Get the plugin result from the store
    const { getPluginState } = usePluginStore();
    const pluginState = getPluginState(this.id);
    const analysisResult = pluginState?.result;
    
    if (!analysisResult) {
      return (
        <div className="p-4 text-slate-500 bg-slate-50 rounded-md border border-slate-200 text-sm text-center">
          No analysis results available. Use the View tab to analyze text.
        </div>
      );
    }
    
    return (
      <div className="p-4 border rounded-md bg-slate-50">
        <h3 className="font-medium mb-2">Text Analysis Results</h3>
        <ul className="space-y-1">
          {analysisResult.wordCount !== undefined && (
            <li>Word count: <span className="font-medium">{analysisResult.wordCount}</span></li>
          )}
          {analysisResult.sentenceCount !== undefined && (
            <li>Sentence count: <span className="font-medium">{analysisResult.sentenceCount}</span></li>
          )}
          {analysisResult.readingTimeMinutes !== undefined && (
            <li>Estimated reading time: <span className="font-medium">{analysisResult.readingTimeMinutes} min</span></li>
          )}
          {analysisResult.characterCount !== undefined && (
            <li>Character count: <span className="font-medium">{analysisResult.characterCount}</span></li>
          )}
        </ul>
      </div>
    );
  };
  
  // Process node with this plugin
  processNode(input: PluginProcessInput): PluginProcessResult {
    const { config, input: text } = input;
    const pluginConfig = { ...this.defaultConfig, ...config } as TextAnalyzerConfig;
    
    // Skip empty input
    if (!text || !text.trim()) {
      return {
        output: "No text provided for analysis",
        result: null
      };
    }
    
    const results: AnalysisResult = {};
    let outputLines: string[] = ["Text Analysis Results:"];
    
    // Word count
    if (pluginConfig.includeWordCount) {
      const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
      results.wordCount = wordCount;
      outputLines.push(`Word count: ${wordCount}`);
    }
    
    // Sentence count
    if (pluginConfig.includeSentenceCount) {
      const sentenceCount = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
      results.sentenceCount = sentenceCount;
      outputLines.push(`Sentence count: ${sentenceCount}`);
    }
    
    // Reading time
    if (pluginConfig.includeReadingTime) {
      const wordsPerMinute = 200; // Average reading speed
      const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
      const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
      results.readingTimeMinutes = readingTimeMinutes;
      outputLines.push(`Estimated reading time: ${readingTimeMinutes} min`);
    }
    
    // Character count
    if (pluginConfig.includeCharacterCount) {
      const characterCount = text.length;
      results.characterCount = characterCount;
      outputLines.push(`Character count: ${characterCount}`);
    }
    
    return {
      output: outputLines.join("\n"),
      result: results
    };
  }
}

// Import plugins store for results component
import { usePluginStore } from '../../stores/pluginStore';

export default new TextAnalyzerPlugin();