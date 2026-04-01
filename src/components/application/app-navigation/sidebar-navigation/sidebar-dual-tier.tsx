"use client";

import type { FC } from "react";

import type { NavItemType } from "../config";
import { NavList } from "../base-components/nav-list";

type SidebarNavigationDualTierProps = {
  items: (NavItemType & { icon: FC<{ className?: string }> })[];
};

export const SidebarNavigationDualTier = ({
  items,
}: SidebarNavigationDualTierProps) => (
  <aside className="min-h-dvh border-r border-slate-200 bg-white text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50">
    <NavList items={items} className="px-3 pt-3" />
  </aside>
);
