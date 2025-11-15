import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, FileText, Calendar, Sparkles, Tag, Download, Eye, Languages } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface DocumentViewerProps {
  document: any;
  onClose: () => void;
}

export default function DocumentViewer({ document, onClose }: DocumentViewerProps) {
  const [targetLanguage, setTargetLanguage] = useState<string>("original");
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedSummary, setTranslatedSummary] = useState<string>("");
  const [translatedInsights, setTranslatedInsights] = useState<string[]>([]);

  const categoryColors: Record<string, string> = {
    contract: "bg-purple-100 text-purple-800 border-purple-200",
    report: "bg-blue-100 text-blue-800 border-blue-200",
    invoice: "bg-green-100 text-green-800 border-green-200",
    proposal: "bg-orange-100 text-orange-800 border-orange-200",
    research: "bg-pink-100 text-pink-800 border-pink-200",
    legal: "bg-red-100 text-red-800 border-red-200",
    technical: "bg-indigo-100 text-indigo-800 border-indigo-200",
    other: "bg-gray-100 text-gray-800 border-gray-200"
  };

  const languages = [
    { value: "original", label: "Original" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
    { value: "de", label: "German" },
    { value: "it", label: "Italian" },
    { value: "pt", label: "Portuguese" },
    { value: "zh", label: "Chinese" },
    { value: "ja", label: "Japanese" },
    { value: "ko", label: "Korean" },
    { value: "ar", label: "Arabic" },
    { value: "hi", label: "Hindi" },
    { value: "ru", label: "Russian" },
  ];

  const handleTranslate = async (language: string) => {
    if (language === "original") {
      setTargetLanguage("original");
      setTranslatedSummary("");
      setTranslatedInsights([]);
      return;
    }

    setIsTranslating(true);
    setTargetLanguage(language);

    try {
      // Call translation API
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          text: document.ai_summary,
          insights: document.key_insights || [],
          targetLanguage: language,
        }),
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const data = await response.json();
      setTranslatedSummary(data.translatedSummary);
      setTranslatedInsights(data.translatedInsights || []);
      toast.success("Translation completed");
    } catch (error) {
      console.error('Translation error:', error);
      toast.error("Translation failed. Please try again.");
      setTargetLanguage("original");
    } finally {
      setIsTranslating(false);
    }
  };

  const displaySummary = targetLanguage === "original" ? document.ai_summary : translatedSummary;
  const displayInsights = targetLanguage === "original" ? document.key_insights : translatedInsights;

  return (
    <div className="p-6 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="ghost"
          onClick={onClose}
          className="mb-6 hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Documents
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Document Viewer */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-none">
              <CardHeader className="border-b border-slate-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl mb-2">{document.title}</CardTitle>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className={`${categoryColors[document.category]} border`}>
                          {document.category}
                        </Badge>
                        {document.page_count && (
                          <Badge variant="outline">
                            {document.page_count} pages
                          </Badge>
                        )}
                        {document.file_size && (
                          <Badge variant="outline">
                            {(document.file_size / 1024 / 1024).toFixed(2)} MB
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* PDF Preview Placeholder */}
                <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl p-12 mb-6">
                  <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl mx-auto">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-6">
                        <FileText className="w-6 h-6 text-blue-600" />
                        <h3 className="text-xl font-bold text-slate-900">{document.title}</h3>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="h-3 bg-slate-200 rounded w-full"></div>
                        <div className="h-3 bg-slate-200 rounded w-11/12"></div>
                        <div className="h-3 bg-slate-200 rounded w-10/12"></div>
                        <div className="h-3 bg-slate-200 rounded w-full"></div>
                        <div className="h-3 bg-slate-200 rounded w-9/12"></div>
                        
                        <div className="py-4">
                          <div className="h-4 bg-slate-300 rounded w-8/12 mb-3"></div>
                          <div className="h-3 bg-slate-200 rounded w-full mb-2"></div>
                          <div className="h-3 bg-slate-200 rounded w-full mb-2"></div>
                          <div className="h-3 bg-slate-200 rounded w-11/12"></div>
                        </div>

                        <div className="space-y-3 pt-4">
                          <div className="h-3 bg-slate-200 rounded w-full"></div>
                          <div className="h-3 bg-slate-200 rounded w-10/12"></div>
                          <div className="h-3 bg-slate-200 rounded w-11/12"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="insights" className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      AI Insights
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">Description</h4>
                      <p className="text-slate-600">{document.description || "No description available"}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">Document Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between py-2 border-b border-slate-100">
                          <span className="text-slate-600">Category</span>
                          <span className="font-medium text-slate-900">{document.category}</span>
                        </div>
                        {document.page_count && (
                          <div className="flex justify-between py-2 border-b border-slate-100">
                            <span className="text-slate-600">Pages</span>
                            <span className="font-medium text-slate-900">{document.page_count}</span>
                          </div>
                        )}
                        {document.file_size && (
                          <div className="flex justify-between py-2 border-b border-slate-100">
                            <span className="text-slate-600">File Size</span>
                            <span className="font-medium text-slate-900">
                              {(document.file_size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between py-2 border-b border-slate-100">
                          <span className="text-slate-600">Status</span>
                          <span className="font-medium text-slate-900 capitalize">{document.status}</span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="insights" className="space-y-6">
                    {/* Translation Controls */}
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                      <Languages className="w-5 h-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900 mb-1">Translate Content</p>
                        <p className="text-xs text-slate-600">Select a language to translate the AI summary and insights</p>
                      </div>
                      <Select value={targetLanguage} onValueChange={handleTranslate} disabled={isTranslating}>
                        <SelectTrigger className="w-48 bg-white">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map((lang) => (
                            <SelectItem key={lang.value} value={lang.value}>
                              {lang.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {isTranslating && (
                      <div className="flex items-center justify-center py-8">
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-slate-600">Translating content...</span>
                        </div>
                      </div>
                    )}

                    {!isTranslating && (
                      <>
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                          <div className="flex items-center gap-3 mb-4">
                            <Sparkles className="w-5 h-5 text-blue-600" />
                            <h4 className="font-semibold text-slate-900">AI Summary</h4>
                          </div>
                          <p className="text-slate-700 leading-relaxed">
                            {displaySummary || "No summary available"}
                          </p>
                        </div>

                        {displayInsights && displayInsights.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-slate-900 mb-4">Key Insights</h4>
                            <div className="space-y-3">
                              {displayInsights.map((insight: string, index: number) => (
                                <div key={index} className="flex gap-3 p-4 bg-white rounded-lg border border-slate-200 hover:border-blue-300 transition-colors">
                                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-white text-xs font-bold">{index + 1}</span>
                                  </div>
                                  <p className="text-slate-700 flex-1">{insight}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="shadow-lg border-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Document Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Created</p>
                  <p className="font-medium text-slate-900">
                    {document.created_date ? format(new Date(document.created_date), "PPP") : "N/A"}
                  </p>
                </div>
                {document.tags && document.tags.length > 0 && (
                  <div>
                    <p className="text-sm text-slate-600 mb-2 flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Tags
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {document.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary" className="bg-slate-100 text-slate-700">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-lg border-none bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Eye className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="secondary" className="w-full bg-white text-blue-600 hover:bg-blue-50">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" className="w-full border-white text-white hover:bg-white/10">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
