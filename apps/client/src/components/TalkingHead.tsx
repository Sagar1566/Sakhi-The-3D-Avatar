'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import { VADConfig } from '@/components/VoiceActivityDetector';
import { Input } from '@/components/ui/input';

interface TalkingHeadProps {
  className?: string;
  cameraStream?: MediaStream | null;
  voiceConfig?: VADConfig;
  onVoiceConfigChange?: (config: VADConfig) => void;
  onSpeakingStateChange?: (isSpeaking: boolean) => void;
}

const TalkingHead: React.FC<TalkingHeadProps> = ({ className = '', cameraStream, voiceConfig, onVoiceConfigChange, onSpeakingStateChange }) => {
  const avatarRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<{
    speakAudio: (data: {
      audio: AudioBuffer;
      words?: string[];
      wtimes?: number[];
      wdurations?: number[];
    }) => void;
    stop: () => void;
    showAvatar: (config: {
      url: string;
      body: string;
      avatarMood: string;
      lipsyncLang: string;
    }) => Promise<void>;
    setMood: (mood: string) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nodeAvatar?: any; // Access to internal avatar object for cleanup
  } | null>(null);
  const isInitializedRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<
    Array<{
      buffer: AudioBuffer;
      timingData?: {
        words: string[];
        word_times: number[];
        word_durations: number[];
      };
      duration: number;
      method: string;
    }>
  >([]);
  const isPlayingAudioRef = useRef(false);

  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const [selectedAvatar, setSelectedAvatar] = useState('F');
  const [selectedMood, setSelectedMood] = useState('neutral');
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Sync isSpeaking state with parent
  useEffect(() => {
    if (onSpeakingStateChange) {
      onSpeakingStateChange(isSpeaking);
    }
  }, [isSpeaking, onSpeakingStateChange]);

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

  // Get WebSocket context
  const {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    onAudioReceived,
    onInterrupt,
    onError,
    onStatusChange
  } = useWebSocketContext();

  const showStatus = (message: string, type: 'success' | 'error' | 'info') => {
    setStatus({ message, type });
    if (type === 'success' || type === 'info') {
      setTimeout(() => setStatus(null), 3000);
    }
  };

  // Initialize audio context
  const initAudioContext = useCallback(async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext({ sampleRate: 22050 });
    }
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
  }, []);

  // Convert base64 to ArrayBuffer
  const base64ToArrayBuffer = useCallback((base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }, []);

  // Convert Int16Array to Float32Array
  const int16ArrayToFloat32 = useCallback((int16Array: Int16Array) => {
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768.0;
    }
    return float32Array;
  }, []);

  // Play next audio in queue
  const playNextAudio = useCallback(async () => {
    if (audioQueueRef.current.length === 0) {
      isPlayingAudioRef.current = false;
      setIsSpeaking(false);
      return;
    }

    isPlayingAudioRef.current = true;
    setIsSpeaking(true);

    const audioItem = audioQueueRef.current.shift();
    if (!audioItem) {
      isPlayingAudioRef.current = false;
      setIsSpeaking(false);
      return;
    }

    console.log('Playing audio item:', audioItem);

    try {
      if (
        headRef.current &&
        audioItem.timingData &&
        audioItem.timingData.words
      ) {
        // Use TalkingHead with native timing
        const speakData = {
          audio: audioItem.buffer,
          words: audioItem.timingData.words,
          wtimes: audioItem.timingData.word_times,
          wdurations: audioItem.timingData.word_durations
        };

        console.log('Using TalkingHead with timing data:', speakData);
        headRef.current.speakAudio(speakData);

        // Set timer for next audio
        setTimeout(() => {
          console.log('TalkingHead audio finished, playing next...');
          playNextAudio();
        }, audioItem.duration * 1000);
      } else if (headRef.current) {
        // Basic TalkingHead audio without timing
        console.log('Using basic TalkingHead audio');
        headRef.current.speakAudio({ audio: audioItem.buffer });

        setTimeout(() => {
          console.log('Basic TalkingHead audio finished, playing next...');
          playNextAudio();
        }, audioItem.duration * 1000);
      } else {
        // Fallback to Web Audio API
        console.log('Using Web Audio API fallback');
        await initAudioContext();
        const source = audioContextRef.current!.createBufferSource();
        source.buffer = audioItem.buffer;
        source.connect(audioContextRef.current!.destination);
        source.onended = () => {
          console.log('Web Audio finished, playing next...');
          playNextAudio();
        };
        source.start();
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      // Continue to next audio on error
      setTimeout(() => playNextAudio(), 100);
    }
  }, [initAudioContext]);

  // Handle audio from WebSocket
  const handleAudioReceived = useCallback(
    async (
      base64Audio: string,
      timingData?: {
        words: string[];
        word_times: number[];
        word_durations: number[];
      },
      sampleRate = 24000,
      method = 'unknown'
    ) => {
      console.log('🎵 TALKINGHEAD handleAudioReceived CALLED!', {
        audioLength: base64Audio.length,
        timingData,
        sampleRate,
        method
      });

      try {
        await initAudioContext();

        // Convert base64 to audio buffer
        const arrayBuffer = base64ToArrayBuffer(base64Audio);
        const int16Array = new Int16Array(arrayBuffer);
        const float32Array = int16ArrayToFloat32(int16Array);

        console.log('Audio conversion successful:', {
          arrayBufferLength: arrayBuffer.byteLength,
          int16Length: int16Array.length,
          float32Length: float32Array.length
        });

        // Create AudioBuffer
        const audioBuffer = audioContextRef.current!.createBuffer(
          1,
          float32Array.length,
          sampleRate
        );
        audioBuffer.copyToChannel(float32Array, 0);

        console.log('AudioBuffer created:', {
          duration: audioBuffer.duration,
          sampleRate: audioBuffer.sampleRate,
          length: audioBuffer.length
        });

        // Add to queue
        audioQueueRef.current.push({
          buffer: audioBuffer,
          timingData: timingData,
          duration: audioBuffer.duration,
          method: method
        });

        console.log(
          'Audio added to queue. Queue length:',
          audioQueueRef.current.length
        );

        // Start playing if not already playing
        if (!isPlayingAudioRef.current) {
          console.log('Starting audio playback...');
          playNextAudio();
        } else {
          console.log('Audio already playing, added to queue');
        }

        const timingInfo = timingData
          ? ` with ${timingData.words?.length || 0} word timings`
          : ' (no timing)';
        console.log(
          `✅ Audio queued successfully: ${audioBuffer.duration.toFixed(2)}s${timingInfo} [${method}]`
        );
      } catch (error) {
        console.error(
          '❌ Error processing audio in handleAudioReceived:',
          error
        );
      }
    },
    [initAudioContext, base64ToArrayBuffer, int16ArrayToFloat32, playNextAudio]
  );

  // Handle interrupt from server
  const handleInterrupt = useCallback(() => {
    // Clear audio queue
    audioQueueRef.current = [];
    isPlayingAudioRef.current = false;
    setIsSpeaking(false);

    // Stop TalkingHead if speaking
    // if (headRef.current) {
    //   try {
    //     headRef.current.stop();
    //   } catch (error) {
    //     console.error('Error stopping TalkingHead:', error);
    //   }
    // }

    console.log('Audio interrupted and cleared');
  }, []);

  // Register WebSocket callbacks
  useEffect(() => {
    onAudioReceived(handleAudioReceived);
    onInterrupt(handleInterrupt);
    onError((error) => showStatus(`WebSocket error: ${error}`, 'error'));
    onStatusChange((status) => {
      if (status === 'connected')
        showStatus('Connected to voice assistant', 'success');
      if (status === 'disconnected')
        showStatus('Disconnected from server', 'info');
    });
  }, [
    onAudioReceived,
    onInterrupt,
    onError,
    onStatusChange,
    handleAudioReceived,
    handleInterrupt
  ]);

  // Listen for TalkingHead library to load
  useEffect(() => {
    const handleTalkingHeadLoaded = () => {
      setScriptsLoaded(true);
    };

    const handleTalkingHeadError = () => {
      showStatus('Failed to load TalkingHead library', 'error');
    };

    if (
      (window as Window & { TalkingHead?: unknown }).TalkingHead
    ) {
      setScriptsLoaded(true);
      return;
    }

    window.addEventListener('talkinghead-loaded', handleTalkingHeadLoaded);
    window.addEventListener('talkinghead-error', handleTalkingHeadError);

    return () => {
      window.removeEventListener('talkinghead-loaded', handleTalkingHeadLoaded);
      window.removeEventListener('talkinghead-error', handleTalkingHeadError);
    };
  }, []);

  // Initialize TalkingHead
  useEffect(() => {
    if (!scriptsLoaded || !avatarRef.current || isInitializedRef.current) return;

    const initTalkingHead = async () => {
      try {
        setIsLoading(true);
        showStatus('Initializing avatar...', 'info');

        const TalkingHead = (
          window as Window & {
            TalkingHead?: new (
              element: HTMLDivElement,
              config: Record<string, unknown>
            ) => typeof headRef.current;
          }
        ).TalkingHead;
        if (!TalkingHead || !avatarRef.current) {
          throw new Error('TalkingHead library not loaded or avatar ref not available');
        }

        headRef.current = new TalkingHead(avatarRef.current, {
          ttsEndpoint: 'https://texttospeech.googleapis.com/v1/text:synthesize',
          jwtGet: () => Promise.resolve('dummy-jwt-token'),
          lipsyncModules: ['en'],
          lipsyncLang: 'en',
          modelFPS: 30,
          cameraView: 'full',
          avatarMute: false,
          avatarMood: selectedMood
        });

        isInitializedRef.current = true;

        await loadAvatar(selectedAvatar);
        setIsLoading(false);
        showStatus('Avatar ready!', 'success');

        // Auto-connect to WebSocket
        connect();
      } catch (error) {
        setIsLoading(false);
        isInitializedRef.current = false;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        showStatus(`Failed to initialize: ${errorMessage}`, 'error');
      }
    };

    initTalkingHead();

    return () => {
      if (headRef.current && isInitializedRef.current) {
        try {
          console.log('Cleaning up TalkingHead and WebGL context...');

          // Stop any ongoing audio
          headRef.current.stop();

          // Access the internal THREE.js renderer and dispose of it
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const head = headRef.current as any;

          // Dispose of the avatar's renderer and scene
          if (head.nodeAvatar) {
            const avatar = head.nodeAvatar;

            // Dispose of renderer
            if (avatar.renderer) {
              console.log('Disposing THREE.js renderer...');
              avatar.renderer.dispose();

              // Force lose the WebGL context
              const gl = avatar.renderer.getContext();
              if (gl) {
                const loseContext = gl.getExtension('WEBGL_lose_context');
                if (loseContext) {
                  loseContext.loseContext();
                  console.log('WebGL context forcefully released');
                }
              }
            }

            // Dispose of scene and all its children
            if (avatar.scene) {
              console.log('Disposing THREE.js scene...');
              avatar.scene.traverse((object: any) => {
                if (object.geometry) {
                  object.geometry.dispose();
                }
                if (object.material) {
                  if (Array.isArray(object.material)) {
                    object.material.forEach((material: any) => material.dispose());
                  } else {
                    object.material.dispose();
                  }
                }
              });
            }
          }

          headRef.current = null;
          isInitializedRef.current = false;
          console.log('TalkingHead cleanup complete');
        } catch (error) {
          console.error('Cleanup error:', error);
          headRef.current = null;
          isInitializedRef.current = false;
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptsLoaded]);

  const loadAvatar = async (gender: string = 'F') => {
    const avatarUrls = {
      F: 'https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb?morphTargets=ARKit,Oculus+Visemes,mouthOpen,mouthSmile,eyesClosed,eyesLookUp,eyesLookDown&textureSizeLimit=1024&textureFormat=png',
      M: 'https://models.readyplayer.me/638df5d0d72bffc6fa179441.glb'
    };

    try {
      await headRef.current?.showAvatar({
        url: avatarUrls[gender as keyof typeof avatarUrls],
        body: gender,
        avatarMood: selectedMood,
        lipsyncLang: 'en'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showStatus(`Failed to load avatar: ${errorMessage}`, 'error');
    }
  };

  const handleAvatarChange = (gender: string) => {
    setSelectedAvatar(gender);
    if (scriptsLoaded && headRef.current) {
      loadAvatar(gender);
    }
  };

  const handleMoodChange = (mood: string) => {
    setSelectedMood(mood);
    if (headRef.current) {
      headRef.current.setMood(mood);
    }
  };

  return (
    <Card className={`w-full flex flex-col border-none shadow-none rounded-none !bg-transparent md:border md:shadow md:rounded-xl ${className}`}>


      <CardContent className="space-y-6 flex-1 flex flex-col min-h-0 p-0 md:p-6">
        {/* Avatar Display */}
        <div
          className="relative overflow-hidden md:rounded-lg flex-1 w-full h-[600px] md:h-auto"
        >
          <div ref={avatarRef} className="h-full w-full" />

          {/* Loading Overlay */}
          {(isLoading || !scriptsLoaded) && (
            <div className="bg-opacity-90 absolute inset-0 flex items-center justify-center bg-white">
              <div className="text-center">
                <Loader2 className="text-primary mx-auto mb-4 h-12 w-12 animate-spin" />
                <p className="text-muted-foreground">
                  {!scriptsLoaded
                    ? 'Loading TalkingHead...'
                    : 'Loading avatar...'}
                </p>
              </div>
            </div>
          )}

          {/* Status Badges */}
          {scriptsLoaded && !isLoading && (
            <div className="absolute top-4 left-4 space-y-2">
              <Badge variant={isConnected ? 'default' : 'secondary'}>
                {isConnecting
                  ? 'Connecting...'
                  : isConnected
                    ? 'Connected'
                    : 'Disconnected'}
              </Badge>
              {isSpeaking && (
                <Badge variant="destructive" className="block">
                  Speaking...
                </Badge>
              )}
            </div>
          )}
        </div>


      </CardContent>
    </Card>
  );
};

export default TalkingHead;
