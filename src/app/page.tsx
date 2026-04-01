"use client";

import "leaflet/dist/leaflet.css";

import { useEffect, useMemo, useRef, useState } from "react";
import type {
  DivIcon as LeafletDivIcon,
  Map as LeafletMap,
  Marker as LeafletMarker,
} from "leaflet";
import type { ColumnDef } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Map01, Rows01 } from "@untitledui/icons";

import { SidebarNavigationDualTier } from "~/components/application/app-navigation/sidebar-navigation/sidebar-dual-tier";
import type { NavItemType } from "~/components/application/app-navigation/config";
import { api } from "~/trpc/react";

type View = "map" | "table";

type BleDevice = {
  id: number;
  locationOfMobile: string;
  phoneId: string;
  capturedAt: Date;
  strength: number;
  latitude: number;
  longitude: number;
};

function MapPanel({ devices }: { devices: BleDevice[] }) {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    let map: LeafletMap | undefined;
    let markers: LeafletMarker[] = [];
    let isMounted = true;

    void import("leaflet").then((L) => {
      if (!isMounted || !mapRef.current) return;

      map = L.map(mapRef.current, {
        center: [51.505, -0.09],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
        {
          subdomains: "abcd",
          maxZoom: 20,
        },
      ).addTo(map);

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png",
        {
          subdomains: "abcd",
          maxZoom: 20,
        },
      ).addTo(map);

      markers = devices.map((device) => {
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
        }).addTo(map!);

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

      if (devices.length > 0) {
        const bounds = L.latLngBounds(
          devices.map(
            (device) => [device.latitude, device.longitude] as [number, number],
          ),
        );
        const currentMap = map;

        if (!currentMap) {
          return;
        }

        if (devices.length === 1) {
          currentMap.setView(bounds.getCenter(), 15);
        } else {
          currentMap.fitBounds(bounds.pad(0.35), {
            padding: [48, 48],
            maxZoom: 18,
          });
        }
      }
    });

    return () => {
      isMounted = false;
      markers.forEach((marker) => marker.remove());
      map?.remove();
    };
  }, [devices]);

  return (
    <div ref={mapRef} className="h-[calc(100dvh-8rem)] min-h-[560px] w-full" />
  );
}

export default function Home() {
  const [view, setView] = useState<View>(() =>
    typeof window !== "undefined" && window.location.hash === "#table"
      ? "table"
      : "map",
  );

  useEffect(() => {
    const syncView = () => {
      setView(window.location.hash === "#table" ? "table" : "map");
    };

    syncView();
    window.addEventListener("hashchange", syncView);

    return () => window.removeEventListener("hashchange", syncView);
  }, []);

  const bleQuery = api.ble.list.useQuery();
  const devices = bleQuery.data ?? [];

  const columns = useMemo<ColumnDef<BleDevice>[]>(
    () => [
      { accessorKey: "locationOfMobile", header: "Location of the Mobile" },
      { accessorKey: "phoneId", header: "Phone ID" },
      {
        accessorKey: "capturedAt",
        header: "Time",
        cell: ({ getValue }) => new Date(getValue<Date>()).toLocaleString(),
      },
      { accessorKey: "strength", header: "Strength" },
    ],
    [],
  );

  const table = useReactTable({
    data: devices,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const navItems: (NavItemType & { icon: typeof Map01 })[] = [
    { label: "Map", href: "#map", icon: Map01 },
    { label: "Table", href: "#table", icon: Rows01 },
  ];

  return (
    <main className="min-h-dvh bg-white text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <div className="grid min-h-dvh lg:grid-cols-[300px_1fr]">
        <SidebarNavigationDualTier items={navItems} />

        <section className="p-0 sm:p-4 lg:p-8">
          <div className="mx-auto flex min-h-dvh max-w-6xl flex-col bg-slate-50 lg:min-h-[calc(100dvh-4rem)] lg:rounded-3xl lg:border lg:border-slate-200 lg:shadow-[0_1px_30px_rgba(15,23,42,0.08)] dark:bg-slate-900 lg:dark:border-slate-800">
            <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
              <h2 className="text-lg font-semibold">
                {view === "map" ? "Map View" : "Table View"}
              </h2>
            </div>

            <div className="flex-1">
              {view === "map" ? (
                <MapPanel devices={devices} />
              ) : (
                <div className="bg-white dark:bg-slate-950">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-800">
                      <thead className="bg-slate-100 text-slate-600 dark:bg-slate-950/60 dark:text-slate-300">
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
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {table.getRowModel().rows.map((row) => (
                          <tr
                            key={row.id}
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                          >
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
