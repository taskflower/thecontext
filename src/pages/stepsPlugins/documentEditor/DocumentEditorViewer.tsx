// src/pages/stepsPlugins/documentEditor/DocumentEditorViewer.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Wand2, Send } from "lucide-react";
import { ViewerProps } from "../types";
import { useDataStore } from "@/store";
import { ConversationItem } from "@/types";

export function DocumentEditorViewer({ step, onComplete }: ViewerProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("edit");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [conversation, setConversation] = useState<ConversationItem[]>([]);

  const { addDocItem, getDocItem } = useDataStore();

  // Initialize from step config or result
  useEffect(() => {
    if (step.result?.documentId) {
      // Try to load document from data store
      const doc = getDocItem(step.result.documentId);
      if (doc) {
        setTitle(doc.title);
        setContent(doc.content);
        setTags(doc.metaKeys);
        setSaved(true);
      } else {
        // Fall back to result data
        setTitle(step.result.title || "");
        setContent(step.result.content || "");
        setTags(step.result.tags || []);
      }
    } else {
      // Initialize from config
      setTitle(step.config.documentTitle || "New Document");
      setContent(step.config.initialContent || "");
      setTags(step.config.tags || []);
    }
  }, [step.config, step.result, getDocItem]);

  // Add a tag
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  // Remove a tag
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // Save the document
  const saveDocument = async () => {
    if (!title.trim() || !content.trim()) return;

    setLoading(true);

    try {
      // If we have an existing document ID, use it
      const documentId = step.result?.documentId || `doc-${Date.now()}`;

      // Create document object
      const docItem = {
        id: documentId,
        title,
        content,
        metaKeys: tags,
        schema: {},
        folderId: step.config.saveDocumentToFolder || "root",
        createdAt: step.result?.timestamp || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to data store
      addDocItem(docItem);

      // Complete the step
      onComplete(
        {
          documentId,
          title,
          content,
          tags,
          timestamp: new Date().toISOString(),
        },
        conversation
      );

      setSaved(true);
    } catch (err) {
      console.error("Error saving document:", err);
    } finally {
      setLoading(false);
    }
  };

  // Request AI assistance
  const requestAiAssistance = async () => {
    if (!aiPrompt.trim()) return;

    setAiLoading(true);

    try {
      // Add user message to conversation
      const newConversation = [
        ...conversation,
        { role: "user", content: aiPrompt },
      ];
      setConversation(newConversation);

      // In a real app, this would call your LLM API
      // For this example, we'll simulate a response
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Generate a response based on the prompt
      let aiResponse = "";

      if (
        aiPrompt.toLowerCase().includes("edit") ||
        aiPrompt.toLowerCase().includes("revise")
      ) {
        aiResponse = `Here's a revised version of your document:\n\n# ${title}\n\n${content}\n\nI've improved the structure and clarity while maintaining your key points.`;
      } else if (aiPrompt.toLowerCase().includes("summarize")) {
        aiResponse = `# Summary of ${title}\n\nThis document covers the following key points:\n\n1. First major point from the content\n2. Second major point from the content\n3. Third major point from the content\n\nThe main conclusion is that [summary of conclusion].`;
      } else if (
        aiPrompt.toLowerCase().includes("expand") ||
        aiPrompt.toLowerCase().includes("add")
      ) {
        aiResponse = `I've expanded your document with additional details:\n\n# ${title}\n\n${content}\n\n## Additional Information\n\nHere are some important details to consider:\n\n1. First additional point\n2. Second additional point\n3. Third additional point\n\n## Conclusion\n\nIn conclusion, these points strengthen the overall argument by providing more context and evidence.`;
      } else {
        aiResponse = `I've analyzed your document "${title}" and here are my suggestions:\n\n1. The structure is clear, but you might consider adding subheadings for better organization.\n2. The introduction effectively sets up the main topic.\n3. Consider adding more supporting evidence for your second point.\n4. The conclusion nicely summarizes the key points.\n\nOverall, this is a well-written document that effectively communicates your message.`;
      }

      // Add AI response to conversation
      newConversation.push({ role: "assistant", content: aiResponse });
      setConversation(newConversation);

      // Clear prompt
      setAiPrompt("");
    } catch (err) {
      console.error("Error requesting AI assistance:", err);
    } finally {
      setAiLoading(false);
    }
  };

  // Render markdown preview
  const renderMarkdown = () => {
    // In a real app, you'd use a markdown renderer like react-markdown
    // For this example, we'll just render the plain text
    return (
      <div className="prose prose-sm max-w-none overflow-auto">
        <pre className="whitespace-pre-wrap">{content}</pre>
      </div>
    );
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>{step.config.title || "Edit Document"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Document Title"
            className="text-lg font-medium"
          />
        </div>

        <div className="flex flex-wrap gap-1 mb-2">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-muted ml-1"
              >
                ×
              </button>
            </Badge>
          ))}
          <div className="flex items-center gap-1">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add tag..."
              className="h-6 text-xs w-24"
              onKeyPress={(e) => e.key === "Enter" && addTag()}
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              onClick={addTag}
            >
              +
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-2">
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            {step.config.enableAIAssistance && (
              <TabsTrigger value="ai-assist">AI Assistance</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="edit" className="min-h-[300px]">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your document..."
              className="w-full h-[300px] p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </TabsContent>

          <TabsContent
            value="preview"
            className="min-h-[300px] border rounded-md p-4 overflow-auto"
          >
            {renderMarkdown()}
          </TabsContent>

          {step.config.enableAIAssistance && (
            <TabsContent value="ai-assist" className="min-h-[300px]">
              <div className="border rounded-md p-4 h-[300px] overflow-auto mb-4">
                {conversation.length === 0 ? (
                  <div className="text-center text-muted-foreground p-6">
                    <Wand2 className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    <p>Ask the AI for assistance with your document.</p>
                    <p className="text-xs mt-1">
                      Example: "Summarize this document" or "Help me improve the
                      conclusion"
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {conversation.map((msg, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-lg ${
                          msg.role === "user"
                            ? "bg-primary/10 ml-6"
                            : "bg-muted mr-6"
                        }`}
                      >
                        <p className="text-xs font-medium mb-1">
                          {msg.role === "user" ? "You" : "AI Assistant"}
                        </p>
                        <pre className="whitespace-pre-wrap text-sm">
                          {msg.content}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Input
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ask for AI assistance..."
                  disabled={aiLoading}
                  onKeyPress={(e) => e.key === "Enter" && requestAiAssistance()}
                />
                <Button
                  onClick={requestAiAssistance}
                  disabled={aiLoading || !aiPrompt.trim()}
                >
                  {aiLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
      <CardFooter className="justify-between">
        <div>
          {saved && (
            <span className="text-sm text-green-600 flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
              Document saved
            </span>
          )}
        </div>
        <Button
          onClick={saveDocument}
          disabled={loading || !title.trim() || !content.trim()}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Document
        </Button>
      </CardFooter>
    </Card>
  );
}
