'use client'
import { useEffect, useState } from 'react'
import { supabase } from './supabase'

interface Destination {
  platform: string
  url: string
  weight: number
}

interface Link {
  id: string
  name: string
  slug: string
  destinations: Destination[]
}

export default function Home() {
  const [links, setLinks] = useState<Link[]>([])
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [shopeeUrl, setShopeeUrl] = useState('')
  const [tokopediaUrl, setTokopediaUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetchLinks()
  }, [])

  async function fetchLinks() {
    const { data } = await supabase.from('links').select('*').order('created_at', { ascending: false })
    setLinks(data || [])
  }

  async function createLink() {
    if (!name || !slug || !shopeeUrl) return setMsg('Nama, slug, dan URL Shopee wajib diisi')
    setLoading(true)
    const destinations: Destination[] = []
    if (shopeeUrl) destinations.push({ platform: 'shopee', url: shopeeUrl, weight: 60 })
    if (tokopediaUrl) destinations.push({ platform: 'tokopedia', url: tokopediaUrl, weight: 40 })
    const { error } = await supabase.from('links').insert({ name, slug, destinations })
    if (error) {
      setMsg('Error: ' + error.message)
    } else {
      setMsg('Link berhasil dibuat!')
      setName(''); setSlug(''); setShopeeUrl(''); setTokopediaUrl('')
      fetchLinks()
    }
    setLoading(false)
  }

  return (
    <main style={{ maxWidth: 700, margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>Pintas Dashboard</h1>
      <p style={{ color: '#666', marginBottom: 32 }}>Smart affiliate link rotator</p>

      <div style={{ border: '1px solid #e5e5e5', borderRadius: 12, padding: 24, marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Buat link baru</h2>
        <input placeholder="Nama produk" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e5e5', borderRadius: 8, marginBottom: 10, fontSize: 14 }} />
        <input placeholder="Slug (contoh: sepatu-kets)" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e5e5', borderRadius: 8, marginBottom: 10, fontSize: 14 }} />
        <input placeholder="URL Shopee Affiliate" value={shopeeUrl} onChange={(e) => setShopeeUrl(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e5e5', borderRadius: 8, marginBottom: 10, fontSize: 14 }} />
        <input placeholder="URL Tokopedia Affiliate (opsional)" value={tokopediaUrl} onChange={(e) => setTokopediaUrl(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e5e5', borderRadius: 8, marginBottom: 16, fontSize: 14 }} />
        {msg && <p style={{ color: msg.includes('Error') ? 'red' : 'green', marginBottom: 12, fontSize: 13 }}>{msg}</p>}
        <button onClick={createLink} disabled={loading} style={{ background: '#18181b', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, cursor: 'pointer' }}>
          {loading ? 'Menyimpan...' : 'Buat link'}
        </button>
      </div>

      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Link aktif</h2>
      {links.length === 0 && <p style={{ color: '#999', fontSize: 14 }}>Belum ada link. Buat yang pertama di atas!</p>}
      {links.map(link => (
        <div key={link.id} style={{ border: '1px solid #e5e5e5', borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{link.name}</div>
          <a href={`https://smart-rotator.pintas.workers.dev/${link.slug}`} target="_blank" style={{ color: '#2563eb', fontSize: 13 }}>
            smart-rotator.pintas.workers.dev/{link.slug}
          </a>
          <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {link.destinations.map((d: Destination) => (
              <span key={d.platform} style={{ fontSize: 12, background: '#f4f4f5', borderRadius: 20, padding: '2px 10px', color: '#52525b' }}>
                {d.platform} {d.weight}%
              </span>
            ))}
          </div>
        </div>
      ))}
    </main>
  )
}