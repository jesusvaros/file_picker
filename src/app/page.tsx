import Link from 'next/link';

export default function Home() {
  return (
    <main className="p-6">
      <Link href="/finder" className="underline">Go to File Finder</Link>
    </main>
  );
}
