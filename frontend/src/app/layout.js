import './globals.css';
import RootLayoutClient from './RootLayout.client';
import { ThemeProvider } from 'next-themes';

export const metadata = {
  title: 'My App',
  description: 'A Next.js application',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark">
          <RootLayoutClient>{children}</RootLayoutClient>
        </ThemeProvider>
      </body>
    </html>
  );
}