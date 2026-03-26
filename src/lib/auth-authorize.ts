// src/lib/auth-authorize.ts
import bcrypt from 'bcryptjs';
import { connectDB } from './db';
import { Admin, User } from '@/models';

export async function authorizeUser(credentials: any) {
  if (!credentials?.email || !credentials?.password) return null;

  await connectDB();

  const email = (credentials.email as string).toLowerCase().trim();
  const password = credentials.password as string;

  // Check Admin first
  const admin = await Admin.findOne({ email }).lean();
  if (admin) {
    const valid = await bcrypt.compare(password, (admin as any).passwordHash);
    if (!valid) return null;

    await Admin.findByIdAndUpdate((admin as any)._id, {
      lastLogin: new Date(),
    });

    return {
      id: (admin as any)._id.toString(),
      email: (admin as any).email,
      name: (admin as any).name,
      role: (admin as any).role,
      accountType: 'admin',
    };
  }

  // Check regular User
  const user = await User.findOne({ email, isActive: true }).lean();
  if (user && (user as any).passwordHash) {
    const valid = await bcrypt.compare(password, (user as any).passwordHash);
    if (!valid) return null;

    return {
      id: (user as any)._id.toString(),
      email: (user as any).email,
      name: `${(user as any).name} ${(user as any).surname}`.trim(),
      role: (user as any).role,
      accountType: 'user',
    };
  }

  return null;
}
