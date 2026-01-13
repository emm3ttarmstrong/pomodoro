import { describe, it, expect, beforeEach } from "vitest";
import { useTimerStore } from "./timerStore";

describe("timerStore", () => {
  beforeEach(() => {
    // Reset store before each test
    useTimerStore.getState().reset();
    useTimerStore.setState({
      pomodoroEnabled: false,
      workDuration: 25,
      breakDuration: 5,
    });
  });

  describe("initial state", () => {
    it("starts with timer not running", () => {
      const state = useTimerStore.getState();
      expect(state.isRunning).toBe(false);
      expect(state.isPaused).toBe(false);
      expect(state.elapsedSeconds).toBe(0);
      expect(state.startTime).toBe(null);
    });

    it("starts with no project or description", () => {
      const state = useTimerStore.getState();
      expect(state.projectId).toBe(null);
      expect(state.description).toBe("");
    });

    it("starts with pomodoro disabled", () => {
      const state = useTimerStore.getState();
      expect(state.pomodoroEnabled).toBe(false);
      expect(state.isBreak).toBe(false);
      expect(state.workDuration).toBe(25);
      expect(state.breakDuration).toBe(5);
    });
  });

  describe("timer actions", () => {
    it("can start the timer", () => {
      const store = useTimerStore.getState();
      const now = new Date();

      store.setRunning(true);
      store.setStartTime(now);

      const state = useTimerStore.getState();
      expect(state.isRunning).toBe(true);
      expect(state.startTime).toEqual(now);
    });

    it("can pause the timer", () => {
      const store = useTimerStore.getState();
      store.setRunning(true);
      store.setPaused(true);

      const state = useTimerStore.getState();
      expect(state.isRunning).toBe(true);
      expect(state.isPaused).toBe(true);
    });

    it("can track elapsed seconds", () => {
      const store = useTimerStore.getState();
      store.setElapsedSeconds(120);

      expect(useTimerStore.getState().elapsedSeconds).toBe(120);
    });

    it("can set project and description", () => {
      const store = useTimerStore.getState();
      store.setProjectId("project-123");
      store.setDescription("Working on feature X");

      const state = useTimerStore.getState();
      expect(state.projectId).toBe("project-123");
      expect(state.description).toBe("Working on feature X");
    });
  });

  describe("pomodoro actions", () => {
    it("can enable pomodoro mode", () => {
      const store = useTimerStore.getState();
      store.setPomodoroEnabled(true);

      expect(useTimerStore.getState().pomodoroEnabled).toBe(true);
    });

    it("can toggle break mode", () => {
      const store = useTimerStore.getState();
      store.setIsBreak(true);

      expect(useTimerStore.getState().isBreak).toBe(true);
    });

    it("can configure work duration", () => {
      const store = useTimerStore.getState();
      store.setWorkDuration(50);

      expect(useTimerStore.getState().workDuration).toBe(50);
    });

    it("can configure break duration", () => {
      const store = useTimerStore.getState();
      store.setBreakDuration(10);

      expect(useTimerStore.getState().breakDuration).toBe(10);
    });
  });

  describe("reset", () => {
    it("resets timer state but keeps pomodoro settings", () => {
      const store = useTimerStore.getState();

      // Set up some state
      store.setRunning(true);
      store.setPaused(true);
      store.setElapsedSeconds(500);
      store.setProjectId("project-123");
      store.setDescription("Some work");
      store.setIsBreak(true);
      store.setPomodoroEnabled(true);
      store.setWorkDuration(50);
      store.setBreakDuration(10);

      // Reset
      store.reset();

      const state = useTimerStore.getState();

      // Timer state should be reset
      expect(state.isRunning).toBe(false);
      expect(state.isPaused).toBe(false);
      expect(state.elapsedSeconds).toBe(0);
      expect(state.startTime).toBe(null);
      expect(state.projectId).toBe(null);
      expect(state.description).toBe("");
      expect(state.isBreak).toBe(false);

      // Pomodoro settings should be preserved
      expect(state.pomodoroEnabled).toBe(true);
      expect(state.workDuration).toBe(50);
      expect(state.breakDuration).toBe(10);
    });
  });
});
