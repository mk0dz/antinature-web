import Sidebar from '@/components/docs/Sidebar';

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6 max-w-5xl">{children}</main>
    </div>
  );
}