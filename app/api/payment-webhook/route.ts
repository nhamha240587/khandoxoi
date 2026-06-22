import { NextRequest, NextResponse } from 'next/server'
import { getKdxOrderByRef, confirmKdxPayment } from '@/lib/db'
import { notifyKdxPaid } from '@/lib/telegram'
import type { SepayWebhookPayload } from '@/lib/sepay'

export async function POST(req: NextRequest) {
  try {
    const body: SepayWebhookPayload = await req.json()
    const content = (body.content || body.description || '').toUpperCase()

    const kdxMatch = content.match(/KDX[A-Z0-9]+/i)
    if (kdxMatch) {
      const refCode = kdxMatch[0].toUpperCase()
      const order = await getKdxOrderByRef(refCode).catch(() => null)

      if (!order) {
        console.warn('[webhook-kdx] Không tìm thấy đơn:', refCode)
        return NextResponse.json({ success: false, reason: 'order_not_found' })
      }
      if (order.payment_status === 'paid') {
        return NextResponse.json({ success: true, reason: 'already_paid' })
      }
      if (body.transferAmount < order.total_price) {
        console.warn('[webhook-kdx] Số tiền không đủ:', body.transferAmount, '<', order.total_price)
        return NextResponse.json({ success: false, reason: 'amount_mismatch' })
      }

      await confirmKdxPayment(refCode)

      await notifyKdxPaid({
        name: order.name,
        phone: order.phone,
        product: order.product,
        quantity: order.quantity,
        totalPrice: order.total_price,
        refCode,
        pancakeOrderId: order.pancake_order_id || undefined,
        pancakeUpdated: false,
      }).catch(console.error)

      return NextResponse.json({ success: true, refCode })
    }

    return NextResponse.json({ success: true, reason: 'no_match' })
  } catch (err) {
    console.error('[payment-webhook]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
