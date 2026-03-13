import React from 'react';
import { motion } from 'motion/react';
import { Activity, Sparkles, Zap, CheckCircle2, AlertCircle } from 'lucide-react';

interface AnalysisSidebarProps {
  analysis: any;
  handleDeepAnalysis: () => void;
  isDeepAnalyzing: boolean;
}

export const AnalysisSidebar: React.FC<AnalysisSidebarProps> = ({
  analysis,
  handleDeepAnalysis,
  isDeepAnalyzing,
}) => {
  return (
    <div className="w-64 border-l border-slate-100 bg-slate-50/50 p-6 hidden xl:block overflow-y-auto">
      <div className="space-y-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Doc Health</h3>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-end gap-1 mb-2">
              <span className="text-3xl font-bold text-slate-900">{analysis?.score || 0}</span>
              <span className="text-slate-400 text-sm mb-1">/100</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${analysis?.score || 0}%` }}
                className="h-full bg-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Checklist</h3>
          {[
            { label: 'Goals Defined', status: analysis?.hasGoals },
            { label: 'Metrics Included', status: analysis?.hasMetrics },
            { label: 'User Stories', status: analysis?.hasUserStories },
            { label: 'Length > 100 words', status: (analysis?.wordCount || 0) > 100 }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <span className={item.status ? "text-slate-700" : "text-slate-400"}>{item.label}</span>
            </div>
          ))}
        </div>

        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
          <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase mb-2">
            AI Suggestion
          </div>
          <p className="text-xs text-blue-600 leading-relaxed mb-4">
            {analysis?.score && analysis.score < 100 
              ? "Your PRD is missing key metrics. Ask AI to 'Suggest success metrics for this feature'."
              : "Great job! Your document is comprehensive and ready for review."}
          </p>
          <button 
            onClick={handleDeepAnalysis}
            disabled={isDeepAnalyzing}
            className="w-full py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
          >
            {isDeepAnalyzing ? "Analyzing..." : "Run Deep Analysis"}
          </button>
        </div>
      </div>
    </div>
  );
};
