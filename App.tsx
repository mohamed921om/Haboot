import React, { useState, useEffect } from 'react';
import { AppData, Habit, HabitLog } from './types';
import { loadFromStorage, saveToStorage, generateDemoData, generateId } from './utils';
import { DashboardView } from './views/Dashboard';
import { AnalyticsView } from './views/Analytics';
import { SettingsView } from './views/Settings';
import { HabitForm } from './components/HabitForm';
import { Modal, Button, Card, Badge } from './components/ui';
import { LayoutDashboard, BarChart2, Settings, Plus, List, Trash2, Edit2 } from 'lucide-react';

type View = 'dashboard' | 'habits' | 'analytics' | 'settings';

const App = () => {
  const [data, setData] = useState<AppData | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>(undefined);

  // Initialize
  useEffect(() => {
    const saved = loadFromStorage();
    if (saved) {
      setData(saved);
    } else {
      setData(generateDemoData());
    }
  }, []);

  // Save on change
  useEffect(() => {
    if (data) {
      saveToStorage(data);
      // Apply theme
      if (data.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [data]);

  // Handlers
  const handleUpdateLog = (log: HabitLog) => {
    if (!data) return;
    
    // Check if log exists
    const existingIndex = data.logs.findIndex(l => l.habitId === log.habitId && l.date === log.date);
    
    let newLogs = [...data.logs];
    if (existingIndex >= 0) {
      if (log.count <= 0) {
        // Remove if count is 0
        newLogs.splice(existingIndex, 1);
      } else {
        newLogs[existingIndex] = log;
      }
    } else if (log.count > 0) {
      newLogs.push({ ...log, id: generateId() });
    }

    setData({ ...data, logs: newLogs });
  };

  const handleSaveHabit = (habit: Habit) => {
    if (!data) return;
    
    const isEdit = data.habits.some(h => h.id === habit.id);
    let newHabits = [...data.habits];
    
    if (isEdit) {
      newHabits = newHabits.map(h => h.id === habit.id ? habit : h);
    } else {
      newHabits.push(habit);
    }
    
    setData({ ...data, habits: newHabits });
    setIsModalOpen(false);
    setEditingHabit(undefined);
  };

  const handleDeleteHabit = (id: string) => {
    if (!data || !confirm('Delete this habit?')) return;
    setData({
      ...data,
      habits: data.habits.filter(h => h.id !== id),
      // Optional: Clean up logs for this habit? Let's keep them for now or delete? 
      // Usually better to keep logs for historic stats or archive. We will just delete ref.
    });
  };

  const openAddModal = () => {
    setEditingHabit(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (habit: Habit) => {
    setEditingHabit(habit);
    setIsModalOpen(true);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if input focused
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key.toLowerCase() === 'a') openAddModal();
      if (e.key.toLowerCase() === 'd') setCurrentView('dashboard');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!data) return <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950 text-slate-500">Loading...</div>;

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pl-64 transition-all">
      {/* Sidebar Navigation (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 z-20">
        <div className="p-6">
           <h1 className="text-2xl font-black bg-gradient-to-r from-brand-600 to-emerald-500 bg-clip-text text-transparent">HabitPulse</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
           {[
             { id: 'dashboard', label: 'Today', icon: LayoutDashboard },
             { id: 'habits', label: 'Manage Habits', icon: List },
             { id: 'analytics', label: 'Analytics', icon: BarChart2 },
             { id: 'settings', label: 'Settings', icon: Settings },
           ].map(item => (
             <button
               key={item.id}
               onClick={() => setCurrentView(item.id as View)}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                 currentView === item.id 
                   ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400' 
                   : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
               }`}
             >
               <item.icon className="w-5 h-5" />
               {item.label}
             </button>
           ))}
        </nav>
        <div className="p-4">
          <Button onClick={openAddModal} className="w-full shadow-lg shadow-brand-500/20">
            <Plus className="w-4 h-4 mr-2" /> New Habit
          </Button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-50 flex justify-around p-2 pb-safe">
        {[
          { id: 'dashboard', icon: LayoutDashboard },
          { id: 'habits', icon: List },
          { id: 'add', icon: Plus, highlight: true },
          { id: 'analytics', icon: BarChart2 },
          { id: 'settings', icon: Settings },
        ].map(item => (
          item.id === 'add' ? (
            <button key={item.id} onClick={openAddModal} className="bg-brand-600 text-white p-3 rounded-full -mt-6 shadow-lg shadow-brand-600/30">
              <Plus className="w-6 h-6" />
            </button>
          ) : (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as View)}
              className={`p-2 rounded-lg ${currentView === item.id ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`}
            >
              <item.icon className="w-6 h-6" />
            </button>
          )
        ))}
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-4 md:p-8 pt-8 md:pt-8">
        {currentView === 'dashboard' && (
          <DashboardView 
            data={data} 
            onUpdateLog={handleUpdateLog}
            onAddHabit={openAddModal}
          />
        )}
        
        {currentView === 'habits' && (
          <div className="space-y-6 animate-in fade-in">
             <div className="flex justify-between items-center">
               <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your Habits</h2>
               <Button onClick={openAddModal} className="hidden md:flex"><Plus className="w-4 h-4 mr-2"/> Add Habit</Button>
             </div>
             <div className="grid gap-4">
               {data.habits.map(habit => (
                 <Card key={habit.id} className="p-4 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: habit.color }}>
                          {habit.name[0]}
                       </div>
                       <div>
                         <h3 className="font-semibold">{habit.name}</h3>
                         <div className="text-sm text-slate-500 flex gap-2">
                            <Badge color={habit.color}>{habit.repeatType.replace('_', ' ')}</Badge>
                            <span>{habit.points} pts</span>
                         </div>
                       </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => openEditModal(habit)}>
                        <Edit2 className="w-4 h-4 text-slate-500" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteHabit(habit.id)}>
                        <Trash2 className="w-4 h-4 text-rose-500" />
                      </Button>
                    </div>
                 </Card>
               ))}
             </div>
          </div>
        )}

        {currentView === 'analytics' && <AnalyticsView data={data} />}
        
        {currentView === 'settings' && (
          <SettingsView 
            data={data}
            onImport={(newData) => setData(newData)}
            onReset={() => setData(generateDemoData())}
            onClear={() => setData({ habits: [], logs: [], theme: 'light' })}
            onToggleTheme={() => setData({ ...data, theme: data.theme === 'dark' ? 'light' : 'dark' })}
          />
        )}
      </main>

      {/* Modals */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingHabit ? 'Edit Habit' : 'Create New Habit'}
      >
        <HabitForm 
          initialData={editingHabit} 
          onSave={handleSaveHabit} 
          onCancel={() => setIsModalOpen(false)} 
        />
      </Modal>

    </div>
  );
};

export default App;