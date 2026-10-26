import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CameraOutlined,
  ExperimentOutlined,
  FileDoneOutlined,
  QrcodeOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { Alert, Button, Card, Divider, Input, Space, Spin, Tag, message, notification } from 'antd';
import { Html5Qrcode } from 'html5-qrcode';
import { LocationBadge } from '../components/qr/LocationBadge';
import { ScanResultView } from '../components/qr/ScanResultView';
import { useAuth } from '../hooks/useAuth';
import { useGeolocation } from '../hooks/useGeolocation';
import { STORAGE_KEYS } from '../constants/authConstants';
import { mockCatalogProducts } from '../mock/qrData';
import qrService from '../services/qrService';
import { LocationData, QRScanResult } from '../types/qr';

  export const QRScanner: React.FC = () => {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isStartingCamera, setIsStartingCamera] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<QRScanResult | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [manualInput, setManualInput] = useState<string>('');

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Geolocation hook with auto capture
  const {
    location,
    error: locationError,
    isLoading: isLocationLoading,
    captureLocation,
    setSimulatedLocation,
  } = useGeolocation(true);

  // Initialize and start scanner
  const startScanner = async () => {
    if (isScanning || isStartingCamera) return;

    setCameraError(null);
    setIsStartingCamera(true);
    try {
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          'Camera access requires a secure HTTPS connection. Open this page using its HTTPS address.'
        );
      }

      const element = document.getElementById('qr-reader');
      if (!element) {
        throw new Error('The camera preview could not be initialized. Reload the page and try again.');
      }

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode('qr-reader');
      }

      const cameraFacing =
        localStorage.getItem(STORAGE_KEYS.SCANNER_CAMERA_FACING) === 'user'
          ? 'user'
          : 'environment';

      await scannerRef.current.start(
        { facingMode: cameraFacing },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleQRDetected(decodedText);
        },
        (_errorMessage) => {
          // Continuous scan frames; ignored to avoid console spam
        }
      );

      setIsScanning(true);
    } catch (err: unknown) {
      console.warn('Camera error or permission denied:', err);
      const errorName =
        typeof err === 'object' && err !== null && 'name' in err ? String(err.name) : '';
      const errorMessage = err instanceof Error ? err.message : '';
      let helpfulMessage = errorMessage || 'Unable to start the camera. Check browser permissions and try again.';

      if (errorName === 'NotAllowedError' || errorName === 'SecurityError') {
        helpfulMessage =
          'Camera permission was blocked. Allow camera access for this site in your browser or device settings, then tap Start Camera again.';
      } else if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
        helpfulMessage = 'No camera is available to this browser. Check that your device has a camera.';
      } else if (errorName === 'NotReadableError' || errorName === 'TrackStartError') {
        helpfulMessage =
          'The camera could not start. Close other apps using the camera, then tap Start Camera again.';
      } else if (errorName === 'OverconstrainedError' || errorName === 'ConstraintNotSatisfiedError') {
        helpfulMessage =
          'The selected camera is unavailable. Change Camera Orientation in Settings and try again.';
      }

      setCameraError(helpfulMessage);
      setIsScanning(false);
    } finally {
      setIsStartingCamera(false);
    }
  };

  // Stop scanner camera stream
  const stopScanner = async () => {
    if (!scannerRef.current) {
      setIsScanning(false);
      return;
    }

    try {
      await scannerRef.current.stop();
    } catch (err: unknown) {
      console.warn('Error stopping scanner:', err);
    }

    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .catch(() => {})
          .finally(() => {
            scannerRef.current?.clear();
          });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Central handler when a QR code string is received
  const handleQRDetected = async (rawCode: string) => {
    const code = (rawCode || '').trim();
    if (!code || code.length < 3) {
      message.error('Invalid QR code format. Code must contain at least 3 characters.');
      return;
    }

    await stopScanner();
    setIsProcessing(true);

    try {
      // Ensure we have coordinates, fallback to default coordinates if denied
      const activeLocation: LocationData = location || {
        latitude: 12.9716,
        longitude: 77.5946,
        accuracy: 15,
        timestamp: new Date().toISOString(),
      };

      // Validate coordinates bounds
      if (
        activeLocation.latitude < -90 ||
        activeLocation.latitude > 90 ||
        activeLocation.longitude < -180 ||
        activeLocation.longitude > 180
      ) {
        throw new Error('Geographic coordinates out of valid range.');
      }

      const result = await qrService.scanQRCode(code, activeLocation);
      setScanResult(result);
      message.success(`QR Detected: ${result.productName}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error resolving QR code';
      message.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  // Manual QR input submission
  const handleManualSubmit = () => {
    const trimmed = manualInput.trim();
    if (!trimmed) {
      message.warning('Please enter a QR code value to process.');
      return;
    }
    if (trimmed.length < 3) {
      message.error('QR code must be at least 3 characters long.');
      return;
    }
    handleQRDetected(trimmed);
  };

  // Quick simulation trigger for testing
  const handleSimulateScan = (qrCode: string) => {
    handleQRDetected(qrCode);
  };

  // Reset to scan another QR code
  const handleRescan = () => {
    setScanResult(null);
    setIsSubmitted(false);
    setManualInput('');
    startScanner();
  };

  // Submit confirmed QR Result
  const handleSubmit = async () => {
    if (!scanResult) {
      message.error('No scan result available to submit.');
      return;
    }

    if (
      !scanResult.location ||
      typeof scanResult.location.latitude !== 'number' ||
      typeof scanResult.location.longitude !== 'number' ||
      isNaN(scanResult.location.latitude) ||
      isNaN(scanResult.location.longitude)
    ) {
      message.error(
        'Valid geographic coordinates are required before submitting. Please lock location.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await qrService.submitQRResult(scanResult, user?.email);

      setIsSubmitted(true);
      notification.success({
        message: 'Scan Submitted Successfully',
        description: `Product ${scanResult.productName} (${scanResult.productCode}) has been recorded in the central database with geographic coordinates.`,
        placement: 'topRight',
        duration: 4,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit QR result.';
      message.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight m-0">
              Product QR Scanner
            </h1>
            <Tag color="blue" className="rounded-full px-2.5 font-semibold">
              Live Telemetry
            </Tag>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 m-0 mt-1">
            Point camera at the product QR barcode to automatically detect and log location
          </p>
        </div>

        <div className="flex items-center gap-2">
          {scanResult && (
            <Button icon={<CameraOutlined />} onClick={handleRescan}>
              New Scan
            </Button>
          )}
          <Button
            type="default"
            icon={<FileDoneOutlined />}
            onClick={() => navigate('/submitted-results')}
            className="rounded-lg"
          >
            View Results History
          </Button>
        </div>
      </div>

      {/* Geolocation Status Badge */}
      <LocationBadge
        location={location}
        isLoading={isLocationLoading}
        error={locationError}
        onRetry={captureLocation}
        onSimulate={() => setSimulatedLocation()}
      />

      {/* Main Scanner Section or Result View */}
      {scanResult ? (
        <ScanResultView
          scanResult={scanResult}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onRescan={handleRescan}
          isSubmitted={isSubmitted}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Camera Viewport (2 cols on desktop) */}
          <div className="lg:col-span-2">
            <Card
              className="shadow-md rounded-2xl border border-slate-200 overflow-hidden bg-white"
              styles={{ body: { padding: '20px' } }}
              title={
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                    <CameraOutlined className="text-blue-600" />
                    Live Camera Feed
                  </span>
                  {isScanning ? (
                    <Tag color="processing" className="m-0 font-medium">
                      Camera Active
                    </Tag>
                  ) : (
                    <Tag color="default" className="m-0">
                      Standby
                    </Tag>
                  )}
                </div>
              }
            >
              {cameraError && (
                <Alert
                  message="Camera Access Note"
                  description={
                    <div className="text-xs">
                      <p className="m-0">{cameraError}</p>
                      <p className="mt-1.5 font-semibold text-slate-700">
                        You can still test the entire workflow using the 1-click presets on the
                        right!
                      </p>
                    </div>
                  }
                  type="warning"
                  showIcon
                  className="mb-4 text-xs"
                />
              )}

              {/* Viewport container for html5-qrcode */}
              <div className="relative w-full rounded-xl overflow-hidden bg-slate-950 flex flex-col items-center justify-center min-h-[300px] sm:min-h-[340px] text-white">
                <div id="qr-reader" className="w-full max-w-md"></div>

                {isProcessing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 p-6 text-center z-10">
                    <Spin size="large" />
                    <p className="font-semibold text-sm text-slate-200 mt-3 m-0">
                      Resolving Barcode & Catalog...
                    </p>
                  </div>
                )}

                {!isScanning && !isProcessing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 mb-3">
                      <QrcodeOutlined style={{ fontSize: '32px' }} />
                    </div>
                    <p className="font-semibold text-sm text-slate-200 m-0">Camera is paused</p>
                    <p className="text-xs text-slate-400 max-w-xs mt-1 mb-4">
                      Click below to request camera permission and open the device lens
                    </p>
                    <Button
                      type="primary"
                      icon={<CameraOutlined />}
                      onClick={startScanner}
                      loading={isStartingCamera}
                      disabled={isStartingCamera}
                      className="bg-blue-600 hover:bg-blue-700 font-semibold"
                    >
                      {isStartingCamera ? 'Requesting Camera' : 'Start Camera'}
                    </Button>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                <span>Supports standard QR Code, Data Matrix, Aztec</span>
                {isScanning && (
                  <Button size="small" danger icon={<StopOutlined />} onClick={stopScanner}>
                    Pause Camera
                  </Button>
                )}
              </div>
            </Card>
          </div>

          {/* Quick Test Presets Panel */}
          <div className="lg:col-span-1">
            <Card
              className="shadow-sm rounded-2xl border border-slate-200 bg-white h-full"
              styles={{ body: { padding: '20px' } }}
              title={
                <div className="flex items-center gap-2">
                  <ExperimentOutlined className="text-indigo-600" />
                  <span className="font-bold text-slate-800 text-sm">Quick Test Presets</span>
                </div>
              }
            >
              {/* Manual Barcode Input Form */}
              <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700 block mb-1.5">
                  Manual Barcode Input:
                </span>
                <Space.Compact style={{ width: '100%' }}>
                  <Input
                    placeholder="Enter QR/Barcode (e.g. QR123456)"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    onPressEnter={handleManualSubmit}
                    size="middle"
                    allowClear
                  />
                  <Button
                    type="primary"
                    onClick={handleManualSubmit}
                    size="middle"
                    className="bg-blue-600"
                  >
                    Validate
                  </Button>
                </Space.Compact>
              </div>

              <p className="text-xs text-slate-500 mb-3 font-medium">
                Or choose a quick test catalog preset:
              </p>

              <div className="space-y-2.5">
                {mockCatalogProducts.map((product) => (
                  <div
                    key={product.qrCode}
                    onClick={() => handleSimulateScan(product.qrCode)}
                    className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-800 group-hover:text-blue-600 transition-colors">
                          {product.productName.split('-')[0].trim()}
                        </span>
                        <Tag color="blue" className="text-[10px] px-1.5 py-0 m-0">
                          {product.productCode}
                        </Tag>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                        Code: {product.qrCode}
                      </span>
                    </div>
                    <Button
                      size="small"
                      type="text"
                      className="text-blue-600 group-hover:translate-x-1 transition-transform"
                    >
                      Scan →
                    </Button>
                  </div>
                ))}
              </div>

              <Divider className="my-4" />

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/70 text-xs text-amber-900">
                <span className="font-bold block mb-0.5">Note:</span>
                Browser camera permissions require an active webcam. If testing locally on a desktop
                without a webcam, click any preset above to test the full submission pipeline!
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
