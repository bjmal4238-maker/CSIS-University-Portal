import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding CSIS Database...");

  // 1. Academic Years
  const yearsData = [
    { name: "الفرقة الأولى", code: "YEAR_1", level: 1 },
    { name: "الفرقة الثانية", code: "YEAR_2", level: 2 },
    { name: "الفرقة الثالثة", code: "YEAR_3", level: 3 },
    { name: "الفرقة الرابعة", code: "YEAR_4", level: 4 },
  ];

  const yearMap: Record<string, string> = {};
  for (const y of yearsData) {
    const yr = await prisma.academicYear.upsert({
      where: { code: y.code },
      update: {},
      create: y,
    });
    yearMap[y.code] = yr.id;
  }
  console.log("✅ Academic Years seeded.");

  // 2. Departments
  const deptCS = await prisma.department.upsert({
    where: { code: "CS" },
    update: {},
    create: {
      name: "علوم الحاسب",
      code: "CS",
      description: "قسم علوم الحاسب، البرمجيات، وهندسة النظم الذكية",
      headOfDepartment: "أ.د. عصام الدين عبد الحميد",
    },
  });

  const deptIS = await prisma.department.upsert({
    where: { code: "IS" },
    update: {},
    create: {
      name: "نظم المعلومات",
      code: "IS",
      description: "قسم نظم المعلومات الإدارية، قواعد البيانات، وتحليل بيئات الأعمال",
      headOfDepartment: "أ.د. ماجدة إبراهيم حلمي",
    },
  });
  console.log("✅ Departments seeded.");

  // 3. Super Admin
  const adminPasswordHash = await bcrypt.hash("Admin@123456", 10);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@csis.edu.eg" },
    update: {
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      status: "ACTIVE",
    },
    create: {
      name: "أ.د. عميد معهد الحاسبات ونظم المعلومات",
      email: "admin@csis.edu.eg",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      status: "ACTIVE",
      departmentId: deptCS.id,
      facultyProfile: {
        create: {
          title: "عميد المعهد",
          officeRoom: "مبنى الإدارة - غرفة 101",
          specialty: "هندسة البرمجيات والذكاء الاصطناعي",
        },
      },
    },
  });
  console.log("✅ Super Admin user seeded:", adminUser.email);

  // 4. Doctors
  const doctorPasswordHash = await bcrypt.hash("Doctor@123456", 10);

  const doctorAhmed = await prisma.user.upsert({
    where: { email: "doctor.ahmed@csis.edu.eg" },
    update: { passwordHash: doctorPasswordHash, role: "DOCTOR", status: "ACTIVE" },
    create: {
      name: "د. أحمد فؤاد النحاس",
      email: "doctor.ahmed@csis.edu.eg",
      passwordHash: doctorPasswordHash,
      role: "DOCTOR",
      status: "ACTIVE",
      departmentId: deptCS.id,
      facultyProfile: {
        create: {
          title: "أستاذ مشارك",
          officeRoom: "مبنى د - غرفة 204",
          specialty: "تراكيب البيانات والخوارزميات",
        },
      },
    },
  });

  const doctorMona = await prisma.user.upsert({
    where: { email: "doctor.mona@csis.edu.eg" },
    update: { passwordHash: doctorPasswordHash, role: "DOCTOR", status: "ACTIVE" },
    create: {
      name: "د. منى عبد الرحمن السعيد",
      email: "doctor.mona@csis.edu.eg",
      passwordHash: doctorPasswordHash,
      role: "DOCTOR",
      status: "ACTIVE",
      departmentId: deptIS.id,
      facultyProfile: {
        create: {
          title: "أستاذ مساعد",
          officeRoom: "مبنى د - غرفة 208",
          specialty: "نظم وقواعد بيانات المؤسسات",
        },
      },
    },
  });
  console.log("✅ Doctors seeded.");

  // 5. Teaching Assistants (TAs)
  const taPasswordHash = await bcrypt.hash("Ta@123456", 10);

  const taOmar = await prisma.user.upsert({
    where: { email: "ta.omar@csis.edu.eg" },
    update: { passwordHash: taPasswordHash, role: "TA", status: "ACTIVE" },
    create: {
      name: "م. عمر شريف رضوان",
      email: "ta.omar@csis.edu.eg",
      passwordHash: taPasswordHash,
      role: "TA",
      status: "ACTIVE",
      departmentId: deptCS.id,
      facultyProfile: {
        create: {
          title: "مدرس مساعد",
          officeRoom: "معمل البرمجيات 2",
          specialty: "هندسة البرمجيات وتطبيقات الويب",
        },
      },
    },
  });

  const taSara = await prisma.user.upsert({
    where: { email: "ta.sara@csis.edu.eg" },
    update: { passwordHash: taPasswordHash, role: "TA", status: "ACTIVE" },
    create: {
      name: "م. سارة محمود خليل",
      email: "ta.sara@csis.edu.eg",
      passwordHash: taPasswordHash,
      role: "TA",
      status: "ACTIVE",
      departmentId: deptIS.id,
      facultyProfile: {
        create: {
          title: "معيدة",
          officeRoom: "معمل نظم المعلومات 1",
          specialty: "تحليل النظم وأمن المعلومات",
        },
      },
    },
  });
  console.log("✅ TAs seeded.");

  // 6. Students
  const studentPasswordHash = await bcrypt.hash("Student@123456", 10);

  // Active Student 1 (Year 1 CS)
  await prisma.user.upsert({
    where: { email: "student.ahmed@csis.edu.eg" },
    update: { passwordHash: studentPasswordHash, role: "STUDENT", status: "ACTIVE" },
    create: {
      name: "أحمد علي إبراهيم",
      email: "student.ahmed@csis.edu.eg",
      passwordHash: studentPasswordHash,
      role: "STUDENT",
      status: "ACTIVE",
      departmentId: deptCS.id,
      studentProfile: {
        create: {
          studentId: "20241001",
          universityCode: "CSI-24-001",
          academicYearId: yearMap["YEAR_1"],
          gpa: 3.68,
          totalCredits: 34,
        },
      },
    },
  });

  // Active Student 2 (Year 2 IS)
  await prisma.user.upsert({
    where: { email: "student.nour@csis.edu.eg" },
    update: { passwordHash: studentPasswordHash, role: "STUDENT", status: "ACTIVE" },
    create: {
      name: "نور إبراهيم سلامة",
      email: "student.nour@csis.edu.eg",
      passwordHash: studentPasswordHash,
      role: "STUDENT",
      status: "ACTIVE",
      departmentId: deptIS.id,
      studentProfile: {
        create: {
          studentId: "20231012",
          universityCode: "CSI-23-012",
          academicYearId: yearMap["YEAR_2"],
          gpa: 3.85,
          totalCredits: 68,
        },
      },
    },
  });

  // Pending Student (to test pending accounts queue)
  await prisma.user.upsert({
    where: { email: "student.karim@csis.edu.eg" },
    update: { passwordHash: studentPasswordHash, role: "STUDENT", status: "PENDING" },
    create: {
      name: "كريم حسين عبد الله",
      email: "student.karim@csis.edu.eg",
      passwordHash: studentPasswordHash,
      role: "STUDENT",
      status: "PENDING",
      departmentId: deptCS.id,
      studentProfile: {
        create: {
          studentId: "20241088",
          universityCode: "CSI-24-088",
          academicYearId: yearMap["YEAR_1"],
          gpa: 3.12,
          totalCredits: 30,
        },
      },
    },
  });
  console.log("✅ Sample Students seeded.");

  // 7. Core Subjects
  const subjectCS101 = await prisma.subject.upsert({
    where: { code: "CS101" },
    update: {},
    create: {
      name: "مقدمة في البرمجة وتراكيب البيانات",
      code: "CS101",
      creditHours: 3,
      departmentId: deptCS.id,
      academicYearId: yearMap["YEAR_1"],
      doctorId: doctorAhmed.id,
      taId: taOmar.id,
      description: "أساسيات البرمجة بلغة C++ وهياكل البيانات الأساسية",
    },
  });

  const subjectIS101 = await prisma.subject.upsert({
    where: { code: "IS101" },
    update: {},
    create: {
      name: "أساسيات نظم المعلومات وتكنولوجيا المؤسسات",
      code: "IS101",
      creditHours: 3,
      departmentId: deptIS.id,
      academicYearId: yearMap["YEAR_1"],
      doctorId: doctorMona.id,
      taId: taSara.id,
      description: "مفاهيم نظم المعلومات، قواعد البيانات وإدارة التقنية",
    },
  });

  const subjectCS201 = await prisma.subject.upsert({
    where: { code: "CS201" },
    update: {},
    create: {
      name: "تصميم وتحليل الخوارزميات",
      code: "CS201",
      creditHours: 3,
      departmentId: deptCS.id,
      academicYearId: yearMap["YEAR_2"],
      doctorId: doctorAhmed.id,
      taId: taOmar.id,
      description: "دراسة تقنيات تحليل كفاءة الخوارزميات والبرمجة الديناميكية",
    },
  });
  console.log("✅ Subjects seeded.");

  // 8. Schedules
  // Clear previous schedules to prevent duplication on re-seed
  await prisma.schedule.deleteMany();

  await prisma.schedule.createMany({
    data: [
      {
        subjectId: subjectCS101.id,
        departmentId: deptCS.id,
        academicYearId: yearMap["YEAR_1"],
        doctorId: doctorAhmed.id,
        dayOfWeek: "Saturday",
        startTime: "09:00",
        endTime: "10:30",
        room: "مدرج 1 الرئيسي",
        type: "LECTURE",
      },
      {
        subjectId: subjectCS101.id,
        departmentId: deptCS.id,
        academicYearId: yearMap["YEAR_1"],
        taId: taOmar.id,
        dayOfWeek: "Saturday",
        startTime: "10:45",
        endTime: "12:15",
        room: "معمل الحاسب 2",
        type: "LAB",
      },
      {
        subjectId: subjectIS101.id,
        departmentId: deptIS.id,
        academicYearId: yearMap["YEAR_1"],
        doctorId: doctorMona.id,
        dayOfWeek: "Sunday",
        startTime: "09:00",
        endTime: "10:30",
        room: "مدرج 2",
        type: "LECTURE",
      },
      {
        subjectId: subjectCS201.id,
        departmentId: deptCS.id,
        academicYearId: yearMap["YEAR_2"],
        doctorId: doctorAhmed.id,
        dayOfWeek: "Monday",
        startTime: "11:00",
        endTime: "12:30",
        room: "مدرج 3",
        type: "LECTURE",
      },
    ],
  });
  console.log("✅ Schedules seeded.");

  // 9. Posts
  await prisma.post.deleteMany();

  await prisma.post.create({
    data: {
      authorId: adminUser.id,
      title: "مرحباً بكم في بوابة معهد الحاسبات ونظم المعلومات للعام الأكاديمي الجديد",
      content:
        "يسر إدارة المعهد العالي لعلوم الحاسب ونظم المعلومات بمدينة الثقافة والعلوم أن ترحب بجميع أبنائنا الطلاب وأعضاء هيئة التدريس والهيئة المعاونة. يرجى من جميع الطلاب مراجعة جداولهم عبر البوابة والالتزام بتسجيل الحضور عبر مسح رمز الـ QR مع انطلاق المحاضرات.",
      isPinned: true,
      allowComments: true,
      allowReactions: true,
    },
  });

  await prisma.post.create({
    data: {
      authorId: doctorAhmed.id,
      subjectId: subjectCS101.id,
      title: "إرشادات مقرر مقدمة في البرمجة CS101 وتوزيع الدرجات",
      content:
        "أهلاً بطلاب الفرقة الأولى، تم رفع تفاصيل توزيع درجات مقرر البرمجة وتراكيب البيانات وتفاصيل السكاشن العملية. نؤكد على ضرورة الحضور بانتظام واستخدام الماسح الضوئي للبوابة لتسجيل الحضور في كل محاضرة.",
      isPinned: false,
      allowComments: true,
      allowReactions: true,
    },
  });
  console.log("✅ Posts seeded.");

  // 10. Site Settings
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      instituteName: "المعهد العالي لعلوم الحاسب ونظم المعلومات - مدينة الثقافة والعلوم",
      shortName: "CSI Computer Science Institute",
      logoUrl: "/logo.png",
      faviconUrl: "/favicon.ico",
      description: "بوابة المعهد العالي لعلوم الحاسب ونظم المعلومات بمدينة الثقافة والعلوم بالسادس من أكتوبر",
      contactPhone: "02-38350000",
      contactEmail: "csis@csi.edu.eg",
      address: "مدينة الثقافة والعلوم، المجاورة الأولى، الحي الأول، مدينة 6 أكتوبر، الجيزة، مصر",
      facebookUrl: "https://facebook.com/csi.october",
      heroTitle: "مستقبلك في علوم الحاسب يبدأ من هنا",
      heroSubtitle: "صرح أكاديمي رائد بمدينة الثقافة والعلوم يؤهلك لأعلى معايير سوق العمل البرمجي والتقني محلياً ودولياً",
      primaryColor: "#f59e0b",
      secondaryColor: "#0f172a",
      maintenanceMode: false,
      maintenanceMessage: "نقوم حالياً بإجراء بعض أعمال التحديث والصيانة لتحسين وتطوير تجربة البوابة الأكاديمية. سنعود للعمل قريباً.",
    },
  });
  console.log("✅ Site Settings seeded.");

  console.log("\n🎉 Database Seed Completed Successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
