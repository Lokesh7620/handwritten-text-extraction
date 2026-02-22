
import React, { useState, useEffect, useRef } from 'react';
import { User, ScannedItem, ProcessingStage } from './types';
import Auth from './components/Auth';
import ProcessingPipeline from './components/ProcessingPipeline';
import ResultView from './components/ResultView';
import HistoryDrawer from './components/HistoryDrawer';
import CameraCapture from './components/CameraCapture';
import { extractHandwriting } from './services/geminiService';
import { Camera, History, LogOut, Sparkles, Image as ImageIcon } from 'lucide-react';

const generateId = () => Math.random().toString(36).substring(2, 15);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<ScannedItem[]>([]);
  const [currentItem, setCurrentItem] = useState<ScannedItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<ProcessingStage>(ProcessingStage.IDLE);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  
  const uploadInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('hte_user');
    if (storedUser) setUser(JSON.parse(storedUser));

    const storedHistory = localStorage.getItem('hte_history');
    if (storedHistory) setHistory(JSON.parse(storedHistory));
  }, []);

  useEffect(() => {
    localStorage.setItem('hte_history', JSON.stringify(history));
  }, [history]);

  const handleLogout = () => {
    localStorage.removeItem('hte_user');
    setUser(null);
    setCurrentItem(null);
  };

  const processImage = async (base64Img: string) => {
    setIsProcessing(true);
    try {
      setProcessingStage(ProcessingStage.PREPROCESSING);
      await new Promise(r => setTimeout(r, 600));
      
      setProcessingStage(ProcessingStage.FEATURE_EXTRACTION);
      const text = await extractHandwriting(base64Img);
      
      setProcessingStage(ProcessingStage.SEQUENCE_PROCESSING);
      await new Promise(r => setTimeout(r, 400));
      setProcessingStage(ProcessingStage.CONTEXT_UNDERSTANDING);
      await new Promise(r => setTimeout(r, 400));
      setProcessingStage(ProcessingStage.FINALIZING);

      const newItem: ScannedItem = {
        id: generateId(),
        timestamp: Date.now(),
        originalImage: base64Img,
        extractedText: text
      };

      setHistory(prev => [newItem, ...prev]);
      setCurrentItem(newItem);
    } catch (error: any) {
      console.error("Processing Error:", error);
      alert(`Failed: ${error.message || "Unknown error"}`);
    } finally {
      setIsProcessing(false);
      setProcessingStage(ProcessingStage.IDLE);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => processImage(reader.result as string);
      reader.readAsDataURL(file);
    }
    event.target.value = '';
  };

  const updateCurrentItem = (updated: ScannedItem) => {
    setCurrentItem(updated);
    setHistory(prev => prev.map(item => item.id === updated.id ? updated : item));
  };

  if (!user) return <Auth onLogin={setUser} />;

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100">
      {showCamera && (
        <CameraCapture 
          onClose={() => setShowCamera(false)}
          onCapture={processImage}
        />
      )}

      <nav className="bg-white shadow-sm border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="bg-indigo-600 text-white p-1.5 rounded-lg mr-2">
                <Sparkles className="w-5 h-5" />
              </span>
              <span className="font-bold text-xl tracking-tight text-slate-800">Handwrite Pro</span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsHistoryOpen(true)}
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative"
              >
                <History className="w-6 h-6" />
                {history.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white"></span>}
              </button>
              <button onClick={handleLogout} className="p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors">
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <HistoryDrawer 
          history={history} 
          isOpen={isHistoryOpen} 
          onClose={() => setIsHistoryOpen(false)}
          onSelect={setCurrentItem}
        />

        {isProcessing ? (
          <div className="min-h-[70vh] flex flex-col items-center justify-center">
            <ProcessingPipeline stage={processingStage} />
          </div>
        ) : currentItem ? (
          <ResultView 
            item={currentItem} 
            onUpdateItem={updateCurrentItem}
            onBack={() => setCurrentItem(null)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 max-w-2xl mx-auto">
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight">
                Scan, Extract, <span className="text-indigo-600">Transform.</span>
              </h1>
              <p className="text-slate-500 text-lg">
                Convert your handwritten notes into high-quality digital documents instantly.
              </p>
            </div>

            <div className="w-full max-w-sm space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={() => setShowCamera(true)}
                  className="flex items-center justify-center gap-3 bg-indigo-600 text-white p-5 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all"
                >
                  <Camera className="w-6 h-6" />
                  Capture Photo
                </button>
                <button 
                  onClick={() => uploadInputRef.current?.click()}
                  className="flex items-center justify-center gap-3 bg-white text-slate-700 border border-slate-200 p-5 rounded-2xl font-bold shadow-sm hover:border-indigo-200 hover:bg-slate-50 hover:-translate-y-1 transition-all"
                >
                  <ImageIcon className="w-6 h-6 text-indigo-500" />
                  Upload Image
                </button>
              </div>
            </div>
          </div>
        )}

        <input type="file" ref={uploadInputRef} accept="image/*" className="hidden" onChange={handleFileSelect} />
      </main>
    </div>
  );
};

export default App;
