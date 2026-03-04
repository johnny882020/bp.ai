import React, { useState, useRef } from 'react';
import { Camera, RotateCcw, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ocrEngine } from '@/lib/ocrEngine';
import { extractBPWithDocuPipe } from '@/lib/docupipeOcr';

export default function CameraCapture({ onOpenAddForm }) {
  const [open,       setOpen]       = useState(false);
  const [image,      setImage]      = useState(null);   // data-URL
  const [progress,   setProgress]   = useState(0);
  const [processing, setProcessing] = useState(false);
  const [error,      setError]      = useState('');
  const [usingAI,    setUsingAI]    = useState(false);
  const [preview,    setPreview]    = useState(null);   // { systolic, diastolic, pulse }
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setPreview(null);
    const reader = new FileReader();
    reader.onload = (ev) => setImage(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleExtract = async () => {
    if (!image) return;
    setProcessing(true);
    setProgress(0);
    setError('');
    setPreview(null);
    setUsingAI(false);

    try {
      let result;

      // ── DocuPipe (primary — server-side, no CORS issues) ─────────────────
      try {
        setUsingAI(true);
        const base64    = image.split(',')[1];
        const mediaType = image.split(';')[0].replace('data:', '') || 'image/jpeg';
        const text      = await extractBPWithDocuPipe(base64, mediaType);
        result = ocrEngine.extractBPReading(text);
        if (!result) throw new Error('DocuPipe returned no parseable BP numbers');
      } catch (aiErr) {
        // ── Tesseract fallback (built-in, always available) ─────────────────
        setUsingAI(false);
        result = await ocrEngine.processImage(image, setProgress);
      }

      // Show confirmation preview before submitting
      setPreview(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setProcessing(false);
      setUsingAI(false);
    }
  };

  const handleConfirm = () => {
    const result = preview;
    setOpen(false);
    setImage(null);
    setPreview(null);
    setError('');
    onOpenAddForm(result);
  };

  const reset = () => { setImage(null); setError(''); setProgress(0); setPreview(null); };

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

          {/* Step 1: select photo */}
          {!image && (
            <div
              className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-red-400 hover:bg-red-50/50 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <Camera className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 text-sm mb-1">Take or select a photo of your monitor display</p>
              <p className="text-xs text-gray-400">Hold the camera parallel — all digits must be in frame and in focus</p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFile}
                className="hidden"
              />
            </div>
          )}

          {/* Step 2: review photo + extract */}
          {image && !preview && (
            <div className="space-y-4">
              <img src={image} alt="BP monitor" className="w-full rounded-lg border border-gray-200 max-h-64 object-contain" />

              {processing && (
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{usingAI ? 'Analyzing with DocuPipe AI…' : 'Extracting reading…'}</span>
                    {!usingAI && <span>{progress}%</span>}
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-200 ${usingAI ? 'bg-red-600 w-full animate-pulse' : 'bg-red-600'}`}
                      style={usingAI ? {} : { width: `${progress}%` }}
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

          {/* Step 3: confirm extracted values */}
          {preview && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Reading extracted — please verify before saving
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Systolic</p>
                    <p className="text-3xl font-bold text-slate-900">{preview.systolic}</p>
                    <p className="text-xs text-slate-400 mt-0.5">mmHg</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Diastolic</p>
                    <p className="text-3xl font-bold text-slate-900">{preview.diastolic}</p>
                    <p className="text-xs text-slate-400 mt-0.5">mmHg</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Pulse</p>
                    <p className={`text-3xl font-bold ${preview.pulse ? 'text-slate-900' : 'text-slate-400'}`}>
                      {preview.pulse ?? '—'}
                    </p>
                    {preview.pulse && <p className="text-xs text-slate-400 mt-0.5">bpm</p>}
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-500 text-center">
                If these numbers look wrong, retake the photo or use manual entry.
              </p>

              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={reset}>
                  <RotateCcw className="w-4 h-4 mr-1" /> Retake
                </Button>
                <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={handleConfirm}>
                  Use This Reading
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
