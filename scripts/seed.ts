import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('\n❌  MONGODB_URI not set in .env.local\n');
  process.exit(1);
}

// ── Inline schemas (seed only — no module resolution) ──────────────────────────
const S = mongoose.Schema;
const OID = mongoose.Schema.Types.ObjectId;

const AdminSchema = new S(
  {
    name: String,
    email: { type: String, unique: true, lowercase: true },
    passwordHash: String,
    role: { type: String, default: 'admin' },
    lastLogin: Date,
  },
  { timestamps: true },
);
const PlanSchema = new S(
  {
    name: String,
    type: String,
    interval: String,
    priceUSD: Number,
    priceZWL: Number,
    features: [String],
    maxUsers: { type: Number, default: 1 },
    maxDownloadsPerMonth: { type: Number, default: null },
    isActive: { type: Boolean, default: true },
    stripePriceId: String,
  },
  { timestamps: true },
);
const CategorySchema = new S(
  {
    name: String,
    slug: String,
    description: String,
    icon: String,
    order: Number,
    templateCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const Admin = mongoose.models.Admin ?? mongoose.model('Admin', AdminSchema);
const Plan = mongoose.models.Plan ?? mongoose.model('Plan', PlanSchema);
const Category =
  mongoose.models.Category ?? mongoose.model('Category', CategorySchema);

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function main() {
  console.log('\n🌱  Seeding SlideVantage database…\n');
  await mongoose.connect(MONGODB_URI as string);
  console.log('✓  Connected to MongoDB');

  // ── Super admin ──────────────────────────────────────────────────────────────
  const existing = await Admin.findOne({ email: 'cchetekwe@gmail.com' });
  if (!existing) {
    const hash = await bcrypt.hash('Admin@2025!', 12);
    await Admin.create({
      name: 'Super Admin',
      email: 'cchetekwe@gmail.com',
      passwordHash: hash,
      role: 'super_admin',
    });
    console.log('✓  Super admin created — cchetekwe@gmail.com / Admin@2025!');
  } else {
    console.log('–  Super admin already exists, skipping');
  }

  // ── Plans ─────────────────────────────────────────────────────────────────────
  const planCount = await Plan.countDocuments();
  if (planCount === 0) {
    await Plan.insertMany([
      {
        name: 'Free',
        type: 'individual',
        interval: 'monthly',
        priceUSD: 0,
        priceZWL: 0,
        isActive: true,
        maxDownloadsPerMonth: 5,
        features: [
          '5 downloads per month',
          'Free templates only',
          'Basic support',
        ],
        // stripePriceId: not needed for free plan
      },
      {
        name: 'Pro Monthly',
        type: 'individual',
        interval: 'monthly',
        priceUSD: 12,
        priceZWL: 4320,
        isActive: true,
        maxDownloadsPerMonth: null, // unlimited
        features: [
          'Unlimited downloads',
          'All premium templates',
          'PowerPoint, Slides & Keynote formats',
          'Commercial licence',
          'Priority support',
        ],
        // stripePriceId: Set this from Stripe Dashboard → Products → Add price
        // Example: price_1AbCdefGhijklMno
      },
      {
        name: 'Pro Annual',
        type: 'individual',
        interval: 'annual',
        priceUSD: 99,
        priceZWL: 35640,
        isActive: true,
        maxDownloadsPerMonth: null,
        features: [
          'Unlimited downloads',
          'All premium templates',
          'PowerPoint, Slides & Keynote formats',
          'Commercial licence',
          'Priority support',
          '2 months free vs monthly',
        ],
        // stripePriceId: Set this from Stripe Dashboard → Products → Add price
      },
      {
        name: 'Team',
        type: 'team_10',
        interval: 'monthly',
        priceUSD: 49,
        priceZWL: 17640,
        isActive: true,
        maxUsers: 10,
        maxDownloadsPerMonth: null,
        features: [
          'Up to 10 team members',
          'Unlimited downloads',
          'All premium templates',
          'Shared team library',
          'Dedicated support',
        ],
        // stripePriceId: Set this from Stripe Dashboard → Products → Add price
      },
    ]);
    console.log('✓  Plans created (4)');
    console.log('\n  ⚡ IMPORTANT — To enable Stripe payments:');
    console.log('     1. Go to https://dashboard.stripe.com/products');
    console.log('     2. Create a product for each paid plan');
    console.log('     3. Copy the Price ID (starts with price_...)');
    console.log(
      '     4. In the admin: Subscriptions → Plans tab → Edit plan → paste the Price ID',
    );
  } else {
    console.log(`–  Plans already exist (${planCount}), skipping`);
  }

  // ── Categories ────────────────────────────────────────────────────────────────
  const catCount = await Category.countDocuments();
  if (catCount === 0) {
    const cats = [
      {
        name: 'Business',
        icon: '💼',
        description: 'Corporate, reports, and business presentations',
        order: 1,
      },
      {
        name: 'Marketing',
        icon: '📈',
        description: 'Marketing plans, campaigns and brand decks',
        order: 2,
      },
      {
        name: 'Pitch Decks',
        icon: '🚀',
        description: 'Startup pitches and investor presentations',
        order: 3,
      },
      {
        name: 'Education',
        icon: '🎓',
        description: 'Courses, lectures and training materials',
        order: 4,
      },
      {
        name: 'Creative',
        icon: '🎨',
        description: 'Portfolio, design and creative presentations',
        order: 5,
      },
      {
        name: 'Finance',
        icon: '📊',
        description: 'Financial reports, budgets and analysis',
        order: 6,
      },
    ];
    await Category.insertMany(
      cats.map((c) => ({ ...c, slug: slugify(c.name) })),
    );
    console.log(`✓  Categories created (${cats.length})`);
  } else {
    console.log(`–  Categories already exist (${catCount}), skipping`);
  }

  await mongoose.disconnect();

  console.log('\n✅  Seed complete!\n');
  console.log('  Login:  http://localhost:3000/login');
  console.log('  Email:  cchetekwe@gmail.com');
  console.log('  Pass:   Admin@2025!\n');
}

main().catch((e) => {
  console.error('\n❌  Seed failed:', e.message, '\n');
  process.exit(1);
});
