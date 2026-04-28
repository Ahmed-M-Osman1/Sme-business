import {tammBrand} from '@/lib/brand/tamm';
import {BrandProvider} from '@/lib/brand';

export const metadata = {
  title: tammBrand.metadata.title,
  description: tammBrand.metadata.description,
};

export default function TammLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BrandProvider brand={tammBrand}>
      {children}
    </BrandProvider>
  );
}
