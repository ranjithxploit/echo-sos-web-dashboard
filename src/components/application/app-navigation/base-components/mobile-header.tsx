"use client";

import type { PropsWithChildren } from "react";
import { X as CloseIcon, Menu02 } from "@untitledui/icons";
import {
  Button as AriaButton,
  Dialog as AriaDialog,
  DialogTrigger as AriaDialogTrigger,
  Modal as AriaModal,
  ModalOverlay as AriaModalOverlay,
} from "react-aria-components";
import { UntitledLogo } from "~/components/foundations/logo/untitledui-logo";
import { ThemeToggle } from "~/components/application/theme-toggle";
import { cx } from "~/lib/utils/cx";

export const MobileNavigationHeader = ({ children }: PropsWithChildren) => {
  return (
    <AriaDialogTrigger>
      <header className="border-border bg-background flex h-14 items-center justify-between gap-2 border-b p-3 pl-4 lg:hidden">
        <UntitledLogo className="h-6 shrink-0" />

        <div className="flex items-center gap-2">
          <ThemeToggle className="h-9 px-3" />

          <AriaButton
            aria-label="Expand navigation menu"
            className="group bg-secondary text-secondary-foreground outline-focus-ring hover:bg-secondary_hover hover:text-secondary-foreground flex items-center justify-center rounded-lg p-2 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <Menu02 className="size-6 transition duration-200 ease-in-out group-aria-expanded:opacity-0" />
            <CloseIcon className="absolute size-6 opacity-0 transition duration-200 ease-in-out group-aria-expanded:opacity-100" />
          </AriaButton>
        </div>
      </header>

      <AriaModalOverlay
        isDismissable
        className={({ isEntering, isExiting }) =>
          cx(
            "bg-overlay/70 fixed inset-0 z-50 cursor-pointer pr-16 backdrop-blur-md lg:hidden",
            isEntering && "animate-in fade-in duration-300 ease-in-out",
            isExiting && "animate-out fade-out duration-200 ease-in-out",
          )
        }
      >
        {({ state }) => (
          <>
            <AriaButton
              aria-label="Close navigation menu"
              onPress={() => state.close()}
              className="text-foreground/70 outline-focus-ring hover:bg-foreground/10 hover:text-foreground fixed top-2.5 right-3 flex cursor-pointer items-center justify-center rounded-lg p-2 focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <CloseIcon className="size-6" />
            </AriaButton>

            <AriaModal className="w-full max-w-74 cursor-auto will-change-transform">
              <AriaDialog className="h-dvh outline-hidden focus:outline-hidden">
                {children}
              </AriaDialog>
            </AriaModal>
          </>
        )}
      </AriaModalOverlay>
    </AriaDialogTrigger>
  );
};
