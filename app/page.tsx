'use client'

import { useState, useRef, useEffect } from 'react'

// ── Image paths ────────────────────────────────────────────────────────────────
const IMG = '/images/khan-do-xoi/'

const SAN_PHAM = [
  { src: IMG + '724597989_1683075906108439_2952143396022032152_n.jpg', label: 'Vải lưới mắt thưa – hơi nước thoát đều' },
  { src: IMG + '706035495_1627795419070070_876115190267151157_n.jpg',  label: 'Khăn dày dặn, may viền chắc chắn' },
]

const THANH_PHAM = [
  { src: IMG + '724485203_2296217747574178_5800612475932619747_n.jpg', label: 'Xôi chín đều, ráo hạt, không dính chảo' },
  { src: IMG + '724613553_990229680459328_6428958116600383338_n.jpg',  label: 'Review thật từ khách: "xôi ráo ngon hơn hẳn"' },
  { src: IMG + '722995300_1362690915719266_3411856794429446282_n.jpg', label: 'Khăn phủ giữ nhiệt – xôi không bị nhão' },
]

const PRICES: Record<string, number> = { 'nho': 35000, 'lon': 59000 }

function fmt(n: number) { return n.toLocaleString('vi-VN') + 'đ' }

// ── Countdown ─────────────────────────────────────────────────────────────────
function Countdown({ seconds }: { seconds: number }) {
  const [left, setLeft] = useState(seconds)
  useEffect(() => {
    if (left <= 0) return
    const t = setTimeout(() => setLeft(l => l - 1), 1000)
    return () => clearTimeout(t)
  }, [left])
  const m = Math.floor(left / 60).toString().padStart(2, '0')
  const s = (left % 60).toString().padStart(2, '0')
  return <span className={left < 120 ? 'text-red-500 font-bold' : 'font-bold text-[#92400E]'}>{m}:{s}</span>
}

// ── Payment Step ──────────────────────────────────────────────────────────────
interface PaymentData {
  refCode: string
  totalPrice: number
  productLabel: string
  qr: { bankAccount: string; bankCode: string; accountName: string; amount: number; content: string; qrUrl: string }
}
interface FormState {
  name: string; phone: string; email: string; address: string
  product: 'nho' | 'lon'; quantity: number; note: string
}

function PaymentStep({ data, form }: { data: PaymentData; form: FormState }) {
  const [copied, setCopied] = useState<'ref' | 'amount' | null>(null)
  function copy(text: string, type: 'ref' | 'amount') {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    })
  }
  return (
    <div className="space-y-5">
      <div className="text-center">
        <p className="text-[#92400E] font-extrabold text-lg mb-0.5">Bước 2: Chuyển khoản để xác nhận đơn</p>
        <p className="text-gray-500 text-sm">Quét QR hoặc chuyển khoản thủ công trong <Countdown seconds={30 * 60} /></p>
      </div>

      <div className="flex justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={data.qr.qrUrl} alt="QR chuyển khoản"
          className="w-52 h-52 rounded-2xl border-4 border-[#B45309] shadow-lg object-contain bg-white" />
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2.5 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Ngân hàng</span>
          <span className="font-bold">{data.qr.bankCode} – {data.qr.accountName}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Số tài khoản</span>
          <span className="font-bold font-mono">{data.qr.bankAccount}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Số tiền</span>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#B45309] text-base">{fmt(data.totalPrice)}</span>
            <button onClick={() => copy(String(data.totalPrice), 'amount')}
              className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-700 px-2 py-0.5 rounded-lg transition-colors">
              {copied === 'amount' ? '✓ Đã copy' : 'Copy'}
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center border-t border-amber-100 pt-2.5">
          <span className="text-gray-500">Nội dung CK <span className="text-red-500 font-bold">(bắt buộc)</span></span>
          <div className="flex items-center gap-2">
            <span className="font-extrabold font-mono text-[#92400E]">{data.refCode}</span>
            <button onClick={() => copy(data.refCode, 'ref')}
              className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-700 px-2 py-0.5 rounded-lg transition-colors">
              {copied === 'ref' ? '✓ Đã copy' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-xs text-orange-800">
        ⚠️ Nhập <strong>đúng nội dung</strong> <code className="bg-orange-100 px-1 rounded">{data.refCode}</code> khi chuyển khoản – hệ thống tự động xác nhận và đơn hàng chuyển ngay sang trạng thái <strong>Chờ chuyển hàng</strong>.
      </div>

      <div className="text-center text-sm text-gray-400 pt-1">
        <p>Đơn của <strong>{form.name}</strong> · {data.productLabel} × {form.quantity}</p>
        <p className="mt-1">Sau khi chuyển khoản, đơn được xử lý tự động – không cần chờ xác nhận.</p>
      </div>
    </div>
  )
}

