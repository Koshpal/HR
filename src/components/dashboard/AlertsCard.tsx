import React from 'react';
import type { DashboardAlert } from '../../types/dashboard.types';
import { figma } from '../../assets/figma';

interface Props {
  alerts: DashboardAlert[];
}

/** Figma "Alerts" panel (node "Remove Member"): title + chip, then bordered alert rows. */
const AlertsCard: React.FC<Props> = ({ alerts }) => (
  <div className="flex w-full flex-col gap-10 rounded-[8px] bg-white p-4 shadow-medium lg:w-[417px] lg:shrink-0">
    <div className="flex w-full items-center justify-between">
      <p className="min-w-0 flex-1 font-geist text-[20px] font-medium leading-9 text-neutral-800">Alerts</p>
      {alerts.length > 0 && (
        <div className="flex h-8 min-w-[84px] shrink-0 items-center justify-center rounded-[20px] border border-solid border-primary-500 bg-primary-50 px-4">
          <p className="text-center font-outfit text-[10px] font-normal leading-[18px] text-neutral-900">
            {alerts.length} New {alerts.length === 1 ? 'Update' : 'Updates'}
          </p>
        </div>
      )}
    </div>

    <div className="flex w-full flex-col gap-5">
      {alerts.length === 0 && (
        <p className="font-geist text-[16px] font-normal leading-[26px] text-neutral-700">No alerts right now.</p>
      )}
      {alerts.map((alert, index) => {
        const negative = alert.type === 'error' || alert.type === 'warning';
        return (
          <div
            key={`${alert.title}-${index}`}
            className="flex w-full flex-col rounded-[12px] border border-solid border-[rgba(35,35,35,0.1)] bg-white px-6 py-4"
          >
            <div className="flex w-full items-center gap-[18px]">
              <div className="flex w-[45px] shrink-0 items-center">
                {negative ? (
                  <div className="flex size-8 shrink-0 items-center justify-center">
                    <img
                      src={figma.alertTriangle}
                      alt=""
                      width={30.8614}
                      height={27.137}
                      className="block max-w-none"
                    />
                  </div>
                ) : (
                  <img src={figma.trendingUp} alt="" width={32} height={32} className="block max-w-none shrink-0" />
                )}
              </div>
              <img src={figma.alertDivider} alt="" width={1} height={68} className="block max-w-none shrink-0" />
              <div className="flex min-w-0 flex-1 flex-col items-end gap-2">
                <p className="w-full font-neue text-[20px] font-medium not-italic leading-9 text-neutral-800">
                  {alert.title}
                </p>
                <p className="w-full overflow-hidden font-geist text-[16px] font-normal leading-[26px] text-neutral-700">
                  {alert.message}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default AlertsCard;
