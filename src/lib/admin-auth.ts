import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

export const ADMIN_COOKIE = 'yshyun_admin_session';

const secret = () => process.env.ADMIN_AUTH_SECRET || process.env.ADMIN_PASSWORD || '';

export const adminToken = () =>
  createHmac('sha256', secret()).update('yshyun-lab-admin').digest('hex');

export const isValidAdminPassword = (password: string) => {
  const expected = process.env.ADMIN_PASSWORD || '';
  if (!expected || password.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(password), Buffer.from(expected));
};

export const isAdminRequest = async () => {
  if (!secret()) return false;
  const value = (await cookies()).get(ADMIN_COOKIE)?.value || '';
  const expected = adminToken();
  if (value.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(value), Buffer.from(expected));
};
