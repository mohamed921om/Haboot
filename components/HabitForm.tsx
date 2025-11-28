import React, { useState, useEffect } from 'react';
import { Habit, RepeatType, Weekday, WEEKDAYS, COLORS } from '../types';
import { generateId } from '../utils';
import { Button, Input, Label } from './ui';
import { Check } from 'lucide-react';

interface HabitFormProps {
  initialData?: Habit;
  onSave: (habit: Habit) => void;
  onCancel: () => void;
}

export const HabitForm: React.FC<HabitFormProps> = ({ initialData, onSave, onCancel }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [points, setPoints] = useState(initialData?.points?.toString() || '1');
  const [color, setColor] = useState(initialData?.color || COLORS[0]);
  const [repeatType, setRepeatType] = useState<RepeatType>(initialData?.repeatType || 'daily');
  const [repeatGoal, setRepeatGoal] = useState(initialData?.repeatGoal?.toString() || '1');
  const [repeatDays, setRepeatDays] = useState<Weekday[]>(initialData?.repeatDays || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newHabit: Habit = {
      id: initialData?.id || generateId(),
      name,
      description,
      points: parseFloat(points) || 0,
      color,
      repeatType,
      repeatGoal: parseInt(repeatGoal) || 1,
      repeatDays,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      archived: initialData?.archived || false,
    };

    onSave(newHabit);
  };

  const toggleDay = (day: Weekday) => {
    if (repeatDays.includes(day)) {
      setRepeatDays(repeatDays.filter(d => d !== day));
    } else {
      setRepeatDays([...repeatDays, day]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Habit Name</Label>
        <Input
          id="name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Read 30 mins"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="desc">Notes (Optional)</Label>
        <Input
          id="desc"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Motivation or details..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="points">Points per completion</Label>
          <Input
            id="points"
            type="number"
            min="0"
            step="0.1"
            value={points}
            onChange={e => setPoints(e.target.value)}
          />
        </div>
        <div className="space-y-2">
           <Label>Color</Label>
           <div className="flex flex-wrap gap-2">
             {COLORS.map(c => (
               <button
                 key={c}
                 type="button"
                 onClick={() => setColor(c)}
                 className={`w-6 h-6 rounded-full transition-transform hover:scale-110 focus:outline-none ring-2 ring-offset-2 dark:ring-offset-slate-900 ${color === c ? 'ring-slate-400 scale-110' : 'ring-transparent'}`}
                 style={{ backgroundColor: c }}
               />
             ))}
           </div>
        </div>
      </div>

      <div className="space-y-2 border-t pt-4 border-slate-100 dark:border-slate-800">
        <Label>Repeat Pattern</Label>
        <div className="grid grid-cols-3 gap-2">
          {(['daily', 'weekly', 'specific_days'] as RepeatType[]).map(type => (
            <Button
              key={type}
              type="button"
              variant={repeatType === type ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setRepeatType(type)}
              className="capitalize"
            >
              {type.replace('_', ' ')}
            </Button>
          ))}
        </div>
      </div>

      {repeatType === 'weekly' && (
         <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
           <Label>Target times per week</Label>
           <Input
             type="number"
             min="1"
             max="7"
             value={repeatGoal}
             onChange={e => setRepeatGoal(e.target.value)}
           />
         </div>
      )}

      {repeatType === 'specific_days' && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
          <Label>Select Days</Label>
          <div className="flex justify-between">
            {WEEKDAYS.map(day => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`w-9 h-9 rounded-full text-xs font-medium flex items-center justify-center transition-colors ${
                  repeatDays.includes(day)
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {day[0]}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Habit</Button>
      </div>
    </form>
  );
};