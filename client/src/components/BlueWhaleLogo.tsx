export default function BlueWhaleLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="14" fill="#3B82F6" />
      <text x="16" y="21" textAnchor="middle" fill="white" fontSize="16">🐋</text>
    </svg>
  );
}
