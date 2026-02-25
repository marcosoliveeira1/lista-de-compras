export function SkeletonList() {
  const widths = ['w-3/4', 'w-1/2', 'w-2/3', 'w-4/5', 'w-1/2'];

  return (
    <div className="max-w-md mx-auto flex flex-col min-h-[100dvh] bg-slate-50 relative pointer-events-none">

      {/* Header Skeleton */}
      <header className="sticky top-0 z-10 px-6 py-5 border-b border-slate-200/50 flex justify-between items-center bg-slate-50">
        <div className="flex items-center gap-3">
          {/* Box do Ícone */}
          <div className="bg-slate-200 w-10 h-10 rounded-xl animate-pulse" />
          <div className="space-y-2">
            {/* Título */}
            <div className="h-5 w-24 bg-slate-200 rounded-md animate-pulse" />
            {/* Subtítulo */}
            <div className="h-3 w-16 bg-slate-200 rounded-md animate-pulse" />
          </div>
        </div>
        {/* Spinner lateral skeleton */}
        <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
      </header>

      {/* Main content Skeleton */}
      <main className="flex-1 overflow-y-auto no-scrollbar px-4 pt-6 pb-32 space-y-3">
        {widths.map((width, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-slate-100"
          >
            <div className="flex items-center gap-4 flex-1">
              {/* Checkbox */}
              <div className="h-6 w-6 rounded-full bg-slate-200 animate-pulse shrink-0" />
              {/* Texto do Item */}
              <div className={`h-5 bg-slate-200 rounded-md animate-pulse ${width}`} />
            </div>
            {/* Ícone de Lixeira */}
            <div className="h-8 w-8 rounded-full bg-slate-100 animate-pulse shrink-0 ml-4" />
          </div>
        ))}
      </main>

      {/* AddItemForm Skeleton */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent pb-safe">
        <div className="max-w-md mx-auto bg-white p-2 rounded-full shadow-lg border border-slate-200 flex gap-2 items-center">
          {/* Input de texto */}
          <div className="flex-1 h-10 mx-4 bg-slate-100 rounded-lg animate-pulse" />
          {/* Botão de adicionar */}
          <div className="w-12 h-12 rounded-full bg-slate-200 animate-pulse shrink-0" />
        </div>
      </div>

    </div>
  );
}