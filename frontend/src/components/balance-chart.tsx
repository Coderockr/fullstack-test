'use client';

import { useMemo, useState } from 'react';
import type { TimelinePoint } from '@/lib/api';
import { formatBRL, formatBRLCompact, formatDate } from '@/lib/format';

// Cor da série validada pelo script do dataviz contra o cartão branco
const SERIES = '#4d7c0f';

const WIDTH = 660;
const HEIGHT = 240;
const MARGIN = { top: 18, right: 14, bottom: 30, left: 62 };
const PLOT_W = WIDTH - MARGIN.left - MARGIN.right;
const PLOT_H = HEIGHT - MARGIN.top - MARGIN.bottom;

interface BalanceChartProps {
  points: TimelinePoint[];
}

export function BalanceChart({ points }: BalanceChartProps) {
  const [hover, setHover] = useState<number | null>(null);

  const { xOf, yOf, yTicks, yTickLabels, xTicks, realized, projected } =
    useMemo(() => {
    const balances = points.map((p) => p.balanceCents);
    const min = Math.min(...balances);
    const max = Math.max(...balances);
    const pad = Math.max((max - min) * 0.12, 1);
    const yMin = min - pad;
    const yMax = max + pad;
    const lastIndex = Math.max(points.length - 1, 1);
    const round1 = (value: number) => Math.round(value * 10) / 10;
    const xOf = (i: number) => round1(MARGIN.left + (i / lastIndex) * PLOT_W);
    const yOf = (cents: number) =>
      round1(MARGIN.top + PLOT_H - ((cents - yMin) / (yMax - yMin)) * PLOT_H);
    const yTicks = [min, (min + max) / 2, max];
    // Faixas curtas fazem o formato compacto repetir rótulo ("R$ 1,1 mil"
    // duas vezes); nesse caso, usa reais inteiros, que cabem na margem
    const compact = yTicks.map((tick) => formatBRLCompact(tick));
    const wholeReais = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    });
    const yTickLabels =
      new Set(compact).size === compact.length
        ? compact
        : yTicks.map((tick) => wholeReais.format(tick / 100));
    const step = Math.max(1, Math.ceil(points.length / 6));
    const xTicks = points
      .map((p, i) => ({ point: p, index: i }))
      .filter(({ index }) => index % step === 0);
    const realized = points.filter((p) => !p.projected);
    const projected = points.slice(Math.max(realized.length - 1, 0));
    return { xOf, yOf, yTicks, yTickLabels, xTicks, realized, projected };
  }, [points]);

  if (points.length < 2) return null;

  const linePath = (pts: TimelinePoint[]) =>
    pts
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xOf(p.monthIndex)} ${yOf(p.balanceCents)}`)
      .join(' ');

  const last = realized[realized.length - 1];
  const areaPath =
    realized.length > 1
      ? `${linePath(realized)} L ${xOf(last.monthIndex)} ${MARGIN.top + PLOT_H} L ${xOf(0)} ${MARGIN.top + PLOT_H} Z`
      : null;

  const hovered = hover === null ? null : points[hover];

  function handleMove(event: React.MouseEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * WIDTH;
    const ratio = (x - MARGIN.left) / PLOT_W;
    const index = Math.round(ratio * (points.length - 1));
    setHover(Math.min(points.length - 1, Math.max(0, index)));
  }

  return (
    <figure>
      <div className="relative">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-auto w-full"
          role="img"
          aria-label="Evolução mensal do saldo do investimento"
          onMouseMove={handleMove}
          onMouseLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id="balance-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={SERIES} stopOpacity="0.28" />
              <stop offset="100%" stopColor={SERIES} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* linhas de grade + rótulos do eixo Y */}
          {yTicks.map((tick, index) => (
            <g key={tick}>
              <line
                x1={MARGIN.left}
                x2={WIDTH - MARGIN.right}
                y1={yOf(tick)}
                y2={yOf(tick)}
                stroke="currentColor"
                className="text-line"
                strokeWidth="1"
              />
              <text
                x={MARGIN.left - 8}
                y={yOf(tick)}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-muted text-[11px]"
              >
                {yTickLabels[index]}
              </text>
            </g>
          ))}

          {/* rótulos do eixo X */}
          {xTicks.map(({ point, index }) => (
            <text
              key={index}
              x={xOf(point.monthIndex)}
              y={HEIGHT - 8}
              textAnchor="middle"
              className="fill-muted text-[11px]"
            >
              {point.date.slice(5, 7)}/{point.date.slice(2, 4)}
            </text>
          ))}

          {/* área + linha realizada */}
          {areaPath && <path d={areaPath} fill="url(#balance-area)" />}
          <path
            d={linePath(realized)}
            fill="none"
            stroke={SERIES}
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* projeção tracejada */}
          {projected.length > 1 && (
            <path
              d={linePath(projected)}
              fill="none"
              stroke={SERIES}
              strokeWidth="2"
              strokeDasharray="5 5"
              strokeOpacity="0.7"
              strokeLinejoin="round"
            />
          )}

          {/* último ponto realizado + rótulo direto */}
          <circle
            cx={xOf(last.monthIndex)}
            cy={yOf(last.balanceCents)}
            r="4"
            fill={SERIES}
            stroke="var(--surface)"
            strokeWidth="2"
          />
          <text
            x={Math.min(xOf(last.monthIndex) + 8, WIDTH - MARGIN.right - 4)}
            y={yOf(last.balanceCents) - 10}
            textAnchor={xOf(last.monthIndex) > WIDTH * 0.75 ? 'end' : 'start'}
            className="fill-foreground text-[11px] font-medium"
          >
            {formatBRL(last.balanceCents)}
          </text>

          {/* crosshair de hover */}
          {hovered && (
            <g>
              <line
                x1={xOf(hovered.monthIndex)}
                x2={xOf(hovered.monthIndex)}
                y1={MARGIN.top}
                y2={MARGIN.top + PLOT_H}
                stroke="currentColor"
                className="text-muted/40"
                strokeWidth="1"
              />
              <circle
                cx={xOf(hovered.monthIndex)}
                cy={yOf(hovered.balanceCents)}
                r="4.5"
                fill={SERIES}
                stroke="var(--surface)"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>

        {hovered && (
          <div
            className="pointer-events-none absolute top-1 rounded-lg border border-line bg-surface-2 px-3 py-2 text-xs shadow-lg"
            style={{
              left: `${(xOf(hovered.monthIndex) / WIDTH) * 100}%`,
              transform:
                xOf(hovered.monthIndex) > WIDTH * 0.65
                  ? 'translateX(calc(-100% - 8px))'
                  : 'translateX(8px)',
            }}
          >
            <p className="text-muted">
              {formatDate(hovered.date)} · mês {hovered.monthIndex}
              {hovered.projected && (
                <span className="ml-1 text-accent">· projeção</span>
              )}
            </p>
            <p className="tabular mt-0.5 font-semibold">
              {formatBRL(hovered.balanceCents)}
            </p>
          </div>
        )}
      </div>

      <figcaption className="mt-2 flex items-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <svg width="18" height="4" aria-hidden>
            <line x1="0" y1="2" x2="18" y2="2" stroke={SERIES} strokeWidth="2" />
          </svg>
          Realizado
        </span>
        {projected.length > 1 && (
          <span className="flex items-center gap-1.5">
            <svg width="18" height="4" aria-hidden>
              <line
                x1="0"
                y1="2"
                x2="18"
                y2="2"
                stroke={SERIES}
                strokeWidth="2"
                strokeDasharray="4 3"
                strokeOpacity="0.7"
              />
            </svg>
            Projeção 12 meses
          </span>
        )}
      </figcaption>

      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-xs text-muted transition hover:text-foreground">
          Ver dados em tabela
        </summary>
        <div className="mt-2 max-h-56 overflow-y-auto rounded-lg border border-line">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-surface-2 text-left text-muted">
              <tr>
                <th className="px-3 py-2 font-medium">Mês</th>
                <th className="px-3 py-2 font-medium">Data</th>
                <th className="px-3 py-2 text-right font-medium">Saldo</th>
                <th className="px-3 py-2 font-medium">Tipo</th>
              </tr>
            </thead>
            <tbody>
              {points.map((point) => (
                <tr key={point.monthIndex} className="border-t border-line/60">
                  <td className="px-3 py-1.5">{point.monthIndex}</td>
                  <td className="px-3 py-1.5">{formatDate(point.date)}</td>
                  <td className="tabular px-3 py-1.5 text-right">
                    {formatBRL(point.balanceCents)}
                  </td>
                  <td className="px-3 py-1.5 text-muted">
                    {point.projected ? 'Projeção' : 'Realizado'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
