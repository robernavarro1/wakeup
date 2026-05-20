"use client"

import { useState } from "react"
import { UserProfileForm } from "./UserProfileForm"
import { ProfileForm } from "./ProfileForm"

interface UserProfileData {
  id: string
  interests: string
  disciplines: string
  level: string
  bio: string | null
  goals: string | null
}

interface ProfileData {
  id: string
  title: string | null
  bio: string | null
  phone: string | null
  city: string | null
  pricePerSession: number
  specialties: string
  published: boolean
  services: Service[]
  availabilities: Availability[]
}

interface Service {
  id?: string
  name: string
  description: string | null
  durationMinutes: number
  price: number
}

interface Availability {
  id?: string
  dayOfWeek: number
  startTime: string
  endTime: string
}

export function ProfileTabs({
  userProfile,
  professionalProfile,
  userId,
}: {
  userProfile: UserProfileData | null
  professionalProfile: ProfileData | null
  userId: string
}) {
  const [tab, setTab] = useState<"user" | "professional">("user")

  const tabs = [
    { key: "user" as const, label: "👤 Mi perfil", desc: "Tus intereses y nivel" },
    { key: "professional" as const, label: "⭐ Perfil profesional", desc: "Tus servicios y horarios" },
  ]

  return (
    <div>
      {/* Tabs */}
      <div className="mt-6 flex gap-2 rounded-xl border border-white/10 bg-purple-950/40 p-1.5">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
              tab === t.key
                ? "bg-gradient-to-r from-purple-600/80 to-amber-600/80 text-white shadow-lg"
                : "text-purple-300/50 hover:text-purple-200"
            }`}
          >
            <div className="flex flex-col items-center gap-0.5">
              <span>{t.label}</span>
              <span className="text-[10px] opacity-60">{t.desc}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === "user" ? (
        <UserProfileForm profile={userProfile} />
      ) : (
        <ProfileForm profile={professionalProfile} userId={userId} />
      )}
    </div>
  )
}
