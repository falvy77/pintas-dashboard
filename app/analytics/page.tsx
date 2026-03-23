'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

interface ClickStat {
  platform: string
  device: string
  count: number
}

interface LinkWithStats {
  id: string
  name: string
  slug: string
  totalClicks: number
  byDevice: Record<string, number>
  byPlatform: Record<string, number>
}

export default function Analytics() {
  const [stats, setStats] = useState<LinkWithStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    const { data: links } = await supabase.from('links').select('*')
    const { data: clicks } = await supabase.from('clicks').select('*')

    if (!links || !clicks) return

    const result: LinkWithStats[] = links.map(link => {
      const linkClicks = clicks.filter(c => c.slug === link.slug)
      const byDevice: Record<string, number> = {}
      const byPlatform: Record<string, number> = {}

      linkClicks.forEach(c => {
        byDevice[c.device] = (byDevice[c.device] || 0) + 1
        byPlatform[c.platform] = (byPlatform[c.platform] || 0) + 1
      })

      return {
        id: link.id,
        name: link.name,
        slug: link.slug,
        totalClicks: linkClicks.length,
        byDevice,
        byPlatform
      }
    })

    setStats(result.sort((a, b) => b.totalClicks - a.totalClicks))
    setLoading(false)
  }

  return (
    <main style={{ maxWidth: 700, margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 4 }}>Analytics</h1>
          <p style={{ color: '#666', fontSize: 14 }}>Performa semua link lo</p>
        </div>
        <a href="/" style={{ fontSize: 13, color: '#2563eb', textDecoration: 'none' }}>← Kembali</a>
      </div>

      {loading && <p style={{ color: '#999' }}>Memuat data...</p>}

      {stats.map(link => (
        <div key={link.id} style={{ border: '1px solid #e5e5e5', borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{link.name}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>/{link.slug}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 28, fontWeight: 600 }}>{link.totalClicks}</div>
              <div style={{ fontSize: 12, color: '#888' }}>total klik</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: '#f9f9f9', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#888', marginBottom: 8, textTransform: 'uppercase' }}>Device</div>
              {Object.entries(link.byDevice).length === 0 && <div style={{ fontSize: 13, color: '#bbb' }}>Belum ada data</div>}
              {Object.entries(link.byDevice).map(([device, count]) => (
                <div key={device} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                  <span style={{ textTransform: 'capitalize' }}>{device}</span>
                  <span style={{ fontWeight: 600 }}>{count}</span>
                </div>
              ))}
            </div>

            <div style={{ background: '#f9f9f9', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#888', marginBottom: 8, textTransform: 'uppercase' }}>Platform</div>
              {Object.entries(link.byPlatform).length === 0 && <div style={{ fontSize: 13, color: '#bbb' }}>Belum ada data</div>}
              {Object.entries(link.byPlatform).map(([platform, count]) => (
                <div key={platform} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                  <span style={{ textTransform: 'capitalize' }}>{platform}</span>
                  <span style={{ fontWeight: 600 }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {!loading && stats.length === 0 && (
        <p style={{ color: '#999', fontSize: 14 }}>Belum ada link. <a href="/" style={{ color: '#2563eb' }}>Buat link pertama</a></p>
      )}
    </main>
  )
}