"use client";

import "leaflet/dist/leaflet.css";

import { useEffect, useMemo, useRef, useState } from "react";
import type {
  DivIcon as LeafletDivIcon,
  Map as LeafletMap,
  Layer as LeafletLayer,
  Marker as LeafletMarker,
  Polyline as LeafletPolyline,
} from "leaflet";
import type { ColumnDef } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Map01, Rows01 } from "@untitledui/icons";
import { Button as AriaButton } from "react-aria-components";

import { SidebarNavigationDualTier } from "~/components/application/app-navigation/sidebar-navigation/sidebar-dual-tier";
import type { NavItemType } from "~/components/application/app-navigation/config";
import { api } from "~/trpc/react";

type View = "map" | "table";

type BleDevice = {
  id: number;
  bleId: string;
  locationOfMobile: string;
  phoneId: string;
  capturedAt: Date;
  strength: number;
  latitude: number;
  longitude: number;
};

function BleSelector({
  devices,
  selectedPhoneId,
  setSelectedPhoneId,
  onGo,
}: {
  devices: BleDevice[];
  selectedPhoneId: string;
  setSelectedPhoneId: (value: string) => void;
  onGo: () => void;
}) {
  const options = useMemo(() => {
    const ids = new Set(devices.map((device) => device.bleId));

    return Array.from(ids)
      .sort()
      .map((phoneId) => ({
        id: phoneId,
        label: phoneId,
      }));
  }, [devices]);

  return (
    <div className="flex items-center gap-2">
      <select
        aria-label="Select BLE ID"
        className="bg-background text-foreground ring-border h-9 w-[210px] rounded-lg px-3 text-sm ring-1 outline-none"
        value={selectedPhoneId}
        onChange={(event) => setSelectedPhoneId(event.target.value)}
      >
        <option value="">BLE ID</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>

      <AriaButton
        onPress={onGo}
        className="bg-primary text-primary-foreground hover:bg-primary_hover outline-focus-ring h-9 rounded-lg px-4 text-sm font-semibold"
      >
        GO
      </AriaButton>
    </div>
  );
}

function BleDetails({ reports }: { reports: BleDevice[] }) {
  if (!reports.length) {
    return (
      <div className="text-muted-foreground text-xs">
        Pick a BLE ID and press GO.
      </div>
    );
  }

  const [latestReport] = reports as [BleDevice, ...BleDevice[]];

  const getReportTone = (index: number, total: number) => {
    if (total <= 1) {
      return "bg-red-600/20 text-red-950";
    }

    const step = Math.max(1, total - 1);
    const intensity = index / step;

    if (intensity >= 1) return "bg-red-600 text-white";
    if (intensity >= 0.66) return "bg-red-500 text-white";
    if (intensity >= 0.33) return "bg-red-400 text-red-950";
    return "bg-red-200 text-red-950";
  };

  return (
    <div className="mt-2 space-y-1 text-xs">
      <div className="text-foreground flex flex-wrap gap-x-3 gap-y-1">
        <span className="font-semibold">{latestReport.bleId}</span>
        <span className="text-muted-foreground">{latestReport.phoneId}</span>
        <span className="text-muted-foreground">
          {latestReport.locationOfMobile}
        </span>
        <span className="text-muted-foreground">
          {new Date(latestReport.capturedAt).toLocaleString()}
        </span>
        <span className="text-muted-foreground">
          {latestReport.strength} dBm
        </span>
      </div>

      <div className="text-muted-foreground">
        {reports.length} report{reports.length === 1 ? "" : "s"} total
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {reports.map((report, index) => (
          <span
            key={report.id}
            className={`rounded-full px-2 py-1 ${getReportTone(index, reports.length)}`}
          >
            {report.locationOfMobile} ·{" "}
            {new Date(report.capturedAt).toLocaleDateString()}
          </span>
        ))}
      </div>
    </div>
  );
}

