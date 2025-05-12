// src/themes/goldsaver/widgets/ChatWidget.tsx
import { useState } from "react";
import { Send, Clock } from "lucide-react";

export default function ChatWidget() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "system",
      content: "Witamy w czacie wsparcia. Jak możemy pomóc?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    // Dodaj wiadomość użytkownika
    const userMessage = {
      id: messages.length + 1,
      sender: "user",
      content: newMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, userMessage]);
    setNewMessage("");

    // Symuluj odpowiedź agenta (po 1 sekundzie)
    setTimeout(() => {
      const agentMessage = {
        id: messages.length + 2,
        sender: "agent",
        content:
          "Dziękujemy za wiadomość. Agent wsparcia odpowie najszybciej jak to możliwe.",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, agentMessage]);
    }, 1000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[600px]">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Czat wsparcia</h2>
        <div className="flex items-center text-sm text-green-500">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          Online
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] rounded-lg p-3 ${
                  message.sender === "user"
                    ? "bg-blue-600 text-white"
                    : message.sender === "system"
                    ? "bg-yellow-50 border border-yellow-200 text-gray-700"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {message.sender !== "user" && (
                  <div className="flex items-center mb-1">
                    {message.sender === "system" ? (
                      <p className="text-xs font-medium text-yellow-700">
                        System
                      </p>
                    ) : (
                      <p className="text-xs font-medium text-gray-500">
                        Agent wsparcia
                      </p>
                    )}
                  </div>
                )}

                <p className="text-sm">{message.content}</p>

                <div
                  className={`text-xs mt-1 flex items-center ${
                    message.sender === "user"
                      ? "text-blue-200"
                      : "text-gray-500"
                  }`}
                >
                  <Clock className="w-3 h-3 mr-1 inline" />
                  {new Date(message.timestamp).toLocaleTimeString("pl-PL", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Napisz wiadomość..."
            className="flex-1 py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-600 focus:border-yellow-600"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendMessage();
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className={`px-4 py-2 rounded-lg flex items-center justify-center transition-colors ${
              newMessage.trim()
                ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Czas oczekiwania na odpowiedź: ok. 5 minut
        </p>
      </div>
    </div>
  );
}
