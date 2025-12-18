'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Camera, Maximize2, Minimize2, RotateCw, Info } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';

interface ARViewerProps {
    className?: string;
    selectedAvatar?: string;
    selectedMood?: string;
    onAvatarChange?: (avatar: string) => void;
    onMoodChange?: (mood: string) => void;
}

const ARViewer: React.FC<ARViewerProps> = ({
    className = '',
    selectedAvatar = 'F',
    selectedMood = 'neutral',
    onAvatarChange,
    onMoodChange
}) => {
    const modelViewerRef = useRef<HTMLElement & {
        activateAR?: () => void;
        canActivateAR?: boolean;
    }>(null);
    const [isARSupported, setIsARSupported] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showInstructions, setShowInstructions] = useState(true);

    const avatarOptions = [
        { value: 'F', label: 'Female Avatar' },
        { value: 'M', label: 'Male Avatar' }
    ];

    const moodOptions = [
        { value: 'neutral', label: 'Neutral' },
        { value: 'happy', label: 'Happy' },
        { value: 'sad', label: 'Sad' },
        { value: 'angry', label: 'Angry' },
        { value: 'love', label: 'Love' }
    ];

    // Avatar URLs - same as TalkingHead
    const avatarUrls = {
        F: 'https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb?morphTargets=ARKit,Oculus+Visemes,mouthOpen,mouthSmile,eyesClosed,eyesLookUp,eyesLookDown&textureSizeLimit=1024&textureFormat=png',
        M: 'https://models.readyplayer.me/638df5d0d72bffc6fa179441.glb'
    };

    useEffect(() => {
        // Check if model-viewer is loaded and AR support
        const checkModelViewer = () => {
            if (customElements.get('model-viewer')) {
                setIsLoading(false);

                // Check AR support after a short delay to allow model-viewer to initialize
                setTimeout(() => {
                    if (modelViewerRef.current) {
                        // Use model-viewer's built-in AR capability check
                        const canActivate = modelViewerRef.current.canActivateAR;
                        setIsARSupported(!!canActivate);
                    }
                }, 1000);
            } else {
                setTimeout(checkModelViewer, 100);
            }
        };

        checkModelViewer();
    }, []);

    const handleARClick = async () => {
        const modelViewer = modelViewerRef.current;

        if (!modelViewer) {
            setError('Model viewer not initialized');
            return;
        }

        // Check if AR can be activated
        const canActivate = modelViewer.canActivateAR;

        if (!canActivate) {
            setError('AR is not available on this device. Please use a mobile device with ARCore (Android 7.0+) or AR Quick Look (iOS 12+).');
            return;
        }

        try {
            await modelViewer.activateAR?.();
        } catch (err) {
            setError('Failed to activate AR mode. Please ensure camera permissions are granted.');
            console.error('AR activation error:', err);
        }
    };
    const handleModelLoad = () => {
        setIsLoading(false);
        setError(null);
    };

    const handleModelError = (event: Event) => {
        setIsLoading(false);
        setError('Failed to load 3D model. Please try again.');
        console.error('Model loading error:', event);
    };

    useEffect(() => {
        const modelViewer = modelViewerRef.current;
        if (modelViewer) {
            modelViewer.addEventListener('load', handleModelLoad);
            modelViewer.addEventListener('error', handleModelError);

            return () => {
                modelViewer.removeEventListener('load', handleModelLoad);
                modelViewer.removeEventListener('error', handleModelError);
            };
        }
    }, []);

    return (
        <Card className={`w-full ${className}`}>
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">AR Avatar Viewer</CardTitle>
                <CardDescription>View your AI avatar in augmented reality</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Model Viewer */}
                <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-gray-100 to-gray-200" style={{ height: '500px' }}>
                    {React.createElement('model-viewer', {
                        ref: modelViewerRef as any,
                        src: avatarUrls[selectedAvatar as keyof typeof avatarUrls],
                        alt: "AI Avatar 3D Model",
                        ar: true,
                        'ar-modes': "webxr scene-viewer quick-look",
                        'camera-controls': true,
                        'touch-action': "pan-y",
                        'auto-rotate': true,
                        'shadow-intensity': "1",
                        'environment-image': "neutral",
                        exposure: "1",
                        style: {
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'transparent'
                        }
                    })}

                    {/* Loading Overlay */}
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
                            <div className="text-center">
                                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
                                <p className="text-muted-foreground">Loading 3D model...</p>
                            </div>
                        </div>
                    )}

                    {/* AR Support Badge */}
                    {!isLoading && (
                        <div className="absolute top-4 left-4">
                            <Badge variant={isARSupported ? 'default' : 'secondary'}>
                                {isARSupported ? '✓ AR Supported' : 'AR Not Available'}
                            </Badge>
                        </div>
                    )}

                    {/* Instructions */}
                    {showInstructions && !isLoading && (
                        <div className="absolute bottom-4 left-4 right-4">
                            <Alert className="bg-white/90 backdrop-blur-sm">
                                <Info className="h-4 w-4" />
                                <AlertDescription className="ml-2 text-xs">
                                    <strong>Desktop:</strong> Drag to rotate, scroll to zoom
                                    <br />
                                    <strong>Mobile:</strong> Tap AR button to view in your space
                                    <button
                                        onClick={() => setShowInstructions(false)}
                                        className="ml-2 text-indigo-600 underline"
                                    >
                                        Got it
                                    </button>
                                </AlertDescription>
                            </Alert>
                        </div>
                    )}
                </div>

                {/* AR Controls */}
                <div className="space-y-4">
                    {/* AR Button */}
                    <Button
                        onClick={handleARClick}
                        disabled={!isARSupported || isLoading}
                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                        size="lg"
                    >
                        <Camera className="mr-2 h-5 w-5" />
                        {isARSupported ? 'View in AR' : 'AR Not Supported on This Device'}
                    </Button>

                    {/* Avatar Selection */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Avatar</Label>
                            <Select
                                value={selectedAvatar}
                                onValueChange={onAvatarChange}
                                disabled={isLoading}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {avatarOptions.map((avatar) => (
                                        <SelectItem key={avatar.value} value={avatar.value}>
                                            {avatar.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Mood</Label>
                            <Select
                                value={selectedMood}
                                onValueChange={onMoodChange}
                                disabled={isLoading}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {moodOptions.map((mood) => (
                                        <SelectItem key={mood.value} value={mood.value}>
                                            {mood.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                                if (modelViewerRef.current) {
                                    (modelViewerRef.current as any).resetTurntableRotation?.();
                                }
                            }}
                        >
                            <RotateCw className="mr-2 h-4 w-4" />
                            Reset View
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => setShowInstructions(!showInstructions)}
                        >
                            <Info className="mr-2 h-4 w-4" />
                            {showInstructions ? 'Hide' : 'Show'} Tips
                        </Button>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Device Info */}
                {!isARSupported && !isLoading && (
                    <Alert>
                        <AlertDescription className="text-xs">
                            <strong>Desktop Mode:</strong> AR camera view requires a mobile device with ARCore (Android 7.0+) or AR Quick Look (iOS 12+).
                            <br />
                            You can interact with the 3D model here using mouse controls (drag to rotate, scroll to zoom).
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
};

export default ARViewer;
