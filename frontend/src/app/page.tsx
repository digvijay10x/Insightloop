import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-bg">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-border">
        <div className="text-xl font-bold text-text tracking-tight">
          Insight<span className="text-accent">Loop</span>
        </div>
        <Link
          href="/dashboard"
          className="px-5 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all"
        >
          Get Started
        </Link>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-24 pb-20">
        <h1 className="text-5xl font-bold text-text max-w-3xl leading-tight">
          Turn User Feedback Into
          <span className="text-accent"> Actionable Intelligence</span>
        </h1>
        <p className="mt-5 text-muted text-lg max-w-xl">
          AI-powered feedback analysis for Product Managers. Extract themes,
          prioritize issues, and benchmark against competitors — in seconds.
        </p>
        <Link
          href="/dashboard"
          className="mt-8 px-8 py-3 bg-accent text-white font-medium rounded-lg hover:shadow-[0_0_24px_rgba(37,99,235,0.4)] transition-all"
        >
          Start Analyzing
        </Link>
      </section>

      {/* How It Works */}
      <section className="px-8 py-20 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-text text-center mb-14">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Paste Reviews",
              desc: "Drop in user reviews from any source — app stores, surveys, support tickets, social media.",
            },
            {
              step: "02",
              title: "AI Analysis",
              desc: "Our AI extracts themes, assigns priority scores, identifies sentiment, and provides reasoning.",
            },
            {
              step: "03",
              title: "Take Action",
              desc: "Get prioritized insights with P1/P2/P3 badges, export reports, and track trends over time.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-card border border-border rounded-xl p-6"
            >
              <div className="text-accent font-bold text-sm mb-3">
                STEP {item.step}
              </div>
              <h3 className="text-text font-semibold text-lg mb-2">
                {item.title}
              </h3>
              <p className="text-muted text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-8 py-20 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-text text-center mb-14">
          Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Theme Extraction",
              desc: "AI identifies recurring themes across hundreds of reviews instantly.",
            },
            {
              title: "Priority Scoring",
              desc: "Each theme gets a P1/P2/P3 priority based on AI-computed urgency scores.",
            },
            {
              title: "Sentiment Analysis",
              desc: "Understand whether feedback is positive, negative, or mixed at a glance.",
            },
            {
              title: "Competitor Benchmarking",
              desc: "Compare your product feedback against competitors side by side.",
            },
            {
              title: "Trend Tracking",
              desc: "Monitor how P1 issues evolve over time with historical charts.",
            },
            {
              title: "Export Reports",
              desc: "Download analysis as CSV or Markdown for stakeholder presentations.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-card border border-border rounded-xl p-6"
            >
              <h3 className="text-text font-semibold mb-2">{item.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-8 py-8 text-center">
        <p className="text-muted text-sm">
          InsightLoop — Built for Product Managers who listen to their users.
        </p>
      </footer>
    </div>
  );
}
