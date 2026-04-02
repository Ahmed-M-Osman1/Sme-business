'use client';

import {useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {Button} from '@shory/ui';
import {BusinessBundleIcon} from '@/components/icons/insurance-icons';
import {useI18n} from '@/lib/i18n';

type ProductCard = {
  title: string;
  image: string | 'sme-icon';
  href: string;
  active: boolean;
};

const PERSONAL_PRODUCTS: ProductCard[] = [
  {
    title: 'Car Insurance',
    image: 'https://www.shory.com/media/w2mel21w/car-insurance_card.webp',
    href: '#',
    active: false,
  },
  {
    title: 'Health Insurance',
    image: 'https://www.shory.com/media/03dfofzl/health-insurance_card.webp',
    href: '#',
    active: false,
  },
  {
    title: 'Home Insurance',
    image: 'https://www.shory.com/media/edaboops/home-insurance_card.webp',
    href: '#',
    active: false,
  },
  {
    title: 'Pet Insurance',
    image: 'https://www.shory.com/media/2keaiue0/pet-insurance_card.webp',
    href: '#',
    active: false,
  },
];

const BUSINESS_PRODUCTS: ProductCard[] = [
  {
    title: 'SME Business Insurance',
    image: 'sme-icon',
    href: '/quote/start',
    active: true,
  },
  {
    title: 'Visit Visa for Agencies',
    image: 'https://www.shory.com/media/podicoyv/card-travel_insurance.webp',
    href: '#',
    active: false,
  },
];

function ProductCardItem({product}: {product: ProductCard}) {
  const {t} = useI18n();
  return (
    <div className="relative flex flex-col items-center rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.02]">
      <div className="flex h-28 w-full items-center justify-center">
        {product.image === 'sme-icon' ? (
          <BusinessBundleIcon className="h-24 w-24" />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={product.image}
            alt={product.title}
            className="h-28 w-auto object-contain"
          />
        )}
      </div>
      <h3 className="mt-3 text-center text-sm font-semibold text-gray-900">
        {product.title}
      </h3>
      {product.active ? (
        <Button
          asChild
          size="sm"
          className="mt-4 w-full rounded-full bg-primary text-white text-xs font-medium hover:bg-primary-hover transition-all duration-200"
        >
          <Link href={product.href}>{t.landing.getQuote}</Link>
        </Button>
      ) : (
        <Button
          size="sm"
          disabled
          className="mt-4 w-full rounded-full bg-gray-100 text-gray-400 text-xs font-medium cursor-not-allowed"
        >
          {t.landing.getQuote}
        </Button>
      )}
    </div>
  );
}

export function Hero() {
  const {t, locale} = useI18n();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'personal' | 'business'>(
    'business',
  );

  function handlePersonalTab() {
    router.push('/coming-soon');
  }

  const products =
    activeTab === 'personal' ? PERSONAL_PRODUCTS : BUSINESS_PRODUCTS;

  return (
    <section className="pb-8 pt-12 text-center">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <p className="mb-3 text-sm font-semibold text-gray-500">
          {t.landing.heroSubtitle}
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl whitespace-pre-line">
          {t.landing.heroTitle}
        </h1>

        {/* Tab Toggle */}
        <div className="relative mt-8 inline-flex rounded-full border border-gray-200 bg-gray-50 p-1" key={locale}>
          <div
            className="absolute top-1 bottom-1 rounded-full bg-gray-900 transition-all duration-300 ease-in-out"
            style={{
              width: 'calc(50% - 4px)',
              insetInlineStart: activeTab === 'personal' ? '4px' : 'calc(50%)',
            }}
          />
          <button
            onClick={handlePersonalTab}
            className={`relative z-10 rounded-full px-8 py-2.5 text-sm font-medium transition-colors duration-200 ${
              activeTab === 'personal' ? 'text-white' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {t.landing.tabPersonal}
          </button>
          <button
            onClick={() => setActiveTab('business')}
            className={`relative z-10 rounded-full px-8 py-2.5 text-sm font-medium transition-colors duration-200 ${
              activeTab === 'business' ? 'text-white' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {t.landing.tabBusiness}
          </button>
        </div>

        {/* Product Cards */}
        <div
          className={`mt-10 grid gap-4 ${
            activeTab === 'personal'
              ? 'grid-cols-2 lg:grid-cols-4'
              : 'mx-auto grid-cols-1 sm:grid-cols-2 max-w-lg'
          }`}
        >
          {products.map((product) => (
            <ProductCardItem key={product.title} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
