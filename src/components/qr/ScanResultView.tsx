import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircleFilled,
  ClockCircleOutlined,
  EnvironmentOutlined,
  FileDoneOutlined,
  QrcodeOutlined,
  ReloadOutlined,
  SendOutlined,
  TagOutlined,
} from '@ant-design/icons';
import { Button, Card, Tag } from 'antd';
import { QRScanResult } from '../../types/qr';

interface ScanResultViewProps {
  scanResult: QRScanResult;
  isSubmitting: boolean;
  onSubmit: () => void;
  onRescan: () => void;
  isSubmitted?: boolean;
}

export const ScanResultView: React.FC<ScanResultViewProps> = ({
  scanResult,
  isSubmitting,
  onSubmit,
  onRescan,
  isSubmitted = false,
}) => {
  const navigate = useNavigate();

  const formattedDate = new Date(scanResult.scannedAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const formattedTime = new Date(scanResult.scannedAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <Card
      className="shadow-lg rounded-2xl border-2 border-emerald-500/30 overflow-hidden bg-white"
      styles={{ body: { padding: '24px' } }}
    >
      {/* Header Banner */}
      <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
        <CheckCircleFilled className="text-emerald-500 text-2xl" />
        <div>
          <h3 className="text-base font-extrabold text-emerald-950 m-0">
            QR Code Scanned Successfully
          </h3>
          <p className="text-xs text-emerald-700 m-0">
            {scanResult.message || 'Product verified against inventory database'}
          </p>
        </div>
      </div>

      {/* Confirmation Grid Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-6">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Product Name
          </span>
          <span className="text-base font-bold text-slate-800 flex items-center gap-1.5">
            <TagOutlined className="text-blue-500" />
            {scanResult.productName}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Product Code
          </span>
          <span className="text-base font-mono font-bold text-blue-700">
            {scanResult.productCode}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Scanned QR Code
          </span>
          <span className="text-sm font-mono font-bold text-slate-700 flex items-center gap-1.5">
            <QrcodeOutlined className="text-slate-500" />
            {scanResult.qrCode}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Geographic Location
          </span>
          <span className="text-sm font-mono font-semibold text-slate-800 flex items-center gap-1.5">
            <EnvironmentOutlined className="text-emerald-600" />
            {scanResult.location.latitude.toFixed(4)}, {scanResult.location.longitude.toFixed(4)}
            <span className="text-xs text-slate-400 font-normal">
              (±{scanResult.location.accuracy}m)
            </span>
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Scanned At
          </span>
          <span className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
            <ClockCircleOutlined className="text-slate-400" />
            {formattedDate} {formattedTime}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Verification Status
          </span>
          <Tag color="success" className="px-3 py-0.5 rounded-full font-bold text-xs uppercase">
            {scanResult.status}
          </Tag>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <Button
          icon={<ReloadOutlined />}
          onClick={onRescan}
          disabled={isSubmitting}
          className="w-full sm:w-auto rounded-lg font-medium"
        >
          Cancel / Rescan
        </Button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {isSubmitted ? (
            <Button
              type="primary"
              icon={<FileDoneOutlined />}
              onClick={() => navigate('/submitted-results')}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 rounded-lg font-semibold h-10 px-6 shadow-md shadow-emerald-500/20"
            >
              View in Submitted Results →
            </Button>
          ) : (
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={onSubmit}
              loading={isSubmitting}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold h-10 px-6 shadow-md shadow-blue-500/20"
            >
              {isSubmitting ? 'Submitting Result...' : 'Submit Scanned Result'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ScanResultView;
