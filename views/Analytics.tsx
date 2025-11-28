import React, { useMemo, useState } from 'react';
import { AppData, Habit, COLORS } from '../types';
import { Card, Button, Input } from '../components/ui';
import { getDatesInRange, formatDate } from '../utils';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Filter, Calendar as CalIcon } from 'lucide-react';

interface AnalyticsProps {
  data: AppData;
}

// --- Heatmap Component ---
const Heatmap = ({ logs, habits }: { logs: AppData['logs'], habits: Habit[] }) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 90); // Last 90 days

  const dates = getDatesInRange(startDate, endDate);
  
  // Create a grid of weeks
  // We need to group dates by week
  // Simple approach: Just a flex grid of 7 rows (days) is easiest for horizontal scroll
  // Or standard GitHub style: Columns are weeks.
  
  // Let's do columns = weeks.
  const weeks: { date: string, points: number }[][] = [];
  let currentWeek: { date: string, points: number }[] = [];
  
  // Pad the start to align with Sunday
  const startDay = new Date(dates[0]).getDay();
  for(let i=0; i<startDay; i++) {
     currentWeek.push({ date: 'padding-' + i, points: -1 });
  }

  dates.forEach(date => {
    const dayLogs = logs.filter(l => l.date === date);
    const points = dayLogs.reduce((sum, log) => {
      const habit = habits.find(h => h.id === log.habitId);
      return sum + (log.count * (habit?.points || 0));
    }, 0);
    
    currentWeek.push({ date, points });
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  if(currentWeek.length > 0) weeks.push(currentWeek);

  const maxPoints = Math.max(...weeks.flat().map(d => d.points), 10);

  const getColor = (points: number) => {
    if (points === -1) return 'transparent'; // padding
    if (points === 0) return 'rgb(241 245 249)'; // slate-100
    const intensity = Math.min(1, points / (maxPoints * 0.6)); // Scale a bit faster
    // Mixing white to brand color (Emerald-500 #10b981)
    // Simple logic: opacity
    return `rgba(16, 185, 129, ${0.1 + intensity * 0.9})`; 
  };

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-1 min-w-max">
        {weeks.map((week, wIdx) => (
          <div key={wIdx} className="flex flex-col gap-1">
            {week.map((day, dIdx) => (
              <div
                key={day.date}
                className="w-3 h-3 rounded-[2px]"
                style={{ backgroundColor: getColor(day.points) }}
                title={day.points >= 0 ? `${day.date}: ${day.points} pts` : ''}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
        <span>Less</span>
        <div className="w-3 h-3 bg-slate-100 rounded-[2px]" />
        <div className="w-3 h-3 bg-emerald-500/20 rounded-[2px]" />
        <div className="w-3 h-3 bg-emerald-500/60 rounded-[2px]" />
        <div className="w-3 h-3 bg-emerald-500 rounded-[2px]" />
        <span>More</span>
      </div>
    </div>
  );
};


export const AnalyticsView: React.FC<AnalyticsProps> = ({ data }) => {
  const [daysRange, setDaysRange] = useState(30);
  const [selectedHabitId, setSelectedHabitId] = useState<string>('all');

  // Process Data
  const chartData = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - daysRange);
    const dates = getDatesInRange(start, end);

    return dates.map(date => {
      const dayLogs = data.logs.filter(l => l.date === date);
      
      const filteredLogs = selectedHabitId === 'all' 
        ? dayLogs 
        : dayLogs.filter(l => l.habitId === selectedHabitId);

      const points = filteredLogs.reduce((sum, log) => {
        const h = data.habits.find(hab => hab.id === log.habitId);
        return sum + (log.count * (h?.points || 0));
      }, 0);

      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        points
      };
    });
  }, [data, daysRange, selectedHabitId]);

  const pieData = useMemo(() => {
    const map = new Map<string, number>();
    data.logs.forEach(log => {
        // Filter by time range roughly (for simple pie, let's just do all time in range)
        // Optimization: In real app, apply date filter here too.
        if (selectedHabitId !== 'all' && log.habitId !== selectedHabitId) return;
        
        const h = data.habits.find(hab => hab.id === log.habitId);
        if (h) {
          const pts = log.count * h.points;
          map.set(h.name, (map.get(h.name) || 0) + pts);
        }
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [data, selectedHabitId]); // simplified dep

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h2>
        
        <div className="flex flex-wrap gap-2">
           <select 
             className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
             value={daysRange}
             onChange={(e) => setDaysRange(Number(e.target.value))}
           >
             <option value={7}>Last 7 Days</option>
             <option value={30}>Last 30 Days</option>
             <option value={90}>Last 3 Months</option>
           </select>
           
           <select 
             className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
             value={selectedHabitId}
             onChange={(e) => setSelectedHabitId(e.target.value)}
           >
             <option value="all">All Habits</option>
             {data.habits.map(h => (
               <option key={h.id} value={h.id}>{h.name}</option>
             ))}
           </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 md:col-span-2">
          <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">Consistency Heatmap (Last 90 Days)</h3>
          <Heatmap logs={data.logs} habits={data.habits} />
        </Card>

        <Card className="p-6">
           <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">Points Trend</h3>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={chartData}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                 <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                 <YAxis stroke="#94a3b8" fontSize={12} />
                 <Tooltip 
                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                 />
                 <Line type="monotone" dataKey="points" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
               </LineChart>
             </ResponsiveContainer>
           </div>
        </Card>

        <Card className="p-6">
           <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">Points Distribution</h3>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={pieData}
                   cx="50%"
                   cy="50%"
                   innerRadius={60}
                   outerRadius={80}
                   paddingAngle={5}
                   dataKey="value"
                 >
                   {pieData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                 </Pie>
                 <Tooltip />
                 <Legend />
               </PieChart>
             </ResponsiveContainer>
           </div>
        </Card>
      </div>
    </div>
  );
};