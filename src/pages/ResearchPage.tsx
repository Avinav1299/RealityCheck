import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  FileText, 
  Brain, 
  Zap, 
  Download,
  Search,
  Filter,
  Calendar,
  Tag,
  Sparkles,
  Eye,
  TrendingUp,
  Target,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  Copy,
  Share
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import jsPDF from 'jspdf';

interface ResearchResult {
  id: string;
  fileName: string;
  fileType: string;
  uploadDate: string;
  category: string;
  userContext: string;
  realityDigest: {
    summary: string;
    keyFacts: string[];
    causalLinks: Array<{ cause: string; effect: string; confidence: number }>;
    fiveWConnections: {
      who: string[];
      what: string[];
      when: string[];
      where: string[];
      why: string[];
    };
    confidence: number;
    trustScore: number;
    nextActions: string[];
  };
  metadata: {
    wordCount: number;
    readingTime: number;
    complexity: 'low' | 'medium' | 'high';
    sources: string[];
  };
  status: 'processing' | 'completed' | 'error';
}

const ResearchPage: React.FC = () => {
  const { isDark } = useTheme();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [researchResults, setResearchResults] = useState<ResearchResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [userContext, setUserContext] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [expandedResult, setExpandedResult] = useState<string | null>(null);

  const categories = ['all', 'health', 'policy', 'technology', 'research', 'business', 'security'];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    multiple: true
  });

  const analyzeDocuments = async () => {
    if (uploadedFiles.length === 0) return;

    setIsAnalyzing(true);
    
    for (const file of uploadedFiles) {
      const mockResult: ResearchResult = {
        id: Math.random().toString(36).substr(2, 9),
        fileName: file.name,
        fileType: file.type,
        uploadDate: new Date().toISOString(),
        category: categories[Math.floor(Math.random() * (categories.length - 1)) + 1],
        userContext: userContext || 'General analysis',
        realityDigest: {
          summary: `Comprehensive analysis of ${file.name} reveals significant insights related to ${userContext || 'the specified domain'}. The document presents evidence-based findings with strong methodological foundations and clear implications for strategic decision-making.`,
          keyFacts: [
            'Primary research methodology demonstrates robust analytical framework',
            'Data sources include peer-reviewed publications and verified datasets',
            'Conclusions are supported by statistical significance testing',
            'Recommendations align with current best practices and expert consensus',
            'Potential limitations and biases have been identified and addressed'
          ],
          causalLinks: [
            { cause: 'Increased data availability', effect: 'Enhanced analytical precision', confidence: 92 },
            { cause: 'Methodological improvements', effect: 'Higher reliability scores', confidence: 88 },
            { cause: 'Expert validation', effect: 'Increased credibility', confidence: 95 }
          ],
          fiveWConnections: {
            who: ['Research team', 'Subject matter experts', 'Peer reviewers', 'Stakeholders'],
            what: ['Data analysis', 'Methodology validation', 'Results interpretation', 'Strategic recommendations'],
            when: ['Current period', 'Historical context', 'Future projections', 'Timeline considerations'],
            where: ['Primary research location', 'Data collection sites', 'Analysis environment', 'Implementation context'],
            why: ['Research objectives', 'Problem identification', 'Solution development', 'Impact assessment']
          },
          confidence: Math.floor(Math.random() * 20) + 80,
          trustScore: Math.floor(Math.random() * 15) + 85,
          nextActions: [
            'Cross-reference findings with recent peer-reviewed studies',
            'Validate conclusions through additional data sources',
            'Develop implementation roadmap based on recommendations',
            'Schedule stakeholder review and feedback sessions',
            'Prepare executive summary for decision-makers'
          ]
        },
        metadata: {
          wordCount: Math.floor(Math.random() * 5000) + 1000,
          readingTime: Math.floor(Math.random() * 20) + 5,
          complexity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
          sources: ['Academic journals', 'Government reports', 'Industry publications', 'Expert interviews']
        },
        status: 'completed'
      };

      await new Promise(resolve => setTimeout(resolve, 2000));
      setResearchResults(prev => [...prev, mockResult]);
    }

    setIsAnalyzing(false);
    setUploadedFiles([]);
  };

  const downloadReport = (result: ResearchResult, format: 'pdf' | 'markdown') => {
    if (format === 'pdf') {
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(20);
      doc.text('Reality Digest Report', 20, 30);
      
      // File info
      doc.setFontSize(12);
      doc.text(`File: ${result.fileName}`, 20, 50);
      doc.text(`Date: ${new Date(result.uploadDate).toLocaleDateString()}`, 20, 60);
      doc.text(`Category: ${result.category}`, 20, 70);
      
      // Summary
      doc.setFontSize(14);
      doc.text('Summary', 20, 90);
      doc.setFontSize(10);
      const summaryLines = doc.splitTextToSize(result.realityDigest.summary, 170);
      doc.text(summaryLines, 20, 100);
      
      // Key Facts
      let yPos = 100 + (summaryLines.length * 5) + 10;
      doc.setFontSize(14);
      doc.text('Key Facts', 20, yPos);
      doc.setFontSize(10);
      result.realityDigest.keyFacts.forEach((fact, index) => {
        yPos += 10;
        doc.text(`• ${fact}`, 25, yPos);
      });
      
      doc.save(`reality-digest-${result.fileName}.pdf`);
    } else {
      // Markdown format
      const markdown = `# Reality Digest Report

## File Information
- **File:** ${result.fileName}
- **Date:** ${new Date(result.uploadDate).toLocaleDateString()}
- **Category:** ${result.category}
- **Trust Score:** ${result.realityDigest.trustScore}%

## Summary
${result.realityDigest.summary}

## Key Facts
${result.realityDigest.keyFacts.map(fact => `- ${fact}`).join('\n')}

## Causal Links
${result.realityDigest.causalLinks.map(link => `- **${link.cause}** → **${link.effect}** (${link.confidence}% confidence)`).join('\n')}

## 5W Analysis
### Who
${result.realityDigest.fiveWConnections.who.map(who => `- ${who}`).join('\n')}

### What
${result.realityDigest.fiveWConnections.what.map(what => `- ${what}`).join('\n')}

### When
${result.realityDigest.fiveWConnections.when.map(when => `- ${when}`).join('\n')}

### Where
${result.realityDigest.fiveWConnections.where.map(where => `- ${where}`).join('\n')}

### Why
${result.realityDigest.fiveWConnections.why.map(why => `- ${why}`).join('\n')}

## Next Actions
${result.realityDigest.nextActions.map(action => `- ${action}`).join('\n')}

---
*Generated by RealityCheck AI - Advanced Intelligence Platform*
`;

      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reality-digest-${result.fileName}.md`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const filteredResults = researchResults.filter(result => 
    selectedCategory === 'all' || result.category === selectedCategory
  );

  const sortedResults = [...filteredResults].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      case 'confidence':
        return b.realityDigest.confidence - a.realityDigest.confidence;
      case 'trust':
        return b.realityDigest.trustScore - a.realityDigest.trustScore;
      case 'name':
        return a.fileName.localeCompare(b.fileName);
      default:
        return 0;
    }
  });

  return (
    <div className={`min-h-screen pt-20 transition-colors duration-300 ${
      isDark ? 'bg-black' : 'bg-white'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className={`inline-flex items-center space-x-2 px-6 py-3 rounded-full backdrop-blur-sm border mb-6 ${
            isDark 
              ? 'bg-white/5 border-white/10 text-glow-purple' 
              : 'bg-slate-100 border-slate-200 text-purple-700'
          }`}>
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">Advanced Document Intelligence</span>
          </div>
          
          <h1 className={`text-6xl font-bold font-display mb-4 transition-colors ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Research
          </h1>
          <p className={`text-xl max-w-3xl mx-auto font-body transition-colors ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Upload documents and receive comprehensive Reality Digests with AI-powered analysis, fact extraction, and strategic insights
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className={`backdrop-blur-sm border rounded-3xl p-6 shadow-xl ${
              isDark
                ? 'bg-white/5 border-white/10'
                : 'bg-white border-slate-200'
            }`}>
              <h2 className={`text-2xl font-bold font-display mb-6 transition-colors ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                Document Upload
              </h2>

              {/* User Context */}
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 transition-colors ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Research Context
                </label>
                <textarea
                  value={userContext}
                  onChange={(e) => setUserContext(e.target.value)}
                  placeholder="Describe your research focus, specific questions, or analysis objectives..."
                  className={`w-full p-4 rounded-2xl backdrop-blur-sm border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-glow-purple resize-none ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder-slate-400'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-500'
                  }`}
                  rows={4}
                />
              </div>

              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
                  isDragActive
                    ? isDark
                      ? 'border-glow-purple bg-glow-purple/10'
                      : 'border-purple-500 bg-purple-100'
                    : isDark
                      ? 'border-slate-600 hover:border-glow-purple hover:bg-white/5'
                      : 'border-slate-300 hover:border-purple-400 hover:bg-purple-50'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className={`w-12 h-12 mx-auto mb-4 transition-colors ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`} />
                <p className={`text-lg font-semibold mb-2 transition-colors ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  {isDragActive ? 'Drop files here' : 'Upload Documents'}
                </p>
                <p className={`text-sm transition-colors ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  PDF, DOCX, TXT files supported
                </p>
              </div>

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div className="mt-6">
                  <h3 className={`font-semibold mb-3 transition-colors ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    Ready for Analysis ({uploadedFiles.length})
                  </h3>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className={`flex items-center space-x-3 p-3 rounded-xl backdrop-blur-sm border ${
                          isDark
                            ? 'bg-white/5 border-white/10'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <FileText className="w-5 h-5 text-glow-purple" />
                        <span className={`text-sm font-medium truncate transition-colors ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}>
                          {file.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Analyze Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={analyzeDocuments}
                disabled={uploadedFiles.length === 0 || isAnalyzing}
                className="w-full mt-6 bg-gradient-to-r from-glow-purple to-glow-pink text-white py-4 rounded-2xl font-bold shadow-glow hover:shadow-glow-lg transition-all duration-300 flex items-center justify-center space-x-3 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Brain className="w-5 h-5 animate-pulse" />
                    <span>Generating Reality Digest...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    <span>Generate Reality Digest</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className={`backdrop-blur-sm border rounded-3xl p-6 shadow-xl ${
              isDark
                ? 'bg-white/5 border-white/10'
                : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold font-display transition-colors ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  Reality Digests
                </h2>
                
                {researchResults.length > 0 && (
                  <div className="flex items-center space-x-4">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className={`px-4 py-2 rounded-xl backdrop-blur-sm border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-glow-purple ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    >
                      {categories.map(category => (
                        <option key={category} value={category} className={isDark ? 'bg-slate-800' : 'bg-white'}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                    
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className={`px-4 py-2 rounded-xl backdrop-blur-sm border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-glow-purple ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="date" className={isDark ? 'bg-slate-800' : 'bg-white'}>Date</option>
                      <option value="confidence" className={isDark ? 'bg-slate-800' : 'bg-white'}>Confidence</option>
                      <option value="trust" className={isDark ? 'bg-slate-800' : 'bg-white'}>Trust Score</option>
                      <option value="name" className={isDark ? 'bg-slate-800' : 'bg-white'}>Name</option>
                    </select>
                  </div>
                )}
              </div>

              {sortedResults.length === 0 ? (
                <div className="text-center py-12">
                  <Brain className={`w-16 h-16 mx-auto mb-4 transition-colors ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`} />
                  <p className={`text-xl font-semibold mb-2 transition-colors ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    No Reality Digests Yet
                  </p>
                  <p className={`transition-colors ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    Upload documents to generate comprehensive AI-powered analysis
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {sortedResults.map((result, index) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`backdrop-blur-sm border rounded-2xl p-6 shadow-lg ${
                        isDark
                          ? 'bg-white/5 border-white/10'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-6 h-6 text-glow-purple" />
                          <div>
                            <h3 className={`font-bold transition-colors ${
                              isDark ? 'text-white' : 'text-slate-900'
                            }`}>
                              {result.fileName}
                            </h3>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className={`text-sm transition-colors ${
                                isDark ? 'text-slate-400' : 'text-slate-600'
                              }`}>
                                {new Date(result.uploadDate).toLocaleDateString()}
                              </span>
                              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-glow-purple/20 text-glow-purple">
                                {result.category.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            result.realityDigest.trustScore >= 90
                              ? 'bg-green-500/20 text-green-400'
                              : result.realityDigest.trustScore >= 70
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-red-500/20 text-red-400'
                          }`}>
                            {result.realityDigest.trustScore}% Trust
                          </div>
                          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            result.realityDigest.confidence >= 90
                              ? 'bg-green-500/20 text-green-400'
                              : result.realityDigest.confidence >= 70
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-red-500/20 text-red-400'
                          }`}>
                            {result.realityDigest.confidence}% Confidence
                          </div>
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="mb-4">
                        <h4 className={`font-semibold mb-2 transition-colors ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}>
                          Reality Digest Summary
                        </h4>
                        <p className={`text-sm leading-relaxed transition-colors ${
                          isDark ? 'text-slate-300' : 'text-slate-700'
                        }`}>
                          {result.realityDigest.summary}
                        </p>
                      </div>

                      {/* Expandable Content */}
                      <motion.button
                        onClick={() => setExpandedResult(expandedResult === result.id ? null : result.id)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 ${
                          isDark
                            ? 'bg-white/5 border-white/10 hover:bg-white/10'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`font-semibold transition-colors ${
                            isDark ? 'text-white' : 'text-slate-900'
                          }`}>
                            View Detailed Analysis
                          </span>
                          <ArrowRight className={`w-5 h-5 transition-transform ${
                            expandedResult === result.id ? 'rotate-90' : ''
                          } ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
                        </div>
                      </motion.button>

                      {/* Expanded Content */}
                      {expandedResult === result.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 space-y-6"
                        >
                          {/* Key Facts */}
                          <div>
                            <h4 className={`font-semibold mb-3 transition-colors ${
                              isDark ? 'text-white' : 'text-slate-900'
                            }`}>
                              Key Facts
                            </h4>
                            <ul className="space-y-2">
                              {result.realityDigest.keyFacts.map((fact, idx) => (
                                <li
                                  key={idx}
                                  className={`text-sm flex items-start space-x-2 transition-colors ${
                                    isDark ? 'text-slate-300' : 'text-slate-700'
                                  }`}
                                >
                                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                  <span>{fact}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Causal Links */}
                          <div>
                            <h4 className={`font-semibold mb-3 transition-colors ${
                              isDark ? 'text-white' : 'text-slate-900'
                            }`}>
                              Causal Links
                            </h4>
                            <div className="space-y-3">
                              {result.realityDigest.causalLinks.map((link, idx) => (
                                <div
                                  key={idx}
                                  className={`p-3 rounded-xl border ${
                                    isDark
                                      ? 'bg-white/5 border-white/10'
                                      : 'bg-white border-slate-200'
                                  }`}
                                >
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className={`font-medium transition-colors ${
                                      isDark ? 'text-white' : 'text-slate-900'
                                    }`}>
                                      {link.cause}
                                    </span>
                                    <ArrowRight className="w-4 h-4 text-glow-purple" />
                                    <span className={`font-medium transition-colors ${
                                      isDark ? 'text-white' : 'text-slate-900'
                                    }`}>
                                      {link.effect}
                                    </span>
                                  </div>
                                  <div className={`text-sm transition-colors ${
                                    isDark ? 'text-slate-400' : 'text-slate-600'
                                  }`}>
                                    {link.confidence}% confidence
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 5W Analysis */}
                          <div>
                            <h4 className={`font-semibold mb-3 transition-colors ${
                              isDark ? 'text-white' : 'text-slate-900'
                            }`}>
                              5W Analysis
                            </h4>
                            <div className="grid md:grid-cols-2 gap-4">
                              {Object.entries(result.realityDigest.fiveWConnections).map(([key, values]) => (
                                <div
                                  key={key}
                                  className={`p-4 rounded-xl border ${
                                    isDark
                                      ? 'bg-white/5 border-white/10'
                                      : 'bg-white border-slate-200'
                                  }`}
                                >
                                  <h5 className={`font-semibold mb-2 capitalize transition-colors ${
                                    isDark ? 'text-glow-purple' : 'text-purple-600'
                                  }`}>
                                    {key}
                                  </h5>
                                  <ul className="space-y-1">
                                    {values.map((value, idx) => (
                                      <li
                                        key={idx}
                                        className={`text-sm transition-colors ${
                                          isDark ? 'text-slate-300' : 'text-slate-700'
                                        }`}
                                      >
                                        • {value}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Next Actions */}
                          <div>
                            <h4 className={`font-semibold mb-3 transition-colors ${
                              isDark ? 'text-white' : 'text-slate-900'
                            }`}>
                              Recommended Next Actions
                            </h4>
                            <ul className="space-y-2">
                              {result.realityDigest.nextActions.map((action, idx) => (
                                <li
                                  key={idx}
                                  className={`text-sm flex items-start space-x-2 transition-colors ${
                                    isDark ? 'text-slate-300' : 'text-slate-700'
                                  }`}
                                >
                                  <Target className="w-4 h-4 text-glow-purple mt-0.5 flex-shrink-0" />
                                  <span>{action}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </motion.div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => downloadReport(result, 'pdf')}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center space-x-2 ${
                            isDark
                              ? 'bg-glow-purple/10 border border-glow-purple/20 text-glow-purple hover:bg-glow-purple/20'
                              : 'bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100'
                          }`}
                        >
                          <Download className="w-4 h-4" />
                          <span>PDF Report</span>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => downloadReport(result, 'markdown')}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center space-x-2 ${
                            isDark
                              ? 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                              : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          <FileText className="w-4 h-4" />
                          <span>Markdown</span>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => copyToClipboard(result.realityDigest.summary)}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center space-x-2 ${
                            isDark
                              ? 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                              : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          <Copy className="w-4 h-4" />
                          <span>Copy Summary</span>
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse ${
          isDark ? 'bg-glow-purple' : 'bg-purple-300'
        }`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse ${
          isDark ? 'bg-glow-pink' : 'bg-pink-300'
        }`}></div>
      </div>
    </div>
  );
};

export default ResearchPage;