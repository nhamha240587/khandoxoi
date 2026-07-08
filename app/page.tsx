'use client'

import { useState, useRef, useEffect } from 'react'

// ─── Assets ───────────────────────────────────────────────────────────────────
const IMG = {
  luoi:   '/images/khan-do-xoi/724597989_1683075906108439_2952143396022032152_n.jpg',
  gapgon: '/images/khan-do-xoi/706035495_1627795419070070_876115190267151157_n.jpg',
  xoicho: '/images/khan-do-xoi/724485203_2296217747574178_5800612475932619747_n.jpg',
  review: '/images/khan-do-xoi/724613553_990229680459328_6428958116600383338_n.jpg',
  phu:    '/images/khan-do-xoi/722995300_1362690915719266_3411856794429446282_n.jpg',
}

const PRICE = 49000
const fmt = (n: number) => n.toLocaleString('vi-VN') + 'đ'

// ─── Types ────────────────────────────────────────────────────────────────────
interface QR { bankAccount: string; bankCode: string; accountName: string; amount: number; content: string; qrUrl: string }
interface PaymentData { refCode: string; totalPrice: number; productLabel: string; qr: QR }

// ─── Countdown ────────────────────────────────────────────────────────────────
function Countdown({ seconds }: { seconds: number }) {
  const [left, setLeft] = useState(seconds)
  useEffect(() => {
    if (left <= 0) return
    const t = setTimeout(() => setLeft(l => l - 1), 1000)
    return () => clearTimeout(t)
  }, [left])
  const m = Math.floor(left / 60).toString().padStart(2, '0')
  const s = (left % 60).toString().padStart(2, '0')
  return (
    <span style={{ fontVariantNumeric: 'tabular-nums' }}
      className={left < 120 ? 'text-red-500 font-extrabold animate-pulse' : 'font-extrabold text-[#0D3B22]'}>
      {m}:{s}
    </span>
  )
}

