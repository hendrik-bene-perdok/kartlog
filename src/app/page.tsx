"use client";
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="bg-white">
      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <a href="#" className="-m-1.5 p-1.5">
              <span className="sr-only">Kart-manager</span>
              <span className="text-xl font-bold text-indigo-600">Kart-manager</span>
            </a>
          </div>
          <div className="flex flex-1 justify-end">
            <Link href="/login" className="text-sm font-semibold leading-6 text-gray-900 border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-50">
              Log in <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Track Your Karting Parts & Sessions
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              The modern, minimalistic way to manage your kart garage. Keep track of part life, log sessions, and manage teams effortlessly.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/login"
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