// ── Order Form ─────────────────────────────────────────────────────────────────
function OrderForm() {
  const [form, setForm] = useState<FormState>({
    name: '', phone: '', email: '', address: '',
    product: 'nho', quantity: 1, note: '',
  })
  const [step, setStep] = useState<'idle' | 'loading' | 'payment' | 'error'>('idle')
  const [error, setError] = useState('')
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)

  const total = PRICES[form.product] * form.quantity

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm(f => ({ ...f, [k]: v }))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      setError('Vui lòng điền đủ: Họ tên, Số điện thoại, Địa chỉ')
      return
    }
    setStep('loading')
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Lỗi')
      setPaymentData(data)
      setStep('payment')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
      setStep('error')
    }
  }

  if (step === 'payment' && paymentData) {
    return <PaymentStep data={paymentData} form={form} />
  }

  const products = [
    { key: 'nho' as const, label: 'Nhỏ 60×60cm', sub: 'Gia đình 1–2kg nếp', icon: '🧺', popular: false },
    { key: 'lon' as const, label: 'Lớn 90×100cm', sub: 'Đặt tiệc 3–4kg nếp', icon: '🪣', popular: true },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Product Selection */}
      <div>
        <p className="font-bold text-gray-700 mb-2">Chọn kích thước *</p>
        <div className="grid grid-cols-2 gap-3">
          {products.map(p => (
            <button type="button" key={p.key}
              onClick={() => set('product', p.key)}
              className={`border-2 rounded-xl p-4 text-center transition-all ${
                form.product === p.key
                  ? 'border-[#B45309] bg-amber-50'
                  : 'border-gray-200 hover:border-amber-300'
              }`}>
              <span className="text-2xl">{p.icon}</span>
              <p className="font-extrabold text-base text-[#92400E] mt-1">{p.label}</p>
              <p className="text-[#B45309] font-bold text-base">{fmt(PRICES[p.key])}</p>
              <p className="text-xs text-gray-500 mt-0.5">{p.sub}</p>
              {p.popular && <p className="text-xs text-amber-600 font-semibold mt-0.5">Phổ biến nhất</p>}
            </button>
          ))}
        </div>
      </div>

      {/* Quantity */}
      <div>
        <label className="font-bold text-gray-700 mb-2 block">Số lượng *</label>
        <div className="flex items-center gap-3">
          <button type="button"
            onClick={() => set('quantity', Math.max(1, form.quantity - 1))}
            className="w-10 h-10 rounded-full border-2 border-gray-200 text-xl font-bold hover:border-amber-400 transition-colors flex items-center justify-center">
            −
          </button>
          <span className="w-10 text-center font-bold text-xl text-[#92400E]">{form.quantity}</span>
          <button type="button"
            onClick={() => set('quantity', Math.min(20, form.quantity + 1))}
            className="w-10 h-10 rounded-full border-2 border-gray-200 text-xl font-bold hover:border-amber-400 transition-colors flex items-center justify-center">
            +
          </button>
          <span className="ml-2 text-sm text-gray-500">Tổng: <strong className="text-[#B45309] text-base">{fmt(total)}</strong></span>
        </div>
      </div>

      {/* Personal Info */}
      <div>
        <label className="font-bold text-gray-700 mb-2 block">Họ và tên *</label>
        <input value={form.name} onChange={e => set('name', e.target.value)}
          placeholder="Ví dụ: Nguyễn Thị Lan"
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-[#B45309] focus:outline-none transition-colors" />
      </div>
      <div>
        <label className="font-bold text-gray-700 mb-2 block">Số điện thoại *</label>
        <input value={form.phone} onChange={e => set('phone', e.target.value)}
          placeholder="0912 345 678" type="tel"
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-[#B45309] focus:outline-none transition-colors" />
      </div>
      <div>
        <label className="font-bold text-gray-700 mb-2 block">Email <span className="text-gray-400 font-normal">(không bắt buộc)</span></label>
        <input value={form.email} onChange={e => set('email', e.target.value)}
          placeholder="email@gmail.com" type="email"
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-[#B45309] focus:outline-none transition-colors" />
      </div>
      <div>
        <label className="font-bold text-gray-700 mb-2 block">Địa chỉ giao hàng chi tiết *</label>
        <textarea value={form.address} onChange={e => set('address', e.target.value)}
          placeholder="Số nhà, ngõ/hẻm, đường, phường/xã, quận/huyện, tỉnh/thành phố"
          rows={3}
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-[#B45309] focus:outline-none transition-colors resize-none" />
      </div>
      <div>
        <label className="font-bold text-gray-700 mb-2 block">Ghi chú <span className="text-gray-400 font-normal">(không bắt buộc)</span></label>
        <input value={form.note} onChange={e => set('note', e.target.value)}
          placeholder="Giao giờ nào, yêu cầu đặc biệt..."
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-[#B45309] focus:outline-none transition-colors" />
      </div>

      {error && (
        <p className="text-red-500 text-sm bg-red-50 rounded-xl py-2.5 px-4 text-center">{error}</p>
      )}

      <button type="submit" disabled={step === 'loading'}
        className="w-full py-4 rounded-2xl font-extrabold text-white text-lg bg-gradient-to-r from-[#B45309] to-[#92400E] hover:from-[#92400E] hover:to-[#B45309] transition-all active:scale-95 disabled:opacity-60 shadow-lg shadow-amber-200">
        {step === 'loading'
          ? <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>Đang gửi đơn...
            </span>
          : '🛒 ĐẶT HÀNG NGAY – NHẬN QR CHUYỂN KHOẢN'}
      </button>
      <p className="text-xs text-gray-400 text-center">🔒 Thông tin bảo mật tuyệt đối · Xác nhận đơn qua chuyển khoản</p>
    </form>
  )
}

// ── MAIN PAGE ──────────────────────────────────────────────────────────────────
export default function KhanDoXoi() {
  const orderRef = useRef<HTMLDivElement>(null)
  const scrollToOrder = () => orderRef.current?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div className="min-h-screen bg-[#FFFBF5] font-sans">

      {/* ╔═ HERO ═╗ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#451A03] via-[#92400E] to-[#78350F] text-white">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-14">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="bg-white rounded-2xl px-5 py-3 shadow-xl inline-flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo-bep-co-ha.png" alt="Bếp Cô Hạ"
                className="h-12 w-12 object-contain"
                onError={e => { (e.currentTarget as HTMLImageElement).style.display='none' }} />
              <div>
                <p className="text-[#92400E] font-extrabold text-xl leading-tight tracking-tight">Bếp Cô Hạ</p>
                <p className="text-gray-400 text-xs">Hacofood.vn</p>
              </div>
            </div>
          </div>

          {/* Viral badge */}
          <div className="flex justify-center mb-5">
            <span className="bg-red-500 text-white text-sm font-bold px-5 py-1.5 rounded-full animate-bounce shadow">
              🔥 Bí quyết xôi ngon của người bán hàng rong
            </span>
          </div>

          {/* Headline */}
          <div className="text-center mb-6 max-w-3xl mx-auto">
            <p className="text-amber-300 font-semibold text-base mb-2 italic">
              "Đồ xôi mà không có khăn đúng chuẩn – xôi ra nát hết, dính chảo, nhìn xấu lắm." – Cô Hạ nói đấy.
            </p>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
              Xôi Chín Đều, Ráo Hạt,<br />
              <span className="text-[#FCD34D]">Không Dính – Không Nhão</span>
            </h1>
            <p className="mt-4 text-amber-100 text-lg max-w-2xl mx-auto leading-relaxed">
              Khăn Đồ Xôi Bếp Cô Hạ – vải lưới chuyên dụng, may viền kỹ lưỡng.<br className="hidden sm:block" />
              Hơi nước thấu đều, xôi ngon từng hạt. Dùng được 1000+ lần.
            </p>
          </div>

          {/* Product images */}
          <div className="flex justify-center gap-4 mb-8 max-w-2xl mx-auto">
            {SAN_PHAM.slice(0, 2).map(img => (
              <div key={img.label} className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 flex-1 max-w-[48%]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.src} alt={img.label}
                  className="w-full h-44 sm:h-56 object-cover" />
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {[
              { icon: '🧵', text: 'Vải lưới thực phẩm cao cấp' },
              { icon: '♻️', text: 'Dùng 1000+ lần' },
              { icon: '🌡️', text: 'Chịu nhiệt tốt' },
              { icon: '✂️', text: 'May viền chắc chắn' },
            ].map(s => (
              <div key={s.text} className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-2 text-sm border border-white/10">
                <span>{s.icon}</span><span className="font-medium">{s.text}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button onClick={scrollToOrder}
              className="bg-gradient-to-r from-[#D97706] to-[#B45309] hover:from-[#B45309] hover:to-[#D97706] text-white font-extrabold text-lg px-10 py-4 rounded-2xl shadow-lg transition-all active:scale-95">
              Đặt Hàng Ngay →
            </button>
            <a href="#thanh-pham"
              className="bg-white/10 border border-white/20 text-white font-bold text-base px-8 py-4 rounded-2xl hover:bg-white/20 transition-colors text-center">
              Xem Xôi Thành Phẩm
            </a>
          </div>
        </div>
      </section>

      {/* ╔═ PAIN AGITATION ═╗ */}
      <section className="py-14 px-4 sm:px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block border border-red-200 bg-red-50 text-red-600 font-bold text-xs px-4 py-1.5 rounded-full tracking-widest mb-4">
            BẠN CÓ ĐANG MẮC NHỮNG LỖI NÀY?
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mb-8">
            Tại Sao Nồi Xôi Nhà Bạn<br />
            <span className="text-red-500">Lúc Nhão, Lúc Dính Chảo, Lúc Chín Không Đều?</span>
          </h2>

          <div className="grid sm:grid-cols-2 gap-4 text-left">
            {[
              { icon: '😩', t: 'Không có khăn – xôi dính chảo', d: 'Xôi bám vào đáy chõ/nồi hấp, lấy ra bị nát vụn. Mất công nhặt lại, trông xấu, mà ăn vào cứng không ngon.' },
              { icon: '💧', t: 'Khăn màn mỏng – hơi nước ngưng đọng', d: 'Dùng khăn thường thì hơi nước đọng thành giọt rơi xuống xôi, xôi bị ướt nhão, hạt gạo vỡ nát trông không đẹp.' },
              { icon: '🔥', t: 'Hơi nước không thoát đều – xôi sống chín không đều', d: 'Mắt vải quá nhỏ, hơi không thoát được. Xôi giữa chín mà xôi ngoài rìa còn sống, phải đồ đi đồ lại mất thời gian.' },
              { icon: '⚡', t: 'Khăn rách nhanh – tốn tiền mua mới liên tục', d: 'Khăn không may viền chắc, sau vài lần dùng là sờn rách. Mua đi mua lại tốn tiền, lại không an toàn thực phẩm.' },
            ].map(item => (
              <div key={item.t} className="flex gap-4 bg-red-50 rounded-2xl p-5">
                <span className="text-3xl flex-shrink-0 mt-0.5">{item.icon}</span>
                <div>
                  <p className="font-bold text-gray-800 mb-1">{item.t}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.d}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-8 text-gray-600 text-base max-w-xl mx-auto">
            Không phải lỗi kỹ thuật. Chỉ đơn giản là bạn chưa có đúng loại khăn.
            <strong className="text-[#92400E]"> Cho đến khi có khăn đồ xôi Bếp Cô Hạ này.</strong>
          </p>
        </div>
      </section>

      {/* ╔═ GALLERY THÀNH PHẨM ═╗ */}
      <section id="thanh-pham" className="py-14 px-4 sm:px-6 bg-[#FFFBF5]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <span className="inline-block border border-amber-300 bg-amber-50 text-[#92400E] font-bold text-xs px-5 py-1.5 rounded-full tracking-widest mb-3">
              THÀNH PHẨM
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800">
              Xôi Đồ Bằng Khăn Cô Hạ –<br />
              <span className="text-[#B45309]">Hạt Tròn, Ráo, Bóng Đẹp Như Ngoài Hàng</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {THANH_PHAM.map(item => (
              <div key={item.label} className="relative rounded-2xl overflow-hidden group shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.src} alt={item.label}
                  className="w-full h-56 sm:h-72 object-cover object-center group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <p className="absolute bottom-3 left-3 right-3 text-white text-sm font-semibold drop-shadow leading-tight">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <button onClick={scrollToOrder}
              className="bg-gradient-to-r from-[#D97706] to-[#B45309] text-white font-bold px-8 py-3.5 rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-95">
              Tôi Muốn Thử Ngay →
            </button>
          </div>
        </div>
      </section>

      {/* ╔═ SOLUTION / MECHANISM ═╗ */}
      <section className="py-14 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* Left: Product image */}
            <div className="relative flex justify-center">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl max-w-xs w-full aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={SAN_PHAM[0].src} alt="Khăn đồ xôi Bếp Cô Hạ"
                  className="w-full h-full object-cover" />
              </div>
              <div className="absolute -top-3 -right-3 bg-[#B45309] text-white font-extrabold text-sm px-4 py-2 rounded-full shadow-lg rotate-6">
                May viền<br />kỹ lưỡng
              </div>
            </div>

            {/* Right: Copy */}
            <div>
              <span className="inline-block border border-amber-300 bg-amber-50 text-[#92400E] font-bold text-xs px-4 py-1.5 rounded-full tracking-widest mb-4">
                GIẢI PHÁP
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mb-4">
                Bí Quyết Từ Cô Hạ.<br />
                <span className="text-[#B45309]">Khăn Đồ Xôi Chuyên Dụng</span><br />
                Xôi Ngon Ngay Từ Lần Đầu Dùng.
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Cô Hạ đã dùng và thử nhiều loại vải trước khi chọn ra loại vải lưới này.
                Mắt lưới vừa đủ thưa để hơi nước thoát đều, vừa đủ dày để giữ hạt gạo.
                <strong className="text-gray-800"> May viền 4 cạnh chắc chắn – không sờn, không rách.</strong>
              </p>

              <div className="space-y-3">
                {[
                  { icon: '🌬️', t: 'Hơi nước thoát đều – xôi chín từng hạt', d: 'Mắt lưới vừa phải, hơi nước đi qua đều khắp bề mặt. Không còn chỗ sống, chỗ chín. Xôi đều màu, đều vị.' },
                  { icon: '💧', t: 'Khăn phủ hút ẩm – xôi không bị nhão', d: 'Đặt khăn phủ lên trên giúp hơi nước ngưng vào vải thay vì rơi xuống xôi. Xôi ráo, hạt bóng, không nhão.' },
                  { icon: '🔒', t: 'Chống dính hoàn toàn – lấy xôi dễ dàng', d: 'Xôi không bám vào vải, không bám vào chảo. Lấy ra nguyên miếng, đẹp như ngoài hàng.' },
                  { icon: '♻️', t: 'Bền 1000+ lần – giặt được bình thường', d: 'Vải thực phẩm cao cấp, chịu nhiệt tốt. Dùng xong giặt sạch, phơi khô. Kinh tế hơn hẳn dùng giấy bạc.' },
                ].map(item => (
                  <div key={item.t} className="flex gap-3">
                    <span className="text-2xl flex-shrink-0">{item.icon}</span>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{item.t}</p>
                      <p className="text-gray-500 text-sm leading-relaxed">{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ╔═ USE CASES ═╗ */}
      <section className="py-12 px-4 sm:px-6 bg-[#FFFBF5]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mb-2">
            Dùng Được Cho Tất Cả Các Loại Xôi
          </h2>
          <p className="text-gray-500 mb-8">Và cả hấp bánh, hấp đậu, hấp chả...</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { icon: '🟡', name: 'Xôi gấc', sub: 'Màu đỏ đẹp không lem' },
              { icon: '🟤', name: 'Xôi đậu đen', sub: 'Hạt chín đều, không vỡ' },
              { icon: '🌿', name: 'Xôi lá cẩm', sub: 'Màu tím tự nhiên' },
              { icon: '🫘', name: 'Hấp đậu', sub: 'Đậu mềm không nhão' },
              { icon: '🎂', name: 'Hấp bánh', sub: 'Bánh không dính khuôn' },
              { icon: '🍚', name: 'Xôi trắng', sub: 'Hạt bóng, thơm ngon' },
            ].map(item => (
              <div key={item.name} className="bg-white rounded-2xl p-5 shadow-sm text-center">
                <span className="text-4xl">{item.icon}</span>
                <p className="font-bold text-gray-800 mt-2">{item.name}</p>
                <p className="text-sm text-[#92400E]">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ╔═ SIZE GUIDE + HOW TO USE ═╗ */}
      <section className="py-14 px-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Chọn kích thước */}
            <div className="bg-[#FFFBF5] rounded-3xl p-6 border border-amber-100">
              <h3 className="font-extrabold text-xl text-[#92400E] mb-4">📐 Chọn Kích Thước Nào?</h3>
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-4 border border-amber-100">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-bold text-gray-800">Nhỏ 60×60cm</p>
                    <p className="font-extrabold text-[#B45309]">{fmt(PRICES['nho'])}</p>
                  </div>
                  <p className="text-gray-500 text-sm">Phù hợp nấu <strong>1–2kg nếp</strong> · Gia đình 3–5 người · Nấu thường ngày</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4 border-2 border-amber-300">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-bold text-gray-800">Lớn 90×100cm ⭐</p>
                    <p className="font-extrabold text-[#B45309]">{fmt(PRICES['lon'])}</p>
                  </div>
                  <p className="text-gray-500 text-sm">Phù hợp nấu <strong>3–4kg nếp</strong> · Đặt tiệc, cúng giỗ · Bán xôi hàng rong</p>
                </div>
              </div>
            </div>

            {/* Hướng dẫn */}
            <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100">
              <h3 className="font-extrabold text-xl text-[#92400E] mb-4">📋 Cách Dùng Đơn Giản</h3>
              <ol className="space-y-2.5 text-gray-600 text-sm">
                <li className="flex gap-2.5">
                  <span className="bg-[#B45309] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                  <span>Vo nếp xong, <strong>ngâm nước 4–8 tiếng</strong> cho nếp nở đều (hoặc qua đêm)</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="bg-[#B45309] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                  <span><strong>Làm ẩm khăn</strong>, lót vào chõ/xửng hấp</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="bg-[#B45309] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                  <span>Đổ nếp vào, <strong>phủ khăn lên trên</strong> để giữ nhiệt</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="bg-[#B45309] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
                  <span>Đồ <strong>30–45 phút</strong> tùy lượng nếp, lật đảo 1 lần giữa chừng</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="bg-[#B45309] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">5</span>
                  <span>Lấy xôi ra, <strong>không dính – không nát</strong>. Dùng xong giặt sạch, phơi khô</span>
                </li>
              </ol>
            </div>

            {/* Bí quyết */}
            <div className="bg-blue-50 rounded-3xl p-6 border border-blue-100">
              <h3 className="font-extrabold text-xl text-blue-700 mb-4">💡 Bí Quyết Xôi Ngon Hơn</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li className="flex gap-2">✅ <span>Khăn phải <strong>ẩm</strong> (không ướt đẫm) trước khi lót vào chõ</span></li>
                <li className="flex gap-2">🌡️ <span>Nước sôi mạnh trước khi cho nếp vào – hơi nước đều hơn</span></li>
                <li className="flex gap-2">⏰ <span>Lật đảo xôi sau 20 phút để phần trên xuống dưới chín đều</span></li>
                <li className="flex gap-2">🫙 <span>Xôi chín, ủ thêm 5 phút trong chõ trước khi lấy ra – ngon hơn</span></li>
              </ul>
            </div>

            {/* Bảo quản khăn */}
            <div className="bg-purple-50 rounded-3xl p-6 border border-purple-100">
              <h3 className="font-extrabold text-xl text-purple-700 mb-4">🧺 Bảo Quản Khăn</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🫧</span>
                  <div>
                    <p className="font-bold text-gray-800">Sau khi dùng</p>
                    <p className="text-gray-500 text-sm">Giặt tay với xà phòng, xả sạch, phơi nơi thoáng mát</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🌟</span>
                  <div>
                    <p className="font-bold text-gray-800">Dùng được 1000+ lần</p>
                    <p className="text-gray-500 text-sm">Không dùng máy sấy, không ngâm chất tẩy mạnh</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ╔═ SOCIAL PROOF / REVIEW ═╗ */}
      <section className="py-14 px-4 sm:px-6 bg-[#FFFBF5]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <span className="inline-block border border-amber-300 bg-amber-50 text-[#92400E] font-bold text-xs px-4 py-1.5 rounded-full tracking-widest mb-3">
              KHÁCH HÀNG NÓI GÌ?
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800">
              Người Nấu Xôi Giỏi Đều Biết<br />
              <span className="text-[#B45309]">Khăn Đúng – Xôi Mới Ngon</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto mb-8">
            {[
              {
                name: 'S**u',
                stars: 5,
                text: '"Mua lâu rồi nhưng mãi mới dùng để đánh giá. Khăn to chà bá, chất liệu tốt. Công nhận đồ xôi có khăn phủ ngăn giảm hơi nước đọng vào xôi, xôi không bị ướt và nát, xôi ráo ngon hơn hẳn."',
              },
              {
                name: 'H**g',
                stars: 5,
                text: '"Dùng thử thấy xôi ra không dính chảo chút nào, hạt bóng đẹp. Trước hay dùng màng bọc thực phẩm mà xôi hay bị ướt, giờ dùng khăn này xôi ráo hẳn. Mua thêm cái nữa để dùng khi đặt tiệc."',
              },
            ].map(r => (
              <div key={r.name} className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: r.stars }).map((_, i) => (
                    <span key={i} className="text-amber-400 text-lg">★</span>
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed italic">{r.text}</p>
                <p className="text-gray-400 text-xs mt-3">— {r.name} (review thực tế)</p>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 rounded-3xl p-6 text-center max-w-2xl mx-auto">
            <p className="text-[#92400E] font-bold text-lg mb-2">
              "Cái khăn nhỏ thôi mà thay đổi được hẳn nồi xôi. Từ hôm có khăn này là xôi nhà cô chưa bao giờ bị nhão nữa."
            </p>
            <p className="text-amber-700 text-sm italic">— Cô Hạ chia sẻ sau nhiều năm nấu xôi</p>
          </div>
        </div>
      </section>

      {/* ╔═ PRICING + ORDER FORM ═╗ */}
      <section ref={orderRef} id="dat-hang" className="py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block border border-amber-300 bg-amber-50 text-[#92400E] font-bold text-xs px-5 py-1.5 rounded-full tracking-widest mb-3">
              ĐẶT HÀNG
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mb-2">
              Mang Khăn Đồ Xôi Bếp Cô Hạ<br />
              <span className="text-[#B45309]">Về Bếp Nhà Bạn Hôm Nay</span>
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Giao tận nhà toàn quốc · Thanh toán chuyển khoản · Hàng chính hãng từ Bếp Cô Hạ
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 items-start">
            {/* Left: Value & Pricing */}
            <div>
              <div className="space-y-4 mb-8">
                {[
                  { key: 'nho', label: 'Khăn Nhỏ 60×60cm', price: PRICES['nho'], sub: 'Gia đình 1–2kg nếp · Nấu thường ngày', icon: '🧺', popular: false },
                  { key: 'lon', label: 'Khăn Lớn 90×100cm', price: PRICES['lon'], sub: 'Tiệc, cúng giỗ, bán xôi · 3–4kg nếp', icon: '🪣', popular: true },
                ].map(item => (
                  <div key={item.key} className={`relative rounded-2xl p-5 border-2 ${
                    item.popular ? 'border-[#B45309] bg-amber-50' : 'border-gray-200 bg-gray-50'
                  }`}>
                    {item.popular && (
                      <span className="absolute -top-3 left-4 bg-[#B45309] text-white text-xs font-bold px-3 py-1 rounded-full">
                        Phổ biến nhất
                      </span>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{item.icon}</span>
                        <div>
                          <p className="font-extrabold text-gray-800 text-lg">{item.label}</p>
                          <p className="text-gray-500 text-sm">{item.sub}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-2xl text-[#B45309]">{fmt(item.price)}</p>
                        <p className="text-gray-400 text-xs">/cái</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Guarantees */}
              <div className="space-y-3">
                {[
                  { icon: '🚚', t: 'Giao hàng toàn quốc', d: 'Ship tận nhà, đóng gói cẩn thận' },
                  { icon: '💳', t: 'Chuyển khoản – QR tự động', d: 'Đặt xong nhận QR ngay, không cần chờ lâu' },
                  { icon: '✅', t: 'Hàng chính hãng Bếp Cô Hạ', d: 'Kiểm tra kỹ trước khi đóng gói gửi đi' },
                  { icon: '🔄', t: 'Đổi trả nếu lỗi sản xuất', d: 'May viền sờn, vải lỗi – báo ảnh đổi ngay' },
                ].map(item => (
                  <div key={item.t} className="flex gap-3 items-start">
                    <span className="text-xl flex-shrink-0">{item.icon}</span>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{item.t}</p>
                      <p className="text-gray-500 text-xs">{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Order Form */}
            <div className="bg-[#FFFBF5] rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-lg">
              <h3 className="font-extrabold text-xl text-[#92400E] mb-6 text-center">
                Điền Thông Tin Đặt Hàng
              </h3>
              <OrderForm />
            </div>
          </div>
        </div>
      </section>

      {/* ╔═ P.S. / URGENCY ═╗ */}
      <section className="py-10 px-4 sm:px-6 bg-gradient-to-r from-[#451A03] to-[#92400E] text-white text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-amber-200 text-sm font-semibold mb-2">P.S.</p>
          <p className="text-lg leading-relaxed">
            Mỗi nồi xôi, mỗi mâm cỗ đều xứng đáng có <strong>xôi ngon, ráo hạt, đẹp mắt</strong>.
            Đừng để nồi xôi tiếp theo lại bị nhão, bị dính vì thiếu một chiếc khăn đúng chuẩn.
          </p>
          <button onClick={scrollToOrder}
            className="mt-6 bg-[#D97706] hover:bg-[#B45309] text-white font-extrabold px-10 py-4 rounded-2xl transition-colors active:scale-95 text-lg">
            Đặt Hàng Ngay →
          </button>
        </div>
      </section>

      {/* ╔═ FOOTER ═╗ */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-4 sm:px-6 text-center text-sm">
        <div className="max-w-3xl mx-auto space-y-3">
          <div className="flex justify-center">
            <div className="bg-white rounded-xl px-4 py-2 inline-flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo-bep-co-ha.png" alt="Bếp Cô Hạ"
                className="h-9 w-9 object-contain"
                onError={e => { (e.currentTarget as HTMLImageElement).style.display='none' }} />
              <div className="text-left">
                <p className="text-[#92400E] font-extrabold text-base leading-tight">Bếp Cô Hạ</p>
                <p className="text-gray-400 text-xs">Hacofood.vn</p>
              </div>
            </div>
          </div>
          <p>Khăn Đồ Xôi Bếp Cô Hạ – Vải lưới chuyên dụng, may viền kỹ lưỡng</p>
          <p>Mọi thắc mắc liên hệ qua: <strong className="text-gray-300">Facebook: Bếp Cô Hạ</strong> hoặc số điện thoại trên bao bì</p>
          <p className="text-gray-600 text-xs">© 2025 Hacofood.vn · Bếp Cô Hạ. All rights reserved.</p>
        </div>
      </footer>

    </div>
  )
}
