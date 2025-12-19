'use client';

import React, { useState, useCallback } from 'react';
import { Send, Camera, Sparkles, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import VoiceActivityDetector, { VADConfig } from '@/components/VoiceActivityDetector';

interface TextInputProps {
    cameraStream?: MediaStream | null;
    voiceConfig?: VADConfig;
    onVoiceConfigChange?: (config: VADConfig) => void;
    isSpeaking?: boolean;
}

const TextInput: React.FC<TextInputProps> = ({ cameraStream, voiceConfig, onVoiceConfigChange, isSpeaking }) => {
    const [text, setText] = useState('');
    const [includeImage, setIncludeImage] = useState(false);
    const { isConnected, sendText, stopAudio } = useWebSocketContext();

    // Auto-enable image when camera is active
    React.useEffect(() => {
        if (cameraStream) {
            setIncludeImage(true);
        }
    }, [cameraStream]);

    // Capture image from camera stream
    const captureImageFromStream = useCallback((): string | null => {
        if (!cameraStream) return null;

        try {
            const existingVideo = document.getElementById('camera-video-stream') as HTMLVideoElement;

            if (
                existingVideo &&
                existingVideo.videoWidth > 0 &&
                existingVideo.videoHeight > 0
            ) {
                const canvas = document.createElement('canvas');
                const aspectRatio =
                    existingVideo.videoWidth / existingVideo.videoHeight;
                canvas.width = 320;
                canvas.height = Math.round(320 / aspectRatio);

                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(existingVideo, 0, 0, canvas.width, canvas.height);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                    const base64Data = dataUrl.split(',')[1];
                    console.log(
                        `📸 Captured image for text: ${canvas.width}x${canvas.height}`
                    );
                    return base64Data;
                }
            }

            return null;
        } catch (error) {
            console.error('Error capturing image:', error);
            return null;
        }
    }, [cameraStream]);

    const handleSend = useCallback(() => {
        if (!text.trim() || !isConnected) return;

        let imageData: string | undefined = undefined;

        if (includeImage && cameraStream) {
            const captured = captureImageFromStream();
            if (captured) {
                imageData = captured;
            }
        }

        sendText(text.trim(), imageData);
        setText('');
    }, [text, isConnected, includeImage, cameraStream, sendText, captureImageFromStream]);

    const handleKeyPress = useCallback(
        (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
        },
        [handleSend]
    );

    return (
        <div className="p-0">
            <div className="relative">
                <div className="absolute bottom-1.5 left-1.5 z-10">
                    <VoiceActivityDetector cameraStream={cameraStream} minimal config={voiceConfig} onConfigChange={onVoiceConfigChange} />
                </div>

                <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type a message..."
                    className="min-h-[50px] text-sm resize-none rounded-2xl border-2 border-white/20 bg-black/40 backdrop-blur-md py-3 pl-12 pr-32 text-white placeholder:text-white/70 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 scrollbar-hide shadow-lg"
                    disabled={!isConnected}
                />

                <div className="absolute bottom-1.5 right-1.5 flex gap-1 items-center">
                    {cameraStream && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIncludeImage(!includeImage)}
                            className={`h-8 w-8 rounded-xl transition-all duration-300 ${includeImage
                                ? 'bg-purple-500/50 text-white'
                                : 'text-white/70 hover:bg-white/20'
                                }`}
                            title={includeImage ? "Disable Image" : "Enable Image"}
                        >
                            <Camera size={16} />
                        </Button>
                    )}

                    {isSpeaking && (
                        <Button
                            onClick={stopAudio}
                            size="icon"
                            variant="destructive"
                            className="h-8 w-8 rounded-xl bg-red-500/80 hover:bg-red-600 p-0 shadow-md transition-all duration-300 backdrop-blur-sm animate-in fade-in zoom-in"
                            title="Pause Speaking"
                        >
                            <Pause size={14} fill="currentColor" />
                        </Button>
                    )}

                    <Button
                        onClick={handleSend}
                        disabled={!text.trim() || !isConnected}
                        size="icon"
                        className="h-8 w-8 rounded-xl bg-purple-600/80 hover:bg-purple-600 p-0 shadow-md transition-all duration-300 backdrop-blur-sm disabled:bg-gray-500/50"
                    >
                        <Send size={14} className="text-white" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default TextInput;
