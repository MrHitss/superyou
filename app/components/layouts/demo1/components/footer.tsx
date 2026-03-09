'use client';

import { Container } from '@/components/common/container';

const LINKEDIN_URL = 'https://www.linkedin.com/in/mr-hitss';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <Container>
        <div className="flex justify-center items-center py-5">
          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 font-normal text-sm text-muted-foreground text-center sm:text-left">
            <span>{currentYear} &copy; SuperYou Bio</span>
            <span className="hidden sm:inline">·</span>
            <span>
              Developed by{' '}
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary-foreground hover:text-primary"
              >
                Hitesh Varyani
              </a>
            </span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
