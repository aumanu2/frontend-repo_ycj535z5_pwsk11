import React, { useEffect, useMemo, useState } from 'react'
import LoginForm from './components/LoginForm'
import StatsHeader from './components/StatsHeader'
import { SummaryTables } from './components/SummaryTables'
import SalesChart from './components/SalesChart'
import { LogOut } from 'lucide-react'

function App() {
  const [user, setUser] = useState(() => (localStorage.getItem('ws_logged_in') ? { username: 'admin' } : null));

  const [salesRows, setSalesRows] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ws_sales') || '[]'); } catch { return []; }
  });
  const [expenseRows, setExpenseRows] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ws_expenses') || '[]'); } catch { return []; }
  });

  const logout = () => {
    localStorage.removeItem('ws_logged_in');
    setUser(null);
  };

  if (!user) return <LoginForm onLogin={setUser} />;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="sticky top-0 z-10 backdrop-blur border-b border-neutral-800 bg-neutral-950/70">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-orange-500">Warrior Second</h1>
            <p className="text-xs text-neutral-400">Monthly Summary Dashboard</p>
          </div>
          <button onClick={logout} className="flex items-center gap-2 text-neutral-300 hover:text-white">
            <LogOut size={18}/> Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <StatsHeader salesRows={salesRows} expenseRows={expenseRows} />
        <SalesChart salesRows={salesRows} />
        <SummaryTables
          salesRows={salesRows}
          setSalesRows={setSalesRows}
          expenseRows={expenseRows}
          setExpenseRows={setExpenseRows}
        />
      </main>

      <footer className="border-t border-neutral-800 py-6 text-center text-neutral-400 text-sm">
        © {new Date().getFullYear()} Warrior Second — Built for speed and clarity.
      </footer>
    </div>
  )
}

export default App
