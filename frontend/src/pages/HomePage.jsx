import React from 'react';
import { Link } from 'react-router-dom';

const STATS = [
  { label: 'Colleges Listed', value: '20+', icon: '🏫' },
  { label: 'Student Reviews', value: '500+', icon: '⭐' },
  { label: 'Courses Tracked', value: '100+', icon: '📚' },
  { label: 'Placement Data', value: '2024', icon: '💼' },
];

const FEATURES = [
  { icon: '🔍', title: 'Smart Search', desc: 'Search and filter colleges by location, fees, courses and more.', to: '/colleges' },
  { icon: '⚖️', title: 'Side-by-Side Compare', desc: 'Compare up to 3 colleges on fees, placements, ratings and rankings.', to: '/compare', highlight: true },
  { icon: '🧠', title: 'Admission Predictor', desc: 'Enter your JEE/NEET/CAT rank and get eligible colleges instantly.', to: '/predictor' },
  { icon: '💬', title: 'Student Q&A', desc: 'Ask questions and get answers from current students and alumni.', to: '/qa' },
];

const TOP_COLLEGES = [
  { name: 'IIT Madras', type: 'IIT', nirf: 1, rating: 4.9, location: 'Chennai, TN', id: 3 },
  { name: 'IIT Delhi', type: 'IIT', nirf: 2, rating: 4.8, location: 'New Delhi', id: 2 },
  { name: 'IIT Bombay', type: 'IIT', nirf: 3, rating: 4.8, location: 'Mumbai, MH', id: 1 },
  { name: 'NIT Trichy', type: 'NIT', nirf: 9, rating: 4.3, location: 'Trichy, TN', id: 7 },
  { name: 'IIIT Hyderabad', type: 'IIIT', nirf: 35, rating: 4.4, location: 'Hyderabad, TS', id: 10 },
  { name: 'BITS Pilani', type: 'Deemed', nirf: 25, rating: 4.5, location: 'Pilani, RJ', id: 6 },
];

const TYPE_CLR = { IIT:'text-indigo-400 bg-indigo-400/10', NIT:'text-emerald-400 bg-emerald-400/10', Deemed:'text-amber-400 bg-amber-400/10', IIIT:'text-purple-400 bg-purple-400/10' };

export default function HomePage() {
  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-16 pb-24">
        {/* BG blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 glass border border-indigo-500/30 rounded-full px-4 py-2 mb-6 text-sm text-indigo-300">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse-slow"></span>
            India's #1 College Discovery Platform
          </div>

          <h1 className="font-display font-extrabold text-5xl sm:text-6xl lg:text-7xl text-white leading-tight mb-6">
            Find Your{' '}
            <span className="gradient-text">Dream College</span>
          </h1>
          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Compare 20+ top colleges, predict your admission chances based on your rank, and read honest student reviews — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/colleges" className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl text-lg transition-all shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5">
              Explore Colleges →
            </Link>
            <Link to="/predictor" className="px-8 py-4 glass border border-white/15 hover:border-indigo-500/40 text-white font-semibold rounded-2xl text-lg transition-all hover:-translate-y-0.5">
              🧠 Predict Admission
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 pb-16">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="glass rounded-2xl p-5 text-center hover:border-indigo-500/30 transition-all">
              <p className="text-3xl mb-2">{s.icon}</p>
              <p className="text-2xl font-bold text-white font-display">{s.value}</p>
              <p className="text-sm text-slate-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-4 pb-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display font-bold text-3xl text-white text-center mb-2">Everything You Need</h2>
          <p className="text-slate-400 text-center mb-10">Make the most informed college decision of your life.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map((f) => (
              <Link key={f.to} to={f.to} className={`glass rounded-2xl p-6 hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-300 group ${f.highlight ? 'border-indigo-500/30 bg-indigo-600/5' : ''}`}>
                <p className="text-3xl mb-3">{f.icon}</p>
                <h3 className="font-bold text-white text-lg mb-2 group-hover:text-indigo-300 transition-colors">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                {f.highlight && <span className="mt-3 inline-block text-xs font-semibold text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded-full">HIGH PRIORITY</span>}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Top Colleges */}
      <section className="px-4 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-2xl text-white">Top Colleges 2024</h2>
            <Link to="/colleges" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">View all →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TOP_COLLEGES.map((c, i) => (
              <Link key={c.id} to={`/colleges/${c.id}`} className="glass rounded-2xl p-4 hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-white/10 flex items-center justify-center text-sm font-bold text-slate-300">#{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm group-hover:text-indigo-300 transition-colors truncate">{c.name}</p>
                    <p className="text-xs text-slate-500">{c.location}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_CLR[c.type] || ''}`}>{c.type}</span>
                  <div className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 star-filled" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    <span className="text-xs text-slate-300">{c.rating}</span>
                    <span className="text-slate-600 ml-1 text-xs">NIRF #{c.nirf}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-20">
        <div className="max-w-3xl mx-auto glass rounded-3xl p-10 text-center border-indigo-500/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-purple-600/10 pointer-events-none" />
          <h2 className="font-display font-bold text-3xl text-white mb-3 relative">Ready to find your college?</h2>
          <p className="text-slate-400 mb-6 relative">Join thousands of students making smarter decisions with CollegeCompass.</p>
          <Link to="/register" className="inline-block px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl transition-all shadow-xl hover:-translate-y-0.5 relative">
            Get Started Free →
          </Link>
        </div>
      </section>
    </div>
  );
}
