const CITY_ALIASES: Record<string, string> = {
  banglore: 'Bangalore',
  bengaluru: 'Bangalore',
  bombay: 'Mumbai',
  ahemdabad: 'Ahmedabad',
};

export const DEFAULT_VENDOR_CITIES = ['Ahmedabad', 'Rajkot', 'Surat', 'Vadodara'];

export const normalizeCityName = (city: string) => {
  const cleaned = city.trim().toLowerCase().replace(/\s+/g, ' ');
  if (!cleaned) return '';

  if (CITY_ALIASES[cleaned]) {
    return CITY_ALIASES[cleaned];
  }

  return cleaned.replace(/\b\w/g, (char) => char.toUpperCase());
};

type VendorCitySource = {
  address?: {
    city?: string;
  };
  city?: string;
  location?: string;
};

const isLikelyCity = (value: string) => {
  const normalized = value.trim().replace(/\s+/g, ' ');
  if (!normalized) return false;

  const wordCount = normalized.split(' ').length;
  if (wordCount > 3) return false;
  if (normalized.length > 30) return false;

  return /^[A-Za-z.\-\s]+$/.test(normalized);
};

export const extractVendorCity = (vendor: VendorCitySource) => {
  const candidates = [
    vendor.address?.city || '',
    vendor.city || '',
    (vendor.location || '').split(',')[0] || '',
  ];

  for (const raw of candidates) {
    if (!raw) continue;
    if (!isLikelyCity(raw)) continue;

    const normalized = normalizeCityName(raw);
    if (normalized) return normalized;
  }

  return '';
};

export const buildVendorCityFilters = <T extends VendorCitySource>(vendors: T[]) => {
  const discoveredCities = vendors.map(extractVendorCity).filter(Boolean);
  return ['All', ...Array.from(new Set(discoveredCities))];
};

export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export const isStrongPassword = (password: string) =>
  /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/.test(password);

export const normalizeSearchText = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) return '';
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

