const PANCAKE_API_BASE = 'https://pos.pages.fm/api/v1'
const SHOP_ID = process.env.PANCAKE_SHOP_ID || ''
const API_KEY = process.env.PANCAKE_API_KEY || ''

const VARIATION_ID = process.env.PANCAKE_VAR_LON || ''

export async function createPancakeOrder(data: {
  name: string
  phone: string
  email: string
  address: string
  product: string
  quantity: number
  totalPrice: number
  note?: string
}) {
  if (!API_KEY || !SHOP_ID) {
    console.warn('[pancake] PANCAKE_API_KEY hoặc PANCAKE_SHOP_ID chưa cấu hình — bỏ qua')
    return null
  }
  if (!VARIATION_ID) {
    console.warn('[pancake] PANCAKE_VAR_LON chưa cấu hình — bỏ qua')
    return null
  }

  const unitPrice = Math.round(data.totalPrice / data.quantity)

  const body = {
    bill_full_name: data.name,
    bill_phone_number: data.phone,
    bill_email: data.email || undefined,
    note: [
      data.note ? `Ghi chú: ${data.note}` : '',
      'Đặt qua website khandoxoi.vercel.app',
    ].filter(Boolean).join(' | '),
    cod: data.totalPrice,
    shipping_address: {
      full_name: data.name,
      phone_number: data.phone,
      full_address: data.address,
    },
    items: [
      {
        variation_id: VARIATION_ID,
        quantity: data.quantity,
        price: unitPrice,
      },
    ],
  }

  const url = `${PANCAKE_API_BASE}/shops/${SHOP_ID}/orders?api_key=${API_KEY}`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      console.warn('[pancake] createOrder thất bại:', res.status, await res.text())
      return null
    }
    return await res.json()
  } catch (err) {
    console.warn('[pancake] createOrder lỗi:', err)
    return null
  }
}
