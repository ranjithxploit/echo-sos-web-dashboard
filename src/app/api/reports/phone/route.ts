import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "~/server/db";
import { bleDevices } from "~/server/db/schema";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const phoneId = url.searchParams.get("phoneId");

  if (!phoneId) {
    return NextResponse.json(
      { error: "phoneId query parameter is required" },
      { status: 400 },
    );
  }

  const reports = await db.query.bleDevices.findMany({
    where: eq(bleDevices.phoneId, phoneId),
    orderBy: (reports, { desc: orderDesc }) => [orderDesc(reports.capturedAt)],
  });

  return NextResponse.json({
    phoneId,
    count: reports.length,
    reports,
  });
}
