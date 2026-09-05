export function InstituteMark({
  className = "h-12 w-12",
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="شعار المعهد العالي لعلوم الحاسب ونظم المعلومات"
    >
      <circle cx="40" cy="40" r="38" fill="#0B1220" stroke="#D4A017" strokeWidth="3" />
      <circle cx="40" cy="40" r="30" stroke="#F59E0B" strokeWidth="1.2" opacity="0.7" />
      <path
        d="M22 46V28l18-8 18 8v18c0 10-8 16-18 20-10-4-18-10-18-20Z"
        fill="#111827"
        stroke="#F59E0B"
        strokeWidth="1.6"
      />
      <path d="M28 36h24M28 42h16" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="48" cy="42" r="2.2" fill="#F59E0B" />
      <path d="M34 30h12" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
      <text
        x="40"
        y="58"
        textAnchor="middle"
        fill="#F8FAFC"
        fontSize="9"
        fontWeight="800"
        fontFamily="Cairo, Arial, sans-serif"
      >
        CSIS
      </text>
    </svg>
  );
}
