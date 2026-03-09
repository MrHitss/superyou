import { redirect } from 'next/navigation';

export default function OrbitPage() {
  // Redirect dashboard root to account dashboard (store-focused)
  redirect('/account/home/dashboard');
}
