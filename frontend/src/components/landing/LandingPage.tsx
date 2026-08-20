import { ArrowRight, LayoutDashboard, Users, Zap, Shield, ListChecks, Calendar } from 'lucide-react';

interface LandingPageProps {
  onNavigateToAuth: () => void;
}

export function LandingPage({ onNavigateToAuth }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-lg border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/Trackflow_logo.svg" alt="TaskFlow" className="w-8 h-8 rounded-lg" />
            <span className="font-bold text-sm tracking-tight text-zinc-950 dark:text-zinc-50">TaskFlow</span>
          </div>
          <button
            onClick={onNavigateToAuth}
            className="px-4 py-2 text-sm font-semibold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <img src="/Trackflow_logo.svg" alt="TaskFlow" className="w-16 h-16 rounded-2xl shadow-xl" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50 leading-tight">
            Plan projects.<br />Organize teams.<br />Get work done.
          </h1>
          <p className="mt-5 text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
            A simple, powerful workspace for university teams, startups, research groups, and modern organizations.
            No complexity — just clarity.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={onNavigateToAuth}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-colors shadow-lg shadow-cyan-600/20 cursor-pointer"
            >
              Start for free
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onNavigateToAuth}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              Sign in
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-zinc-950 dark:text-zinc-50 mb-12">
            Everything you need to ship faster
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: LayoutDashboard, title: 'Personal Dashboard', desc: 'A unified view of all your tasks across every project — sorted by priority and due date.' },
              { icon: Users, title: 'Team Workspaces', desc: 'Create spaces for projects and invite collaborators. Assign roles and control permissions.' },
              { icon: ListChecks, title: 'Task Management', desc: 'Track tasks with status, priority, assignees, checklists, and due dates. Switch between list and board views.' },
              { icon: Calendar, title: 'Calendar View', desc: 'See all tasks on a calendar timeline. Spot deadlines at a glance and plan your week.' },
              { icon: Shield, title: 'Role-Based Access', desc: 'Owner, Manager, and Member roles with granular workspace settings for who can create, edit, and invite.' },
              { icon: Zap, title: 'Fast & Lightweight', desc: 'Built with React and Supabase. No bloat, no lag — just a clean interface that stays out of your way.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 mb-1">{title}</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50 mb-3">
            Ready to get organized?
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
            Create your free account in seconds. No credit card required.
          </p>
          <button
            onClick={onNavigateToAuth}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-colors shadow-lg shadow-cyan-600/20 cursor-pointer"
          >
            Get started now
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/Trackflow_logo.svg" alt="TaskFlow" className="w-5 h-5 rounded" />
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">TaskFlow</span>
          </div>
          <span className="text-xs text-zinc-400 dark:text-zinc-500">Plan projects. Organize teams. Get work done.</span>
        </div>
      </footer>
    </div>
  );
}
