import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-gray-50">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">Welcome to KSAA STEMCARE</h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl">
        Experience premium stem cell therapy and healthcare services.
        Book your appointment today and manage your health journey with ease.
      </p>
      <div className="flex gap-4">
        <Button asChild size="lg">
          <Link href="/login">Patient Login</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/signup">Create Account</Link>
        </Button>
      </div>
      <div className="mt-12">
        <Link href="/admin-login" className="text-sm text-gray-500 hover:text-blue-600">
          Staff & Admin Portal
        </Link>
      </div>
    </div>
  );
}
