'use client';

import { useState } from 'react';
import './globals.css';

type NavItem = { icon: string; label: string; path: string; badge?: number };
type StatCard = { label: string; icon: string; value: string; subtitle: string; footer: string; kind?: 'attendance' };
type Lecture = { status: 'completed' | 'current' | 'upcoming'; statusLabel: string; time: string; period: string; code: string; title: string; doctor: string; room: string; badge: string };
type Subject = { name: string; percent: number; details: string; state: string; warning?: boolean };
type NewsItem = { category: string; time: string; title: string; description: string; download?: boolean };
type Task = { priority: string; deadline: string; title: string; description: string; urgent?: boolean };

const navItems: NavItem[] = [
  { icon: 'dashboard', label: 'الرئيسية', path: 'dashboard' },
  { icon: 'calendar_today', label: 'جدول المحاضرات', path: 'lecture-schedule' },
  { icon: 'how_to_reg', label: 'الحضور والغياب', path: 'attendance-records' },
  { icon: 'forum', label: 'الشات', path: 'campus-chat',  },
  { icon: 'campaign', label: 'الأخبار والإعلانات', path: 'news-and-announcements' },
  { icon: 'person', label: 'الملف الشخصي', path: 'student-profile' },
];

const stats: StatCard[] = [
  { label: 'محاضرات اليوم', icon: 'calendar_clock', value: '3', subtitle: 'محاضرات مقررة', footer: 'التالية: 10:30 ص في مدرج ج 101' },
  { label: 'نسبة الحضور التراكمية', icon: 'check_circle', value: '94%', subtitle: 'ممتاز - فوق المعدل المطلوب', footer: 'نسبة حضور ممتازة', kind: 'attendance' },
  { label: 'إجمالي أيام الغياب', icon: 'history_toggle_off', value: '2', subtitle: 'أيام مسجلة', footer: 'متبقي 4 أيام كحد أقصى قبل الإنذار' },
  { label: 'التكليفات والواجبات', icon: 'assignment', value: '4', subtitle: 'مهام قيد الإنجاز', footer: 'أقرب تسليم: غداً 11:59 م' },
];

const lectures: Lecture[] = [
  { status: 'completed', statusLabel: 'انتهت', time: '09:00', period: 'صباحاً', code: 'CS301', title: 'خوارزميات وهياكل بيانات', doctor: 'د. سامي عبد الرحمن', room: 'مدرج ج 101', badge: 'تم الحضور' },
  { status: 'current', statusLabel: 'جارية الآن', time: '11:00', period: 'صباحاً', code: 'CS304', title: 'شبكات الحاسب المتقدمة', doctor: 'د. مروة الشريف', room: 'معمل شبكات 4B', badge: 'المحاضرة الحالية' },
  { status: 'upcoming', statusLabel: 'القادمة', time: '01:30', period: 'ظهراً', code: 'IS202', title: 'نظم قواعد البيانات والمعلومات', doctor: 'د. خالد النجار', room: 'قاعة 204', badge: 'تبدأ بعد ساعتين' },
];

const subjects: Subject[] = [
  { name: 'هندسة البرمجيات', percent: 98, details: '0 غياب من 12 محاضرة', state: 'آمن جداً' },
  { name: 'شبكات الحاسب المتقدمة', percent: 92, details: '1 غياب مسجل', state: 'ضمن النصاب' },
  { name: 'هياكل البيانات والخوارزميات', percent: 88, details: '2 غياب (تنبيه أول)', state: 'انتبه للغياب', warning: true },
  { name: 'مقدمة في الذكاء الاصطناعي', percent: 96, details: '0 غياب مسجل', state: 'ممتاز' },
];

const news: NewsItem[] = [
  { category: 'أنشطة طلابية', time: 'منذ ساعتين', title: 'بدء التسجيل للأنشطة الطلابية والرحلات العلمية للفصل الدراسي الثاني', description: 'تعلن رعاية الشباب عن فتح باب التقديم في مختلف الأنشطة الثقافية والرياضية والابتكارية للعام الحالي.' },
  { category: 'شؤون أكاديمية', time: 'أمس', title: 'جدول امتحانات منتصف الفصل الدراسي (ميدتيرم) متاح الآن بصيغة PDF', description: 'يرجى من جميع الطلاب مراجعة المواعيد وأرقام اللجان والتأكد من عدم وجود تعارض في الجداول.', download: true },
  { category: 'ندوات ومعارض', time: 'منذ يومين', title: 'ندوة: ريادة الأعمال وحلول الذكاء الاصطناعي بقاعة المؤتمرات الكبرى', description: 'لقاء مفتوح مع رواد الأعمال وصناع التكنولوجيا بمصر والشرق الأوسط مع شهادات حضور معتمدة.' },
];

