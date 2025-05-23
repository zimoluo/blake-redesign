export default function MoonIcon({
  className = "",
  strokeClassName = "",
}: AssetIcon) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-label="Moon"
      className={className}
    >
      <path
        className={`${strokeClassName || "stroke-primary"}`}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3.32 11.684a9 9 0 0 0 17.357 3.348A9 9 0 0 1 8.32 6.683c0-1.18.23-2.32.644-3.353a9.003 9.003 0 0 0-5.645 8.354Z"
      />
    </svg>
  );
}
