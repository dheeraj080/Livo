import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <h2 className="text-2xl font-semibold text-gray-800">Page Not Found</h2>
      <p className="mt-2 text-sm text-gray-600">Could not find the requested resource.</p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
      >
        Return to livo
      </Link>
    </div>
  );
}
