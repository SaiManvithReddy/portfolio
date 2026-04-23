type ExperienceCard = {
  company: string;
  role: string;
  employment: "Full-time" | "Internship" | "Academic";
  period: string;
  location?: string;
  bullets: string[];
  tag: string;
  href?: string;
  hrefLabel?: string;
};

const experience: ExperienceCard[] = [
  {
    company: "SnapMatePhoto",
    role: "Software Engineer Intern",
    employment: "Internship",
    period: "Feb 2026 – Present · 3 mos",
    bullets: [
      "Owned the end-to-end Request to Book workflow — from product scoping through deployment — using React.js, TypeScript, Python, and REST APIs",
      "Optimized frontend component architecture and backend API integrations in PHP/ThinkPHP and JavaScript, improving search performance and marketplace data accuracy across the platform",
      "Integrated Reddit Conversion API (CAPI) for event tracking and resolved SMTP/DKIM email delivery failures, debugging cross-layer production issues spanning APIs, data pipelines, and infrastructure",
      "Operated in a full Agile environment (daily standups, sprint planning, retrospectives) and produced technical runbooks accessible to both engineering and non-technical stakeholders",
    ],
    tag: "React · TypeScript · Python · PHP/ThinkPHP · REST · CAPI",
    href: "https://snapmatephoto.com",
    hrefLabel: "snapmatephoto.com",
  },
  {
    company: "Evernorth Health Services",
    role: "Software Engineer Intern",
    employment: "Internship",
    period: "Feb 2025 – Nov 2025 · 10 mos",
    location: "United States · Hybrid",
    bullets: [
      "Designed and shipped Python/FastAPI microservices integrated with PostgreSQL on AWS, cutting API response times by 30% for mission-critical healthcare workflows — led full stakeholder management from prototype to production",
      "Built Kafka-based ETL pipelines with Python and Pandas for real-time data ingestion, reducing manual processing overhead by 20%",
      "Integrated OpenAI GPT and LangChain into internal tooling, automating ticket triage and log summarization through structured prompt pipelines validated for production reliability",
      "Deployed containerized services via Docker and Kubernetes with CI/CD pipelines; added structured logging and monitoring dashboards, reducing downtime by 20% and maintaining SLA adherence",
    ],
    tag: "Python · FastAPI · AWS · PostgreSQL · Kafka · LangChain · Docker · K8s",
  },
  {
    company: "Tericsoft",
    role: "Software Engineer",
    employment: "Full-time",
    period: "Jun 2022 – Aug 2023 · 1 yr 3 mos",
    location: "Hyderabad, Telangana, India · On-site",
    bullets: [
      "Designed and deployed AI-powered application features using Python and FastAPI, improving backend processing efficiency across core product workflows",
      "Built and maintained production-grade REST API endpoints integrated with the frontend, supporting real-time data delivery across multiple user-facing features",
      "Developed and evaluated ML models using PyTorch and Scikit-learn, iterating on model performance to hit accuracy targets in a fast-paced startup environment",
    ],
    tag: "Python · FastAPI · PyTorch · Scikit-learn · REST · AWS",
  },
  {
    company: "AI-Driven Supply Chain Risk Prediction",
    role: "MS project",
    employment: "Academic",
    period: "Nov 2025 – Dec 2025",
    location: "University of Bridgeport",
    bullets: [
      "Designed an ML-driven system detecting disruption risks using logistics, trade, and environmental data",
      "Developed RESTful interfaces with FastAPI to deliver real-time inference and analytics",
      "Built a monitoring dashboard with Streamlit for data visualization and risk scoring",
    ],
    tag: "Python · FastAPI · Streamlit · ML",
  },
];

export function Projects() {
  return (
    <section id="work" className="relative border-t border-white/10 bg-[#0b0b0b]">
      <div className="pointer-events-none absolute inset-0 bg-grid-fade opacity-25" aria-hidden="true" />

      <div className="relative mx-auto max-w-6xl px-6 py-16 sm:px-10 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium tracking-[0.32em] text-zinc-500">EXPERIENCE</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-zinc-100 sm:text-5xl">
            Roles,{" "}
            <span className="bg-gradient-to-r from-zinc-100 to-zinc-500 bg-clip-text text-transparent">shipping</span>
            , and impact.
          </h2>
          <p className="mt-4 text-balance text-sm leading-relaxed text-zinc-400/90 sm:text-base">
            Full-time and internship experience, plus a graduate project—aligned with the detail on your profile.
          </p>
        </div>

        <div className="mx-auto mt-12 flex max-w-4xl flex-col gap-6">
          {experience.map((job) => (
            <article
              key={`${job.company}-${job.period}`}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-glass backdrop-blur transition will-change-transform hover:-translate-y-0.5 hover:border-white/20 hover:shadow-glow sm:p-8"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-medium tracking-[0.22em] text-zinc-500">
                    {job.role} · {job.employment}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-zinc-100 sm:text-2xl">{job.company}</h3>
                  <p className="mt-1 text-sm text-zinc-400/90">{job.period}</p>
                  {job.location ? <p className="mt-0.5 text-sm text-zinc-500">{job.location}</p> : null}
                </div>
                {job.href ? (
                  <a
                    href={job.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex shrink-0 items-center justify-center gap-1.5 self-start rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-200/90 transition hover:border-white/20"
                  >
                    {job.hrefLabel ?? "Open"} <span aria-hidden>↗</span>
                  </a>
                ) : null}
              </div>

              <ul className="mt-5 list-inside list-disc space-y-2.5 text-sm leading-relaxed text-zinc-400/95 marker:text-zinc-600 sm:list-outside sm:pl-4">
                {job.bullets.map((b, i) => (
                  <li key={`${job.company}-bullet-${i}`} className="pl-0.5 sm:pl-0">
                    {b}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                <span className="inline-flex max-w-full items-center rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-zinc-300/90">
                  {job.tag}
                </span>
              </div>

              <div
                className="pointer-events-none absolute -inset-24 opacity-0 blur-2xl transition group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(600px circle at 20% 0%, rgba(99, 102, 241, 0.2), transparent 55%), radial-gradient(500px circle at 90% 20%, rgba(16, 185, 129, 0.15), transparent 60%)",
                }}
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
