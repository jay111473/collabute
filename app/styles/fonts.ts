import localFont from 'next/font/local'

export const gilroy = localFont({
  src: [
    {
      path: '../public/fonts/Gilroy-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../public/fonts/Gilroy-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/Gilroy-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/Gilroy-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--gilroy'
}) 