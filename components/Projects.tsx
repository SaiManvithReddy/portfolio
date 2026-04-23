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
      "Took the Request to Book feature from scoping to deployed — React, TypeScript, Python, REST APIs. I scoped it, built it, shipped it, and handed it off with docs.",
      "Dug into the PHP/ThinkPHP API layer to fix search accuracy and marketplace data bugs — traced the problem through multiple services before finding the root cause",
      "Wired up Reddit CAPI for conversion tracking and debugged SMTP/DKIM delivery failures — the kind of cross-stack tracing that teaches you how a whole system connects",
      "Wrote runbooks non-technical teammates could actually follow — good documentation is an engineering deliverable too",
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
      "Built FastAPI microservices on AWS for pharmacy benefit workflows — response times dropped 30% from what the legacy service delivered. Owned it from the first design meeting to the production handoff.",
      "Designed Kafka + Pandas ETL pipelines for real-time health data ingestion — cut 20% of the manual processing work the team was doing by hand each day",
      "Wired OpenAI GPT and LangChain into internal tooling for ticket triage and log summarization — built the prompt pipelines, added monitoring, and shipped it to the team",
      "Containerized everything with Docker and Kubernetes, then added structured logging and dashboards so we could actually see what was happening — downtime dropped 20%",
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
      "My first engineering job — built Python/FastAPI backend services at a small startup in Hyderabad. Fast-paced, owned features from API design to deployment with little hand-holding.",
      "Built the REST endpoints the React frontend depended on for real-time data — reliability was non-negotiable because the frontend team couldn't ship without them",
      "Ran experiments with PyTorch and Scikit-learn until the classification models hit accuracy targets worth shipping, then got them into production",
    ],
    tag: "Python · FastAPI · PyTorch · Scikit-learn · REST · AWS",
  },
  {
    company: "AI-Driven Supply Chain Risk Prediction",
    role: "Graduate Capstone Project",
    employment: "Academic",
    period: "Nov 2025 – Dec 2025",
    location: "University of Bridgeport",
    bullets: [
      "Solo MS capstone — built an ML system that flags supply chain disruption risks from logistics, trade flow, and environmental data. The full pipeline, not just a model.",
      "FastAPI inference layer so the model's output was actually queryable in real time, not just a notebook cell you run manually",
      "Streamlit dashboard for risk scoring and visualization — made the results usable for someone who isn't looking at raw model output",
    ],
    tag: "Python · FastAPI · Streamlit · ML",
  },
];

export function Projects() {
  return (
    <section id="work" className="relative overflow-x-clip border-t border-white/10 bg-[#0b0b0b]">
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
            What I&apos;ve actually built, what it does, and what I learned from shipping it.
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
