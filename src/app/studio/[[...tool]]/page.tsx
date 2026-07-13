"use client";

import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";

export default function StudioPage() {
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    return (
      <div className="mx-auto max-w-2xl p-10 font-sans">
        <h1 className="text-2xl font-semibold">Sanity Studio belum dikonfigurasi</h1>
        <p className="mt-3 text-sm text-gray-600">
          Tetapkan{" "}
          <code className="rounded bg-gray-100 px-1 py-0.5">NEXT_PUBLIC_SANITY_PROJECT_ID</code>,{" "}
          <code className="rounded bg-gray-100 px-1 py-0.5">NEXT_PUBLIC_SANITY_DATASET</code>, dan{" "}
          <code className="rounded bg-gray-100 px-1 py-0.5">SANITY_API_TOKEN</code> dalam{" "}
          <code className="rounded bg-gray-100 px-1 py-0.5">.env.local</code>, kemudian mulakan semula pelayan.
        </p>
        <p className="mt-3 text-sm text-gray-600">
          Daftar Sanity di{" "}
          <a className="text-blue-600 underline" href="https://www.sanity.io/manage" target="_blank" rel="noreferrer">
            sanity.io/manage
          </a>{" "}
          untuk dapatkan ID & token.
        </p>
      </div>
    );
  }
  return <NextStudio config={config} />;
}
