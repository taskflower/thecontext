// src/modules/history/components/HistoryView.tsx
import React, { useState } from "react";
import useHistoryStore from "../historyStore";
import { formatDistanceToNow } from "date-fns";
import { Bot, Calendar, Search, Trash, User } from "lucide-react";

const HistoryView: React.FC = () => {
  const { conversations, deleteConversation } = useHistoryStore();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(
    (conv) =>
      (conv.scenarioName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      conv.steps.some(
        (step) =>
          (step.userMessage?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
          (step.assistantMessage?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      )
  );

  // Get selected conversation details
  const conversationDetails = selectedConversation
    ? conversations.find((conv) => conv.id === selectedConversation)
    : null;

  // Debug log przy renderowaniu komponentu
  console.log("Dostępne konwersacje:", conversations.map(c => ({
    id: c.id,
    name: c.scenarioName,
    steps: c.steps.length,
    przykładowa_wiadomość: c.steps[0]?.userMessage || "(brak)"
  })));

  if (conversationDetails) {
    console.log("Szczegóły wybranej konwersacji:", {
      id: conversationDetails.id,
      name: conversationDetails.scenarioName,
      kroki: conversationDetails.steps.map(s => ({
        węzeł: s.nodeLabel,
        wiadomość_użytkownika: s.userMessage || "(brak)",
        wiadomość_asystenta: s.assistantMessage ? "(obecna)" : "(brak)"
      }))
    });
  }

  return (
    <div className="grid grid-cols-3 gap-4 h-full">
      {/* Left panel with history list */}
      <div className="col-span-1 border-r border-border h-full overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-medium mb-2">Historia konwersacji</h2>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Szukaj konwersacji..."
              className="w-full pl-8 p-2 bg-background border border-border rounded-md text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {filteredConversations.length === 0 ? (
            <div className="text-center p-6 text-muted-foreground">
              <p>Brak historii konwersacji</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className={`p-3 rounded-md cursor-pointer transition-colors ${
                  selectedConversation === conv.id
                    ? "bg-primary/10 border-l-2 border-primary"
                    : "bg-card hover:bg-muted/50 border border-border"
                }`}
                onClick={() => setSelectedConversation(conv.id)}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-sm truncate">{conv.scenarioName || "Unnamed Scenario"}</h3>
                  <button
                    className="p-1 text-muted-foreground hover:text-destructive rounded-full hover:bg-muted"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Czy na pewno chcesz usunąć tę konwersację?")) {
                        deleteConversation(conv.id);
                        if (selectedConversation === conv.id) {
                          setSelectedConversation(null);
                        }
                      }
                    }}
                  >
                    <Trash className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex items-center mt-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>
                    {formatDistanceToNow(new Date(conv.timestamp), { addSuffix: true })}
                  </span>
                  <span className="ml-2">{conv.steps.length} kroków</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right panel with conversation details */}
      <div className="col-span-2 h-full overflow-hidden flex flex-col">
        {!selectedConversation ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Wybierz konwersację, aby zobaczyć szczegóły</p>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-medium">
                {conversationDetails?.scenarioName || "Unnamed Scenario"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {new Date(conversationDetails?.timestamp || 0).toLocaleString()}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {conversationDetails?.steps.map((step, index) => (
                <div key={index} className="space-y-3">
                  {/* Step header */}
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary mr-2">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium">{step.nodeLabel || `Step ${index + 1}`}</span>
                  </div>

                  {/* Assistant message */}
                  {step.assistantMessage && (
                    <div className="flex items-start ml-8">
                      <div className="flex-shrink-0 bg-primary/20 w-6 h-6 rounded-full flex items-center justify-center mr-2">
                        <Bot className="h-3 w-3 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-muted/30 dark:bg-muted/10 border-l-2 border-primary rounded-r-md py-2 px-3 text-sm">
                          {step.assistantMessage}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* User message */}
                  {step.userMessage && (
                    <div className="flex items-start ml-8">
                      <div className="flex-shrink-0 bg-muted w-6 h-6 rounded-full flex items-center justify-center mr-2">
                        <User className="h-3 w-3" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-muted/10 border border-border rounded-md py-2 px-3 text-sm">
                          {step.userMessage}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Plugin indicator */}
                  {step.pluginKey && (
                    <div className="ml-8 flex items-center mt-1">
                      <span className="text-xs bg-primary/15 text-primary px-1.5 py-0.5 rounded-full">
                        Plugin: {step.pluginKey}
                      </span>
                    </div>
                  )}

                  {/* Separator */}
                  {index < (conversationDetails?.steps.length || 0) - 1 && (
                    <div className="border-b border-border/50 pt-2" />
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HistoryView;