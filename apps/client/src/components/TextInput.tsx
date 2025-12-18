'use client';

import React, { useState, useCallback } from 'react';
import { Send, Camera, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useWebSocketContext } from '@/contexts/WebSocketContext';

interface TextInputProps {
    cameraStream?: MediaStream | null;
}

const TextInput: React.FC<TextInputProps> = ({ cameraStream }) => {
    const [text, setText] = useState('');
    const [includeImage, setIncludeImage] = useState(false);
    const { isConnected, sendText } = useWebSocketContext();

    // Capture image from camera stream
    const captureImageFromStream = useCallback((): string | null => {
        if (!cameraStream) return null;

        try {
            const existingVideo = document.querySelector(
                'video[autoplay]'
            ) as HTMLVideoElement;

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
        <div className="p-6">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 p-2">
                        <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-lg font-bold text-transparent">
                        Text Message
                    </h3>
                </div>
                <div className="flex items-center gap-2">
                    {cameraStream && (
                        <Button
                            variant={includeImage ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setIncludeImage(!includeImage)}
                            className={`h-8 transition-all duration-300 ${includeImage
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:from-purple-600 hover:to-pink-600'
                                : 'border-purple-200 hover:border-purple-300 hover:bg-purple-50'
                                }`}
                        >
                            <Camera size={14} className="mr-1" />
                            {includeImage ? 'Image On' : 'Image Off'}
                        </Button>
                    )}
                    <Badge
                        variant={isConnected ? 'default' : 'secondary'}
                        className={`text-xs ${isConnected
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                            : 'bg-gray-300'
                            }`}
                    >
                        {isConnected ? '● Connected' : '○ Disconnected'}
                    </Badge>
                </div>
            </div>

            {/* Input Area */}
            <div className="relative">
                <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your message here... ✨"
                    className="min-h-[100px] resize-none rounded-2xl border-2 border-purple-100 bg-white/50 pr-14 text-gray-700 placeholder:text-gray-400 focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
                    disabled={!isConnected}
                />
                <Button
                    onClick={handleSend}
                    disabled={!text.trim() || !isConnected}
                    size="sm"
                    className="absolute bottom-3 right-3 h-10 w-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 p-0 shadow-lg transition-all duration-300 hover:from-indigo-600 hover:to-purple-700 hover:shadow-xl disabled:from-gray-300 disabled:to-gray-400"
                >
                    <Send size={18} />
                </Button>
            </div>

            {/* Image Indicator */}
            {includeImage && cameraStream && (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-2 text-sm">
                    <Camera size={16} className="text-purple-600" />
                    <span className="font-medium text-purple-700">
                        Image will be included with this message
                    </span>
                </div>
            )}

            {/* Help Text */}
            <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <span>Press Enter to send • Shift+Enter for new line</span>
                <span className="font-medium">{text.length} characters</span>
            </div>
        </div>
    );
};

export default TextInput;
