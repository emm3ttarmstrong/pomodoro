import { create } from "zustand";

interface TimerState {
  // Timer state
  isRunning: boolean;
  isPaused: boolean;
  startTime: Date | null;
  elapsedSeconds: number;
  projectId: string | null;
  description: string;

  // Pomodoro state
  pomodoroEnabled: boolean;
  isBreak: boolean;
  workDuration: number; // minutes
  breakDuration: number; // minutes

  // Actions
  setRunning: (isRunning: boolean) => void;
  setPaused: (isPaused: boolean) => void;
  setStartTime: (time: Date | null) => void;
  setElapsedSeconds: (seconds: number) => void;
  setProjectId: (id: string | null) => void;
  setDescription: (desc: string) => void;
  setPomodoroEnabled: (enabled: boolean) => void;
  setIsBreak: (isBreak: boolean) => void;
  setWorkDuration: (minutes: number) => void;
  setBreakDuration: (minutes: number) => void;
  reset: () => void;
}

export const useTimerStore = create<TimerState>((set) => ({
  // Initial state
  isRunning: false,
  isPaused: false,
  startTime: null,
  elapsedSeconds: 0,
  projectId: null,
  description: "",

  pomodoroEnabled: false,
  isBreak: false,
  workDuration: 25,
  breakDuration: 5,

  // Actions
  setRunning: (isRunning) => set({ isRunning }),
  setPaused: (isPaused) => set({ isPaused }),
  setStartTime: (startTime) => set({ startTime }),
  setElapsedSeconds: (elapsedSeconds) => set({ elapsedSeconds }),
  setProjectId: (projectId) => set({ projectId }),
  setDescription: (description) => set({ description }),
  setPomodoroEnabled: (pomodoroEnabled) => set({ pomodoroEnabled }),
  setIsBreak: (isBreak) => set({ isBreak }),
  setWorkDuration: (workDuration) => set({ workDuration }),
  setBreakDuration: (breakDuration) => set({ breakDuration }),
  reset: () =>
    set({
      isRunning: false,
      isPaused: false,
      startTime: null,
      elapsedSeconds: 0,
      projectId: null,
      description: "",
      isBreak: false,
    }),
}));
