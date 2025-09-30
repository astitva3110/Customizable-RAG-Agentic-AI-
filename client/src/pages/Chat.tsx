import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from "axios";
import { Bot, Plus, Send, Sparkles, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import AddWorkflowModal from "./AddWorkFlow";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface Workflow {
  id: string;
  name: string;
  type: "RAG" | "CAG" | "Agentic";
  model: string;
  instruction: string;
  ragConfig?: {
    type: "upload" | "mongo" | "endpoint";
    data: any;
  };
}

const Chat = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [activeTab, setActiveTab] = useState("RAG");
  const [messages, setMessages] = useState<Record<string, Message[]>>({
    RAG: [],
    CAG: [],
    Agentic: [],
  });
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Load messages from localStorage on mount
  useEffect(() => {
    const storedMessages = localStorage.getItem("chatMessages");
    if (storedMessages) setMessages(JSON.parse(storedMessages));
  }, []);

  // Save messages to localStorage and auto-scroll whenever they change
  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAddWorkflow = (workflow: Omit<Workflow, "id">) => {
    const newWorkflow = {
      ...workflow,
      id: Date.now().toString(),
    };
    setWorkflows([...workflows, newWorkflow]);
    setIsModalOpen(false);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    // Add user message
    setMessages(prev => ({
      ...prev,
      [activeTab]: [...prev[activeTab], newMessage],
    }));

    setInputValue("");

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/rag/chat/",
        {
          question: inputValue,
          history: messages[activeTab].map(m => ({
            role: m.isUser ? "user" : "ai",
            content: m.content,
          })),
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        }
      );

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: response.data.answer,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => ({
        ...prev,
        [activeTab]: [...prev[activeTab], aiResponse],
      }));
    } catch (error) {
      console.error("Error fetching response:", error);

      // Optional: Simulated AI response on error
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `✨ Simulated ${activeTab} response due to error.`,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => ({
        ...prev,
        [activeTab]: [...prev[activeTab], aiResponse],
      }));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="mt-0 min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Header */}
      <header className="relative border-b bg-white border-primary/20 bg-gradient-to-r from-background/80 via-card/90 to-background/80 backdrop-blur-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-disco opacity-30 mix-blend-screen animate-pulse"></div>
        <div className="container mx-auto px-4 py-8 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  AI Disco
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Intelligent Workflow Orchestration
                </p>
              </div>
              {workflows.length > 0 && (
                <div className="flex items-center space-x-3 ml-8">
                  <span className="text-sm text-muted-foreground">Active Workflows:</span>
                  <div className="flex flex-wrap gap-2">
                    {workflows.map(workflow => (
                      <Badge
                        key={workflow.id}
                        variant="secondary"
                        className="text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
                      >
                        {workflow.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-primary hover:shadow-glow transition-smooth relative overflow-hidden group"
              size="lg"
            >
              <div className="absolute inset-0 bg-gradient-disco opacity-0 group-hover:opacity-20 transition-opacity"></div>
              <Plus className="h-5 w-5 mr-2" />
              Create Workflow
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-card/50 backdrop-blur-sm border border-primary/10 shadow-lg">
            {["RAG", "CAG", "Agentic"].map(tab => {
              const Icon = tab === "RAG" ? Bot : tab === "CAG" ? Sparkles : User;
              return (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="transition-smooth data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {["RAG", "CAG", "Agentic"].map(tabValue => (
            <TabsContent key={tabValue} value={tabValue} className="mt-0">
              <Card className="h-[400px] flex flex-col shadow-elegant border-primary/20 bg-card/80 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-subtle opacity-30 pointer-events-none"></div>
                <CardHeader className="relative border-b border-primary/10">
                  <CardTitle className="text-xl bg-gradient-primary bg-clip-text text-transparent flex items-center">
                    <div className="h-2 w-2 bg-primary rounded-full mr-3 animate-pulse"></div>
                    {tabValue} Chat Interface
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col relative p-6">
                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto space-y-6 mb-6 pr-2">
                    {messages[tabValue].length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="relative inline-block mb-4">
                            <Bot className="h-16 w-16 text-primary/40" />
                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
                          </div>
                          <p className="text-muted-foreground text-lg">
                            Start a conversation with your {tabValue} workflow
                          </p>
                          <p className="text-sm text-muted-foreground/60 mt-2">
                            Ask questions, get insights, and explore possibilities
                          </p>
                        </div>
                      </div>
                    ) : (
                      messages[tabValue].map(message => (
                        <div
                          key={message.id}
                          className={`flex items-start space-x-4 ${
                            message.isUser ? "justify-end" : "justify-start"
                          } animate-fade-in`}
                        >
                          {!message.isUser && (
                            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
                              <Bot className="h-5 w-5 text-primary-foreground" />
                            </div>
                          )}
                          <div
                            className={`max-w-[75%] p-4 rounded-2xl transition-smooth hover-scale ${
                              message.isUser
                                ? "bg-gradient-primary text-primary-foreground shadow-glow"
                                : "bg-card/80 border border-primary/20 text-foreground backdrop-blur-sm"
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{message.content}</p>
                            <p className="text-xs opacity-60 mt-2">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                          {message.isUser && (
                            <div className="w-10 h-10 rounded-full bg-muted/80 flex items-center justify-center">
                              <User className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="flex space-x-3 bg-card/50 p-4 rounded-2xl border border-primary/20 backdrop-blur-sm">
                    <Input
                      placeholder={`Ask your ${tabValue} assistant anything...`}
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="border-primary/20 bg-background/50 focus:border-primary transition-smooth text-base"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim()}
                      className="bg-gradient-primary hover:shadow-glow transition-smooth relative overflow-hidden group px-6"
                    >
                      <div className="absolute inset-0 bg-gradient-disco opacity-0 group-hover:opacity-30 transition-opacity"></div>
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </main>

      <AddWorkflowModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddWorkflow}
      />
    </div>
  );
};

export default Chat;
