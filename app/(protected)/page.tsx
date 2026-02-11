import { redirect } from 'next/navigation';

/** App home redirects to orbit (Store). */
export default function Page() {
  redirect('/orbit');
}