const tasks: Task[] = [
  { priority: 'أولوية قصوى', deadline: 'غداً 11:59 م', title: 'مشروع محاكاة شبكات (Packet Tracer)', description: 'تسليم التقرير وملف الـ pkt على المنصة', urgent: true },
  { priority: 'مقرر هياكل البيانات', deadline: 'الخميس القادم', title: 'حل مسائل الأشجار الثنائية (Binary Trees)', description: 'شيت رقم 4 - د. سامي عبد الرحمن' },
  { priority: 'قواعد البيانات', deadline: 'الأحد القادم', title: 'تقرير معمل SQL المتقدم', description: 'تنفيذ مخطط ERD لمتجر إلكتروني' },
];

const services = [
  { icon: 'payments', label: 'المصروفات الدراسية' },
  { icon: 'badge', label: 'طلب إفادة قيد' },
  { icon: 'local_library', label: 'المكتبة الرقمية' },
  { icon: 'mail', label: 'البريد الجامعي' },
];

function Icon({ name }: { name: string }) {
  return <span className="material-symbols-outlined">{name}</span>;
}

export default function Dashboard() {
  const [activePath, setActivePath] = useState('dashboard');
  const [searchText, setSearchText] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="app-shell" dir="rtl">
      {/* Overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={closeSidebar}
      />

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div>
          <div className="brand">
            <div className="brand-logo">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgubzPyZZlMk5eO9sWvznoaOtRYVNUDUo7cKTd2xQS3nkbIMBywsKdjac&s=10"
                alt="مدينة الثقافة والعلوم"
              />
            </div>
            <div>
              <h2>مدينة الثقافة والعلوم</h2>
              <p>بوابة الخدمات الأكاديمية</p>
            </div>
            <button
              className="sidebar-close"
              type="button"
              onClick={closeSidebar}
              aria-label="إغلاق القائمة"
            >
              <Icon name="close" />
            </button>
          </div>
          <nav className="nav-list">
            {navItems.map((item) => (
              <a
                key={item.path}
                href="#"
                className={`nav-item ${activePath === item.path ? 'active' : ''}`}
                onClick={(event) => {
                  event.preventDefault();
                  setActivePath(item.path);
                  closeSidebar();
                }}
              >
                <div className="nav-content">
                  <Icon name={item.icon} />
                  <span>{item.label}</span>
                </div>
                {item.badge ? <span className="badge">{item.badge}</span> : null}
              </a>
            ))}
          </nav>
        </div>
        <div className="support-card">
          <div className="support-info">
            <Icon name="support_agent" />
            <div>
              <strong>الدعم الفني والطلابي</strong>
              <small>متاح 24/7 للمساعدة</small>
            </div>
          </div>
          <Icon name="arrow_back_ios_new" />
        </div>
      </aside>

      <div className="page">
        <header className="topbar">
          <div className="topbar-start">
            <button
              className="hamburger-btn"
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="فتح القائمة"
            >
              <span className="hamburger-line" />
              <span className="hamburger-line" />
              <span className="hamburger-line" />
            </button>
            <div className="semester-pill">
              <Icon name="school" />
              <span>الفصل الدراسي الثاني 2024/2025</span>
            </div>
            <div className="search-box">
              <Icon name="search" />
              <input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="بحث عن المقررات، الأساتذة، القاعات..."
              />
            </div>
          </div>
          <div className="topbar-end">
            <button className="icon-btn" type="button">
              <Icon name="notifications" />
              <span className="notification-dot" />
            </button>
            <span className="divider" />
            <div className="profile">
              <div>
                <strong>أحمد مصطفى</strong>
                <small>هندسة حاسبات ونظم - الفرقة الثالثة</small>
              </div>
              <div className="avatar">أ</div>
            </div>
          </div>
        </header>

        <main className="main-content">
          <section className="greeting-card card"><div className="glow" /><div className="greeting-copy"><div className="greeting-title"><h1>صباح الخير، أحمد</h1><span className="active-semester"><span className="pulse-dot" />فصل دراسي نشط</span></div><p>إليك ملخص يومك الدراسي • <strong>الأحد، 16 أكتوبر</strong> • الأسبوع الدراسي الخامس</p></div><div className="greeting-meta"><div className="mini-card"><span className="mini-icon"><Icon name="verified_user" /></span><div><small>حالة القيد الأكاديمي</small><strong>طالب منتظم</strong></div></div><div className="mini-card"><span className="gpa-circle">GPA</span><div><small>المعدل التراكمي العام</small><strong className="accent">3.78 <span>/ 4.00</span></strong></div></div></div></section>

          <section className="stats-grid">{stats.map((stat) => <article className="stat-card card" key={stat.label}><div className="stat-head"><span>{stat.label}</span><span className="stat-icon"><Icon name={stat.icon} /></span></div><div className={`stat-body ${stat.kind === 'attendance' ? 'attendance-row' : ''}`}><div><strong className="stat-value">{stat.value}</strong><span className="stat-subtitle">{stat.subtitle}</span></div>{stat.kind === 'attendance' ? <div className="circle-progress"><svg viewBox="0 0 36 36"><path className="track" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" /><path className="progress" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" /></svg></div> : null}</div><div className="stat-footer">{stat.footer}</div></article>)}</section>

          <section className="content-grid"><div className="primary-column">
            <section className="card section-card"><div className="section-header"><div className="section-title"><span className="section-icon"><Icon name="view_timeline" /></span><h2>جدول محاضرات اليوم الأحد</h2></div><a href="#">عرض الجدول الأسبوعي الكامل</a></div><div className="lecture-list">{lectures.map((lecture) => <article className={`lecture ${lecture.status === 'current' ? 'current' : ''}`} key={lecture.code}><div className="lecture-main"><div className={`lecture-time ${lecture.status === 'current' ? 'current-time' : ''}`}><small>{lecture.statusLabel}</small><strong>{lecture.time}</strong><small>{lecture.period}</small></div><div className="lecture-info"><div className="course-title"><span className="course-code">{lecture.code}</span><h3>{lecture.title}</h3></div><div className="lecture-meta"><span><Icon name="person" />{lecture.doctor}</span><span><Icon name="meeting_room" />{lecture.room}</span></div></div></div><span className={`lecture-badge ${lecture.status === 'current' ? 'current-badge' : ''}`}>{lecture.badge}</span></article>)}</div></section>

            <section className="card section-card"><div className="section-header"><div className="section-title"><span className="section-icon"><Icon name="donut_large" /></span><div><h2>ملخص الحضور والغياب للمقررات</h2><p>متابعة نسب الحضور ونصاب الحرمان لكل مقرر دراسي</p></div></div><button className="soft-btn" type="button">تقرير الحضور الشامل</button></div><div className="attendance-grid">{subjects.map((subject) => <article className="attendance-card" key={subject.name}><div className="attendance-head"><strong>{subject.name}</strong><span>{subject.percent}%</span></div><div className="progress-bar"><span style={{ width: `${subject.percent}%` }} /></div><div className="attendance-foot"><span className={subject.warning ? 'warning' : ''}>{subject.details}</span><span className={`state ${subject.warning ? 'warning-state' : ''}`}>{subject.state}</span></div></article>)}</div></section>

            <section className="card section-card"><div className="section-header"><div className="section-title"><span className="section-icon"><Icon name="campaign" /></span><h2>إعلانات وأخبار مدينة الثقافة والعلوم</h2></div><a href="#">كل الأخبار</a></div><div className="news-list">{news.map((item) => <article className="news-item" key={item.title}><div><div className="news-meta"><span className="category">{item.category}</span><span>{item.time}</span></div><h3>{item.title}</h3><p>{item.description}</p></div>{item.download ? <button className="soft-btn" type="button"><Icon name="download" /> تحميل PDF</button> : <Icon name="chevron_left" />}</article>)}</div></section>
          </div>

          <aside className="secondary-column"><section className="card side-card"><div className="side-title"><div><span className="section-icon"><Icon name="checklist" /></span><h3>المهام والتكليفات</h3></div><span className="urgent-pill">3 عاجلة</span></div><div className="task-list">{tasks.map((task) => <article className={`task-card ${task.urgent ? 'urgent' : ''}`} key={task.title}><div className="task-meta"><span>{task.priority}</span><span className={task.urgent ? 'danger' : ''}>{task.deadline}</span></div><h4>{task.title}</h4><p>{task.description}</p></article>)}</div><button className="full-btn" type="button"><Icon name="add_task" />تسليم تكليف جديد</button></section>
            <section className="card side-card"><h3 className="advisor-heading"><Icon name="school" />المرشد الأكاديمي</h3><div className="advisor-profile"><div className="advisor-avatar">د.م</div><div><strong>د. محمود عبد العزيز</strong><small>أستاذ مساعد بقسم علوم الحاسب</small></div></div><p className="advisor-text">الساعات المكتبية: الثلاثاء والأربعاء (12:00 م - 02:00 م) بمكتب 314 بالمبنى الرئيسي.</p><div className="advisor-actions"><button className="primary-btn" type="button">حجز موعد</button><button className="soft-btn" type="button">إرسال استفسار</button></div></section>
            <section className="card side-card"><h3>خدمات سريعة</h3><div className="services-grid">{services.map((service) => <a href="#" key={service.label}><Icon name={service.icon} /><span>{service.label}</span></a>)}</div></section>
          </aside></section>
        </main>
      </div>
    </div>
  );
}