/**
 * Prisma removed. System logging is handled by SuperYou BE.
 */

export interface SystemLogProps {
  event: string;
  userId: string;
  entityId?: string;
  entityType?: string;
  description?: string;
  ipAddress?: string;
  meta?: string;
}

export async function systemLog(_props: SystemLogProps): Promise<void> {
  // No-op; use BE for logging when needed.
}
