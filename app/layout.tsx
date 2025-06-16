import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "إدارة الأحزاب والأجزاء",
  description: "تطبيق لإدارة وتتبع قراءة الأحزاب والأجزاء القرآنية",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "إدارة الأحزاب والأجزاء",
  },
    generator: 'v0.dev'
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1e1e2f",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="icon" href="/quran-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="إدارة الأحزاب والأجزاء" />
        <link rel="apple-touch-icon" href="/quran-icon.png" />
      </head>
      <body className={inter.className}>
        {children}
        <Toaster />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                      
                      // التحقق من التحديثات
                      registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        if (newWorker) {
                          newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                              // يوجد تحديث جديد
                              if (confirm('يتوفر تحديث جديد للتطبيق. هل تريد إعادة التحميل؟')) {
                                newWorker.postMessage({ type: 'SKIP_WAITING' });
                                window.location.reload();
                              }
                            }
                          });
                        }
                      });
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
                
                // الاستماع لتغييرات حالة الاتصال
                window.addEventListener('online', function() {
                  console.log('Back online');
                });
                
                window.addEventListener('offline', function() {
                  console.log('Gone offline');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
