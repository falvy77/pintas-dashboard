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
  created_at: string
}

export default function Home() {
  const [links, setLinks] = useState<Link[]>([])
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [shopeeUrl, setShopeeUrl] = useState('')
  const [tokopediaUrl, setTokopediaUrl] = useState('')
  const [tiktokUrl, setTiktokUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { fetchLinks() }, [])

  async function fetchLinks() {
    const { data } = await supabase.from('links').select('*').order('created_at', { ascending: false })
    setLinks(data || [])
  }

  async function createLink() {
    if (!name || !slug) return setMsg('Nama dan slug wajib diisi')
    if (!shopeeUrl && !tokopediaUrl && !tiktokUrl) return setMsg('Minimal isi satu URL platform')
    setLoading(true)
    const destinations: Destination[] = []
    if (shopeeUrl) destinations.push({ platform: 'shopee', url: shopeeUrl, weight: 50 })
    if (tokopediaUrl) destinations.push({ platform: 'tokopedia', url: tokopediaUrl, weight: 30 })
    if (tiktokUrl) destinations.push({ platform: 'tiktok', url: tiktokUrl, weight: 20 })
    const { error } = await supabase.from('links').insert({ name, slug, destinations })
    if (error) {
      setMsg('Error: ' + error.message)
    } else {
      setMsg('Link berhasil dibuat!')
      setName(''); setSlug(''); setShopeeUrl(''); setTokopediaUrl(''); setTiktokUrl('')
      setShowForm(false)
      fetchLinks()
      setTimeout(() => setMsg(''), 3000)
    }
    setLoading(false)
  }

  const platformColor: Record<string, string> = {
    shopee: '#f97316',
    tokopedia: '#16a34a',
    tiktok: '#a855f7',
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=Geist+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0a; color: #e5e5e5; font-family: 'Geist', sans-serif; }
        ::placeholder { color: #404040; }
        input { outline: none; }
        input:focus { border-color: #404040 !important; }
        a { text-decoration: none; }
        .fade-in { animation: fadeIn 0.4s ease forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .card-hover { transition: border-color 0.15s; }
        .card-hover:hover { border-color: #333 !important; }
        .btn-primary { background: #e5e5e5; color: #0a0a0a; border: none; border-radius: 8px; padding: 9px 18px; font-size: 13px; font-family: 'Geist', sans-serif; font-weight: 500; cursor: pointer; transition: background 0.15s; }
        .btn-primary:hover { background: #fff; }
        .btn-primary:disabled { background: #333; color: #666; cursor: not-allowed; }
        .btn-ghost { background: transparent; color: #888; border: 1px solid #222; border-radius: 8px; padding: 9px 18px; font-size: 13px; font-family: 'Geist', sans-serif; cursor: pointer; transition: all 0.15s; }
        .btn-ghost:hover { border-color: #444; color: #e5e5e5; }
        .input-field { width: 100%; background: #111; border: 1px solid #222; border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #e5e5e5; font-family: 'Geist', sans-serif; transition: border-color 0.15s; }
        .input-field:focus { border-color: #404040; }
        .mono { font-family: 'Geist Mono', monospace; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>

        {/* Topbar */}
        <div style={{ borderBottom: '1px solid #171717', padding: '0 32px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#0a0a0a', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 22, height: 22, background: '#e5e5e5', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#0a0a0a', fontFamily: 'Geist Mono, monospace' }}>P</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#e5e5e5' }}>Pintas</span>
            <span style={{ color: '#333', fontSize: 14 }}>/</span>
            <span style={{ fontSize: 13, color: '#666' }}>dashboard</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <a href="/analytics" style={{ fontSize: 13, color: '#666', padding: '6px 12px', borderRadius: 6, transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#e5e5e5')}
              onMouseLeave={e => (e.currentTarget.style.color = '#666')}>
              Analytics
            </a>
            <button className="btn-primary" onClick={() => setShowForm(!showForm)} style={{ padding: '7px 14px', fontSize: 12 }}>
              {showForm ? 'Batal' : '+ Link baru'}
            </button>
          </div>
        </div>

        <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>

          {/* Header */}
          <div style={{ marginBottom: 40 }}>
            <h1 style={{ fontSize: 28, fontWeight: 600, color: '#e5e5e5', letterSpacing: '-0.5px', marginBottom: 6 }}>Link manager</h1>
            <p style={{ fontSize: 14, color: '#555' }}>Satu link, otomatis arahkan ke platform terbaik tiap visitor.</p>
          </div>

          {/* Form */}
          {showForm && (
            <div className="fade-in" style={{ background: '#111', border: '1px solid #222', borderRadius: 12, padding: 24, marginBottom: 32 }}>
              <h2 style={{ fontSize: 14, fontWeight: 500, color: '#e5e5e5', marginBottom: 20 }}>Buat link baru</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <input className="input-field" placeholder="Nama produk" value={name} onChange={e => setName(e.target.value)} />
                <input className="input-field mono" placeholder="slug-produk" value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))} />
              </div>
              <input className="input-field" placeholder="URL Shopee Affiliate" value={shopeeUrl} onChange={e => setShopeeUrl(e.target.value)} style={{ marginBottom: 10 }} />
              <input className="input-field" placeholder="URL Tokopedia Affiliate (opsional)" value={tokopediaUrl} onChange={e => setTokopediaUrl(e.target.value)} style={{ marginBottom: 10 }} />
              <input className="input-field" placeholder="URL TikTok Shop Affiliate (opsional)" value={tiktokUrl} onChange={e => setTiktokUrl(e.target.value)} style={{ marginBottom: 16 }} />
              {msg && <p style={{ fontSize: 12, color: msg.includes('Error') ? '#ef4444' : '#22c55e', marginBottom: 12 }}>{msg}</p>}
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-primary" onClick={createLink} disabled={loading}>
                  {loading ? 'Menyimpan...' : 'Buat link'}
                </button>
                <button className="btn-ghost" onClick={() => setShowForm(false)}>Batal</button>
              </div>
            </div>
          )}

          {msg && !showForm && (
            <div style={{ background: '#0f2a1a', border: '1px solid #166534', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: '#22c55e' }}>
              {msg}
            </div>
          )}

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
            {[
              { label: 'Total link', value: links.length },
              { label: 'Link aktif', value: links.filter(l => l.destinations.length > 0).length },
              { label: 'Platform terhubung', value: [...new Set(links.flatMap(l => l.destinations.map(d => d.platform)))].length },
            ].map(stat => (
              <div key={stat.label} style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 10, padding: '16px 18px' }}>
                <div style={{ fontSize: 22, fontWeight: 600, color: '#e5e5e5', marginBottom: 2 }}>{stat.value}</div>
                <div style={{ fontSize: 12, color: '#555' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Link list */}
          {links.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#444' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>—</div>
              <p style={{ fontSize: 14 }}>Belum ada link.</p>
              <button className="btn-ghost" style={{ marginTop: 16 }} onClick={() => setShowForm(true)}>Buat link pertama</button>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {links.map((link, i) => (
              <div key={link.id} className="card-hover fade-in" style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 10, padding: '16px 18px', animationDelay: `${i * 0.05}s` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#e5e5e5', marginBottom: 3 }}>{link.name}</div>
                    <a href={`https://smart-rotator.pintas.workers.dev/${link.slug}`} target="_blank"
                      style={{ fontSize: 12, color: '#555', fontFamily: 'Geist Mono, monospace', transition: 'color 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#888')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#555')}>
                      pintas.workers.dev/{link.slug}
                    </a>
                  </div>
                  <a href="/analytics" style={{ fontSize: 12, color: '#444', padding: '4px 10px', border: '1px solid #222', borderRadius: 6, transition: 'all 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#888'; (e.currentTarget as HTMLElement).style.borderColor = '#333'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#444'; (e.currentTarget as HTMLElement).style.borderColor = '#222'; }}>
                    Analytics →
                  </a>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {link.destinations.map(d => (
                    <span key={d.platform} style={{ fontSize: 11, padding: '2px 9px', borderRadius: 20, background: '#1a1a1a', color: platformColor[d.platform] || '#888', border: `1px solid ${platformColor[d.platform] || '#333'}22` }}>
                      {d.platform} · {d.weight}%
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}