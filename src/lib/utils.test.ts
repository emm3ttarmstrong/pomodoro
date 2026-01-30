import { describe, it, expect } from "vitest";
import {
  formatDuration,
  formatTime,
  minutesToSeconds,
  secondsToMinutes,
  cn,
} from "./utils";

describe("formatDuration", () => {
  it("formats minutes only when less than an hour", () => {
    expect(formatDuration(0)).toBe("0m");
    expect(formatDuration(30)).toBe("30m");
    expect(formatDuration(59)).toBe("59m");
  });

  it("formats hours and minutes when an hour or more", () => {
    expect(formatDuration(60)).toBe("1h 0m");
    expect(formatDuration(90)).toBe("1h 30m");
    expect(formatDuration(125)).toBe("2h 5m");
  });

  it("handles large durations", () => {
    expect(formatDuration(480)).toBe("8h 0m");
    expect(formatDuration(1000)).toBe("16h 40m");
  });
});

describe("formatTime", () => {
  it("formats seconds as MM:SS", () => {
    expect(formatTime(0)).toBe("00:00");
    expect(formatTime(30)).toBe("00:30");
    expect(formatTime(59)).toBe("00:59");
  });

  it("formats minutes and seconds", () => {
    expect(formatTime(60)).toBe("01:00");
    expect(formatTime(90)).toBe("01:30");
    expect(formatTime(3661)).toBe("61:01");
  });

  it("pads single digits with zeros", () => {
    expect(formatTime(61)).toBe("01:01");
    expect(formatTime(9)).toBe("00:09");
  });
});

describe("minutesToSeconds", () => {
  it("converts minutes to seconds", () => {
    expect(minutesToSeconds(0)).toBe(0);
    expect(minutesToSeconds(1)).toBe(60);
    expect(minutesToSeconds(25)).toBe(1500);
    expect(minutesToSeconds(60)).toBe(3600);
  });
});

describe("secondsToMinutes", () => {
  it("converts seconds to minutes, flooring the result", () => {
    expect(secondsToMinutes(0)).toBe(0);
    expect(secondsToMinutes(59)).toBe(0);
    expect(secondsToMinutes(60)).toBe(1);
    expect(secondsToMinutes(90)).toBe(1);
    expect(secondsToMinutes(3600)).toBe(60);
  });
});

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", true && "included", false && "excluded")).toBe(
      "base included"
    );
  });

  it("merges tailwind classes intelligently", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });
});
