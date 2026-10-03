export default function Spinner({ label }: { label: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-16 text-muted">
      <span
        aria-hidden="true"
        className="size-6 animate-spin rounded-full border-4 border-line border-t-brand"
      />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
