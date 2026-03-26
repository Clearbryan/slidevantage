import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User, Admin } from '@/models'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { token, email, password } = await req.json()
    if (!token || !email || !password)
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    if (password.length < 8)
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })

    await connectDB()

    const query = {
      email:             email.toLowerCase(),
      resetToken:        token,
      resetTokenExpires: { $gt: new Date() },
    }

    const user  = await User.findOne(query)
    const admin = !user ? await Admin.findOne(query) : null
    const account = user || admin

    if (!account) {
      return NextResponse.json({ error: 'Invalid or expired reset link. Please request a new one.' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const Model = user ? User : Admin
    await Model.findByIdAndUpdate((account as any)._id, {
      passwordHash,
      resetToken:        null,
      resetTokenExpires: null,
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[reset-password]', err.message)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
