'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Category, User, PromoCode, Banner, Payment, Subscription, Plan, Admin, Download, Template } from '@/models'
import { slugify, generateCode } from '@/lib/utils'
import bcrypt from 'bcryptjs'

async function requireAdmin() {
  const session = await auth()
  const role = (session?.user as any)?.role
  if (!['admin', 'super_admin'].includes(role)) throw new Error('Unauthorized')
  return session!
}

async function requireSuperAdmin() {
  const session = await auth()
  if ((session?.user as any)?.role !== 'super_admin') throw new Error('Forbidden')
  return session!
}

// ── Categories ────────────────────────────────────────────────────────────────
export async function getCategories(q?: string) {
  await connectDB()
  const filter: Record<string, unknown> = {}
  if (q) filter.name = { $regex: q, $options: 'i' }
  const cats = await Category.find(filter).sort({ order: 1 }).lean()
  return JSON.parse(JSON.stringify(cats))
}

export async function createCategory(data: { name: string; description?: string; icon?: string; order?: number }) {
  await requireAdmin()
  await connectDB()
  await Category.create({ ...data, slug: slugify(data.name) })
  revalidatePath('/dashboard/categories')
  return { success: true }
}

export async function updateCategory(id: string, data: { name?: string; description?: string; icon?: string; order?: number; isActive?: boolean }) {
  await requireAdmin()
  await connectDB()
  const update = data.name ? { ...data, slug: slugify(data.name) } : data
  await Category.findByIdAndUpdate(id, update)
  revalidatePath('/dashboard/categories')
  return { success: true }
}

export async function deleteCategory(id: string) {
  await requireAdmin()
  await connectDB()
  await Category.findByIdAndDelete(id)
  revalidatePath('/dashboard/categories')
  return { success: true }
}

