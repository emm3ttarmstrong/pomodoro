"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
  clientId: string;
}

interface Client {
  id: string;
  name: string;
  projects: Project[];
}

export function ClientList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());

  // Form states
  const [newClientName, setNewClientName] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectClientId, setNewProjectClientId] = useState<string | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients");
      if (!res.ok) {
        console.error("Failed to fetch clients:", res.status);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch clients:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleClient = (clientId: string) => {
    const next = new Set(expandedClients);
    if (next.has(clientId)) {
      next.delete(clientId);
    } else {
      next.add(clientId);
    }
    setExpandedClients(next);
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newClientName }),
    });

    if (res.ok) {
      setNewClientName("");
      fetchClients();
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || !newProjectClientId) return;

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newProjectName, clientId: newProjectClientId }),
    });

    if (res.ok) {
      setNewProjectName("");
      setNewProjectClientId(null);
      fetchClients();
    }
  };

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient || !editName.trim()) return;

    const res = await fetch(`/api/clients/${editingClient.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName }),
    });

    if (res.ok) {
      setEditingClient(null);
      setEditName("");
      fetchClients();
    }
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || !editName.trim()) return;

    const res = await fetch(`/api/projects/${editingProject.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName }),
    });

    if (res.ok) {
      setEditingProject(null);
      setEditName("");
      fetchClients();
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm("Delete this client and all its projects?")) return;

    const res = await fetch(`/api/clients/${clientId}`, { method: "DELETE" });
    if (res.ok) fetchClients();
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Delete this project?")) return;

    const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
    if (res.ok) fetchClients();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Client Form */}
      <form onSubmit={handleAddClient} className="flex gap-2">
        <input
          type="text"
          value={newClientName}
          onChange={(e) => setNewClientName(e.target.value)}
          placeholder="New client name"
          className="flex-1 px-3 py-2 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
        />
        <button
          type="submit"
          disabled={!newClientName.trim()}
          className="px-4 py-2 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-500/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          Add Client
        </button>
      </form>

      {/* Client List */}
      {clients.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No clients yet. Add one above.</p>
      ) : (
        <div className="space-y-2">
          {clients.map((client) => {
            const isExpanded = expandedClients.has(client.id);
            return (
              <div key={client.id} className="bg-[#2a2a2a] rounded-lg overflow-hidden">
                {/* Client Header */}
                <div className="flex items-center justify-between p-3">
                  <button
                    onClick={() => toggleClient(client.id)}
                    className="flex items-center gap-2 text-white hover:text-teal-400 transition-colors"
                  >
                    <svg
                      className={cn(
                        "w-4 h-4 transition-transform",
                        isExpanded && "rotate-90"
                      )}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                    <span className="font-medium">{client.name}</span>
                    <span className="text-gray-500 text-sm">
                      ({client.projects.length} project{client.projects.length !== 1 ? "s" : ""})
                    </span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingClient(client);
                        setEditName(client.name);
                      }}
                      className="p-1 text-gray-400 hover:text-white transition-colors"
                      title="Edit client"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteClient(client.id)}
                      className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                      title="Delete client"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Projects (expanded) */}
                {isExpanded && (
                  <div className="border-t border-gray-700 p-3 pl-8 space-y-2">
                    {client.projects.map((project) => (
                      <div
                        key={project.id}
                        className="flex items-center justify-between py-1 px-2 rounded hover:bg-[#333] group"
                      >
                        <span className="text-gray-300">{project.name}</span>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingProject(project);
                              setEditName(project.name);
                            }}
                            className="p-1 text-gray-400 hover:text-white transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteProject(project.id)}
                            className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add Project Form */}
                    {newProjectClientId === client.id ? (
                      <form onSubmit={handleAddProject} className="flex gap-2 mt-2">
                        <input
                          type="text"
                          value={newProjectName}
                          onChange={(e) => setNewProjectName(e.target.value)}
                          placeholder="Project name"
                          className="flex-1 px-2 py-1 text-sm bg-[#1a1a1a] border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
                          autoFocus
                        />
                        <button
                          type="submit"
                          className="px-2 py-1 text-sm bg-teal-500 hover:bg-teal-600 text-white rounded transition-colors"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setNewProjectClientId(null);
                            setNewProjectName("");
                          }}
                          className="px-2 py-1 text-sm text-gray-400 hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <button
                        onClick={() => setNewProjectClientId(client.id)}
                        className="flex items-center gap-1 text-sm text-teal-400 hover:text-teal-300 transition-colors mt-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Add project
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Client Modal */}
      {editingClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#2a2a2a] rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-white mb-4">Edit Client</h3>
            <form onSubmit={handleUpdateClient} className="space-y-4">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setEditingClient(null);
                    setEditName("");
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#2a2a2a] rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-white mb-4">Edit Project</h3>
            <form onSubmit={handleUpdateProject} className="space-y-4">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setEditingProject(null);
                    setEditName("");
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
