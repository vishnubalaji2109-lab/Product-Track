import React, { useState } from 'react';
import {
  DollarOutlined,
  QrcodeOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  SaveOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Button, Card, Form, Input, InputNumber, Radio, Select, Switch, message } from 'antd';
import { mockStockProducts } from '../mock/stockManagerData';
import { STORAGE_KEYS } from '../constants/authConstants';

export const Settings: React.FC = () => {
  const [form] = Form.useForm();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>(() => {
    return localStorage.getItem(STORAGE_KEYS.SCANNER_CAMERA_FACING) === 'user'
      ? 'user'
      : 'environment';
  });

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEYS.SCANNER_CAMERA_FACING, cameraFacing);
    message.success('Settings saved successfully!');
  };

  const handleResetData = () => {
    localStorage.setItem('stock_manager_products', JSON.stringify(mockStockProducts));
    localStorage.removeItem('stock_manager_daily_records');
    message.success('System demo data reset to reference state!');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <Card className="shadow-sm border-slate-200 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl">
            <SettingOutlined />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 m-0">
              System Settings & Configuration
            </h1>
            <p className="text-slate-500 text-sm mt-0.5 mb-0">
              Manage barcode scanner behaviors, currency preferences, and stock thresholds
            </p>
          </div>
        </div>
      </Card>

      {/* Main Settings Form */}
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          companyName: 'StockManager Retail Pvt Ltd',
          currency: 'INR (₹)',
          dateFormat: 'DD MMM YYYY',
          defaultMinStock: 25,
          scanBeep: true,
          vibrationFeedback: true,
          autoAddScanned: false,
        }}
        onFinish={handleSave}
      >
        {/* Scanner & Camera Configuration */}
        <Card
          title={
            <span className="font-bold text-slate-800 flex items-center gap-2">
              <QrcodeOutlined className="text-blue-600" />
              Barcode & Camera Scanner Preferences
            </span>
          }
          className="shadow-sm border-slate-200 rounded-xl mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item
              label="Camera Orientation"
              tooltip="Select default camera lens on mobile / tablet devices"
            >
              <Radio.Group
                value={cameraFacing}
                onChange={(e) => setCameraFacing(e.target.value)}
                buttonStyle="solid"
              >
                <Radio.Button value="environment">Back Camera (Environment)</Radio.Button>
                <Radio.Button value="user">Front Camera (User)</Radio.Button>
              </Radio.Group>
            </Form.Item>

            <Form.Item label="Scan Confirmation Audio Beep">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-sm text-slate-700 font-medium">
                  Play tone on successful barcode decode
                </span>
                <Switch checked={soundEnabled} onChange={setSoundEnabled} />
              </div>
            </Form.Item>

            <Form.Item name="autoAddScanned" valuePropName="checked" label="Auto Log Quantity">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-sm text-slate-700 font-medium">
                  Increment stock count by 1 automatically upon continuous scan
                </span>
                <Switch defaultChecked={false} />
              </div>
            </Form.Item>

            <Form.Item
              name="vibrationFeedback"
              valuePropName="checked"
              label="Haptic / Vibration Feedback"
            >
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-sm text-slate-700 font-medium">
                  Vibrate handheld device on detection
                </span>
                <Switch defaultChecked={true} />
              </div>
            </Form.Item>
          </div>
        </Card>

        {/* Currency & Inventory Parameters */}
        <Card
          title={
            <span className="font-bold text-slate-800 flex items-center gap-2">
              <DollarOutlined className="text-emerald-600" />
              Regional & Inventory Rules
            </span>
          }
          className="shadow-sm border-slate-200 rounded-xl mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item label="Store / Company Name" name="companyName">
              <Input placeholder="StockManager Retail Pvt Ltd" />
            </Form.Item>

            <Form.Item label="Currency Symbol" name="currency">
              <Select
                options={[
                  { value: 'INR (₹)', label: 'INR (₹) - Indian Rupee' },
                  { value: 'USD ($)', label: 'USD ($) - US Dollar' },
                  { value: 'EUR (€)', label: 'EUR (€) - Euro' },
                  { value: 'GBP (£)', label: 'GBP (£) - British Pound' },
                ]}
              />
            </Form.Item>

            <Form.Item label="Default Low Stock Threshold" name="defaultMinStock">
              <InputNumber min={1} max={500} className="w-full" addonAfter="units" />
            </Form.Item>

            <Form.Item label="Date Display Format" name="dateFormat">
              <Select
                options={[
                  { value: 'DD MMM YYYY', label: '22 Aug 2026 (DD MMM YYYY)' },
                  { value: 'YYYY-MM-DD', label: '2026-08-22 (ISO)' },
                  { value: 'MM/DD/YYYY', label: '08/22/2026 (US)' },
                ]}
              />
            </Form.Item>
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Save Changes
            </Button>
          </div>
        </Card>

        {/* Danger Zone / Demo Data Reset */}
        <Card
          title={
            <span className="font-bold text-red-600 flex items-center gap-2">
              <SafetyCertificateOutlined />
              Database & Mock Reset
            </span>
          }
          className="shadow-sm border-red-200 rounded-xl bg-red-50/20"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-slate-800 m-0">Restore Screenshot Demo Baseline</p>
              <p className="text-xs text-slate-500 m-0">
                Resets all stock quantities to match the reference image (Fresh Milk 1L [245 Pack],
                Potato Chips, etc.)
              </p>
            </div>
            <Button danger icon={<ReloadOutlined />} onClick={handleResetData}>
              Reset Data to Defaults
            </Button>
          </div>
        </Card>
      </Form>
    </div>
  );
};

export default Settings;
