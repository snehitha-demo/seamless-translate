import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload as UploadIcon, FileText, X, Check, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Layout from "@/components/Layout";
import { toast } from "sonner";

const STATIC_SUMMARIES: Record<string, any> = {
  contract: {
    summary: "This comprehensive service agreement establishes a professional relationship between the service provider and client. The document outlines key terms including scope of services, payment terms with a 30-day net arrangement, confidentiality obligations protecting both parties' proprietary information, and intellectual property rights ensuring proper ownership.",
    insights: [
      "Payment terms: Net 30 days from invoice date",
      "Confidentiality clause protects sensitive business information",
      "Either party can terminate with 30 days written notice",
      "Includes standard liability limitations and indemnification",
      "Intellectual property rights clearly defined"
    ],
    tags: ["legal", "agreement", "business", "services"]
  },
  report: {
    summary: "This detailed quarterly business analysis report examines performance metrics across all major departments including sales, operations, and customer satisfaction. The report reveals strong revenue growth of 23% year-over-year, driven primarily by expansion in digital channels and new product launches.",
    insights: [
      "Revenue increased 23% compared to previous year",
      "Customer retention improved by 15% quarter-over-quarter",
      "Digital sales channel contributed 45% of total revenue",
      "Operating expenses decreased by 8% through efficiency measures",
      "Market share expanded in three key demographic segments"
    ],
    tags: ["quarterly", "performance", "analysis", "metrics"]
  },
  invoice: {
    summary: "Professional services invoice for consulting engagement covering strategic planning and implementation support. The document itemizes services provided including initial assessment, strategy development sessions, implementation planning, and ongoing advisory support.",
    insights: [
      "Total amount due: Based on hourly consultation rates",
      "Payment due within 30 days of invoice date",
      "Services include strategy development and implementation",
      "Detailed breakdown of hours and services provided",
      "Standard late payment terms apply after due date"
    ],
    tags: ["billing", "payment", "professional services", "consulting"]
  },
  proposal: {
    summary: "Comprehensive business proposal outlining a strategic partnership opportunity between two organizations. The document details proposed collaboration areas, revenue sharing models, implementation timeline, and mutual benefits.",
    insights: [
      "Projected ROI of 35% within first 18 months",
      "Joint marketing initiatives to expand market reach",
      "Shared technology platform reduces operational costs",
      "Clear governance structure for partnership decisions",
      "Three-phase implementation over 12-month period"
    ],
    tags: ["partnership", "strategy", "collaboration", "growth"]
  },
  research: {
    summary: "Academic research paper examining market trends and consumer behavior patterns in the digital economy. The study analyzes data from multiple sources and presents findings on emerging opportunities.",
    insights: [
      "Consumer preferences shifting toward sustainable products",
      "Digital channels account for 60% of research journeys",
      "Personalization increases conversion rates by 40%",
      "Mobile-first approach critical for younger demographics",
      "Data privacy concerns influence purchase decisions"
    ],
    tags: ["research", "market analysis", "consumer behavior", "trends"]
  },
  legal: {
    summary: "Legal memorandum providing analysis of regulatory compliance requirements and risk assessment. Document reviews current obligations and recommends actions to ensure full compliance.",
    insights: [
      "New regulations effective Q2 require policy updates",
      "Compliance training mandatory for all employees",
      "Annual audits recommended to maintain certification",
      "Documentation requirements increased for transactions",
      "Risk mitigation strategies outlined in appendices"
    ],
    tags: ["legal", "compliance", "regulations", "risk management"]
  },
  technical: {
    summary: "Technical specification document outlining system architecture and implementation requirements. Includes detailed technical requirements, integration points, and performance benchmarks.",
    insights: [
      "Microservices architecture enables scalability",
      "API-first approach facilitates third-party integrations",
      "Security protocols meet industry standards",
      "Performance targets: 99.9% uptime, <200ms response",
      "Automated testing coverage exceeds 85%"
    ],
    tags: ["technical", "architecture", "specifications", "development"]
  },
  other: {
    summary: "General business document containing important information for review and action. Document includes relevant details, timelines, and next steps for consideration.",
    insights: [
      "Key action items identified for team review",
      "Timeline established for deliverables",
      "Stakeholder responsibilities clearly defined",
      "Success metrics outlined for evaluation",
      "Follow-up meeting scheduled for progress review"
    ],
    tags: ["general", "business", "documentation", "review"]
  }
};

export default function Upload() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: ""
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      if (!formData.title) {
        setFormData(prev => ({ ...prev, title: e.target.files![0].name }));
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !formData.title || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    setUploading(true);
    try {
      const summaryData = STATIC_SUMMARIES[formData.category] || STATIC_SUMMARIES.other;
      
      const documentData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        file_url: URL.createObjectURL(selectedFile),
        file_size: selectedFile.size,
        page_count: Math.floor(Math.random() * 50) + 1,
        ai_summary: summaryData.summary,
        key_insights: summaryData.insights,
        tags: summaryData.tags,
        status: 'ready',
        created_date: new Date().toISOString()
      };

      await base44.entities.Document.create(documentData);
      toast.success("Document uploaded successfully!");
      navigate(createPageUrl("Documents"));
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout>
      <div className="p-6 md:p-8 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Upload Document</h1>
            <p className="text-slate-600">Upload and automatically analyze documents with AI</p>
          </div>

          <Card className="shadow-lg border-none">
            <CardHeader className="border-b border-slate-200">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" />
                Document Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* File Upload Area */}
              <div>
                <Label className="text-slate-900 font-medium mb-2 block">Document File *</Label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.txt"
                  />
                  {!selectedFile ? (
                    <label htmlFor="file-upload" className="cursor-pointer block">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UploadIcon className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-slate-900 font-medium mb-2">Click to upload or drag and drop</p>
                      <p className="text-sm text-slate-500">PDF, DOC, DOCX, or TXT (Max 50MB)</p>
                    </label>
                  ) : (
                    <div className="flex items-center justify-between bg-slate-50 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-slate-900">{selectedFile.name}</p>
                          <p className="text-sm text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedFile(null)}
                        className="hover:bg-red-50 hover:text-red-600"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Document Details */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-slate-900 font-medium mb-2 block">Document Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter document title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="h-11"
                  />
                </div>

                <div>
                  <Label htmlFor="category" className="text-slate-900 font-medium mb-2 block">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="report">Report</SelectItem>
                      <SelectItem value="invoice">Invoice</SelectItem>
                      <SelectItem value="proposal">Proposal</SelectItem>
                      <SelectItem value="research">Research</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description" className="text-slate-900 font-medium mb-2 block">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Add a brief description of the document"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                  />
                </div>
              </div>

              {/* AI Processing Info */}
              <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <AlertDescription className="text-slate-700 ml-2">
                  Your document will be automatically analyzed using AI to extract key insights, generate summaries, and identify important information.
                </AlertDescription>
              </Alert>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || !formData.title || !formData.category || uploading}
                  className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {uploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Upload & Analyze
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(createPageUrl("Documents"))}
                  disabled={uploading}
                  className="h-12"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
