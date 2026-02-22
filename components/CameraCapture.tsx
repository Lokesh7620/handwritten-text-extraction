import React, { useRef, useEffect, useState } from 'react';
import { X, Camera, RefreshCw } from 'lucide-react';

interface Props {
  onCapture: (base64Image: string) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<Props> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string>('');
  const [streaming, setStreaming] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          if (window.isSecureContext === false) {
            setError("Camera access requires a Secure Context (HTTPS or localhost). " +
              "For Chrome testing over IP: Go to chrome://flags/#unsafely-treat-insecure-origin-as-secure, " +
              "add '" + window.location.origin + "' to the list, and enable it.");
          } else {
            setError("Camera API is not supported in this browser.");
          }
          return;
        }

        // Attempt to get the rear camera (environment)
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
            audio: false
          });
        } catch (e) {
          console.warn("Could not access environment camera, trying default...", e);
          // Fallback to any available video source (e.g., webcam)
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
        }

        if (videoRef.current && stream) {
          videoRef.current.srcObject = stream;
          // Wait for metadata to load to ensure dimensions are correct
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().then(() => {
              setStreaming(true);
            }).catch(e => {
              console.error("Play failed", e);
              setError("Failed to start video stream.");
            });
          };
        }
      } catch (err: any) {
        console.error("Camera access denied:", err);
        if (err.name === 'NotAllowedError') {
          setError("Camera permission denied. Please grant permission in your browser settings.");
        } else if (window.isSecureContext === false) {
          setError("Camera access blocked: Insecure Origin. " +
            "Chrome users: Go to chrome://flags/#unsafely-treat-insecure-origin-as-secure, " +
            "add '" + window.location.origin + "' to the list, and enable it.");
        } else {
          setError("Unable to access camera: " + err.message);
        }
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (videoRef.current && streaming) {
      const canvas = document.createElement('canvas');
      // Set canvas to match the video's actual stream dimensions
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        // High quality jpeg
        const image = canvas.toDataURL('image/jpeg', 0.95);

        // Stop all tracks before closing/capturing
        const stream = videoRef.current.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }

        onCapture(image);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/50 to-transparent">
        <button onClick={onClose} className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all">
          <X className="w-6 h-6" />
        </button>
        <span className="text-white font-medium">Take a Photo</span>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Video Viewport */}
      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        {error ? (
          <div className="text-white text-center p-6 max-w-sm">
            <p className="mb-4">{error}</p>
            <button onClick={onClose} className="bg-white text-black px-4 py-2 rounded-full font-bold">
              Close
            </button>
          </div>
        ) : (
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            playsInline
            muted
          />
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-center items-center bg-gradient-to-t from-black/80 to-transparent pb-12">
        <button
          onClick={handleCapture}
          className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center hover:scale-95 transition-transform bg-white/20 backdrop-blur-sm shadow-lg"
          aria-label="Capture photo"
        >
          <div className="w-16 h-16 bg-white rounded-full shadow-lg"></div>
        </button>
      </div>
    </div>
  );
};

export default CameraCapture;