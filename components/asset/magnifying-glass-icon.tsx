export default function MagnifyingGlassIcon({
  className = "",
  strokeClassName = "",
}: AssetIcon) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlSpace="preserve"
      strokeMiterlimit={10}
      style={{
        fillRule: "nonzero",
        clipRule: "evenodd",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }}
      viewBox="0 0 21 21"
      className={className}
      aria-label="Magnifying glass icon"
    >
      <path
        fill="none"
        className={`${strokeClassName || "stroke-primary"}`}
        strokeWidth={1.3125}
        d="M14.296 14.311 19.5 19.5M16.5 9a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z"
      />
    </svg>
  );
}
