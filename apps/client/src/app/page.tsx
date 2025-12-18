'use client';

import { useState } from 'react';
import VoiceActivityDetector from '@/components/VoiceActivityDetector';
import TalkingHead from '@/components/TalkingHead';
import TextInput from '@/components/TextInput';
import { CameraToggleButton } from '@/components/CameraStream';
import { Sparkles } from 'lucide-react';

export default function Home() {
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-4 top-0 h-72 w-72 animate-pulse rounded-full bg-purple-300 opacity-20 blur-3xl" />
        <div className="absolute right-0 top-1/4 h-96 w-96 animate-pulse rounded-full bg-indigo-300 opacity-20 blur-3xl animation-delay-2000" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 animate-pulse rounded-full bg-pink-300 opacity-20 blur-3xl animation-delay-4000" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-3 shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-5xl font-extrabold text-transparent md:text-6xl">
              TalkMateAI
            </h1>
          </div>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 md:text-xl">
            Experience the future of AI conversation with voice, vision, and intelligence
          </p>
        </div>

        {/* Main Content Layout */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:gap-8 xl:grid-cols-2">
          {/* TalkingHead Component */}
          <div className="order-1">
            <div className="group relative overflow-hidden rounded-3xl bg-white/80 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:shadow-indigo-200/50 md:p-8">
              {/* Gradient Border Effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="relative z-10">
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                    AI Avatar
                  </h2>
                </div>
                <TalkingHead cameraStream={cameraStream} />
              </div>
            </div>
          </div>

          {/* Controls Section */}
          <div className="order-2 space-y-6">
            {/* Voice Activity Detector */}
            <div className="group relative overflow-hidden rounded-3xl bg-white/80 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:shadow-purple-200/50">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/20 via-indigo-500/20 to-blue-500/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative z-10">
                <VoiceActivityDetector cameraStream={cameraStream} />
              </div>
            </div>

            {/* Text Input */}
            <div className="group relative overflow-hidden rounded-3xl bg-white/80 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:shadow-pink-200/50">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-indigo-500/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative z-10">
                <TextInput cameraStream={cameraStream} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/60 px-6 py-3 shadow-lg backdrop-blur-sm">
            <div className="h-2 w-2 animate-pulse rounded-full bg-indigo-500" />
            <p className="text-sm font-medium text-gray-600">
              Powered by SmolVLM2, Whisper & Kokoro TTS
            </p>
          </div>
        </div>
      </div>

      {/* Floating Camera Component */}
      <CameraToggleButton onStreamChange={setCameraStream} />
    </main>
  );
}
