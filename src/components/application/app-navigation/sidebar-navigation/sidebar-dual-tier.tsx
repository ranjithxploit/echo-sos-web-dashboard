"use client";

import type { FC } from "react";

import { ThemeToggle } from "~/components/application/theme-toggle";
import type { NavItemType } from "../config";
import { NavList } from "../base-components/nav-list";

type SidebarNavigationDualTierProps = {
  items: (NavItemType & { icon: FC<{ className?: string }> })[];
};

export const SidebarNavigationDualTier = ({
  items,
}: SidebarNavigationDualTierProps) => (
  <aside className="border-border bg-background text-foreground min-h-dvh border-r">
    <div className="flex min-h-dvh flex-col">
      <NavList items={items} className="px-3 pt-3" />

      <div className="border-border mt-auto border-t p-3">
        <ThemeToggle className="w-full justify-center" />
      </div>
    </div>
  </aside>
);
