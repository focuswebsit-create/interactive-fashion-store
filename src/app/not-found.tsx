import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-svh place-items-center px-6 text-center">
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">404</p>
        <h1 className="mt-2 text-lg font-medium">That piece isn&apos;t on the rack.</h1>
        <Link href="/" className="mt-6 inline-flex h-11 items-center rounded-full bg-neutral-950 px-6 text-sm font-medium text-white">
          Back to the rack
        </Link>
      </div>
    </main>
  );
}
