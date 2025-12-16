export function FindOneLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-sm">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-5 h-5 text-primary-foreground"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
          <path d="M11 8a3 3 0 0 0-3 3" />
        </svg>
      </div>
      <span className="text-xl font-bold text-black dark:text-black">
        Find<span className="text-primary">One</span>
      </span>
    </div>
  )
}
