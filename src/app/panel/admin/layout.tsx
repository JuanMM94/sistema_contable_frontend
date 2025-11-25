
import { AdminFetchProvider } from '@/providers/AdminFetchProvider';
import '../../globals.css';


export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <AdminFetchProvider>{children}</AdminFetchProvider>
    </div>
  );
}
