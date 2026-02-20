export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          You&apos;re Offline
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Please check your internet connection and try again.
        </p>
      </div>
    </div>
  );
}
