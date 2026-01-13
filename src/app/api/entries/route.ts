import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const projectId = searchParams.get("projectId");
  const clientId = searchParams.get("clientId");
  const invoiced = searchParams.get("invoiced");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  // Build where clause
  const where: Record<string, unknown> = {};

  if (projectId) {
    where.projectId = projectId;
  }

  if (clientId) {
    where.project = { clientId };
  }

  if (invoiced === "true") {
    where.invoiced = true;
  } else if (invoiced === "false") {
    where.invoiced = false;
  }

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) {
      (where.createdAt as Record<string, unknown>).gte = new Date(dateFrom);
    }
    if (dateTo) {
      // Add one day to include the end date
      const endDate = new Date(dateTo);
      endDate.setDate(endDate.getDate() + 1);
      (where.createdAt as Record<string, unknown>).lt = endDate;
    }
  }

  const entries = await prisma.timeEntry.findMany({
    where,
    include: {
      project: {
        include: { client: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(entries);
}

export async function POST(request: Request) {
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

  if (!calculatedDuration || calculatedDuration < 1) {
    return NextResponse.json(
      { error: "Duration must be at least 1 minute" },
      { status: 400 }
    );
  }

  const entry = await prisma.timeEntry.create({
    data: {
      projectId: projectId || null,
      description: description || null,
      startTime: startTime ? new Date(startTime) : null,
      endTime: endTime ? new Date(endTime) : null,
      duration: calculatedDuration,
      invoiced: invoiced || false,
    },
    include: {
      project: {
        include: { client: true },
      },
    },
  });

  return NextResponse.json(entry);
}
