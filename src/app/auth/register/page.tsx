import { Suspense } from "react"
import { RegisterForm } from "./RegisterForm"

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-4xl opacity-50">🕉️</span>
          <h1 className="mt-4 text-2xl font-bold text-white">Crear cuenta</h1>
          <p className="mt-1 text-sm text-purple-300/50">
            Únete a la comunidad de despertar consciente
          </p>
        </div>
        <Suspense fallback={<div className="text-purple-300/50 text-center">Cargando...</div>}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  )
}
