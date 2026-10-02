/** Small, local olive motif; decorative only, never a brand mark. */
export function BotanicalSprig() {
  return (
    <svg className="editorial-sprig" viewBox="0 0 180 260" fill="none" aria-hidden="true" focusable="false">
      <path d="M28 246C83 204 121 130 144 22" stroke="currentColor" strokeWidth="2" />
      {[{ x: 53, y: 202 }, { x: 79, y: 167 }, { x: 103, y: 125 }, { x: 124, y: 78 }].map(({ x, y }) => (
        <g key={y} stroke="currentColor" strokeWidth="1.5">
          <path d={`M${x} ${y}q-55-5-43-49q38 7 43 49Z`} />
          <path d={`M${x} ${y}q51 7 59-34q-43-5-59 34Z`} />
        </g>
      ))}
    </svg>
  );
}
