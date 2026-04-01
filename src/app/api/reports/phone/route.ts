import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "~/server/db";
import { bleDevices } from "~/server/db/schema";
import { withCors } from "~/server/cors";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return NextResponse.json({}, { headers: withCors() });
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const phoneId = url.searchParams.get("phoneId");

    if (!phoneId) {
      return NextResponse.json(
        {
          error: {
            code: "BAD_REQUEST",
            message: "phoneId query parameter is required",
          },
        },
        { status: 400, headers: withCors() },
      );
    }

    const reports = await db.query.bleDevices.findMany({
      where: eq(bleDevices.phoneId, phoneId),
      orderBy: (reports, { asc: orderAsc, desc: orderDesc }) => [
        orderAsc(reports.accuracy),
        orderDesc(reports.capturedAt),
      ],
    });

    return NextResponse.json(
      {
        phoneId,
        count: reports.length,
        reports,
      },
      { headers: withCors() },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message,
        },
      },
      { status: 500, headers: withCors() },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<{
      bleId: string;
      phoneId: string;
      capturedAt: string;
      accuracy: number;
      strength: number;
      latitude: number;
      longitude: number;
    }>;

    const requiredFields = [
      "bleId",
      "phoneId",
      "capturedAt",
      "accuracy",
      "strength",
      "latitude",
      "longitude",
    ] as const;
    const missingFields = requiredFields.filter(
      (field) =>
        body[field] === undefined || body[field] === null || body[field] === "",
    );

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: {
            code: "BAD_REQUEST",
            message: `Missing required fields: ${missingFields.join(", ")}`,
          },
        },
        { status: 400, headers: withCors() },
      );
    }

    const payload = {
      bleId: body.bleId!,
      phoneId: body.phoneId!,
      capturedAt: new Date(body.capturedAt!),
      accuracy: body.accuracy!,
      strength: body.strength!,
      latitude: body.latitude!,
      longitude: body.longitude!,
    };

    if (Number.isNaN(payload.capturedAt.getTime())) {
      return NextResponse.json(
        {
          error: {
            code: "BAD_REQUEST",
            message: "capturedAt must be a valid ISO timestamp",
          },
        },
        { status: 400, headers: withCors() },
      );
    }

    const [inserted] = await db.insert(bleDevices).values(payload).returning();

    return NextResponse.json(
      {
        message: "Report stored successfully",
        report: inserted,
      },
      { status: 201, headers: withCors() },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message,
        },
      },
      { status: 500, headers: withCors() },
    );
  }
}
