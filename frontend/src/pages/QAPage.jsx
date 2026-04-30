import React, { useState, useEffect } from 'react';
import { qaAPI, collegesAPI } from '../api/client';
import QuestionCard from '../components/QuestionCard';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function QAPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [colleges, setColleges] = useState([]);
  const [showAskForm, setShowAskForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ college_id: '', title: '', body: '' });
  const { isAuthenticated } = useAuth();

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const { data } = await qaAPI.list();
      setQuestions(data.questions);
    } catch (err) {
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const fetchColleges = async () => {
    try {
      const { data } = await collegesAPI.list({ limit: 100 });
      setColleges(data.colleges);
    } catch (err) {}
  };

  useEffect(() => {
    fetchQuestions();
    fetchColleges();
  }, []);

  const handleAskSubmit = async (e) => {
    e.preventDefault();
    if (!newQuestion.title) return toast.error('Title is required');
    try {
      await qaAPI.ask(newQuestion);
      toast.success('Question posted!');
      setNewQuestion({ college_id: '', title: '', body: '' });
      setShowAskForm(false);
      fetchQuestions();
    } catch (err) {
      toast.error('Failed to post question');
    }
  };

  const updateQuestionAnswers = (qId, newAnswer) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === qId) {
        return {
          ...q,
          answer_count: parseInt(q.answer_count) + 1,
          answers: [...(q.answers || []), newAnswer]
        };
      }
      return q;
    }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 page-enter">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-display font-bold text-white">Community Q&A</h1>
          <p className="text-slate-400 mt-2">Get answers from alumni and current students.</p>
        </div>
        {isAuthenticated ? (
          <button 
            onClick={() => setShowAskForm(!showAskForm)}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-500/20"
          >
            {showAskForm ? 'Cancel' : 'Ask a Question'}
          </button>
        ) : (
          <p className="text-sm text-slate-500 bg-white/5 px-4 py-2 rounded-xl">Sign in to ask questions</p>
        )}
      </div>

      {showAskForm && (
        <form onSubmit={handleAskSubmit} className="glass rounded-3xl p-8 mb-12 border-indigo-500/30 animate-slide-down">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">Target College (Optional)</label>
              <select
                value={newQuestion.college_id}
                onChange={(e) => setNewQuestion({ ...newQuestion, college_id: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-indigo-500 outline-none"
              >
                <option value="">General Question</option>
                {colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">Question Title</label>
              <input
                type="text"
                required
                placeholder="e.g. What is the hostel life like at IIT Bombay?"
                value={newQuestion.title}
                onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">Details (Optional)</label>
              <textarea
                rows="4"
                placeholder="Provide more context for better answers..."
                value={newQuestion.body}
                onChange={(e) => setNewQuestion({ ...newQuestion, body: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-indigo-500 outline-none"
              />
            </div>
            <button type="submit" className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/20">
              Post Question
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 glass rounded-3xl skeleton opacity-20" />)}
        </div>
      ) : (
        <div className="space-y-6">
          {questions.length > 0 ? (
            questions.map(q => (
              <QuestionCard 
                key={q.id} 
                question={q} 
                onAnswer={(qId, answer) => updateQuestionAnswers(qId, answer)} 
              />
            ))
          ) : (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">🙊</p>
              <h3 className="text-xl font-bold text-white mb-2">No Questions Yet</h3>
              <p className="text-slate-400">Be the first to start a conversation!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
