import Link from 'next/link';

export default function Home() {
  return (
    <main className="p-6">
      <Link href="/drive" className="underline">Ir al File Picker</Link>
    </main>
  );
}
