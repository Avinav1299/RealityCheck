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
  TrendingUp
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface AnalysisResult {
  id: string;
  fileName: string;
  fileType: string;
  uploadDate: string;
  category: string;
  insights: {
    summary: string;
    keyPoints: string[];
    confidence: number;
    recommendations: string[];
  };
  status: 'processing' | 'completed' | 'error';
}

const InsightEnginePage: React.FC = () => {
  const { isDark } = useTheme();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [researchContext, setResearchContext] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const categories = ['all', 'health', 'policy', 'technology', 'research', 'business'];

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
    
    // Simulate analysis process
    for (const file of uploadedFiles) {
      const mockResult: AnalysisResult = {
        id: Math.random().toString(36).substr(2, 9),
        fileName: file.name,
        fileType: file.type,
        uploadDate: new Date().toISOString(),
        category: categories[Math.floor(Math.random() * (categories.length - 1)) + 1],
        insights: {
          summary: `Comprehensive analysis of ${file.name} reveals significant insights related to ${researchContext || 'the specified domain'}. The document contains valuable information that can inform strategic decision-making.`,
          keyPoints: [
            'Primary thesis aligns with current research trends',
            'Methodology demonstrates robust analytical framework',
            'Conclusions supported by substantial evidence base',
            'Recommendations provide actionable strategic guidance'
          ],
          confidence: Math.floor(Math.random() * 20) + 80,
          recommendations: [
            'Cross-reference findings with recent peer-reviewed studies',
            'Consider implementing proposed methodological improvements',
            'Validate conclusions through additional data sources',
            'Develop action plan based on strategic recommendations'
          ]
        },
        status: 'completed'
      };

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setAnalysisResults(prev => [...prev, mockResult]);
    }

    setIsAnalyzing(false);
    setUploadedFiles([]);
  };

  const filteredResults = analysisResults.filter(result => 
    selectedCategory === 'all' || result.category === selectedCategory
  );

  const sortedResults = [...filteredResults].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      case 'confidence':
        return b.insights.confidence - a.insights.confidence;
      case 'name':
        return a.fileName.localeCompare(b.fileName);
      default:
        return 0;
    }
  });

  return (
    <div className={`min-h-screen pt-20 transition-colors duration-300 ${
      isDark 
        ? 'bg-black' 
        : 'bg-white'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-8 pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className={`inline-flex items-center space-x-2 px-6 py-3 rounded-full backdrop-blur-sm border mb-6 ${
            isDark 
              ? 'bg-white/5 border-white/10 text-purple-300' 
              : 'bg-white/50 border-purple-200 text-purple-700'
          }`}>
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">Advanced Document Intelligence</span>
          </div>
          
          <h1 className={`text-5xl font-bold mb-4 transition-colors ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Insight Engine
          </h1>
          <p className={`text-xl max-w-3xl mx-auto transition-colors ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Upload documents and unlock AI-powered research insights, analysis, and strategic recommendations
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
                : 'bg-white/50 border-slate-200'
            }`}>
              <h2 className={`text-2xl font-bold mb-6 transition-colors ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                Document Upload
              </h2>

              {/* Research Context */}
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 transition-colors ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Research Context (Optional)
                </label>
                <textarea
                  value={researchContext}
                  onChange={(e) => setResearchContext(e.target.value)}
                  placeholder="Describe your research focus or specific questions..."
                  className={`w-full p-4 rounded-2xl backdrop-blur-sm border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder-slate-400'
                      : 'bg-white/50 border-slate-200 text-slate-900 placeholder-slate-500'
                  }`}
                  rows={3}
                />
              </div>

              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
                  isDragActive
                    ? isDark
                      ? 'border-purple-400 bg-purple-500/10'
                      : 'border-purple-500 bg-purple-100'
                    : isDark
                      ? 'border-slate-600 hover:border-purple-400 hover:bg-white/5'
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
                            : 'bg-white/50 border-slate-200'
                        }`}
                      >
                        <FileText className="w-5 h-5 text-purple-400" />
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
                className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center space-x-3 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Brain className="w-5 h-5 animate-pulse" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    <span>Generate Insights</span>
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
                : 'bg-white/50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold transition-colors ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  Analysis Results
                </h2>
                
                {analysisResults.length > 0 && (
                  <div className="flex items-center space-x-4">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className={`px-4 py-2 rounded-xl backdrop-blur-sm border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white'
                          : 'bg-white/50 border-slate-200 text-slate-900'
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
                      className={`px-4 py-2 rounded-xl backdrop-blur-sm border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white'
                          : 'bg-white/50 border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="date" className={isDark ? 'bg-slate-800' : 'bg-white'}>Date</option>
                      <option value="confidence" className={isDark ? 'bg-slate-800' : 'bg-white'}>Confidence</option>
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
                    No Analysis Yet
                  </p>
                  <p className={`transition-colors ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    Upload documents to generate AI-powered insights
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
                          : 'bg-white/50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-6 h-6 text-purple-400" />
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
                              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400">
                                {result.category.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            result.insights.confidence >= 90
                              ? 'bg-green-500/20 text-green-400'
                              : result.insights.confidence >= 70
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-red-500/20 text-red-400'
                          }`}>
                            {result.insights.confidence}% Confidence
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className={`font-semibold mb-2 transition-colors ${
                            isDark ? 'text-white' : 'text-slate-900'
                          }`}>
                            Summary
                          </h4>
                          <p className={`text-sm leading-relaxed transition-colors ${
                            isDark ? 'text-slate-300' : 'text-slate-700'
                          }`}>
                            {result.insights.summary}
                          </p>
                        </div>

                        <div>
                          <h4 className={`font-semibold mb-2 transition-colors ${
                            isDark ? 'text-white' : 'text-slate-900'
                          }`}>
                            Key Insights
                          </h4>
                          <ul className="space-y-1">
                            {result.insights.keyPoints.map((point, idx) => (
                              <li
                                key={idx}
                                className={`text-sm flex items-start space-x-2 transition-colors ${
                                  isDark ? 'text-slate-300' : 'text-slate-700'
                                }`}
                              >
                                <span className="text-purple-400 mt-1">•</span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className={`font-semibold mb-2 transition-colors ${
                            isDark ? 'text-white' : 'text-slate-900'
                          }`}>
                            Recommendations
                          </h4>
                          <ul className="space-y-1">
                            {result.insights.recommendations.map((rec, idx) => (
                              <li
                                key={idx}
                                className={`text-sm flex items-start space-x-2 transition-colors ${
                                  isDark ? 'text-slate-300' : 'text-slate-700'
                                }`}
                              >
                                <span className="text-green-400 mt-1">→</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default InsightEnginePage;