import React, { useMemo } from 'react';

export default function SalesChart({ salesRows }) {
  const data = useMemo(() => {
    const labels = salesRows.map((r) => r.name || 'Item');
    const qris = salesRows.map((r) => Number(r.qris || 0));
    const transfer = salesRows.map((r) => Number(r.transfer || 0));
    const cash = salesRows.map((r) => Number(r.cash || 0));
    const maxVal = Math.max(1, ...qris, ...transfer, ...cash);
    return { labels, qris, transfer, cash, maxVal };
  }, [salesRows]);

  const barWidth = 18;
  const gap = 18;
  const groupWidth = barWidth * 3 + gap;
  const height = 220;
  const padding = 24;
  const width = Math.max(320, padding * 2 + data.labels.length * groupWidth);

  const scaleY = (v) => (v / data.maxVal) * (height - padding * 2);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
      <h3 className="text-lg font-semibold text-orange-400 mb-3">Sales Chart</h3>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <defs>
          <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="g2" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="g3" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
          const y = padding + (height - padding * 2) * (1 - t);
          return (
            <g key={i}>
              <line x1={padding} x2={width - padding} y1={y} y2={y} stroke="#374151" strokeOpacity="0.4" />
              <text x={8} y={y} fill="#9ca3af" fontSize="10">{Math.round(data.maxVal * t)}</text>
            </g>
          );
        })}
        {data.labels.map((label, i) => {
          const x0 = padding + i * groupWidth;
          const bars = [
            { val: data.qris[i], fill: 'url(#g1)' },
            { val: data.transfer[i], fill: 'url(#g2)' },
            { val: data.cash[i], fill: 'url(#g3)' },
          ];
          return (
            <g key={i} transform={`translate(${x0},0)`}>
              {bars.map((b, j) => {
                const h = scaleY(b.val);
                const x = j * barWidth + j * 2;
                const y = height - padding - h;
                return <rect key={j} x={x} y={y} width={barWidth} height={h} fill={b.fill} rx="4" />
              })}
              <text x={barWidth} y={height - 6} fill="#9ca3af" fontSize="10" textAnchor="middle">
                {label.length > 8 ? label.slice(0, 8) + '…' : label}
              </text>
            </g>
          );
        })}
        <g transform={`translate(${width - 120}, ${padding})`}>
          <rect x="0" y="0" width="110" height="44" fill="#0b0b0b" stroke="#1f2937" rx="8" />
          <g transform="translate(10,10)" fill="#e5e7eb" fontSize="10">
            <rect x="0" y="-7" width="10" height="10" fill="#fb923c" rx="2" />
            <text x="16" y="0">QRIS</text>
            <rect x="48" y="-7" width="10" height="10" fill="#22c55e" rx="2" />
            <text x="64" y="0">Transfer</text>
            <rect x="0" y="12" width="10" height="10" fill="#3b82f6" rx="2" />
            <text x="16" y="19">Cash</text>
          </g>
        </g>
      </svg>
    </div>
  );
}
