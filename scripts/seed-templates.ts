/**
 * Seed demo templates and banners
 * Run: npm run seed:templates
 */
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config({ path: '.env.local' })

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/slidevantage'

// ── Minimal inline models ─────────────────────────────────────────────────────
const S = mongoose.Schema
const OID = S.Types.ObjectId

const CategorySchema = new S({ name:String, slug:String, icon:String, order:Number, isActive:{type:Boolean,default:true}, templateCount:{type:Number,default:0} })
const TemplateSchema = new S({
  title:String, description:String, category:{type:OID,ref:'Category'},
  format:[String], tier:{type:String,default:'free'}, tags:[String],
  thumbnailUrl:{type:String,default:''}, fileUrls:{type:Map,of:String,default:{}},
  previewImages:[String], downloadCount:{type:Number,default:0},
  viewCount:{type:Number,default:0}, isFeatured:{type:Boolean,default:false},
  status:{type:String,default:'published'}, slideCount:Number,
},{timestamps:true})
const BannerSchema = new S({
  title:String, subtitle:String, imageUrl:String, linkUrl:String,
  isActive:{type:Boolean,default:true}, order:Number,
},{timestamps:true})

function reg(name: string, schema: mongoose.Schema) {
  try { return mongoose.model(name) } catch { return mongoose.model(name, schema) }
}
const Category = reg('Category', CategorySchema)
const Template  = reg('Template', TemplateSchema)
const Banner    = reg('Banner', BannerSchema)

// ── Data ──────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { name:'Business',     slug:'business',     icon:'💼', order:1 },
  { name:'Finance',      slug:'finance',      icon:'📊', order:2 },
  { name:'Marketing',    slug:'marketing',    icon:'📣', order:3 },
  { name:'Sales',        slug:'sales',        icon:'🤝', order:4 },
  { name:'HR & People',  slug:'hr-people',    icon:'👥', order:5 },
  { name:'Product',      slug:'product',      icon:'🚀', order:6 },
]

const TEMPLATES = [
  {
    title:         'Corporate Annual Report 2025',
    description:   'A comprehensive annual report template covering financial performance, KPIs, quarterly breakdowns, and executive summaries. Perfect for stakeholder presentations and board meetings.',
    categorySlug:  'finance',
    format:        ['powerpoint'],
    tier:          'premium',
    tags:          ['annual report','finance','corporate','KPI','board'],
    file:          'annual_report_2025.pptx',
    slideCount:    4,
    isFeatured:    true,
    downloadCount: 847,
  },
  {
    title:         'Investor Pitch Deck',
    description:   'A compelling 5-slide pitch deck template with problem/solution structure, traction metrics, market size analysis, and funding ask slide. Designed for Series A/B fundraising.',
    categorySlug:  'business',
    format:        ['powerpoint'],
    tier:          'premium',
    tags:          ['pitch deck','investor','startup','fundraising','Series A'],
    file:          'investor_pitch_deck.pptx',
    slideCount:    5,
    isFeatured:    true,
    downloadCount: 1243,
  },
  {
    title:         'Marketing Strategy Presentation',
    description:   'Present your digital marketing strategy with campaign goals, channel mix, budget allocation, and ROI projections. Includes charts for social, SEO, email, and paid channels.',
    categorySlug:  'marketing',
    format:        ['powerpoint'],
    tier:          'free',
    tags:          ['marketing','strategy','digital','ROI','campaign'],
    file:          'marketing_strategy.pptx',
    slideCount:    3,
    isFeatured:    true,
    downloadCount: 2109,
  },
  {
    title:         'Quarterly Business Review (QBR)',
    description:   'Professional QBR template with performance scorecard, revenue analysis, pipeline review, and quarterly outlook. Clean table layout with colour-coded status indicators.',
    categorySlug:  'business',
    format:        ['powerpoint'],
    tier:          'free',
    tags:          ['QBR','quarterly','review','scorecard','performance'],
    file:          'quarterly_business_review.pptx',
    slideCount:    2,
    isFeatured:    false,
    downloadCount: 765,
  },
  {
    title:         'Product Launch Deck',
    description:   'Launch your product in style with this modern deck. Includes feature showcase, launch timeline, pricing tiers, and go-to-market strategy slides.',
    categorySlug:  'product',
    format:        ['powerpoint'],
    tier:          'premium',
    tags:          ['product launch','go-to-market','features','timeline','pricing'],
    file:          'product_launch.pptx',
    slideCount:    3,
    isFeatured:    true,
    downloadCount: 934,
  },
  {
    title:         'Team & Company Culture Deck',
    description:   'Showcase your company culture, values, and people with this warm HR presentation. Great for onboarding new hires, recruiting presentations, and all-hands meetings.',
    categorySlug:  'hr-people',
    format:        ['powerpoint'],
    tier:          'free',
    tags:          ['HR','culture','values','team','onboarding','recruiting'],
    file:          'team_hr_presentation.pptx',
    slideCount:    2,
    isFeatured:    false,
    downloadCount: 612,
  },
  {
    title:         'Sales Proposal Template',
    description:   'Win more deals with this polished sales proposal. Features a three-tier pricing comparison, ROI justification, implementation timeline, and professional cover slide.',
    categorySlug:  'sales',
    format:        ['powerpoint'],
    tier:          'premium',
    tags:          ['sales','proposal','pricing','enterprise','B2B'],
    file:          'sales_proposal.pptx',
    slideCount:    2,
    isFeatured:    false,
    downloadCount: 1087,
  },
  {
    title:         'Company Profile Presentation',
    description:   'A professional company overview deck with about us, mission statement, key metrics at a glance, team highlights, and product/service summary.',
    categorySlug:  'business',
    format:        ['powerpoint'],
    tier:          'free',
    tags:          ['company profile','about us','overview','corporate','brand'],
    file:          'company_profile.pptx',
    slideCount:    2,
    isFeatured:    false,
    downloadCount: 523,
  },
]

