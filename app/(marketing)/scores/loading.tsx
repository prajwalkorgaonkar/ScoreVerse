export default function ScoresLoading() {
  return (
    <div className="bg-arena-dark min-h-screen pt-24 sm:pt-32 pb-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto animate-pulse">
        <div className="text-center mb-10 sm:mb-16">
          <div className="h-8 w-40 rounded-full bg-arena-card mx-auto mb-6" />
          <div className="h-12 sm:h-16 max-w-md rounded-xl bg-arena-card mx-auto mb-4" />
          <div className="h-5 max-w-xl rounded-lg bg-arena-card mx-auto" />
        </div>

        <div className="h-14 max-w-2xl rounded-2xl bg-arena-card/60 mx-auto mb-12" />

        <div className="mb-16">
          <div className="h-8 w-48 rounded-lg bg-arena-card mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-64 rounded-2xl bg-arena-card/60 border border-arena-border" />
            ))}
          </div>
        </div>

        <div>
          <div className="h-8 w-48 rounded-lg bg-arena-card mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-64 rounded-2xl bg-arena-card/60 border border-arena-border" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
