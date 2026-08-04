import StudentSidebar from "@/components/student/StudentSidebar";
import StudentSessionTracker from "@/components/student/StudentSessionTracker";

export default function StudentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <StudentSessionTracker />

      <StudentSidebar />

      <main className="min-w-0 flex-1">
        {children}
      </main>
    </div>
  );
}