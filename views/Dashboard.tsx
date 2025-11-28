import React, { useMemo } from 'react';
import { AppData, Habit, HabitLog } from '../types';
import { Button, Card, Badge } from '../components/ui';
import { isHabitDueOnDate, getTodayDateString } from '../utils';
import { Check, Plus, Minus, Trophy, Calendar } from 'lucide-react';

interface DashboardProps {
  data: AppData;
  onUpdateLog: (log: HabitLog) => void;
  onAddHabit: () => void;
}

export const DashboardView: React.FC<DashboardProps> = ({ data, onUpdateLog, onAddHabit }) => {
  const today = getTodayDateString();
  const dateObj = new Date();

  // Filter active habits
  const activeHabits = useMemo(() => data.habits.filter(h => !h.archived), [data.habits]);
  
  // Get logs for today
  const todaysLogs = useMemo(() => 
    data.logs.filter(l => l.date === today), 
    [data.logs, today]
  );

  const getHabitLog = (habitId: string) => todaysLogs.find(l => l.habitId === habitId);

  const handleIncrement = (habit: Habit) => {
    const log = getHabitLog(habit.id);
    const currentCount = log?.count || 0;
    onUpdateLog({
      id: log?.id || '', // id will be generated in App.tsx if empty
      habitId: habit.id,
      date: today,
      count: currentCount + 1
    });
  };

  const handleDecrement = (habit: Habit) => {
    const log = getHabitLog(habit.id);
    if (!log || log.count <= 0) return;
    onUpdateLog({
      ...log,
      count: log.count - 1
    });
  };

  const handleToggle = (habit: Habit) => {
    const log = getHabitLog(habit.id);
    const isDone = (log?.count || 0) > 0;
    onUpdateLog({
      id: log?.id || '',
      habitId: habit.id,
      date: today,
      count: isDone ? 0 : 1
    });
  };

  // Metrics
  const totalPoints = todaysLogs.reduce((sum, log) => {
    const habit = data.habits.find(h => h.id === log.habitId);
    return sum + (log.count * (habit?.points || 0));
  }, 0);

  // Approximate max daily points (simplified: assuming 1 completion for daily/specific, average for weekly)
  const maxPoints = activeHabits.reduce((sum, h) => {
    if (isHabitDueOnDate(h, today)) return sum + h.points;
    return sum;
  }, 0);

  const progress = maxPoints > 0 ? Math.min(100, Math.round((totalPoints / maxPoints) * 100)) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Hello, Achiever! <span className="text-2xl">👋</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
            <Calendar className="w-4 h-4" />
            {dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
           <div className="text-center px-2">
             <div className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Points</div>
             <div className="text-2xl font-bold text-brand-600">{Math.round(totalPoints * 10) / 10}</div>
           </div>
           <div className="w-px h-10 bg-slate-200 dark:bg-slate-800"></div>
           <div className="text-center px-2">
             <div className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Progress</div>
             <div className="text-2xl font-bold text-emerald-500">{progress}%</div>
           </div>
        </div>
      </div>

      {/* Habits List */}
      <div className="grid gap-4">
        {activeHabits.length === 0 ? (
           <div className="text-center py-20 bg-slate-100 dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700">
             <Trophy className="w-12 h-12 text-slate-400 mx-auto mb-4" />
             <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">No habits yet</h3>
             <p className="text-slate-500 mb-6">Start your journey by adding a new habit.</p>
             <Button onClick={onAddHabit}>Create First Habit</Button>
           </div>
        ) : (
          activeHabits.map(habit => {
            const log = getHabitLog(habit.id);
            const count = log?.count || 0;
            const isDue = isHabitDueOnDate(habit, today);
            
            // Should we show a toggle or counter? 
            // If repeatGoal > 1 (daily) or it's a generic accumulation, use counter.
            // For simple "daily" check, use toggle.
            // Simplified logic: If repeatType is daily and repeatGoal > 1, counter. Else toggle.
            const showCounter = habit.repeatGoal > 1 || habit.repeatType === 'weekly'; 

            return (
              <Card key={habit.id} className={`p-4 transition-all duration-300 ${isDue ? 'ring-1 ring-slate-200 dark:ring-slate-800' : 'opacity-70 grayscale-[0.5]'}`}>
                <div className="flex items-center justify-between">
                  
                  {/* Info */}
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-md transition-transform hover:scale-105"
                      style={{ backgroundColor: habit.color }}
                    >
                      {habit.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">{habit.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                         <Badge color={habit.color}>{habit.points} pts</Badge>
                         <span>•</span>
                         <span>{habit.description || (isDue ? 'Due today' : 'Not due today')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    {showCounter ? (
                      <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                         <button 
                           onClick={() => handleDecrement(habit)}
                           className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
                         >
                           <Minus className="w-4 h-4" />
                         </button>
                         <span className="w-8 text-center font-bold text-slate-900 dark:text-white">{count}</span>
                         <button 
                           onClick={() => handleIncrement(habit)}
                           className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-brand-600"
                         >
                           <Plus className="w-4 h-4" />
                         </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleToggle(habit)}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
                          count > 0 
                            ? 'bg-emerald-500 text-white scale-110 ring-4 ring-emerald-100 dark:ring-emerald-900' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        <Check className="w-6 h-6" strokeWidth={3} />
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};