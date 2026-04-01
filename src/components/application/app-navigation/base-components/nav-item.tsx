"use client";

import type { FC, HTMLAttributes, MouseEventHandler, ReactNode } from "react";
import { ChevronDown, Share04 } from "@untitledui/icons";
import { Link as AriaLink } from "react-aria-components";
import { Badge } from "~/components/base/badges/badges";
import { cx, sortCx } from "~/lib/utils/cx";

const styles = sortCx({
  root: "group relative flex min-h-12 w-full cursor-pointer items-center rounded-xl border border-border bg-background outline-focus-ring transition duration-100 ease-linear select-none hover:bg-muted focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2",
  rootSelected: "border-primary bg-primary hover:bg-primary",
});

interface NavItemBaseProps {
  /** Whether the nav item shows only an icon. */
  iconOnly?: boolean;
  /** Whether the collapsible nav item is open. */
  open?: boolean;
  /** URL to navigate to when the nav item is clicked. */
  href?: string;
  /** Type of the nav item. */
  type: "link" | "collapsible" | "collapsible-child";
  /** Icon component to display. */
  icon?: FC<HTMLAttributes<HTMLOrSVGElement>>;
  /** Badge to display. */
  badge?: ReactNode;
  /** Whether the nav item is currently active. */
  current?: boolean;
  /** Whether to truncate the label text. */
  truncate?: boolean;
  /** Handler for click events. */
  onClick?: MouseEventHandler;
  /** Content to display. */
  children?: ReactNode;
}

export const NavItemBase = ({
  current,
  type,
  badge,
  href,
  icon: Icon,
  children,
  truncate = true,
  onClick,
}: NavItemBaseProps) => {
  const iconElement = Icon && (
    <Icon
      aria-hidden="true"
      className={cx(
        "transition-inherit-all text-muted-foreground group-hover/item:text-foreground mr-3 size-5 shrink-0",
        current && "text-primary-foreground",
      )}
    />
  );

  const badgeElement =
    badge && (typeof badge === "string" || typeof badge === "number") ? (
      <Badge className="ml-3" color="gray" type="pill-color" size="sm">
        {badge}
      </Badge>
    ) : (
      badge
    );

  const labelElement = (
    <span
      className={cx(
        "transition-inherit-all text-foreground group-hover/item:text-foreground flex-1 text-[0.95rem] font-semibold",
        truncate && "truncate",
        current && "text-white",
      )}
    >
      {children}
    </span>
  );

  const isExternal = href?.startsWith("http");
  const externalIcon = isExternal && (
    <Share04 className="text-muted-foreground size-4 stroke-[2.5px]" />
  );

  if (type === "collapsible") {
    return (
      <summary
        className={cx("px-3 py-3", styles.root, current && styles.rootSelected)}
        onClick={onClick}
      >
        {iconElement}

        {labelElement}

        {badgeElement}

        <ChevronDown
          aria-hidden="true"
          className="text-muted-foreground group-hover/item:text-foreground ml-3 size-4 shrink-0 stroke-[2.5px] in-open:-scale-y-100"
        />
      </summary>
    );
  }

  if (type === "collapsible-child") {
    return (
      <AriaLink
        href={href}
        target={isExternal ? "_blank" : "_self"}
        rel="noopener noreferrer"
        className={cx(
          "px-3 py-3 pl-10",
          styles.root,
          current && styles.rootSelected,
        )}
        onClick={onClick}
        aria-current={current ? "page" : undefined}
      >
        {labelElement}
        {externalIcon}
        {badgeElement}
      </AriaLink>
    );
  }

  return (
    <AriaLink
      href={href}
      target={isExternal ? "_blank" : "_self"}
      rel="noopener noreferrer"
      className={cx(
        "group/item px-3 py-3",
        styles.root,
        current && styles.rootSelected,
      )}
      onClick={onClick}
      aria-current={current ? "page" : undefined}
    >
      {iconElement}
      {labelElement}
      {externalIcon}
      {badgeElement}
    </AriaLink>
  );
};
