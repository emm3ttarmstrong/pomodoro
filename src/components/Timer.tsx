"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTimerStore } from "@/stores/timerStore";
import { TimerRing } from "./TimerRing";
import { formatTime, minutesToSeconds } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
  client: { id: string; name: string };
}

export function Timer() {
  const store = useTimerStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch projects for dropdown
  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => setProjects(data))
      .catch(console.error);
  }, []);

  // Check for active timer on mount
  useEffect(() => {
    checkActiveTimer();
  }, []);

  const checkActiveTimer = async () => {
    try {
      const res = await fetch("/api/timer");
      const timer = await res.json();

      if (timer && timer.startTime) {
        // Resume timer from server state
        const startTime = new Date(timer.startTime);
        let elapsed = timer.accumulated || 0;

        if (!timer.isPaused) {
          elapsed += Math.floor((Date.now() - startTime.getTime()) / 1000);
        }

        store.setRunning(true);
        store.setPaused(timer.isPaused);
        store.setStartTime(startTime);
        store.setElapsedSeconds(elapsed);
        store.setProjectId(timer.projectId);
        store.setDescription(timer.description || "");
      }
    } catch (err) {
      console.error("Failed to check active timer:", err);
    } finally {
      setLoading(false);
    }
  };

  // Timer tick effect
  useEffect(() => {
    if (store.isRunning && !store.isPaused) {
      intervalRef.current = setInterval(() => {
        store.setElapsedSeconds(store.elapsedSeconds + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [store.isRunning, store.isPaused, store.elapsedSeconds, store]);

  const handleStart = async () => {
    try {
      const res = await fetch("/api/timer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: store.projectId,
          description: store.description,
        }),
      });

      if (res.ok) {
        store.setRunning(true);
        store.setPaused(false);
        store.setStartTime(new Date());
        store.setElapsedSeconds(0);
      }
    } catch (err) {
      console.error("Failed to start timer:", err);
    }
  };

  const handlePause = async () => {
    try {
      await fetch("/api/timer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isPaused: true,
          accumulated: store.elapsedSeconds,
        }),
      });
      store.setPaused(true);
    } catch (err) {
      console.error("Failed to pause timer:", err);
    }
  };

  const handleUpdateTimer = async (updates: { projectId?: string | null; description?: string }) => {
    try {
      await fetch("/api/timer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
    } catch (err) {
      console.error("Failed to update timer:", err);
    }
  };

  const handleResume = async () => {
    try {
      await fetch("/api/timer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isPaused: false,
          accumulated: store.elapsedSeconds,
        }),
      });
      store.setPaused(false);
    } catch (err) {
      console.error("Failed to resume timer:", err);
    }
  };

  const handleStop = useCallback(async (save: boolean = true) => {
    try {
      await fetch(`/api/timer?save=${save}`, {
        method: "DELETE",
      });
      store.reset();
    } catch (err) {
      console.error("Failed to stop timer:", err);
    }
  }, [store]);

  // Pomodoro check
  useEffect(() => {
    if (!store.pomodoroEnabled || !store.isRunning || store.isPaused) return;

    const targetDuration = store.isBreak
      ? minutesToSeconds(store.breakDuration)
      : minutesToSeconds(store.workDuration);

    if (store.elapsedSeconds >= targetDuration) {
      // Time's up - notify and handle
      if (Notification.permission === "granted") {
        new Notification(
          store.isBreak ? "Break is over!" : "Time for a break!",
          {
            body: store.isBreak
              ? "Ready to get back to work?"
              : "You've completed a work session.",
            icon: "/favicon.ico",
          }
        );
      }

      // Auto-pause at the end
      handlePause();
    }
  }, [store.elapsedSeconds, store.pomodoroEnabled, store.isBreak, store.isRunning, store.isPaused, store.breakDuration, store.workDuration]);

  // Calculate progress for ring
  const getProgress = () => {
    if (!store.pomodoroEnabled) {
      // When not in pomodoro mode, show progress filling up over an hour
      return Math.min(store.elapsedSeconds / 3600, 1);
    }

    const targetDuration = store.isBreak
      ? minutesToSeconds(store.breakDuration)
      : minutesToSeconds(store.workDuration);

    return Math.min(store.elapsedSeconds / targetDuration, 1);
  };

  // Get display time
  const getDisplayTime = () => {
    if (!store.pomodoroEnabled) {
      return formatTime(store.elapsedSeconds);
    }

    const targetDuration = store.isBreak
      ? minutesToSeconds(store.breakDuration)
      : minutesToSeconds(store.workDuration);

    const remaining = Math.max(targetDuration - store.elapsedSeconds, 0);
    return formatTime(remaining);
  };

  // Request notification permission
  useEffect(() => {
    if (
      store.pomodoroEnabled &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission();
    }
  }, [store.pomodoroEnabled]);

  // Handle break transitions
  const handleTakeBreak = () => {
    store.setIsBreak(true);
    store.setElapsedSeconds(0);
    store.setPaused(false);
    // No need to restart the server timer - just continue counting
  };

  const handleEndBreak = () => {
    store.setIsBreak(false);
    store.setElapsedSeconds(0);
    store.setPaused(false);
  };

  const handleIgnorePomodoro = () => {
    // Keep working - just reset the elapsed time
    store.setElapsedSeconds(0);
    store.setPaused(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const selectedProject = projects.find((p) => p.id === store.projectId);

  // Check if pomodoro interval ended
  const pomodoroEnded =
    store.pomodoroEnabled &&
    store.isPaused &&
    store.elapsedSeconds >=
      minutesToSeconds(store.isBreak ? store.breakDuration : store.workDuration);

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Status indicator */}
      <div className="flex items-center gap-2">
        {store.isRunning && (
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              store.isBreak
                ? "bg-blue-500/20 text-blue-400"
                : "bg-teal-500/20 text-teal-400"
            }`}
          >
            {store.isBreak ? "BREAK" : "FOCUS SESSION"}
          </span>
        )}
      </div>

      {/* Timer ring */}
      <TimerRing progress={getProgress()}>
        <div className="text-center">
          <div className="text-5xl font-bold text-white tabular-nums">
            {getDisplayTime()}
          </div>
          <div className="text-gray-400 mt-1 text-sm">
            {store.pomodoroEnabled
              ? store.isBreak
                ? "BREAK"
                : "WORK SESSION"
              : store.isRunning
              ? "TRACKING"
              : "READY"}
          </div>
        </div>
      </TimerRing>

      {/* Pomodoro ended options */}
      {pomodoroEnded && (
        <div className="flex flex-col items-center gap-3 bg-[#2a2a2a] p-4 rounded-lg">
          <p className="text-white font-medium">
            {store.isBreak ? "Break time is over!" : "Work session complete!"}
          </p>
          <div className="flex gap-2">
            {store.isBreak ? (
              <button
                onClick={handleEndBreak}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
              >
                Start Working
              </button>
            ) : (
              <>
                <button
                  onClick={handleTakeBreak}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Take Break
                </button>
                <button
                  onClick={handleIgnorePomodoro}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Keep Working
                </button>
                <button
                  onClick={() => handleStop(true)}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                >
                  Stop & Save
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-4">
        {!store.isRunning ? (
          <button
            onClick={handleStart}
            className="px-8 py-3 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
            Start Focusing
          </button>
        ) : (
          <>
            {!pomodoroEnded && (
              <>
                {store.isPaused ? (
                  <button
                    onClick={handleResume}
                    className="px-8 py-3 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Resume
                  </button>
                ) : (
                  <button
                    onClick={handlePause}
                    className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                    Pause
                  </button>
                )}
              </>
            )}
            <button
              onClick={() => handleStop(true)}
              className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium rounded-lg transition-colors"
            >
              Stop & Save
            </button>
            <button
              onClick={() => handleStop(false)}
              className="px-4 py-3 text-gray-400 hover:text-white transition-colors"
              title="Discard"
            >
              <svg
                className="w-5 h-5"
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
          </>
        )}
      </div>

      {/* Project & Description selection */}
      <div className="w-full max-w-md space-y-4 bg-[#2a2a2a] p-4 rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Project</label>
            <select
              value={store.projectId || ""}
              onChange={(e) => {
                const newProjectId = e.target.value || null;
                store.setProjectId(newProjectId);
                if (store.isRunning) {
                  handleUpdateTimer({ projectId: newProjectId });
                }
              }}
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
            <label className="block text-sm text-gray-400 mb-1">
              Pomodoro Mode
            </label>
            <button
              onClick={() => store.setPomodoroEnabled(!store.pomodoroEnabled)}
              disabled={store.isRunning}
              className={`w-full px-3 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                store.pomodoroEnabled
                  ? "bg-teal-500/20 text-teal-400 border border-teal-500"
                  : "bg-[#1a1a1a] border border-gray-700 text-gray-400"
              }`}
            >
              {store.pomodoroEnabled ? "Enabled" : "Disabled"}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Description
          </label>
          <input
            type="text"
            value={store.description}
            onChange={(e) => store.setDescription(e.target.value)}
            onBlur={() => {
              if (store.isRunning) {
                handleUpdateTimer({ description: store.description });
              }
            }}
            placeholder="What are you working on?"
            className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* Current session info */}
        {store.isRunning && selectedProject && (
          <div className="pt-2 border-t border-gray-700">
            <p className="text-sm text-gray-400">
              Tracking time for:{" "}
              <span className="text-white">
                {selectedProject.client.name} / {selectedProject.name}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
