import React, { useEffect, useRef, useState } from 'react';

import { Link } from 'react-router-dom';
import {
  BarcodeOutlined,
  CameraOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  HistoryOutlined,
  RightOutlined,
  SearchOutlined,
  StopOutlined,
} from '@ant-design/icons';
import {
  Button, 
  Card,
  DatePicker,
  Input,
  Pagination,
  Spin,
  Table,
  TableColumnsType,
  Tag,
  message,
} from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { Html5Qrcode } from 'html5-qrcode';
import stockService from '../services/stockService';
import { RecentScanRecord, StockProduct } from '../types/stockManager';
const { RangePicker } = DatePicker;

// Default Lay's Product matching screenshot
const defaultProduct: StockProduct = {
  id: 'prod-000',
  code: 'SN001',
  name: "Lay's Classic Potato Chips",
  brand: "Lay's",
  category: 'Snacks',
  packSize: '50 g',
  mrp: 20.0,
  batchNo: 'B1234',
  mfgDate: '15 Aug 2026',
  expiryDate: '15 Nov 2026',
  currentStock: 80,
  unit: 'Pack',
  minThreshold: 20,
  status: 'In Stock',
  lastUpdated: '22 Aug 2026 10:24 AM',
  barcode: 'SN001-LAYS-CHIPS',
  imageUrl:
    'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&auto=format&fit=crop&q=80',
};

