import type { Metadata } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google';
import './globals.css';
import Script from 'next/script';
import { WebSocketProvider } from '@/contexts/WebSocketContext';
import { ReminderProvider } from '@/contexts/ReminderContext';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin']
});

const robotoMono = Roboto_Mono({
  variable: '--font-roboto-mono',
  subsets: ['latin']
});

export const metadata: Metadata = {
  title: 'Sakhi AI',
  description: 'Your intelligent 3D avatar companion'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Import map for TalkingHead ES modules */}
        <script
          type="importmap"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              imports: {
                three:
                  'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js',
                'three/addons/':
                  'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/',
                talkinghead:
                  'https://cdn.jsdelivr.net/gh/met4citizen/TalkingHead@1.4/modules/talkinghead.mjs'
              }
            })
          }}
        />
      </head>

      <body
        className={`${inter.variable} ${robotoMono.variable} antialiased`}
      >
        <AuthProvider>
          <WebSocketProvider>
            <ReminderProvider>
              {children}
            </ReminderProvider>
          </WebSocketProvider>
        </AuthProvider>



        {/* Load TalkingHead library */}
        <Script
          id="load-talkinghead"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              import('https://cdn.jsdelivr.net/gh/met4citizen/TalkingHead@1.4/modules/talkinghead.mjs')
                .then(module => {
                  window.TalkingHead = module.TalkingHead;
                  console.log('TalkingHead loaded globally');
                  window.dispatchEvent(new Event('talkinghead-loaded'));
                })
                .catch(err => {
                  console.error('Failed to load TalkingHead:', err);
                  window.dispatchEvent(new Event('talkinghead-error'));
                });
            `
          }}
        />
      </body>
    </html>
  );
}
