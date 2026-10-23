import React, { useState } from 'react';
import type { FinancialHealthDist } from '../../types/dashboard.types';
import { figma } from '../../assets/figma';

interface Props {
  data: FinancialHealthDist | null;
}

// Figma bar colours in order: Primary/600, Secondary/500, Warning/500 (+ Error/600 when the API sends a 4th band).
const BAR_COLORS = ['bg-primary-600', 'bg-secondary-500', 'bg-warning-500', 'bg-error-600'];
const LEGEND_ICONS: Array<string | null> = [figma.legendBlue, figma.legendCyan, figma.legendOrange, null];

// Best band first (Figma reads High → Low); unknown categories keep API order after the known ones.
const RANK = ['excellent', 'high', 'good', 'medium', 'fair', 'low', 'poor'];
const rank = (category: string) => {
  const i = RANK.indexOf(category.toLowerCase());
  return i === -1 ? RANK.length : i;
};

const BAR_AREA_HEIGHT = 177;
const Y_AXIS = ['100', '75', '50', '25', '0'];

/** Figma "Financial Health Distribution" bar graph: y-axis, rounded-top bars, hover tooltip, legend. */
const HealthDistributionChart: React.FC<Props> = ({ data }) => {
  const [hovered, setHovered] = useState<number | null>(null);

  const bands = [...(data?.distribution ?? [])]
    .map((item, index) => ({ item, index }))
    .sort((a, b) => rank(a.item.category) - rank(b.item.category) || a.index - b.index)
    .map(({ item }) => item);

  const label = (b: { category: string; range?: string }) => (b.range ? `${b.category} (${b.range})` : b.category);

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-4 rounded-[8px] bg-white p-4 shadow-low">
      <div className="flex h-[258px] w-full flex-col gap-[23px]">
        <p className="w-full font-jakarta text-[18px] font-semibold leading-8 text-neutral-800">
          Financial Health Distribution
        </p>

        <div className="flex min-h-0 w-full flex-1 gap-[14px]">
          <div className="flex h-full w-[22px] shrink-0 flex-col items-center justify-between font-outfit text-[12px] font-normal leading-[22px] text-neutral-800">
            {Y_AXIS.map((tick, i) => (
              <p
                key={tick}
                className={i === 0 ? 'h-[22px] w-[21px]' : 'h-[15.174px] w-[min-content] min-w-full'}
              >
                {tick}
              </p>
            ))}
          </div>

          <div className="relative flex h-full min-w-0 flex-1 items-end gap-3">
            <div className="flex h-full min-w-0 flex-1 flex-col items-center justify-end">
              {bands.length === 0 ? (
                <p className="mb-16 font-outfit text-[14px] leading-6 text-neutral-500">No data available</p>
              ) : (
                <div
                  className="flex w-full items-end justify-center gap-[14px]"
                  style={{ height: BAR_AREA_HEIGHT }}
                >
                  {bands.map((band, i) => {
                    const pct = Math.max(0, Math.min(100, band.value));
                    return (
                      <div
                        key={band.category}
                        className="relative flex h-full min-w-px flex-1 items-end"
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(null)}
                      >
                        <div
                          className={`w-full rounded-t-[10px] ${BAR_COLORS[i % BAR_COLORS.length]}`}
                          style={{ height: (pct / 100) * BAR_AREA_HEIGHT }}
                        />
                        {hovered === i && (
                          <div
                            className="pointer-events-none absolute left-1/2 z-10 flex w-[125px] -translate-x-1/2 flex-col items-center"
                            style={{ bottom: (pct / 100) * BAR_AREA_HEIGHT + 6 }}
                          >
                            <div className="relative z-10 h-[43px] w-full overflow-clip rounded-[8px] bg-white shadow-low">
                              <div className="absolute left-[16.5px] top-[7.14px] flex w-[92.486px] flex-col gap-[3.364px] whitespace-nowrap font-outfit font-normal">
                                <div className="flex h-[11.776px] items-center justify-between text-[10px] leading-[18px] text-neutral-500">
                                  <p>Progress</p>
                                  <p>Per%</p>
                                </div>
                                <div className="flex h-[14.299px] items-center justify-between text-[12px] leading-[22px] text-neutral-800">
                                  <p>{band.range ?? band.category}</p>
                                  <p className="text-right">{pct}%</p>
                                </div>
                              </div>
                            </div>
                            <div className="relative -mt-[3px] h-[10px] w-[20px]">
                              <div className="absolute bottom-1/4 left-[6.7%] right-[6.7%] top-0">
                                <img
                                  src={figma.tooltipPolygon}
                                  alt=""
                                  className="block size-full max-w-none rotate-180"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-6 w-full flex-wrap items-center justify-center gap-2">
        {bands.map((band, i) => (
          <div key={band.category} className="flex items-center gap-2">
            {LEGEND_ICONS[i % LEGEND_ICONS.length] ? (
              <img
                src={LEGEND_ICONS[i % LEGEND_ICONS.length]!}
                alt=""
                width={12}
                height={12}
                className="block max-w-none shrink-0"
              />
            ) : (
              <span className="block size-3 shrink-0 rounded-full bg-error-600" />
            )}
            <p className="whitespace-nowrap font-outfit text-[14px] font-normal leading-6 text-neutral-800">
              {label(band)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HealthDistributionChart;
