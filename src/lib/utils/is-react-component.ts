import type React from "react";

type IconProps = { className?: string };

type ReactComponent =
  | React.FC<IconProps>
  | React.ComponentClass<IconProps, unknown>
  | React.ForwardRefExoticComponent<IconProps>;

/**
 * Checks if a given value is a function component.
 */
export const isFunctionComponent = (
  component: unknown,
): component is React.FC<IconProps> => {
  return typeof component === "function";
};

/**
 * Checks if a given value is a class component.
 */
export const isClassComponent = (
  component: unknown,
): component is React.ComponentClass<IconProps, unknown> => {
  if (typeof component !== "function") {
    return false;
  }

  const prototype = component.prototype as
    | { isReactComponent?: unknown; render?: unknown }
    | undefined;

  return !!prototype && (!!prototype.isReactComponent || !!prototype.render);
};

/**
 * Checks if a given value is a forward ref component.
 */
export const isForwardRefComponent = (
  component: unknown,
): component is React.ForwardRefExoticComponent<IconProps> => {
  if (typeof component !== "object" || component === null) {
    return false;
  }

  const forwardRefType = component as { $$typeof?: { toString: () => string } };

  return forwardRefType.$$typeof?.toString() === "Symbol(react.forward_ref)";
};

/**
 * Checks if a given value is a valid React component.
 */
export const isReactComponent = (
  component: unknown,
): component is ReactComponent => {
  return (
    isFunctionComponent(component) ||
    isForwardRefComponent(component) ||
    isClassComponent(component)
  );
};
