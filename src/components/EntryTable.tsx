"use client";

import { useState } from "react";
import { format } from "date-fns";
import { formatDuration } from "@/lib/utils";
import { EditEntryModal } from "./EditEntryModal";

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
  project: Project | null;
  projectId: string | null;
}

interface EntryTableProps {
  entries: Entry[];
  onToggleInvoiced: (id: string, invoiced: boolean) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

export function EntryTable({
  entries,
  onToggleInvoiced,
  onDelete,
  onRefresh,
}: EntryTableProps) {
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>No time entries yet.</p>
        <p className="text-sm mt-1">
          Start a timer or add a manual entry to get started.
        </p>
      </div>
    );
  }

  // Calculate totals
  const totalMinutes = entries.reduce((sum, e) => sum + e.duration, 0);
  const invoicedMinutes = entries
    .filter((e) => e.invoiced)
    .reduce((sum, e) => sum + e.duration, 0);

  return (
    <div>
      {/* Summary */}
      <div className="flex gap-6 mb-4 text-sm">
        <div>
          <span className="text-gray-400">Total: </span>
          <span className="text-white font-medium">
            {formatDuration(totalMinutes)}
          </span>
        </div>
        <div>
          <span className="text-gray-400">Invoiced: </span>
          <span className="text-teal-400 font-medium">
            {formatDuration(invoicedMinutes)}
          </span>
        </div>
        <div>
          <span className="text-gray-400">Uninvoiced: </span>
          <span className="text-yellow-400 font-medium">
            {formatDuration(totalMinutes - invoicedMinutes)}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#2a2a2a] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">
                Date
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">
                Client / Project
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">
                Description
              </th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-400">
                Duration
              </th>
              <th className="text-center px-4 py-3 text-sm font-medium text-gray-400">
                Invoiced
              </th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr
                key={entry.id}
                className="border-b border-gray-700/50 hover:bg-[#333] group"
              >
                <td className="px-4 py-3 text-gray-300">
                  {format(new Date(entry.createdAt), "MMM d, yyyy")}
                </td>
                <td className="px-4 py-3">
                  {entry.project ? (
                    <div>
                      <span className="text-gray-400">
                        {entry.project.client.name}
                      </span>
                      <span className="text-gray-600"> / </span>
                      <span className="text-white">{entry.project.name}</span>
                    </div>
                  ) : (
                    <span className="text-gray-500 italic">No project</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-300 max-w-xs truncate">
                  {entry.description || (
                    <span className="text-gray-500 italic">No description</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-white font-medium tabular-nums">
                  {formatDuration(entry.duration)}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => onToggleInvoiced(entry.id, !entry.invoiced)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      entry.invoiced
                        ? "bg-teal-500/20 text-teal-400"
                        : "bg-gray-700 text-gray-400 hover:text-white"
                    }`}
                  >
                    {entry.invoiced ? "Yes" : "No"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingEntry(entry)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-white transition-all"
                      title="Edit entry"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Delete this entry?")) {
                          onDelete(entry.id);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-400 transition-all"
                      title="Delete entry"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Entry Modal */}
      {editingEntry && (
        <EditEntryModal
          entry={{
            id: editingEntry.id,
            description: editingEntry.description,
            startTime: editingEntry.startTime,
            endTime: editingEntry.endTime,
            duration: editingEntry.duration,
            invoiced: editingEntry.invoiced,
            createdAt: editingEntry.createdAt,
            projectId: editingEntry.projectId,
          }}
          onClose={() => setEditingEntry(null)}
          onSave={onRefresh}
        />
      )}
    </div>
  );
}
