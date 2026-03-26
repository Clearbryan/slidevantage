import { Types } from 'mongoose'

export type Role = 'super_admin' | 'admin' | 'subscriber' | 'free'
export type TemplateStatus = 'draft' | 'published' | 'archived'
export type TemplateFormat = 'powerpoint' | 'google_slides' | 'keynote' | 'canva'
export type TemplateTier = 'free' | 'premium'
export type SubStatus = 'active' | 'cancelled' | 'expired' | 'trialing'
export type PaymentProvider = 'stripe' | 'ecocash'
export type PlanInterval = 'monthly' | 'annual'
export type PlanType = 'individual' | 'team_10' | 'team_20'
export type DiscountType = 'percentage' | 'fixed'

export interface IAdmin {
  _id: Types.ObjectId
  name: string
  email: string
  passwordHash: string
  role: 'admin' | 'super_admin'
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

export interface IUser {
  _id: Types.ObjectId
  name: string
  surname: string
  email: string
  passwordHash?: string
  googleId?: string
  role: 'subscriber' | 'free'
  country?: string
  phone?: string
  avatarUrl?: string
  subscription?: Types.ObjectId
  teamAccount?: Types.ObjectId
  favourites: Types.ObjectId[]
  recentlyViewed: Types.ObjectId[]
  totalDownloads: number
  isActive: boolean
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ICategory {
  _id: Types.ObjectId
  name: string
  slug: string
  description?: string
  icon?: string
  order: number
  templateCount: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ITemplate {
  _id: Types.ObjectId
  title: string
  description: string
  category: Types.ObjectId | ICategory
  format: TemplateFormat[]
  tier: TemplateTier
  tags: string[]
  thumbnailUrl: string
  fileUrls: Record<string, string>
  previewImages: string[]
  downloadCount: number
  viewCount: number
  isFeatured: boolean
  status: TemplateStatus
  slideCount?: number
  createdAt: Date
  updatedAt: Date
}

export interface IPlan {
  _id: Types.ObjectId
  name: string
  type: PlanType
  interval: PlanInterval
  priceUSD: number
  priceZWL: number
  features: string[]
  maxUsers: number
  maxDownloadsPerMonth: number | null
  isActive: boolean
  stripePriceId?: string
  createdAt: Date
  updatedAt: Date
}

export interface ISubscription {
  _id: Types.ObjectId
  user?: Types.ObjectId
  teamAccount?: Types.ObjectId
  plan: Types.ObjectId | IPlan
  status: SubStatus
  paymentProvider: PaymentProvider
  priceAtPurchase: number
  currency: string
  promoCode?: Types.ObjectId
  discountApplied?: number
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelledAt?: Date
  stripeSubscriptionId?: string
  createdAt: Date
  updatedAt: Date
}

export interface IPromoCode {
  _id: Types.ObjectId
  code: string
  discountType: DiscountType
  discountValue: number
  applicablePlans: Types.ObjectId[]
  usageLimit: number | null
  usedCount: number
  expiresAt?: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface IBanner {
  _id: Types.ObjectId
  title: string
  subtitle?: string
  imageUrl: string
  linkUrl?: string
  isActive: boolean
  order: number
  startsAt?: Date
  endsAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface IDownload {
  _id: Types.ObjectId
  user: Types.ObjectId
  template: Types.ObjectId | ITemplate
  downloadedAt: Date
}

export interface IPayment {
  _id: Types.ObjectId
  user: Types.ObjectId
  subscription?: Types.ObjectId
  amount: number
  currency: string
  provider: PaymentProvider
  status: 'succeeded' | 'failed' | 'refunded' | 'pending'
  description?: string
  stripePaymentId?: string
  createdAt: Date
}

export interface ITeamAccount {
  _id: Types.ObjectId
  name: string
  owner: Types.ObjectId
  members: Types.ObjectId[]
  maxMembers: number
  subscription?: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

// Session user type
export interface SessionUser {
  id: string
  email: string
  name: string
  role: Role
  accountType: 'admin' | 'user'
}

// Paginated response
export interface Paginated<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
