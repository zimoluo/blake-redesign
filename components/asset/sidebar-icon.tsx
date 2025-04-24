export default function SidebarIcon({
  className = "",
  strokeClassName = "",
}: AssetIcon) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 1024 1024"
      aria-label="Sidebar"
      className={className}
    >
      <path
        className={`${strokeClassName ? strokeClassName : "stroke-primary"}`}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={64}
        d="M557.333 195v634m136-498.143H784m-90.667 135.857H784m-90.667 135.857H784M249.067 829h525.866c50.778 0 76.169 0 95.563-9.872a90.603 90.603 0 0 0 39.621-39.58C920 760.175 920 734.81 920 684.086V339.914c0-50.724 0-76.087-9.883-95.461a90.606 90.606 0 0 0-39.621-39.581C851.102 195 825.711 195 774.933 195H249.067c-50.778 0-76.168 0-95.562 9.872a90.615 90.615 0 0 0-39.623 39.581C104 263.827 104 289.189 104 339.914v344.172c0 50.724 0 76.089 9.882 95.462a90.613 90.613 0 0 0 39.623 39.58C172.899 829 198.288 829 249.067 829Z"
      />
    </svg>
  );
}
