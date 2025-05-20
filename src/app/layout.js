import './globals.css';

export const metadata = {
  title: 'Intercom Admin Panel',
  description: 'A dummy Intercom AI-enhanced admin panel',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}