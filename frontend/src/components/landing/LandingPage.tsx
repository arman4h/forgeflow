import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  Compass,
  ArrowRight,
  CheckCircle2,
  Circle,
  Sparkles,
  Zap,
  Share2,
  Check,
  ChevronDown,
  Sun,
  Moon,
  GraduationCap,
  Rocket,
  FlaskConical,
  Coffee,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";

interface LandingPageProps {
  onNavigateToAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToAuth }) => {
  const { theme, toggleTheme } = useApp();

  // Sandbox demo state
  const [sandboxTab, setSandboxTab] = useState<
    "instant_capture" | "micro_space" | "personal_sync" | "invite_code"
  >("instant_capture");
  const [activeUseCase, setActiveUseCase] = useState<
    "uni" | "startup" | "research" | "hackathon"
  >("uni");
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [sandboxInviteCode, setSandboxInviteCode] = useState("CS450X");
  const [copiedCode, setCopiedCode] = useState(false);

  // Fast task demo state
  const [quickNoteText, setQuickNoteText] = useState("");
  const [personalTasks, setPersonalTasks] = useState([
    {
      id: "p1",
      title: "Submit Literature Review PDF by Friday",
      done: false,
      tag: "🎓 Uni Capstone",
      priority: "high",
    },
    {
      id: "p2",
      title: "Review Figma wireframe with Marcus",
      done: true,
      tag: "🚀 MVP Startup",
      priority: "medium",
    },
    {
      id: "p3",
      title: "Order sensor microcontrollers for lab test",
      done: false,
      tag: "🔬 Robotics",
      priority: "urgent",
    },
  ]);

  // Micro-space collaborative tasks
  const [demoTasks, setDemoTasks] = useState([
    {
      id: "1",
      title: "Draft system architecture diagram",
      status: "done",
      priority: "high",
      assignee: "Alex",
      check: "3/3",
    },
    {
      id: "2",
      title: "Connect API endpoint with mock dataset",
      status: "in_progress",
      priority: "urgent",
      assignee: "Elena",
      check: "2/4",
    },
    {
      id: "3",
      title: "Write 1-page executive summary & slide deck",
      status: "todo",
      priority: "medium",
      assignee: "Marcus",
      check: "0/2",
    },
  ]);

  const addQuickTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNoteText.trim()) return;
    setPersonalTasks((prev) => [
      {
        id: Date.now().toString(),
        title: quickNoteText.trim(),
        done: false,
        tag: "⚡ Quick Task",
        priority: "medium",
      },
      ...prev,
    ]);
    setQuickNoteText("");
  };

  const togglePersonalTask = (id: string) => {
    setPersonalTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  };

  const toggleDemoTask = (id: string) => {
    setDemoTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextStatus =
            t.status === "done"
              ? "todo"
              : t.status === "todo"
                ? "in_progress"
                : "done";
          return { ...t, status: nextStatus };
        }
        return t;
      }),
    );
  };

  const copyDemoCode = () => {
    navigator.clipboard?.writeText(sandboxInviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const useCases = {
    uni: {
      title: "University & Capstone Projects",
      tagline: "Ideal for semester teams, lab partners, and study cohorts.",
      icon: (
        <GraduationCap className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
      ),
      features: [
        "Share your space invite code in WhatsApp / Discord — classmates jump straight in",
        "Zero setup or confusing permissions: everyone opens the link and starts working",
        "Keep project rubric notes, dataset links, and slide decks pinned in one place",
        "Auto-gather your weekly tasks across multiple class projects into one clean agenda",
      ],
      sampleSpace: "🎓 CS450 Senior Capstone",
      sampleCode: "CS450X",
    },
    startup: {
      title: "Early Startups & Co-Founders",
      tagline:
        "Ship product fast without getting bogged down in ticket bureaucracy.",
      icon: <Rocket className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />,
      features: [
        "Zero learning curve: write tasks, assign co-founders, and track progress instantly",
        "Clean Kanban boards to visualize sprints, bugs, and launch deliverables",
        "Private task scratchpad for founder thoughts alongside team-wide spaces",
        "No $30/seat pricing walls or complex workflow automation builders to manage",
      ],
      sampleSpace: "🚀 Nexus MVP Launch",
      sampleCode: "VENT88",
    },
    research: {
      title: "Research Labs & Academia",
      tagline:
        "Organize experiments, papers, and datasets with effortless clarity.",
      icon: (
        <FlaskConical className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
      ),
      features: [
        "Track conference submission deadlines, preprint drafts, and reviewer revisions",
        "Space files hub for research PDFs, benchmark scripts, and analysis links",
        "Clean milestone progress meters to keep advisor check-ins on schedule",
        "Transparent activity log so lab members always know what was just updated",
      ],
      sampleSpace: "🔬 Neural Systems Lab",
      sampleCode: "LAB902",
    },
    hackathon: {
      title: "Hackathons & Side Projects",
      tagline:
        "Perfect for 48-hour sprints where every minute spent configuring is wasted.",
      icon: <Coffee className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />,
      features: [
        "Instant invite code distribution to team members right at the hackathon table",
        "Instant task creation with multi-step subtask checklists and priority tags",
        "High-contrast dark mode optimized for late-night building sessions",
        "Fast ⌘K command palette to jump between tasks without touching the mouse",
      ],
      sampleSpace: "⚡ AI Hackathon Squad",
      sampleCode: "HACK48",
    },
  };

  const faqs = [
    {
      q: "How is TaskFlow different from heavy project management software?",
      a: "Most project management tools are built for 500-person enterprise corporations with dedicated managers. They force you through custom status schemas, webhook configurations, and complex permission hierarchies. TaskFlow is intentionally built for micro-projects: university teams, 2-to-5 person startups, and research labs that want zero learning curve and 100% focus on shipping.",
    },
    {
      q: "Do my teammates need to learn how to use this tool?",
      a: "Not at all. There is no onboarding tutorial required. If you know how to write down a to-do item and check a box, you already know 100% of how TaskFlow works. You just join a space, see what matters today, and get to work.",
    },
    {
      q: "How do Space Invite Codes work?",
      a: 'Every space created in TaskFlow has a short invite code (e.g. CS450X, LAB902). Anyone with the code can simply click "Join with Code", type the code, and immediately collaborate without waiting for email invitations or permission approvals.',
    },
    {
      q: "Can I use TaskFlow for both private personal to-dos and team projects?",
      a: 'Yes! "My Space" provides a personal private task scratchpad for your individual daily to-dos, while automatically pulling in tasks assigned to you across all your collaborative spaces. You never have to switch between different apps for personal vs team work.',
    },
    {
      q: "Is my data saved between sessions?",
      a: "Yes. Everything — spaces, tasks, notes, milestones, and checklists — is synced securely to the cloud, so your work is waiting for you on any device whenever you return.",
    },
  ];

  return (
    <div
      id="landing-page-root"
      className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 transition-colors selection:bg-cyan-100 dark:selection:bg-cyan-950 selection:text-cyan-900 dark:selection:text-cyan-200"
    >
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <img
              src="/Trackflow_logo.svg"
              alt="TaskFlow"
              className="w-9 h-9 rounded-xl shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-zinc-950 dark:text-zinc-50">
                  TaskFlow
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-cyan-50 dark:bg-cyan-950/70 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                  Project Workspace
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 hidden sm:block">
                No setup lag • Pure focus for uni teams & small startups
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            <a
              href="#how-it-works"
              className="hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
            >
              How It Works
            </a>
            <a
              href="#interactive-demo"
              className="hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
            >
              Interactive Demo
            </a>
            <a
              href="#features"
              className="hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
            >
              Essential Features
            </a>
            <a
              href="#use-cases"
              className="hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
            >
              Use Cases
            </a>
            <a
              href="#faq"
              className="hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
            >
              FAQ
            </a>
          </nav>

          {/* Header Action Controls */}
          <div className="flex items-center gap-2.5">
            <button
              id="landing-theme-toggle"
              onClick={toggleTheme}
              title={
                theme === "dark"
                  ? "Switch to Light Mode"
                  : "Switch to Dark Mode"
              }
              className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-cyan-700 dark:hover:text-cyan-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-all cursor-pointer"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            <Button
              id="landing-header-join-btn"
              onClick={onNavigateToAuth}
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Join with Code</span>
            </Button>

            <Button
              id="landing-header-enter-btn"
              onClick={onNavigateToAuth}
              variant="default"
              size="sm"
              className="font-semibold shadow-xs cursor-pointer"
            >
              <span>Enter Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-zinc-200 dark:border-zinc-800">
        {/* Subtle Background Glow Accent */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[260px] bg-cyan-500/10 dark:bg-cyan-500/15 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/80 text-cyan-800 dark:text-cyan-300 text-xs font-semibold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>Zero Setup Required • Built for Micro-Projects</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
          </div>

          {/* Main Title */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-zinc-950 dark:text-zinc-50 tracking-tight leading-[1.15]">
            Task management with{" "} <br />
            <span className="text-cyan-700 dark:text-cyan-400">
              zero clutter
            </span>
            .<br />
            Just jump in and start working.
          </h1>

          {/* Subtitle explaining effortless, non-messy flow */}
          <p className="max-w-xl mx-auto text-sm sm:text-base md:text-md text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
            No steep learning curves, mandatory configuration fields, or
            enterprise clutter. TaskFlow gives university project teams,
            student cohorts, and early-stage startups the exact essentials they
            need to collaborate — without the headache.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              id="hero-launch-btn"
              onClick={onNavigateToAuth}
              size="lg"
              variant="default"
              className="text-sm font-bold shadow-md px-6 cursor-pointer"
            >
              <span>Start for Free</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>

            <Button
              id="hero-join-code-btn"
              onClick={onNavigateToAuth}
              size="lg"
              variant="secondary"
              className="text-sm font-semibold cursor-pointer"
            >
              <Compass className="w-4 h-4 mr-1" />
              <span>Join with Invite Code</span>
            </Button>
          </div>

          {/* Core Highlights */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>No tutorial needed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Instant join codes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Personal + team task sync</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Clean & lightweight</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works: 3 Steps to Get Going */}
      <section
        id="how-it-works"
        className="py-16 md:py-20 bg-zinc-50/70 dark:bg-zinc-950/70 border-b border-zinc-200 dark:border-zinc-800"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge
              variant="outline"
              className="text-[11px] font-bold uppercase tracking-wider text-cyan-800 dark:text-cyan-300"
            >
              Effortless Simplicity
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">
              Start Working in Under 10 Seconds
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              Forget 45-minute onboarding sessions. Everything is designed to be
              instantly intuitive.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
                Create a Space or Join with Code
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Name your project or paste an invite code from a classmate. No
                permission matrices or complicated folder structures.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
                Jot Down Tasks & Milestones
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Add to-dos just by typing. Assign teammates, attach checklist
                subtasks, and track deliverables without mandatory form fields.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
                Unified Personal Priority Queue
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Your personal "My Space" automatically pulls all your assigned
                tasks across every group project into one clean daily list.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Sandbox Section */}
      <section
        id="interactive-demo"
        className="py-16 md:py-24 border-b border-zinc-200 dark:border-zinc-800"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">
              Try the Interactive Preview
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              See how fluid and uncluttered task management feels when every
              unnecessary button has been removed.
            </p>
          </div>

          {/* Sandbox Container Window */}
          <div className="bg-white dark:bg-black rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden">
            {/* Window Top Bar */}
            <div className="px-4 py-3 bg-zinc-100/90 dark:bg-zinc-900/90 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 mr-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <span>🎓 Capstone Space Demo</span>
                  <span className="text-[10px] font-mono font-normal text-cyan-800 dark:text-cyan-300 bg-cyan-100 dark:bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-200 dark:border-cyan-800">
                    CODE: CS450X
                  </span>
                </span>
              </div>

              {/* Sandbox Tab Switcher */}
              <div className="flex items-center gap-1 bg-zinc-200/70 dark:bg-zinc-800/70 p-1 rounded-lg">
                <button
                  id="sandbox-tab-capture"
                  onClick={() => setSandboxTab("instant_capture")}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    sandboxTab === "instant_capture"
                      ? "bg-white dark:bg-black text-cyan-800 dark:text-cyan-300 shadow-xs"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`}
                >
                  Quick Task Capture
                </button>
                <button
                  id="sandbox-tab-micro"
                  onClick={() => setSandboxTab("micro_space")}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    sandboxTab === "micro_space"
                      ? "bg-white dark:bg-black text-cyan-800 dark:text-cyan-300 shadow-xs"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`}
                >
                  Clean Board View
                </button>
                <button
                  id="sandbox-tab-sync"
                  onClick={() => setSandboxTab("personal_sync")}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    sandboxTab === "personal_sync"
                      ? "bg-white dark:bg-black text-cyan-800 dark:text-cyan-300 shadow-xs"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`}
                >
                  Personal + Team Sync
                </button>
                <button
                  id="sandbox-tab-invite"
                  onClick={() => setSandboxTab("invite_code")}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    sandboxTab === "invite_code"
                      ? "bg-white dark:bg-black text-cyan-800 dark:text-cyan-300 shadow-xs"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`}
                >
                  Invite Code
                </button>
              </div>
            </div>

            {/* Sandbox Tab Content */}
            <div className="p-6">
              {/* Tab 1: Quick Task Capture */}
              {sandboxTab === "instant_capture" && (
                <div className="space-y-5 max-w-2xl mx-auto">
                  <div className="text-center space-y-1">
                    <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
                      ⚡ Type your task and hit Enter. No bloated dropdowns.
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Test adding a task or checking one off below:
                    </p>
                  </div>

                  {/* Quick input bar */}
                  <form onSubmit={addQuickTask} className="relative">
                    <input
                      id="sandbox-quick-input"
                      type="text"
                      value={quickNoteText}
                      onChange={(e) => setQuickNoteText(e.target.value)}
                      placeholder="Add a new task or note... (press Enter)"
                      className="w-full px-4 py-3 pr-24 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-cyan-500 shadow-2xs"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 text-white font-bold text-xs hover:bg-cyan-500 transition-colors cursor-pointer"
                    >
                      Add Task
                    </button>
                  </form>

                  {/* List of fast tasks */}
                  <div className="space-y-2">
                    {personalTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => togglePersonalTask(task.id)}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                          task.done
                            ? "bg-zinc-50/50 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800/60 opacity-60"
                            : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-cyan-300 shadow-2xs"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {task.done ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                          )}
                          <span
                            className={`text-xs font-medium ${
                              task.done
                                ? "line-through text-zinc-400 dark:text-zinc-500"
                                : "text-zinc-900 dark:text-zinc-100"
                            }`}
                          >
                            {task.title}
                          </span>
                        </div>
                        <span className="text-[10px] font-medium text-cyan-800 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950 px-2 py-0.5 rounded border border-cyan-200 dark:border-cyan-900 flex-shrink-0">
                          {task.tag}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 2: Micro-Space Board */}
              {sandboxTab === "micro_space" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-900">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      💡 Click any task card to move it through columns:{" "}
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        To Do → In Progress → Done
                      </span>
                    </div>
                    <div className="text-xs font-mono font-semibold text-cyan-700 dark:text-cyan-400">
                      {demoTasks.filter((t) => t.status === "done").length}/
                      {demoTasks.length} Completed
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Column: To Do */}
                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                        <span>To Do</span>
                        <span className="px-1.5 py-0.2 rounded-full bg-zinc-200 dark:bg-zinc-800 text-[10px] text-zinc-600 dark:text-zinc-400 font-mono">
                          {demoTasks.filter((t) => t.status === "todo").length}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {demoTasks
                          .filter((t) => t.status === "todo")
                          .map((task) => (
                            <div
                              key={task.id}
                              onClick={() => toggleDemoTask(task.id)}
                              className="p-3 rounded-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 hover:border-cyan-400 dark:hover:border-cyan-600 shadow-2xs cursor-pointer transition-all space-y-2"
                            >
                              <div className="flex items-start gap-2">
                                <Circle className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
                                <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                                  {task.title}
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400 pt-1">
                                <span className="font-medium text-cyan-800 dark:text-cyan-300">
                                  ✓ {task.check}
                                </span>
                                <Badge
                                  variant={
                                    task.priority === "urgent"
                                      ? "destructive"
                                      : task.priority === "high"
                                        ? "warning"
                                        : "primary"
                                  }
                                >
                                  {task.priority}
                                </Badge>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Column: In Progress */}
                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold text-cyan-800 dark:text-cyan-300 uppercase tracking-wider">
                        <span>In Progress</span>
                        <span className="px-1.5 py-0.2 rounded-full bg-cyan-100 dark:bg-cyan-950 text-[10px] text-cyan-800 dark:text-cyan-300 font-mono">
                          {
                            demoTasks.filter((t) => t.status === "in_progress")
                              .length
                          }
                        </span>
                      </div>
                      <div className="space-y-2">
                        {demoTasks
                          .filter((t) => t.status === "in_progress")
                          .map((task) => (
                            <div
                              key={task.id}
                              onClick={() => toggleDemoTask(task.id)}
                              className="p-3 rounded-lg bg-white dark:bg-black border border-cyan-300 dark:border-cyan-800/80 hover:border-cyan-500 shadow-2xs cursor-pointer transition-all space-y-2"
                            >
                              <div className="flex items-start gap-2">
                                <div className="w-4 h-4 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin mt-0.5 flex-shrink-0" />
                                <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                                  {task.title}
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400 pt-1">
                                <span className="font-medium text-cyan-800 dark:text-cyan-300">
                                  ✓ {task.check}
                                </span>
                                <Badge variant="primary">In Progress</Badge>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Column: Done */}
                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                        <span>Done</span>
                        <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[10px] text-emerald-700 dark:text-emerald-300 font-mono">
                          {demoTasks.filter((t) => t.status === "done").length}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {demoTasks
                          .filter((t) => t.status === "done")
                          .map((task) => (
                            <div
                              key={task.id}
                              onClick={() => toggleDemoTask(task.id)}
                              className="p-3 rounded-lg bg-white dark:bg-black border border-emerald-200 dark:border-emerald-900/60 shadow-2xs cursor-pointer transition-all space-y-2 opacity-90"
                            >
                              <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                <div className="text-xs font-semibold line-through text-zinc-400 dark:text-zinc-500 leading-snug">
                                  {task.title}
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1">
                                <span>Completed</span>
                                <Badge variant="success">Done</Badge>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Personal + Team Sync */}
              {sandboxTab === "personal_sync" && (
                <div className="space-y-4 max-w-2xl mx-auto">
                  <div className="p-4 rounded-xl bg-cyan-50/70 dark:bg-cyan-950/40 border border-cyan-200/70 dark:border-cyan-800/60 flex items-start gap-3">
                    <Zap className="w-5 h-5 text-cyan-600 dark:text-cyan-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-cyan-950 dark:text-cyan-100">
                        All Your Tasks in One Simple Agenda
                      </h4>
                      <p className="text-[11px] text-cyan-800 dark:text-cyan-300 mt-0.5">
                        Whether you are collaborating across 3 course projects
                        or working on your startup, "My Space" automatically
                        pulls everything assigned to you into one place.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      Today's Combined Agenda
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center gap-3">
                          <Circle className="w-4 h-4 text-zinc-400" />
                          <div>
                            <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                              Submit Midterm Code Review PR
                            </div>
                            <div className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                              <span className="font-semibold text-cyan-800 dark:text-cyan-300">
                                🎓 CS450 Capstone
                              </span>
                              <span>• Due in 2 days</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="warning">High</Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center gap-3">
                          <Circle className="w-4 h-4 text-zinc-400" />
                          <div>
                            <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                              Deploy Landing Page MVP to Production
                            </div>
                            <div className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                              <span className="font-semibold text-cyan-800 dark:text-cyan-300">
                                🚀 Nexus Startup
                              </span>
                              <span>• Due tomorrow</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="destructive">Urgent</Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center gap-3">
                          <Circle className="w-4 h-4 text-zinc-400" />
                          <div>
                            <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                              Personal: Review lecture notes on algorithms
                            </div>
                            <div className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                              <span className="font-semibold text-zinc-600 dark:text-zinc-400">
                                📝 Private Scratchpad
                              </span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary">Medium</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Invite Code */}
              {sandboxTab === "invite_code" && (
                <div className="max-w-md mx-auto p-6 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 flex items-center justify-center mx-auto text-xl">
                    ⚡
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
                      No Email Invites or Permission Roadblocks
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      Every space gets its own code. Share this one with
                      classmates or teammates:
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    <span className="font-mono text-2xl font-black text-cyan-800 dark:text-cyan-300 bg-white dark:bg-black px-4 py-2 rounded-lg border-2 border-cyan-400 dark:border-cyan-600 tracking-widest shadow-2xs">
                      {sandboxInviteCode}
                    </span>
                    <Button onClick={copyDemoCode} variant="outline" size="sm">
                      {copiedCode ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Share2 className="w-4 h-4" />
                      )}
                      <span>{copiedCode ? "Copied!" : "Copy"}</span>
                    </Button>
                  </div>

                  <div className="text-[11px] text-zinc-500">
                    Create a space in the live app and share its code — anyone
                    with it can join instantly, no approvals needed.
                  </div>
                </div>
              )}
            </div>

            {/* Sandbox Footer Action */}
            <div className="px-6 py-3.5 bg-zinc-100/90 dark:bg-zinc-900/90 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                You are testing the live sandbox simulator.
              </span>
              <Button
                id="sandbox-open-workspace-btn"
                onClick={onNavigateToAuth}
                variant="default"
                size="sm"
                className="font-bold cursor-pointer"
              >
                <span>Open Full Workspace</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Deep Dive Grid */}
      <section
        id="features"
        className="py-16 md:py-24 border-b border-zinc-200 dark:border-zinc-800"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">
              Only the Features You Actually Need
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              Clean, practical tools crafted for fast team execution without
              bloated software overhead.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Invite Codes */}
            <div className="p-6 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 hover:border-cyan-400 dark:hover:border-cyan-600 shadow-2xs transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 flex items-center justify-center font-bold text-sm">
                #
              </div>
              <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">
                Space Invite Codes
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Drop your code (
                <code className="font-mono font-bold text-cyan-800 dark:text-cyan-300">
                  LAB902
                </code>
                ) in a team chat. Teammates join in 2 seconds without waiting
                for admin approval.
              </p>
            </div>

            {/* Card 2: My Space Hub */}
            <div className="p-6 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 hover:border-cyan-400 dark:hover:border-cyan-600 shadow-2xs transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 flex items-center justify-center font-bold text-sm">
                ⚡
              </div>
              <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">
                "My Space" Personal Rollup
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                See all tasks assigned to you across every space, plus a private
                scratchpad for your individual notes and to-dos.
              </p>
            </div>

            {/* Card 3: Dual View Tasks */}
            <div className="p-6 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 hover:border-cyan-400 dark:hover:border-cyan-600 shadow-2xs transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 flex items-center justify-center font-bold text-sm">
                📊
              </div>
              <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">
                Clean Kanban & List Views
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Switch between a simple checklist and a visual 3-column board.
                Priority tags, checklists, and assignees without the visual
                mess.
              </p>
            </div>

            {/* Card 4: Milestones */}
            <div className="p-6 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 hover:border-cyan-400 dark:hover:border-cyan-600 shadow-2xs transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 flex items-center justify-center font-bold text-sm">
                🚩
              </div>
              <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">
                Key Milestone Deliverables
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Set major semester deadlines (Midterm Review, MVP Demo) and
                watch completion percentage meters update automatically.
              </p>
            </div>

            {/* Card 5: Notes & Docs */}
            <div className="p-6 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 hover:border-cyan-400 dark:hover:border-cyan-600 shadow-2xs transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 flex items-center justify-center font-bold text-sm">
                📝
              </div>
              <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">
                Space Notes & File Links
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Keep project rubrics, Figma links, slide decks, and research
                PDFs pinned directly inside each space so context is never lost.
              </p>
            </div>

            {/* Card 6: ⌘K Command Palette */}
            <div className="p-6 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 hover:border-cyan-400 dark:hover:border-cyan-600 shadow-2xs transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 flex items-center justify-center font-bold text-sm">
                ⌘K
              </div>
              <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">
                Instant Keyboard Search
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Press{" "}
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded">
                  ⌘K
                </kbd>{" "}
                anywhere to search all spaces, jump to tasks, or toggle views
                without taking your hands off the keyboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section
        id="use-cases"
        className="py-16 md:py-24 bg-zinc-50/70 dark:bg-zinc-950/70 border-b border-zinc-200 dark:border-zinc-800"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">
              Designed for Real-World Micro Projects
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              Select your use case to see how TaskFlow speeds up execution:
            </p>
          </div>

          {/* Use Case Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {Object.entries(useCases).map(([key, item]) => (
              <button
                key={key}
                id={`use-case-${key}-btn`}
                onClick={() => setActiveUseCase(key as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeUseCase === key
                    ? "bg-cyan-600 dark:bg-cyan-500 text-white dark:text-zinc-950 shadow-xs"
                    : "bg-white dark:bg-black text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 border border-zinc-200 dark:border-zinc-800"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.title.split(" ")[0]}</span>
              </button>
            ))}
          </div>

          {/* Active Use Case Card */}
          <div className="p-8 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-900">
              <div>
                <div className="flex items-center gap-2 text-base font-bold text-zinc-950 dark:text-zinc-50">
                  <span>{useCases[activeUseCase].icon}</span>
                  <span>{useCases[activeUseCase].title}</span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {useCases[activeUseCase].tagline}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-zinc-500 font-medium">
                  Sample Space Code:
                </span>
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-cyan-50 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                  {useCases[activeUseCase].sampleCode}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {useCases[activeUseCase].features.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800"
                >
                  <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-800 dark:text-zinc-200 font-medium leading-relaxed">
                    {feat}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                onClick={onNavigateToAuth}
                variant="default"
                size="sm"
                className="font-bold cursor-pointer"
              >
                <span>Try TaskFlow Now</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section
        id="faq"
        className="py-16 md:py-24 bg-zinc-50/70 dark:bg-zinc-950/70 border-b border-zinc-200 dark:border-zinc-800"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              Clear answers on how TaskFlow simplifies micro project
              management.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-2xs transition-all"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-4 text-left font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 hover:text-cyan-800 dark:hover:text-cyan-300 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-zinc-400 transition-transform ${isOpen ? "rotate-180 text-cyan-500" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-900 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final Call to Action Section */}
      <section className="py-16 md:py-24 text-center bg-cyan-50/50 dark:bg-cyan-950/20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black text-zinc-950 dark:text-zinc-50 tracking-tight">
            Ready to start without the clutter?
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Create or join a space for your semester project or startup in
            seconds. No tutorials, no complex configurations.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              id="cta-launch-workspace-btn"
              onClick={onNavigateToAuth}
              size="lg"
              variant="default"
              className="text-sm font-bold shadow-md px-8 cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            <Button
              id="cta-join-code-btn"
              onClick={onNavigateToAuth}
              size="lg"
              variant="outline"
              className="text-sm font-semibold cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Join with Invite Code</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white dark:bg-black border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img
              src="/Trackflow_logo.svg"
              alt="TaskFlow"
              className="w-6 h-6 rounded-lg"
            />
            <span className="font-bold text-zinc-900 dark:text-zinc-100">
              TaskFlow
            </span>
            <span className="text-zinc-400">• Plan projects. Organize teams. Get work done.</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <a
              href="#how-it-works"
              className="hover:text-cyan-800 dark:hover:text-cyan-300 transition-colors cursor-pointer"
            >
              How It Works
            </a>
            <a
              href="#features"
              className="hover:text-cyan-800 dark:hover:text-cyan-300 transition-colors cursor-pointer"
            >
              Features
            </a>
            <a
              href="#faq"
              className="hover:text-cyan-800 dark:hover:text-cyan-300 transition-colors cursor-pointer"
            >
              FAQ
            </a>
            <button
              onClick={onNavigateToAuth}
              className="hover:text-cyan-800 dark:hover:text-cyan-300 transition-colors cursor-pointer"
            >
              Enter Workspace
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
