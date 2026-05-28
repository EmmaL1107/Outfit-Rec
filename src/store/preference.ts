import type { UserPreference } from '../types';

const STORAGE_KEY = 'outfit-user-preference';

const DEFAULT_PREFERENCE: UserPreference = {
  outfitCombinations: [],
  blacklist: [],
  likedColorSchemes: [],
  likedStyleCombos: [],
  dislikedColorSchemes: [],
  dislikedStyleCombos: [],
};

export function getPreference(): UserPreference {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return {
        ...DEFAULT_PREFERENCE,
        ...parsed,
        likedColorSchemes: parsed.likedColorSchemes || [],
        likedStyleCombos: parsed.likedStyleCombos || [],
        dislikedColorSchemes: parsed.dislikedColorSchemes || [],
        dislikedStyleCombos: parsed.dislikedStyleCombos || [],
      };
    }
  } catch (e) {
    console.error('Failed to read preference:', e);
  }
  return { ...DEFAULT_PREFERENCE };
}

export function savePreference(preference: UserPreference): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preference));
  } catch (e) {
    console.error('Failed to save preference:', e);
  }
}

export function addToBlacklist(clothingId: string, days: number = 7): void {
  const preference = getPreference();
  const bannedUntil = Date.now() + days * 24 * 60 * 60 * 1000;

  const existingIndex = preference.blacklist.findIndex((item) => item.clothingId === clothingId);
  if (existingIndex >= 0) {
    preference.blacklist[existingIndex].bannedUntil = bannedUntil;
  } else {
    preference.blacklist.push({ clothingId, bannedUntil });
  }

  savePreference(preference);
}

export function removeFromBlacklist(clothingId: string): void {
  const preference = getPreference();
  preference.blacklist = preference.blacklist.filter((item) => item.clothingId !== clothingId);
  savePreference(preference);
}

export function isBlacklisted(clothingId: string): boolean {
  const preference = getPreference();
  const item = preference.blacklist.find((item) => item.clothingId === clothingId);
  if (!item) return false;
  return item.bannedUntil > Date.now();
}

export function getBlacklistedIds(): string[] {
  const preference = getPreference();
  const now = Date.now();
  return preference.blacklist.filter((item) => item.bannedUntil > now).map((item) => item.clothingId);
}

export function addOutfitCombination(combination: string): void {
  const preference = getPreference();
  if (!preference.outfitCombinations.includes(combination)) {
    preference.outfitCombinations.push(combination);
  }
  savePreference(preference);
}

export function getOutfitCombinations(): string[] {
  return getPreference().outfitCombinations;
}

export function addLikedColorScheme(colorKey: string): void {
  const preference = getPreference();
  if (!preference.likedColorSchemes.includes(colorKey)) {
    preference.likedColorSchemes.push(colorKey);
  }
  preference.dislikedColorSchemes = preference.dislikedColorSchemes.filter((c) => c !== colorKey);
  savePreference(preference);
}

export function getLikedColorSchemes(): string[] {
  return getPreference().likedColorSchemes;
}

export function addLikedStyleCombo(comboKey: string): void {
  const preference = getPreference();
  if (!preference.likedStyleCombos.includes(comboKey)) {
    preference.likedStyleCombos.push(comboKey);
  }
  preference.dislikedStyleCombos = preference.dislikedStyleCombos.filter((c) => c !== comboKey);
  savePreference(preference);
}

export function getLikedStyleCombos(): string[] {
  return getPreference().likedStyleCombos;
}

export function addDislikedColorScheme(colorKey: string): void {
  const preference = getPreference();
  if (!preference.dislikedColorSchemes.includes(colorKey)) {
    preference.dislikedColorSchemes.push(colorKey);
  }
  preference.likedColorSchemes = preference.likedColorSchemes.filter((c) => c !== colorKey);
  savePreference(preference);
}

export function getDislikedColorSchemes(): string[] {
  return getPreference().dislikedColorSchemes;
}

export function addDislikedStyleCombo(comboKey: string): void {
  const preference = getPreference();
  if (!preference.dislikedStyleCombos.includes(comboKey)) {
    preference.dislikedStyleCombos.push(comboKey);
  }
  preference.likedStyleCombos = preference.likedStyleCombos.filter((c) => c !== comboKey);
  savePreference(preference);
}

export function getDislikedStyleCombos(): string[] {
  return getPreference().dislikedStyleCombos;
}

export function cleanupExpiredBlacklist(): void {
  const preference = getPreference();
  const now = Date.now();
  preference.blacklist = preference.blacklist.filter((item) => item.bannedUntil > now);
  savePreference(preference);
}
