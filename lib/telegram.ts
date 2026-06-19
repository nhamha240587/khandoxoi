const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
const ORDER_GROUP_ID = process.env.TELEGRAM_ORDER_GROUP_ID || ''

async function sendMessage(chatId: string, text: string) {
  if (!BOT_TOKEN || !chatId) return
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  })
}

export async function notifyKdxPending(data: {
  name: string; phone: string; address: string
  product: string; quantity: number; totalPrice: number
  refCode: string; pancakeOrderId?: string; note?: string
}) {
  const msg = `🟡 <b>KHĂN ĐỒ XÔI – CHỜ THANH TOÁN</b>

• Tên: <b>${data.name}</b>
• SĐT: <b>${data.phone}</b>
• Địa chỉ: ${data.address}
• Sản phẩm: ${data.product} x${data.quantity}
• Tổng tiền: <b>${data.totalPrice.toLocaleString('vi-VN')}đ</b>
• Mã TT: <code>${data.refCode}</code>${data.pancakeOrderId ? `\n• Đơn POScake: <b>#${data.pancakeOrderId}</b>` : ''}${data.note ? `\n• Ghi chú: ${data.note}` : ''}
• Thời gian: ${new Date().toLocaleString('vi-VN')}

⏳ Khách đang xem hướng dẫn chuyển khoản`
  await sendMessage(ORDER_GROUP_ID, msg)
}

export async function notifyKdxPaid(data: {
  name: string; phone: string
  product: string; quantity: number; totalPrice: number
  refCode: string; pancakeOrderId?: string; pancakeUpdated: boolean
}) {
  const posLine = data.pancakeOrderId
    ? (data.pancakeUpdated
        ? `\n• POScake: <b>#${data.pancakeOrderId}</b> → Chờ chuyển hàng ✅`
        : `\n• POScake: <b>#${data.pancakeOrderId}</b> – cập nhật tay sang "Chờ chuyển hàng"`)
    : ''
  const msg = `✅ <b>KHĂN ĐỒ XÔI – ĐÃ THANH TOÁN</b>

• Tên: <b>${data.name}</b>
• SĐT: <b>${data.phone}</b>
• Sản phẩm: ${data.product} x${data.quantity}
• Số tiền: <b>${data.totalPrice.toLocaleString('vi-VN')}đ ✓</b>
• Mã TT: <code>${data.refCode}</code>${posLine}
• Thời gian TT: ${new Date().toLocaleString('vi-VN')}`
  await sendMessage(ORDER_GROUP_ID, msg)
}
