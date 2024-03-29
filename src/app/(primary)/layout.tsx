import SideMenu from "../_components/SideMenu";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideMenu />
      <div className="flex-grow">
        <main className="mx-auto my-0 py-10">{children}</main>
      </div>
    </div>
  );
}
