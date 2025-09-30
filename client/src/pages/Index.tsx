import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Workflow, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const Index = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-secondary flex items-center justify-center p-4 pt-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              AI Disco
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Manage and deploy powerful AI workflows with RAG, CAG, and Agentic capabilities
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="shadow-card border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-glow transition-smooth">
              <CardHeader>
                <Bot className="h-12 w-12 mx-auto text-primary mb-2" />
                <CardTitle>RAG Workflows</CardTitle>
                <CardDescription>
                  Retrieval Augmented Generation for enhanced AI responses
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-card border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-glow transition-smooth">
              <CardHeader>
                <Workflow className="h-12 w-12 mx-auto text-primary mb-2" />
                <CardTitle>CAG Systems</CardTitle>
                <CardDescription>
                  Conversational AI Generation for natural interactions
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-card border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-glow transition-smooth">
              <CardHeader>
                <Zap className="h-12 w-12 mx-auto text-primary mb-2" />
                <CardTitle>Agentic Workflows</CardTitle>
                <CardDescription>
                  Autonomous AI agents for complex task automation
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {!isLoggedIn && (
            <div className="space-y-4">
              <Button 
                onClick={() => navigate("/login")}
                className="bg-gradient-primary hover:shadow-glow transition-smooth text-lg px-8 py-3"
                size="lg"
              >
                Get Started
              </Button>
              <p className="text-sm text-muted-foreground">
                Already have an account? Click above to sign in
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Index;