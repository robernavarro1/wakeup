import Link from "next/link"
import { auth } from "@/lib/auth"
import {
  CATEGORIES,
  DEMO_PROFESSIONALS,
  DEMO_PODCASTS,
  DEMO_ACTIVITIES,
  DEMO_EVENTS,
  getDailyPhrase,
} from "@/lib/demo-data"

type CategoryGroup = {
  id: string
  name: string
  icon: string
  description: string
  gradient: string
  children: string[]
}

const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: "cuerpo",
    name: "Despertar del Cuerpo",
    icon: "🌅",
    description: "Yoga, Reiki, actividades físicas espirituales y medicina alternativa para despertar la energía vital del cuerpo",
    gradient: "from-amber-900/40 via-orange-900/20 to-transparent",
    children: ["yoga", "reiki", "actividades", "medicina"],
  },
  {
    id: "alma",
    name: "Despertar del Alma",
    icon: "🕊️",
    description: "Meditación, terapias alternativas, constelaciones, flores de Bach, tarot, astrología y crecimiento personal",
    gradient: "from-purple-900/40 via-pink-900/20 to-transparent",
    children: ["meditacion", "terapias", "crecimiento"],
  },
  {
    id: "conocimiento",
    name: "Despertar del Conocimiento",
    icon: "📖",
    description: "Tradiciones sagradas, sabiduría ancestral, textos sumerios y egipcios, Cábala, hermetismo y ciencias ocultas",
    gradient: "from-blue-900/40 via-indigo-900/20 to-transparent",
    children: ["tradiciones", "ancestral", "hermetismo"],
  },
  {
    id: "futuro",
    name: "Despertar del Futuro",
    icon: "🔮",
    description: "Ocultismo, demonología, brujería, grimorios y las tradiciones esotéricas de la adivinación y el más allá",
    gradient: "from-gray-900/60 via-zinc-900/40 to-transparent",
    children: ["tarot", "ocultismo"],
  },
  {
    id: "viajes",
    name: "Retiros y Viajes",
    icon: "✈️",
    description: "Retiros espirituales, viajes iniciáticos, peregrinaciones y ceremonias alrededor del mundo",
    gradient: "from-cyan-900/40 via-teal-900/20 to-transparent",
    children: ["retiros", "viajes"],
  },
]

const STANDALONE_CATEGORIES = ["zona", "materiales", "podcasts"]

function StarRating({
  rating,
  count,
}: {
  rating: number
  count?: number
}) {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5
  return (
    <span className="inline-flex items-center gap-1 text-amber-400">
      <span className="text-sm">
        {Array.from({ length: 5 }, (_, i) => {
          if (i < full) return "★"
          if (i === full && half) return "★"
          return "☆"
        }).join("")}
      </span>
      {count !== undefined && (
        <span className="text-xs text-purple-300/70">({count})</span>
      )}
    </span>
  )
}

