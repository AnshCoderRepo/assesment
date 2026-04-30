import React, { useState, useEffect } from 'react';
import { predictAPI } from '../api/client';
import CollegeCard from '../components/CollegeCard';
import toast from 'react-hot-toast';

export default function PredictorPage() {
  const [exams, setExams] = useState([]);
  const [formData, setFormData] = useState({ exam: '', rank: '' });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const { data } = await predictAPI.exams();
        setExams(data);
        if (data.length > 0) setFormData(prev => ({ ...prev, exam: data[0] }));
      } catch (err) {}
    };
    fetchExams();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.rank) return toast.error('Please enter your rank');
    
    setLoading(true);
    setResults(null);
    try {
      const { data } = await predictAPI.predict(formData);
      setResults(data);
      if (data.colleges.length === 0) {
        toast.error('No colleges found for this rank');
      }
    } catch (err) {
      toast.error('Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 page-enter">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-5xl font-display font-black text-white mb-6">
          Admission <span className="gradient-text">Predictor</span>
        </h1>
        <p className="text-slate-400 text-lg">
          Based on previous year trends and NIRF data, we'll suggest colleges where you have the highest chance of securing a seat.
        </p>
      </div>

      <div className="max-w-2xl mx-auto mb-16">
        <div className="glass rounded-3xl p-8 border border-indigo-500/20 shadow-2xl shadow-indigo-500/10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">Select Exam</label>
                <select
                  value={formData.exam}
                  onChange={(e) => setFormData({ ...formData, exam: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-medium focus:border-indigo-500 transition-all outline-none"
                >
                  {exams.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">Your Rank / Percentile</label>
                <input
                  type="number"
                  placeholder="e.g. 1500"
                  value={formData.rank}
                  onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-medium focus:border-indigo-500 transition-all outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-lg rounded-2xl shadow-xl shadow-indigo-500/20 transition-all hover:-translate-y-1"
            >
              {loading ? 'Analyzing Data...' : 'Get Predictions →'}
            </button>
          </form>
        </div>
      </div>

      {results && (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Suggested Colleges</h2>
              <p className="text-slate-400">Showing {results.colleges.length} matches for {results.exam} Rank {results.rank}</p>
            </div>
            <div className="text-right hidden sm:block">
               <span className="text-xs font-bold text-slate-500 uppercase">Match Quality</span>
               <div className="flex gap-1 mt-1">
                 {[...Array(5)].map((_, i) => <div key={i} className="w-4 h-1 rounded-full bg-indigo-500" />)}
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.colleges.map(college => (
              <CollegeCard key={college.id} college={college} />
            ))}
          </div>

          {results.colleges.length === 0 && (
            <div className="glass rounded-3xl p-12 text-center border border-white/5">
              <p className="text-4xl mb-4">🫙</p>
              <h3 className="text-xl font-bold text-white mb-2">High Competition</h3>
              <p className="text-slate-400 max-w-sm mx-auto">Based on current rules, no colleges directly match this rank. Try exploring private or autonomous institutions in the discovery section.</p>
            </div>
          )}
        </div>
      )}

      {/* Info Section */}
      {!results && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 opacity-60">
           {[
             { title: 'Rule Based', icon: '⚖️', text: 'Predictions are based on historical opening/closing ranks.' },
             { title: 'NIRF Integrated', icon: '📊', text: 'Top suggestions prioritize higher ranked NIRF institutions.' },
             { title: 'Placement Focused', icon: '💼', text: 'Results are sorted by institution placement performance.' }
           ].map(item => (
             <div key={item.title} className="p-6 text-center">
                <span className="text-2xl mb-3 block">{item.icon}</span>
                <h4 className="font-bold text-white mb-2">{item.title}</h4>
                <p className="text-sm text-slate-400">{item.text}</p>
             </div>
           ))}
        </div>
      )}
    </div>
  );
}
