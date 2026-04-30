import React, { useState, useEffect } from 'react';
import { useCompare } from '../context/CompareContext';
import { compareAPI } from '../api/client';
import CompareTable from '../components/CompareTable';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ComparePage() {
  const { compareList, clearCompare, removeFromCompare } = useCompare();
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchComparisonData = async () => {
      if (compareList.length < 1) return;
      setLoading(true);
      try {
        const ids = compareList.map(c => c.id);
        const { data } = await compareAPI.compare(ids);
        setColleges(data);
      } catch (err) {
        toast.error('Failed to load comparison data');
      } finally {
        setLoading(false);
      }
    };
    fetchComparisonData();
  }, [compareList]);

  if (compareList.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center page-enter">
        <div className="text-6xl mb-6">⚖️</div>
        <h1 className="text-3xl font-display font-bold text-white mb-4">No colleges selected</h1>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">Select 2-3 colleges from the discovery page to compare them side-by-side on rankings, fees, and placements.</p>
        <Link to="/colleges" className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20">
          Go to Discovery
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 page-enter">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-display font-bold text-white">Compare Colleges</h1>
          <p className="text-slate-400 mt-2">Analytical side-by-side comparison for informed decisions.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={clearCompare}
            className="px-6 py-3 rounded-2xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all font-bold"
          >
            Clear All
          </button>
          <Link to="/colleges" className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all font-bold">
            + Add More
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="skeleton h-96 rounded-3xl opacity-20" />
      ) : (
        <div className="space-y-12">
          {/* Comparison Table Section */}
          <section className="animate-fade-in">
             <CompareTable colleges={colleges} />
          </section>

          {/* Quick Actions for compared colleges */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {colleges.map(c => (
              <div key={c.id} className="glass rounded-3xl p-8 border border-indigo-500/10 relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-full pointer-events-none" />
                <h3 className="font-display font-bold text-xl text-white mb-2">{c.name}</h3>
                <p className="text-sm text-slate-500 mb-6">{c.location}</p>
                <div className="space-y-3">
                   <Link to={`/colleges/${c.id}`} className="block w-full py-3 text-center rounded-xl bg-white/5 border border-white/5 text-white font-bold hover:bg-white/10 transition-all">
                     View Details
                   </Link>
                   <button 
                    onClick={() => removeFromCompare(c.id)}
                    className="w-full py-3 text-center rounded-xl text-red-400/70 hover:text-red-400 text-sm font-medium transition-all"
                   >
                     Remove from Comparison
                   </button>
                </div>
              </div>
            ))}
          </section>

          {/* Decision Guide */}
          <div className="glass rounded-3xl p-8 border border-white/5 bg-gradient-to-br from-indigo-900/10 to-transparent">
             <div className="flex items-center gap-4 mb-4">
               <span className="text-3xl">💡</span>
               <h2 className="text-xl font-bold text-white">Making the final call?</h2>
             </div>
             <p className="text-slate-400 leading-relaxed">
               While data is important, we recommend visiting the campuses virtually or talking to current students in our <Link to="/qa" className="text-indigo-400 hover:underline">Q&A section</Link> to get a feel for the culture and peer group.
             </p>
          </div>
        </div>
      )}
    </div>
  );
}
