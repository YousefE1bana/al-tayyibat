import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

/** Keep an unexpected render or lazy-loading failure recoverable. */
export class ErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("The guide could not render this view.", error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <section className="container-x py-20" role="alert" dir="rtl">
        <div className="brut mx-auto max-w-xl bg-surface p-6">
          <h1 className="text-2xl font-bold">تعذّر عرض الصفحة</h1>
          <p className="mt-3 text-ink-2">حدث خطأ أثناء تحميل الدليل. يمكنك إعادة المحاولة أو العودة إلى الرئيسية.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" className="border-2 border-line bg-accent px-4 py-2 font-bold text-accent-ink" onClick={() => window.location.reload()}>
              إعادة تحميل الصفحة
            </button>
            <button type="button" className="border-2 border-line bg-bg px-4 py-2 font-bold" onClick={() => { window.location.hash = "/"; window.location.reload(); }}>
              العودة إلى الرئيسية
            </button>
          </div>
        </div>
      </section>
    );
  }
}
