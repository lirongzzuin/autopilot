export default function DashboardLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
      {/* 헤더 스켈레톤 */}
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-xl w-48" />

      {/* 카드 스켈레톤 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
        ))}
      </div>

      {/* 차트 스켈레톤 */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
        <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
      </div>
    </div>
  );
}
