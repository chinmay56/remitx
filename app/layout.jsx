'use client';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/lib/ThemeContext';
import { LanguageProvider } from '@/lib/LanguageContext';

export default function RootLayout({ children }) {
  return (
    <html lang="en" style={{ colorScheme: 'dark' }}>
      <body style={{ background: '#080C14', color: '#F0F4FF' }}>
        <ThemeProvider>
          <LanguageProvider>
            {children}
            <Toaster
              position="bottom-center"
              toastOptions={{
                style: {
                  background: 'rgba(13, 19, 33, 0.95)',
                  color: '#F0F4FF',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '16px',
                  fontSize: '14px',
                  fontWeight: '500',
                },
                success: {
                  iconTheme: { primary: '#10B981', secondary: '#080C14' },
                },
                error: {
                  iconTheme: { primary: '#EF4444', secondary: '#080C14' },
                },
              }}
            />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
