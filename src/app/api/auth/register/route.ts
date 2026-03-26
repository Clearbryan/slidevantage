import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db'
import { User } from '@/models'

export async function POST(req: NextRequest) {
  try {
    const { name, surname, email, password } = await req.json()

    if (!name?.trim() || !surname?.trim() || !email?.trim() || !password)
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })

    if (password.length < 8)
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRe.test(email))
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })

    await connectDB()

    const exists = await User.findOne({ email: email.toLowerCase().trim() })
    if (exists) return NextResponse.json({ error: 'Email already in use' }, { status: 409 })

    const passwordHash = await bcrypt.hash(password, 12)

    await User.create({
      name:    name.trim(),
      surname: surname.trim(),
      email:   email.toLowerCase().trim(),
      passwordHash,
      role:    'free',
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error('Register error:', err)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
