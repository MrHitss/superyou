'use client';

const FRAMER_PROXY_PATH = '/api/framer-proxy';

export function FramerEmbed() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
  const src = `${basePath}${FRAMER_PROXY_PATH}`;

  return (
    <iframe
      src={src}
      title="SuperYou Bio – Link-in-bio, Auto DM & Digital Product Sales"
      className="fixed inset-0 h-full w-full border-0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}
