import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Search, Grid3x3, List, Eye, Sparkles, FileCheck, Clock } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DocumentViewer from "../components/documents/DocumentViewer";
import Layout from "@/components/Layout";

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedDoc, setSelectedDoc] = useState<any>(null);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => base44.entities.Document.list('-created_date'),
    initialData: [],
  });

  // Check URL for document ID
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const docId = urlParams.get('doc');
    if (docId && documents.length > 0) {
      const doc = documents.find((d: any) => d.id === docId);
      if (doc) setSelectedDoc(doc);
    }
  }, [documents]);

  const filteredDocuments = documents.filter((doc: any) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

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

  const statusIcons: Record<string, JSX.Element> = {
    ready: <FileCheck className="w-4 h-4 text-green-600" />,
    processing: <Clock className="w-4 h-4 text-orange-600 animate-pulse" />,
    archived: <FileText className="w-4 h-4 text-gray-400" />
  };

  if (selectedDoc) {
    return <DocumentViewer document={selectedDoc} onClose={() => setSelectedDoc(null)} />;
  }

  return (
    <Layout>
      <div className="p-6 md:p-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Document Library</h1>
            <p className="text-slate-600">Browse and manage your AI-analyzed documents</p>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6 shadow-lg border-none">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-48 h-11">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
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
                <Tabs value={viewMode} onValueChange={setViewMode} className="w-full md:w-auto">
                  <TabsList className="grid grid-cols-2 h-11">
                    <TabsTrigger value="grid" className="flex items-center gap-2">
                      <Grid3x3 className="w-4 h-4" />
                      Grid
                    </TabsTrigger>
                    <TabsTrigger value="list" className="flex items-center gap-2">
                      <List className="w-4 h-4" />
                      List
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardContent>
          </Card>

          {/* Documents Display */}
          {isLoading ? (
            <div className="text-center py-12 text-slate-500">Loading documents...</div>
          ) : filteredDocuments.length === 0 ? (
            <Card className="shadow-lg border-none">
              <CardContent className="py-16">
                <div className="text-center">
                  <FileText className="w-20 h-20 mx-auto text-slate-300 mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">No documents found</h3>
                  <p className="text-slate-600 mb-6">
                    {searchQuery || categoryFilter !== "all"
                      ? "Try adjusting your filters"
                      : "Upload your first document to get started"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocuments.map((doc: any) => (
                <Card
                  key={doc.id}
                  className="shadow-lg border-none hover:shadow-xl transition-all duration-300 cursor-pointer group"
                  onClick={() => setSelectedDoc(doc)}
                >
                  <CardHeader className="border-b border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50 group-hover:from-blue-50 group-hover:to-indigo-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex items-center gap-2">
                        {statusIcons[doc.status]}
                        <Badge variant="secondary" className={`${categoryColors[doc.category]} border`}>
                          {doc.category}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-lg mt-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {doc.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                      {doc.description || "No description available"}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{doc.created_date ? format(new Date(doc.created_date), "MMM d, yyyy") : "N/A"}</span>
                      {doc.page_count && <span>{doc.page_count} pages</span>}
                    </div>
                    {doc.ai_summary && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-blue-600">
                        <Sparkles className="w-3 h-3" />
                        <span>AI insights available</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="shadow-lg border-none">
              <CardContent className="p-6">
                <div className="space-y-3">
                  {filteredDocuments.map((doc: any) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                      onClick={() => setSelectedDoc(doc)}
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-slate-900 truncate">{doc.title}</h3>
                          {statusIcons[doc.status]}
                        </div>
                        <p className="text-sm text-slate-600 truncate">{doc.description || "No description"}</p>
                      </div>
                      <Badge variant="secondary" className={`${categoryColors[doc.category]} border`}>
                        {doc.category}
                      </Badge>
                      <Button variant="ghost" size="sm" className="hover:bg-blue-50 hover:text-blue-600">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
