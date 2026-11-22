/** The Tirekick mark: a tyre (ring with tread) on the window-sticker yellow. */
export function Logo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect width="24" height="24" rx="5" fill="#ffc72c" />
      <circle cx="12" cy="12" r="7.2" fill="none" stroke="#17191c" strokeWidth="2.6" />
      <circle cx="12" cy="12" r="2.4" fill="#17191c" />
      <path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4" stroke="#17191c" strokeWidth="1.6" />
    </svg>
  );
}
