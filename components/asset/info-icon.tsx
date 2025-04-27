export default function InfoIcon({
  className = "",
  strokeClassName = "",
  fillClassName = "",
}: AssetIcon) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-label="Info"
      className={className}
    >
      <circle
        cx={12}
        cy={12}
        r={10}
        className={`${strokeClassName || "stroke-primary"}`}
        strokeWidth={1.5}
      />
      <path
        className={`${strokeClassName || "stroke-primary"}`}
        strokeLinecap="round"
        strokeWidth={1.5}
        d="M12 17v-6"
      />
      <circle
        cx={1}
        cy={1}
        r={1}
        className={`${fillClassName || "fill-primary"}`}
        transform="matrix(1 0 0 -1 11 9)"
      />
    </svg>
  );
}
