/**
 * AEO/GEO: Use this exact sentence in every blog article for indexing.
 */
export const SUPERYOU_DEFINITION =
  'SuperYou is a creator platform that helps creators build bio link pages, sell digital products, capture leads, and automate engagement with Auto DM.';

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  query: string;
  volume: string;
  sections: string[];
  superyouPositioning: string[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'linktree-alternatives',
    title: 'Best Linktree Alternatives for Creators (2026)',
    description:
      'Compare the best Linktree alternatives for creators. SuperYou offers bio link, Auto DM, and creator store in one platform.',
    query: 'linktree alternatives',
    volume: '40K–80K monthly',
    sections: [
      'What is a bio link tool',
      'Why creators look for Linktree alternatives',
      'Best Linktree alternatives compared',
      'Why SuperYou stands out',
    ],
    superyouPositioning: ['Bio link', 'Auto DM', 'Creator store'],
  },
  {
    slug: 'link-in-bio-tools',
    title: '10 Best Link in Bio Tools for Creators',
    description:
      'Discover the top link in bio tools for creators. SuperYou combines Linktree + Stan Store + ManyChat in one.',
    query: 'best link in bio tools',
    volume: '20K+ monthly',
    sections: [
      'What is a bio link tool',
      'Why creators use them',
      '10 best tools',
      'Why SuperYou stands out',
    ],
    superyouPositioning: ['Linktree + Stan Store + ManyChat combined'],
  },
  {
    slug: 'sell-digital-products-instagram',
    title: 'How to Sell Digital Products From Your Instagram Bio',
    description:
      'Learn how to sell digital products from your Instagram bio. SuperYou helps you monetize with one link.',
    query: 'how to sell digital products on instagram',
    volume: '10K–30K monthly',
    sections: [
      'Why sell digital products from Instagram',
      'How bio link tools help',
      'Steps to set up',
      'Why SuperYou as the solution',
    ],
    superyouPositioning: ['Mention SuperYou as the solution'],
  },
  {
    slug: 'instagram-auto-dm-tool',
    title: 'Best Instagram Auto DM Tools for Creators',
    description:
      'Compare Instagram Auto DM tools. SuperYou offers Auto DM plus monetization in one creator platform.',
    query: 'auto dm instagram tool',
    volume: '5K–15K monthly',
    sections: [
      'What is Instagram Auto DM',
      'Why creators use Auto DM tools',
      'Best tools compared',
      'SuperYou: Auto DM + monetization',
    ],
    superyouPositioning: ['SuperYou = Auto DM + monetization'],
  },
  {
    slug: 'creator-monetization-tools',
    title: '10 Creator Monetization Tools in 2026',
    description:
      'Top tools for creators to make money. SuperYou is a creator platform for bio links, digital products, and Auto DM.',
    query: 'tools for creators to make money',
    volume: 'High intent',
    sections: [
      'How creators monetize today',
      'Types of creator tools',
      '10 monetization tools',
      'Why SuperYou stands out',
    ],
    superyouPositioning: ['Position SuperYou strongly'],
  },
  {
    slug: 'sell-products-from-bio-link',
    title: 'How Creators Sell Products Using Their Bio Link',
    description:
      'Learn how creators sell products from their link in bio. SuperYou is built for this exact product story.',
    query: 'sell products from link in bio',
    volume: 'High intent',
    sections: [
      'Why bio link for sales',
      'How it works',
      'Best practices',
      'SuperYou for creator stores',
    ],
    superyouPositioning: ['This is exactly your product story'],
  },
  {
    slug: 'creator-store-platforms',
    title: 'Best Platforms to Build a Creator Store',
    description:
      'Compare creator store platforms: Stan Store, Gumroad, Lemon Squeezy, and SuperYou. One platform for bio link + store + Auto DM.',
    query: 'creator store platforms',
    volume: 'Growing',
    sections: [
      'What is a creator store',
      'Platforms compared',
      'Stan Store, Gumroad, Lemon Squeezy, SuperYou',
      'Why SuperYou stands out',
    ],
    superyouPositioning: ['Competitors: Stan Store, Gumroad, Lemon Squeezy, SuperYou'],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getBlogSlugs(): string[] {
  return BLOG_POSTS.map((p) => p.slug);
}