function MapPanel({
  devices,
  isRouteVisible,
  hasRoute,
  onToggleRoute,
}: {
  devices: BleDevice[];
  isRouteVisible: boolean;
  hasRoute: boolean;
  onToggleRoute: () => void;
}) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const lightBaseLayerRef = useRef<LeafletLayer | null>(null);
  const lightLabelLayerRef = useRef<LeafletLayer | null>(null);
  const satelliteLayerRef = useRef<LeafletLayer | null>(null);
  const markersRef = useRef<LeafletMarker[]>([]);
  const routeRef = useRef<LeafletPolyline | null>(null);
  const routeIndexMarkersRef = useRef<LeafletMarker[]>([]);
  const [isSatellite, setIsSatellite] = useState(false);

  useEffect(() => {
    const container = mapRef.current;

    if (!container) return;

    let cancelled = false;

    void import("leaflet").then((L) => {
      if (cancelled || !container) return;

      if (!mapInstanceRef.current) {
        mapInstanceRef.current = L.map(container, {
          center: [51.505, -0.09],
          zoom: 13,
          zoomControl: false,
          attributionControl: false,
        });

        lightBaseLayerRef.current = L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
          {
            subdomains: "abcd",
            maxZoom: 20,
          },
        ).addTo(mapInstanceRef.current);

        lightLabelLayerRef.current = L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png",
          {
            subdomains: "abcd",
            maxZoom: 20,
          },
        ).addTo(mapInstanceRef.current);

        satelliteLayerRef.current = L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          {
            maxZoom: 19,
            attribution: "Tiles \u00a9 Esri",
          },
        );
      }

      const map = mapInstanceRef.current;

      if (!map) return;

      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = devices.map((device) => {
        const isStrong = device.strength >= -52;
        const color = isStrong ? "#22c55e" : "#ef4444";
        const halo = isStrong
          ? "rgba(34, 197, 94, 0.35)"
          : "rgba(239, 68, 68, 0.35)";

        const markerIcon: LeafletDivIcon = L.divIcon({
          className: "ble-symbol-marker",
          html: `
            <div class="ble-symbol-marker__outer" style="--ble-color: ${color}; --ble-halo: ${halo}">
              <div class="ble-symbol-marker__pulse"></div>
              <div class="ble-symbol-marker__inner"></div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -10],
        });

        const marker = L.marker([device.latitude, device.longitude], {
          icon: markerIcon,
        }).addTo(map);

        marker.bindTooltip(
          `
            <div class="ble-tooltip__place">${device.locationOfMobile}</div>
            <div class="ble-tooltip__coords">${device.latitude.toFixed(4)}, ${device.longitude.toFixed(4)}</div>
            <div class="ble-tooltip__strength ble-tooltip__strength--${isStrong ? "strong" : "weak"}">
              Strength ${device.strength} dBm
            </div>
          `,
          {
            direction: "top",
            sticky: true,
            opacity: 0.98,
            className: "ble-marker-tooltip",
            permanent: false,
          },
        );

        return marker;
      });

      routeRef.current?.remove();
      routeRef.current = null;
      routeIndexMarkersRef.current.forEach((marker) => marker.remove());
      routeIndexMarkersRef.current = [];

      if (isRouteVisible && devices.length > 1) {
        const routePoints = [...devices]
          .sort(
            (a, b) =>
              new Date(a.capturedAt).getTime() -
              new Date(b.capturedAt).getTime(),
          )
          .map(
            (device) => [device.latitude, device.longitude] as [number, number],
          );

        routeRef.current = L.polyline(routePoints, {
          color: "#ef4444",
          weight: 4,
          opacity: 0.8,
          dashArray: "6 10",
        }).addTo(map);

        routeIndexMarkersRef.current = routePoints
          .slice(0, -1)
          .map((point, index) => {
            const nextPoint = routePoints[index + 1]!;
            const midpoint: [number, number] = [
              (point[0] + nextPoint[0]) / 2,
              (point[1] + nextPoint[1]) / 2,
            ];

            const indexMarker = L.marker(midpoint, {
              icon: L.divIcon({
                className: "ble-route-index-marker",
                html: `<span>${index + 1}</span>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12],
              }),
              interactive: false,
            }).addTo(map);

            return indexMarker;
          });
      }

      if (devices.length > 0) {
        const bounds = L.latLngBounds(
          devices.map(
            (device) => [device.latitude, device.longitude] as [number, number],
          ),
        );
        if (devices.length === 1) {
          map.setView(bounds.getCenter(), 15);
        } else {
          map.fitBounds(bounds.pad(0.35), {
            padding: [48, 48],
            maxZoom: 18,
          });
        }
      }

      requestAnimationFrame(() => {
        if (!cancelled) {
          map.invalidateSize();
        }
      });
    });

    return () => {
      cancelled = true;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      routeRef.current?.remove();
      routeRef.current = null;
      routeIndexMarkersRef.current.forEach((marker) => marker.remove());
      routeIndexMarkersRef.current = [];
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;

      if (container) {
        container.innerHTML = "";
      }
    };
  }, [devices, isRouteVisible]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const lightBase = lightBaseLayerRef.current;
    const lightLabels = lightLabelLayerRef.current;
    const satellite = satelliteLayerRef.current;

    if (!map || !lightBase || !lightLabels || !satellite) return;

    if (isSatellite) {
      if (map.hasLayer(lightBase)) map.removeLayer(lightBase);
      if (map.hasLayer(lightLabels)) map.removeLayer(lightLabels);
      if (!map.hasLayer(satellite)) map.addLayer(satellite);
    } else {
      if (map.hasLayer(satellite)) map.removeLayer(satellite);
      if (!map.hasLayer(lightBase)) map.addLayer(lightBase);
      if (!map.hasLayer(lightLabels)) map.addLayer(lightLabels);
    }
  }, [isSatellite]);

  return (
    <div className="relative">
      <div
        ref={mapRef}
        className="h-[calc(100dvh-8rem)] min-h-[560px] w-full"
      />

      <div className="absolute right-3 bottom-3 z-[500] flex flex-col items-end gap-2">
        {isSatellite && (
          <div className="bg-background/90 text-foreground rounded-full px-3 py-1 text-xs shadow-lg backdrop-blur">
            Satellite view enabled
          </div>
        )}

        <AriaButton
          onPress={() => setIsSatellite((value) => !value)}
          className="bg-background text-foreground border-border hover:bg-muted rounded-full border px-3 py-2 text-xs font-semibold shadow-lg"
        >
          {isSatellite ? "Map view" : "Satellite"}
        </AriaButton>
      </div>

      {hasRoute && (
        <div className="absolute top-3 right-3 z-[500]">
          <AriaButton
            onPress={onToggleRoute}
            className="bg-primary text-primary-foreground hover:bg-primary_hover rounded-full px-4 py-2 text-xs font-semibold shadow-lg"
          >
            {isRouteVisible ? "Hide Lines" : "Show Lines"}
          </AriaButton>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [view, setView] = useState<View>("map");
  useEffect(() => {
    const syncView = () => {
      const params = new URL(window.location.href).searchParams;

      setView(params.get("view") === "table" ? "table" : "map");
    };

    syncView();
    window.addEventListener("popstate", syncView);

    return () => window.removeEventListener("popstate", syncView);
  }, []);

  const bleQuery = api.ble.list.useQuery();
  const devices = bleQuery.data ?? [];
  const [selectedPhoneId, setSelectedPhoneId] = useState("");
  const [activePhoneId, setActivePhoneId] = useState("");
  const [hasRoute, setHasRoute] = useState(false);
  const [isRouteVisible, setIsRouteVisible] = useState(false);

  const selectedReportsQuery = api.ble.byBleId.useQuery(activePhoneId, {
    enabled: Boolean(activePhoneId),
  });

  const selectedReports = selectedReportsQuery.data ?? [];

  const columns = useMemo<ColumnDef<BleDevice>[]>(
    () => [
      { accessorKey: "bleId", header: "BLE ID" },
      { accessorKey: "phoneId", header: "Phone ID" },
      { accessorKey: "locationOfMobile", header: "Location of the Mobile" },
      {
        accessorKey: "capturedAt",
        header: "Time",
        cell: ({ getValue }) => new Date(getValue<Date>()).toLocaleString(),
      },
      { accessorKey: "strength", header: "Strength" },
      {
        id: "navigate",
        header: "",
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => {
              window.localStorage.setItem("selectedBleId", row.original.bleId);
              window.localStorage.removeItem("showBleRoute");
              window.location.href = "/?view=map";
            }}
            className="bg-primary text-primary-foreground hover:bg-primary_hover inline-flex h-8 items-center rounded-lg px-3 text-xs font-semibold"
          >
            Navigate
          </button>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: devices,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const navItems: (NavItemType & { icon: typeof Map01 })[] = [
    { label: "Map", href: "/?view=map", icon: Map01 },
    { label: "Table", href: "/?view=table", icon: Rows01 },
  ];

  const selectedDevicesForMap = activePhoneId
    ? devices.filter((device) => device.bleId === activePhoneId)
    : devices;

  useEffect(() => {
    const selectedBleId = window.localStorage.getItem("selectedBleId");

    if (selectedBleId) {
      setActivePhoneId(selectedBleId);
      setSelectedPhoneId(selectedBleId);
      window.localStorage.removeItem("selectedBleId");
      setHasRoute(false);
      setIsRouteVisible(false);
    }

    window.localStorage.removeItem("showBleRoute");
  }, []);

  return (
    <main className="bg-background text-foreground min-h-dvh">
      <div className="grid min-h-dvh lg:grid-cols-[300px_1fr]">
        <SidebarNavigationDualTier items={navItems} />

        <section className="p-0 sm:p-4 lg:p-8">
          <div className="bg-card lg:border-border mx-auto flex min-h-dvh max-w-7xl flex-col lg:min-h-[calc(100dvh-4rem)] lg:rounded-3xl lg:border lg:shadow-[0_1px_30px_rgba(15,23,42,0.08)]">
            <div className="border-border border-b px-5 py-4">
              <h2 className="text-lg font-semibold">
                {view === "map" ? "Map View" : "Table View"}
              </h2>
              {view === "map" && <BleDetails reports={selectedReports} />}
            </div>

            <div className="flex-1">
              {view === "map" ? (
                <div className="relative">
                  <MapPanel
                    devices={selectedDevicesForMap}
                    isRouteVisible={isRouteVisible}
                    hasRoute={hasRoute}
                    onToggleRoute={() => setIsRouteVisible((value) => !value)}
                  />
                  <div className="absolute top-3 left-3 z-[500]">
                    <BleSelector
                      devices={devices}
                      selectedPhoneId={selectedPhoneId}
                      setSelectedPhoneId={setSelectedPhoneId}
                      onGo={() => {
                        const nextBleId = selectedPhoneId.trim();

                        setActivePhoneId(nextBleId);
                        setHasRoute(true);
                        setIsRouteVisible(false);
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-background">
                  <div className="overflow-x-auto">
                    <table className="divide-border min-w-full divide-y text-left text-sm">
                      <thead className="bg-muted text-muted-foreground">
                        {table.getHeaderGroups().map((headerGroup) => (
                          <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                              <th
                                key={header.id}
                                className="px-4 py-3 font-medium"
                              >
                                {header.isPlaceholder
                                  ? null
                                  : flexRender(
                                      header.column.columnDef.header,
                                      header.getContext(),
                                    )}
                              </th>
                            ))}
                          </tr>
                        ))}
                      </thead>
                      <tbody className="divide-border divide-y">
                        {table.getRowModel().rows.map((row) => (
                          <tr key={row.id} className="hover:bg-muted">
                            {row.getVisibleCells().map((cell) => (
                              <td key={cell.id} className="px-4 py-3">
                                {cell.column.columnDef.cell
                                  ? flexRender(
                                      cell.column.columnDef.cell,
                                      cell.getContext(),
                                    )
                                  : String(cell.getValue())}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
