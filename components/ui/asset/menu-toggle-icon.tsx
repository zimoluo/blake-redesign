export default function MenuToggleIcon({ className = "" }: AssetIcon) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1024 1024"
      aria-label="Menu toggle"
      className={className}
    >
      <path
        className={"stroke-primary"}
        strokeLinecap="round"
        strokeWidth={64}
        fill="none"
        d="M904 512H120"
      />
    </svg>
  );
}
