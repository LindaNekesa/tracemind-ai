"use client";
import { useEffect } from "react";
import { useState } from "react";
import Link from "next/link";

const MODULES = [
  {
    id: "intro",
    title: "Introduction to Digital Forensics",
    icon: "🔍",
    level: "Beginner",
    duration: "30 min",
    color: "from-blue-500/20 to-blue-600/10 border-blue-500/30",
    lessons: [
      {
        id: "what-is-df",
        title: "What is Digital Forensics?",
        content: `Digital forensics is the process of uncovering and interpreting electronic data for use in a court of law. The goal is to preserve any evidence in its most original form while performing a structured investigation by collecting, identifying, and validating the digital information.

**Key Principles:**
- Preservation — never alter original evidence
- Identification — locate and document evidence
- Extraction — recover data from devices
- Documentation — maintain chain of custody
- Presentation — present findings clearly

**Types of Digital Forensics:**
1. Computer Forensics — analysis of computers and storage media
2. Network Forensics — monitoring and analysis of network traffic
3. Mobile Forensics — recovery of data from mobile devices
4. Cloud Forensics — investigation of cloud-based systems
5. Database Forensics — examination of databases and metadata`,
        quiz: [
          { q: "What is the primary goal of digital forensics?", options: ["Hack systems", "Preserve and interpret electronic data for court", "Delete evidence", "Monitor networks"], answer: 1 },
          { q: "Which principle means never altering original evidence?", options: ["Extraction", "Documentation", "Preservation", "Presentation"], answer: 2 },
        ],
      },
      {
        id: "chain-of-custody",
        title: "Chain of Custody",
        content: `The chain of custody is a chronological documentation showing the seizure, custody, control, transfer, analysis, and disposition of physical or electronic evidence.

**Why it matters:**
- Ensures evidence integrity in court
- Proves evidence hasn't been tampered with
- Establishes who handled evidence and when

**Chain of Custody Steps:**
1. **Collection** — document where, when, and how evidence was found
2. **Labeling** — assign unique identifiers to each piece
3. **Sealing** — package evidence to prevent contamination
4. **Transfer** — log every person who handles the evidence
5. **Storage** — secure storage with access controls
6. **Analysis** — document all examination activities
7. **Presentation** — present in court with full documentation

**Best Practices:**
- Use write blockers when imaging drives
- Create cryptographic hashes (MD5, SHA-256) to verify integrity
- Never work on original evidence — always use copies`,
        quiz: [
          { q: "What does chain of custody document?", options: ["Network traffic", "Seizure, custody, control and transfer of evidence", "User passwords", "System logs"], answer: 1 },
          { q: "Why do we create cryptographic hashes of evidence?", options: ["To encrypt it", "To delete it", "To verify integrity hasn't changed", "To compress it"], answer: 2 },
        ],
      },
    ],
  },
  {
    id: "log-analysis",
    title: "Log Analysis & Threat Detection",
    icon: "📋",
    level: "Intermediate",
    duration: "45 min",
    color: "from-violet-500/20 to-violet-600/10 border-violet-500/30",
    lessons: [
      {
        id: "reading-logs",
        title: "Reading System Logs",
        content: `System logs are records of events that occur within a computer system. They are critical for forensic investigations.

**Common Log Types:**
- **Authentication logs** — login attempts, successes, failures
- **System logs** — OS events, crashes, service starts/stops
- **Application logs** — software-specific events
- **Network logs** — firewall, proxy, DNS queries
- **Security logs** — IDS/IPS alerts, antivirus events

**Log Format Example (Apache):**
\`\`\`
192.168.1.1 - admin [15/Jan/2024:10:30:00] "POST /login" 401 512
\`\`\`
Fields: IP, user, timestamp, request, status code, bytes

**Key Indicators of Compromise (IOCs):**
- Multiple failed login attempts (brute force)
- Login at unusual hours
- Access from unknown IP addresses
- Large data transfers
- Privilege escalation events`,
        quiz: [
          { q: "What do authentication logs record?", options: ["File changes", "Login attempts, successes and failures", "Network bandwidth", "CPU usage"], answer: 1 },
          { q: "Multiple failed login attempts indicate what type of attack?", options: ["SQL Injection", "Phishing", "Brute Force", "DDoS"], answer: 2 },
        ],
      },
      {
        id: "attack-patterns",
        title: "Common Attack Patterns",
        content: `Understanding attack patterns helps investigators identify what happened during an incident.

**MITRE ATT&CK Framework:**
The MITRE ATT&CK framework is a globally-accessible knowledge base of adversary tactics and techniques.

**Key Tactics:**
1. **Initial Access (TA0001)** — phishing, exploiting public-facing apps
2. **Execution (TA0002)** — running malicious code
3. **Persistence (TA0003)** — maintaining access after reboot
4. **Privilege Escalation (TA0004)** — gaining higher permissions
5. **Defense Evasion (TA0005)** — avoiding detection
6. **Credential Access (TA0006)** — stealing passwords
7. **Lateral Movement (TA0008)** — moving through the network
8. **Exfiltration (TA0010)** — stealing data

**Brute Force Attack Signs:**
- Hundreds of failed logins in short time
- Same IP trying many usernames
- Sequential password attempts

**Phishing Indicators:**
- Suspicious email domains
- Unexpected attachments
- Links to lookalike domains`,
        quiz: [
          { q: "What is the MITRE ATT&CK framework?", options: ["An antivirus tool", "A knowledge base of adversary tactics and techniques", "A firewall product", "A log format"], answer: 1 },
          { q: "Lateral Movement means?", options: ["Moving data offsite", "Moving through the network after initial access", "Moving log files", "Deleting evidence"], answer: 1 },
        ],
      },
    ],
  },
  {
    id: "evidence-handling",
    title: "Evidence Collection & Handling",
    icon: "🗂️",
    level: "Intermediate",
    duration: "40 min",
    color: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30",
    lessons: [
      {
        id: "digital-evidence",
        title: "Types of Digital Evidence",
        content: `Digital evidence is any information stored or transmitted in digital form that may be used in court.

**Categories of Digital Evidence:**

**Volatile Evidence (lost when power off):**
- RAM contents
- Running processes
- Network connections
- Logged-in users
- Clipboard data

**Non-Volatile Evidence (persists):**
- Hard drive contents
- Files and documents
- Emails
- Browser history
- System logs
- Registry entries

**Collection Order (Order of Volatility):**
1. CPU registers and cache
2. RAM
3. Network state
4. Running processes
5. Disk storage
6. Remote logging
7. Physical configuration

**File System Artifacts:**
- Deleted files (recoverable from unallocated space)
- File metadata (created, modified, accessed times)
- Thumbnail caches
- Recycle bin contents`,
        quiz: [
          { q: "Which type of evidence is lost when power is turned off?", options: ["Hard drive data", "Volatile evidence (RAM)", "Log files", "Registry entries"], answer: 1 },
          { q: "What should be collected first according to order of volatility?", options: ["Hard drive", "Log files", "CPU registers and cache", "Emails"], answer: 2 },
        ],
      },
    ],
  },
  {
    id: "ai-forensics",
    title: "AI in Digital Forensics",
    icon: "🤖",
    level: "Advanced",
    duration: "50 min",
    color: "from-amber-500/20 to-amber-600/10 border-amber-500/30",
    lessons: [
      {
        id: "ai-tools",
        title: "AI-Powered Investigation Tools",
        content: `Artificial Intelligence is transforming digital forensics by automating analysis and detecting patterns humans might miss.

**How TraceMind AI Works:**

**1. Log Analysis Engine**
- Parses structured and unstructured log data
- Detects failed login patterns (brute force)
- Identifies suspicious IP addresses
- Calculates risk scores (0-100)

**2. Credibility Assessment**
- Scores cases for court-readiness
- Checks log consistency and completeness
- Validates metadata coherence
- Flags potential fabrication

**3. Investigation Assistant**
- Answers questions about case data
- Maps findings to MITRE ATT&CK
- Recommends next investigation steps
- Identifies suspects and threat actors

**Risk Scoring:**
- 0-39: LOW risk
- 40-69: MEDIUM risk  
- 70-100: HIGH risk

**Accuracy Metrics:**
- Precision: how many flagged items are truly suspicious
- Recall: how many suspicious items were caught
- F1 Score: balance between precision and recall`,
        quiz: [
          { q: "What does a risk score of 75 indicate?", options: ["LOW risk", "MEDIUM risk", "HIGH risk", "No risk"], answer: 2 },
          { q: "What does 'Recall' measure in AI accuracy?", options: ["How fast the AI runs", "How many suspicious items were caught", "How many false positives exist", "Memory usage"], answer: 1 },
        ],
      },
    ],
  },
];

