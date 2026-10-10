import { TEAM } from '@/constants';

const PORTRAIT: Record<string, string> = {
  "/team/mamun.jpg": "center 20%",
  "/team/arean.jpg": "center 22%",
  "/team/emon.jpg": "center 18%",
  "/team/shamsi.png": "center 45%",
};

type Person = (typeof TEAM)[number];

function ProfileCard({ person }: { person: Person }) {
  return (
    <article className="flex h-full flex-col border-t-[3px] border-t-earth-900 bg-white p-5 shadow-[0_1px_2px_rgba(17,24,39,0.04),0_6px_14px_-8px_rgba(17,24,39,0.12)] ring-1 ring-earth-200">
      <div className="flex gap-4">
        <div className="relative h-32 w-24 shrink-0 overflow-hidden bg-earth-200 ring-1 ring-earth-300">
          {person.image ? (
            <img
              src={person.image}
              alt=""
              className="h-full w-full object-cover"
              style={{ objectPosition: PORTRAIT[person.image] ?? "center 22%" }}
            />
          ) : null}
        </div>
        <div className="min-w-0 pt-0.5">
          <p className="font-sans text-[11px] font-medium tracking-wide text-primary-800">
            {person.role}
          </p>
          <h3 className="mt-1.5 text-lg font-semibold leading-snug text-balance text-earth-900">
            {person.name}
          </h3>
        </div>
      </div>

      <div className="mt-4 flex flex-1 flex-col">
        <p className="font-sans text-sm leading-relaxed text-earth-800">{person.credential}</p>
        <p className="mt-0.5 font-sans text-sm leading-relaxed text-earth-600">{person.affiliation}</p>
        {person.focus ? (
          <p className="mt-2 font-sans text-sm leading-relaxed text-earth-500">{person.focus}</p>
        ) : null}

        {person.email || person.links.length > 0 ? (
          <div className="mt-auto flex flex-wrap gap-x-3 gap-y-1 border-t border-earth-100 pt-3 font-sans text-sm">
            {person.email ? (
              <a
                href={`mailto:${person.email}`}
                className="text-earth-800 underline decoration-earth-300 underline-offset-[3px]"
              >
                {person.email}
              </a>
            ) : null}
            {person.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-earth-800 underline decoration-earth-300 underline-offset-[3px]"
              >
                {link.label}
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}

function SidePortraitCard({ person }: { person: Person }) {
  return (
    <article className="flex h-full min-h-56 overflow-hidden border-t-[3px] border-t-earth-900 bg-white shadow-[0_1px_2px_rgba(17,24,39,0.04),0_6px_14px_-8px_rgba(17,24,39,0.12)] ring-1 ring-earth-200">
      <div className="relative w-32 shrink-0 bg-earth-200 sm:w-36">
        {person.image ? (
          <img
            src={person.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: PORTRAIT[person.image] ?? "center 22%" }}
          />
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col px-4 py-4 sm:px-5 sm:py-5">
        <p className="font-sans text-[11px] font-medium tracking-wide text-primary-800">
          {person.role}
        </p>
        <h3 className="mt-1.5 text-lg font-semibold leading-snug text-balance text-earth-900">
          {person.name}
        </h3>
        <p className="mt-3 font-sans text-sm leading-relaxed text-earth-800">{person.credential}</p>
        <p className="mt-0.5 font-sans text-sm leading-relaxed text-earth-600">{person.affiliation}</p>
        {person.focus ? (
          <p className="mt-2 font-sans text-sm leading-relaxed text-earth-500">{person.focus}</p>
        ) : null}

        {person.email || person.links.length > 0 ? (
          <div className="mt-auto flex flex-wrap gap-x-3 gap-y-1 border-t border-earth-100 pt-3 font-sans text-sm">
            {person.email ? (
              <a
                href={`mailto:${person.email}`}
                className="text-earth-800 underline decoration-earth-300 underline-offset-[3px]"
              >
                {person.email}
              </a>
            ) : null}
            {person.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-earth-800 underline decoration-earth-300 underline-offset-[3px]"
              >
                {link.label}
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}

function Group({
  title,
  people,
  variant = "inset",
}: {
  title: string;
  people: Person[];
  variant?: "inset" | "side";
}) {
  const Card = variant === "side" ? SidePortraitCard : ProfileCard;

  return (
    <div>
      <h2 className="mb-5 text-2xl font-semibold tracking-tight text-earth-900">{title}</h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {people.map((person) => (
          <Card key={person.name} person={person} />
        ))}
      </div>
    </div>
  );
}

export default function Team() {
  const investigators = TEAM.filter(
    (person) =>
      person.role === "Principal Investigator" ||
      person.role === "Co-Principal Investigator"
  );
  const members = TEAM.filter((person) => !investigators.includes(person));

  return (
    <section id="team" className="bg-[#eef0f3] py-16 font-serif">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-14">
          <Group title="Investigators" people={investigators} />
          <Group title="Research team" people={members} variant="side" />
        </div>

        <div className="mt-14 flex flex-wrap items-center gap-x-12 gap-y-6 border-t border-earth-300 pt-8">
          <div className="flex items-center gap-4">
            <img src="/logos/just.png" alt="" className="h-14 w-14 object-contain" />
            <div>
              <p className="font-sans text-sm font-semibold text-earth-900">
                Jashore University of Science and Technology
              </p>
              <p className="mt-0.5 font-sans text-xs text-earth-500">Jashore, Bangladesh</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <img
              src="/logos/Dhaka_University_logo.svg"
              alt=""
              className="h-14 w-auto object-contain"
            />
            <div>
              <p className="font-sans text-sm font-semibold text-earth-900">University of Dhaka</p>
              <p className="mt-0.5 font-sans text-xs text-earth-500">Dhaka, Bangladesh</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
