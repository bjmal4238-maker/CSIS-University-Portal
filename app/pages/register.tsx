'use client';

import { useState, FormEvent } from 'react';
import './globals.css';

function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>;
}

export default function LoginPage({ onLogin }: { onLogin?: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setShowError(false);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      showToast('تم تسجيل الدخول بنجاح! جاري تحويلك إلى لوحة التحكم الجامعية...');
      onLogin?.();
    }, 1800);
  };

  const simulateError = () => {
    setShowError(true);
  };

  return (
    <div className="login-shell" dir="rtl">
      {/* Top Navigation */}
      <header className="login-header">
        <div className="header-brand">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgubzPyZZlMk5eO9sWvznoaOtRYVNUDUo7cKTd2xQS3nkbIMBywsKdjac&s=10"
            alt="مدينة الثقافة والعلوم"
            className="header-logo"
          />
          <div>
            <strong>مدينة الثقافة والعلوم</strong>
            <small>Culture & Science City</small>
          </div>
        </div>

        <div className="header-actions">
          <div className="status-pill">
            <span className="status-dot" />
            <span>بوابة الخدمات الإلكترونية الموحدة</span>
          </div>
          <a href="#help" className="help-link" onClick={(e) => { e.preventDefault(); showToast('فريق الدعم الفني متواجد لمساعدتك عبر: support@csc.edu.eg'); }}>
            <Icon name="support_agent" />
            <span>المساعدة والدعم</span>
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="login-main">
        <div className="login-card">
          {/* Left / Branded Visual Column */}
          <aside className="brand-panel">
            <div className="brand-glow brand-glow-1" />
            <div className="brand-glow brand-glow-2" />

            <div className="brand-top">
              <div className="portal-badge">
                <span className="badge-dot" />
                <span>بوابة الطلاب وأعضاء هيئة التدريس</span>
              </div>

              <div className="brand-emblem">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgubzPyZZlMk5eO9sWvznoaOtRYVNUDUo7cKTd2xQS3nkbIMBywsKdjac&s=10"
                  alt="Culture & Science City"
                />
              </div>

              <h2>مرحباً بك في بوابتك الجامعية</h2>
              <p>
                كل ما تحتاجه لإدارة حياتك الجامعية في مكان واحد — الجداول الدراسية،
                التسجيل الأكاديمي، النتائج، والتواصل مع الكلية.
              </p>
            </div>

            <div className="feature-list">
              <div className="feature-item">
                <div className="feature-icon">
                  <Icon name="calendar_month" />
                </div>
                <div>
                  <strong>الجدول الدراسي الفصلي</strong>
                  <small>متابعة مواعيد المحاضرات وقاعات التدريس المحدثة</small>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <Icon name="verified_user" />
                </div>
                <div>
                  <strong>دخول موحد آمن (SSO)</strong>
                  <small>حماية حساباتك وبياناتك الأكاديمية المشفرة</small>
                </div>
              </div>
            </div>

            <div className="brand-footer">
              <span>العام الأكاديمي 2024 / 2025</span>
              <span className="version">الإصدار 3.4.0</span>
            </div>
          </aside>

          {/* Right / Login Form Column */}
          <section className="form-panel">
            <div className="form-wrapper">
              <div className="form-header">
                <div className="form-logo-wrap">
                  <img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgubzPyZZlMk5eO9sWvznoaOtRYVNUDUo7cKTd2xQS3nkbIMBywsKdjac&s=10"
                    alt="Culture & Science City University"
                  />
                </div>
                <h1>تسجيل الدخول</h1>
                <p>سجّل الدخول باستخدام البريد الإلكتروني الجامعي للوصول إلى حسابك</p>
              </div>

              {/* Error Banner */}
              {showError && (
                <div className="error-banner">
                  <Icon name="error" />
                  <div>
                    <strong>تعذر تسجيل الدخول</strong>
                    <span>البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى التحقق وإعادة المحاولة.</span>
                  </div>
                  <button type="button" className="error-close" onClick={() => setShowError(false)} aria-label="إغلاق">
                    <Icon name="close" />
                  </button>
                </div>
              )}

              <form className="login-form" onSubmit={handleLogin}>
                {/* Email */}
                <div className="field">
                  <label htmlFor="university-email">البريد الإلكتروني الجامعي</label>
                  <div className="input-wrap">
                    <Icon name="mail" className="input-icon" />
                    <input
                      type="email"
                      id="university-email"
                      name="email"
                      required
                      placeholder="student@csc.edu.eg"
                      className="ltr-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="field">
                  <label htmlFor="university-password">كلمة المرور</label>
                  <div className="input-wrap">
                    <Icon name="lock" className="input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="university-password"
                      name="password"
                      required
                      placeholder="أدخل كلمة المرور"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="تبديل إظهار كلمة المرور"
                    >
                      <Icon name={showPassword ? 'visibility_off' : 'visibility'} />
                    </button>
                  </div>
                </div>

                {/* Remember + Forgot */}
                <div className="form-row">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span>تذكرني</span>
                  </label>
                  <a
                    href="#forgot"
                    className="forgot-link"
                    onClick={(e) => {
                      e.preventDefault();
                      showToast('يرجى مراجعة إدارة شؤون الطلاب أو وحدة تكنولوجيا المعلومات لاستعادة كلمة المرور');
                    }}
                  >
                    نسيت كلمة المرور؟
                  </a>
                </div>

                {/* Submit */}
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner" />
                      <span>جاري تسجيل الدخول...</span>
                    </>
                  ) : (
                    <>
                      <span>تسجيل الدخول</span>
                      <Icon name="arrow_back" />
                    </>
                  )}
                </button>

                {/* Demo toggles */}
                <div className="demo-toggles">
                  <button type="button" onClick={simulateError}>
                    معاينة حالة الخطأ
                  </button>
                  <span>•</span>
                  <button type="button" onClick={() => { setShowError(false); handleLogin({ preventDefault: () => {} } as FormEvent); }}>
                    معاينة التحميل
                  </button>
                </div>
              </form>

              <div className="support-note">
                <span>هل تواجه مشكلة في تسجيل الدخول؟</span>
                <a
                  href="#support"
                  onClick={(e) => {
                    e.preventDefault();
                    showToast('فريق الدعم الفني متواجد لمساعدتك عبر: support@csc.edu.eg أو الهاتف الداخلي 1404');
                  }}
                >
                  تواصل مع الدعم الفني
                  <Icon name="open_in_new" />
                </a>
              </div>
            </div>

            <div className="trust-note">
              <Icon name="lock" />
              <span>هذا النظام مخصص لطلاب وأعضاء هيئة التدريس بجامعة مدينة الثقافة والعلوم</span>
            </div>
          </section>
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div className="toast">
          <span>{toast}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="login-footer">
        <div className="footer-inner">
          <div className="footer-links">
            <span>© 2025 مدينة الثقافة والعلوم. جميع الحقوق محفوظة.</span>
            <a href="#">سياسة الخصوصية</a>
            <a href="#">شروط الاستخدام</a>
          </div>
          <div className="footer-status">
            <span className="status-dot" />
            <span>الخوادم تعمل بكفاءة 100%</span>
          </div>
        </div>
      </footer>
    </div>
  );
}