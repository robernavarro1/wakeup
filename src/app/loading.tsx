export default function Loading() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="text-center" role="status" aria-live="polite">
        <span className="inline-flex gap-1.5 text-2xl text-purple-400">
          <span className="animate-bounce">●</span>
          <span className="animate-bounce" style={{ animationDelay: "0.15s" }}>
            ●
          </span>
          <span className="animate-bounce" style={{ animationDelay: "0.3s" }}>
            ●
          </span>
        </span>
        <p className="mt-4 text-sm text-purple-300/50">Cargando...</p>
      </div>
    </div>
  )
}
