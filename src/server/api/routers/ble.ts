import { sql } from "drizzle-orm";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const ensureBleDeviceTable = sql`
  CREATE TABLE IF NOT EXISTS ble_device (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    locationOfMobile TEXT NOT NULL,
    phoneId TEXT NOT NULL,
    capturedAt INTEGER NOT NULL,
    strength INTEGER NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL
  )
`;

export const bleRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    try {
      await ctx.db.run(ensureBleDeviceTable);

      return await ctx.db.query.bleDevices.findMany({
        orderBy: (bleDevices, { desc }) => [desc(bleDevices.capturedAt)],
      });
    } catch (error) {
      console.error("[ble.list] falling back to empty list", error);
      return [];
    }
  }),
});
