"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#030712] text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-[460px] flex-col items-center justify-center px-6 py-12 text-center">
        <div className="mb-8">
          <Image
            src="/img/404-bot.png"
            alt="404 mascot"
            width={420}
            height={420}
            priority
            className="h-auto w-full max-w-[320px]"
          />
        </div>

        <h1 className="text-[88px] font-extrabold leading-none tracking-tight text-white">404</h1>
        <h2 className="mt-3 text-[56px] font-semibold leading-[1.05] tracking-tight text-white">
          Page Not Found
        </h2>
        <p className="mt-5 max-w-[360px] text-lg leading-relaxed text-white/55">
          Looks like this page wandered off. Let&apos;s get you back on track.
        </p>

        <div className="mt-10 flex w-full max-w-[360px] flex-col gap-4">
          <Link
            href="/"
            className="inline-flex h-14 w-full items-center justify-center rounded-2xl bg-white text-2xl font-semibold text-[#121826] transition hover:bg-white/90"
          >
            Go to Home
          </Link>
          <button
            type="button"
            onClick={() => router.refresh()}
            className="inline-flex h-14 w-full items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-2xl font-semibold text-white/85 transition hover:bg-white/10"
          >
            Try Again
          </button>
        </div>
      </section>
    </main>
  );
}
