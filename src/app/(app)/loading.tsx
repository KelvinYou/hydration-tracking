export default function AppLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 space-y-6 pb-24 md:pb-8">
      <div className="md:grid md:grid-cols-[1fr_340px] md:gap-8">
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-[200px] h-[200px] rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
            <div className="h-4 w-32 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="h-10 w-full bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
        <div className="hidden md:block space-y-4">
          <div className="h-24 w-full bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
          <div className="h-16 w-full bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
