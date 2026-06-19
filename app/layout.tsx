import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Khăn Đồ Xôi Bếp Cô Hạ – Xôi Ngon Không Dính, Không Nhão',
  description: 'Khăn đồ xôi chuyên dụng Bếp Cô Hạ – vải lưới cao cấp, chống dính, hơi nước thấu đều, xôi chín ngon ráo hạt. Dùng được 1000+ lần. Giao tận nhà toàn quốc.',
  openGraph: {
    title: 'Khăn Đồ Xôi Bếp Cô Hạ',
    description: 'Xôi ngon không dính, không nhão – bí quyết của khăn đồ xôi đúng chuẩn. Giao tận nhà toàn quốc.',
    locale: 'vi_VN',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  )
}