const BANNERS = [
  {
    title:    'Professional Templates for Every Business',
    subtitle: 'Download PowerPoint, Google Slides & Keynote templates — built for teams that mean business.',
    linkUrl:  '/templates',
    order:    1,
  },
  {
    title:    'Pitch Like a Pro',
    subtitle: 'Investor-ready pitch deck templates trusted by 500+ startups. Stand out from day one.',
    linkUrl:  '/templates?tier=premium',
    order:    2,
  },
  {
    title:    'Free Templates — No Credit Card',
    subtitle: 'Get started with our free collection. Download instantly, use immediately.',
    linkUrl:  '/templates?tier=free',
    order:    3,
  },
]

// ── Main ──────────────────────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(MONGO_URI)
  console.log('Connected to MongoDB\n')

  // Upsert categories
  const catMap: Record<string, mongoose.Types.ObjectId> = {}
  for (const cat of CATEGORIES) {
    const doc = await Category.findOneAndUpdate(
      { slug: cat.slug },
      { ...cat, isActive: true },
      { upsert: true, new: true }
    )
    catMap[cat.slug] = doc._id
    console.log(`  ✓ category: ${cat.name}`)
  }

  // Upsert templates
  const tplBase = '/uploads/templates/'
  let created = 0, updated = 0

  for (const t of TEMPLATES) {
    const catId = catMap[t.categorySlug]
    const fileUrls: Record<string, string> = {}
    for (const fmt of t.format) {
      fileUrls[fmt] = `${tplBase}${t.file}`
    }

    const existing = await Template.findOne({ title: t.title })
    if (existing) {
      await Template.findByIdAndUpdate(existing._id, {
        description: t.description, category: catId, format: t.format,
        tier: t.tier, tags: t.tags, fileUrls, slideCount: t.slideCount,
        isFeatured: t.isFeatured, downloadCount: t.downloadCount,
        status: 'published',
      })
      updated++
    } else {
      await Template.create({
        title: t.title, description: t.description, category: catId,
        format: t.format, tier: t.tier, tags: t.tags, fileUrls,
        slideCount: t.slideCount, isFeatured: t.isFeatured,
        downloadCount: t.downloadCount, status: 'published',
        thumbnailUrl: '',
      })
      created++
    }

    // Update category template count
    const count = await Template.countDocuments({ category: catId, status: 'published' })
    await Category.findByIdAndUpdate(catId, { templateCount: count })

    console.log(`  ✓ template: ${t.title}`)
  }

  // Upsert banners
  for (const b of BANNERS) {
    await Banner.findOneAndUpdate(
      { title: b.title },
      { ...b, isActive: true, imageUrl: '' },
      { upsert: true }
    )
    console.log(`  ✓ banner: ${b.title}`)
  }

  console.log(`\n✓ Done — ${created} templates created, ${updated} updated`)
  console.log('\nNote: Upload banner images in Admin → Banners to make them appear on the landing page.')
  console.log('The PPTX files are at /public/uploads/templates/ and will serve immediately.\n')

  await mongoose.disconnect()
}

seed().catch(e => { console.error(e); process.exit(1) })
