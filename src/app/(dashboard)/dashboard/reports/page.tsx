import { Suspense } from 'react'
import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { connectDB } from '@/lib/db'
import { Download, Template, Subscription, User, Payment } from '@/models'
import { ReportsClient } from './ReportsClient'
export const metadata: Metadata = { title: 'Reports' }

export default async function ReportsPage() {
  const session = await auth()
  if (!['admin','super_admin'].includes((session?.user as any)?.role)) redirect('/dashboard')

  await connectDB()
  const now = new Date()

  const [revenue, downloads, userGrowth, topTemplates,
    totalRevenueResult, totalDl, totalUsers] = await Promise.all([
    Payment.aggregate([
      { $match: { status:'succeeded', createdAt:{ $gte:new Date(now.getFullYear(), now.getMonth()-5, 1) } } },
      { $group: { _id:{ y:{ $year:'$createdAt' }, m:{ $month:'$createdAt' } }, revenue:{ $sum:'$amount' } } },
      { $sort: { '_id.y':1, '_id.m':1 } },
    ]),
    Download.aggregate([
      { $match: { downloadedAt:{ $gte:new Date(now.getFullYear(), now.getMonth()-5, 1) } } },
      { $group: { _id:{ y:{ $year:'$downloadedAt' }, m:{ $month:'$downloadedAt' } }, count:{ $sum:1 } } },
      { $sort: { '_id.y':1, '_id.m':1 } },
    ]),
    User.aggregate([
      { $match: { createdAt:{ $gte:new Date(now.getFullYear(), now.getMonth()-5, 1) } } },
      { $group: { _id:{ y:{ $year:'$createdAt' }, m:{ $month:'$createdAt' } }, count:{ $sum:1 } } },
      { $sort: { '_id.y':1, '_id.m':1 } },
    ]),
    Template.find({ status:'published' }).sort({ downloadCount:-1 }).limit(8).select('title downloadCount tier').lean(),
    Payment.aggregate([{ $match:{ status:'succeeded' } }, { $group:{ _id:null, total:{ $sum:'$amount' } } }]),
    Download.countDocuments(),
    User.countDocuments(),
  ])

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const toSeries = (arr: any[], valKey='count') => arr.map(d => ({ label:months[d._id.m-1], value:d[valKey]??0 }))

  return (
    <Suspense>
      <ReportsClient
        revenue={toSeries(revenue, 'revenue')}
        downloadTrend={toSeries(downloads)}
        userGrowth={toSeries(userGrowth)}
        topTemplates={JSON.parse(JSON.stringify(topTemplates))}
        totals={{ revenue:totalRevenueResult[0]?.total??0, downloads:totalDl, users:totalUsers }}
      />
    </Suspense>
  )
}
