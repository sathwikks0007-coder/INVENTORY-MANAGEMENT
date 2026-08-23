import React from 'react';

const Badge = ({ type, status, children }) => {
  let value = children || status;
  let color = 'bg-slate-100 text-slate-700 border-slate-200';

  const s = (status || '').toString().toLowerCase();

  if (type === 'stock') {
    if (s === 'in stock') color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    else if (s === 'low stock') color = 'bg-amber-50 text-amber-700 border-amber-200';
    else if (s === 'out of stock') color = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (type === 'payment') {
    if (s === 'paid') color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    else if (s === 'pending' || s === 'partially paid') color = 'bg-amber-50 text-amber-700 border-amber-200';
    else if (s === 'failed') color = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (type === 'role') {
    if (s === 'administrator') color = 'bg-indigo-50 text-indigo-700 border-indigo-200';
    else if (s === 'inventory manager') color = 'bg-cyan-50 text-cyan-700 border-cyan-200';
    else color = 'bg-purple-50 text-purple-700 border-purple-200';
  } else if (type === 'status') {
    if (s === 'active') color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    else color = 'bg-slate-100 text-slate-600 border-slate-200';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${color}`}>
      {value}
    </span>
  );
};

export default Badge;
