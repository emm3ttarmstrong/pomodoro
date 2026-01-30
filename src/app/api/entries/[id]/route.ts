import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { projectId, description, startTime, endTime, duration, invoiced } =
    body;

  // Calculate duration if not provided
  let calculatedDuration = duration;
  if (!calculatedDuration && startTime && endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    calculatedDuration = Math.ceil((end.getTime() - start.getTime()) / 60000);
  }

  const entry = await prisma.timeEntry.update({
    where: { id },
    data: {
      projectId: projectId ?? undefined,
      description: description ?? undefined,
      startTime: startTime ? new Date(startTime) : undefined,
      endTime: endTime ? new Date(endTime) : undefined,
      duration: calculatedDuration ?? undefined,
      invoiced: invoiced ?? undefined,
    },
    include: {
      project: {
        include: { client: true },
      },
    },
  });

  return NextResponse.json(entry);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await prisma.timeEntry.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
