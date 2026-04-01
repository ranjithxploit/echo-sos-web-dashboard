import { sql } from "drizzle-orm";

import { db } from "./index";
import { bleDevices } from "./schema";

const seedRows = [
  {
    bleId: "BLE-1001",
    locationOfMobile: "Baker Street",
    phoneId: "MOB-1001",
    capturedAt: new Date("2026-04-01T08:12:00Z"),
    strength: -58,
    latitude: 51.505,
    longitude: -0.09,
  },
  {
    bleId: "BLE-1002",
    locationOfMobile: "Oxford Street",
    phoneId: "MOB-1002",
    capturedAt: new Date("2026-04-01T08:13:20Z"),
    strength: -61,
    latitude: 51.5054,
    longitude: -0.0892,
  },
  {
    bleId: "BLE-1003",
    locationOfMobile: "Regent Street",
    phoneId: "MOB-1003",
    capturedAt: new Date("2026-04-01T08:14:10Z"),
    strength: -65,
    latitude: 51.5046,
    longitude: -0.0904,
  },
  {
    bleId: "BLE-1004",
    locationOfMobile: "King Street",
    phoneId: "MOB-1004",
    capturedAt: new Date("2026-04-01T08:15:45Z"),
    strength: -69,
    latitude: 51.5058,
    longitude: -0.0911,
  },
  {
    bleId: "BLE-1001",
    locationOfMobile: "Oxford Street",
    phoneId: "MOB-1001",
    capturedAt: new Date("2026-04-01T08:17:00Z"),
    strength: -52,
    latitude: 51.5052,
    longitude: -0.0896,
  },
  {
    bleId: "BLE-1001",
    locationOfMobile: "Regent Street",
    phoneId: "MOB-1001",
    capturedAt: new Date("2026-04-01T08:18:35Z"),
    strength: -47,
    latitude: 51.5049,
    longitude: -0.0901,
  },
  {
    bleId: "BLE-1001",
    locationOfMobile: "King Street",
    phoneId: "MOB-1001",
    capturedAt: new Date("2026-04-01T08:20:15Z"),
    strength: -41,
    latitude: 51.5056,
    longitude: -0.091,
  },
  {
    bleId: "BLE-1002",
    locationOfMobile: "Baker Street",
    phoneId: "MOB-1002",
    capturedAt: new Date("2026-04-01T08:16:40Z"),
    strength: -56,
    latitude: 51.5051,
    longitude: -0.0898,
  },
  {
    bleId: "BLE-1002",
    locationOfMobile: "Regent Street",
    phoneId: "MOB-1002",
    capturedAt: new Date("2026-04-01T08:18:05Z"),
    strength: -49,
    latitude: 51.5048,
    longitude: -0.0902,
  },
  {
    bleId: "BLE-1002",
    locationOfMobile: "King Street",
    phoneId: "MOB-1002",
    capturedAt: new Date("2026-04-01T08:19:55Z"),
    strength: -44,
    latitude: 51.5057,
    longitude: -0.0912,
  },
  {
    bleId: "BLE-1003",
    locationOfMobile: "Baker Street",
    phoneId: "MOB-1003",
    capturedAt: new Date("2026-04-01T08:15:50Z"),
    strength: -63,
    latitude: 51.505,
    longitude: -0.0899,
  },
  {
    bleId: "BLE-1003",
    locationOfMobile: "Oxford Street",
    phoneId: "MOB-1003",
    capturedAt: new Date("2026-04-01T08:19:05Z"),
    strength: -57,
    latitude: 51.5053,
    longitude: -0.0905,
  },
];

console.log("[seed] clearing BLE devices table");
await db.delete(bleDevices).where(sql`1 = 1`);

console.log(`[seed] inserting ${seedRows.length} BLE devices`);
await db.insert(bleDevices).values(seedRows).onConflictDoNothing();

console.log("[seed] done");
