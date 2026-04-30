import React from 'react';
import { Link } from 'react-router-dom';

const fmt = (n) => n ? (n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : `₹${(n/1000).toFixed(0)}K`) : 'N/A';
const fmtLPA = (n) => n ? `${Number(n).toFixed(1)} LPA` : 'N/A';
const fmtPct = (n) => n ? `${Number(n).toFixed(1)}%` : 'N/A';

const Row = ({ label, values, highlight = false, format = (v) => v }) => {
  const numValues = values.map((v) => (v !== null && v !== undefined && v !== 'N/A' ? parseFloat(v) : null));
  const maxVal = Math.max(...numValues.filter((v) => v !== null));

  return (
    <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
      <td className="px-4 py-3.5 text-sm font-medium text-slate-400 whitespace-nowrap w-40">{label}</td>
      {values.map((val, i) => {
        const numVal = numValues[i];
        const isWinner = highlight && numVal !== null && numVal === maxVal && values.filter((v) => v !== null).length > 1;
        return (
          <td key={i} className={`px-4 py-3.5 text-center text-sm font-semibold transition-colors ${isWinner ? 'compare-winner text-indigo-300' : 'text-white'}`}>
            <span className="flex items-center justify-center gap-1">
              {isWinner && <span className="text-xs">🏆</span>}
              {format(val)}
            </span>
          </td>
        );
      })}
    </tr>
  );
};

export default function CompareTable({ colleges }) {
  if (!colleges || colleges.length < 2) return null;

  return (
    <div className="scroll-x rounded-2xl border border-white/10 overflow-hidden">
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border-b border-white/10">
            <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider w-40">Criteria</th>
            {colleges.map((c) => (
              <th key={c.id} className="px-4 py-4 text-center">
                <Link to={`/colleges/${c.id}`} className="hover:text-indigo-300 transition-colors">
                  <p className="font-bold text-white text-sm">{c.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{c.location}</p>
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          <Row label="Type" values={colleges.map((c) => c.type)} />
          <Row label="NIRF Rank" values={colleges.map((c) => c.nirf_rank || 'Unranked')} highlight format={(v) => v !== null && v !== undefined && v !== 'Unranked' ? `#${v}` : 'Unranked'} />
          <Row label="Rating" values={colleges.map((c) => c.rating)} highlight format={(v) => v ? `${Number(v).toFixed(1)} / 5` : 'N/A'} />
          <Row label="Min Annual Fees" values={colleges.map((c) => c.fees_min)} format={fmt} />
          <Row label="Max Annual Fees" values={colleges.map((c) => c.fees_max)} format={fmt} />
          <Row label="Avg Package" values={colleges.map((c) => c.avg_package)} highlight format={fmtLPA} />
          <Row label="Highest Package" values={colleges.map((c) => c.highest_package ? c.highest_package * 100 : null)} highlight format={(v) => v ? `₹${Number(v).toFixed(0)}Cr` : 'N/A'} />
          <Row label="Placement %" values={colleges.map((c) => c.placement_pct)} highlight format={fmtPct} />
          <Row label="Established" values={colleges.map((c) => c.established || 'N/A')} />
          <Row label="Accreditation" values={colleges.map((c) => c.accreditation || 'N/A')} />
          <Row label="Total Students" values={colleges.map((c) => c.total_students ? c.total_students.toLocaleString() : 'N/A')} />
          <tr className="bg-white/[0.02]">
            <td className="px-4 py-3.5 text-sm font-medium text-slate-400">Top Courses</td>
            {colleges.map((c) => (
              <td key={c.id} className="px-4 py-3.5 text-center text-xs text-slate-300">
                {(c.courses || []).slice(0, 3).join(', ') || 'N/A'}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
