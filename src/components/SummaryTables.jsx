import React, { useMemo, useState, useEffect } from 'react';
import { Download, Plus, Copy } from 'lucide-react';

const currency = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(n || 0));

function TemplateSelector({ label, templatesKey, onApply }) {
  const [name, setName] = useState('');
  const [templates, setTemplates] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(templatesKey) || '[]');
    } catch {
      return [];
    }
  });

  const [selected, setSelected] = useState('');

  const saveTemplate = () => {
    if (!name.trim()) return;
    const newTemplates = [...templates, { id: Date.now(), name }];
    setTemplates(newTemplates);
    localStorage.setItem(templatesKey, JSON.stringify(newTemplates));
    setName('');
  };

  const applyTemplate = () => {
    const t = templates.find((t) => String(t.id) === String(selected));
    if (t) onApply(t);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <select value={selected} onChange={(e) => setSelected(e.target.value)} className="bg-neutral-800 border border-neutral-700 text-neutral-100 rounded-lg px-2 py-1">
        <option value="">Select {label} template</option>
        {templates.map((t) => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>
      <button onClick={applyTemplate} className="bg-neutral-800 border border-neutral-700 text-neutral-200 px-3 py-1 rounded-lg flex items-center gap-1"><Copy size={16}/>Apply</button>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder={`Save ${label} template name`} className="bg-neutral-800 border border-neutral-700 text-neutral-100 rounded-lg px-2 py-1"/>
      <button onClick={saveTemplate} className="bg-orange-600 hover:bg-orange-500 text-white px-3 py-1 rounded-lg flex items-center gap-1"><Plus size={16}/>Save</button>
    </div>
  );
}

function EditableTable({ title, rows, setRows, templatesKey }) {
  const [newRow, setNewRow] = useState({ name: '', qris: '', transfer: '', cash: '' });

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, r) => {
        acc.qris += Number(r.qris || 0);
        acc.transfer += Number(r.transfer || 0);
        acc.cash += Number(r.cash || 0);
        return acc;
      },
      { qris: 0, transfer: 0, cash: 0 }
    );
  }, [rows]);

  const addRow = () => {
    if (!newRow.name) return;
    setRows([...rows, { ...newRow, id: Date.now() }]);
    setNewRow({ name: '', qris: '', transfer: '', cash: '' });
  };

  const applyTemplate = (t) => {
    setNewRow((prev) => ({ ...prev, name: t.name }));
  };

  const exportCSV = () => {
    const header = ['Name','QRIS','Transfer','Cash'];
    const body = rows.map(r => [r.name, r.qris, r.transfer, r.cash]);
    const csv = [header, ...body].map(line => line.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g,'_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const updateRow = (id, key, value) => {
    setRows(rows.map(r => r.id === id ? { ...r, [key]: value } : r));
  };

  const deleteRow = (id) => setRows(rows.filter(r => r.id !== id));

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-orange-400">{title}</h3>
        <button onClick={exportCSV} className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 rounded-lg px-3 py-1">
          <Download size={16}/> Export CSV
        </button>
      </div>

      <div className="mb-3">
        <TemplateSelector label="item" templatesKey={templatesKey} onApply={applyTemplate} />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-neutral-200">
          <thead>
            <tr className="text-neutral-400">
              <th className="text-left p-2">Shoe Name</th>
              <th className="text-right p-2">QRIS</th>
              <th className="text-right p-2">Transfer</th>
              <th className="text-right p-2">Cash</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-t border-neutral-800">
                <td className="p-2">
                  <input className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1" value={r.name} onChange={e=>updateRow(r.id,'name',e.target.value)} />
                </td>
                <td className="p-2 text-right">
                  <input className="w-full text-right bg-neutral-800 border border-neutral-700 rounded px-2 py-1" value={r.qris} onChange={e=>updateRow(r.id,'qris',e.target.value)} />
                </td>
                <td className="p-2 text-right">
                  <input className="w-full text-right bg-neutral-800 border border-neutral-700 rounded px-2 py-1" value={r.transfer} onChange={e=>updateRow(r.id,'transfer',e.target.value)} />
                </td>
                <td className="p-2 text-right">
                  <input className="w-full text-right bg-neutral-800 border border-neutral-700 rounded px-2 py-1" value={r.cash} onChange={e=>updateRow(r.id,'cash',e.target.value)} />
                </td>
                <td className="p-2 text-right">
                  <button onClick={()=>deleteRow(r.id)} className="text-red-400 hover:text-red-300">Delete</button>
                </td>
              </tr>
            ))}
            <tr className="border-t border-neutral-800">
              <td className="p-2">
                <input className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1" placeholder="e.g., Nike Air Max" value={newRow.name} onChange={e=>setNewRow({...newRow,name:e.target.value})} />
              </td>
              <td className="p-2 text-right">
                <input className="w-full text-right bg-neutral-800 border border-neutral-700 rounded px-2 py-1" placeholder="0" value={newRow.qris} onChange={e=>setNewRow({...newRow,qris:e.target.value})} />
              </td>
              <td className="p-2 text-right">
                <input className="w-full text-right bg-neutral-800 border border-neutral-700 rounded px-2 py-1" placeholder="0" value={newRow.transfer} onChange={e=>setNewRow({...newRow,transfer:e.target.value})} />
              </td>
              <td className="p-2 text-right">
                <input className="w-full text-right bg-neutral-800 border border-neutral-700 rounded px-2 py-1" placeholder="0" value={newRow.cash} onChange={e=>setNewRow({...newRow,cash:e.target.value})} />
              </td>
              <td className="p-2 text-right">
                <button onClick={addRow} className="bg-orange-600 hover:bg-orange-500 text-white px-3 py-1 rounded-lg">Add</button>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="border-t border-neutral-800 text-neutral-300">
              <td className="p-2 font-medium">Totals</td>
              <td className="p-2 text-right">{currency(totals.qris)}</td>
              <td className="p-2 text-right">{currency(totals.transfer)}</td>
              <td className="p-2 text-right">{currency(totals.cash)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function ExpenseTable({ cashTotal, rows, setRows }) {
  const [newRow, setNewRow] = useState({ name: '', amount: '' });

  const totalExpenses = useMemo(() => rows.reduce((a, r) => a + Number(r.amount || 0), 0), [rows]);
  const remainingCash = Math.max(0, Number(cashTotal || 0) - totalExpenses);

  const addRow = () => {
    if (!newRow.name) return;
    setRows([...rows, { ...newRow, id: Date.now() }]);
    setNewRow({ name: '', amount: '' });
  };

  const exportCSV = () => {
    const header = ['Expense','Amount'];
    const body = rows.map(r => [r.name, r.amount]);
    const csv = [header, ...body].map(line => line.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Expenses.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const updateRow = (id, key, value) => {
    setRows(rows.map(r => r.id === id ? { ...r, [key]: value } : r));
  };

  const deleteRow = (id) => setRows(rows.filter(r => r.id !== id));

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-orange-400">Expenses (auto deducts Cash)</h3>
        <button onClick={exportCSV} className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 rounded-lg px-3 py-1">
          <Download size={16}/> Export CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-neutral-200">
          <thead>
            <tr className="text-neutral-400">
              <th className="text-left p-2">Name</th>
              <th className="text-right p-2">Amount</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-t border-neutral-800">
                <td className="p-2">
                  <input className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1" value={r.name} onChange={e=>updateRow(r.id,'name',e.target.value)} />
                </td>
                <td className="p-2 text-right">
                  <input className="w-full text-right bg-neutral-800 border border-neutral-700 rounded px-2 py-1" value={r.amount} onChange={e=>updateRow(r.id,'amount',e.target.value)} />
                </td>
                <td className="p-2 text-right">
                  <button onClick={()=>deleteRow(r.id)} className="text-red-400 hover:text-red-300">Delete</button>
                </td>
              </tr>
            ))}
            <tr className="border-t border-neutral-800">
              <td className="p-2">
                <input className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1" placeholder="e.g., Packaging" value={newRow.name} onChange={e=>setNewRow({...newRow,name:e.target.value})} />
              </td>
              <td className="p-2 text-right">
                <input className="w-full text-right bg-neutral-800 border border-neutral-700 rounded px-2 py-1" placeholder="0" value={newRow.amount} onChange={e=>setNewRow({...newRow,amount:e.target.value})} />
              </td>
              <td className="p-2 text-right">
                <button onClick={addRow} className="bg-orange-600 hover:bg-orange-500 text-white px-3 py-1 rounded-lg">Add</button>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="border-t border-neutral-800 text-neutral-300">
              <td className="p-2 font-medium">Total Expenses</td>
              <td className="p-2 text-right">{currency(totalExpenses)}</td>
              <td></td>
            </tr>
            <tr className="text-neutral-300">
              <td className="p-2 font-medium">Remaining Cash after Expenses</td>
              <td className="p-2 text-right">{currency(remainingCash)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export function SummaryTables({ salesRows, setSalesRows, expenseRows, setExpenseRows }) {
  const cashTotal = useMemo(() => salesRows.reduce((a, r) => a + Number(r.cash || 0), 0), [salesRows]);

  useEffect(() => {
    localStorage.setItem('ws_sales', JSON.stringify(salesRows));
  }, [salesRows]);
  useEffect(() => {
    localStorage.setItem('ws_expenses', JSON.stringify(expenseRows));
  }, [expenseRows]);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <EditableTable title="Sales" rows={salesRows} setRows={setSalesRows} templatesKey="ws_item_templates" />
      <ExpenseTable cashTotal={cashTotal} rows={expenseRows} setRows={setExpenseRows} />
    </div>
  );
}
