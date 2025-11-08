import React, { useMemo } from 'react';

const currency = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(n || 0));

export default function StatsHeader({ salesRows, expenseRows }) {
  const totals = useMemo(() => {
    const qris = salesRows.reduce((a, r) => a + Number(r.qris || 0), 0);
    const transfer = salesRows.reduce((a, r) => a + Number(r.transfer || 0), 0);
    const cash = salesRows.reduce((a, r) => a + Number(r.cash || 0), 0);
    const expenses = expenseRows.reduce((a, r) => a + Number(r.amount || 0), 0);
    const revenue = qris + transfer + cash;
    const netCash = Math.max(0, cash - expenses);
    return { qris, transfer, cash, expenses, revenue, netCash };
  }, [salesRows, expenseRows]);

  const card = (label, value, accent) => (
    <div className={`bg-neutral-900 border border-neutral-800 rounded-xl p-4 ${accent}`}>
      <p className="text-neutral-400 text-sm">{label}</p>
      <p className="text-xl font-semibold text-neutral-100">{currency(value)}</p>
    </div>
  );

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {card('QRIS', totals.qris)}
      {card('Transfer', totals.transfer)}
      {card('Cash', totals.cash)}
      {card('Expenses', totals.expenses)}
      {card('Total Revenue', totals.revenue)}
      {card('Remaining Cash', totals.netCash)}
    </div>
  );
}
