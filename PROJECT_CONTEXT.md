# Project Context

- ESP devices send BLE signals to nearby mobile apps.
- Mobile apps are the map points and data sources in the dashboard.
- If a mobile stops sending reports for about 5 minutes, it can switch into BLE beacon mode.
- In beacon mode, the mobile tries to communicate with nearby BLE-enabled mobile devices.
- The dashboard receives and displays reports from ESP/mobile sources.
- BLE records should keep both `bleId` and `phoneId`.
- The map should remain the primary visualization for current reports.
