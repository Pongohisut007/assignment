import './globals.css';
import RootLayoutClient from './RootLayout.client';

export const metadata = {
  title: 'My App',
  description: 'A Next.js application',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}