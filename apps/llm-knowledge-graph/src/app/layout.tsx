import './global.css';
import '../../../../libs/ui/src/styles/global.css';
export const metadata = {
  title: 'LLM Knowledge Graph',
  description: '.....',
};

import { MindGraphSidebar } from '../components/core/AppSidebar';
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body> <MindGraphSidebar/></body>
    </html>
  );
}
