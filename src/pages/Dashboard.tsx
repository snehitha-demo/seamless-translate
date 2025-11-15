import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, TrendingUp, Clock, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Layout from "@/components/Layout";

export default function Dashboard() {
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => base44.entities.Document.list('-created_date'),
    initialData: [],
  });

  const recentDocuments = documents.slice(0, 5);
  const totalDocuments = documents.length;
  const processingDocs = documents.filter((d: any) => d.status === 'processing').length;
  const readyDocs = documents.filter((d: any) => d.status === 'ready').length;

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

  return (
    <Layout>
      <div className="p-6 md:p-8 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                Welcome to DocSage
              </h1>
              <p className="text-slate-600">AI-powered document management and insights</p>
            </div>
            <Link to={createPageUrl("Upload")}>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg">
                <FileText className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="relative overflow-hidden border-none shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg">Total Documents</CardTitle>
                  <FileText className="w-8 h-8 text-white/80" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-white">{totalDocuments}</p>
                <p className="text-blue-100 text-sm mt-2">All documents in system</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-none shadow-lg bg-gradient-to-br from-green-500 to-emerald-600">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg">Ready</CardTitle>
                  <Sparkles className="w-8 h-8 text-white/80" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-white">{readyDocs}</p>
                <p className="text-green-100 text-sm mt-2">AI analysis complete</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-none shadow-lg bg-gradient-to-br from-orange-500 to-red-600">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg">Processing</CardTitle>
                  <Clock className="w-8 h-8 text-white/80" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-white">{processingDocs}</p>
                <p className="text-orange-100 text-sm mt-2">Currently analyzing</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Documents */}
          <Card className="shadow-lg border-none">
            <CardHeader className="border-b border-slate-200">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Recent Documents</CardTitle>
                <Link to={createPageUrl("Documents")}>
                  <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                    View All
                    <TrendingUp className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="text-center py-8 text-slate-500">Loading documents...</div>
              ) : recentDocuments.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-600 mb-4">No documents yet</p>
                  <Link to={createPageUrl("Upload")}>
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                      Upload Your First Document
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentDocuments.map((doc: any) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 mb-1 truncate">{doc.title}</h3>
                        <p className="text-sm text-slate-600 truncate">{doc.description || "No description"}</p>
                      </div>
                      <Badge variant="secondary" className={`${categoryColors[doc.category]} border`}>
                        {doc.category}
                      </Badge>
                      <div className="text-sm text-slate-500">
                        {doc.created_date ? format(new Date(doc.created_date), "MMM d") : "N/A"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
