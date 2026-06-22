import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Khăn Đồ Xôi 1m×1m – Chỉ 49.000đ | Bếp Cô Hạ',
  description: 'Khăn vải lưới hấp xôi chuyên dụng 1m×1m. Xôi chín đều, ráo hạt, không dính chảo. Dùng 1000+ lần. Chỉ 49.000đ – giao toàn quốc.',
  keywords: ['khăn đồ xôi', 'vải hấp xôi', 'khăn lưới hấp', 'đồ xôi không dính', 'bếp cô hạ', 'hacofood'],
  openGraph: {
    title: 'Khăn Đồ Xôi 1m×1m – Chỉ 49.000đ | Bếp Cô Hạ',
    description: 'Xôi chín đều, ráo hạt, không dính chảo. Vải lưới chuyên dụng, dùng 1000+ lần. Giao toàn quốc.',
    url: 'https://khandoxoi.vercel.app',
    siteName: 'Bếp Cô Hạ – Hacofood.vn',
    locale: 'vi_VN',
    type: 'website',
    // opengraph-image.tsx được tự động dùng làm og:image
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  )
}
