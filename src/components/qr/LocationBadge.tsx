import React from 'react';
import {
  AlertOutlined,
  CheckCircleOutlined,
  CompassOutlined,
  EnvironmentOutlined,
  LoadingOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { Alert, Button, Tag } from 'antd';
import { LocationData } from '../../types/qr';

interface LocationBadgeProps {
  location: LocationData | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onSimulate?: () => void;
}

export const LocationBadge: React.FC<LocationBadgeProps> = ({
  location,
  isLoading,
  error,
  onRetry,
  onSimulate,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <EnvironmentOutlined style={{ fontSize: '18px' }} />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 m-0">
              Telemetry & Geolocation
            </h4>
            <span className="text-[11px] text-slate-400">Captured via Browser Geolocation API</span>
          </div>
        </div>

        <div>
          {isLoading ? (
            <Tag icon={<LoadingOutlined />} color="processing" className="m-0">
              Acquiring GPS...
            </Tag>
          ) : location ? (
            <Tag icon={<CheckCircleOutlined />} color="success" className="m-0 font-medium">
              Location Locked
            </Tag>
          ) : (
            <Tag icon={<AlertOutlined />} color="error" className="m-0">
              Location Required
            </Tag>
          )}
        </div>
      </div>

      {error ? (
        <div className="mt-3">
          <Alert
            message="Location Permission Required"
            description={
              <div>
                <p className="text-xs m-0 text-slate-600">{error}</p>
                <div className="mt-2.5 flex items-center gap-2">
                  <Button
                    size="small"
                    type="primary"
                    danger
                    icon={<ReloadOutlined />}
                    onClick={onRetry}
                    className="text-xs"
                  >
                    Retry Location Permission
                  </Button>
                  {onSimulate && (
                    <Button
                      size="small"
                      type="default"
                      icon={<CompassOutlined />}
                      onClick={onSimulate}
                      className="text-xs"
                    >
                      Use Mock Coordinates (Testing)
                    </Button>
                  )}
                </div>
              </div>
            }
            type="error"
            showIcon
            className="rounded-lg text-xs"
          />
        </div>
      ) : location ? (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
          <div>
            <span className="text-[10px] font-semibold uppercase text-slate-400 block">
              Latitude
            </span>
            <span className="text-xs sm:text-sm font-mono font-bold text-slate-800">
              {location.latitude.toFixed(4)}° N
            </span>
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase text-slate-400 block">
              Longitude
            </span>
            <span className="text-xs sm:text-sm font-mono font-bold text-slate-800">
              {location.longitude.toFixed(4)}° E
            </span>
          </div>
          <div className="col-span-2 sm:col-span-1 flex items-center justify-between sm:block">
            <span className="text-[10px] font-semibold uppercase text-slate-400 block">
              Accuracy
            </span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
              ± {location.accuracy} meters
            </span>
          </div>
        </div>
      ) : (
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Click capture to lock coordinates before submission.
          </span>
          <Button
            size="small"
            type="primary"
            icon={<EnvironmentOutlined />}
            onClick={onRetry}
            loading={isLoading}
            className="text-xs"
          >
            Capture My Location
          </Button>
        </div>
      )}
    </div>
  );
};

export default LocationBadge;
