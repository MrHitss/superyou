import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      avatar?: string | null;
      roleId?: string | null;
      roleName?: string | null;
      status: string;
      /** Username/handle for bio URL (e.g. superyou.bio/{profile_link}). */
      profile_link?: string | null;
    };
    /** BE token for logout API (session invalidation on backend). */
    beeToken?: string;
  }

  interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    roleId?: string | null;
    status: string;
    profile_link?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    roleId?: string | null;
    roleName?: string | null;
    status: string;
    profile_link?: string | null;
    /** BE token (from login/register or Google BE login); used for logout. */
    beeToken?: string;
  }
}