// ── Users ─────────────────────────────────────────────────────────────────────
export async function getUsers(params: { q?: string; status?: string; page?: number; pageSize?: number }) {
  await requireAdmin()
  await connectDB()
  const { q, status, page = 1, pageSize = 20 } = params
  const filter: Record<string, unknown> = {}
  if (q) filter.$or = [
    { name:    { $regex: q, $options: 'i' } },
    { surname: { $regex: q, $options: 'i' } },
    { email:   { $regex: q, $options: 'i' } },
  ]
  if (status === 'active')    filter.isActive = true
  if (status === 'suspended') filter.isActive = false

  const [data, total] = await Promise.all([
    User.find(filter).select('-passwordHash')
      .populate({ path: 'subscription', populate: { path: 'plan', select: 'name type interval priceUSD' } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize).limit(pageSize).lean(),
    User.countDocuments(filter),
  ])
  return { data: JSON.parse(JSON.stringify(data)), total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}

export async function updateUser(id: string, data: { isActive?: boolean; country?: string; phone?: string }) {
  await requireAdmin()
  await connectDB()
  await User.findByIdAndUpdate(id, data)
  revalidatePath('/dashboard/users')
  return { success: true }
}

export async function getUserDetail(id: string) {
  await requireAdmin()
  await connectDB()
  const user = await User.findById(id).select('-passwordHash')
    .populate({ path: 'subscription', populate: { path: 'plan', select: 'name type interval priceUSD priceZWL' } })
    .lean()
  return user ? JSON.parse(JSON.stringify(user)) : null
}

// ── Promo Codes ───────────────────────────────────────────────────────────────
export async function getPromoCodes(page = 1, pageSize = 20) {
  await requireAdmin()
  await connectDB()
  const [data, total] = await Promise.all([
    PromoCode.find().sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize).lean(),
    PromoCode.countDocuments(),
  ])
  return { data: JSON.parse(JSON.stringify(data)), total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}

export async function createPromoCode(data: { code?: string; discountType: string; discountValue: number; usageLimit?: number; expiresAt?: string }) {
  await requireAdmin()
  await connectDB()
  await PromoCode.create({ ...data, code: data.code || generateCode() })
  revalidatePath('/dashboard/promo-codes')
  return { success: true }
}

export async function togglePromoCode(id: string, isActive: boolean) {
  await requireAdmin()
  await connectDB()
  await PromoCode.findByIdAndUpdate(id, { isActive })
  revalidatePath('/dashboard/promo-codes')
  return { success: true }
}

export async function deletePromoCode(id: string) {
  await requireAdmin()
  await connectDB()
  await PromoCode.findByIdAndDelete(id)
  revalidatePath('/dashboard/promo-codes')
  return { success: true }
}

// ── Banners ───────────────────────────────────────────────────────────────────
export async function getBanners() {
  await connectDB()
  const banners = await Banner.find().sort({ order: 1 }).lean()
  return JSON.parse(JSON.stringify(banners))
}

export async function createBanner(data: { title: string; subtitle?: string; imageUrl: string; linkUrl?: string; order?: number; startsAt?: string; endsAt?: string }) {
  await requireAdmin()
  await connectDB()
  await Banner.create({ ...data, isActive: true })
  revalidatePath('/dashboard/banners')
  return { success: true }
}

export async function updateBanner(id: string, data: Partial<{ title: string; subtitle: string; imageUrl: string; linkUrl: string; isActive: boolean; order: number; startsAt: string; endsAt: string }>) {
  await requireAdmin()
  await connectDB()
  await Banner.findByIdAndUpdate(id, data)
  revalidatePath('/dashboard/banners')
  return { success: true }
}

export async function deleteBanner(id: string) {
  await requireAdmin()
  await connectDB()
  await Banner.findByIdAndDelete(id)
  revalidatePath('/dashboard/banners')
  return { success: true }
}

// ── Payments ──────────────────────────────────────────────────────────────────
export async function getPayments(params: { status?: string; provider?: string; page?: number; pageSize?: number }) {
  await requireAdmin()
  await connectDB()
  const { status, provider, page = 1, pageSize = 20 } = params
  const filter: Record<string, unknown> = {}
  if (status)   filter.status   = status
  if (provider) filter.provider = provider
  const [data, total] = await Promise.all([
    Payment.find(filter).populate('user', 'name surname email').sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize).lean(),
    Payment.countDocuments(filter),
  ])
  return { data: JSON.parse(JSON.stringify(data)), total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}

// ── Subscriptions ─────────────────────────────────────────────────────────────
export async function getSubscriptions(params: { status?: string; page?: number; pageSize?: number }) {
  await requireAdmin()
  await connectDB()
  const { status, page = 1, pageSize = 20 } = params
  const filter: Record<string, unknown> = {}
  if (status) filter.status = status
  const [data, total] = await Promise.all([
    Subscription.find(filter)
      .populate('user', 'name surname email')
      .populate('plan', 'name type interval priceUSD')
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize).limit(pageSize).lean(),
    Subscription.countDocuments(filter),
  ])
  return { data: JSON.parse(JSON.stringify(data)), total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}

export async function getPlans() {
  await connectDB()
  const plans = await Plan.find().sort({ priceUSD: 1 }).lean()
  return JSON.parse(JSON.stringify(plans))
}

export async function updatePlan(id: string, data: { priceUSD?: number; priceZWL?: number; isActive?: boolean; stripePriceId?: string; maxDownloadsPerMonth?: number | null; features?: string[] }) {
  await requireAdmin()
  await connectDB()
  await Plan.findByIdAndUpdate(id, data)
  revalidatePath('/dashboard/subscriptions')
  return { success: true }
}

export async function overrideSubscriptionStatus(id: string, status: string) {
  await requireAdmin()
  await connectDB()
  await Subscription.findByIdAndUpdate(id, { status })
  revalidatePath('/dashboard/subscriptions')
  return { success: true }
}

// ── Admin Users ───────────────────────────────────────────────────────────────
export async function getAdminUsers() {
  await requireSuperAdmin()
  await connectDB()
  const admins = await Admin.find().select('-passwordHash').lean()
  return JSON.parse(JSON.stringify(admins))
}

export async function createAdminUser(data: { name: string; email: string; password: string; role: string }) {
  await requireSuperAdmin()
  await connectDB()
  const exists = await Admin.findOne({ email: data.email })
  if (exists) throw new Error('Email already in use')
  const passwordHash = await bcrypt.hash(data.password, 12)
  await Admin.create({ name: data.name, email: data.email, role: data.role, passwordHash })
  revalidatePath('/dashboard/user-admin')
  return { success: true }
}

export async function deleteAdminUser(id: string) {
  await requireSuperAdmin()
  await connectDB()
  await Admin.findByIdAndDelete(id)
  revalidatePath('/dashboard/user-admin')
  return { success: true }
}

// ── Dashboard stats ───────────────────────────────────────────────────────────
export async function getDashboardStats() {
  await connectDB()
  const now = new Date()
  const som = new Date(now.getFullYear(), now.getMonth(), 1)
  const sol = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const eol = new Date(now.getFullYear(), now.getMonth(), 0)

  const [totalUsers, totalTemplates, activeSubs, totalDl,
    usersNow, usersLast, dlNow, dlLast, trend] = await Promise.all([
    User.countDocuments(),
    Template.countDocuments({ status: 'published' }),
    Subscription.countDocuments({ status: 'active' }),
    Download.countDocuments(),
    User.countDocuments({ createdAt: { $gte: som } }),
    User.countDocuments({ createdAt: { $gte: sol, $lte: eol } }),
    Download.countDocuments({ downloadedAt: { $gte: som } }),
    Download.countDocuments({ downloadedAt: { $gte: sol, $lte: eol } }),
    Download.aggregate([
      { $match: { downloadedAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) } } },
      { $group: { _id: { y: { $year: '$downloadedAt' }, m: { $month: '$downloadedAt' } }, n: { $sum: 1 } } },
      { $sort: { '_id.y': 1, '_id.m': 1 } },
    ]),
  ])

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return {
    stats: {
      totalUsers, totalTemplates, activeSubs, totalDl,
      userGrowth: usersLast > 0 ? Math.round(((usersNow - usersLast) / usersLast) * 100) : 0,
      dlGrowth:   dlLast   > 0 ? Math.round(((dlNow   - dlLast)   / dlLast)   * 100) : 0,
    },
    trend: trend.map((d: any) => ({ label: months[d._id.m - 1], value: d.n })),
  }
}

