import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';

export default function CompareBar() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const navigate = useNavigate();

  if (compareList.length === 0) return null;

  return (
    <div className="compare-bar">
      <div className="glass border border-indigo-500/30 rounded-2xl px-4 py-3 shadow-2xl shadow-indigo-500/20 flex items-center gap-3 flex-wrap">
        <span className="text-xs text-slate-400 font-medium shrink-0">Compare:</span>
        {compareList.map((c) => (
          <div key={c.id} className="flex items-center gap-1.5 bg-indigo-600/20 border border-indigo-500/30 rounded-xl px-3 py-1.5">
            <span className="text-xs text-indigo-300 font-medium max-w-[120px] truncate">{c.name}</span>
            <button onClick={() => removeFromCompare(c.id)} className="text-slate-500 hover:text-red-400 transition-colors">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        ))}
        {compareList.length >= 2 ? (
          <button onClick={() => navigate('/compare')} className="px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg">
            Compare Now →
          </button>
        ) : (
          <span className="text-xs text-slate-500">Add {2 - compareList.length} more</span>
        )}
        <button onClick={clearCompare} className="text-slate-500 hover:text-red-400 transition-colors text-xs">Clear</button>
      </div>
    </div>
  );
}
