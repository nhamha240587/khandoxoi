const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
const ORDER_GROUP_ID = process.env.TELEGRAM_ORDER_GROUP_ID || ''

/** Escape ký tự đặc biệt cho Telegram parse_mode HTML — tránh khách nhập <,>,& làm hỏng/giả tin nhắn. */
function esc(s: string | undefined | null): string {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

async function sendMessage(chatId: string, text: string) {
  if (!BOT_TOKEN || !chatId) return
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  })
}

export async function notifyPaymentMismatch(data: {
  paymentRef: string; received: number; expected: number; content: string
}) {
  const msg = `⚠️ <b>KHĂN ĐỒ XÔI – CHUYỂN THIẾU TIỀN</b>

• Mã TT: <code>${data.paymentRef}</code>
• Đã nhận: <b>${data.received.toLocaleString('vi-VN')}đ</b>
• Cần thu: <b>${data.expected.toLocaleString('vi-VN')}đ</b>
• Nội dung CK: ${esc(data.content)}
• Thời gian: ${new Date().toLocaleString('vi-VN')}

❗ Đơn CHƯA được xác nhận tự động — vui lòng kiểm tra & xử lý tay`
  await sendMessage(ORDER_GROUP_ID, msg)
}

export async function notifyKdxPending(data: {
  name: string; phone: string; address: string
  product: string; quantity: number; totalPrice: number
  refCode: string; pancakeOrderId?: string; note?: string
}) {
  const msg = `🟡 <b>KHĂN ĐỒ XÔI – CHỜ THANH TOÁN</b>

• Tên: <b>${esc(data.name)}</b>
• SĐT: <b>${esc(data.phone)}</b>
• Địa chỉ: ${esc(data.address)}
• Sản phẩm: ${esc(data.product)} x${data.quantity}
• Tổng tiền: <b>${data.totalPrice.toLocaleString('vi-VN')}đ</b>
• Mã TT: <code>${data.refCode}</code>${data.pancakeOrderId ? `\n• Đơn POScake: <b>#${data.pancakeOrderId}</b>` : ''}${data.note ? `\n• Ghi chú: ${esc(data.note)}` : ''}
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

• Tên: <b>${esc(data.name)}</b>
• SĐT: <b>${esc(data.phone)}</b>
• Sản phẩm: ${esc(data.product)} x${data.quantity}
• Số tiền: <b>${data.totalPrice.toLocaleString('vi-VN')}đ ✓</b>
• Mã TT: <code>${data.refCode}</code>${posLine}
• Thời gian TT: ${new Date().toLocaleString('vi-VN')}`
  await sendMessage(ORDER_GROUP_ID, msg)
}