function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/[0.07] ${className}`}
    >
      {children}
    </div>
  )
}

function SectionCard({
  children,
  title,
  icon,
}: {
  children: React.ReactNode
  title: string
  icon: string
}) {
  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </div>
  )
}

function DailyPhrase() {
  const phrase = getDailyPhrase()
  return (
    <div className="relative mb-8 overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-purple-500/5 to-transparent p-6">
      <div className="absolute right-4 top-4 text-4xl opacity-10">🕉️</div>
      <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/70">
        Frase del día
      </p>
      <p className="mt-3 text-lg leading-relaxed text-purple-100 italic">
        &ldquo;{phrase.text}&rdquo;
      </p>
      <p className="mt-2 text-sm text-amber-400/60">&mdash; {phrase.author}</p>
    </div>
  )
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string; g?: string }>
}) {
  const { c, g: rawG } = await searchParams
  const activeId = c || null
  const activeGroup = rawG || null
  const activeCat = activeId
    ? CATEGORIES.find((cat) => cat.id === activeId)
    : null
  const activeGroupDef = activeGroup
    ? CATEGORY_GROUPS.find((grp) => grp.id === activeGroup)
    : null

  function isActiveGroup(groupId: string) {
    if (activeGroup === groupId) return true
    if (activeId && CATEGORY_GROUPS.find((g) => g.id === groupId)?.children.includes(activeId)) return true
    return false
  }

  function isActiveStandalone(catId: string) {
    return activeId === catId
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 border-r border-white/10 bg-black/20 p-4 lg:block">
        <div className="mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-purple-400/60">
            Explorar
          </h2>
        </div>
        <nav className="space-y-1">
          <Link
            href="/explore"
            scroll={false}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
              !activeId && !activeGroup
                ? "bg-purple-500/20 text-purple-200"
                : "text-purple-300/60 hover:bg-white/5 hover:text-purple-200"
            }`}
          >
            <span className="text-lg">🌌</span>
            Todas
          </Link>

          {/* Groups */}
          {CATEGORY_GROUPS.map((group) => {
            const expanded = isActiveGroup(group.id)
            const groupActive = activeGroup === group.id
            return (
              <div key={group.id}>
                <Link
                  href={`/explore?g=${group.id}`}
                  scroll={false}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                    groupActive
                      ? "bg-purple-500/20 text-purple-200"
                      : "text-purple-300/60 hover:bg-white/5 hover:text-purple-200"
                  }`}
                >
                  <span className="text-lg">{group.icon}</span>
                  <span className="font-medium">{group.name}</span>
                </Link>
                {(groupActive || expanded) && (
                  <div className="ml-4 mt-0.5 space-y-0.5 border-l border-white/5 pl-2">
                    {group.children.map((childId) => {
                      const childCat = CATEGORIES.find((c) => c.id === childId)
                      if (!childCat) return null
                      return (
                        <Link
                          key={childId}
                          href={`/explore?c=${childId}`}
                          scroll={false}
                          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition ${
                            activeId === childId
                              ? "bg-purple-500/15 text-purple-200"
                              : "text-purple-300/40 hover:bg-white/5 hover:text-purple-200"
                          }`}
                        >
                          <span>{childCat.icon}</span>
                          {childCat.name}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}

          {/* Standalone */}
          <div className="my-3 border-t border-white/5" />
          {STANDALONE_CATEGORIES.map((catId) => {
            const cat = CATEGORIES.find((c) => c.id === catId)
            if (!cat) return null
            const standaloneActive = isActiveStandalone(catId)
            return (
              <Link
                key={catId}
                href={`/explore?c=${catId}`}
                scroll={false}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  standaloneActive
                    ? "bg-purple-500/20 text-purple-200"
                    : "text-purple-300/60 hover:bg-white/5 hover:text-purple-200"
                }`}
              >
                <span className="text-lg">{cat.icon}</span>
                {cat.name}
              </Link>
            )
          })}
        </nav>

        <div className="mt-12 rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-center text-xs italic leading-relaxed text-purple-300/40">
            &ldquo;El universo no es más que
            <br />
            un gran eco.
            <br />
            Todo lo que das, vuelve.&rdquo;
          </p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {activeGroupDef ? (
          <GroupView group={activeGroupDef} />
        ) : activeId === "podcasts" ? (
          <PodcastsView />
        ) : activeId === "ocultismo" ? (
          <OcultismoPodcastsView />
        ) : activeId === "actividades" ? (
          <ActivitiesView />
        ) : activeId === "zona" ? (
          <LocalEventsView />
        ) : activeId === "materiales" ? (
          <MaterialesView />
        ) : activeCat ? (
          <CategoryView category={activeCat} />
        ) : (
          <AllView />
        )}
      </div>
    </div>
  )
}

function AllView() {
  const topPodcasts = DEMO_PODCASTS.filter((p) => p.isTop && p.category !== "ocultismo").slice(0, 3)

  return (
    <div className="space-y-8">
      <DailyPhrase />

      <SectionCard title="Top Podcasts Espirituales" icon="🎙️">
        {topPodcasts.map((pod) => (
          <GlassCard key={pod.id}>
            <div className="mb-2 flex items-center justify-between">
              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-300">
                Top
              </span>
              <span className="text-xs text-purple-300/50">
                {pod.episodes} episodios
              </span>
            </div>
            <h3 className="font-semibold text-white">{pod.title}</h3>
            <p className="mt-1 text-sm text-purple-300/60">por {pod.host}</p>
            <p className="mt-2 text-xs text-purple-300/50">{pod.duration}</p>
            <p className="mt-1 line-clamp-2 text-sm text-purple-200/70">
              {pod.description}
            </p>
          </GlassCard>
        ))}
      </SectionCard>

      {/* Groups */}
      {CATEGORY_GROUPS.map((group) => {
        const childrenCats = group.children
          .map((id) => CATEGORIES.find((c) => c.id === id))
          .filter((c): c is (typeof CATEGORIES)[0] => c !== undefined)
        return <GroupPreview key={group.id} group={group} categories={childrenCats} />
      })}

      {/* Standalone previews */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <span>📌</span> Más secciones
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {["zona", "materiales", "podcasts"].map((catId) => {
            const cat = CATEGORIES.find((c) => c.id === catId)
            if (!cat) return null
            return (
              <Link key={catId} href={`/explore?c=${catId}`} scroll={false}>
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/[0.07]">
                  <span className="text-2xl">{cat.icon}</span>
                  <h3 className="mt-2 font-semibold text-white">{cat.name}</h3>
                  <p className="mt-1 text-xs text-purple-300/50">{cat.description}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function GroupPreview({
  group,
  categories,
}: {
  group: CategoryGroup
  categories: (typeof CATEGORIES)[0][]
}) {
  const allPros = categories.flatMap((cat) =>
    DEMO_PROFESSIONALS.filter((p) => p.category === cat.id).slice(0, 2)
  )

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <Link
          href={`/explore?g=${group.id}`}
          className="flex items-center gap-2 text-xl font-bold text-white hover:text-purple-200"
        >
          <span>{group.icon}</span> {group.name}
        </Link>
        <Link
          href={`/explore?g=${group.id}`}
          className="text-sm text-purple-400 hover:text-purple-300"
        >
          Ver todo &rarr;
        </Link>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/explore?c=${cat.id}`}
            className="rounded-full bg-white/5 px-3 py-1 text-xs text-purple-300/60 transition hover:bg-white/10 hover:text-purple-200"
          >
            {cat.icon} {cat.name}
          </Link>
        ))}
      </div>

      {allPros.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {allPros.slice(0, 4).map((pro) => (
            <ProfessionalCard key={pro.id} pro={pro} />
          ))}
        </div>
      )}
    </section>
  )
}

