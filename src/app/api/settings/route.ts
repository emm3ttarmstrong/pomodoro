import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  let settings = await prisma.settings.findUnique({
    where: { id: "settings" },
  });

  // Create default settings if they don't exist
  if (!settings) {
    settings = await prisma.settings.create({
      data: {
        id: "settings",
        workDuration: 25,
        breakDuration: 5,
      },
    });
  }

  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  const { workDuration, breakDuration } = await request.json();

  const settings = await prisma.settings.upsert({
    where: { id: "settings" },
    update: {
      workDuration: workDuration ?? 25,
      breakDuration: breakDuration ?? 5,
    },
    create: {
      id: "settings",
      workDuration: workDuration ?? 25,
      breakDuration: breakDuration ?? 5,
    },
  });

  return NextResponse.json(settings);
}
