import React from 'react';

/** Plain numbers only: the dashboard turns figures the server hid into zeros before drawing. */
interface Props {
  data: Array<{ department: string; participationRate: number }>;
}

// Geometry lifted from the Figma "Participation by Department" graph (845px-wide plot).
const CHART_WIDTH = 845;
const AXIS_X = 99.244; // y-axis line x
const AXIS_TOP = 6.43; // y-axis line top
const LABEL_PITCH = 51.446; // category label / tick spacing
const BAR_PITCH = 49.956; // bar spacing (differs slightly from the labels in the design)
const BAR_TOP = 19.45;
const BAR_HEIGHT = 36.218;
const BAR_LEFT = 109;
const STROKE = 1.286;
const PX_PER_UNIT = 741.029 / 80; // x-axis is 741px wide for 0–80
const TICK_STEP = 20;
const MIN_TICK_MAX = 80;
const BOTTOM_PAD = 45.02; // axis line → bottom of the chart box

const axisFont = 'font-inter text-[15.434px] font-normal leading-[19px] text-[#666]';

/** Figma "Participation by Department" horizontal bars; the top department is highlighted in blue. */
const DepartmentParticipationChart: React.FC<Props> = ({ data }) => {
  const rows = data.length;
  const maxValue = data.reduce((m, d) => Math.max(m, d.participationRate), 0);
  const tickMax = Math.max(MIN_TICK_MAX, Math.ceil(maxValue / TICK_STEP) * TICK_STEP);
  const ticks = Array.from({ length: tickMax / TICK_STEP + 1 }, (_, i) => i * TICK_STEP);

  const axisY = AXIS_TOP + rows * LABEL_PITCH;
  const height = axisY + BOTTOM_PAD;
  const topIndex = data.findIndex((d) => d.participationRate === maxValue);

  return (
    <div className="flex w-[874px] max-w-full flex-col gap-4 overflow-clip rounded-[8px] bg-white p-4 shadow-low">
      <div className="flex flex-col gap-[23px]">
        <p className="w-full font-jakarta text-[18px] font-semibold leading-8 text-neutral-800">
          Participation by Department
        </p>

        {rows === 0 ? (
          <div className="flex h-40 items-center justify-center font-outfit text-[14px] leading-6 text-neutral-500">
            No data available
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="relative" style={{ width: CHART_WIDTH, height }}>
              {/* axes */}
              <div
                className="absolute bg-[#666]"
                style={{ left: AXIS_X - STROKE / 2, top: AXIS_TOP, width: STROKE, height: rows * LABEL_PITCH }}
              />
              <div
                className="absolute bg-[#666]"
                style={{ left: AXIS_X, top: axisY - STROKE / 2, width: tickMax * PX_PER_UNIT, height: STROKE }}
              />

              {/* categories + y ticks */}
              {data.map((dept, i) => {
                const tickY = AXIS_TOP + LABEL_PITCH / 2 + i * LABEL_PITCH;
                return (
                  <React.Fragment key={dept.department}>
                    <div
                      className="absolute bg-[#666]"
                      style={{ left: 93.574, top: tickY - STROKE / 2, width: 5.671, height: STROKE }}
                    />
                    <p
                      className={`absolute whitespace-nowrap text-right ${axisFont}`}
                      style={{ right: CHART_WIDTH - 90.8, top: tickY - 9.955 }}
                    >
                      {dept.department}
                    </p>
                  </React.Fragment>
                );
              })}

              {/* x ticks */}
              {ticks.map((tick) => {
                const x = AXIS_X + tick * PX_PER_UNIT;
                return (
                  <React.Fragment key={tick}>
                    <div
                      className="absolute bg-[#666]"
                      style={{ left: x - STROKE / 2, top: axisY, width: STROKE, height: 7.717 }}
                    />
                    <p
                      className={`absolute -translate-x-1/2 whitespace-nowrap text-center ${axisFont}`}
                      style={{ left: x, top: axisY + 5.813 }}
                    >
                      {tick}
                    </p>
                  </React.Fragment>
                );
              })}

              {/* bars (end on the value's x-position; Figma starts them 10px right of the axis) */}
              {data.map((dept, i) => (
                <div
                  key={dept.department}
                  title={`${dept.department}: ${dept.participationRate}%`}
                  className={`absolute rounded-r-full ${i === topIndex ? 'bg-primary-600' : 'bg-warning-500'}`}
                  style={{
                    left: BAR_LEFT,
                    top: BAR_TOP + i * BAR_PITCH,
                    height: BAR_HEIGHT,
                    width: Math.max(BAR_HEIGHT, dept.participationRate * PX_PER_UNIT - (BAR_LEFT - AXIS_X)),
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentParticipationChart;
