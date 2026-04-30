import React from 'react';

const Stars = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map((s) => (
      <svg key={s} className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? 'star-filled' : 'star-empty'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

export default function ReviewCard({ review }) {
  const date = new Date(review.created_at).toLocaleDateString('en-IN', { year:'numeric', month:'short', day:'numeric' });
  return (
    <div className="glass rounded-2xl p-5 animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {(review.reviewer_name || review.user_display_name || 'A')[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-white text-sm">{review.reviewer_name || review.user_display_name || 'Anonymous'}</p>
            {review.batch_year && <p className="text-xs text-slate-500">Batch of {review.batch_year}</p>}
          </div>
        </div>
        <div className="text-right">
          <Stars rating={review.rating} />
          <p className="text-xs text-slate-500 mt-1">{date}</p>
        </div>
      </div>
      <p className="text-slate-300 text-sm leading-relaxed mb-3">{review.content}</p>
      {(review.pros || review.cons) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {review.pros && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
              <p className="text-xs font-semibold text-emerald-400 mb-1">👍 Pros</p>
              <p className="text-xs text-slate-300">{review.pros}</p>
            </div>
          )}
          {review.cons && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              <p className="text-xs font-semibold text-red-400 mb-1">👎 Cons</p>
              <p className="text-xs text-slate-300">{review.cons}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
