import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Send, Bot, User } from "lucide-react";
import AddWorkflowModal from "@/components/AddWorkflowModal";

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
}

const Chat = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [activeTab, setActiveTab] = useState("RAG");
  const [messages, setMessages] = useState<Record<string, Message[]>>({
    RAG: [],
    CAG: [],
    Agentic: []
  });
  const [inputValue, setInputValue] = useState("");

  const handleAddWorkflow = (workflow: Omit<Workflow, "id">) => {
    const newWorkflow = {
      ...workflow,
      id: Date.now().toString()
    };
    setWorkflows([...workflows, newWorkflow]);
    setIsModalOpen(false);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => ({
      ...prev,
      [activeTab]: [...prev[activeTab], newMessage]
    }));

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `This is a simulated ${activeTab} response to: "${inputValue}"`,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => ({
        ...prev,
        [activeTab]: [...prev[activeTab], aiResponse]
      }));
    }, 1000);

    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Workflow Hub
              </h1>
              {workflows.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">My Workflows:</span>
                  {workflows.map((workflow) => (
                    <Badge key={workflow.id} variant="secondary" className="text-xs">
                      {workflow.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-primary hover:shadow-glow transition-smooth"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Workflow
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/30">
            <TabsTrigger value="RAG" className="transition-smooth">RAG</TabsTrigger>
            <TabsTrigger value="CAG" className="transition-smooth">CAG</TabsTrigger>
            <TabsTrigger value="Agentic" className="transition-smooth">Agentic Workflow</TabsTrigger>
          </TabsList>

          {["RAG", "CAG", "Agentic"].map((tabValue) => (
            <TabsContent key={tabValue} value={tabValue} className="mt-0">
              <Card className="h-[600px] flex flex-col shadow-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">{tabValue} Chat Interface</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                    {messages[tabValue].length === 0 ? (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <p>Start a conversation with your {tabValue} workflow</p>
                      </div>
                    ) : (
                      messages[tabValue].map((message) => (
                        <div
                          key={message.id}
                          className={`flex items-start space-x-3 ${
                            message.isUser ? "justify-end" : "justify-start"
                          }`}
                        >
                          {!message.isUser && (
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                              <Bot className="h-4 w-4 text-primary" />
                            </div>
                          )}
                          <div
                            className={`max-w-[70%] p-3 rounded-lg ${
                              message.isUser
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                          </div>
                          {message.isUser && (
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Input Area */}
                  <div className="flex space-x-2">
                    <Input
                      placeholder={`Type your message for ${tabValue}...`}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="border-border/50 bg-input/50 focus:border-primary transition-smooth"
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim()}
                      className="bg-gradient-primary hover:shadow-glow transition-smooth"
                    >
                      <Send className="h-4 w-4" />
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