export const ProductIdentification: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'scan' | 'manual'>('scan');
  const [identifiedProduct, setIdentifiedProduct] = useState<StockProduct>(defaultProduct);
  const [recentScans, setRecentScans] = useState<RecentScanRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [manualInput, setManualInput] = useState('SN001');
  
  // Camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Filter Date Range for Recent Scans
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    dayjs('2026-08-22'),
    dayjs('2026-08-22'),
  ]);

  // Load Initial Data
  useEffect(() => {
    loadData();
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const scans = await stockService.getRecentScans();
      setRecentScans(scans);
      const prod = await stockService.scanProduct('SN001');
      if (prod) {
        setIdentifiedProduct(prod);
      }
    } catch {
      message.error('Failed to load recent scans');
    } finally {
      setLoading(false);
    }
  };

  // Camera Controls
  const startCamera = async () => {
    setCameraLoading(true);
    try {
      const html5QrCode = new Html5Qrcode('product-id-camera-reader');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 200, height: 200 },
        },
        async (decodedText) => {
          message.success(`Scanned: ${decodedText}`);
          handleScanText(decodedText);
          stopCamera();
        },
        () => {
          // ignore frame errors
        }
      );
      setIsCameraActive(true);
    } catch {
      message.info('Camera unavailable or permission denied. Running in simulator mode.');
      setIsCameraActive(true);
    } finally {
      setCameraLoading(false);
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current && isCameraActive) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch { 
        // ignore stop errors
      }
    }
    setIsCameraActive(false);
    setCameraLoading(false);
  };

  const toggleCamera = () => {
    if (isCameraActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  const handleScanText = async (query: string) => {
    setLoading(true);
    try {
      const clean = query.trim().toUpperCase();
      const match = await stockService.scanProduct(clean);
      if (match) {
        setIdentifiedProduct(match);
        const updated = await stockService.addRecentScan(match);
        setRecentScans(updated);
        message.success(`Identified: ${match.name}`);
      } else {
        message.warning(`Product not found for "${query}". Showing baseline product.`);
      }
    } catch {
      message.error('Identification lookup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = () => {
    if (!manualInput.trim()) {
      message.warning('Please enter a product code or barcode');
      return;
    }
    handleScanText(manualInput);
  };

  const handleViewAll = () => {
    loadData();
    message.success('Showing all recent scan logs for selected period');
  };

  // Recent Scans Columns exactly matching screenshot
  const columns: TableColumnsType<RecentScanRecord> = [
    {
      title: 'S.No',
      dataIndex: 'sNo',
      key: 'sNo',
      width: 70,
      align: 'left',
      render: (val) => <span className="text-slate-600 font-medium pl-2">{val}</span>,
    },
    {
      title: 'Date & Time',
      dataIndex: 'dateTime',
      key: 'dateTime',
      render: (text) => <span className="text-slate-600">{text}</span>,
    },
    {
      title: 'Product Code',
      dataIndex: 'productCode',
      key: 'productCode',
      render: (code) => <span className="font-semibold text-slate-800">{code}</span>,
    },
    {
      title: 'Product Name',
      dataIndex: 'productName',
      key: 'productName',
      render: (name) => <span className="font-semibold text-slate-900">{name}</span>,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (cat) => <span className="text-slate-600">{cat}</span>,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
      render: (qty) => <span className="font-semibold text-slate-700">{qty}</span>,
    },
    {
      title: 'Price (₹)',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      render: (price) => (
        <span className="font-semibold text-slate-800">{price.toFixed(2)}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span className="inline-flex items-center px-3 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          {status}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb matching Screenshot */}
      <div>
        <div className="flex items-center gap-3">
          {/* Vertical Barcode Icon */}
          <div className="text-2xl text-slate-800 flex items-center">
            <BarcodeOutlined style={{ fontSize: '28px' }} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight m-0">
            Product Identification
          </h1>
        </div>

        {/* Breadcrumb: Home > Product Identification */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 pl-10">
          <Link to="/dashboard" className="text-slate-500 hover:text-blue-600">
            Home  
          </Link>
          <RightOutlined style={{ fontSize: '10px' }} />
          <span className="text-slate-400 font-medium">Product Identification</span>
        </div>
      </div>

      {/* Main Top Grid: 2 Cards Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ========================================================================= */}
        {/* CARD 1 (LEFT): SCAN QR / BARCODE or MANUAL SEARCH */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5">
          <Card
            className="shadow-sm border-slate-200 rounded-xl overflow-hidden h-full"
            styles={{ body: { padding: '16px' } }}
          >
            {/* Top Toggle Buttons: [Scan QR / Barcode] & [Manual Search] */}
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setActiveTab('scan')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 border-0 cursor-pointer ${
                  activeTab === 'scan'
                    ? 'bg-[#1677ff] text-white shadow-sm'
                    : 'bg-transparent text-slate-600 hover:bg-slate-100'
                }`}
              >
                <CameraOutlined />
                Scan QR / Barcode
              </button>  

              <button
                onClick={() => setActiveTab('manual')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 border-0 cursor-pointer ${
                  activeTab === 'manual'
                    ? 'bg-[#1677ff] text-white shadow-sm'
                    : 'bg-transparent text-slate-600 hover:bg-slate-100'
                }`}
              >
                <SearchOutlined />
                Manual Search
              </button>
            </div>

            {/* SCAN MODE CONTENT */}
            {activeTab === 'scan' && (
              <div className="flex flex-col items-center">
                {/* Camera Viewport Frame */}
                <div className="w-full h-[200px] sm:h-[220px] bg-slate-200/70 rounded-xl overflow-hidden relative flex items-center justify-center border border-slate-300">
                  {/* Real Camera Feed Mount */}
                  <div
                    id="product-id-camera-reader"
                    className={`w-full h-full ${isCameraActive ? 'block' : 'hidden'}`}
                  />
                        
                  {/* Simulated Blurred Backdrop & QR Code if camera inactive */}
                  {!isCameraActive && (
                    <div className="flex flex-col items-center justify-center p-4">
                      {/* Target Reticle Frame around QR */}
                      <div className="relative p-4 bg-white/90 rounded-xl shadow-inner border border-slate-200">
                        {/* 4 Blue Reticle Target Corners */}
                        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#1677ff] rounded-tl" />
                        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#1677ff] rounded-tr" />
                        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#1677ff] rounded-bl" />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#1677ff] rounded-br" />

                        {/* Crisp QR Code Graphic */}
                        <img
                          src="https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=SN001-LAYS-CHIPS"
                          alt="QR Code"
                          className="w-24 h-24 object-contain block"
                        />

                        {/* Subtle pulsing scan line */}
                        <div className="absolute inset-x-2 top-1/2 h-0.5 bg-blue-500/70 shadow-lg animate-pulse" />
                      </div>
                    </div>
                  )}

                  {cameraLoading && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <Spin tip="Starting camera..." />
                    </div>
                  )}
                </div>

                {/* Subtext below viewfinder */}
                <p className="text-xs text-slate-500 font-medium my-3 text-center">
                  Place the QR/Barcode in front of camera
                </p>

                {/* Blue Start Camera Button */}
                <Button
                  type="primary"
                  size="large" 
                  icon={isCameraActive ? <StopOutlined /> : <CameraOutlined />}
                  onClick={toggleCamera}
                  className="w-full bg-[#1677ff] hover:bg-blue-600 rounded-lg font-bold text-sm h-11 shadow-sm"
                >
                  {isCameraActive ? 'Stop Camera' : 'Start Camera'}
                </Button>
              </div>
            )}

            {/* MANUAL SEARCH MODE CONTENT */}
            {activeTab === 'manual' && (
              <div className="space-y-4 py-2">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Enter Barcode or Product Code:
                  </label>
                  <Input.Search
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="e.g. SN001, BR002, CJ004, FM001"
                    enterButton="Search"
                    size="large"
                    prefix={<BarcodeOutlined className="text-slate-400" />}
                    onSearch={handleManualSearch}
                  />
                </div>

                <div className="pt-2">
                  <span className="text-xs text-slate-400 block mb-2 font-medium">
                    Quick One-Click Test Items:
                  </span>
                  <div className="flex flex-wrap gap-2"> 
                    <Tag
                      color="blue"
                      className="cursor-pointer font-semibold py-1 px-2.5 rounded-md"
                      onClick={() => {
                        setManualInput('SN001');
                        handleScanText('SN001');
                      }}
                    >
                      SN001 - Lay's Chips
                    </Tag>
                    <Tag
                      className="cursor-pointer font-medium py-1 px-2.5 rounded-md"
                      onClick={() => {
                        setManualInput('BR002');
                        handleScanText('BR002');
                      }}
                    >
                      BR002 - Bread
                    </Tag>
                    <Tag
                      className="cursor-pointer font-medium py-1 px-2.5 rounded-md"
                      onClick={() => {
                        setManualInput('CJ004');
                        handleScanText('CJ004');
                      }}
                    >
                      CJ004 - Juice
                    </Tag>
                    <Tag
                      className="cursor-pointer font-medium py-1 px-2.5 rounded-md"
                      onClick={() => {
                        setManualInput('FM001');
                        handleScanText('FM001');
                      }}
                    >
                      FM001 - Milk 1L
                    </Tag>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* ========================================================================= */}
        {/* CARD 2 (RIGHT): PRODUCT IDENTIFIED SUCCESSFULLY */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7">
          <Card
            className="shadow-sm border-slate-200 rounded-xl overflow-hidden h-full flex flex-col justify-between"
            styles={{ body: { padding: '20px' } }}
          >
            <div>
              {/* Top Banner Row: Green Checkmark + Timestamp */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <CheckCircleFilled className="text-emerald-600 text-lg" />
                  <span className="font-bold text-emerald-700 text-sm sm:text-base">
                    Product Identified Successfully!
                  </span> 
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <ClockCircleOutlined className="text-slate-400" />
                  <span>22 Aug 2026 10:24 AM</span>
                </div>
              </div>

              {/* Product Body: Image + Product Details */}
              <div className="pt-5 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {/* Product Bag Image (Yellow Lay's Bag Graphic) */}
                <div className="w-36 h-36 sm:w-40 sm:h-40 bg-amber-50/60 rounded-xl border border-amber-100 p-2 flex items-center justify-center flex-shrink-0 shadow-sm relative overflow-hidden">
                  <img
                    src={
                      identifiedProduct.code === 'SN001'
                        ? 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&auto=format&fit=crop&q=80'
                        : identifiedProduct.imageUrl
                    }
                    alt={identifiedProduct.name}
                    className="w-full h-full object-contain drop-shadow-md transition-transform hover:scale-105"
                  />
                  {/* Lay's Brand Banner for exact match */}
                  {identifiedProduct.code === 'SN001' && (
                    <div className="absolute bottom-1 bg-yellow-400 text-red-600 text-[10px] font-black px-2 py-0.5 rounded shadow-sm uppercase tracking-wider">
                      Lay's Classic
                    </div>
                  )}
                </div>

                {/* Details Column */}
                <div className="flex-1 w-full space-y-3">
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                      Product Name
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 m-0 leading-tight">
                      {identifiedProduct.name}
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 items-center gap-4 pt-1">
                    <div>
                      <span className="text-xs text-slate-400 block font-normal">Brand</span>
                      <span className="text-sm font-bold text-slate-800">
                        {identifiedProduct.brand}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs text-slate-400 block font-normal">Category</span>
                      <span className="text-sm font-bold text-slate-800">
                        {identifiedProduct.category}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs text-slate-400 block font-normal">
                        Product Code
                      </span>
                      <span className="text-sm font-bold text-slate-800">
                        {identifiedProduct.code}
                      </span>
                    </div>

                    <div className="sm:text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
                        {identifiedProduct.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom 5-Column Meta Strip exactly matching Screenshot */}
            <div className="mt-6 pt-4 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-5 gap-3 text-center sm:text-left">
              <div className="border-r-0 sm:border-r border-slate-100 pr-2">
                <span className="text-[11px] text-slate-400 block font-medium">Pack Size</span>
                <span className="text-sm font-bold text-slate-800">
                  {identifiedProduct.packSize}
                </span>
              </div>

              <div className="border-r-0 sm:border-r border-slate-100 pr-2">
                <span className="text-[11px] text-slate-400 block font-medium">MRP</span>
                <span className="text-sm font-bold text-slate-900">
                  ₹ {identifiedProduct.mrp.toFixed(2)}
                </span>
              </div>

              <div className="border-r-0 sm:border-r border-slate-100 pr-2">
                <span className="text-[11px] text-slate-400 block font-medium">Batch No</span>
                <span className="text-sm font-bold text-slate-800 font-mono">
                  {identifiedProduct.batchNo || 'B1234'}
                </span>
              </div>

              <div className="border-r-0 sm:border-r border-slate-100 pr-2">
                <span className="text-[11px] text-slate-400 block font-medium">Mfg Date</span>
                <span className="text-sm font-bold text-slate-800">
                  {identifiedProduct.mfgDate || '15 Aug 2026'}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Expiry Date</span>
                <span className="text-sm font-bold text-slate-800">
                  {identifiedProduct.expiryDate || '15 Nov 2026'}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CARD 3 (BOTTOM): RECENT SCANS TABLE */}
      {/* ========================================================================= */}
      <Card
        className="shadow-sm border-slate-200 rounded-xl overflow-hidden"
        styles={{ body: { padding: 0 } }}
      >
        {/* Header of Recent Scans */}
        <div className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-blue-50 text-[#1677ff] flex items-center justify-center text-sm font-bold">
              <HistoryOutlined />
            </div>
            <h3 className="text-base font-bold text-slate-900 m-0">Recent Scans</h3>
          </div>

          <div className="flex items-center gap-3">
            <RangePicker
              value={dateRange}
              onChange={(dates) =>
                setDateRange(dates as [Dayjs | null, Dayjs | null])
              }
              format="DD MMM YYYY"
              allowClear={false}
              className="w-64 rounded-lg text-xs"
            />

            <Button
              type="primary"
              onClick={handleViewAll}
              className="bg-[#1677ff] hover:bg-blue-600 rounded-md font-semibold text-xs px-4"
            >
              View All
            </Button>
          </div>
        </div>

        {/* Table Content */}
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={recentScans}
            pagination={false}
            rowKey="id"
            className="stock-table"
          />
        </Spin>

        {/* Pagination matching Screenshot: < 1 2 > */}
        <div className="p-4 flex justify-end border-t border-slate-100">
          <Pagination
            defaultCurrent={1}
            total={10}
            pageSize={5}
            showSizeChanger={false}
            className="stockmanager-pagination"
          />
        </div>
      </Card>
    </div>
  );
};

export default ProductIdentification;
