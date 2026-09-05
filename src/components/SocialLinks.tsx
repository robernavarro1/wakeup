import Link from "next/link"

const socials = [
  {
    name: "Instagram",
    href: "https://instagram.com/eswakeup",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@eswakeup",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.83a8.28 8.28 0 004.8 1.54V6.92a4.83 4.83 0 01-1.04-.23z" />
      </svg>
    ),
  },
]

export function SocialBar() {
  return (
    <div className="fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3 lg:flex">
      {socials.map((s) => (
        <a
          key={s.name}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-purple-300/50 transition-all duration-300 hover:border-purple-500/40 hover:bg-purple-500/15 hover:text-purple-300 hover:scale-110 hover:shadow-lg hover:shadow-purple-500/10"
          title={s.name}
        >
          {s.icon}
        </a>
      ))}
    </div>
  )
}

export function SocialFooter() {
  return (
    <div className="flex items-center gap-4">
      {socials.map((s) => (
        <a
          key={s.name}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-300/40 transition-all duration-300 hover:text-purple-300 hover:scale-110"
          title={s.name}
        >
          {s.icon}
        </a>
      ))}
    </div>
  )
}
