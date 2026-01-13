import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Get active timer
export async function GET() {
  const timer = await prisma.activeTimer.findUnique({
    where: { id: "active" },
  });

  return NextResponse.json(timer);
}

// Start timer
export async function POST(request: Request) {
  const body = await request.json();
  const { projectId, description } = body;

  // Delete any existing timer first
  await prisma.activeTimer.deleteMany({});

  const timer = await prisma.activeTimer.create({
    data: {
      id: "active",
      startTime: new Date(),
      projectId: projectId || null,
      description: description || null,
      isPaused: false,
      accumulated: 0,
    },
  });

  return NextResponse.json(timer);
}

// Update timer (pause/resume/update description)
export async function PUT(request: Request) {
  const body = await request.json();
  const { isPaused, projectId, description, accumulated } = body;

  const existingTimer = await prisma.activeTimer.findUnique({
    where: { id: "active" },
  });

  if (!existingTimer) {
    return NextResponse.json({ error: "No active timer" }, { status: 404 });
  }

  const updateData: Record<string, unknown> = {};

  if (typeof isPaused === "boolean") {
    updateData.isPaused = isPaused;
    if (isPaused) {
      updateData.pausedAt = new Date();
    } else {
      // Resuming - reset startTime and add accumulated time
      updateData.pausedAt = null;
      updateData.startTime = new Date();
    }
  }

  if (projectId !== undefined) {
    updateData.projectId = projectId;
  }

  if (description !== undefined) {
    updateData.description = description;
  }

  if (typeof accumulated === "number") {
    updateData.accumulated = accumulated;
  }

  const timer = await prisma.activeTimer.update({
    where: { id: "active" },
    data: updateData,
  });

  return NextResponse.json(timer);
}

// Stop timer (delete it and optionally create a time entry)
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const save = searchParams.get("save") === "true";

  const timer = await prisma.activeTimer.findUnique({
    where: { id: "active" },
  });

  if (!timer) {
    return NextResponse.json({ error: "No active timer" }, { status: 404 });
  }

  // Calculate total duration in minutes
  let totalSeconds = timer.accumulated;
  if (!timer.isPaused) {
    totalSeconds += Math.floor(
      (Date.now() - timer.startTime.getTime()) / 1000
    );
  }
  const totalMinutes = Math.ceil(totalSeconds / 60);

  // Delete the active timer
  await prisma.activeTimer.delete({ where: { id: "active" } });

  // Optionally save as time entry
  if (save && totalMinutes > 0) {
    const entry = await prisma.timeEntry.create({
      data: {
        projectId: timer.projectId,
        description: timer.description,
        startTime: timer.startTime,
        endTime: new Date(),
        duration: totalMinutes,
        invoiced: false,
      },
    });
    return NextResponse.json({ success: true, entry });
  }

  return NextResponse.json({ success: true });
}