// ─── PaymentStep (không thay đổi logic) ──────────────────────────────────────
function PaymentStep({ data, name, qty }: { data: PaymentData; name: string; qty: number }) {
  const [copied, setCopied] = useState<'ref' | 'amt' | null>(null)
  const copy = (text: string, k: 'ref' | 'amt') => {
    navigator.clipboard.writeText(text).then(() => { setCopied(k); setTimeout(() => setCopied(null), 2500) })
  }

  return (
    <div className="min-h-screen bg-[#F4FCF7]">
      <div className="bg-[#0D3B22] text-white text-center py-4 px-4">
        <p className="text-green-300 text-sm font-semibold">Đơn của bạn đã được ghi nhận!</p>
        <p className="font-extrabold text-lg mt-0.5">Hoàn tất chuyển khoản để xác nhận giao hàng</p>
      </div>

      <div className="max-w-sm mx-auto w-full px-4 py-6 space-y-5">
        <div className="bg-white border border-[#C8E6D0] rounded-2xl py-3 px-4 text-center shadow-sm">
          <p className="text-sm text-gray-500">QR thanh toán hết hạn sau</p>
          <p className="text-4xl mt-1"><Countdown seconds={30 * 60} /></p>
          <p className="text-xs text-gray-400 mt-0.5">Vui lòng chuyển khoản trước khi hết giờ</p>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-md text-center border border-[#C8E6D0]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data.qr.qrUrl} alt="QR chuyển khoản"
            className="w-48 h-48 mx-auto rounded-xl border-2 border-[#C8E6D0] object-contain" />
          <p className="text-xs text-gray-400 mt-2">Quét bằng app ngân hàng bất kỳ</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#C8E6D0] divide-y divide-[#E8F5EC] overflow-hidden shadow-sm">
          <div className="flex justify-between items-center px-4 py-3 text-sm">
            <span className="text-gray-500">Ngân hàng</span>
            <span className="font-bold">{data.qr.bankCode} · {data.qr.accountName}</span>
          </div>
          <div className="flex justify-between items-center px-4 py-3 text-sm">
            <span className="text-gray-500">Số tài khoản</span>
            <span className="font-mono font-bold">{data.qr.bankAccount}</span>
          </div>
          <div className="flex justify-between items-center px-4 py-3">
            <span className="text-sm text-gray-500">Số tiền</span>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[#155C34]">{fmt(data.totalPrice)}</span>
              <button onClick={() => copy(String(data.totalPrice), 'amt')} aria-label="Copy số tiền"
                className="min-w-[44px] min-h-[44px] text-xs bg-green-50 text-green-700 px-2 rounded-lg font-medium flex items-center justify-center">
                {copied === 'amt' ? '✓' : 'Copy'}
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center px-4 py-3 bg-green-50">
            <div>
              <span className="text-sm text-gray-500">Nội dung CK</span>
              <span className="text-red-500 text-xs font-bold ml-1">(bắt buộc)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold font-mono text-[#155C34]">{data.refCode}</span>
              <button onClick={() => copy(data.refCode, 'ref')} aria-label="Copy mã chuyển khoản"
                className="min-w-[44px] min-h-[44px] text-xs bg-green-100 text-green-800 px-2 rounded-lg font-bold flex items-center justify-center">
                {copied === 'ref' ? '✓ Đã copy' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
          Nhập <strong>đúng nội dung</strong> <code className="bg-amber-100 px-1 rounded">{data.refCode}</code> khi chuyển — hệ thống tự xác nhận, Cô Hạ nhận thông báo và chuẩn bị giao hàng ngay.
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
          Giá <strong>{fmt(data.totalPrice)}</strong> chưa bao gồm phí vận chuyển — phí ship tính riêng khi giao hàng.
        </div>

        <div className="text-center text-sm text-gray-500 pb-8">
          <p>Đơn của <strong className="text-gray-700">{name}</strong> · Khăn 1m×1m × {qty}</p>
          <p className="mt-1 text-xs">Sau khi chuyển khoản, đơn tự động xác nhận — không cần báo lại.</p>
        </div>
      </div>
    </div>
  )
}

// ─── OrderForm (logic không thay đổi) ────────────────────────────────────────
function OrderForm() {
  const [name, setName]       = useState('')
  const [phone, setPhone]     = useState('')
  const [address, setAddress] = useState('')
  const [qty, setQty]         = useState(1)
  const [note, setNote]       = useState('')
  const [step, setStep]       = useState<'idle' | 'loading' | 'done' | 'err'>('idle')
  const [error, setError]     = useState('')
  const [payment, setPayment] = useState<PaymentData | null>(null)
  const total = PRICE * qty

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError('Vui lòng điền đủ họ tên, số điện thoại và địa chỉ')
      return
    }
    setStep('loading'); setError('')
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, address, quantity: qty, note }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Lỗi')
      setPayment(data); setStep('done')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Có lỗi, thử lại nhé')
      setStep('err')
    }
  }

  if (step === 'done' && payment) return <PaymentStep data={payment} name={name} qty={qty} />

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex items-center justify-between bg-green-50 rounded-xl px-4 py-3 border border-[#C8E6D0]">
        <div>
          <p className="font-bold text-[#0D3B22]">Khăn Đồ Xôi 1m×1m</p>
          <p className="text-xs text-gray-500 mt-0.5">Vải lưới hấp xôi · Bếp Cô Hạ</p>
        </div>
        <div className="text-right">
          <p className="font-extrabold text-xl text-[#155C34]">{fmt(PRICE)}</p>
          <p className="text-xs text-gray-400">chưa gồm ship</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Số lượng</label>
        <div className="flex items-center gap-3">
          <button type="button" aria-label="Giảm" onClick={() => setQty(q => Math.max(1, q - 1))}
            className="w-11 h-11 rounded-full border-2 border-gray-200 text-xl font-bold flex items-center justify-center hover:border-[#1E7A43] transition-colors">−</button>
          <span className="w-8 text-center font-extrabold text-xl text-[#155C34]">{qty}</span>
          <button type="button" aria-label="Tăng" onClick={() => setQty(q => Math.min(20, q + 1))}
            className="w-11 h-11 rounded-full border-2 border-gray-200 text-xl font-bold flex items-center justify-center hover:border-[#1E7A43] transition-colors">+</button>
          {qty > 1 && <span className="text-sm font-bold text-[#155C34]">= {fmt(total)}</span>}
        </div>
      </div>

      {[
        { id: 'name',  label: 'Họ và tên *',        val: name,  set: setName,  type: 'text', ph: 'Nguyễn Thị Lan' },
        { id: 'phone', label: 'Số điện thoại *',    val: phone, set: setPhone, type: 'tel',  ph: '0912 345 678' },
      ].map(f => (
        <div key={f.id}>
          <label htmlFor={f.id} className="block text-sm font-bold text-gray-700 mb-2">{f.label}</label>
          <input id={f.id} type={f.type} inputMode={f.type === 'tel' ? 'numeric' : 'text'}
            value={f.val} onChange={e => { f.set(e.target.value); setError('') }}
            placeholder={f.ph} autoComplete={f.type === 'tel' ? 'tel' : 'name'}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-[#1E7A43] focus:outline-none transition-colors text-base" />
        </div>
      ))}

      <div>
        <label htmlFor="address" className="block text-sm font-bold text-gray-700 mb-2">Địa chỉ giao hàng *</label>
        <textarea id="address" value={address} onChange={e => { setAddress(e.target.value); setError('') }}
          placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
          rows={3} autoComplete="street-address"
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-[#1E7A43] focus:outline-none transition-colors resize-none text-base" />
      </div>

      <div>
        <label htmlFor="note" className="block text-sm text-gray-500 mb-1.5">Ghi chú <span className="text-gray-400">(không bắt buộc)</span></label>
        <input id="note" type="text" value={note} onChange={e => setNote(e.target.value)}
          placeholder="Giao giờ nào, yêu cầu đặc biệt..."
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-[#C8E6D0] focus:outline-none transition-colors text-sm" />
      </div>

      {error && <p role="alert" className="text-red-500 text-sm bg-red-50 rounded-xl py-2.5 px-4 text-center">{error}</p>}

      <button type="submit" disabled={step === 'loading'}
        className="w-full min-h-[52px] rounded-2xl font-extrabold text-[#0D3B22] text-lg bg-[#F0B429] hover:bg-[#e8a820] transition-all active:scale-95 disabled:opacity-60 shadow-lg">
        {step === 'loading'
          ? <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>Đang gửi đơn...
            </span>
          : `ĐẶT HÀNG NGAY · ${fmt(total)}`}
      </button>

      <div className="flex justify-center gap-4 text-xs text-gray-400 pt-1">
        <span>🔒 Bảo mật 100%</span><span>·</span>
        <span>🚚 Ship toàn quốc</span><span>·</span>
        <span>↩ Đổi trả nếu lỗi</span>
      </div>
    </form>
  )
}

// ─── FAQ Accordion ────────────────────────────────────────────────────────────
function Faq({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-[#C8E6D0] rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(o => !o)} aria-expanded={open}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#F4FCF7] transition-colors min-h-[52px]">
        <span className="font-bold text-[#0D3B22] text-sm pr-4 leading-snug">{q}</span>
        <svg className={`flex-shrink-0 w-5 h-5 text-[#155C34] transition-transform duration-200 ${open ? 'rotate-45' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-4 text-gray-600 text-sm leading-relaxed border-t border-[#E8F5EC] pt-3">
          {a}
        </div>
      )}
    </div>
  )
}

// ─── Star Rating ──────────────────────────────────────────────────────────────
function Stars({ n = 5 }: { n?: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${n} sao`}>
      {Array.from({ length: n }).map((_, i) => (
        <svg key={i} className="w-4 h-4 text-[#F0B429]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  )
}

// ─── Check Icon ───────────────────────────────────────────────────────────────
function Check({ className = 'w-4 h-4 text-[#27AE60]' }: { className?: string }) {
  return (
    <svg className={`flex-shrink-0 ${className}`} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
    </svg>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function KhanDoXoi() {
  const orderRef  = useRef<HTMLDivElement>(null)
  const [showSticky, setShowSticky] = useState(false)

  useEffect(() => {
    // Sticky CTA bar
    const onScroll = () => setShowSticky(window.scrollY > 600)
    window.addEventListener('scroll', onScroll, { passive: true })

    // Fade-up on scroll — respects prefers-reduced-motion via CSS
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('fu-on'); obs.unobserve(e.target) }
      }),
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    )
    document.querySelectorAll('.fu').forEach(el => obs.observe(el))

    return () => { window.removeEventListener('scroll', onScroll); obs.disconnect() }
  }, [])

  const scrollToOrder = () => orderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <div className="min-h-screen bg-white font-sans">
      <style>{`
        .fu{opacity:0;transform:translateY(22px);transition:opacity .5s ease,transform .5s ease}
        .fu-on{opacity:1;transform:translateY(0)}
        @media(prefers-reduced-motion:reduce){.fu{opacity:1;transform:none;transition:none}}
      `}</style>

      {/* ── [0] Announcement Bar ─────────────────────────────────────────────── */}
      <div className="bg-[#155C34] text-white text-center py-2.5 px-4 text-sm">
        <span className="font-bold text-[#F0B429]">🔥 Kho hàng có hạn</span>
        <span className="ml-1 text-green-100">— Đặt ngay hôm nay, giao trong 2–4 ngày toàn quốc</span>
      </div>

      {/* ── [1] Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-[#0D3B22] to-[#155C34] text-white overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-7 pb-0">
          {/* Brand badge */}
          <div className="mb-5">
            <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 inline-flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo-bep-co-ha.png" alt="Bếp Cô Hạ"
                className="h-8 w-8 object-contain"
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
              <span className="font-bold text-sm">Bếp Cô Hạ · Hacofood.vn</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-end">
            <div className="pb-10 md:pb-14">
              {/* B.1 Headline — SCPU: Specificity + Promise + Urgency */}
              <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-3">
                Đồ Xôi 30 Phút — Ra Nồi<br />
                <span className="text-[#F0B429]">Ráo Hạt, Không Dính, Đẹp Như Hàng.</span>
              </h1>
              {/* B.2 Sub Headline */}
              <p className="text-green-100 text-base sm:text-lg leading-relaxed mb-6 max-w-md">
                Khăn vải lưới 1m×1m chuyên dụng — hơi thoát đều khắp bề mặt, xôi ngon từng hạt.
                Dùng được <strong className="text-white">1000+ lần</strong>, giặt sạch dùng lại. Cô Hạ dùng mỗi ngày.
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-5">
                <div>
                  <p className="text-green-300 text-xs font-semibold uppercase tracking-wide">Chỉ</p>
                  <p className="text-4xl font-extrabold text-white leading-none">{fmt(PRICE)}</p>
                  <p className="text-green-300 text-xs mt-0.5">chưa bao gồm phí vận chuyển</p>
                </div>
                <button onClick={scrollToOrder}
                  className="w-full sm:w-auto bg-[#F0B429] hover:bg-[#e8a820] text-[#0D3B22] font-extrabold text-lg px-7 py-3.5 rounded-2xl min-h-[52px] transition-all active:scale-95 shadow-lg">
                  Đặt Hàng Ngay →
                </button>
              </div>

              <div className="flex flex-wrap gap-3">
                {['Vải lưới thực phẩm', 'May viền 4 cạnh', 'Ship toàn quốc', 'Đổi trả nếu lỗi'].map(t => (
                  <div key={t} className="flex items-center gap-1.5 text-sm text-green-200">
                    <Check className="w-4 h-4 text-green-400" />
                    {t}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center md:justify-end">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={IMG.luoi} alt="Khăn Đồ Xôi Bếp Cô Hạ 1m×1m" className="w-full max-w-xs md:max-w-sm object-contain" loading="eager" />
            </div>
          </div>
        </div>
      </section>

      {/* ── [2] Trust Bar ────────────────────────────────────────────────────── */}
      <section className="bg-[#0D3B22] text-white border-t border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 grid grid-cols-2 sm:grid-cols-4">
          {[
            { n: '149+', l: 'Thành viên group' },
            { n: '4.9 ★', l: 'Đánh giá khách' },
            { n: '1000+', l: 'Lần dùng được' },
            { n: '49k',  l: 'Giá tốt nhất' },
          ].map((s, i) => (
            <div key={s.l} className={`text-center px-3 py-2.5 ${i < 3 ? 'border-r border-white/20' : ''}`}>
              <p className="text-xl font-extrabold text-[#F0B429]">{s.n}</p>
              <p className="text-green-300 text-xs mt-0.5">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── UY TÍN ───────────────────────────────────────────────────────────── */}
      <section className="py-14 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto fu">
          <div className="text-center mb-8">
            <span className="inline-block border border-amber-300 bg-amber-50 text-amber-700 font-bold text-xs px-4 py-1.5 rounded-full tracking-widest mb-3">THƯƠNG HIỆU UY TÍN</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800">
              Bếp Cô Hạ — Triệu Lượt Xem<br />
              <span className="text-amber-600">Trên TikTok, YouTube, Facebook</span>
            </h2>
            <p className="text-gray-500 mt-2 text-sm max-w-lg mx-auto">Không phải thương hiệu mới — Cô Hạ đã chia sẻ hàng trăm video nấu ăn được triệu người theo dõi</p>
          </div>
          <div className="grid grid-cols-3 gap-5 mb-8 max-w-3xl mx-auto">
            {[
              { src: '/images/bep-co-ha/uy-tin/z7730296537408_96f9db97736016c93f9a740985d04d41.jpg', label: 'Cộng đồng Hacofood' },
              { src: '/images/bep-co-ha/uy-tin/z7730296545695_e2cd4f391ad3a8ae76f1e8d8d6651042.jpg', label: 'TikTok & YouTube viral' },
              { src: '/images/bep-co-ha/uy-tin/z7730387539278_d0ddcc6f279597ec3196aeae9a0af2ec.jpg', label: 'Hàng triệu lượt xem' },
            ].map(img => (
              <div key={img.label} className="rounded-2xl overflow-hidden shadow-md bg-white border border-gray-100 flex flex-col">
                <div className="h-52 sm:h-64 flex items-center justify-center bg-gray-50 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.src} alt={img.label} className="w-full h-full object-contain" />
                </div>
                <p className="text-center text-xs font-semibold text-gray-600 py-2.5 px-2 leading-tight">{img.label}</p>
              </div>
            ))}
          </div>
          <div className="bg-[#F0FBE8] rounded-3xl p-6 text-center max-w-2xl mx-auto border border-green-100">
            <p className="text-[#3F6B2E] font-bold text-lg mb-2">&ldquo;Cô Hạ làm từ tâm – công thức chia sẻ thật sự, nguyên liệu chọn thật sự, kết quả thật sự.&rdquo;</p>
            <p className="text-green-700 text-sm italic">– Bếp Cô Hạ, Hacofood.vn</p>
          </div>
        </div>
      </section>

      {/* ── [3] Pain — 3 lớp (Symptom · Consequence · Identity) ─────────────── */}
      <section className="py-14 px-4 sm:px-6 bg-white">
        <div className="max-w-2xl mx-auto fu">
          <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-3">Bạn có đang gặp điều này?</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0D3B22] mb-8">
            Mỗi Lần Đồ Xôi Là Một Lần<br />
            <span className="text-red-500">Hồi Hộp Không Biết Ra Sao</span>
          </h2>

          <div className="space-y-4">
            {[
              {
                icon: '😰',
                sym: 'Xôi dính chảo, lấy ra bị nát',
                con: 'Phải gỡ từng miếng, mất 10–15 phút dọn dẹp sau. Xôi trông xấu, mang ra không được.',
                ide: '"Người quen nấu xôi mà sao khó thế... chắc mình không có khiếu?"',
              },
              {
                icon: '😤',
                sym: 'Dùng khăn màn mỏng — hơi ngưng tụ, xôi ướt nhão',
                con: 'Hạt gạo vỡ, nát bét. Nếu nấu để bán thì khách chê ngay lần đầu.',
                ide: '"Đồ đi đồ lại 3 lần vẫn không ổn — mất thêm 30 phút gas + thời gian."',
              },
              {
                icon: '😩',
                sym: 'Hơi không thoát đều — chỗ sống chỗ chín',
                con: 'Lật ra phần dưới chín nhưng phần trên còn cứng. Phải đổ vào đồ lại.',
                ide: '"Mua bao nhiêu khăn màn rồi mà vẫn không cái nào đúng chuẩn."',
              },
            ].map((item, i) => (
              <div key={i} className="border border-red-100 rounded-2xl overflow-hidden">
                <div className="bg-red-50 px-5 py-3 flex items-center gap-3">
                  <span className="text-2xl" aria-hidden="true">{item.icon}</span>
                  <p className="font-bold text-gray-800 text-sm">{item.sym}</p>
                </div>
                <div className="px-5 py-3 space-y-1.5">
                  <p className="text-gray-600 text-sm">{item.con}</p>
                  <p className="text-red-400 text-xs italic">{item.ide}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA #1 — After Pain */}
          <div className="mt-7 bg-[#F4FCF7] rounded-2xl p-5 text-center border border-[#C8E6D0]">
            <p className="text-gray-700 text-base">
              Không phải lỗi kỹ thuật. Không phải do gạo.<br />
              <strong className="text-[#155C34]">Chỉ vì thiếu đúng một chiếc khăn.</strong>
            </p>
            <button onClick={scrollToOrder}
              className="mt-4 inline-flex items-center gap-2 bg-[#F0B429] text-[#0D3B22] font-extrabold px-8 py-3 rounded-2xl min-h-[48px] hover:bg-[#e8a820] transition-all active:scale-95 text-base shadow-md">
              Đặt Khăn Đúng Ngay →
            </button>
          </div>
        </div>
      </section>

      {/* ── [4] Solution Bridge — Before/After Story (B.5) ───────────────────── */}
      <section className="py-14 px-4 sm:px-6 bg-[#F4FCF7]">
        <div className="max-w-5xl mx-auto fu">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 rounded-2xl overflow-hidden shadow-md" style={{ aspectRatio: '16/9' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={IMG.xoicho} alt="Xôi chín đều ráo hạt trong chõ" className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="rounded-xl overflow-hidden shadow-sm" style={{ aspectRatio: '1' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={IMG.phu} alt="Phủ khăn giữ nhiệt" className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="rounded-xl overflow-hidden shadow-sm" style={{ aspectRatio: '1' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={IMG.gapgon} alt="Khăn gấp gọn" className="w-full h-full object-cover" loading="lazy" />
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-[#27AE60] uppercase tracking-widest mb-3">Câu chuyện thật</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0D3B22] mb-4 leading-snug">
                Cô Hạ Thử Hàng Chục Loại Vải<br />
                Trước Khi Tìm Ra Đúng Cái Này
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4 text-sm italic border-l-4 border-[#C8E6D0] pl-4">
                "Ban đầu tôi cũng dùng khăn màn như mọi người. Xôi lúc thì nhão, lúc thì sống một chỗ.
                Thử đủ loại vải mấy năm — thô, mịn, dày, mỏng — hầu hết đều sai."
              </p>
              <p className="text-gray-600 leading-relaxed mb-6 text-sm">
                Sau nhiều lần thử sai, Cô Hạ tìm ra loại vải lưới có mắt vừa thưa để hơi thoát đều,
                vừa đủ dày để giữ hạt. <strong className="text-[#155C34]">Đây là chiếc khăn Cô Hạ dùng mỗi ngày</strong> — và bây giờ muốn chia sẻ với bạn.
              </p>
              <div className="space-y-3">
                {[
                  { t: 'Hơi thoát đều từ dưới lên', d: 'Mắt lưới chuẩn — không còn chỗ sống chỗ chín.' },
                  { t: 'Phủ trên hút ẩm — xôi không nhão', d: 'Hơi ngưng tụ vào vải thay vì rơi xuống xôi.' },
                  { t: 'Chống dính hoàn toàn', d: 'Lấy ra nguyên miếng, đẹp như mua ngoài hàng.' },
                  { t: '1m×1m · dùng 1000+ lần', d: 'Giặt sạch, phơi khô, dùng tiếp — không mua lại.' },
                ].map(item => (
                  <div key={item.t} className="flex gap-3 items-start">
                    <div className="w-5 h-5 rounded-full bg-[#155C34] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-[#0D3B22] text-sm">{item.t}</p>
                      <p className="text-gray-500 text-sm leading-relaxed">{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── [5] How It Works — Clarity 5 bước ───────────────────────────────── */}
      <section className="py-14 px-4 sm:px-6 bg-white">
        <div className="max-w-2xl mx-auto fu">
          <p className="text-xs font-bold text-[#27AE60] uppercase tracking-widest mb-3">Cách dùng</p>
          <h2 className="text-2xl font-extrabold text-[#0D3B22] mb-8">5 Bước — Không Cần Học Thêm Gì Cả</h2>
          <div className="space-y-2">
            {[
              { n: '01', t: 'Ngâm nếp 4–8 tiếng',          d: 'Nếp nở đều → đồ nhanh hơn, chín đều hơn.' },
              { n: '02', t: 'Làm ẩm khăn, lót vào chõ',    d: 'Khăn ẩm (không ướt đẫm) — hơi thấm qua đều, không đọng nước.' },
              { n: '03', t: 'Đổ nếp, phủ khăn lên trên',   d: 'Khăn phủ hút hơi ngưng tụ — xôi không bị ướt từ trên xuống.' },
              { n: '04', t: 'Đồ 30–40 phút, lật đảo 1 lần',d: 'Lật ở phút 20 — phần trên xuống dưới, chín đều 100%.' },
              { n: '05', t: 'Ủ 5 phút rồi lấy ra',          d: 'Xôi ráo, hạt bóng, lấy ra không dính khăn.' },
            ].map((s, i) => (
              <div key={i} className="flex gap-4 items-start p-4 rounded-xl hover:bg-[#F4FCF7] transition-colors group">
                <div className="bg-[#155C34] group-hover:bg-[#0D3B22] text-white rounded-xl w-11 h-11 flex items-center justify-center font-extrabold text-sm flex-shrink-0 transition-colors">{s.n}</div>
                <div className="pt-0.5">
                  <p className="font-bold text-[#0D3B22]">{s.t}</p>
                  <p className="text-gray-500 text-sm mt-0.5">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── [6] Features — FAB + So sánh ────────────────────────────────────── */}
      <section className="py-14 px-4 sm:px-6 bg-[#F4FCF7]">
        <div className="max-w-3xl mx-auto fu">
          <p className="text-xs font-bold text-[#27AE60] uppercase tracking-widest mb-3 text-center">Tại sao khác biệt</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0D3B22] mb-2 text-center">
            Không Phải Khăn Nào Cũng Như Nhau
          </h2>
          <p className="text-gray-500 text-center text-sm mb-8">4 điểm tạo ra sự khác biệt</p>

          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {[
              {
                icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"/></svg>,
                title: 'Mắt lưới chuẩn kỹ thuật',
                feat: 'Lỗ lưới vừa đủ — hơi đi qua đều, hạt gạo không lọt.',
                benefit: 'Xôi chín đều 100% — không chỗ sống, không chỗ nhão.',
              },
              {
                icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>,
                title: 'May viền 4 cạnh bền chắc',
                feat: 'Đường viền may kép — không bị tua, không sổ sau nhiều lần giặt.',
                benefit: 'Dùng 1000+ lần vẫn nguyên vẹn — không mua đi mua lại.',
              },
              {
                icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>,
                title: 'Vải thực phẩm — không mùi',
                feat: 'Không ra màu, không có mùi lạ khi hấp nhiệt độ cao.',
                benefit: 'An toàn cho gia đình — Cô Hạ dùng cho nhà mình trước khi bán.',
              },
              {
                icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>,
                title: 'Kích thước 1m×1m đa năng',
                feat: 'Gấp đôi cho chõ nhỏ, căng rộng cho chõ to.',
                benefit: 'Một chiếc dùng mọi cỡ nồi — không cần mua nhiều loại.',
              },
            ].map(item => (
              <div key={item.title} className="bg-white rounded-2xl p-5 border border-[#C8E6D0] shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-[#F4FCF7] rounded-xl flex items-center justify-center text-[#155C34] mb-3">
                  {item.icon}
                </div>
                <h3 className="font-bold text-[#0D3B22] mb-1">{item.title}</h3>
                <p className="text-gray-500 text-xs mb-2">{item.feat}</p>
                <p className="text-[#155C34] text-sm font-semibold">→ {item.benefit}</p>
              </div>
            ))}
          </div>

          {/* Before / After comparison table */}
          <div className="bg-white rounded-2xl border border-[#C8E6D0] overflow-hidden shadow-sm">
            <div className="grid grid-cols-2 divide-x divide-[#E8F5EC]">
              <div className="p-4 bg-red-50">
                <p className="font-bold text-red-500 text-sm mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                  Khăn màn thường
                </p>
                {['Hơi ngưng tụ, xôi ướt', 'Lỗ lưới sai size', 'Viền mau sờn', 'Bám mùi sau giặt'].map(t => (
                  <p key={t} className="text-xs text-gray-500 py-1.5 border-b border-red-100 last:border-0">{t}</p>
                ))}
              </div>
              <div className="p-4 bg-[#F4FCF7]">
                <p className="font-bold text-[#155C34] text-sm mb-3 flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#155C34]" />
                  Khăn Đồ Xôi Cô Hạ
                </p>
                {['Hơi thoát đều, xôi ráo', 'Mắt lưới chuẩn kỹ thuật', 'May viền kép bền chắc', 'Không mùi sau giặt'].map(t => (
                  <p key={t} className="text-xs text-[#0D3B22] font-medium py-1.5 border-b border-[#C8E6D0] last:border-0">{t}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── [8] Authority Stack — Cô Hạ origin story ─────────────────────────── */}
      <section className="py-14 px-4 sm:px-6 bg-[#0D3B22] text-white">
        <div className="max-w-3xl mx-auto fu">
          <p className="text-xs font-bold text-[#F0B429] uppercase tracking-widest mb-3">Tại sao tin Cô Hạ?</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-6 leading-snug">
            Người Dạy Nấu Xôi Online<br />
            <span className="text-[#F0B429]">Cho Cả Nghìn Gia Đình Việt</span>
          </h2>

          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { n: '149+', l: 'Thành viên\ngroup nấu ăn', ico: '👩‍🍳' },
              { n: '5+ năm', l: 'Dạy nấu ăn\nonline', ico: '📚' },
              { n: '1000+', l: 'Lần tự dùng\nkhăn này', ico: '🧺' },
            ].map(s => (
              <div key={s.l} className="bg-white/10 rounded-2xl p-4 text-center border border-white/20">
                <p className="text-2xl mb-1" aria-hidden="true">{s.ico}</p>
                <p className="text-xl font-extrabold text-[#F0B429]">{s.n}</p>
                <p className="text-green-300 text-xs mt-1 whitespace-pre-line leading-snug">{s.l}</p>
              </div>
            ))}
          </div>

          <div className="bg-white/10 rounded-2xl p-5 border border-white/20">
            <p className="text-green-100 leading-relaxed text-sm">
              <em>"Tôi không bán sản phẩm tôi chưa dùng. Chiếc khăn này nằm trong bếp nhà tôi nhiều năm — qua hàng trăm nồi xôi, từ xôi gấc đám cưới đến xôi ngũ sắc giỗ chạp. Khi học trò hỏi nên mua khăn gì, câu trả lời luôn là cái này."</em>
            </p>
            <p className="text-[#F0B429] font-bold text-sm mt-3">— Cô Hạ · Hacofood.vn</p>
          </div>

          {/* CTA #2 — After Authority */}
          <div className="mt-8 text-center">
            <button onClick={scrollToOrder}
              className="inline-flex items-center gap-2 bg-[#F0B429] text-[#0D3B22] font-extrabold px-10 py-3.5 rounded-2xl min-h-[52px] hover:bg-[#e8a820] transition-all active:scale-95 text-lg shadow-lg">
              Đặt Hàng Ngay → {fmt(PRICE)}
            </button>
          </div>
        </div>
      </section>

      {/* ── [7] Testimonials — Social Proof ──────────────────────────────────── */}
      <section className="py-14 px-4 sm:px-6 bg-white">
        <div className="max-w-3xl mx-auto fu">
          <p className="text-xs font-bold text-[#27AE60] uppercase tracking-widest mb-3">Khách hàng nói gì</p>
          <h2 className="text-2xl font-extrabold text-[#0D3B22] mb-8">
            Người Biết Nấu Xôi Ngon<br />
            Đều Biết Chọn Đúng Khăn
          </h2>

          <div className="rounded-2xl overflow-hidden shadow-md mb-8 max-w-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMG.review} alt="Đánh giá thật từ khách hàng" className="w-full object-contain" loading="lazy" />
          </div>

          <div className="space-y-4">
            {[
              { name: 'Chị Lan · Hà Nội',   tag: 'Nấu cho gia đình', text: '"Trước giờ đồ xôi hay bị dính chảo, gỡ ra mất công mà xôi nát. Từ hôm có khăn này là không bao giờ bị nữa. Xôi ráo đẹp, hạt bóng. Con bé khen ngon hơn hẳn mấy lần trước."' },
              { name: 'Chị Hương · TP.HCM', tag: 'Mua lần 2',        text: '"Mua 2 cái dùng thay nhau. Giặt xong vẫn thơm tho, không bị mùi. Size 1m×1m vừa đúng cho nồi nhà mình. Ship nhanh, hàng đẹp."' },
              { name: 'Cô Minh · Đà Nẵng',  tag: 'Nấu xôi bán',     text: '"Nấu xôi bán hàng ngày nên cần khăn bền. Dùng được mấy tháng rồi vẫn tốt như mới. So với khăn màn trước thì khác xa — xôi ráo, không bị nhão từ trên xuống."' },
            ].map((r, i) => (
              <div key={i} className="bg-[#F4FCF7] rounded-2xl p-5 border border-[#C8E6D0] shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-[#0D3B22] text-sm">{r.name}</p>
                    <span className="inline-block bg-[#155C34]/10 text-[#155C34] text-xs font-semibold px-2 py-0.5 rounded-full mt-1">{r.tag}</span>
                  </div>
                  <Stars />
                </div>
                <p className="text-gray-700 text-sm leading-relaxed italic">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── [9] Value Stack — Giá trị + ROI ─────────────────────────────────── */}
      <section className="py-12 px-4 sm:px-6 bg-[#0D3B22] text-white">
        <div className="max-w-2xl mx-auto text-center fu">
          <h2 className="text-xl sm:text-2xl font-extrabold mb-2">Tính Ra Chỉ...</h2>
          <p className="text-green-300 text-sm mb-8">Đầu tư một lần, dùng cả nghìn lần</p>

          <div className="flex justify-center gap-3 mb-6 flex-wrap items-center">
            <div className="bg-white/10 rounded-2xl p-4 text-center min-w-[95px]">
              <p className="text-2xl font-extrabold text-[#F0B429]">49k</p>
              <p className="text-green-300 text-xs mt-1">Giá 1 chiếc</p>
            </div>
            <span className="text-green-300 text-2xl font-bold">÷</span>
            <div className="bg-white/10 rounded-2xl p-4 text-center min-w-[95px]">
              <p className="text-2xl font-extrabold text-[#F0B429]">1000+</p>
              <p className="text-green-300 text-xs mt-1">Lần dùng</p>
            </div>
            <span className="text-green-300 text-2xl font-bold">=</span>
            <div className="bg-[#F0B429] rounded-2xl p-4 text-center min-w-[95px] ring-2 ring-yellow-300">
              <p className="text-2xl font-extrabold text-[#0D3B22]">~49đ</p>
              <p className="text-[#155C34] text-xs font-bold mt-1">Mỗi lần nấu</p>
            </div>
          </div>

          <p className="text-green-200 text-sm max-w-sm mx-auto mb-6">
            49.000đ — rẻ hơn một ly cà phê — mà mang lại hàng nghìn nồi xôi ngon cho gia đình.
          </p>

          {/* CTA #3 — After Value Stack */}
          <button onClick={scrollToOrder}
            className="bg-[#F0B429] hover:bg-[#e8a820] text-[#0D3B22] font-extrabold px-10 min-h-[52px] rounded-2xl transition-all active:scale-95 text-lg shadow-lg">
            Đặt Hàng Ngay — {fmt(PRICE)} →
          </button>
        </div>
      </section>

      {/* ── [10] Guarantee — Risk Reversal ───────────────────────────────────── */}
      <section className="py-12 px-4 sm:px-6 bg-white">
        <div className="max-w-2xl mx-auto fu">
          <div className="border-2 border-[#C8E6D0] rounded-3xl p-6 sm:p-8 text-center">
            <div className="w-16 h-16 bg-[#F4FCF7] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#27AE60]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <h3 className="font-extrabold text-xl text-[#0D3B22] mb-2">Cam Kết Đổi Trả Nếu Lỗi</h3>
            <p className="text-gray-600 text-sm leading-relaxed max-w-md mx-auto">
              Nếu nhận hàng bị lỗi sản xuất — may viền sờn ngay từ đầu, vải bị lỗi — Cô Hạ đổi trả miễn phí.
              Gửi ảnh về inbox Facebook là giải quyết ngay trong ngày.
            </p>
            <p className="text-[#27AE60] font-bold text-sm mt-3">Bạn không có gì để mất cả.</p>
          </div>
        </div>
      </section>

      {/* ── [11] Is For / Not For — Clarity ─────────────────────────────────── */}
      <section className="py-12 px-4 sm:px-6 bg-[#F4FCF7]">
        <div className="max-w-2xl mx-auto fu">
          <h2 className="text-2xl font-extrabold text-[#0D3B22] mb-6 text-center">Khăn Này Dành Cho Ai?</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-[#C8E6D0] shadow-sm">
              <p className="font-bold text-[#155C34] mb-3 flex items-center gap-2">
                <Check className="w-5 h-5 text-[#155C34]" />
                Phù hợp với bạn nếu...
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                {['Hay nấu xôi cho gia đình 3–5 người', 'Chuẩn bị tiệc, giỗ chạp, cúng lễ', 'Đang học nấu xôi lần đầu', 'Bán xôi — cần chất lượng ổn định mỗi ngày', 'Muốn dụng cụ bền, dùng lâu dài'].map(t => (
                  <li key={t} className="flex gap-2 items-start">
                    <Check className="w-4 h-4 text-[#27AE60] mt-0.5" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <p className="font-bold text-gray-400 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                Có thể chưa cần nếu...
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                {['Bạn chỉ nấu cơm, không nấu xôi', 'Đã có khăn chuyên dụng hoạt động tốt', 'Chỉ hấp thức ăn thông thường'].map(t => (
                  <li key={t} className="flex gap-2 items-start">
                    <svg className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── [12] FAQ — Xử lý từ chối ────────────────────────────────────────── */}
      <section className="py-14 px-4 sm:px-6 bg-white">
        <div className="max-w-2xl mx-auto fu">
          <h2 className="text-2xl font-extrabold text-[#0D3B22] mb-6 text-center">Câu Hỏi Thường Gặp</h2>
          <div className="space-y-3">
            {[
              { q: 'Size 1m×1m có quá to cho nồi nhỏ không?',    a: 'Không. Kích thước 1m×1m đủ để gấp đôi lại khi dùng cho chõ nhỏ. Một chiếc dùng được nhiều kích cỡ nồi khác nhau — rất tiện.' },
              { q: 'Dùng xong giặt thế nào?',                      a: 'Giặt tay bằng xà phòng loãng, xả sạch, phơi nơi thoáng mát. Không cần máy sấy, không ngâm chất tẩy mạnh. Vải giữ được hình dạng qua rất nhiều lần giặt.' },
              { q: 'Vải có an toàn thực phẩm không?',              a: 'Có. Cô Hạ chọn vải không mùi lạ, không ra màu khi hấp ở nhiệt độ cao. Được dùng trực tiếp cho nhà Cô Hạ trước khi đưa ra bán.' },
              { q: 'Tôi chưa bao giờ đồ xôi, dùng có dễ không?',  a: 'Dùng được ngay. Khăn giúp người mới bắt đầu thành công hơn — không lo dính chảo, hơi đi đều tự nhiên. Cô Hạ có thể tư vấn thêm qua inbox nếu cần.' },
              { q: 'Ship đến bao lâu? Có theo dõi đơn không?',    a: 'Nội thành: 2–4 ngày. Tỉnh xa: 3–5 ngày. Cô Hạ gửi mã vận đơn để bạn theo dõi trực tiếp sau khi đơn được xác nhận.' },
              { q: 'Giá 49.000đ đã bao gồm phí ship chưa?',       a: 'Chưa. 49.000đ là giá sản phẩm. Phí vận chuyển tính riêng khi giao, tùy khu vực — thường từ 20.000đ–35.000đ.' },
              { q: 'Nếu hàng bị lỗi thì sao?',                    a: 'Cô Hạ đổi trả miễn phí nếu lỗi sản xuất (may viền sờn, vải lỗi). Gửi ảnh về Facebook Bếp Cô Hạ, xử lý trong ngày.' },
            ].map(item => <Faq key={item.q} q={item.q} a={item.a} />)}
          </div>
        </div>
      </section>

      {/* ── [13] Order Form — CTA cuối ───────────────────────────────────────── */}
      <section ref={orderRef} id="dat-hang" className="py-16 px-4 sm:px-6 bg-[#F4FCF7]">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <p className="text-xs font-bold text-[#27AE60] uppercase tracking-widest mb-2">Đặt hàng ngay</p>
            <h2 className="text-2xl font-extrabold text-[#0D3B22]">
              Mang Về Bếp Hôm Nay —<br />
              <span className="text-[#155C34]">Nồi Xôi Tới Ngon Hơn Liền</span>
            </h2>
            <p className="text-gray-500 text-sm mt-2">Giao tận nhà · Chuyển khoản · Hàng chính hãng từ Bếp Cô Hạ</p>
          </div>
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C8E6D0] shadow-lg">
            <OrderForm />
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-gray-400">
            <span>🔒 Bảo mật thông tin</span><span>·</span>
            <span>🚚 Ship toàn quốc</span><span>·</span>
            <span>↩ Đổi trả nếu lỗi SX</span><span>·</span>
            <span>💬 Hỗ trợ qua Facebook</span>
          </div>
        </div>
      </section>

      {/* ── [14] Footer ──────────────────────────────────────────────────────── */}
      <footer className="bg-[#0D3B22] text-green-300 py-10 px-4 text-center text-sm">
        <div className="max-w-xl mx-auto space-y-3">
          <div className="flex justify-center">
            <div className="bg-white rounded-xl px-4 py-2 inline-flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo-bep-co-ha.png" alt="Bếp Cô Hạ" className="h-9 w-9 object-contain"
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
              <div className="text-left">
                <p className="text-[#0D3B22] font-extrabold text-sm leading-tight">Bếp Cô Hạ</p>
                <p className="text-gray-400 text-xs">Hacofood.vn</p>
              </div>
            </div>
          </div>
          <p className="text-green-400 font-semibold">Khăn Đồ Xôi 1m×1m — Vải lưới hấp xôi chuyên dụng</p>
          <p>Liên hệ: <strong className="text-white">Facebook Bếp Cô Hạ</strong></p>
          <p className="text-green-600 text-xs pt-2">© 2025 Hacofood.vn · Bếp Cô Hạ. All rights reserved.</p>
        </div>
      </footer>

      {/* ── Sticky CTA Bar ───────────────────────────────────────────────────── */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 p-3 pb-4 bg-white/95 backdrop-blur-sm border-t border-[#C8E6D0] transition-all duration-300 ${showSticky ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'}`}
        aria-hidden={!showSticky}>
        <div className="max-w-sm mx-auto">
          <button onClick={scrollToOrder}
            className="w-full min-h-[52px] rounded-2xl font-extrabold text-[#0D3B22] text-lg bg-[#F0B429] hover:bg-[#e8a820] shadow-lg active:scale-95 transition-all">
            ĐẶT HÀNG NGAY — {fmt(PRICE)} →
          </button>
        </div>
      </div>

      {/* ── Zalo Float ───────────────────────────────────────────────────────── */}
      <a
        href="https://zalo.me/0965387487"
        target="_blank"
        rel="noopener noreferrer"
        className={`fixed right-4 z-40 transition-all duration-300 ${showSticky ? 'bottom-[76px]' : 'bottom-5'}`}
        aria-label="Nhắn Zalo Cô Hạ tư vấn">
        <div className="w-14 h-14 rounded-full shadow-xl bg-[#0068FF] flex items-center justify-center hover:scale-110 transition-transform active:scale-95">
          <svg viewBox="0 0 24 24" className="w-8 h-8" fill="white" aria-hidden="true">
            <path d="M12 2C6.477 2 2 6.254 2 11.5c0 2.252.84 4.313 2.228 5.908L3 21l3.75-1.174A10.1 10.1 0 0012 21c5.523 0 10-4.254 10-9.5S17.523 2 12 2zm-2.5 8.5a1 1 0 110 2 1 1 0 010-2zm2.5 0a1 1 0 110 2 1 1 0 010-2zm2.5 0a1 1 0 110 2 1 1 0 010-2z"/>
          </svg>
        </div>
      </a>

    </div>
  )
}
