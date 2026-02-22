import React, { useEffect, useState } from 'react';
import { ProcessingStage } from '../types';
import { Brain, Scan, Type, FileText, Sparkles, Layers } from 'lucide-react';

interface Props {
  stage: ProcessingStage;
}

const ProcessingPipeline: React.FC<Props> = ({ stage }) => {
  const steps = [
    { id: ProcessingStage.PREPROCESSING, label: 'Image Preprocessing', sub: 'Noise Reduction & Normalization', icon: Scan },
    { id: ProcessingStage.FEATURE_EXTRACTION, label: 'Feature Extraction', sub: 'Convolutional Neural Networks (CNN)', icon: Layers },
    { id: ProcessingStage.SEQUENCE_PROCESSING, label: 'Sequence Analysis', sub: 'Recurrent Neural Networks (RNN)', icon: Type },
    { id: ProcessingStage.CONTEXT_UNDERSTANDING, label: 'Context Engine', sub: 'Transformer Models', icon: Brain },
  ];

  // Calculate active index
  const activeIndex = steps.findIndex(s => s.id === stage);
  const isFinalizing = stage === ProcessingStage.FINALIZING;

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-2xl shadow-xl border border-indigo-50">
      <h3 className="text-center font-bold text-lg text-slate-800 mb-6 flex items-center justify-center gap-2">
        <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
        Processing Document
      </h3>

      <div className="space-y-6 relative">
        {/* Connection Line */}
        <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-100 -z-0"></div>

        {steps.map((step, idx) => {
          const isActive = idx === activeIndex;
          const isCompleted = idx < activeIndex || isFinalizing;
          const Icon = step.icon;

          return (
            <div key={step.id} className={`relative z-10 flex items-start gap-4 transition-all duration-500 ${isActive || isCompleted ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2
                ${isActive ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' : ''}
                ${isCompleted ? 'bg-green-500 border-green-500 text-white' : ''}
                ${!isActive && !isCompleted ? 'bg-white border-slate-200 text-slate-400' : ''}
              `}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="pt-1">
                <p className={`font-semibold ${isActive ? 'text-indigo-700' : 'text-slate-700'}`}>
                  {step.label}
                </p>
                <p className="text-xs text-slate-500">{step.sub}</p>
                {isActive && (
                  <div className="h-1 w-24 bg-indigo-100 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-indigo-500 animate-progress-indeterminate"></div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <style>{`
        @keyframes progress-indeterminate {
          0% { width: 0%; margin-left: 0; }
          50% { width: 70%; margin-left: 30%; }
          100% { width: 0%; margin-left: 100%; }
        }
        .animate-progress-indeterminate {
          animation: progress-indeterminate 1.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default ProcessingPipeline;