// ── Account (self) ────────────────────────────────────────────────────────────
export async function updateAccount(data: { name?: string; surname?: string; country?: string; phone?: string }) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')
  await connectDB()
  const id = (session.user as any).id

  const admin = await Admin.findById(id)
  if (admin) {
    const fullName = [data.name, data.surname].filter(Boolean).join(' ')
    await Admin.findByIdAndUpdate(id, { name: fullName })
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/account')
    return { success: true, name: fullName, email: (session.user as any).email }
  } else {
    await User.findByIdAndUpdate(id, data)
    const fullName = [data.name, data.surname].filter(Boolean).join(' ')
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/account')
    return { success: true, name: fullName, email: (session.user as any).email }
  }
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')
  await connectDB()
  const id = (session.user as any).id

  const admin = await Admin.findById(id)
  const target = admin ?? await User.findById(id)
  if (!target) throw new Error('User not found')

  const valid = await bcrypt.compare(currentPassword, target.passwordHash)
  if (!valid) throw new Error('Incorrect current password')

  const hash = await bcrypt.hash(newPassword, 12)
  if (admin) {
    await Admin.findByIdAndUpdate(id, { passwordHash: hash })
  } else {
    await User.findByIdAndUpdate(id, { passwordHash: hash })
  }
  return { success: true }
}

// ── Admin: Create User ────────────────────────────────────────────────────────
export async function createUser(data: { name:string; surname:string; email:string; password:string; country?:string; phone?:string }) {
  await requireAdmin()
  await connectDB()
  const exists = await User.findOne({ email: data.email.toLowerCase().trim() })
  if (exists) throw new Error('Email already in use')
  const passwordHash = await bcrypt.hash(data.password, 12)
  await User.create({ ...data, email:data.email.toLowerCase().trim(), passwordHash, role:'free' })
  revalidatePath('/dashboard/users')
  return { success:true }
}

// ── Admin: Delete User ────────────────────────────────────────────────────────
export async function deleteUser(id: string) {
  await requireAdmin()
  await connectDB()
  await User.findByIdAndDelete(id)
  revalidatePath('/dashboard/users')
  return { success:true }
}

