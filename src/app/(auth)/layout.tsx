import { Sidebar } from '@/components/layout/sidebar';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
