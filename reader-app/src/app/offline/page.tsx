"use client";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="mb-6 text-6xl">📖</div>
      <h1 className="mb-3 text-2xl font-semibold text-foreground">
        You&apos;re offline
      </h1>
      <p className="max-w-md text-muted-foreground">
        It looks like you&apos;ve lost your internet connection. Previously
        loaded pages may still be available. Please check your connection and try
        again.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Try again
      </button>
    </div>
  );
}
