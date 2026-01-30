import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: { projects: true },
  });

  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  return NextResponse.json(client);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { name } = await request.json();

  if (!name || typeof name !== "string" || name.trim() === "") {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const client = await prisma.client.update({
    where: { id },
    data: { name: name.trim() },
    include: { projects: true },
  });

  return NextResponse.json(client);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await prisma.client.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
