import React, { useEffect, useRef, useState } from 'react';
import {
  BarcodeOutlined,
  CameraOutlined,
  CheckCircleFilled,
  PlusOutlined,
  QrcodeOutlined,
  SearchOutlined,
  StopOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Tag,
  message,
} from 'antd';
import { Html5Qrcode } from 'html5-qrcode';
import stockService from '../services/stockService';
import { StockProduct } from '../types/stockManager';

export const StockManagement: React.FC = () => {
  const [searchInput, setSearchInput] = useState<string>('FM001');
  const [selectedProduct, setSelectedProduct] = useState<StockProduct | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [scanSuccessBanner, setScanSuccessBanner] = useState<boolean>(true);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [addForm] = Form.useForm();

  // Load default product Fresh Milk 1L on mount
  useEffect(() => {
    stockService.scanProduct('FM001').then((res) => {
      if (res) setSelectedProduct(res);
    });
  }, []);

  // Handle Scan action
  const handleScan = async (queryToSearch?: string) => {
    const term = (queryToSearch || searchInput).trim();
    if (!term) {
      message.warning('Please enter a QR / Barcode or Product Code');
      return;
    }

    const product = await stockService.scanProduct(term);
    if (product) {
      setSelectedProduct(product);
      setScanSuccessBanner(true);
      message.success(`Product ${product.name} loaded successfully`);
    } else {
      message.error(`No product found matching "${term}"`);
      setScanSuccessBanner(false);
    }
  };

  // Start Camera
  const startCamera = async () => {
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode('stock-qr-reader');
      }

      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
        },
        (decodedText) => {
          stopCamera();
          setSearchInput(decodedText);
          handleScan(decodedText);
        },
        () => {}
      );
      setIsScanning(true);
    } catch {
      message.info('Camera unavailable in preview. You can enter or select a barcode to scan!');
      setIsScanning(false);
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (e) {
        console.warn(e);
      }
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // Handle Add Product Submit
  const handleAddProduct = async (values: {
    code: string;
    name: string;
    category: StockProduct['category'];
    brand?: string;
    packSize?: string;
    mrp?: number;
    currentStock?: number;
    unit?: string;
    minThreshold?: number;
  }) => {
    setIsAdding(true);
    try {
      const stock = values.currentStock ?? 10;
      const newProd = await stockService.addProduct({
        code: values.code.toUpperCase(),
        name: values.name,
        category: values.category,
        brand: values.brand || 'Generic',
        packSize: values.packSize || '1 Unit',
        mrp: values.mrp || 50,
        currentStock: stock,
        unit: values.unit || 'Pack',
        minThreshold: values.minThreshold || 10,
        status: stock > 15 ? 'In Stock' : 'Low Stock',
        barcode: `${values.code}-${values.category.toUpperCase()}`,
        imageUrl:
          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop&q=80',
      });

      message.success('New product added to inventory successfully');
      setShowAddModal(false);
      addForm.resetFields();
      setSelectedProduct(newProd);
      setSearchInput(newProd.code);
      setScanSuccessBanner(true);
    } catch {
      message.error('Failed to add product');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 m-0">Stock Management</h1>
      </div>

      {/* Top Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 flex-1 max-w-xl">
          <Input
            prefix={<SearchOutlined className="text-slate-400 mr-1" />}
            placeholder="Scan QR / Barcode or Enter Product Code"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onPressEnter={() => handleScan()}
            size="large"
            className="rounded-lg text-sm"
            allowClear
          />
          <Button
            type="primary"
            onClick={() => handleScan()}
            size="large"
            className="bg-blue-600 hover:bg-blue-700 px-6 font-semibold rounded-lg"
          >
            Scan
          </Button>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setShowAddModal(true)}
          size="large"
          className="bg-blue-600 hover:bg-blue-700 font-semibold rounded-lg"
        >
          Add Product
        </Button>
      </div>

      {/* Two Column Layout: Scanner Viewport (Left) & Scanned Product Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Card: Camera Viewport */}
        <div className="lg:col-span-5">
          <Card
            className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden bg-white h-full flex flex-col justify-between"
            styles={{ body: { padding: '24px', height: '100%' } }}
          >
            <div className="flex flex-col items-center justify-center py-6">
              {/* QR Scanner Container */}
              <div className="relative w-64 h-64 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center overflow-hidden shadow-inner">
                <div id="stock-qr-reader" className="w-full h-full"></div>

                {!isScanning && (
                  <div className="flex flex-col items-center justify-center p-4 text-center">
                    {/* QR Code graphic */}
                    <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200 mb-3">
                      <QrcodeOutlined style={{ fontSize: '72px', color: '#1e293b' }} />
                    </div>
                    <p className="text-xs text-slate-500 m-0 font-medium">Camera standby</p>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-500 font-medium mt-4 m-0 text-center">
                Place the QR/Barcode in front of camera
              </p>

              <div className="mt-3">
                {!isScanning ? (
                  <Button
                    size="small"
                    icon={<CameraOutlined />}
                    onClick={startCamera}
                    className="text-xs"
                  >
                    Open Device Camera
                  </Button>
                ) : (
                  <Button
                    size="small"
                    danger
                    icon={<StopOutlined />}
                    onClick={stopCamera}
                    className="text-xs"
                  >
                    Stop Camera
                  </Button>
                )}
              </div>
            </div>

            {/* Quick barcode simulation picker */}
            <div className="pt-4 border-t border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Quick Scan Sample Codes:
              </span>
              <div className="flex flex-wrap gap-2">
                {['FM001', 'SN003', 'BR002', 'CJ004', 'SW005'].map((code) => (
                  <Tag
                    key={code}
                    color="blue"
                    className="cursor-pointer hover:opacity-80 px-2.5 py-1 text-xs font-mono font-bold"
                    onClick={() => {
                      setSearchInput(code);
                      handleScan(code);
                    }}
                  >
                    {code}
                  </Tag>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Card: Scanned Product Details matching Reference Panel 1 */}
        <div className="lg:col-span-7">
          {selectedProduct ? (
            <Card
              className="rounded-2xl border border-slate-200 shadow-sm bg-white overflow-hidden"
              styles={{ body: { padding: '28px' } }}
            >
              {/* Product Header Row with Thumbnail, Name, Code, Category, Tag */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-4 pb-6 border-b border-slate-100">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 flex-shrink-0 flex items-center justify-center p-2 shadow-sm">
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800 m-0">
                        {selectedProduct.name}
                      </h2>
                      <p className="text-xs text-slate-400 font-mono mt-0.5 m-0">
                        Product Code: <span className="text-slate-700 font-semibold">{selectedProduct.code}</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 m-0">
                        Category: <span className="text-slate-700 font-semibold">{selectedProduct.category}</span>
                      </p>
                    </div>

                    <Tag
                      color={
                        selectedProduct.status === 'In Stock'
                          ? 'success'
                          : selectedProduct.status === 'Low Stock'
                          ? 'warning'
                          : 'error'
                      }
                      className="px-3 py-0.5 rounded-md text-xs font-bold"
                    >
                      {selectedProduct.status}
                    </Tag>
                  </div>
                </div>
              </div>

              {/* Stock Metric Grid */}
              <div className="grid grid-cols-2 gap-6 py-6 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Current Stock
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-slate-800 tracking-tight">
                      {selectedProduct.currentStock.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Unit: {selectedProduct.unit}</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Last Updated
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {selectedProduct.lastUpdated}
                  </span>
                </div>
              </div>

              {/* Success Banner matching screenshot */}
              {scanSuccessBanner && (
                <div className="mt-6 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-800 text-xs font-semibold">
                  <CheckCircleFilled className="text-emerald-500 text-base" />
                  <span>Product scanned successfully!</span>
                </div>
              )}
            </Card>
          ) : (
            <Card className="rounded-2xl border border-slate-200 shadow-sm p-8 text-center text-slate-400">
              <BarcodeOutlined style={{ fontSize: '48px' }} />
              <p className="mt-3 text-sm">Scan a QR or Barcode to view real-time stock details</p>
            </Card>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 font-bold text-base text-slate-800">
            <PlusOutlined className="text-blue-600" />
            <span>Add New Product to Inventory</span>
          </div>
        }
        open={showAddModal}
        onCancel={() => setShowAddModal(false)}
        footer={null}
        width={540}
        centered
        destroyOnClose
      >
        <Form form={addForm} layout="vertical" onFinish={handleAddProduct} className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="code"
              label={<span className="text-xs font-semibold">Product Code</span>}
              rules={[{ required: true, message: 'Code required (e.g. FM001)' }]}
            >
              <Input placeholder="e.g. FM001" className="uppercase" />
            </Form.Item>

            <Form.Item
              name="name"
              label={<span className="text-xs font-semibold">Product Name</span>}
              rules={[{ required: true, message: 'Name required' }]}
            >
              <Input placeholder="e.g. Fresh Milk 1L" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="category"
              label={<span className="text-xs font-semibold">Category</span>}
              initialValue="Dairy"
              rules={[{ required: true }]}
            >
              <Select
                options={[
                  { value: 'Dairy', label: 'Dairy' },
                  { value: 'Snacks', label: 'Snacks' },
                  { value: 'Bakery', label: 'Bakery' },
                  { value: 'Beverages', label: 'Beverages' },
                  { value: 'Pantry', label: 'Pantry' },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="brand"
              label={<span className="text-xs font-semibold">Brand</span>}
              initialValue="DairyFresh"
            >
              <Input placeholder="e.g. DairyFresh" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Form.Item
              name="currentStock"
              label={<span className="text-xs font-semibold">Initial Stock</span>}
              initialValue={100}
              rules={[{ required: true }]}
            >
              <InputNumber min={0} className="w-full" />
            </Form.Item>

            <Form.Item
              name="unit"
              label={<span className="text-xs font-semibold">Unit</span>}
              initialValue="Pack"
            >
              <Select
                options={[
                  { value: 'Pack', label: 'Pack' },
                  { value: 'Bottle', label: 'Bottle' },
                  { value: 'Loaf', label: 'Loaf' },
                  { value: 'Bag', label: 'Bag' },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="mrp"
              label={<span className="text-xs font-semibold">MRP (₹)</span>}
              initialValue={50}
            >
              <InputNumber min={1} className="w-full" />
            </Form.Item>
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
            <Button onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={isAdding} className="bg-blue-600">
              Save Product
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default StockManagement;
