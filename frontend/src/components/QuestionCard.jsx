import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { qaAPI } from '../api/client';
import toast from 'react-hot-toast';

export default function QuestionCard({ question, onAnswer }) {
  const [expanded, setExpanded] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { isAuthenticated } = useAuth();
  const date = new Date(question.created_at).toLocaleDateString('en-IN', { year:'numeric', month:'short', day:'numeric' });

  const handleAnswer = async (e) => {
    e.preventDefault();
    if (!answerText.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await qaAPI.answer(question.id, { body: answerText });
      toast.success('Answer posted!');
      setAnswerText('');
      if (onAnswer) onAnswer(question.id, data);
    } catch { toast.error('Failed to post answer'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <button className="w-full text-left px-5 py-4 hover:bg-white/[0.03] transition-colors" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                {(question.author_name||'A')[0].toUpperCase()}
              </span>
              <span className="text-sm font-medium text-slate-400">{question.author_name || 'Anonymous'}</span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-500">{date}</span>
              {question.college_name && (
                <>
                  <span className="text-slate-600">·</span>
                  <Link to={`/colleges/${question.college_id}`} onClick={(e) => e.stopPropagation()} className="text-xs text-indigo-400 hover:text-indigo-300">{question.college_name}</Link>
                </>
              )}
            </div>
            <h4 className="font-semibold text-white text-sm">{question.title}</h4>
            {question.body && <p className="text-slate-400 text-sm mt-1 line-clamp-2">{question.body}</p>}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded-full">{question.answer_count || 0} ans</span>
            <svg className={`w-4 h-4 text-slate-500 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-white/5 px-5 py-4 animate-fade-in">
          {question.answers && question.answers.length > 0 ? (
            <div className="space-y-3 mb-4">
              {question.answers.map((a) => (
                <div key={a.id} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs flex-shrink-0">{(a.author_name||'A')[0].toUpperCase()}</div>
                  <div className="flex-1 bg-white/[0.03] rounded-xl p-3">
                    <p className="text-xs font-medium text-slate-400 mb-1">{a.author_name}</p>
                    <p className="text-sm text-slate-300">{a.body}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm mb-4">No answers yet. Be the first to answer!</p>
          )}

          {isAuthenticated ? (
            <form onSubmit={handleAnswer} className="flex gap-2">
              <input
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Write your answer..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500/50"
              />
              <button type="submit" disabled={submitting || !answerText.trim()} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all">
                {submitting ? '...' : 'Post'}
              </button>
            </form>
          ) : (
            <p className="text-sm text-slate-500"><Link to="/login" className="text-indigo-400 hover:text-indigo-300">Sign in</Link> to answer</p>
          )}
        </div>
      )}
    </div>
  );
}
