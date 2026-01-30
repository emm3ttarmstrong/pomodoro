"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";

interface Project {
  id: string;
  name: string;
  client: { id: string; name: string };
}

interface Entry {
  id: string;
  description: string | null;
  startTime: string | null;
  endTime: string | null;
  duration: number;
  invoiced: boolean;
  createdAt: string;
  projectId: string | null;
}

interface EditEntryModalProps {
  entry: Entry;
  onClose: () => void;
  onSave: () => void;
}

export function EditEntryModal({ entry, onClose, onSave }: EditEntryModalProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState(entry.projectId || "");
  const [description, setDescription] = useState(entry.description || "");
  const [duration, setDuration] = useState(entry.duration);
  const [invoiced, setInvoiced] = useState(entry.invoiced);
  const [date, setDate] = useState(
    entry.createdAt ? format(new Date(entry.createdAt), "yyyy-MM-dd") : ""
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => setProjects(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/entries/${entry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: projectId || null,
          description: description || null,
          duration,
          invoiced,
        }),
      });

      if (res.ok) {
        onSave();
        onClose();
      }
    } catch (err) {
      console.error("Failed to update entry:", err);
    } finally {
      setSaving(false);
    }
  };

  // Convert duration to hours and minutes for display
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#2a2a2a] rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium text-white mb-4">Edit Time Entry</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Project</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500"
            >
              <option value="">No project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.client.name} / {project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What did you work on?"
              className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Date</label>
            <input
              type="date"
              value={date}
              disabled
              className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500 opacity-50"
            />
            <p className="text-xs text-gray-500 mt-1">Date cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Duration</label>
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="number"
                  min={0}
                  value={hours}
                  onChange={(e) => {
                    const h = parseInt(e.target.value) || 0;
                    setDuration(h * 60 + minutes);
                  }}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500"
                />
                <p className="text-xs text-gray-500 mt-1">Hours</p>
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={minutes}
                  onChange={(e) => {
                    const m = parseInt(e.target.value) || 0;
                    setDuration(hours * 60 + m);
                  }}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500"
                />
                <p className="text-xs text-gray-500 mt-1">Minutes</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="invoiced"
              checked={invoiced}
              onChange={(e) => setInvoiced(e.target.checked)}
              className="w-4 h-4 rounded border-gray-700 bg-[#1a1a1a] text-teal-500 focus:ring-teal-500"
            />
            <label htmlFor="invoiced" className="text-sm text-gray-300">
              Mark as invoiced
            </label>
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || duration < 1}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-500/50 text-white rounded-lg transition-colors"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
