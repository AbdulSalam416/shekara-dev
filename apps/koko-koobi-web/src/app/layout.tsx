import './global.css';
import '../../../../libs/ui/src/styles/global.css';
export const metadata = {
  title: 'Welcome to Koko & Koobi',
  description: 'Your number one source for hyper-local market insights',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
