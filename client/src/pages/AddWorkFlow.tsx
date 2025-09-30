import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Bot, Database, FileText, Globe, Sparkles, Upload } from "lucide-react";
import { useState } from "react";

interface Workflow {
  name: string;
  type: "RAG" | "CAG" | "Agentic";
  model: string;
  instruction: string;
  ragConfig?: {
    type: "upload" | "mongo" | "endpoint";
    data: any;
  };
}

interface AddWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (workflow: Workflow) => void;
}

const AddWorkflowModal = ({
  isOpen,
  onClose,
  onSave,
}: AddWorkflowModalProps) => {
  const [formData, setFormData] = useState<Workflow>({
    name: "",
    type: "RAG",
    model: "",
    instruction: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [ragConfigType, setRagConfigType] = useState<
    "upload" | "mongo" | "endpoint" | ""
  >("");
  const [ragData, setRagData] = useState<any>({});
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.type === "RAG" && ragConfigType === "upload") {
      if (!ragData.fileObj) {
        alert("Please select a file");
        return;
      }

      const uploadData = new FormData();
      uploadData.append("source_type", "file");
      uploadData.append("chroma_collection", formData.name);
      uploadData.append("doc", ragData.fileObj);

      setIsLoading(true); // 🚀 show loading
      try {
        const res = await fetch("http://127.0.0.1:8000/rag/upload/", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: uploadData,
        });

        const result = await res.json();
        console.log("Upload result:", result);

        if (result.status === "200") {
          toast({
            title: "✅ Upload Successful",
            description: `Collection created: ${result.data.collection_name}`,
          });

          onSave({
            ...formData,
            ragConfig: {
              type: "upload",
              data: { collection_name: result.data.collection_name },
            },
          });
          handleReset();
        } else {
          toast({
            title: "❌ Upload Failed",
            description: result.message || "Something went wrong",
            variant: "destructive",
          });
        }
      } catch (err) {
        console.error("Upload error:", err);
        toast({
          title: "⚠️ Error",
          description: "Upload failed. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false); // 🚀 hide loading
      }
      return;
    }

    // fallback for other workflow types (CAG, Agentic, etc.)
    onSave(formData);
    handleReset();
  };

  const handleReset = () => {
    setFormData({
      name: "",
      type: "RAG",
      model: "",
      instruction: "",
    });
    setRagConfigType("");
    setRagData({});
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const renderRagConfig = () => {
    if (formData.type !== "RAG" || !ragConfigType) return null;

    switch (ragConfigType) {
      case "upload":
        return (
          <Card className="bg-muted/30 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <Upload className="h-4 w-4 mr-2 text-primary" />
                Document Upload
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Label htmlFor="file-upload" className="text-sm font-medium">
                  Select Document
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.md"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setRagData({
                        file: file.name,
                        size: file.size,
                        type: file.type,
                        fileObj: file, // 🔥 store actual file object
                      });
                    }
                  }}
                  className="border-primary/20 bg-background/50"
                />

                <p className="text-xs text-muted-foreground">
                  Supported formats: PDF, DOC, DOCX, TXT, MD
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case "mongo":
        return (
          <Card className="bg-muted/30 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <Database className="h-4 w-4 mr-2 text-primary" />
                MongoDB Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="connection_uri"
                    className="text-sm font-medium"
                  >
                    Connection URI
                  </Label>
                  <Input
                    id="connection_uri"
                    placeholder="mongodb://localhost:27017"
                    value={ragData.connection_uri || ""}
                    onChange={(e) =>
                      setRagData((prev) => ({
                        ...prev,
                        connection_uri: e.target.value,
                      }))
                    }
                    className="border-primary/20 bg-background/50"
                  />
                </div>
                <div>
                  <Label htmlFor="db_name" className="text-sm font-medium">
                    Database Name
                  </Label>
                  <Input
                    id="db_name"
                    placeholder="my_database"
                    value={ragData.db_name || ""}
                    onChange={(e) =>
                      setRagData((prev) => ({
                        ...prev,
                        db_name: e.target.value,
                      }))
                    }
                    className="border-primary/20 bg-background/50"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="collection_name"
                    className="text-sm font-medium"
                  >
                    Collection Name
                  </Label>
                  <Input
                    id="collection_name"
                    placeholder="documents"
                    value={ragData.collection_name || ""}
                    onChange={(e) =>
                      setRagData((prev) => ({
                        ...prev,
                        collection_name: e.target.value,
                      }))
                    }
                    className="border-primary/20 bg-background/50"
                  />
                </div>
                <div>
                  <Label htmlFor="query" className="text-sm font-medium">
                    Query (JSON)
                  </Label>
                  <Textarea
                    id="query"
                    placeholder='{"status": "active"}'
                    value={ragData.query || "{}"}
                    onChange={(e) =>
                      setRagData((prev) => ({ ...prev, query: e.target.value }))
                    }
                    className="border-primary/20 bg-background/50 min-h-[80px]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case "endpoint":
        return (
          <Card className="bg-muted/30 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <Globe className="h-4 w-4 mr-2 text-primary" />
                API Endpoint
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="endpoint_url" className="text-sm font-medium">
                  Endpoint URL
                </Label>
                <Input
                  id="endpoint_url"
                  placeholder="https://api.example.com/data"
                  value={ragData.url || ""}
                  onChange={(e) => setRagData({ url: e.target.value })}
                  className="border-primary/20 bg-background/50"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Enter the API endpoint that provides your data
                </p>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-xl border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent flex items-center">
            <Sparkles className="h-6 w-6 mr-3 text-primary" />
            Create New Workflow
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium">
                Workflow Name
              </Label>
              <Input
                id="name"
                placeholder="My Awesome Workflow"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
                className="border-primary/20 bg-background/50"
              />
            </div>

            <div>
              <Label htmlFor="type" className="text-sm font-medium">
                Workflow Type
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value: "RAG" | "CAG" | "Agentic") => {
                  setFormData((prev) => ({ ...prev, type: value }));
                  setRagConfigType("");
                  setRagData({});
                }}
              >
                <SelectTrigger className="border-primary/20 bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RAG">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      RAG (Retrieval Augmented Generation)
                    </div>
                  </SelectItem>
                  <SelectItem value="CAG">
                    <div className="flex items-center">
                      <Bot className="h-4 w-4 mr-2" />
                      CAG (Context Augmented Generation)
                    </div>
                  </SelectItem>
                  <SelectItem value="Agentic">
                    <div className="flex items-center">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Agentic Workflow
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="model" className="text-sm font-medium">
                AI Model
              </Label>
              <Select
                value={formData.model}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, model: value }))
                }
              >
                <SelectTrigger className="border-primary/20 bg-background/50">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="claude-3">Claude 3</SelectItem>
                  <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="instruction" className="text-sm font-medium">
                System Instruction
              </Label>
              <Textarea
                id="instruction"
                placeholder="Provide detailed instructions for your AI assistant..."
                value={formData.instruction}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    instruction: e.target.value,
                  }))
                }
                className="border-primary/20 bg-background/50 min-h-[100px]"
              />
            </div>
          </div>

          {/* RAG Configuration */}
          {formData.type === "RAG" && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  RAG Data Source
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  <Card
                    className={`cursor-pointer transition-all border-2 ${
                      ragConfigType === "upload"
                        ? "border-primary bg-primary/10"
                        : "border-muted hover:border-primary/50"
                    }`}
                    onClick={() => setRagConfigType("upload")}
                  >
                    <CardContent className="p-4 text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-sm font-medium">Upload Document</p>
                      <Badge variant="secondary" className="mt-2 text-xs">
                        Files
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card
                    className={`cursor-pointer transition-all border-2 ${
                      ragConfigType === "mongo"
                        ? "border-primary bg-primary/10"
                        : "border-muted hover:border-primary/50"
                    }`}
                    onClick={() => setRagConfigType("mongo")}
                  >
                    <CardContent className="p-4 text-center">
                      <Database className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-sm font-medium">MongoDB</p>
                      <Badge variant="secondary" className="mt-2 text-xs">
                        Database
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card
                    className={`cursor-pointer transition-all border-2 ${
                      ragConfigType === "endpoint"
                        ? "border-primary bg-primary/10"
                        : "border-muted hover:border-primary/50"
                    }`}
                    onClick={() => setRagConfigType("endpoint")}
                  >
                    <CardContent className="p-4 text-center">
                      <Globe className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-sm font-medium">API Endpoint</p>
                      <Badge variant="secondary" className="mt-2 text-xs">
                        REST API
                      </Badge>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {renderRagConfig()}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-primary/20">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-primary hover:shadow-glow transition-smooth"
              disabled={
                isLoading ||
                !formData.name ||
                !formData.model ||
                (formData.type === "RAG" && !ragConfigType)
              }
            >
              {isLoading ? "Uploading..." : "Create Workflow"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddWorkflowModal;
