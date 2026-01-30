"use client";

import { useEffect, useState } from "react";
import { useTimerStore } from "@/stores/timerStore";

export default function SettingsPage() {
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const timerStore = useTimerStore();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      setWorkDuration(data.workDuration);
      setBreakDuration(data.breakDuration);
      // Also update the timer store
      timerStore.setWorkDuration(data.workDuration);
      timerStore.setBreakDuration(data.breakDuration);
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workDuration, breakDuration }),
      });

      if (res.ok) {
        // Update the timer store
        timerStore.setWorkDuration(workDuration);
        timerStore.setBreakDuration(breakDuration);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md">
      <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

      <div className="bg-[#2a2a2a] rounded-lg p-6 space-y-6">
        <h2 className="text-lg font-medium text-white">Pomodoro Timer</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Work Duration (minutes)
            </label>
            <input
              type="number"
              min={1}
              max={120}
              value={workDuration}
              onChange={(e) => setWorkDuration(parseInt(e.target.value) || 25)}
              className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Standard pomodoro is 25 minutes
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Break Duration (minutes)
            </label>
            <input
              type="number"
              min={1}
              max={60}
              value={breakDuration}
              onChange={(e) => setBreakDuration(parseInt(e.target.value) || 5)}
              className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Standard break is 5 minutes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-gray-700">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-500/50 text-white rounded-lg transition-colors"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {saved && (
            <span className="text-teal-400 text-sm">Settings saved!</span>
          )}
        </div>
      </div>

      {/* Quick presets */}
      <div className="mt-6 bg-[#2a2a2a] rounded-lg p-6">
        <h2 className="text-lg font-medium text-white mb-4">Quick Presets</h2>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => {
              setWorkDuration(25);
              setBreakDuration(5);
            }}
            className="px-3 py-2 bg-[#1a1a1a] hover:bg-[#333] border border-gray-700 rounded-lg text-gray-300 text-sm transition-colors"
          >
            25/5 (Classic)
          </button>
          <button
            onClick={() => {
              setWorkDuration(50);
              setBreakDuration(10);
            }}
            className="px-3 py-2 bg-[#1a1a1a] hover:bg-[#333] border border-gray-700 rounded-lg text-gray-300 text-sm transition-colors"
          >
            50/10 (Long)
          </button>
          <button
            onClick={() => {
              setWorkDuration(15);
              setBreakDuration(3);
            }}
            className="px-3 py-2 bg-[#1a1a1a] hover:bg-[#333] border border-gray-700 rounded-lg text-gray-300 text-sm transition-colors"
          >
            15/3 (Short)
          </button>
        </div>
      </div>
    </div>
  );
}
