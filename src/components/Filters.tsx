"use client";

import { useEffect, useState } from "react";

interface Client {
  id: string;
  name: string;
  projects: { id: string; name: string }[];
}

interface FiltersProps {
  clientId: string;
  projectId: string;
  invoiced: string;
  dateFrom: string;
  dateTo: string;
  onFilterChange: (filters: {
    clientId: string;
    projectId: string;
    invoiced: string;
    dateFrom: string;
    dateTo: string;
  }) => void;
}

export function Filters({
  clientId,
  projectId,
  invoiced,
  dateFrom,
  dateTo,
  onFilterChange,
}: FiltersProps) {
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    fetch("/api/clients")
      .then((res) => res.json())
      .then((data) => setClients(data))
      .catch(console.error);
  }, []);

  const selectedClient = clients.find((c) => c.id === clientId);

  const handleChange = (key: string, value: string) => {
    const newFilters = {
      clientId,
      projectId,
      invoiced,
      dateFrom,
      dateTo,
      [key]: value,
    };

    // Clear project if client changes
    if (key === "clientId") {
      newFilters.projectId = "";
    }

    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    onFilterChange({
      clientId: "",
      projectId: "",
      invoiced: "",
      dateFrom: "",
      dateTo: "",
    });
  };

  const hasFilters = clientId || projectId || invoiced || dateFrom || dateTo;

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Client</label>
        <select
          value={clientId}
          onChange={(e) => handleChange("clientId", e.target.value)}
          className="px-3 py-2 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-teal-500"
        >
          <option value="">All clients</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Project</label>
        <select
          value={projectId}
          onChange={(e) => handleChange("projectId", e.target.value)}
          disabled={!clientId}
          className="px-3 py-2 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-teal-500 disabled:opacity-50"
        >
          <option value="">All projects</option>
          {selectedClient?.projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Invoiced</label>
        <select
          value={invoiced}
          onChange={(e) => handleChange("invoiced", e.target.value)}
          className="px-3 py-2 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-teal-500"
        >
          <option value="">All</option>
          <option value="true">Invoiced</option>
          <option value="false">Not invoiced</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">From</label>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => handleChange("dateFrom", e.target.value)}
          className="px-3 py-2 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-teal-500"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">To</label>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => handleChange("dateTo", e.target.value)}
          className="px-3 py-2 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-teal-500"
        />
      </div>

      {hasFilters && (
        <button
          onClick={clearFilters}
          className="px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