// ── Admin: Full user update (name, email, country, phone, role) ───────────────
export async function adminUpdateUser(id: string, data: { name?:string; surname?:string; email?:string; country?:string; phone?:string; isActive?:boolean }) {
  await requireAdmin()
  await connectDB()
  await User.findByIdAndUpdate(id, data)
  revalidatePath('/dashboard/users')
  return { success:true }
}

// ── Create subscription manually ─────────────────────────────────────────────
export async function createSubscription(data: { userId:string; planId:string; paymentProvider:string; priceAtPurchase:number; currency:string }) {
  await requireAdmin()
  await connectDB()
  const now = new Date()
  const end = new Date(now.getFullYear(), now.getMonth()+1, now.getDate())
  const sub = await Subscription.create({
    user: data.userId, plan: data.planId, status:'active',
    paymentProvider: data.paymentProvider,
    priceAtPurchase: data.priceAtPurchase, currency: data.currency,
    currentPeriodStart: now, currentPeriodEnd: end,
  })
  await User.findByIdAndUpdate(data.userId, { subscription:sub._id, role:'subscriber' })
  revalidatePath('/dashboard/subscriptions')
  revalidatePath('/dashboard/users')
  return { success:true }
}

// ── Update admin user role ────────────────────────────────────────────────────
export async function updateAdminUser(id: string, data: { name?:string; role?:string }) {
  await requireSuperAdmin()
  await connectDB()
  await Admin.findByIdAndUpdate(id, data)
  revalidatePath('/dashboard/user-admin')
  return { success:true }
}

// ── User: Toggle favourite ────────────────────────────────────────────────────
export async function toggleFavourite(templateId: string) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')
  await connectDB()
  const userId = (session.user as any).id
  const user = await User.findById(userId).select('favourites').lean()
  if (!user) throw new Error('User not found')
  const favs = (user as any).favourites?.map((f: any) => f.toString()) ?? []
  if (favs.includes(templateId)) {
    await User.findByIdAndUpdate(userId, { $pull: { favourites: templateId } })
  } else {
    await User.findByIdAndUpdate(userId, { $addToSet: { favourites: templateId } })
  }
  revalidatePath('/dashboard/favourites')
  return { success: true }
}

// ── Plan CRUD (super_admin only) ──────────────────────────────────────────────
export async function createPlan(data: {
  name: string; type: string; interval: string
  priceUSD: number; priceZWL: number; features: string[]
  maxUsers: number; maxDownloadsPerMonth: number | null
  stripePriceId?: string
}) {
  await requireSuperAdmin()
  await connectDB()
  await Plan.create({ ...data, isActive: true })
  revalidatePath('/dashboard/subscriptions')
  return { success: true }
}

export async function deletePlan(id: string) {
  await requireSuperAdmin()
  await connectDB()
  const subs = await Subscription.countDocuments({ plan: id, status: 'active' })
  if (subs > 0) throw new Error(`Cannot delete — ${subs} active subscription(s) use this plan`)
  await Plan.findByIdAndDelete(id)
  revalidatePath('/dashboard/subscriptions')
  return { success: true }
}

export async function togglePlanActive(id: string, isActive: boolean) {
  await requireSuperAdmin()
  await connectDB()
  await Plan.findByIdAndUpdate(id, { isActive })
  revalidatePath('/dashboard/subscriptions')
  return { success: true }
}

// ── Delete a download record ──────────────────────────────────────────────────
export async function deleteDownload(downloadId: string) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')
  await connectDB()
  const userId = (session.user as any).id
  // Only allow deleting own downloads
  const dl = await Download.findOne({ _id: downloadId, user: userId })
  if (!dl) throw new Error('Download not found')
  await Download.findByIdAndDelete(downloadId)
  // Recalculate user total downloads
  const count = await Download.countDocuments({ user: userId })
  await User.findByIdAndUpdate(userId, { totalDownloads: count })
  revalidatePath('/dashboard/my-downloads')
  return { success: true }
}

// ── Remove a favourite ────────────────────────────────────────────────────────
export async function removeFavourite(templateId: string) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')
  await connectDB()
  const userId = (session.user as any).id
  await User.findByIdAndUpdate(userId, { $pull: { favourites: templateId } })
  revalidatePath('/dashboard/favourites')
  return { success: true }
}
