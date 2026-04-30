import React from 'react';
import { Link } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';
import { useAuth } from '../context/AuthContext';
import { savedAPI } from '../api/client';
import toast from 'react-hot-toast';

const TYPE_BADGE = { IIT:'badge-iit', NIT:'badge-nit', Deemed:'badge-deemed', Private:'badge-private', Government:'badge-govt', IIIT:'badge-iiit' };

const Stars = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map((s) => (
      <svg key={s} className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? 'star-filled' : 'star-empty'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
    <span className="ml-1 text-xs text-slate-400">{Number(rating).toFixed(1)}</span>
  </div>
);

const fmt = (n) => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : n >= 1000 ? `₹${(n/1000).toFixed(0)}K` : `₹${n}`;

export default function CollegeCard({ college, savedIds = [], onSaveToggle }) {
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const { isAuthenticated } = useAuth();
  const inCompare = isInCompare(college.id);

  const handleCompare = (e) => {
    e.preventDefault();
    if (inCompare) { removeFromCompare(college.id); return; }
    const added = addToCompare(college);
    if (!added) toast.error('Max 3 colleges can be compared at once');
    else toast.success(`${college.name} added to compare`);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please sign in to save colleges'); return; }
    try {
      const isSaved = savedIds.includes(college.id);
      if (isSaved) {
        await savedAPI.unsaveCollege(college.id);
        toast.success('College unsaved');
      } else {
        await savedAPI.saveCollege(college.id);
        toast.success('College saved!');
      }
      if (onSaveToggle) onSaveToggle(college.id);
    } catch {
      toast.error('Failed to update saved colleges');
    }
  };

  const isSaved = savedIds.includes(college.id);

  return (
    <Link to={`/colleges/${college.id}`} className="block group">
      <div className="glass rounded-2xl p-5 hover:border-indigo-500/40 hover:bg-white/[0.06] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_BADGE[college.type] || 'badge-govt'}`}>{college.type}</span>
              {college.nirf_rank && <span className="text-xs text-slate-500">NIRF #{college.nirf_rank}</span>}
            </div>
            <h3 className="font-semibold text-white text-base leading-tight group-hover:text-indigo-300 transition-colors line-clamp-2">{college.name}</h3>
          </div>
          <button onClick={handleSave} className={`ml-2 p-1.5 rounded-lg transition-all ${isSaved ? 'text-amber-400 bg-amber-400/10' : 'text-slate-500 hover:text-amber-400 hover:bg-amber-400/10'}`} title={isSaved ? 'Unsave' : 'Save'}>
            <svg className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-slate-400 text-sm mb-3">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          <span className="truncate">{college.location}</span>
        </div>

        {/* Rating */}
        <div className="mb-3"><Stars rating={college.rating} /></div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-white/[0.03] rounded-xl p-2.5">
            <p className="text-xs text-slate-500 mb-0.5">Annual Fees</p>
            <p className="text-sm font-semibold text-white">{fmt(college.fees_min)}<span className="text-slate-500">+</span></p>
          </div>
          <div className="bg-white/[0.03] rounded-xl p-2.5">
            <p className="text-xs text-slate-500 mb-0.5">Avg Package</p>
            <p className="text-sm font-semibold text-emerald-400">{college.avg_package ? `${Number(college.avg_package).toFixed(1)} LPA` : 'N/A'}</p>
          </div>
          {college.placement_pct && (
            <div className="col-span-2 bg-white/[0.03] rounded-xl p-2.5">
              <div className="flex justify-between items-center mb-1">
                <p className="text-xs text-slate-500">Placement Rate</p>
                <p className="text-xs font-semibold text-white">{Number(college.placement_pct).toFixed(1)}%</p>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all" style={{ width: `${college.placement_pct}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Compare button */}
        <div className="mt-auto">
          <button
            onClick={handleCompare}
            className={`w-full py-2 rounded-xl text-xs font-semibold transition-all border ${
              inCompare
                ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/40 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30'
                : 'border-white/10 text-slate-400 hover:border-indigo-500/40 hover:text-indigo-400 hover:bg-indigo-500/10'
            }`}
          >
            {inCompare ? '✓ Added to Compare (click to remove)' : '+ Add to Compare'}
          </button>
        </div>
      </div>
    </Link>
  );
}
