import React, { useRef } from 'react';
import { AppData } from '../types';
import { Button, Card } from '../components/ui';
import { Download, Upload, Trash2, RefreshCw, Moon, Sun } from 'lucide-react';

interface SettingsProps {
  data: AppData;
  onImport: (data: AppData) => void;
  onReset: () => void;
  onClear: () => void;
  onToggleTheme: () => void;
}

export const SettingsView: React.FC<SettingsProps> = ({ data, onImport, onReset, onClear, onToggleTheme }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `habitpulse_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        // Basic validation
        if (Array.isArray(importedData.habits) && Array.isArray(importedData.logs)) {
          onImport(importedData);
          alert('Data imported successfully!');
        } else {
          alert('Invalid file format.');
        }
      } catch (err) {
        alert('Failed to parse JSON.');
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h2>

      <Card className="p-6 space-y-6">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Appearance</h3>
        <div className="flex items-center justify-between">
           <span>Dark Mode</span>
           <Button variant="outline" size="sm" onClick={onToggleTheme}>
             {data.theme === 'dark' ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
             Toggle Theme
           </Button>
        </div>
      </Card>

      <Card className="p-6 space-y-6">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Data Management</h3>
        
        <div className="grid gap-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
             <div className="flex items-center gap-3">
               <Download className="text-brand-600" />
               <div>
                 <div className="font-medium">Export Data</div>
                 <div className="text-xs text-slate-500">Save your progress to a JSON file</div>
               </div>
             </div>
             <Button variant="secondary" onClick={handleExport}>Export</Button>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
             <div className="flex items-center gap-3">
               <Upload className="text-brand-600" />
               <div>
                 <div className="font-medium">Import Data</div>
                 <div className="text-xs text-slate-500">Restore from a backup</div>
               </div>
             </div>
             <input 
               type="file" 
               ref={fileInputRef} 
               onChange={handleFileChange} 
               className="hidden" 
               accept=".json" 
             />
             <Button variant="secondary" onClick={handleImportClick}>Import</Button>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
           <h4 className="text-sm font-semibold text-rose-600 mb-4">Danger Zone</h4>
           <div className="flex flex-col gap-3">
              <Button variant="outline" className="justify-start text-slate-600" onClick={onReset}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset to Demo Data
              </Button>
              <Button variant="danger" className="justify-start" onClick={() => { if(confirm('Are you sure? This deletes everything.')) onClear() }}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Data
              </Button>
           </div>
        </div>
      </Card>
      
      <div className="text-center text-xs text-slate-400">
        <p>HabitPulse v1.0.0 • Offline Capable</p>
      </div>
    </div>
  );
};