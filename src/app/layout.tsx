import { Card, CardContent } from '@/components/ui/card';
import { cn, PREORDER_CLOSED } from '@/lib/utils';
import type { Metadata, Viewport } from 'next';
import { Kanit } from 'next/font/google';
import './globals.css';

const kanit = Kanit({
  subsets: ['latin', 'thai'],
  variable: '--font-kanit',
  weight: ['400', '700'],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://meekai.craftify.work'),
  title: {
    default: 'พรีออเดอร์ หมี่ไก่ฉีก (By แว่นมานี่มา)',
    template: '%s | พรีออเดอร์ หมี่ไก่ฉีก (By แว่นมานี่มา)',
  },
  description:
    'สั่งพรีออเดอร์หมี่ไก่ฉีก เลือกท็อปปิ้งได้ อัปโหลดสลิปชำระเงินง่ายๆ',
  applicationName: 'Mee Kai Cheek Preorder',
  keywords: ['หมี่ไก่ฉีก', 'พรีออเดอร์', 'อาหาร', 'KMUTT'],
  authors: [{ name: 'แว่นมานี่มา' }],
  creator: 'แว่นมานี่มา',
  publisher: 'แว่นมานี่มา',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'th_TH',
    url: '/',
    siteName: 'พรีออเดอร์ หมี่ไก่ฉีก',
    title: 'พรีออเดอร์ หมี่ไก่ฉีก',
    description:
      'สั่งพรีออเดอร์หมี่ไก่ฉีก เลือกท็อปปิ้งได้ อัปโหลดสลิปชำระเงินง่ายๆ',
    images: [
      {
        url: '/images/meekai-og.png',
        width: 1200,
        height: 630,
        alt: 'พรีออเดอร์ หมี่ไก่ฉีก',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'พรีออเดอร์ หมี่ไก่ฉีก',
    description:
      'สั่งพรีออเดอร์หมี่ไก่ฉีก เลือกท็อปปิ้งได้ อัปโหลดสลิปชำระเงินง่ายๆ',
    images: ['/images/meekai-og.png'],
    creator: 'แว่นมานี่มา',
  },
  icons: {
    icon: '/icons/favicon.ico',
    apple: '/icons/apple-touch-icon.png',
    shortcut: '/icons/favicon-32x32.png',
  },
  category: 'food',
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const bgClass = PREORDER_CLOSED
    ? 'bg-gray-100'
    : 'bg-linear-to-b from-red-100 via-red-50 to-white';

  return (
    <html
      lang="th"
      className={cn(kanit.variable)}
    >
      <body
        className={cn(
          'min-h-dvh text-gray-900 antialiased font-sans relative overflow-x-hidden',
          bgClass
        )}
      >
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,205,160,0.25)_0%,transparent_60%),radial-gradient(circle_at_bottom_right,rgba(255,205,160,0.25)_0%,transparent_60%)] pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-2xl p-4 flex flex-col min-h-dvh">
          <header>
            <h1 className="mb-4 text-center text-lg font-bold text-red-700 drop-shadow-sm md:text-2xl">
              พรีออเดอร์ &quot;หมี่ไก่ฉีก&quot; (By แว่นมานี่มา)
            </h1>
          </header>

          {PREORDER_CLOSED && (
            <Card
              role="alert"
              className="border-destructive/30 bg-destructive/5 my-2"
            >
              <CardContent className="py-3">
                <p className="text-sm">
                  <span className="font-semibold text-destructive">
                    ปิดพรีออเดอร์แล้ว
                  </span>{' '}
                  ขอบคุณทุกออเดอร์นะคะ/ครับ 🙏 รอบถัดไปจะแจ้งให้ทราบอีกครั้ง
                </p>
              </CardContent>
            </Card>
          )}

          <main className="flex-1">{children}</main>

          <footer className="mt-8 text-center text-sm text-muted-foreground">
            หากพบปัญหาการใช้งาน ติดต่อ{' '}
            <a
              href="https://www.instagram.com/vaenmanima"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-medium hover:underline"
            >
              @vaenmanima
            </a>
          </footer>
        </div>
      </body>
    </html>
  );
};

export default RootLayout;
