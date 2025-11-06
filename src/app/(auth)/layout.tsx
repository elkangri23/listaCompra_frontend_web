import { Sidebar } from '@/components/layout/sidebar';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex bg-background text-foreground min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4 bg-background">{children}</main>
    </div>
  );
}
