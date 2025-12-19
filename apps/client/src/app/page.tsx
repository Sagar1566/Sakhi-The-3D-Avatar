'use client';

import { useState } from 'react';
import VoiceActivityDetector, { VADConfig } from '@/components/VoiceActivityDetector';
import TalkingHead from '@/components/TalkingHead';
import TextInput from '@/components/TextInput';
import { CameraToggleButton } from '@/components/CameraStream';
import ARViewer from '@/components/ARViewer';
import ReminderManager from '@/components/ReminderManager';
import ReminderNotification from '@/components/ReminderNotification';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sparkles, MessageSquare, Mic, Box, LogOut, User, Settings, Palette, ChevronRight, Edit, Monitor, Mail } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ProfileDialog from '@/components/ProfileDialog';

export default function Home() {
  const { user, signOut } = useAuth();
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState('F');
  const [selectedMood, setSelectedMood] = useState('neutral');
  const [showAR, setShowAR] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  const [voiceConfig, setVoiceConfig] = useState<VADConfig>({
    energyThreshold: 0.02,
    conversationBreakDuration: 2.5,
    minSpeechDuration: 0.8,
    maxSpeechDuration: 15,
    sampleRate: 16000
  });
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);

  // Personality options
  const personalities = [
    { value: 'friend', label: 'Friend', icon: '👋', description: 'Casual and friendly companion' },
    { value: 'doctor', label: 'Dr. Sakhi', icon: '🩺', description: 'Emotional support & wellness coach' },
    { value: 'student', label: 'Study Buddy', icon: '📚', description: 'Learning assistant' },
    { value: 'girlfriend', label: 'Companion', icon: '💕', description: 'Caring and affectionate' },
    { value: 'teacher', label: 'Teacher', icon: '👨‍🏫', description: 'Patient educator' },
  ];
  const [selectedPersonality, setSelectedPersonality] = useState('friend');

  // Background themes with actual color values
  const backgroundThemes = [
    { id: 'purple-pink', name: 'Purple Dream', colors: { from: '#581c87', via: '#000000', to: '#831843' } },
    { id: 'blue-cyan', name: 'Ocean Blue', colors: { from: '#1e3a8a', via: '#000000', to: '#164e63' } },
    { id: 'green-emerald', name: 'Forest Green', colors: { from: '#14532d', via: '#000000', to: '#064e3b' } },
    { id: 'orange-red', name: 'Sunset Fire', colors: { from: '#7c2d12', via: '#000000', to: '#7f1d1d' } },
    { id: 'indigo-purple', name: 'Midnight Sky', colors: { from: '#312e81', via: '#000000', to: '#581c87' } },
    { id: 'pink-rose', name: 'Rose Garden', colors: { from: '#831843', via: '#000000', to: '#881337' } },
  ];

  const [selectedBackground, setSelectedBackground] = useState(backgroundThemes[0]);

  return (
    <ProtectedRoute>
      <main
        className="relative min-h-screen overflow-x-hidden selection:bg-purple-200 transition-all duration-700"
        style={{
          background: `linear-gradient(to bottom right, ${selectedBackground.colors.from}, ${selectedBackground.colors.via}, ${selectedBackground.colors.to})`
        }}
        onClick={() => {
          if (showProfileMenu) setShowProfileMenu(false);
          if (showThemeSelector) setShowThemeSelector(false);
        }}
      >

        {/* Top Navigation Bar */}
        <div className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center pointer-events-none">
          {/* Brand Logo */}
          <div className="pointer-events-auto">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight" style={{ fontFamily: '"Outfit", sans-serif' }}>
              <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Sakhi</span>
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent ml-2">AI</span>
            </h1>
          </div>

          <div className="pointer-events-auto relative">
            {/* Profile Button */}
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setShowProfileMenu(!showProfileMenu);
                setShowThemeSelector(false);
              }}
              className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border border-white/20 transition-all shadow-lg p-0"
              title="Profile & Settings"
            >
              <div className="h-full w-full rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
                <span className="text-lg font-bold">
                  {user?.name?.charAt(0).toUpperCase() || <User className="h-6 w-6" />}
                </span>
              </div>
            </Button>

            {/* Profile Menu */}
            {showProfileMenu && (
              <div
                className="absolute top-14 right-0 w-72 bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                {/* User Info Header */}
                <div className="p-4 border-b border-white/10 bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-white font-semibold truncate">{user?.name}</p>
                      <p className="text-white/60 text-xs truncate">{user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => {
                      setIsProfileOpen(true);
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 text-white transition-colors text-left text-sm"
                  >
                    <Edit className="h-4 w-4 text-purple-400" />
                    <span>Edit Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowThemeSelector(!showThemeSelector);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/10 text-white transition-colors text-left text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <Palette className="h-4 w-4 text-blue-400" />
                      <span>Appearances</span>
                    </div>
                    <ChevronRight className={`h-4 w-4 transition-transform ${showThemeSelector ? 'rotate-90' : ''}`} />
                  </button>

                  {/* Theme Selector Sub-panel (Inline) */}
                  {showThemeSelector && (
                    <div className="pl-10 pr-2 pb-2 grid grid-cols-3 gap-2 animate-in slide-in-from-top-2">
                      {backgroundThemes.map((theme) => (
                        <button
                          key={theme.id}
                          onClick={() => setSelectedBackground(theme)}
                          className={`relative h-12 rounded-lg overflow-hidden border transition-all ${selectedBackground.id === theme.id
                            ? 'border-white ring-2 ring-white/20'
                            : 'border-white/20 hover:border-white/50'
                            }`}
                          title={theme.name}
                        >
                          <div
                            className="absolute inset-0"
                            style={{
                              background: `linear-gradient(to bottom right, ${theme.colors.from}, ${theme.colors.via}, ${theme.colors.to})`
                            }}
                          />
                          {selectedBackground.id === theme.id && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setIsSettingsOpen(true);
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 text-white transition-colors text-left text-sm"
                  >
                    <Settings className="h-4 w-4 text-green-400" />
                    <span>Settings</span>
                  </button>

                  <div className="h-px bg-white/10 my-1 mx-2" />

                  <button
                    onClick={signOut}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors text-left text-sm"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="relative z-10 w-full h-[100dvh] md:h-auto md:container md:mx-auto md:px-4 md:py-12 md:max-w-7xl pt-20 md:pt-12">
          {/* Main Interface Layout - Full Screen Avatar with Overlay Controls */}
          <div className="flex justify-center w-full h-full md:h-auto">
            <div className="w-full h-full md:h-auto md:max-w-md lg:max-w-2xl relative group md:rounded-[2.5rem] md:bg-white md:p-2 md:shadow-2xl md:shadow-purple-200/40 md:ring-1 md:ring-purple-50 transition-transform duration-500">
              <div
                className="overflow-hidden h-full md:h-auto md:rounded-[2rem] md:aspect-[3/4] lg:aspect-[3/4] relative transition-all duration-700"
                style={{
                  background: `linear-gradient(to bottom right, ${selectedBackground.colors.from}, ${selectedBackground.colors.via}, ${selectedBackground.colors.to})`
                }}
              >
                <TalkingHead
                  cameraStream={cameraStream}
                  className="h-full w-full"
                  voiceConfig={voiceConfig}
                  onVoiceConfigChange={setVoiceConfig}
                  onSpeakingStateChange={setIsAvatarSpeaking}
                />

                {/* Overlay Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-4 pt-12">
                  <div className="w-full">
                    <div className="w-full p-0">
                      <div className="w-full">
                        <TextInput
                          cameraStream={cameraStream}
                          voiceConfig={voiceConfig}
                          onVoiceConfigChange={setVoiceConfig}
                          isSpeaking={isAvatarSpeaking}
                          personality={selectedPersonality}
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Floating Action Buttons Dock */}
        <div className="fixed right-6 bottom-24 z-40 flex flex-col gap-4 items-center">

          {/* Reminder Manager */}
          <ReminderManager />

          {/* Camera Toggle */}
          <CameraToggleButton
            onStreamChange={setCameraStream}
            className="w-11 h-11 p-3"
          />


          {/* Professional Personality Switcher */}
          <div className="relative group">
            <button
              onClick={() => {
                const currentIndex = personalities.findIndex(p => p.value === selectedPersonality);
                const nextIndex = (currentIndex + 1) % personalities.length;
                setSelectedPersonality(personalities[nextIndex].value);
              }}
              className={`w-12 h-12 rounded-xl text-white shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center border border-white/30 backdrop-blur-sm relative overflow-hidden ${selectedPersonality === 'doctor'
                  ? 'bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500'
                  : selectedPersonality === 'teacher'
                    ? 'bg-gradient-to-br from-amber-500 via-orange-500 to-red-500'
                    : selectedPersonality === 'student'
                      ? 'bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500'
                      : selectedPersonality === 'girlfriend'
                        ? 'bg-gradient-to-br from-pink-500 via-rose-500 to-red-500'
                        : 'bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500'
                }`}
              aria-label="Switch Personality"
            >
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Icon */}
              <span className="text-2xl relative z-10 drop-shadow-lg">
                {personalities.find(p => p.value === selectedPersonality)?.icon}
              </span>
            </button>

            {/* Professional Tooltip */}
            <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
              <div className="bg-gray-900/95 backdrop-blur-xl text-white px-4 py-3 rounded-xl shadow-2xl border border-white/10 min-w-[200px]">
                {/* Arrow */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full">
                  <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[6px] border-l-gray-900/95" />
                </div>

                {/* Content */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{personalities.find(p => p.value === selectedPersonality)?.icon}</span>
                    <span className="font-semibold text-sm">{personalities.find(p => p.value === selectedPersonality)?.label}</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {personalities.find(p => p.value === selectedPersonality)?.description}
                  </p>
                  <div className="pt-1.5 border-t border-white/10">
                    <p className="text-[10px] text-gray-400 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                      </svg>
                      Click to switch
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AR Button */}
          <button
            onClick={() => setShowAR(true)}
            className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg transition-transform hover:scale-105 hover:shadow-purple-500/25 flex items-center justify-center border-2 border-white/20"
            title="View in AR"
          >
            <Box size={20} />
          </button>
        </div>

        {/* AR View Overlay */}
        {showAR && (
          <ARViewer
            onClose={() => setShowAR(false)}
            cameraStream={cameraStream}
            voiceConfig={voiceConfig}
            onVoiceConfigChange={setVoiceConfig}
            isSpeaking={isAvatarSpeaking}
          />
        )}

        {/* Reminder Notification Popup */}
        <ReminderNotification />

        {/* Settings Dialog */}
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Avatar Settings
              </DialogTitle>
              <DialogDescription>
                Customize your avatar's appearance and voice settings
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Avatar Model Selection */}
              <div className="space-y-2">
                <Label htmlFor="avatar-model" className="text-sm font-medium">
                  Avatar Model
                </Label>
                <Select value={selectedAvatar} onValueChange={setSelectedAvatar}>
                  <SelectTrigger id="avatar-model" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="F">Female Avatar</SelectItem>
                    <SelectItem value="M">Male Avatar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Mood Selection */}
              <div className="space-y-2">
                <Label htmlFor="avatar-mood" className="text-sm font-medium">
                  Avatar Mood
                </Label>
                <Select value={selectedMood} onValueChange={setSelectedMood}>
                  <SelectTrigger id="avatar-mood" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="happy">Happy</SelectItem>
                    <SelectItem value="sad">Sad</SelectItem>
                    <SelectItem value="angry">Angry</SelectItem>
                    <SelectItem value="love">Love</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Voice Configuration */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-semibold text-sm text-gray-900">Voice Configuration</h4>

                {/* Microphone Sensitivity */}
                <div className="space-y-2">
                  <Label htmlFor="mic-sensitivity" className="text-sm flex justify-between">
                    <span>Microphone Sensitivity</span>
                    <span className="font-mono text-xs bg-purple-100 px-2 py-0.5 rounded">
                      {(voiceConfig.energyThreshold).toFixed(3)}
                    </span>
                  </Label>
                  <Input
                    id="mic-sensitivity"
                    type="range"
                    min="0.001"
                    max="0.1"
                    step="0.001"
                    value={voiceConfig.energyThreshold}
                    onChange={(e) => setVoiceConfig({
                      ...voiceConfig,
                      energyThreshold: parseFloat(e.target.value)
                    })}
                    className="w-full cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>High</span>
                    <span>Medium</span>
                    <span>Low</span>
                  </div>
                </div>

                {/* Pause Duration */}
                <div className="space-y-2">
                  <Label htmlFor="pause-duration" className="text-sm flex justify-between">
                    <span>Pause Duration (seconds)</span>
                    <span className="font-mono text-xs bg-purple-100 px-2 py-0.5 rounded">
                      {(voiceConfig.conversationBreakDuration).toFixed(1)}s
                    </span>
                  </Label>
                  <Input
                    id="pause-duration"
                    type="range"
                    min="0.5"
                    max="5.0"
                    step="0.1"
                    value={voiceConfig.conversationBreakDuration}
                    onChange={(e) => setVoiceConfig({
                      ...voiceConfig,
                      conversationBreakDuration: parseFloat(e.target.value)
                    })}
                    className="w-full cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Short</span>
                    <span>Long</span>
                  </div>
                </div>

                {/* Min Speech Duration */}
                <div className="space-y-2">
                  <Label htmlFor="min-speech" className="text-sm flex justify-between">
                    <span>Minimum Speech Duration</span>
                    <span className="font-mono text-xs bg-purple-100 px-2 py-0.5 rounded">
                      {(voiceConfig.minSpeechDuration).toFixed(1)}s
                    </span>
                  </Label>
                  <Input
                    id="min-speech"
                    type="range"
                    min="0.1"
                    max="2.0"
                    step="0.1"
                    value={voiceConfig.minSpeechDuration}
                    onChange={(e) => setVoiceConfig({
                      ...voiceConfig,
                      minSpeechDuration: parseFloat(e.target.value)
                    })}
                    className="w-full cursor-pointer"
                  />
                </div>

                {/* Max Speech Duration */}
                <div className="space-y-2">
                  <Label htmlFor="max-speech" className="text-sm flex justify-between">
                    <span>Maximum Speech Duration</span>
                    <span className="font-mono text-xs bg-purple-100 px-2 py-0.5 rounded">
                      {(voiceConfig.maxSpeechDuration).toFixed(0)}s
                    </span>
                  </Label>
                  <Input
                    id="max-speech"
                    type="range"
                    min="5"
                    max="30"
                    step="1"
                    value={voiceConfig.maxSpeechDuration}
                    onChange={(e) => setVoiceConfig({
                      ...voiceConfig,
                      maxSpeechDuration: parseFloat(e.target.value)
                    })}
                    className="w-full cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Profile Edit Dialog */}
        <ProfileDialog open={isProfileOpen} onOpenChange={setIsProfileOpen} />
      </main>
    </ProtectedRoute>
  );
}
