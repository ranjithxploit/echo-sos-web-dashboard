import { sql } from "drizzle-orm";

import { db } from "./index";
import { bleDevices } from "./schema";

await db.run(sql`DROP TABLE IF EXISTS ble_device`);

await db.run(sql`
  CREATE TABLE ble_device (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bleId TEXT NOT NULL,
    phoneId TEXT NOT NULL,
    capturedAt INTEGER NOT NULL,
    accuracy REAL NOT NULL,
    strength INTEGER NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL
  )
`);

await db.run(
  sql`CREATE INDEX IF NOT EXISTS ble_device_ble_id_idx ON ble_device (bleId)`,
);
await db.run(
  sql`CREATE INDEX IF NOT EXISTS ble_device_phone_id_idx ON ble_device (phoneId)`,
);

const seedRows = [
  {
    bleId: "BLE-1001",
    phoneId: "MOB-1001",
    capturedAt: new Date("2026-04-01T08:12:00Z"),
    accuracy: 18.4,
    strength: -58,
    latitude: 51.505,
    longitude: -0.09,
  },
  {
    bleId: "BLE-1002",
    phoneId: "MOB-1002",
    capturedAt: new Date("2026-04-01T08:13:20Z"),
    accuracy: 24.1,
    strength: -61,
    latitude: 51.5054,
    longitude: -0.0892,
  },
  {
    bleId: "BLE-1003",
    phoneId: "MOB-1003",
    capturedAt: new Date("2026-04-01T08:14:10Z"),
    accuracy: 31.8,
    strength: -65,
    latitude: 51.5046,
    longitude: -0.0904,
  },
  {
    bleId: "BLE-1004",
    phoneId: "MOB-1004",
    capturedAt: new Date("2026-04-01T08:15:45Z"),
    accuracy: 27.6,
    strength: -69,
    latitude: 51.5058,
    longitude: -0.0911,
  },
  {
    bleId: "BLE-1001",
    phoneId: "MOB-1001",
    capturedAt: new Date("2026-04-01T08:17:00Z"),
    accuracy: 12.2,
    strength: -52,
    latitude: 51.5052,
    longitude: -0.0896,
  },
  {
    bleId: "BLE-1001",
    phoneId: "MOB-1001",
    capturedAt: new Date("2026-04-01T08:18:35Z"),
    accuracy: 8.7,
    strength: -47,
    latitude: 51.5049,
    longitude: -0.0901,
  },
  {
    bleId: "BLE-1001",
    phoneId: "MOB-1001",
    capturedAt: new Date("2026-04-01T08:20:15Z"),
    accuracy: 5.9,
    strength: -41,
    latitude: 51.5056,
    longitude: -0.091,
  },
  {
    bleId: "BLE-1002",
    phoneId: "MOB-1002",
    capturedAt: new Date("2026-04-01T08:16:40Z"),
    accuracy: 14.3,
    strength: -56,
    latitude: 51.5051,
    longitude: -0.0898,
  },
  {
    bleId: "BLE-1002",
    phoneId: "MOB-1002",
    capturedAt: new Date("2026-04-01T08:18:05Z"),
    accuracy: 10.4,
    strength: -49,
    latitude: 51.5048,
    longitude: -0.0902,
  },
  {
    bleId: "BLE-1002",
    phoneId: "MOB-1002",
    capturedAt: new Date("2026-04-01T08:19:55Z"),
    accuracy: 6.8,
    strength: -44,
    latitude: 51.5057,
    longitude: -0.0912,
  },
  {
    bleId: "BLE-1003",
    phoneId: "MOB-1003",
    capturedAt: new Date("2026-04-01T08:15:50Z"),
    accuracy: 21.9,
    strength: -63,
    latitude: 51.505,
    longitude: -0.0899,
  },
  {
    bleId: "BLE-1003",
    phoneId: "MOB-1003",
    capturedAt: new Date("2026-04-01T08:19:05Z"),
    accuracy: 13.2,
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
