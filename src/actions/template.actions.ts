'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Template, Category } from '@/models'
import { slugify } from '@/lib/utils'

async function requireAdmin() {
  const session = await auth()
  const role = (session?.user as any)?.role
  if (!['admin', 'super_admin'].includes(role)) throw new Error('Unauthorized')
  return session!
}

/** Accepts a comma-separated string OR an existing array — always returns a clean string[] */
function parseTags(input: string | string[] | undefined | null): string[] {
  if (!input) return []
  if (Array.isArray(input)) return input.map(t => t.trim()).filter(Boolean)
  return input.split(',').map(t => t.trim()).filter(Boolean)
}

export async function getTemplates(params: {
  q?: string; status?: string; tier?: string; category?: string;
  sort?: string; page?: number; pageSize?: number
}) {
  await connectDB()
  const { q, status, tier, category, sort = '-createdAt', page = 1, pageSize = 20 } = params

  const filter: Record<string, unknown> = {}
  if (q)        filter.$or = [{ title: { $regex: q, $options: 'i' } }, { tags: { $regex: q, $options: 'i' } }]
  if (status)   filter.status = status
  if (tier)     filter.tier = tier
  if (category) filter.category = category

  const [data, total] = await Promise.all([
    Template.find(filter).populate('category', 'name slug').sort(sort).skip((page - 1) * pageSize).limit(pageSize).lean(),
    Template.countDocuments(filter),
  ])

  return {
    data: JSON.parse(JSON.stringify(data)),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

export async function createTemplate(formData: {
  title: string; description: string; category: string; tier: string;
  status: string; format: string[]; tags: string; slideCount?: number;
  thumbnailUrl: string; fileUrls: Record<string, string>; isFeatured: boolean;
  previewImages?: string[]
}) {
  await requireAdmin()
  await connectDB()

  const template = await Template.create({
    ...formData,
    tags: parseTags(formData.tags),
    fileUrls: formData.fileUrls,
  })

  revalidatePath('/dashboard/templates')
  return { success: true, id: template._id.toString() }
}

export async function updateTemplate(id: string, data: Partial<{
  title: string; description: string; category: string; tier: string;
  status: string; format: string[]; tags: string; slideCount: number;
  thumbnailUrl: string; fileUrls: Record<string, string>; isFeatured: boolean;
  previewImages: string[]
}>) {
  await requireAdmin()
  await connectDB()

  const update = { ...data }
  if (data.tags !== undefined) {
    (update as any).tags = parseTags(data.tags as any)
  }

  await Template.findByIdAndUpdate(id, update, { new: true, runValidators: true })
  revalidatePath('/dashboard/templates')
  return { success: true }
}

export async function deleteTemplate(id: string) {
  await requireAdmin()
  await connectDB()
  await Template.findByIdAndDelete(id)
  revalidatePath('/dashboard/templates')
  return { success: true }
}

export async function toggleFeatured(id: string, featured: boolean) {
  await requireAdmin()
  await connectDB()
  await Template.findByIdAndUpdate(id, { isFeatured: featured })
  revalidatePath('/dashboard/templates')
  return { success: true }
}

export async function getTemplate(id: string) {
  await connectDB()
  const t = await Template.findById(id).populate('category', 'name slug').lean()
  return t ? JSON.parse(JSON.stringify(t)) : null
}
