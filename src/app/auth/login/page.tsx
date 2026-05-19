import { Suspense } from "react"
import { LoginForm } from "./LoginForm"

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-4xl opacity-50">☥</span>
          <h1 className="mt-4 text-2xl font-bold text-white">Bienvenido de vuelta</h1>
          <p className="mt-1 text-sm text-purple-300/50">
            Accede a tu espacio espiritual
          </p>
        </div>
        <Suspense fallback={<div className="text-purple-300/50 text-center">Cargando...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
