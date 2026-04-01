import { sql } from "drizzle-orm";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const ensureBleDeviceTable = sql`
  CREATE TABLE IF NOT EXISTS ble_device (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bleId TEXT NOT NULL,
    locationOfMobile TEXT NOT NULL,
    phoneId TEXT NOT NULL,
    capturedAt INTEGER NOT NULL,
    strength INTEGER NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL
  )
`;

const ensureBleIdColumn = sql.raw(
  "ALTER TABLE ble_device ADD COLUMN bleId TEXT",
);

export const bleRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    try {
      await ctx.db.run(ensureBleDeviceTable);

      try {
        await ctx.db.run(ensureBleIdColumn);
      } catch {
        // Column already exists or table is fresh.
      }

      return await ctx.db.query.bleDevices.findMany({
        orderBy: (bleDevices, { desc }) => [desc(bleDevices.capturedAt)],
      });
    } catch (error) {
      console.error("[ble.list] falling back to empty list", error);
      return [];
    }
  }),

  byBleId: publicProcedure
    .input((value: unknown) => {
      if (typeof value !== "string" || !value.trim()) {
        throw new Error("bleId is required");
      }

      return value.trim();
    })
    .query(async ({ ctx, input }) => {
      try {
        await ctx.db.run(ensureBleDeviceTable);

        try {
          await ctx.db.run(ensureBleIdColumn);
        } catch {
          // Column already exists or table is fresh.
        }

        return await ctx.db.query.bleDevices.findMany({
          where: (bleDevices, { eq }) => eq(bleDevices.bleId, input),
          orderBy: (bleDevices, { desc }) => [desc(bleDevices.capturedAt)],
        });
      } catch (error) {
        console.error("[ble.byBleId] falling back to empty list", error);
        return [];
      }
    }),
});
