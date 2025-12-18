'use client';

import React, {
  createContext,
  useContext,
  useRef,
  useCallback,
  useState,
  ReactNode
} from 'react';

interface WordTiming {
  word: string;
  start_time: number;
  end_time: number;
}

interface WebSocketMessage {
  status?: string;
  client_id?: string;
  interrupt?: boolean;
  audio?: string;
  word_timings?: WordTiming[];
  sample_rate?: number;
  method?: string;
  audio_complete?: boolean;
  error?: string;
  type?: string;
}

interface WebSocketContextType {
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  sendAudioSegment: (audioData: ArrayBuffer) => void;
  sendImage: (imageData: string) => void;
  sendAudioWithImage: (audioData: ArrayBuffer, imageData: string) => void;
  sendText: (text: string, imageData?: string) => void;
  stopAudio: () => void;
  onAudioReceived: (
    callback: (
      audioData: string,
      timingData?: {
        words: string[];
        word_times: number[];
        word_durations: number[];
      },
      sampleRate?: number,
      method?: string
    ) => void
  ) => void;
  onInterrupt: (callback: () => void) => void;
  onError: (callback: (error: string) => void) => void;
  onStatusChange: (
    callback: (status: 'connected' | 'disconnected' | 'connecting') => void
  ) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error(
      'useWebSocketContext must be used within a WebSocketProvider'
    );
  }
  return context;
};

interface WebSocketProviderProps {
  children: ReactNode;
  serverUrl?: string;
}

