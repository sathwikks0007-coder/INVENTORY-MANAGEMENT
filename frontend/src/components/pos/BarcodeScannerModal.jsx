import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, Barcode, CheckCircle } from 'lucide-react';
import Modal from '../common/Modal';

const BarcodeScannerModal = ({ isOpen, onClose, onScanSuccess }) => {
  const scannerRef = useRef(null);
  const [manualCode, setManualCode] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let html5QrcodeScanner = null;

    if (isOpen && cameraActive) {
      html5QrcodeScanner = new Html5Qrcode('barcode-reader');
      const config = { fps: 10, qrbox: { width: 250, height: 150 } };

      html5QrcodeScanner
        .start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            onScanSuccess(decodedText);
            setCameraActive(false);
            onClose();
          },
          (errorMessage) => {
            // Ignore scan attempt errors
          }
        )
        .catch((err) => {
          setErrorMsg('Camera access denied or device camera not found.');
          setCameraActive(false);
        });
    }

    return () => {
      if (html5QrcodeScanner && html5QrcodeScanner.isScanning) {
        html5QrcodeScanner.stop().catch((err) => console.error(err));
      }
    };
  }, [isOpen, cameraActive, onScanSuccess, onClose]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScanSuccess(manualCode.trim());
      setManualCode('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Scan Barcode / SKU" maxWidth="max-w-md">
      <div className="space-y-6">
        {/* USB Scanner Fast Input */}
        <form onSubmit={handleManualSubmit} className="space-y-3">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
            Barcode / SKU USB Scanner Input
          </label>
          <div className="relative">
            <Barcode className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              autoFocus
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Scan or enter Barcode/SKU and press Enter..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm"
          >
            Lookup Barcode
          </button>
        </form>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-xs font-semibold text-slate-400 uppercase absolute">OR</span>
        </div>

        {/* Camera Scanner Trigger & Video Container */}
        <div>
          {!cameraActive ? (
            <button
              onClick={() => {
                setErrorMsg('');
                setCameraActive(true);
              }}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5 text-slate-500" />
              Use Device Camera Scanner
            </button>
          ) : (
            <div className="space-y-3">
              <div id="barcode-reader" className="overflow-hidden rounded-xl border border-slate-200 bg-slate-900" />
              <button
                onClick={() => setCameraActive(false)}
                className="w-full py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 font-semibold rounded-xl text-xs transition-colors"
              >
                Stop Camera Scanner
              </button>
            </div>
          )}

          {errorMsg && <p className="text-xs text-rose-500 mt-2 text-center font-medium">{errorMsg}</p>}
        </div>
      </div>
    </Modal>
  );
};

export default BarcodeScannerModal;
