"use client";

import { useEffect, useState, useCallback } from "react";
import { EntryForm } from "@/components/EntryForm";
import { EntryTable } from "@/components/EntryTable";
import { Filters } from "@/components/Filters";
import { format } from "date-fns";
import Papa from "papaparse";

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

export default function DashboardPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    clientId: "",
    projectId: "",
    invoiced: "",
    dateFrom: "",
    dateTo: "",
  });

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.clientId) params.set("clientId", filters.clientId);
      if (filters.projectId) params.set("projectId", filters.projectId);
      if (filters.invoiced) params.set("invoiced", filters.invoiced);
      if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.set("dateTo", filters.dateTo);

      const res = await fetch(`/api/entries?${params.toString()}`);
      const data = await res.json();
      setEntries(data);
    } catch (err) {
      console.error("Failed to fetch entries:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleToggleInvoiced = async (id: string, invoiced: boolean) => {
    try {
      await fetch(`/api/entries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiced }),
      });
      fetchEntries();
    } catch (err) {
      console.error("Failed to update entry:", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/entries/${id}`, { method: "DELETE" });
      fetchEntries();
    } catch (err) {
      console.error("Failed to delete entry:", err);
    }
  };

  const handleExportCSV = () => {
    const csvData = entries.map((entry) => ({
      Date: format(new Date(entry.createdAt), "yyyy-MM-dd"),
      Client: entry.project?.client.name || "",
      Project: entry.project?.name || "",
      Description: entry.description || "",
      "Duration (minutes)": entry.duration,
      "Duration (hours)": (entry.duration / 60).toFixed(2),
      Invoiced: entry.invoiced ? "Yes" : "No",
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `time-entries-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Time Entries</h1>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            disabled={entries.length === 0}
            className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#333] disabled:opacity-50 text-gray-300 rounded-lg transition-colors flex items-center gap-2"
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
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export CSV
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors flex items-center gap-2"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Entry
          </button>
        </div>
      </div>

      {/* Manual Entry Form */}
      {showForm && (
        <div className="mb-6">
          <EntryForm
            onSuccess={() => {
              setShowForm(false);
              fetchEntries();
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Filters */}
      <div className="mb-6">
        <Filters
          clientId={filters.clientId}
          projectId={filters.projectId}
          invoiced={filters.invoiced}
          dateFrom={filters.dateFrom}
          dateTo={filters.dateTo}
          onFilterChange={setFilters}
        />
      </div>

      {/* Entry Table */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <EntryTable
          entries={entries}
          onToggleInvoiced={handleToggleInvoiced}
          onDelete={handleDelete}
          onRefresh={fetchEntries}
        />
      )}
    </div>
  );
}
