import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getProfile } from "@/lib/auth";
import { Sidebar } from "@/components/sidebar";

export default async function ProspectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const { id } = await params;
  const business = await prisma.business.findUnique({
    where: { id },
    select: { id: true, name: true, sector: true, city: true, userId: true },
  });
  if (
    !business ||
    (business.userId !== profile.id && profile.role !== "ADMIN")
  ) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <Sidebar business={business} />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
