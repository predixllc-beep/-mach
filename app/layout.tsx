import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { BottomNav } from '@/components/BottomNav';
import { ThemeProvider } from '@/components/ThemeProvider';
import { SocketProvider } from '@/components/SocketProvider';

export const metadata: Metadata = {
  title: 'My Google AI Studio App',
  description: 'My Google AI Studio App',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SocketProvider>
            {children}
            <BottomNav />
          </SocketProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
