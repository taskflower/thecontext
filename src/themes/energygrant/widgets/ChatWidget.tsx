// src/themes/energygrant/widgets/ChatWidget.tsx
import { useState, useRef, useEffect } from 'react';
import { Send, User, ArrowDown } from 'lucide-react';

type Message = {
  id: string;
  content: string;
  sender: 'user' | 'operator';
  timestamp: Date;
};

type ChatWidgetProps = {
  title?: string;
};

export default function ChatWidget({ 
  title = "Chat z operatorem" 
}: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Witaj! Jestem operatorem programu dotacji energetycznych. W czym mogę pomóc?',
      sender: 'operator',
      timestamp: new Date(Date.now() - 60000) // 1 minuta temu
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Symulacja statusu operatora
  useEffect(() => {
    const randomTimeout = Math.floor(Math.random() * 5000) + 3000;
    const interval = setInterval(() => {
      setIsOnline(Math.random() > 0.3); // 70% szans że operator jest dostępny
    }, randomTimeout);
    
    return () => clearInterval(interval);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;
    
    // Dodaj wiadomość użytkownika
    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    
    // Symulacja "pisania" przez operatora
    setIsTyping(true);
    
    // Symulacja odpowiedzi operatora
    const timeout = Math.floor(Math.random() * 3000) + 1000; // 1-4 sekund
    setTimeout(() => {
      setIsTyping(false);
      
      const operatorResponses = [
        "Dziękuję za wiadomość. Sprawdzę to i wrócę do Pana/Pani wkrótce.",
        "Rozumiem Pana/Pani pytanie. Pozwolę sobie to dokładnie przeanalizować i odpowiem najszybciej jak to możliwe.",
        "Dziękuję za kontakt. Jesteśmy w trakcie weryfikacji Pana/Pani wniosku. Prosimy o cierpliwość.",
        "Dziękuję za informację. Na ten moment najlepszym rozwiązaniem będzie kontakt telefoniczny. Czy mogę zadzwonić do Pana/Pani?",
        "Dzień dobry, odpowiadając na Pana/Pani pytanie - tak, ten typ inwestycji kwalifikuje się do dotacji w ramach naszego programu."
      ];
      
      const randomResponse = operatorResponses[Math.floor(Math.random() * operatorResponses.length)];
      
      const operatorMessage: Message = {
        id: Date.now().toString(),
        content: randomResponse,
        sender: 'operator',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, operatorMessage]);
    }, timeout);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <div className={`ml-3 h-2.5 w-2.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          <span className="ml-2 text-xs text-gray-500">{isOnline ? 'Operator dostępny' : 'Operator niedostępny'}</span>
        </div>
        <button 
          onClick={scrollToBottom}
          className="text-gray-400 hover:text-gray-600"
        >
          <ArrowDown size={16} />
        </button>
      </div>
      
      <div className="p-4 h-96 overflow-y-auto bg-gray-50">
        <div className="space-y-4">
          {messages.map(message => (
            <div 
              key={message.id} 
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-xs md:max-w-md rounded-lg p-3 ${
                  message.sender === 'user' 
                    ? 'bg-green-100 text-gray-800' 
                    : 'bg-white border border-gray-200 text-gray-800'
                }`}
              >
                <div className="flex items-start mb-1">
                  {message.sender === 'operator' && (
                    <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs mr-2">
                      O
                    </div>
                  )}
                  {message.sender === 'user' && (
                    <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs mr-2">
                      <User size={12} />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm">
                      {message.content}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 text-right">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-xs md:max-w-md rounded-lg p-3 bg-white border border-gray-200 text-gray-800">
                <div className="flex items-center space-x-1">
                  <div className="h-2 w-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="h-2 w-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="h-2 w-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Napisz wiadomość..."
            className="flex-1 border border-gray-200 rounded-l-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={newMessage.trim() === ''}
            className="bg-green-600 hover:bg-green-700 text-white rounded-r-md py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </div>
        
        <div className="mt-2 text-xs text-gray-500 text-center">
          {isOnline 
            ? 'Operator odpowiada zazwyczaj w ciągu kilku minut'
            : 'Operator jest aktualnie niedostępny. Odpowie na Twoją wiadomość najszybciej jak to możliwe.'}
        </div>
      </div>
    </div>
  );
}