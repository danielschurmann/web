import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 24, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  };
}

export function IconDocument(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <line x1="8" y1="8" x2="16" y2="8" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="8" y1="16" x2="13" y2="16" />
    </svg>
  );
}

export function IconTarget(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function IconBuilding(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="5" y="3" width="14" height="18" rx="1" />
      <line x1="9" y1="7" x2="9.01" y2="7" />
      <line x1="15" y1="7" x2="15.01" y2="7" />
      <line x1="9" y1="11" x2="9.01" y2="11" />
      <line x1="15" y1="11" x2="15.01" y2="11" />
      <line x1="9" y1="15" x2="9.01" y2="15" />
      <line x1="15" y1="15" x2="15.01" y2="15" />
    </svg>
  );
}

export function IconRobot(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="5" y="8" width="14" height="11" rx="3" />
      <line x1="12" y1="4" x2="12" y2="8" />
      <circle cx="12" cy="3.4" r="1.3" />
      <circle cx="9.5" cy="13" r="1" />
      <circle cx="14.5" cy="13" r="1" />
    </svg>
  );
}

export function IconWhatsapp(props: IconProps) {
  return (
    <svg
      {...base({ size: 19, strokeWidth: 2, ...props })}
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-11.7 7.7L4 20.5l1.4-5A8.38 8.38 0 1 1 21 11.5Z" />
    </svg>
  );
}

export function IconMenu(props: IconProps) {
  return (
    <svg {...base({ size: 22, strokeWidth: 2, ...props })}>
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  );
}

export function IconClose(props: IconProps) {
  return (
    <svg {...base({ size: 22, strokeWidth: 2, ...props })}>
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}
