import { toNextJsHandler } from "better-auth/next-js";
import { NextResponse } from "next/server";

import { auth } from "~/server/better-auth";
import { withCors } from "~/server/cors";

export const { GET, POST } = toNextJsHandler(auth.handler);

export async function OPTIONS() {
  return NextResponse.json({}, { headers: withCors() });
}
