import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id   = searchParams.get('id')
  const type = searchParams.get('type') === 'serie' ? 'tv' : 'movie'

  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  if (!process.env.TMDB_ACCESS_TOKEN) {
    return NextResponse.json({ key: null })
  }

  try {
    const res  = await fetch(`https://api.themoviedb.org/3/${type}/${id}/videos?language=en-US`, {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
        Accept: 'application/json',
      },
      next: { revalidate: 86400 },
    })
    if (!res.ok) return NextResponse.json({ key: null })

    const data = await res.json()
    const trailer = (data.results as { key: string; type: string; site: string }[])
      .find((v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'))

    return NextResponse.json({ key: trailer?.key ?? null })
  } catch {
    return NextResponse.json({ key: null })
  }
}
