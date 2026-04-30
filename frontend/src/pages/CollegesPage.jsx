import React, { useState, useEffect, useCallback } from 'react';
import { collegesAPI, savedAPI } from '../api/client';
import CollegeCard from '../components/CollegeCard';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function CollegesPage() {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    state: '',
    type: '',
    min_fees: '',
    max_fees: '',
  });
  const [meta, setMeta] = useState({ states: [], types: [] });
  const [savedIds, setSavedIds] = useState([]);
  const { isAuthenticated } = useAuth();

  const fetchColleges = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await collegesAPI.list({ ...filters, page });
      setColleges(data.colleges);
      setTotal(data.total);
    } catch (err) {
      toast.error('Failed to fetch colleges');
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  const fetchMeta = async () => {
    try {
      const { data } = await collegesAPI.filters();
      setMeta(data);
    } catch (err) {}
  };

  const fetchSavedIds = async () => {
    if (!isAuthenticated) return;
    try {
      const { data } = await savedAPI.getColleges();
      setSavedIds(data.map(c => c.id));
    } catch (err) {}
  };

  useEffect(() => {
    fetchMeta();
  }, []);

  useEffect(() => {
    fetchColleges();
  }, [fetchColleges]);

  useEffect(() => {
    fetchSavedIds();
  }, [isAuthenticated]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="glass rounded-2xl p-6 sticky top-24">
            <h2 className="font-display font-bold text-xl text-white mb-6">Filters</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Search</label>
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="College name..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Location (State)</label>
                <select
                  name="state"
                  value={filters.state}
                  onChange={handleFilterChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500/50 transition-all"
                >
                  <option value="">All States</option>
                  {meta.states.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">College Type</label>
                <select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500/50 transition-all"
                >
                  <option value="">All Types</option>
                  {meta.types.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Max Annual Fees</label>
                <input
                  type="number"
                  name="max_fees"
                  value={filters.max_fees}
                  onChange={handleFilterChange}
                  placeholder="e.g. 200000"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500/50 transition-all"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display font-bold text-3xl text-white">Discovery</h1>
              <p className="text-slate-400 text-sm mt-1">Found {total} colleges matching your criteria</p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass rounded-2xl p-5 h-64 skeleton opacity-50" />
              ))}
            </div>
          ) : colleges.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {colleges.map(college => (
                  <CollegeCard
                    key={college.id}
                    college={college}
                    savedIds={savedIds}
                    onSaveToggle={(id) => setSavedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])}
                  />
                ))}
              </div>

              {/* Pagination */}
              {total > 12 && (
                <div className="mt-12 flex justify-center gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="px-4 py-2 glass rounded-xl text-sm font-medium text-white disabled:opacity-50 hover:bg-white/5 transition-all"
                  >
                    Previous
                  </button>
                  <button
                    disabled={colleges.length < 12}
                    onClick={() => setPage(p => p + 1)}
                    className="px-4 py-2 glass rounded-xl text-sm font-medium text-white disabled:opacity-50 hover:bg-white/5 transition-all"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">🔍</p>
              <h3 className="text-xl font-bold text-white mb-2">No Colleges Found</h3>
              <p className="text-slate-400">Try adjusting your filters to find more results.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
