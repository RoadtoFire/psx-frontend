// Fixed ambient blobs + grid overlay shared by the app shell and auth pages.
export default function AmbientBackground() {
  return (
    <>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500 rounded-full filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute bottom-0 left-64 w-[500px] h-[500px] bg-teal-400 rounded-full filter blur-3xl opacity-15 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-emerald-600 rounded-full filter blur-3xl opacity-10 animate-blob animation-delay-4000" />
      </div>
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />
    </>
  )
}
