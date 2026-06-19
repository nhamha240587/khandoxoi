import { NextRequest, NextResponse } from 'next/server'
import { initDb, insertKdxOrder } from '@/lib/db'
import { notifyKdxPending } from '@/lib/telegram'
import { createPancakeOrder } from '@/lib/pancake'
import { generateKdxRef, buildQRPayload } from '@/lib/sepay'

const PRICES: Record<string, number> = {
  'nho': 35000,
  'lon': 59000,
}

const PRODUCT_LABELS: Record<string, string> = {
  'nho': 'Khăn Đồ Xôi Nhỏ 60x60cm',
  'lon': 'Khăn Đồ Xôi Lớn 90x100cm',
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, phone, email, address, product, quantity, note } = body

    if (!name?.trim() || !phone?.trim() || !address?.trim() || !product || !quantity) {
      return NextResponse.json({ error: 'Vui lòng điền đầy đủ thông tin' }, { status: 400 })
    }
    if (!/^0\d{9}$/.test(phone.trim())) {
      return NextResponse.json({ error: 'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)' }, { status: 400 })
    }
    if (!['nho', 'lon'].includes(product)) {
      return NextResponse.json({ error: 'Sản phẩm không hợp lệ' }, { status: 400 })
    }
    const qty = parseInt(quantity)
    if (isNaN(qty) || qty < 1 || qty > 50) {
      return NextResponse.json({ error: 'Số lượng không hợp lệ' }, { status: 400 })
    }

    const unitPrice = PRICES[product]
    const totalPrice = unitPrice * qty
    const productLabel = PRODUCT_LABELS[product]
    const refCode = generateKdxRef(phone.trim())

    await initDb()

    const pancakeResult = await createPancakeOrder({
      name: name.trim(), phone: phone.trim(),
      email: (email || '').trim(), address: address.trim(),
      product: product as 'nho' | 'lon',
      quantity: qty, totalPrice,
      note: note?.trim() || '',
    })
    const pancakeOrderId: string | undefined = pancakeResult?.data?.id
      ? String(pancakeResult.data.id)
      : pancakeResult?.id ? String(pancakeResult.id) : undefined

    await insertKdxOrder({
      refCode,
      pancakeOrderId,
      name: name.trim(), phone: phone.trim(),
      email: (email || '').trim(), address: address.trim(),
      product, quantity: qty, totalPrice,
      note: note?.trim() || '',
    })

    await notifyKdxPending({
      name: name.trim(), phone: phone.trim(), address: address.trim(),
      product: productLabel, quantity: qty, totalPrice,
      refCode, pancakeOrderId,
      note: note?.trim() || '',
    }).catch(console.error)

    const qr = buildQRPayload(refCode, totalPrice)

    return NextResponse.json({
      success: true,
      refCode,
      totalPrice,
      productLabel,
      qr,
    })
  } catch (err) {
    console.error('[khan-do-xoi-order]', err)
    return NextResponse.json({ error: 'Có lỗi xảy ra, vui lòng thử lại' }, { status: 500 })
  }
}
