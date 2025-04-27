"use client";

import { useId } from "react";

export default function LightboxIcon({
  className = "",
  strokeClassName = "",
  fillClassName = "",
}: AssetIcon) {
  const id = useId();

  const grad1 = `abhelgrlblblb-${id}`;
  const grad2 = `bfjaiowlblblb-${id}`;
  const grad3 = `cfjioerlblblb-${id}`;
  const grad4 = `dajiroelblblb-${id}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1139 1224"
      fill="none"
      aria-label="Lightbox"
      className={className}
    >
      <defs>
        <radialGradient
          id={grad1}
          cx={0}
          cy={0}
          r={1}
          gradientTransform="rotate(141.564 349.74 154.715) scale(894.764 785.631)"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#EEE" />
          <stop offset={1} stopColor="#D4D4D4" />
        </radialGradient>
        <radialGradient
          id={grad2}
          cx={0}
          cy={0}
          r={1}
          gradientTransform="rotate(141.564 492.936 459.776) scale(894.764 785.631)"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#EEE" />
          <stop offset={1} stopColor="#D4D4D4" />
        </radialGradient>
        <radialGradient
          id={grad3}
          cx={0}
          cy={0}
          r={1}
          gradientTransform="matrix(-1075.99823 954.00698 -853.93716 -963.13223 1191 30)"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#EEE" />
          <stop offset={1} stopColor="#D4D4D4" />
        </radialGradient>
        <radialGradient
          id={grad4}
          cx={0}
          cy={0}
          r={1}
          gradientTransform="matrix(-1075.99823 954.00698 -853.93716 -963.13223 1076 110)"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#EEE" />
          <stop offset={1} stopColor="#D4D4D4" />
        </radialGradient>
      </defs>

      <circle
        cx={352.5}
        cy={374.5}
        r={333.5}
        fill={`url(#${grad1})`}
        className="dark:opacity-0"
      />
      <circle
        cx={797.5}
        cy={829.5}
        r={333.5}
        fill={`url(#${grad2})`}
        className="dark:opacity-0"
      />
      <path
        fill={`url(#${grad3})`}
        className="dark:opacity-20"
        d="M115 287.752c0-153.194 133.644-272.09 285.796-254.26l512 60C1041.77 108.606 1139 217.893 1139 347.752v508.496c0 153.192-133.64 272.092-285.796 254.262l-512-60C212.228 1035.39 115 926.107 115 796.248V287.752Z"
      />
      <path
        fill={`url(#${grad4})`}
        className="dark:opacity-20"
        d="M0 367.752c0-153.194 133.644-272.09 285.796-254.26l512 60C926.772 188.606 1024 297.893 1024 427.752v508.496c0 153.192-133.644 272.092-285.796 254.262l-512-60C97.228 1115.39 0 1006.11 0 876.248V367.752Z"
      />
      <path
        className={strokeClassName || "stroke-primary"}
        strokeWidth={64}
        d="M32 367.752c0-133.521 116.026-237.266 248.512-222.655l1.559.177 512 60C906.925 218.499 992 314.126 992 427.752v508.496c0 134.042-116.938 238.082-250.071 222.482l-512-60C117.075 1085.5 32 989.874 32 876.248V367.752Z"
      />
      <path
        className={fillClassName || "fill-primary"}
        d="M53 502c302.652 0 548 279.374 548 624h-64c0-317.342-224.25-560-484-560v-64Z"
      />
      <path
        className={strokeClassName || "stroke-primary"}
        strokeLinecap="round"
        strokeWidth={64}
        d="m679.709 1040.02 109.732-7.68M634.633 841.094l101.99-41.207M523 652.414l79.127-76.412M343 518.488l44.741-100.49M137 450.934l3.839-109.933"
      />
    </svg>
  );
}
