"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";

interface Project {
  id: string;
  name: string;
  client: { id: string; name: string };
}

interface EntryFormProps {
  onSuccess: () => void;
  onCancel?: () => void;
}

export function EntryForm({ onSuccess, onCancel }: EntryFormProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [useTimeRange, setUseTimeRange] = useState(true);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => setProjects(data))
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const body: Record<string, unknown> = {
        projectId: projectId || null,
        description: description || null,
        invoiced: false,
      };

      if (useTimeRange) {
        body.startTime = new Date(`${date}T${startTime}`).toISOString();
        body.endTime = new Date(`${date}T${endTime}`).toISOString();
      } else {
        body.duration = durationMinutes;
      }

      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        // Reset form
        setProjectId("");
        setDescription("");
        setDate(format(new Date(), "yyyy-MM-dd"));
        setStartTime("09:00");
        setEndTime("10:00");
        setDurationMinutes(60);
        onSuccess();
      }
    } catch (err) {
      console.error("Failed to create entry:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#2a2a2a] rounded-lg p-4 space-y-4">
      <h3 className="text-lg font-medium text-white">Add Manual Entry</h3>

      <div className="grid grid-cols-2 gap-4">
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
          <label className="block text-sm text-gray-400 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500"
          />
        </div>
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

      {/* Toggle between time range and duration */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setUseTimeRange(true)}
          className={`px-3 py-1 rounded text-sm transition-colors ${
            useTimeRange
              ? "bg-teal-500/20 text-teal-400 border border-teal-500"
              : "bg-[#1a1a1a] text-gray-400 border border-gray-700"
          }`}
        >
          Time Range
        </button>
        <button
          type="button"
          onClick={() => setUseTimeRange(false)}
          className={`px-3 py-1 rounded text-sm transition-colors ${
            !useTimeRange
              ? "bg-teal-500/20 text-teal-400 border border-teal-500"
              : "bg-[#1a1a1a] text-gray-400 border border-gray-700"
          }`}
        >
          Duration Only
        </button>
      </div>

      {useTimeRange ? (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>
      ) : (
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Duration (minutes)
          </label>
          <input
            type="number"
            min={1}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500"
          />
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-500/50 text-white rounded-lg transition-colors"
        >
          {submitting ? "Adding..." : "Add Entry"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
