'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { X, Loader2, Camera, RotateCw, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import Script from 'next/script';
import { useWebSocketContext } from '@/contexts/WebSocketContext';

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'model-viewer': any;
        }
    }
}

interface ARViewerProps {
    onClose: () => void;
    avatarUrl?: string;
}

const ARViewer: React.FC<ARViewerProps> = ({
    onClose,
    avatarUrl = 'https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb?morphTargets=ARKit,Oculus+Visemes,mouthOpen,mouthSmile,eyesClosed,eyesLookUp,eyesLookDown&textureSizeLimit=1024&textureFormat=png'
}) => {
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cameraOrbit, setCameraOrbit] = useState('0deg 75deg 105%');
    const [fieldOfView, setFieldOfView] = useState('30deg');
    const modelViewerRef = useRef<any>(null);
    const { isConnected } = useWebSocketContext();

    useEffect(() => {
        // Check if script is already loaded
        if (customElements.get('model-viewer')) {
            setScriptLoaded(true);
        }
    }, []);

    const handleModelLoad = useCallback(() => {
        setIsLoading(false);
        console.log('AR Model loaded successfully');
    }, []);

    const handleModelError = useCallback((event: any) => {
        setIsLoading(false);
        setError('Failed to load 3D model');
        console.error('Model loading error:', event);
    }, []);

    const resetCamera = () => {
        setCameraOrbit('0deg 75deg 105%');
        setFieldOfView('30deg');
        if (modelViewerRef.current) {
            modelViewerRef.current.resetTurntableRotation();
        }
    };

    const zoomIn = () => {
        const currentFov = parseFloat(fieldOfView);
        const newFov = Math.max(10, currentFov - 5);
        setFieldOfView(`${newFov}deg`);
    };

    const zoomOut = () => {
        const currentFov = parseFloat(fieldOfView);
        const newFov = Math.min(60, currentFov + 5);
        setFieldOfView(`${newFov}deg`);
    };

    const takeScreenshot = async () => {
        if (modelViewerRef.current) {
            try {
                const blob = await modelViewerRef.current.toBlob({ idealAspect: true });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'avatar-screenshot.png';
                link.click();
                URL.revokeObjectURL(url);
            } catch (error) {
                console.error('Screenshot failed:', error);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-purple-900 via-black to-pink-900">
            <Script
                src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js"
                type="module"
                onLoad={() => setScriptLoaded(true)}
            />

            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-[60] bg-gradient-to-b from-black/60 to-transparent p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h2 className="text-white text-xl font-bold">AR Viewer</h2>
                        {isConnected && (
                            <span className="px-3 py-1 bg-green-500/20 border border-green-500 text-green-400 text-xs rounded-full">
                                Connected
                            </span>
                        )}
                    </div>
                    <Button
                        variant="secondary"
                        size="icon"
                        onClick={onClose}
                        className="rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border border-white/20"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Control Panel */}
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 bg-black/40 backdrop-blur-xl rounded-full p-2 border border-white/10">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={resetCamera}
                    className="rounded-full text-white hover:bg-white/20"
                    title="Reset Camera"
                >
                    <RotateCw className="h-5 w-5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={zoomIn}
                    className="rounded-full text-white hover:bg-white/20"
                    title="Zoom In"
                >
                    <ZoomIn className="h-5 w-5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={zoomOut}
                    className="rounded-full text-white hover:bg-white/20"
                    title="Zoom Out"
                >
                    <ZoomOut className="h-5 w-5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={takeScreenshot}
                    className="rounded-full text-white hover:bg-white/20"
                    title="Take Screenshot"
                >
                    <Camera className="h-5 w-5" />
                </Button>
            </div>

            {/* Loading State */}
            {(!scriptLoaded || isLoading) && (
                <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="mx-auto h-12 w-12 animate-spin text-purple-400 mb-4" />
                        <p className="text-white text-lg">
                            {!scriptLoaded ? 'Loading AR Engine...' : 'Loading 3D Model...'}
                        </p>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="flex h-full items-center justify-center">
                    <div className="text-center bg-red-500/10 border border-red-500 rounded-2xl p-8 max-w-md">
                        <p className="text-red-400 text-lg mb-4">{error}</p>
                        <Button
                            onClick={onClose}
                            className="bg-red-500 hover:bg-red-600 text-white"
                        >
                            Close
                        </Button>
                    </div>
                </div>
            )}

            {/* Model Viewer */}
            {scriptLoaded && !error && (
                <model-viewer
                    ref={modelViewerRef}
                    src={avatarUrl}
                    alt="3D Avatar Model"
                    ar
                    ar-modes="scene-viewer webxr quick-look"
                    ar-scale="auto"
                    camera-controls
                    camera-orbit={cameraOrbit}
                    field-of-view={fieldOfView}
                    tone-mapping="commerce"
                    shadow-intensity="1"
                    shadow-softness="0.5"
                    exposure="1"
                    environment-image="neutral"
                    auto-rotate
                    auto-rotate-delay="1000"
                    rotation-per-second="30deg"
                    interaction-prompt="auto"
                    loading="eager"
                    reveal="auto"
                    onLoad={handleModelLoad}
                    onError={handleModelError}
                    style={{
                        width: '100%',
                        height: '100%',
                        display: isLoading ? 'none' : 'block'
                    }}
                >
                    {/* AR Button */}
                    <button
                        slot="ar-button"
                        className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-full font-bold shadow-2xl transform active:scale-95 transition-all flex items-center gap-3 cursor-pointer border-2 border-white/20"
                    >
                        <Maximize2 className="h-5 w-5" />
                        View in Your Space
                    </button>

                    {/* Loading Progress */}
                    <div slot="progress-bar" className="absolute bottom-4 left-1/2 -translate-x-1/2 w-64 h-2 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"></div>
                    </div>
                </model-viewer>
            )}

            {/* Instructions */}
            {scriptLoaded && !isLoading && !error && (
                <div className="absolute bottom-4 left-4 right-4 z-[60] text-center">
                    <p className="text-white/60 text-sm">
                        Drag to rotate • Pinch to zoom • Tap AR button to view in your space
                    </p>
                </div>
            )}
        </div>
    );
};

export default ARViewer;
