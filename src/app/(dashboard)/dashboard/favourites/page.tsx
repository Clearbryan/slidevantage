import { Suspense } from 'react'
import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { User } from '@/models'
import { FavouritesClient } from './FavouritesClient'
export const metadata: Metadata = { title: 'Favourites' }

export default async function FavouritesPage() {
  const session = await auth()
  const me = session?.user as any
  await connectDB()

  const user = await User.findById(me?.id).populate({
    path: 'favourites',
    select: 'title thumbnailUrl tier downloadCount format category status',
    populate: { path: 'category', select: 'name' },
  }).lean()

  const favourites = (user as any)?.favourites?.filter((t: any) => t?.status === 'published') ?? []

  return (
    <Suspense>
      <FavouritesClient
        data={JSON.parse(JSON.stringify(favourites))}
        userRole={me?.role ?? 'free'}
      />
    </Suspense>
  )
}
