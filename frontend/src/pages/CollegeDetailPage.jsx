import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collegesAPI, qaAPI, savedAPI } from '../api/client';
import ReviewCard from '../components/ReviewCard';
import QuestionCard from '../components/QuestionCard';
import { useAuth } from '../context/AuthContext';
import { useCompare } from '../context/CompareContext';
import toast from 'react-hot-toast';

const fmt = (n) => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : n >= 1000 ? `₹${(n/1000).toFixed(0)}K` : `₹${n}`;

export default function CollegeDetailPage() {
  const { id } = useParams();
  const [college, setCollege] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSaved, setIsSaved] = useState(false);
  const { isAuthenticated } = useAuth();
  const { addToCompare, isInCompare, removeFromCompare } = useCompare();

  // Review Form State
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, content: '', pros: '', cons: '', batch_year: new Date().getFullYear() });

  const fetchData = useCallback(async () => {
    try {
      const [{ data: collegeData }, { data: qaData }] = await Promise.all([
        collegesAPI.get(id),
        qaAPI.list({ college_id: id })
      ]);
      setCollege(collegeData);
      setQuestions(qaData.questions);
      
      if (isAuthenticated) {
        const { data: saved } = await savedAPI.getColleges();
        setIsSaved(saved.some(c => c.id === parseInt(id)));
      }
    } catch (err) {
      toast.error('Failed to load college details');
    } finally {
      setLoading(false);
    }
  }, [id, isAuthenticated]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveToggle = async () => {
    if (!isAuthenticated) return toast.error('Sign in to save');
    try {
      if (isSaved) {
        await savedAPI.unsaveCollege(id);
        toast.success('Removed from saved');
      } else {
        await savedAPI.saveCollege(id);
        toast.success('Added to saved');
      }
      setIsSaved(!isSaved);
    } catch (err) { toast.error('Action failed'); }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await collegesAPI.postReview(id, newReview);
      toast.success('Review posted!');
      setShowReviewForm(false);
      fetchData(); // Refresh to show new review
    } catch (err) { toast.error('Failed to post review'); }
  };

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-20 skeleton h-96 opacity-30" />;
  if (!college) return <div className="text-center py-20 text-white">College not found</div>;

  const inCompare = isInCompare(college.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
      {/* Header Section */}
      <div className="glass rounded-3xl p-8 mb-8">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider">{college.type}</span>
              <span className="text-slate-400 text-sm">NIRF Rank: #{college.nirf_rank || 'N/A'}</span>
            </div>
            <h1 className="font-display font-bold text-4xl text-white mb-2">{college.name}</h1>
            <p className="flex items-center gap-2 text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              {college.location}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 h-fit">
            <button
              onClick={handleSaveToggle}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${isSaved ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'}`}
            >
              <svg className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
              {isSaved ? 'Saved' : 'Save'}
            </button>
            <button
              onClick={() => inCompare ? removeFromCompare(college.id) : addToCompare(college)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${inCompare ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20'}`}
            >
              {inCompare ? '✓ Added to Compare' : '+ Add to Compare'}
            </button>
            <a href={college.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-all">
              Website ↗
            </a>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Avg Fees</p>
            <p className="text-xl font-display font-bold text-white">{fmt(college.fees_min)} - {fmt(college.fees_max)}</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Avg Package</p>
            <p className="text-xl font-display font-bold text-emerald-400">{college.avg_package || 'N/A'} LPA</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Rating</p>
            <div className="flex items-center gap-1">
              <span className="text-xl font-display font-bold text-amber-400">{Number(college.rating).toFixed(1)}</span>
              <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            </div>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Established</p>
            <p className="text-xl font-display font-bold text-white">{college.established}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-2xl mb-8 overflow-x-auto">
        {['overview', 'courses', 'placements', 'reviews', 'qa'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-3 rounded-xl text-sm font-bold capitalize transition-all whitespace-nowrap ${activeTab === tab ? 'tab-active' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="glass rounded-3xl p-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-4">About the Institution</h2>
            <p className="text-slate-400 leading-relaxed text-lg">{college.description || "No detailed description available."}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              <div className="space-y-4">
                <h3 className="font-bold text-white text-lg">Key Information</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Accreditation', value: college.accreditation },
                    { label: 'Total Students', value: college.total_students?.toLocaleString() },
                    { label: 'Campus Area', value: 'Over 500 Acres' },
                    { label: 'State', value: college.state }
                  ].map(item => (
                    <div key={item.label} className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-slate-500">{item.label}</span>
                      <span className="text-white font-medium">{item.value || 'N/A'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="glass rounded-3xl p-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-6">Offered Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {college.courses.map(course => (
                <div key={course.id} className="bg-white/5 rounded-2xl p-5 border border-white/5 hover:border-indigo-500/30 transition-all group">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-white group-hover:text-indigo-400 transition-colors">{course.name}</h3>
                    <span className="px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-bold">{course.level}</span>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <p className="text-slate-400">Duration: <span className="text-white font-medium">{course.duration} Years</span></p>
                    <p className="text-slate-400">Fee: <span className="text-emerald-400 font-bold">{fmt(course.annual_fee)}/yr</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'placements' && (
          <div className="glass rounded-3xl p-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-6">Placements Statistics</h2>
            {college.placements.length > 0 ? (
              <div className="space-y-8">
                {college.placements.map(p => (
                  <div key={p.id}>
                    <div className="flex justify-between items-end mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white">Year {p.year}</h3>
                        <p className="text-slate-400">Detailed report for the academic year</p>
                      </div>
                      <span className="text-3xl font-display font-black text-indigo-500/50">#{p.year}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-6 text-center">
                        <p className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-widest">Average Package</p>
                        <p className="text-3xl font-black text-white">{p.avg_package} LPA</p>
                      </div>
                      <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6 text-center">
                        <p className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-widest">Highest Package</p>
                        <p className="text-3xl font-black text-white">{p.highest_package} Cr</p>
                      </div>
                      <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-6 text-center">
                        <p className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-widest">Placement Rate</p>
                        <p className="text-3xl font-black text-white">{p.placement_pct}%</p>
                      </div>
                    </div>
                    <div className="mt-6">
                      <p className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-widest">Top Recruiters</p>
                      <div className="flex flex-wrap gap-2">
                        {p.top_recruiters.map(r => (
                          <span key={r} className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-slate-300 text-sm font-medium">{r}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-slate-500 text-center py-10">No placement data available yet.</p>}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Student Reviews</h2>
              {isAuthenticated ? (
                <button 
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all"
                >
                  {showReviewForm ? 'Cancel' : 'Write a Review'}
                </button>
              ) : <p className="text-sm text-slate-500">Sign in to leave a review</p>}
            </div>

            {showReviewForm && (
              <form onSubmit={handleReviewSubmit} className="glass rounded-3xl p-8 border-indigo-500/30 animate-slide-down mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Overall Rating (1-5)</label>
                    <input 
                      type="number" min="1" max="5" required
                      value={newReview.rating}
                      onChange={(e) => setNewReview({...newReview, rating: parseInt(e.target.value)})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Batch Year</label>
                    <input 
                      type="number" required
                      value={newReview.batch_year}
                      onChange={(e) => setNewReview({...newReview, batch_year: parseInt(e.target.value)})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500/50"
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Share your experience</label>
                  <textarea 
                    required rows="4"
                    value={newReview.content}
                    onChange={(e) => setNewReview({...newReview, content: e.target.value})}
                    placeholder="Tell us about the faculty, campus, hostel, etc..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500/50"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-sm font-medium text-emerald-400 mb-2">Pros</label>
                    <input 
                      value={newReview.pros}
                      onChange={(e) => setNewReview({...newReview, pros: e.target.value})}
                      className="w-full bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-4 py-3 text-white focus:border-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-red-400 mb-2">Cons</label>
                    <input 
                      value={newReview.cons}
                      onChange={(e) => setNewReview({...newReview, cons: e.target.value})}
                      className="w-full bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3 text-white focus:border-red-500/50"
                    />
                  </div>
                </div>
                <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/20 transition-all">
                  Post Review
                </button>
              </form>
            )}

            <div className="space-y-4">
              {college.reviews.length > 0 ? (
                college.reviews.map(review => <ReviewCard key={review.id} review={review} />)
              ) : <p className="text-slate-500 text-center py-10">No reviews yet. Be the first!</p>}
            </div>
          </div>
        )}

        {activeTab === 'qa' && (
          <div className="space-y-6 animate-fade-in">
             <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Platform Q&A</h2>
              <Link to="/qa" className="text-indigo-400 hover:text-indigo-300 font-medium text-sm">Ask a question →</Link>
            </div>
            <div className="space-y-4">
              {questions.length > 0 ? (
                questions.map(q => <QuestionCard key={q.id} question={q} />)
              ) : <p className="text-slate-500 text-center py-10">No questions for this college yet.</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
