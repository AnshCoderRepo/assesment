import React, { useState, useEffect } from 'react';
import { savedAPI } from '../api/client';
import CollegeCard from '../components/CollegeCard';
import toast from 'react-hot-toast';

export default function SavedPage() {
  const [savedColleges, setSavedColleges] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    setLoading(true);
    try {
      const { data } = await savedAPI.getColleges();
      setSavedColleges(data);
    } catch (err) {
      toast.error('Failed to load saved items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleUnsave = (id) => {
    setSavedColleges(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 page-enter">
      <div className="mb-12">
        <h1 className="text-4xl font-display font-bold text-white">Your Saved Items</h1>
        <p className="text-slate-400 mt-2">Colleges you've bookmarked for later review.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <div key={i} className="h-64 glass rounded-3xl skeleton opacity-20" />)}
        </div>
      ) : (
        <>
          {savedColleges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedColleges.map(college => (
                <CollegeCard 
                  key={college.id} 
                  college={college} 
                  savedIds={savedColleges.map(c => c.id)}
                  onSaveToggle={handleUnsave}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 glass rounded-3xl border border-white/5">
              <p className="text-5xl mb-4">🔖</p>
              <h3 className="text-xl font-bold text-white mb-2">Nothing Saved Yet</h3>
              <p className="text-slate-400 max-w-sm mx-auto mb-8">Save colleges from the discovery page to easily find them later and compare them.</p>
              <a href="/colleges" className="inline-block px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-500 transition-all">
                Explore Colleges
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );
}