// Automatically use localhost in development, Render in production
const getDefaultServerUrl = () => {
  if (typeof window !== 'undefined') {
    // In browser
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'ws://localhost:8000/ws/test-client';
    }
  }
  // Production (Vercel or any deployed environment)
  return 'wss://sakhi-the-3d-avatar-2.onrender.com/ws/test-client';
};

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
  serverUrl = getDefaultServerUrl()
}) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Reconnection state
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 10;
  const shouldReconnectRef = useRef(true);
  const lastPingRef = useRef<number>(Date.now());
  const pingCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Callback refs
  const audioReceivedCallbackRef = useRef<
    | ((
      audioData: string,
      timingData?: {
        words: string[];
        word_times: number[];
        word_durations: number[];
      },
      sampleRate?: number,
      method?: string
    ) => void)
    | null
  >(null);
  const interruptCallbackRef = useRef<(() => void) | null>(null);
  const errorCallbackRef = useRef<((error: string) => void) | null>(null);
  const statusChangeCallbackRef = useRef<
    ((status: 'connected' | 'disconnected' | 'connecting') => void) | null
  >(null);

  // Use ref to avoid circular dependency
  const connectRef = useRef<(() => Promise<void>) | null>(null);

  const scheduleReconnect = useCallback(() => {
    if (!shouldReconnectRef.current) return;

    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      errorCallbackRef.current?.('Failed to reconnect after multiple attempts');
      return;
    }

    // Exponential backoff: 1s, 2s, 4s, 8s, 16s, max 30s
    const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
    console.log(`Scheduling reconnection attempt ${reconnectAttemptsRef.current + 1} in ${delay}ms`);

    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectAttemptsRef.current++;
      connectRef.current?.();
    }, delay);
  }, []);

  const connect = useCallback(async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    // Clear any existing connection
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.onmessage = null;
      wsRef.current.onopen = null;
      try {
        wsRef.current.close();
      } catch (e) {
        console.error('Error closing existing WebSocket:', e);
      }
      wsRef.current = null;
    }

    try {
      setIsConnecting(true);
      statusChangeCallbackRef.current?.('connecting');
      console.log(`Connecting to WebSocket: ${serverUrl}`);

      wsRef.current = new WebSocket(serverUrl);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        reconnectAttemptsRef.current = 0; // Reset reconnection counter on successful connection
        statusChangeCallbackRef.current?.('connected');
        lastPingRef.current = Date.now();
        console.log('WebSocket connected successfully');

        // Start ping check interval
        if (pingCheckIntervalRef.current) {
          clearInterval(pingCheckIntervalRef.current);
        }
        pingCheckIntervalRef.current = setInterval(() => {
          const timeSinceLastPing = Date.now() - lastPingRef.current;
          // If no ping received in 60 seconds, consider connection stale
          if (timeSinceLastPing > 60000 && wsRef.current?.readyState === WebSocket.OPEN) {
            console.warn('No ping received in 60s, reconnecting...');
            wsRef.current?.close();
          }
        }, 15000); // Check every 15 seconds
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);

          // Update last ping time for any message (server is alive)
          lastPingRef.current = Date.now();

          if (data.status === 'connected') {
            console.log(
              `Server confirmed connection. Client ID: ${data.client_id}`
            );
          } else if (data.interrupt) {
            console.log('Received interrupt signal');
            interruptCallbackRef.current?.();
          } else if (data.audio) {
            // Handle audio with native timing
            let timingData:
              | {
                words: string[];
                word_times: number[];
                word_durations: number[];
              }
              | undefined = undefined;

            if (data.word_timings) {
              // Convert to TalkingHead format
              timingData = {
                words: data.word_timings.map((wt) => wt.word),
                word_times: data.word_timings.map((wt) => wt.start_time),
                word_durations: data.word_timings.map(
                  (wt) => wt.end_time - wt.start_time
                )
              };
              console.log('Converted timing data:', timingData);
            }

            console.log('Calling audioReceivedCallback with:', {
              audioLength: data.audio.length,
              timingData,
              sampleRate: data.sample_rate || 24000,
              method: data.method || 'unknown'
            });

            audioReceivedCallbackRef.current?.(
              data.audio,
              timingData,
              data.sample_rate || 24000,
              data.method || 'unknown'
            );
          } else if (data.audio_complete) {
            console.log('Audio processing complete');
          } else if (data.error) {
            errorCallbackRef.current?.(data.error);
          } else if (data.type === 'ping') {
            // Keepalive ping received - connection is healthy
            console.log('Received keepalive ping');
          }
        } catch {
          console.log('Non-JSON message:', event.data);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnecting(false);
      };

      wsRef.current.onclose = (event) => {
        setIsConnected(false);
        setIsConnecting(false);
        statusChangeCallbackRef.current?.('disconnected');

        // Clear ping check interval
        if (pingCheckIntervalRef.current) {
          clearInterval(pingCheckIntervalRef.current);
          pingCheckIntervalRef.current = null;
        }

        console.log(`WebSocket disconnected (code: ${event.code}, reason: ${event.reason})`);

        // Attempt to reconnect if not a normal closure
        if (shouldReconnectRef.current && event.code !== 1000) {
          scheduleReconnect();
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setIsConnecting(false);
      errorCallbackRef.current?.('Failed to connect to WebSocket server');

      // Schedule reconnection on connection failure
      if (shouldReconnectRef.current) {
        scheduleReconnect();
      }
    }
  }, [serverUrl]);

  // Store connect in ref for scheduleReconnect to use
  connectRef.current = connect;

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;

    // Clear reconnection timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Clear ping check interval
    if (pingCheckIntervalRef.current) {
      clearInterval(pingCheckIntervalRef.current);
      pingCheckIntervalRef.current = null;
    }

    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.onmessage = null;
      wsRef.current.onopen = null;
      try {
        wsRef.current.close(1000, 'Client disconnecting');
      } catch (e) {
        console.error('Error closing WebSocket:', e);
      }
      wsRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  const stopAudio = useCallback(() => {
    console.log('Manually stopping audio and clearing queue');
    interruptCallbackRef.current?.();
  }, []);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  const sendAudioSegment = useCallback((audioData: ArrayBuffer) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      // Convert ArrayBuffer to base64
      const bytes = new Uint8Array(audioData);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64Audio = btoa(binary);

      const message = {
        audio_segment: base64Audio
      };

      wsRef.current.send(JSON.stringify(message));
      console.log(`Sent audio segment: ${audioData.byteLength} bytes`);
    }
  }, []);

  const sendImage = useCallback((imageData: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message = {
        image: imageData
      };

      wsRef.current.send(JSON.stringify(message));
      console.log('Sent image to server');
    }
  }, []);

  const sendAudioWithImage = useCallback(
    (audioData: ArrayBuffer, imageData: string) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        // Convert ArrayBuffer to base64
        const bytes = new Uint8Array(audioData);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64Audio = btoa(binary);

        const message = {
          audio_segment: base64Audio,
          image: imageData
        };

        wsRef.current.send(JSON.stringify(message));
        console.log(`Sent audio + image: ${audioData.byteLength} bytes audio`);
      }
    },
    []
  );

  const sendText = useCallback(
    (text: string, imageData?: string) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        const message: {
          text_message: string;
          image?: string;
        } = {
          text_message: text
        };

        if (imageData) {
          message.image = imageData;
        }

        wsRef.current.send(JSON.stringify(message));
        console.log(`Sent text message: "${text}"${imageData ? ' with image' : ''}`);
      }
    },
    []
  );

  // Callback registration methods
  const onAudioReceived = useCallback(
    (
      callback: (
        audioData: string,
        timingData?: {
          words: string[];
          word_times: number[];
          word_durations: number[];
        },
        sampleRate?: number,
        method?: string
      ) => void
    ) => {
      audioReceivedCallbackRef.current = callback;
    },
    []
  );

  const onInterrupt = useCallback((callback: () => void) => {
    interruptCallbackRef.current = callback;
  }, []);

  const onError = useCallback((callback: (error: string) => void) => {
    errorCallbackRef.current = callback;
  }, []);

  const onStatusChange = useCallback(
    (
      callback: (status: 'connected' | 'disconnected' | 'connecting') => void
    ) => {
      statusChangeCallbackRef.current = callback;
    },
    []
  );

  const value: WebSocketContextType = {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    sendAudioSegment,
    sendImage,
    sendAudioWithImage,
    sendText,
    stopAudio,
    onAudioReceived,
    onInterrupt,
    onError,
    onStatusChange
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
