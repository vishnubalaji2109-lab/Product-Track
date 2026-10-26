import React from 'react';
import { CheckCircleFilled, QrcodeOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Descriptions, Modal, Tag } from 'antd';
import { SubmittedResultItem } from '../../types/results';

interface ResultDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  result: SubmittedResultItem | null;
}

export const ResultDetailsModal: React.FC<ResultDetailsModalProps> = ({
  visible,
  onClose,
  result,
}) => {
  if (!result) return null;

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-base font-bold text-slate-800">
          <QrcodeOutlined className="text-blue-600" />
          <span>QR Scan Result Details</span>
          <Tag color="blue" className="ml-2 font-mono text-xs">
            #{result.id}
          </Tag>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose} className="rounded-lg">
          Close Details
        </Button>,
      ]}
      width={650}
      centered
      className="rounded-2xl overflow-hidden"
    >
      <div className="py-2 space-y-5">
        {/* Verification Banner */}
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircleFilled className="text-emerald-500 text-xl" />
            <div>
              <span className="font-bold text-emerald-950 text-sm block">
                Catalog Item Verified
              </span>
              <span className="text-xs text-emerald-700">{result.message}</span>
            </div>
          </div>
          <Tag color="success" className="font-bold uppercase text-xs px-2.5 py-0.5">
            {result.status}
          </Tag>
        </div>

        {/* Product Information */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Product Specification
          </h4>
          <Descriptions
            bordered
            size="small"
            column={{ xs: 1, sm: 2 }}
            className="bg-slate-50 rounded-lg overflow-hidden"
          >
            <Descriptions.Item label="Product Name">
              <span className="font-bold text-slate-800">{result.productName}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Product Code">
              <span className="font-mono font-semibold text-blue-600">{result.productCode}</span>
            </Descriptions.Item>
            <Descriptions.Item label="QR Code Value">
              <span className="font-mono font-medium text-slate-700">{result.qrCode}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Batch ID">
              <span className="font-mono text-xs text-slate-600">
                {result.batchNumber || 'BATCH-2026-X01'}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Manufacturer" span={2}>
              <span className="text-slate-700 font-medium">
                {result.manufacturer || 'Apex Electronics Ltd'}
              </span>
            </Descriptions.Item>
          </Descriptions>
        </div>

        {/* Telemetry and Location Information */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Captured Geographic Telemetry
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Latitude</span>
              <span className="text-sm font-mono font-bold text-slate-800">
                {result.location.latitude.toFixed(6)}° N
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Longitude
              </span>
              <span className="text-sm font-mono font-bold text-slate-800">
                {result.location.longitude.toFixed(6)}° E
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                GPS Accuracy
              </span>
              <span className="text-sm font-bold text-emerald-600">
                ±{result.location.accuracy} meters
              </span>
            </div>
          </div>
        </div>

        {/* Scan Log Metadata */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Audit Metadata
          </h4>
          <Descriptions
            bordered
            size="small"
            column={{ xs: 1, sm: 2 }}
            className="bg-slate-50 rounded-lg overflow-hidden"
          >
            <Descriptions.Item label="Scanned Date">
              <span className="text-slate-700 font-medium">{result.scannedDate}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Scanned Time">
              <span className="text-slate-700 font-medium">{result.scannedTime}</span>
            </Descriptions.Item>
            <Descriptions.Item label="ISO Timestamp" span={2}>
              <span className="font-mono text-xs text-slate-500">{result.scannedAt}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Submitted By" span={2}>
              <span className="text-slate-700 font-medium flex items-center gap-1.5">
                <UserOutlined className="text-blue-500" />
                {result.submittedBy || 'admin@example.com'}
              </span>
            </Descriptions.Item>
          </Descriptions>
        </div>
      </div>
    </Modal>
  );
};

export default ResultDetailsModal;
