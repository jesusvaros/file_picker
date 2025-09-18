import Link from "next/link";

export default function Home() {
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Welcome</h1>
      <div>
        <Link href="/finder" className="underline">
          Go to File Finder
        </Link>
      </div>
    </main>
  );
}