const levelColor: Record<string, string> = {
  Beginner:     "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
  Intermediate: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  Advanced:     "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
};

export default function LearnPage() {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers]   = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>({});
  const [completed, setCompleted]       = useState<Set<string>>(new Set());

  const module  = MODULES.find((m) => m.id === activeModule);
  const lesson  = module?.lessons.find((l) => l.id === activeLesson);

  const totalLessons    = MODULES.reduce((s, m) => s + m.lessons.length, 0);
  const completedCount  = completed.size;
  const progress        = Math.round((completedCount / totalLessons) * 100);

  // Load progress from DB on mount
  useEffect(() => {
    fetch("/api/learn/progress")
      .then((r) => r.json())
      .then((d) => {
        if (d.learningProgress?.completed) {
          setCompleted(new Set(d.learningProgress.completed as string[]));
        }
      })
      .catch(() => {});
  }, []);

  const markComplete = (lessonId: string) => {
    setCompleted((prev) => {
      const next = new Set([...prev, lessonId]);
      // Persist to DB
      fetch("/api/learn/progress", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ learningProgress: { completed: [...next] } }),
      }).catch(() => {});
      return next;
    });
  };

  const submitQuiz = (lessonId: string) => {
    setQuizSubmitted((p) => ({ ...p, [lessonId]: true }));
    markComplete(lessonId);
  };

  const getScore = (lessonId: string) => {
    const l = MODULES.flatMap((m) => m.lessons).find((l) => l.id === lessonId);
    if (!l) return 0;
    return l.quiz.filter((q, i) => quizAnswers[`${lessonId}-${i}`] === q.answer).length;
  };

  // Lesson view
  if (lesson && module) {
    const quizKey = (i: number) => `${lesson.id}-${i}`;
    const submitted = quizSubmitted[lesson.id];
    const score = getScore(lesson.id);

    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveLesson(null)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <p className="text-xs text-gray-400">{module.title}</p>
            <h1 className="text-xl font-black text-gray-900 dark:text-white">{lesson.title}</h1>
          </div>
          {completed.has(lesson.id) && <span className="ml-auto text-emerald-500 text-sm font-semibold">✓ Completed</span>}
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-white/3 border border-gray-100 dark:border-white/5 rounded-2xl p-6">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {lesson.content.split("\n").map((line, i) => {
              if (line.startsWith("**") && line.endsWith("**")) {
                return <p key={i} className="font-bold text-gray-800 dark:text-white mt-4 mb-1">{line.replace(/\*\*/g, "")}</p>;
              }
              if (line.startsWith("```")) return null;
              if (line.match(/^\d+\./)) {
                return <p key={i} className="text-gray-600 dark:text-gray-300 ml-4 text-sm">{line}</p>;
              }
              if (line.startsWith("- ")) {
                return <p key={i} className="text-gray-600 dark:text-gray-300 ml-4 text-sm flex gap-2"><span className="text-blue-500 shrink-0">•</span>{line.slice(2)}</p>;
              }
              if (!line.trim()) return <div key={i} className="h-2" />;
              return <p key={i} className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{line}</p>;
            })}
          </div>
        </div>

        {/* Quiz */}
        <div className="bg-white dark:bg-white/3 border border-gray-100 dark:border-white/5 rounded-2xl p-6">
          <h2 className="font-bold text-gray-800 dark:text-white mb-5 flex items-center gap-2">
            <span>🧠</span> Knowledge Check
          </h2>
          <div className="space-y-6">
            {lesson.quiz.map((q, qi) => (
              <div key={qi}>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{qi + 1}. {q.q}</p>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => {
                    const selected = quizAnswers[quizKey(qi)] === oi;
                    const correct  = submitted && oi === q.answer;
                    const wrong    = submitted && selected && oi !== q.answer;
                    return (
                      <button key={oi} disabled={submitted}
                        onClick={() => setQuizAnswers((p) => ({ ...p, [quizKey(qi)]: oi }))}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm border transition ${
                          correct ? "bg-emerald-50 border-emerald-400 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" :
                          wrong   ? "bg-red-50 border-red-400 text-red-700 dark:bg-red-500/20 dark:text-red-400" :
                          selected ? "bg-blue-50 border-blue-400 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400" :
                          "border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
                        }`}>
                        {opt}
                        {correct && " ✓"}
                        {wrong   && " ✗"}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {!submitted ? (
            <button onClick={() => submitQuiz(lesson.id)}
              disabled={lesson.quiz.some((_, i) => quizAnswers[quizKey(i)] === undefined)}
              className="mt-5 w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-500 transition disabled:opacity-50">
              Submit Answers
            </button>
          ) : (
            <div className={`mt-5 p-4 rounded-xl text-center ${score === lesson.quiz.length ? "bg-emerald-50 dark:bg-emerald-500/10" : "bg-amber-50 dark:bg-amber-500/10"}`}>
              <p className="text-2xl font-black mb-1">{score}/{lesson.quiz.length}</p>
              <p className="text-sm font-medium">{score === lesson.quiz.length ? "🎉 Perfect score!" : "📚 Review the lesson and try again"}</p>
              <button onClick={() => setActiveLesson(null)}
                className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                ← Back to module
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Module view
  if (module) {
    return (
      <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveModule(null)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h1 className="text-xl font-black text-gray-900 dark:text-white">{module.icon} {module.title}</h1>
            <p className="text-xs text-gray-400">{module.lessons.length} lessons · {module.duration}</p>
          </div>
        </div>
        <div className="space-y-3">
          {module.lessons.map((l, i) => (
            <button key={l.id} onClick={() => setActiveLesson(l.id)}
              className="w-full bg-white dark:bg-white/3 border border-gray-100 dark:border-white/5 rounded-2xl p-5 text-left hover:shadow-md transition hover:-translate-y-0.5 group">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 ${completed.has(l.id) ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600" : "bg-gray-100 dark:bg-white/5 text-gray-500"}`}>
                  {completed.has(l.id) ? "✓" : i + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">{l.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{l.quiz.length} quiz questions</p>
                </div>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Main learning center
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">🎓 Learning Center</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Digital forensics training for investigators and analysts</p>
        </div>
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">← Dashboard</Link>
      </div>

      {/* Progress */}
      <div className="bg-linear-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold">Your Progress</p>
          <p className="text-blue-200 text-sm">{completedCount}/{totalLessons} lessons</p>
        </div>
        <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
          <div className="h-2.5 bg-white rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-blue-200 text-xs mt-2">{progress}% complete</p>
      </div>

      {/* Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {MODULES.map((m) => {
          const done = m.lessons.filter((l) => completed.has(l.id)).length;
          return (
            <button key={m.id} onClick={() => setActiveModule(m.id)}
              className={`bg-linear-to-br ${m.color} border rounded-2xl p-5 text-left hover:-translate-y-1 transition-all duration-300 group`}>
              <div className="text-3xl mb-3">{m.icon}</div>
              <h3 className="font-bold text-gray-800 dark:text-white text-base mb-1">{m.title}</h3>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${levelColor[m.level]}`}>{m.level}</span>
                <span className="text-xs text-gray-400">⏱ {m.duration}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{done}/{m.lessons.length} lessons done</span>
                <div className="w-16 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-1.5 bg-blue-500 rounded-full" style={{ width: `${(done / m.lessons.length) * 100}%` }} />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick reference */}
      <div className="bg-white dark:bg-white/3 border border-gray-100 dark:border-white/5 rounded-2xl p-5">
        <h2 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">📌 Quick Reference</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          {[
            { title: "MITRE ATT&CK", desc: "Adversary tactics & techniques framework", url: "https://attack.mitre.org" },
            { title: "NIST Guidelines", desc: "Digital forensics best practices", url: "https://www.nist.gov/forensics" },
            { title: "SANS Institute", desc: "Forensics training & resources", url: "https://www.sans.org/digital-forensics-incident-response" },
          ].map((r) => (
            <a key={r.title} href={r.url} target="_blank" rel="noopener noreferrer"
              className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-500/10 transition group">
              <p className="font-semibold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition text-xs">{r.title} ↗</p>
              <p className="text-gray-400 text-xs mt-0.5">{r.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
