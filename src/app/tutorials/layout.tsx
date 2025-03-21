import Sidebar from '@/components/docs/Sidebar';

export default function TutorialsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-row">
      <Sidebar />
      <div className="flex-1 p-8">{children}</div>
    </div>
  );
} 