import React from 'react';
import { ScannedItem } from '../types';
import { Clock, FileText, ChevronRight, X } from 'lucide-react';

interface Props {
  history: ScannedItem[];
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: ScannedItem) => void;
}

const HistoryDrawer: React.FC<Props> = ({ history, isOpen, onClose, onSelect }) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div className={`
        fixed inset-y-0 right-0 w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            History
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-64px)] p-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No previous scans found.</p>
            </div>
          ) : (
            history.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSelect(item);
                  onClose();
                }}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-mono text-slate-400">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500" />
                </div>
                <p className="text-sm text-slate-700 line-clamp-2 font-medium">
                  {item.extractedText}
                </p>
                {item.translatedText && (
                  <div className="mt-2 text-xs text-indigo-600 bg-indigo-100 px-2 py-1 rounded-md inline-block">
                    {item.targetLanguage ? `Translated to ${item.targetLanguage}` : 'Translated'}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default HistoryDrawer;