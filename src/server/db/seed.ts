import { sql } from "drizzle-orm";

import { db } from "./index";
import { bleDevices } from "./schema";

const seedRows = [
  {
    locationOfMobile: "Baker Street",
    phoneId: "MOB-1001",
    capturedAt: new Date("2026-04-01T08:15:00Z"),
    strength: -42,
    latitude: 51.505,
    longitude: -0.09,
  },
  {
    locationOfMobile: "Oxford Street",
    phoneId: "MOB-1002",
    capturedAt: new Date("2026-04-01T08:16:20Z"),
    strength: -48,
    latitude: 51.5054,
    longitude: -0.0892,
  },
  {
    locationOfMobile: "Regent Street",
    phoneId: "MOB-1003",
    capturedAt: new Date("2026-04-01T08:17:10Z"),
    strength: -56,
    latitude: 51.5046,
    longitude: -0.0904,
  },
  {
    locationOfMobile: "King Street",
    phoneId: "MOB-1004",
    capturedAt: new Date("2026-04-01T08:18:45Z"),
    strength: -64,
    latitude: 51.5058,
    longitude: -0.0911,
  },
];

console.log("[seed] clearing BLE devices table");
await db.delete(bleDevices).where(sql`1 = 1`);

console.log(`[seed] inserting ${seedRows.length} BLE devices`);
await db.insert(bleDevices).values(seedRows).onConflictDoNothing();

console.log("[seed] done");
