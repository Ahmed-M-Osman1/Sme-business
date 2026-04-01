export interface InsurerInfo {
  id: string;
  name: string;
  logo: string;
  rating: number;
  reviewCount: number;
  shariahCompliant: boolean;
}

export const INSURERS: Record<string, InsurerInfo> = {
  salama: {
    id: 'salama',
    name: 'Salama Insurance',
    logo: '/insurers/Salama.png',
    rating: 4.2,
    reviewCount: 1240,
    shariahCompliant: true,
  },
  watania: {
    id: 'watania',
    name: 'Watania Takaful',
    logo: '/insurers/Watania.png',
    rating: 4.0,
    reviewCount: 890,
    shariahCompliant: true,
  },
  orient: {
    id: 'orient',
    name: 'Orient Insurance',
    logo: '/insurers/ORIENT.png',
    rating: 4.5,
    reviewCount: 2100,
    shariahCompliant: false,
  },
  sukoon: {
    id: 'sukoon',
    name: 'Sukoon Insurance',
    logo: '/insurers/SukoonInsurance.png',
    rating: 4.3,
    reviewCount: 1560,
    shariahCompliant: false,
  },
  adnic: {
    id: 'adnic',
    name: 'ADNIC',
    logo: '/insurers/ADNIC.png',
    rating: 4.4,
    reviewCount: 1870,
    shariahCompliant: false,
  },
  qic: {
    id: 'qic',
    name: 'QIC',
    logo: '/insurers/QIC.png',
    rating: 4.1,
    reviewCount: 920,
    shariahCompliant: false,
  },
  'dubai-insurance': {
    id: 'dubai-insurance',
    name: 'Dubai Insurance',
    logo: '/insurers/DubaiInsurance.png',
    rating: 4.0,
    reviewCount: 750,
    shariahCompliant: false,
  },
  'insurance-house': {
    id: 'insurance-house',
    name: 'Insurance House',
    logo: '/insurers/InsuranceHouse.png',
    rating: 3.9,
    reviewCount: 620,
    shariahCompliant: false,
  },
  'yas-takaful': {
    id: 'yas-takaful',
    name: 'YAS Takaful',
    logo: '/insurers/YASTakaful.png',
    rating: 4.1,
    reviewCount: 530,
    shariahCompliant: true,
  },
  afnic: {
    id: 'afnic',
    name: 'AFNIC',
    logo: '/insurers/AFNIC.png',
    rating: 3.8,
    reviewCount: 440,
    shariahCompliant: false,
  },
  'al-ain-ahlia': {
    id: 'al-ain-ahlia',
    name: 'Al Ain Ahlia',
    logo: '/insurers/AlAinAhlia.png',
    rating: 4.0,
    reviewCount: 680,
    shariahCompliant: false,
  },
  'orient-takaful': {
    id: 'orient-takaful',
    name: 'Orient Takaful',
    logo: '/insurers/OrientTakaful.png',
    rating: 4.2,
    reviewCount: 780,
    shariahCompliant: true,
  },
};
