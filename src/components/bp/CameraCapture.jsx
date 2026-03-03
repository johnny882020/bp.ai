import React, { useState, useRef } from 'react';
import { Camera, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ocrEngine } from '@/lib/ocrEngine';

export default function CameraCapture({ onOpenAddForm }) {
  const [open,       setOpen]       = useState(false);
  const [image,      setImage]      = useState(null);
  const [progress,   setProgress]   = useState(0);
  const [processing, setProcessing] = useState(false);
  const [error,      setError]      = useState('');
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    const reader = new FileReader();
    reader.onload = (ev) => setImage(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleExtract = async () => {
    if (!image) return;
    setProcessing(true);
    setProgress(0);
    setError('');
    try {
      const result = await ocrEngine.processImage(image, setProgress);
      setOpen(false);
      setImage(null);
      onOpenAddForm(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => { setImage(null); setError(''); setProgress(0); };

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} className="flex items-center gap-2">
        <Camera className="w-4 h-4" />
        Scan Monitor
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent onClose={() => { setOpen(false); reset(); }}>
          <DialogHeader>
            <DialogTitle>Scan BP Monitor</DialogTitle>
          </DialogHeader>

          {!image ? (
            <div
              className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-red-400 hover:bg-red-50/50 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <Camera className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 text-sm mb-1">Take or select a photo of your monitor display</p>
              <p className="text-xs text-slate-400">The reading must be clearly visible</p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFile}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <img src={image} alt="BP monitor" className="w-full rounded-lg border border-slate-200" />

              {processing && (
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Extracting reading…</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-600 transition-all duration-200"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">{error}</p>
              )}

              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={reset} disabled={processing}>
                  <RotateCcw className="w-4 h-4 mr-1" /> Retake
                </Button>
                <Button className="flex-1" onClick={handleExtract} disabled={processing}>
                  {processing ? 'Processing…' : 'Extract Reading'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
