'use server';

import { cookies } from 'next/headers';

export async function getAuthToken() {
  const cookieStore = await cookies(); // await add karein
  return cookieStore.get('token')?.value;
}

export async function setAuthToken(token: string) {
  const cookieStore = await cookies(); // await add karein
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/'
  });
}

export async function removeAuthToken() {
  const cookieStore = await cookies(); // await add karein
  cookieStore.delete('token');
}