import { prisma } from "@/lib/prisma";
import { AnnouncementBar } from "@/components/home/AnnouncementBar";
import { HomeNavbar } from "@/components/home/HomeNavbar";
import { HomeHero } from "@/components/home/HomeHero";
import { DeanSection } from "@/components/home/DeanSection";
import { DepartmentsSection } from "@/components/home/DepartmentsSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { FacultySection } from "@/components/home/FacultySection";
import { EventsSection } from "@/components/home/EventsSection";
import { NewsSection } from "@/components/home/NewsSection";
import { CampusLocation } from "@/components/home/CampusLocation";
import { HomeFooter } from "@/components/home/HomeFooter";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch real-time data from database
  const [
    settings,
    departments,
    subjectsCount,
    posts,
    doctorsCount,
    studentsCount,
    facultyMembers,
  ] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: "default" } }),
    prisma.department.findMany({
      include: {
        _count: { select: { subjects: true, users: true } },
      },
    }),
    prisma.subject.count(),
    prisma.post.findMany({
      take: 3,
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      include: {
        author: { select: { name: true, role: true } },
        subject: { select: { name: true } },
        _count: { select: { comments: true, reactions: true } },
      },
    }),
    prisma.user.count({ where: { role: "DOCTOR" } }),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.findMany({
      where: { role: { in: ["DOCTOR", "TA"] } },
      take: 6,
      select: {
        id: true,
        name: true,
        role: true,
        department: { select: { name: true } },
        facultyProfile: { select: { title: true, specialty: true } },
      },
    }),
  ]);

  const instituteName =
    settings?.instituteName || "المعهد العالي لعلوم الحاسب ونظم المعلومات - مدينة الثقافة والعلوم";
  const shortName = settings?.shortName || "CSI 6th of October";
  const heroTitle = settings?.heroTitle || "صناع المستقبل التقني ورواد الابتكار";
  const heroSubtitle =
    settings?.heroSubtitle ||
    "المعهد العالي لعلوم الحاسب ونظم المعلومات بمدينة الثقافة والعلوم بالسادس من أكتوبر — صرح أكاديمي رائد معتمد لإعداد خريجين متميزين في هندسة البرمجيات والذكاء الاصطناعي ونظم المعلومات.";

  const facultyList = facultyMembers.map((m) => ({
    id: m.id,
    name: m.name,
    role: m.role,
    departmentName: m.department?.name,
    title: m.facultyProfile?.title,
    specialty: m.facultyProfile?.specialty,
  }));

  return (
    <div className="relative min-h-screen bg-[#070B16] text-white selection:bg-amber-500 selection:text-slate-950 font-sans">
      {/* 1. Top Urgent Announcement Bar */}
      <AnnouncementBar
        phone={settings?.contactPhone}
        email={settings?.contactEmail}
      />

      {/* 2. Responsive Sticky Header with ThemeToggle and Portal CTA */}
      <HomeNavbar instituteName={instituteName} shortName={shortName} />

      {/* 3. Hero Section with Framer Motion & Dynamic Card Tabs */}
      <HomeHero
        heroTitle={heroTitle}
        heroSubtitle={heroSubtitle}
        shortName={shortName}
        studentsCount={studentsCount}
        doctorsCount={doctorsCount}
        subjectsCount={subjectsCount}
      />

      {/* 4. Dean's Welcome & Institution Vision / Mission */}
      <DeanSection />

      {/* 5. Academic Departments & Careers (CS & IS Tracks) */}
      <DepartmentsSection departments={departments} />

      {/* 6. Smart Digital Ecosystem & Features */}
      <FeaturesSection />

      {/* 7. Faculty & Leadership Section */}
      <FacultySection facultyList={facultyList} />

      {/* 8. Campus Events & Hackathons */}
      <EventsSection />

      {/* 9. Latest News & Announcements */}
      <NewsSection posts={posts} />

      {/* 10. Campus Location & Interactive Map */}
      <CampusLocation
        phone={settings?.contactPhone}
        email={settings?.contactEmail}
        address={settings?.address}
      />

      {/* 11. Footer with Fast Links and City Accreditation */}
      <HomeFooter instituteName={instituteName} shortName={shortName} />
    </div>
  );
}
