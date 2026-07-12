/**
 * Static Persian content for the intro flow and home screen.
 * Onboarding background photos are calming, on-theme Unsplash images loaded
 * remotely (stable photo IDs, cropped to a portrait-friendly size).
 */
import { gradients } from '../theme';

export type Slide = {
  key: string;
  image: string;
  emoji: string;
  title: string;
  description: string;
  tint: readonly [string, string];
};

const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1080&q=80`;

export const slides: Slide[] = [
  {
    key: 'welcome',
    image: unsplash('1506905925346-21bda4d32df4'), // misty mountains at sunrise
    emoji: '🦋',
    title: 'به آرامینا خوش آمدی',
    description:
      'آرامینا یک همراه امن برای بهبودی و آرامش روان است؛ فضایی آرام تا با مهربانی از خودت مراقبت کنی.',
    tint: gradients.violet,
  },
  {
    key: 'practice',
    image: unsplash('1518495973542-4542c06a5843'), // sunlight through green trees
    emoji: '🌿',
    title: 'تمرین‌های روزانه و آرام',
    description:
      'تمرین‌های تنفس، ذهن‌آگاهی و آرام‌سازی که هر روز، قدم‌به‌قدم و بدون فشار همراهت هستند.',
    tint: gradients.teal,
  },
  {
    key: 'journey',
    image: unsplash('1441974231531-c6227db76b6e'), // forest path — the journey
    emoji: '🌸',
    title: 'مسیر بهبودی تو',
    description:
      'حال دلت را ثبت کن، در ژورنال بنویس و رشد خودت را در طول زمان ببین. این مسیر متعلق به توست.',
    tint: gradients.pink,
  },
];

export type Feature = {
  key: string;
  title: string;
  subtitle: string;
  icon: 'wind' | 'sparkles' | 'activity' | 'book' | 'shield' | 'compass';
  tint: readonly [string, string];
};

export const features: Feature[] = [
  {
    key: 'breathing',
    title: 'تنفس آرام',
    subtitle: 'تمرین تنفس هدایت‌شده',
    icon: 'wind',
    tint: gradients.sky,
  },
  {
    key: 'exercises',
    title: 'تمرین‌ها',
    subtitle: 'تمرین امروز تو',
    icon: 'sparkles',
    tint: gradients.violet,
  },
  {
    key: 'mood',
    title: 'حال من',
    subtitle: 'ثبت حس امروز',
    icon: 'activity',
    tint: gradients.pink,
  },
  {
    key: 'journal',
    title: 'ژورنال',
    subtitle: 'نوشتن و مرور',
    icon: 'book',
    tint: gradients.amber,
  },
  {
    key: 'guide',
    title: 'راهنما',
    subtitle: 'شناخت تروما',
    icon: 'compass',
    tint: gradients.teal,
  },
  {
    key: 'supervision',
    title: 'همراهی امن',
    subtitle: 'ارتباط با متخصص',
    icon: 'shield',
    tint: gradients.violet,
  },
];
