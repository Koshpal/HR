import React from 'react';

/** Plain numbers only: the dashboard turns figures the server hid into `hidden: true` before drawing. */
interface Props {
  data: Array<{ department: string; participationRate: number; hidden?: boolean }>;
}

// Geometry lifted from the Figma "Participation by Department" graph (845px-wide plot), except the left gutter,
// which grows with the longest department name so a label is never cut off.
const CHART_WIDTH = 845;
const MIN_AXIS_X = 99.244; // Figma's y-axis position
const MAX_LABEL_WIDTH = 280; // longer names are shortened (full name in the tooltip)
const CHAR_WIDTH = 8.1; // average glyph width of the 15.4px axis font
const LABEL_GAP = 8.44; // label right edge → axis
const AXIS_TOP = 6.43;
const LABEL_PITCH = 51.446;
const BAR_PITCH = 49.956;
const BAR_TOP = 19.45;
const BAR_HEIGHT = 36.218;
const BAR_INSET = 9.76; // Figma starts bars just right of the axis
const STROKE = 1.286;
const TICK_STEP = 20;
const TICK_MAX = 100; // participation is a percentage: a fixed 0–100 scale keeps every bar comparable
const RIGHT_PAD = 28; // room for the last tick label
const BOTTOM_PAD = 45.02;

const axisFont = 'font-inter text-[15.434px] font-normal leading-[19px] text-[#666]';

/** Figma "Participation by Department" horizontal bars; the top department is highlighted in blue. */
const DepartmentParticipationChart: React.FC<Props> = ({ data }) => {
  const rows = data.length;
  const longest = data.reduce((m, d) => Math.max(m, d.department.length), 0);
  const labelWidth = Math.min(MAX_LABEL_WIDTH, longest * CHAR_WIDTH);
  const axisX = Math.max(MIN_AXIS_X, Math.ceil(labelWidth + LABEL_GAP + 14));
  const pxPerUnit = (CHART_WIDTH - axisX - RIGHT_PAD) / TICK_MAX;
  const ticks = Array.from({ length: TICK_MAX / TICK_STEP + 1 }, (_, i) => i * TICK_STEP);

  const axisY = AXIS_TOP + rows * LABEL_PITCH;
  const height = axisY + BOTTOM_PAD;
  const visible = data.filter((d) => !d.hidden);
  const maxValue = visible.reduce((m, d) => Math.max(m, d.participationRate), 0);
  const topIndex = maxValue > 0 ? data.findIndex((d) => !d.hidden && d.participationRate === maxValue) : -1;

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
                style={{ left: axisX - STROKE / 2, top: AXIS_TOP, width: STROKE, height: rows * LABEL_PITCH }}
              />
              <div
                className="absolute bg-[#666]"
                style={{ left: axisX, top: axisY - STROKE / 2, width: TICK_MAX * pxPerUnit, height: STROKE }}
              />

              {/* categories + y ticks */}
              {data.map((dept, i) => {
                const tickY = AXIS_TOP + LABEL_PITCH / 2 + i * LABEL_PITCH;
                return (
                  <React.Fragment key={dept.department}>
                    <div
                      className="absolute bg-[#666]"
                      style={{ left: axisX - 5.67, top: tickY - STROKE / 2, width: 5.671, height: STROKE }}
                    />
                    <p
                      title={dept.department}
                      className={`absolute overflow-hidden text-ellipsis whitespace-nowrap text-right ${axisFont}`}
                      style={{ right: CHART_WIDTH - (axisX - LABEL_GAP), top: tickY - 9.955, maxWidth: MAX_LABEL_WIDTH }}
                    >
                      {dept.department}
                    </p>
                  </React.Fragment>
                );
              })}

              {/* x ticks */}
              {ticks.map((tick) => {
                const x = axisX + tick * pxPerUnit;
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
                      {tick}%
                    </p>
                  </React.Fragment>
                );
              })}

              {/* bars, each labelled with its value; a department too small to report shows "Hidden", not a bar */}
              {data.map((dept, i) => {
                const top = BAR_TOP + i * BAR_PITCH;
                const left = axisX + BAR_INSET;
                if (dept.hidden) {
                  return (
                    <p
                      key={dept.department}
                      title="Hidden to protect privacy: too few people in this department"
                      className="absolute flex items-center font-outfit text-[14px] italic text-neutral-400"
                      style={{ left: left + 6, top, height: BAR_HEIGHT }}
                    >
                      Hidden
                    </p>
                  );
                }
                const width = Math.max(0, dept.participationRate * pxPerUnit - BAR_INSET);
                return (
                  <React.Fragment key={dept.department}>
                    <div
                      title={`${dept.department}: ${dept.participationRate}%`}
                      className={`absolute rounded-r-full ${i === topIndex ? 'bg-primary-600' : 'bg-warning-500'}`}
                      style={{ left, top, height: BAR_HEIGHT, width }}
                    />
                    <p
                      className="absolute flex items-center font-outfit text-[14px] font-medium text-neutral-700"
                      style={{ left: left + width + 8, top, height: BAR_HEIGHT }}
                    >
                      {dept.participationRate}%
                    </p>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentParticipationChart;
