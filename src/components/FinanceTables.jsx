import React, { useMemo, useState, useEffect } from 'react';
import { Plus, Trash2, Save, Copy, Download } from 'lucide-react';

function currencyIDR(value) {
  try {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value || 0);
  } catch {
    return `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
  }
}

function Row({ row, onChange, onRemove, templates, setTemplates }) {
  const [local, setLocal] = useState(row);

  useEffect(() => setLocal(row), [row]);

  const applyTemplate = (name) => {
    const t = templates[name];
    if (!t) return;
    const next = { ...local, ...t };
    setLocal(next);
    onChange(next);
  };

  const saveTemplate = () => {
    const name = prompt('Template name');
    if (!name) return;
    const next = { ...templates, [name]: { name: local.name, qris: local.qris || 0, transfer: local.transfer || 0, cash: local.cash || 0, expense: local.expense || 0 } };
    setTemplates(next);
    localStorage.setItem('ws_templates', JSON.stringify(next));
  };

  return (
    <tr className="border-b border-neutral-800">
      <td className="p-2">
        <input className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-neutral-100" value={local.name} onChange={(e)=>{const v={...local,name:e.target.value};setLocal(v);onChange(v);}} placeholder="Nama sepatu"/>
      </td>
      <td className="p-2">
        <input type="number" className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-right text-neutral-100" value={local.qris||0} onChange={(e)=>{const v={...local,qris:Number(e.target.value||0)};setLocal(v);onChange(v);}}/>
      </td>
      <td className="p-2">
        <input type="number" className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-right text-neutral-100" value={local.transfer||0} onChange={(e)=>{const v={...local,transfer:Number(e.target.value||0)};setLocal(v);onChange(v);}}/>
      </td>
      <td className="p-2">
        <input type="number" className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-right text-neutral-100" value={local.cash||0} onChange={(e)=>{const v={...local,cash:Number(e.target.value||0)};setLocal(v);onChange(v);}}/>
      </td>
      <td className="p-2">
        <input type="number" className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-right text-neutral-100" value={local.expense||0} onChange={(e)=>{const v={...local,expense:Number(e.target.value||0)};setLocal(v);onChange(v);}}/>
      </td>
      <td className="p-2 text-right text-neutral-200 whitespace-nowrap">{currencyIDR((local.qris||0)+(local.transfer||0)+(local.cash||0)-(local.expense||0))}</td>
      <td className="p-2 text-right">
        <div className="flex items-center justify-end gap-2">
          <button title="Save as template" onClick={saveTemplate} className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-orange-400"><Save size={16}/></button>
          <div className="relative">
            <select onChange={(e)=>{if(e.target.value){applyTemplate(e.target.value); e.target.selectedIndex=0;}}} className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-neutral-200">
              <option value="">Template</option>
              {Object.keys(templates).map((t)=> (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <button onClick={onRemove} className="p-1 rounded bg-red-600 hover:bg-red-700 text-white"><Trash2 size={16}/></button>
        </div>
      </td>
    </tr>
  );
}

export default function FinanceTables({ month, onDataChange }) {
  const [rows, setRows] = useState([]);
  const [templates, setTemplates] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ws_templates')||'{}'); } catch { return {}; }
  });

  // derived totals
  const totals = useMemo(() => {
    const sum = rows.reduce((acc, r)=>{
      acc.qris += r.qris||0;
      acc.transfer += r.transfer||0;
      acc.cash += r.cash||0;
      acc.expense += r.expense||0;
      return acc;
    }, { qris:0, transfer:0, cash:0, expense:0 });
    return { ...sum, netCash: sum.cash - sum.expense, totalIn: sum.qris + sum.transfer + sum.cash, grandNet: sum.qris + sum.transfer + (sum.cash - sum.expense) };
  }, [rows]);

  useEffect(()=>{
    onDataChange({ month, rows, totals });
  }, [rows, month, onDataChange]);

  const addRow = () => setRows(prev => ([...prev, { id: crypto.randomUUID(), name: '', qris:0, transfer:0, cash:0, expense:0 }]));
  const updateRow = (id, next) => setRows(prev => prev.map(r => r.id === id ? { ...r, ...next } : r));
  const removeRow = (id) => setRows(prev => prev.filter(r => r.id !== id));

  // export to CSV (Excel compatible)
  const exportCSV = () => {
    const headers = ['Nama','QRIS','Transfer','Cash','Pengeluaran','Subtotal'];
    const lines = rows.map(r => [r.name, r.qris, r.transfer, r.cash, r.expense, (r.qris||0)+(r.transfer||0)+(r.cash||0)-(r.expense||0)]);
    lines.unshift(headers);
    const csv = lines.map(l => l.map(v => (typeof v === 'string' ? `"${v.replaceAll('"','""')}"` : v)).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `warrior-second-${month}-summary.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-100">Ringkasan Bulanan</h2>
        <div className="flex gap-2">
          <button onClick={addRow} className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded"><Plus size={16}/>Tambah baris</button>
          <button onClick={exportCSV} className="inline-flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 px-3 py-2 rounded"><Download size={16}/>Export Excel</button>
        </div>
      </div>

      <div className="overflow-x-auto border border-neutral-800 rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-900/80">
            <tr className="text-neutral-300">
              <th className="text-left p-2">Nama Sepatu</th>
              <th className="text-right p-2">QRIS</th>
              <th className="text-right p-2">Transfer</th>
              <th className="text-right p-2">Cash</th>
              <th className="text-right p-2">Pengeluaran</th>
              <th className="text-right p-2">Subtotal</th>
              <th className="text-right p-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r)=> (
              <Row key={r.id} row={r} onChange={(nr)=>updateRow(r.id, nr)} onRemove={()=>removeRow(r.id)} templates={templates} setTemplates={setTemplates} />
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-neutral-900 text-neutral-200">
              <td className="p-2 font-semibold">TOTAL</td>
              <td className="p-2 text-right">{currencyIDR(totals.qris)}</td>
              <td className="p-2 text-right">{currencyIDR(totals.transfer)}</td>
              <td className="p-2 text-right">{currencyIDR(totals.cash)}</td>
              <td className="p-2 text-right">{currencyIDR(totals.expense)}</td>
              <td className="p-2 text-right">{currencyIDR(totals.grandNet)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
          <div className="text-neutral-400">Total Masuk</div>
          <div className="text-2xl font-bold text-neutral-100">{currencyIDR(totals.totalIn)}</div>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
          <div className="text-neutral-400">Cash - Pengeluaran (Real-time)</div>
          <div className="text-2xl font-bold text-orange-400">{currencyIDR(totals.netCash)}</div>
        </div>
      </div>
    </div>
  );
}