function GroupView({ group }: { group: CategoryGroup }) {
  const childrenCats = group.children
    .map((id) => CATEGORIES.find((c) => c.id === id))
    .filter((c): c is (typeof CATEGORIES)[0] => c !== undefined)

  return (
    <div className="space-y-8">
      <div className={`relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r ${group.gradient} p-8`}>
        <div className="absolute right-4 top-4 text-6xl opacity-20">{group.icon}</div>
        <Link href="/explore" className="relative mb-4 inline-block text-sm text-purple-300/60 hover:text-purple-200">
          &larr; Todas las categorías
        </Link>
        <h1 className="relative text-3xl font-bold text-white">
          {group.icon} {group.name}
        </h1>
        <p className="relative mt-2 text-purple-200/60">{group.description}</p>
      </div>

      {childrenCats.map((cat) => {
        const pros = DEMO_PROFESSIONALS.filter((p) => p.category === cat.id)
        return (
          <section key={cat.id}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                <span>{cat.icon}</span> {cat.name}
              </h2>
              <Link href={`/explore?c=${cat.id}`} className="text-sm text-purple-400 hover:text-purple-300">
                Ver &rarr;
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pros.length > 0 ? (
                pros.slice(0, 3).map((pro) => (
                  <ProfessionalCard key={pro.id} pro={pro} categoryId={cat.id} />
                ))
              ) : (
                <p className="col-span-full py-4 text-center text-sm text-purple-300/40">
                  No hay profesionales en esta categoría todavía
                </p>
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function CategoryPreview({
  category,
  professionals,
}: {
  category: (typeof CATEGORIES)[0]
  professionals: (typeof DEMO_PROFESSIONALS)
}) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-bold text-white">
          <span>{category.icon}</span> {category.name}
        </h2>
        <Link
          href={`/explore?c=${category.id}`}
          className="text-sm text-purple-400 hover:text-purple-300"
        >
          Ver todo &rarr;
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {professionals.length > 0 ? (
          professionals.map((pro) => (
            <ProfessionalCard
              key={pro.id}
              pro={pro}
              categoryId={category.id}
            />
          ))
        ) : (
          <p className="col-span-full py-6 text-center text-sm text-purple-300/40">
            Próximamente profesionales en esta categoría
          </p>
        )}
      </div>
    </section>
  )
}

function CategoryView({
  category,
}: {
  category: (typeof CATEGORIES)[0]
}) {
  const pros = DEMO_PROFESSIONALS.filter(
    (p) => p.category === category.id
  )

  return (
    <div>
      <div
        className={`relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r ${category.gradient} p-8`}
      >
        <div className="absolute right-4 top-4 text-6xl opacity-20">
          {category.icon}
        </div>
        <Link
          href="/explore"
          className="relative mb-4 inline-block text-sm text-purple-300/60 hover:text-purple-200"
        >
          &larr; Todas las categorías
        </Link>
        <h1 className="relative text-3xl font-bold text-white">
          {category.icon} {category.name}
        </h1>
        <p className="relative mt-2 text-purple-200/60">
          {category.description}
        </p>
        {"longDescription" in category && category.longDescription && (
          <p className="relative mt-3 max-w-2xl text-sm leading-relaxed text-purple-300/50">
            {category.longDescription}
          </p>
        )}
      </div>

      <SectionCard title="Profesores" icon="👤">
        {pros.length > 0 ? (
          pros.map((pro) => (
            <ProfessionalCard
              key={pro.id}
              pro={pro}
              categoryId={category.id}
            />
          ))
        ) : (
          <p className="col-span-full py-8 text-center text-sm text-purple-300/40">
            No hay profesionales en esta categoría todavía
          </p>
        )}
      </SectionCard>
    </div>
  )
}

function ProfessionalCard({
  pro,
  categoryId,
}: {
  pro: (typeof DEMO_PROFESSIONALS)[0]
  categoryId?: string
}) {
  return (
    <Link href={categoryId ? `/professionals/${pro.id}` : "#"}>
      <GlassCard>
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-amber-500 text-sm font-bold text-white shadow-lg">
            {pro.name[0]}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-white">{pro.name}</p>
            <p className="truncate text-sm text-purple-300/80">{pro.title}</p>
            <StarRating rating={pro.rating} count={pro.reviews} />
          </div>
        </div>
        <p className="mt-3 line-clamp-2 text-sm text-purple-200/70">
          {pro.bio}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {pro.specialties.slice(0, 3).map((s) => (
            <span
              key={s}
              className="rounded-full bg-purple-500/15 px-2.5 py-0.5 text-xs text-purple-300"
            >
              {s}
            </span>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-purple-300/60">{pro.city}</span>
          {pro.pricePerSession > 0 && (
            <span className="font-semibold text-amber-300">
              {pro.pricePerSession / 100} &euro;
            </span>
          )}
        </div>
      </GlassCard>
    </Link>
  )
}

function PodcastsView() {
  const topPodcasts = DEMO_PODCASTS.filter((p) => p.isTop)
  const otherPodcasts = DEMO_PODCASTS.filter((p) => !p.isTop)

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <Link
          href="/explore"
          className="mb-4 inline-block text-sm text-purple-300/60 hover:text-purple-200"
        >
          &larr; Todas las categorías
        </Link>
        <h1 className="text-3xl font-bold text-white">
          🎙️ Podcasts Espirituales
        </h1>
        <p className="mt-2 text-purple-200/60">
          Los mejores podcasts sobre espiritualidad, yoga, meditación y crecimiento
          personal
        </p>
      </div>

      <SectionCard title="Top Podcasts" icon="⭐">
        {topPodcasts.map((pod) => (
          <GlassCard key={pod.id}>
            <div className="mb-3 flex items-center justify-between">
              <span className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-0.5 text-xs font-semibold text-white">
                Top Podcast
              </span>
              <span className="text-xs text-purple-300/50">
                {pod.episodes} ep.
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">{pod.title}</h3>
            <p className="mt-1 text-sm text-purple-300/60">
              por {pod.host} &middot; {pod.duration}
            </p>
            <p className="mt-3 line-clamp-2 text-sm text-purple-200/70">
              {pod.description}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="rounded-md bg-purple-500/20 px-2 py-0.5 text-xs text-purple-300">
                {pod.category === "yoga"
                  ? "🧘 Yoga"
                  : pod.category === "reiki"
                    ? "✨ Reiki"
                    : pod.category === "meditacion"
                      ? "🪷 Meditación"
                      : pod.category === "terapias"
                        ? "🌿 Terapias"
                        : pod.category === "crecimiento"
                          ? "🌱 Crecimiento"
                          : pod.category === "actividades"
                            ? "💃 Movimiento"
                            : pod.category === "retiros"
                              ? "🔥 Retiros"
                              : pod.category}
              </span>
            </div>
          </GlassCard>
        ))}
      </SectionCard>

      <SectionCard title="Más Podcasts Recomendados" icon="🎧">
        {otherPodcasts.map((pod) => (
          <GlassCard key={pod.id}>
            <h3 className="font-semibold text-white">{pod.title}</h3>
            <p className="mt-1 text-sm text-purple-300/60">
              por {pod.host} &middot; {pod.duration}
            </p>
            <p className="mt-2 line-clamp-2 text-sm text-purple-200/70">
              {pod.description}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-purple-300/50">
                {pod.episodes} episodios
              </span>
            </div>
          </GlassCard>
        ))}
      </SectionCard>
    </div>
  )
}

function OcultismoPodcastsView() {
  const topOculto = DEMO_PODCASTS.filter(
    (p) => p.isTop && p.category === "ocultismo"
  )
  const otherOculto = DEMO_PODCASTS.filter(
    (p) => !p.isTop && p.category === "ocultismo"
  )

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <Link
          href="/explore"
          className="mb-4 inline-block text-sm text-purple-300/60 hover:text-purple-200"
        >
          &larr; Todas las categorías
        </Link>
        <h1 className="text-3xl font-bold text-white">
          🔮 Ocultismo
        </h1>
        <p className="mt-2 text-purple-200/60">
          Podcasts sobre ocultismo, satanismo, demonología, brujería, grimorios y
          las tradiciones esotéricas de la sombra
        </p>
      </div>

      <SectionCard title="Podcasts Destacados" icon="⭐">
        {topOculto.map((pod) => (
          <GlassCard key={pod.id}>
            <div className="mb-3 flex items-center justify-between">
              <span className="rounded-full bg-gradient-to-r from-gray-700 to-zinc-700 px-2.5 py-0.5 text-xs font-semibold text-gray-200">
                Top Ocultismo
              </span>
              <span className="text-xs text-purple-300/50">
                {pod.episodes} ep.
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">{pod.title}</h3>
            <p className="mt-1 text-sm text-purple-300/60">
              por {pod.host} &middot; {pod.duration}
            </p>
            <p className="mt-3 line-clamp-2 text-sm text-purple-200/70">
              {pod.description}
            </p>
          </GlassCard>
        ))}
      </SectionCard>

      <SectionCard title="Más Podcasts Recomendados" icon="🎧">
        {otherOculto.map((pod) => (
          <GlassCard key={pod.id}>
            <h3 className="font-semibold text-white">{pod.title}</h3>
            <p className="mt-1 text-sm text-purple-300/60">
              por {pod.host} &middot; {pod.duration}
            </p>
            <p className="mt-2 line-clamp-2 text-sm text-purple-200/70">
              {pod.description}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-purple-300/50">
                {pod.episodes} episodios
              </span>
            </div>
          </GlassCard>
        ))}
      </SectionCard>
    </div>
  )
}

function ActivitiesView() {
  const instructors = DEMO_PROFESSIONALS.filter(
    (p) => p.category === "actividades"
  )

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <Link
          href="/explore"
          className="mb-4 inline-block text-sm text-purple-300/60 hover:text-purple-200"
        >
          &larr; Todas las categorías
        </Link>
        <h1 className="text-3xl font-bold text-white">
          💃 Actividades Físicas Espirituales
        </h1>
        <p className="mt-2 text-purple-200/60">
          Grupos de yoga, Tai Chi, Bio-danza, Chi Kung y movimiento consciente para
          conectar cuerpo y espíritu
        </p>
      </div>

      {/* Grupos y actividades */}
      <SectionCard title="Grupos y Clases" icon="👥">
        {DEMO_ACTIVITIES.map((act) => {
          const typeIcon =
            act.type === "Tai Chi"
              ? "☯️"
              : act.type === "Bio-danza"
                ? "💃"
                : act.type === "Chi Kung"
                  ? "🌊"
                  : act.type === "Danza Consciente" || act.type === "Danza Circular"
                    ? "🔄"
                    : act.type.includes("Yoga")
                      ? "🧘"
                      : "✨"

          return (
            <GlassCard key={act.id}>
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded-md bg-teal-500/20 px-2 py-0.5 text-xs text-teal-300">
                  {typeIcon} {act.type}
                </span>
                <span className="font-semibold text-amber-300">
                  {act.price / 100} &euro;
                </span>
              </div>
              <h3 className="font-semibold text-white">{act.name}</h3>
              <p className="mt-1 text-xs text-purple-300/60">
                por {act.instructor}
              </p>
              <p className="mt-2 line-clamp-2 text-sm text-purple-200/70">
                {act.description}
              </p>
              <div className="mt-3 space-y-1 text-xs text-purple-300/50">
                <p>🕐 {act.schedule}</p>
                <p>📍 {act.location}</p>
              </div>
            </GlassCard>
          )
        })}
      </SectionCard>

      {/* Profesores de actividades físicas */}
      <SectionCard title="Profesores" icon="👤">
        {instructors.map((pro) => (
          <ProfessionalCard
            key={pro.id}
            pro={pro}
            categoryId="actividades"
          />
        ))}
      </SectionCard>

      {/* Eventos de actividades */}
      <SectionCard title="Eventos y Encuentros" icon="🔥">
        {DEMO_EVENTS.filter((e) => e.category === "actividades").map((ev) => {
          const typeIcon =
            ev.type === "taller"
              ? "🔧"
              : ev.type === "ceremonia"
                ? "🌙"
                : "📜"

          return (
            <GlassCard key={ev.id}>
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded-md bg-orange-500/20 px-2 py-0.5 text-xs text-orange-300">
                  {typeIcon} {ev.type.charAt(0).toUpperCase() + ev.type.slice(1)}
                </span>
                <span className="font-semibold text-amber-300">
                  {ev.price > 0 ? `${ev.price / 100} €` : "Gratuito"}
                </span>
              </div>
              <h3 className="font-semibold text-white">{ev.title}</h3>
              <p className="mt-1 text-xs text-purple-300/60">
                por {ev.organizer}
              </p>
              <div className="mt-2 flex items-center gap-3 text-xs text-purple-300/50">
                <span>📅 {ev.date}</span>
                <span>📍 {ev.location}</span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-purple-200/70">
                {ev.description}
              </p>
            </GlassCard>
          )
        })}
      </SectionCard>
    </div>
  )
}

function LocalEventsView() {
  const localEvents = DEMO_EVENTS.filter((e) => e.category === "zona")
  const cities = [...new Set(DEMO_PROFESSIONALS.map((p) => p.city).filter(Boolean))].sort()

  const eventTypeIcon: Record<string, string> = {
    feria: "🏪",
    mercado: "🛍️",
    circulo: "🔄",
    encuentro: "🤝",
    charla: "🎤",
    taller: "🔧",
    retiro: "🌄",
    ceremonia: "🌙",
    formacion: "📜",
  }

  const thisWeek = localEvents.filter((e) =>
    e.date.toLowerCase().includes("mayo")
  )
  const thisMonth = localEvents.filter(
    (e) => !thisWeek.includes(e)
  )

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <Link
          href="/explore"
          className="mb-4 inline-block text-sm text-purple-300/60 hover:text-purple-200"
        >
          &larr; Todas las categorías
        </Link>
        <h1 className="text-3xl font-bold text-white">
          📍 En tu Zona
        </h1>
        <p className="mt-2 text-purple-200/60">
          Ferias holísticas, mercados esotéricos, charlas, círculos y encuentros
          espirituales. Además, descubre los profesionales de la app que están
          cerca de ti.
        </p>
      </div>

      <SectionCard title="Esta Semana" icon="📅">
        {thisWeek.length > 0 ? (
          thisWeek.map((ev) => (
            <GlassCard key={ev.id}>
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded-md bg-green-500/20 px-2 py-0.5 text-xs text-green-300">
                  {eventTypeIcon[ev.type] || "📌"}{" "}
                  {ev.type.charAt(0).toUpperCase() + ev.type.slice(1)}
                </span>
                <span
                  className={`text-xs font-medium ${ev.price === 0 ? "text-green-400" : "text-amber-300"}`}
                >
                  {ev.price === 0 ? "Gratuito" : `${ev.price / 100} €`}
                </span>
              </div>
              <h3 className="font-semibold text-white">{ev.title}</h3>
              <p className="mt-1 text-xs text-purple-300/60">
                por {ev.organizer}
              </p>
              <div className="mt-2 flex items-center gap-3 text-xs text-purple-300/50">
                <span>📅 {ev.date}</span>
                <span>📍 {ev.location}</span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-purple-200/70">
                {ev.description}
              </p>
            </GlassCard>
          ))
        ) : (
          <GlassCard>
            <p className="text-center text-sm text-purple-300/40">
              No hay eventos programados para esta semana
            </p>
          </GlassCard>
        )}
      </SectionCard>

      <SectionCard title="Este Mes" icon="🗓️">
        {thisMonth.map((ev) => (
          <GlassCard key={ev.id}>
            <div className="mb-2 flex items-center justify-between">
              <span className="rounded-md bg-green-500/20 px-2 py-0.5 text-xs text-green-300">
                {eventTypeIcon[ev.type] || "📌"}{" "}
                {ev.type.charAt(0).toUpperCase() + ev.type.slice(1)}
              </span>
              <span
                className={`text-xs font-medium ${ev.price === 0 ? "text-green-400" : "text-amber-300"}`}
              >
                {ev.price === 0 ? "Gratuito" : `${ev.price / 100} €`}
              </span>
            </div>
            <h3 className="font-semibold text-white">{ev.title}</h3>
            <p className="mt-1 text-xs text-purple-300/60">
              por {ev.organizer}
            </p>
            <div className="mt-2 flex items-center gap-3 text-xs text-purple-300/50">
              <span>📅 {ev.date}</span>
              <span>📍 {ev.location}</span>
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-purple-200/70">
              {ev.description}
            </p>
          </GlassCard>
        ))}
      </SectionCard>

      <SectionCard title="Profesionales Cerca de Ti" icon="👤">
        {cities.slice(0, 6).map((city) => {
          const prosInCity = DEMO_PROFESSIONALS.filter(
            (p) => p.city === city
          ).slice(0, 3)
          if (prosInCity.length === 0) return null
          return (
            <div key={city}>
              <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-purple-200">
                📍 {city}
              </h4>
              <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {prosInCity.map((pro) => (
                  <Link
                    key={pro.id}
                    href={`/professionals/${pro.id}`}
                    className="rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/[0.07]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-amber-500 text-sm font-bold text-white">
                        {pro.name[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">
                          {pro.name}
                        </p>
                        <p className="truncate text-xs text-purple-300/60">
                          {pro.title}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </SectionCard>
    </div>
  )
}

function MaterialesView() {
  const sellers = DEMO_PROFESSIONALS.filter(
    (p) => p.category === "materiales"
  )

  function typeIcon(specialty: string) {
    const lower = specialty.toLowerCase()
    if (lower.includes("cuenco") || lower.includes("sonido") || lower.includes("gong"))
      return "🔔"
    if (lower.includes("cristal") || lower.includes("piedra") || lower.includes("mineral") || lower.includes("gemo"))
      return "💎"
    if (lower.includes("incienso") || lower.includes("vela") || lower.includes("sahumerio") || lower.includes("aceite"))
      return "🕯️"
    if (lower.includes("mandala") || lower.includes("arte") || lower.includes("yantra"))
      return "🎨"
    if (lower.includes("hierba") || lower.includes("herbolaria") || lower.includes("resina") || lower.includes("botánica"))
      return "🌿"
    if (lower.includes("libro") || lower.includes("librería") || lower.includes("libreria"))
      return "📚"
    return "✨"
  }

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <Link
          href="/explore"
          className="mb-4 inline-block text-sm text-purple-300/60 hover:text-purple-200"
        >
          &larr; Todas las categorías
        </Link>
        <h1 className="text-3xl font-bold text-white">
          💎 Materiales Espirituales
        </h1>
        <p className="mt-2 text-purple-200/60">
          Cristales, cuencos, inciensos, velas, libros, herbolaria y todo lo
          necesario para tu práctica y tu altar espiritual
        </p>
      </div>

      <SectionCard title="Tiendas y Artesanos" icon="🏪">
        {sellers.map((pro) => {
          const firstSpecialty = pro.specialties[0] || ""
          const icon = typeIcon(firstSpecialty)
          return (
            <GlassCard key={pro.id}>
              <div className="flex items-start gap-3">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500/30 to-amber-500/10 text-2xl shadow-lg">
                  {icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-white">{pro.name}</h3>
                  <p className="text-sm text-purple-300/80">{pro.title}</p>
                  <p className="mt-1 text-xs text-purple-300/50">{pro.city}</p>
                </div>
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-purple-200/70">
                {pro.bio}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {pro.specialties.slice(0, 4).map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-yellow-500/15 px-2.5 py-0.5 text-xs text-yellow-300"
                  >
                    {typeIcon(s)} {s}
                  </span>
                ))}
              </div>
            </GlassCard>
          )
        })}
      </SectionCard>
    </div>
  )
}
