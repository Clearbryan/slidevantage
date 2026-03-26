import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User, Admin } from '@/models'
import crypto from 'crypto'

// In production replace this with your email provider (SendGrid, Resend, etc.)
async function sendResetEmail(email: string, resetUrl: string) {
  if (process.env.NODE_ENV === 'development') {
    console.log('\n=== PASSWORD RESET (dev mode) ===')
    console.log(`Email: ${email}`)
    console.log(`Reset URL: ${resetUrl}`)
    console.log('=================================\n')
  }
  // TODO: integrate your email provider here
  // e.g. await resend.emails.send({ to: email, subject: 'Reset your password', html: `<a href="${resetUrl}">Reset password</a>` })
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    await connectDB()

    // Find account (user or admin)
    const user  = await User.findOne({ email: email.toLowerCase() })
    const admin = !user ? await Admin.findOne({ email: email.toLowerCase() }) : null
    const account = user || admin

    // Always return success to avoid email enumeration
    if (!account) {
      return NextResponse.json({ success: true })
    }

    // Generate secure token (expires in 1 hour)
    const token   = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 60 * 60 * 1000)

    // Store token on the account
    const Model = user ? User : Admin
    await Model.findByIdAndUpdate((account as any)._id, {
      resetToken:        token,
      resetTokenExpires: expires,
    })

    const appUrl  = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const resetUrl = `${appUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`

    await sendResetEmail(email, resetUrl)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[forgot-password]', err.message)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
