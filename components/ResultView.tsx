import React, { useState } from 'react';
import { ScannedItem, LANGUAGES } from '../types';
import { translateText } from '../services/geminiService';
import { generatePDF, generateWordDoc, generateTXT, generateMarkdown } from '../utils/pdfUtils';
import { Globe, Copy, RefreshCw, ChevronLeft, FileText, FileType, File, FileCode } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Props {
  item: ScannedItem;
  onUpdateItem: (item: ScannedItem) => void;
  onBack: () => void;
}

const ResultView: React.FC<Props> = ({ item, onUpdateItem, onBack }) => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [selectedLang, setSelectedLang] = useState('es');
  const [activeTab, setActiveTab] = useState<'original' | 'translated'>('original');

  const handleTranslate = async () => {
    setIsTranslating(true);
    try {
      const translated = await translateText(item.extractedText, LANGUAGES.find(l => l.code === selectedLang)?.name || 'English');
      onUpdateItem({
        ...item,
        translatedText: translated,
        targetLanguage: LANGUAGES.find(l => l.code === selectedLang)?.name
      });
      setActiveTab('translated');
    } catch (error) {
      console.error("Translation failed", error);
      alert("Translation failed. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const currentText = activeTab === 'original' ? item.extractedText : (item.translatedText || '');
  const baseFilename = activeTab === 'translated' ? 'translated-export' : 'handwritten-export';

  return (
    <div className="max-w-4xl mx-auto pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-slate-50/80 backdrop-blur-md border-b border-slate-200 p-4 flex justify-between items-center mb-6">
        <button onClick={onBack} className="flex items-center text-slate-600 hover:text-slate-900 font-medium transition-colors">
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back
        </button>
        <h2 className="text-lg font-bold text-slate-800">Results</h2>
        <div className="w-16"></div> {/* Spacer for balance */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
        {/* Source Image */}
        <div className="space-y-4">
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-500 mb-2 px-2">Original Scan</h3>
            <img 
              src={item.originalImage} 
              alt="Scanned handwriting" 
              className="w-full rounded-xl object-contain max-h-[400px] bg-slate-100"
            />
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-xl border border-indigo-50 overflow-hidden flex flex-col h-full min-h-[400px]">
            {/* Tabs */}
            <div className="flex border-b border-slate-100">
              <button 
                onClick={() => setActiveTab('original')}
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'original' ? 'text-indigo-600 bg-indigo-50/50 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Original Text
              </button>
              <button 
                onClick={() => setActiveTab('translated')}
                disabled={!item.translatedText}
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'translated' ? 'text-indigo-600 bg-indigo-50/50 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700 disabled:opacity-50'}`}
              >
                {item.translatedText ? (item.targetLanguage || 'Translated') : 'Translation'}
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 flex-grow overflow-y-auto max-h-[500px] bg-slate-50/30">
               {activeTab === 'translated' && !item.translatedText ? (
                 <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                   <Globe className="w-12 h-12 opacity-20" />
                   <p>No translation yet.</p>
                 </div>
               ) : (
                 <article className="prose prose-slate prose-sm w-full max-w-none">
                    <ReactMarkdown>{currentText}</ReactMarkdown>
                 </article>
               )}
            </div>

            {/* Actions Bar */}
            <div className="p-4 bg-white border-t border-slate-100 space-y-4">
              {/* Utility Row */}
              <div className="flex justify-between items-center">
                 <button onClick={() => handleCopy(currentText)} className="text-xs flex items-center gap-1 text-slate-500 hover:text-indigo-600 transition-colors">
                   <Copy className="w-3 h-3" /> Copy Text
                 </button>
                 <span className="text-xs text-slate-400 font-mono">
                   {currentText.length} chars
                 </span>
              </div>

              {/* Translation Controls */}
              {activeTab === 'original' && (
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <select 
                      value={selectedLang} 
                      onChange={(e) => setSelectedLang(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {LANGUAGES.map(l => (
                        <option key={l.code} value={l.code}>{l.name}</option>
                      ))}
                    </select>
                    <Globe className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  </div>
                  <button 
                    onClick={handleTranslate}
                    disabled={isTranslating}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center gap-2 min-w-[100px] justify-center"
                  >
                    {isTranslating ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Translate'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons for Export */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30 w-full max-w-md px-4">
        <div className="flex justify-center gap-2 bg-white/10 backdrop-blur-sm p-1.5 rounded-full shadow-2xl border border-white/20">
           <button 
             onClick={() => generatePDF(currentText, `${baseFilename}.pdf`)}
             className="flex-1 bg-slate-900 text-white py-3 rounded-full shadow-lg hover:bg-slate-800 transition-all hover:scale-105 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 font-medium text-xs md:text-sm"
             title="Save PDF"
           >
             <FileText className="w-4 h-4 md:w-5 md:h-5" />
             <span className="hidden md:inline">PDF</span>
           </button>
           <button 
             onClick={() => generateWordDoc(currentText, `${baseFilename}.doc`)}
             className="flex-1 bg-blue-600 text-white py-3 rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-105 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 font-medium text-xs md:text-sm"
             title="Save Word"
           >
             <FileType className="w-4 h-4 md:w-5 md:h-5" />
             <span className="hidden md:inline">Word</span>
           </button>
           <button 
             onClick={() => generateTXT(currentText, `${baseFilename}.txt`)}
             className="flex-1 bg-slate-600 text-white py-3 rounded-full shadow-lg hover:bg-slate-700 transition-all hover:scale-105 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 font-medium text-xs md:text-sm"
             title="Save Text"
           >
             <File className="w-4 h-4 md:w-5 md:h-5" />
             <span className="hidden md:inline">TXT</span>
           </button>
           <button 
             onClick={() => generateMarkdown(currentText, `${baseFilename}.md`)}
             className="flex-1 bg-indigo-600 text-white py-3 rounded-full shadow-lg hover:bg-indigo-700 transition-all hover:scale-105 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 font-medium text-xs md:text-sm"
             title="Save Markdown"
           >
             <FileCode className="w-4 h-4 md:w-5 md:h-5" />
             <span className="hidden md:inline">MD</span>
           </button>
        </div>
      </div>
    </div>
  );
};

export default ResultView;