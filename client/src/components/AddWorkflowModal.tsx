import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface AddWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (workflow: {
    name: string;
    type: "RAG" | "CAG" | "Agentic";
    model: string;
    instruction: string;
  }) => void;
}

const AddWorkflowModal = ({ isOpen, onClose, onSave }: AddWorkflowModalProps) => {
  const [name, setName] = useState("");
  const [type, setType] = useState<"RAG" | "CAG" | "Agentic">("RAG");
  const [model, setModel] = useState("");
  const [instruction, setInstruction] = useState("");
  const { toast } = useToast();

  const handleSave = () => {
    if (!name.trim() || !model || !instruction.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    onSave({
      name: name.trim(),
      type,
      model,
      instruction: instruction.trim(),
    });

    // Reset form
    setName("");
    setType("RAG");
    setModel("");
    setInstruction("");

    toast({
      title: "Workflow created",
      description: `${name} workflow has been created successfully.`,
    });
  };

  const handleClose = () => {
    setName("");
    setType("RAG");
    setModel("");
    setInstruction("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border/50 shadow-card">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Add New Workflow
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Create a new AI workflow configuration
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="workflow-name" className="text-foreground">
              Workflow Name
            </Label>
            <Input
              id="workflow-name"
              placeholder="Enter workflow name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-border/50 bg-input/50 focus:border-primary transition-smooth"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="workflow-type" className="text-foreground">
              Workflow Type
            </Label>
            <Select value={type} onValueChange={(value) => setType(value as "RAG" | "CAG" | "Agentic")}>
              <SelectTrigger className="border-border/50 bg-input/50 focus:border-primary transition-smooth">
                <SelectValue placeholder="Select workflow type" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border/50">
                <SelectItem value="RAG">RAG (Retrieval Augmented Generation)</SelectItem>
                <SelectItem value="CAG">CAG (Conversational AI Generation)</SelectItem>
                <SelectItem value="Agentic">Agentic Workflow</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="model-select" className="text-foreground">
              Model Selection
            </Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="border-border/50 bg-input/50 focus:border-primary transition-smooth">
                <SelectValue placeholder="Select Model" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border/50">
                <SelectItem value="gpt-4">GPT-4</SelectItem>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                <SelectItem value="llama-2-70b">Llama 2 70B</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="instruction" className="text-foreground">
              Instruction/Prompt
            </Label>
            <Textarea
              id="instruction"
              placeholder="Enter your workflow instructions or prompt..."
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              className="min-h-[100px] border-border/50 bg-input/50 focus:border-primary transition-smooth resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} className="border-border/50">
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-gradient-primary hover:shadow-glow transition-smooth">
            Save Workflow
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddWorkflowModal;