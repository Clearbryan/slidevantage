import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { User, Template, Subscription, Download } from '@/models'
import { DashboardCharts } from './DashboardCharts'
import { UserDashboard } from './UserDashboard'
export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const session = await auth()
  const me      = session?.user as any
  const isAdmin = ['admin','super_admin'].includes(me?.role)

  await connectDB()

  if (isAdmin) {
    const now = new Date()
    const som = new Date(now.getFullYear(), now.getMonth(), 1)
    const sol = new Date(now.getFullYear(), now.getMonth()-1, 1)
    const eol = new Date(now.getFullYear(), now.getMonth(), 0)

    const [totalUsers,totalTemplates,activeSubs,totalDl,usersNow,usersLast,dlNow,dlLast,trend,topTemplates,recentUsers] = await Promise.all([
      User.countDocuments(),
      Template.countDocuments({ status:'published' }),
      Subscription.countDocuments({ status:'active' }),
      Download.countDocuments(),
      User.countDocuments({ createdAt:{ $gte:som } }),
      User.countDocuments({ createdAt:{ $gte:sol, $lte:eol } }),
      Download.countDocuments({ downloadedAt:{ $gte:som } }),
      Download.countDocuments({ downloadedAt:{ $gte:sol, $lte:eol } }),
      Download.aggregate([
        { $match:{ downloadedAt:{ $gte:new Date(now.getFullYear(),now.getMonth()-5,1) } } },
        { $group:{ _id:{ y:{$year:'$downloadedAt'}, m:{$month:'$downloadedAt'} }, n:{$sum:1} } },
        { $sort:{ '_id.y':1, '_id.m':1 } },
      ]),
      Template.find({ status:'published' }).sort({ downloadCount:-1 }).limit(5).select('title downloadCount tier').lean(),
      User.find().sort({ createdAt:-1 }).limit(6).select('name surname email country createdAt').lean(),
    ])
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    return (
      <DashboardCharts
        stats={{ totalUsers,totalTemplates,activeSubs,totalDl,
          userGrowth: usersLast>0 ? Math.round(((usersNow-usersLast)/usersLast)*100) : 0,
          dlGrowth:   dlLast>0   ? Math.round(((dlNow-dlLast)/dlLast)*100)   : 0,
        }}
        trend={trend.map((d:any) => ({ label:months[d._id.m-1], value:d.n }))}
        topTemplates={JSON.parse(JSON.stringify(topTemplates))}
        recentUsers={JSON.parse(JSON.stringify(recentUsers))}
      />
    )
  }

  // Regular user
  const [userDoc, recentDl, recentTemplates] = await Promise.all([
    User.findById(me?.id)
      .populate({ path:'subscription', populate:{ path:'plan', select:'name type interval priceUSD maxDownloadsPerMonth features' } })
      .lean(),
    Download.find({ user:me?.id })
      .populate({ path:'template', select:'title thumbnailUrl tier' })
      .sort({ downloadedAt:-1 }).limit(5).lean(),
    Template.find({ status:'published' })
      .populate('category','name')
      .sort({ createdAt:-1 })
      .limit(6)
      .lean(),
  ])

  const userFavIds = (userDoc as any)?.favourites?.map((f:any) => f.toString()) ?? []

  return (
    <UserDashboard
      name={me?.name ?? ''}
      user={JSON.parse(JSON.stringify(userDoc??{}))}
      recentDownloads={JSON.parse(JSON.stringify(recentDl))}
      recentTemplates={JSON.parse(JSON.stringify(recentTemplates))}
      userFavIds={userFavIds}
    />
  )
}
