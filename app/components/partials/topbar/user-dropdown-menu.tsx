import { ReactNode } from 'react';
import Link from 'next/link';
import { I18N_LANGUAGES, Language } from '@/i18n/config';
import {
  BetweenHorizontalStart,
  Coffee,
  CreditCard,
  FileText,
  Globe,
  Moon,
  Settings,
  Shield,
  User,
  UserCircle,
  Users,
  HelpCircle,
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { logout } from '@/lib/auth-api';
import { useTheme } from 'next-themes';
import { useLanguage } from '@/providers/i18n-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';

export function UserDropdownMenu({ trigger }: { trigger: ReactNode }) {
  const { data: session } = useSession();
  const { changeLanguage, language } = useLanguage();
  const { theme, setTheme } = useTheme();

  const handleLanguage = (lang: Language) => {
    changeLanguage(lang.code);
  };

  const handleThemeToggle = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  const handleSignOut = async () => {
    const token = session?.beeToken;
    if (token) {
      try {
        await logout(token);
      } catch {
        // continue to local signOut even if BE logout fails
      }
    }
    await signOut();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" side="bottom" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <img
              className="w-9 h-9 rounded-full border border-border"
              src={'/media/avatars/300-2.png'}
              alt="User avatar"
            />
            <div className="flex flex-col">
              <Link
                href="/account/home/get-started"
                className="text-sm text-mono hover:text-primary font-semibold"
              >
                {session?.user.name || ''}
              </Link>
              <Link
                href="mailto:c.fisher@gmail.com"
                className="text-xs text-muted-foreground hover:text-primary"
              >
                {session?.user.email || ''}
              </Link>
            </div>
          </div>
          <Badge variant="primary" appearance="light" size="sm">
            Pro
          </Badge>
        </div>

        <DropdownMenuSeparator />

        {/* Menu Items: only essential links */}
        <DropdownMenuItem asChild>
          <Link href="/account/home/user-profile" className="flex items-center gap-2">
            <User />
            My Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <a
            href="https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <FileText />
            Request Feature
          </a>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <a
            href="https://devs.keenthemes.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <HelpCircle />
            Help & Support
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <div className="p-2 mt-1">
          <Button variant="outline" size="sm" className="w-full" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
