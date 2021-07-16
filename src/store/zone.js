import { zoneToActivity, zoneToRetro } from '@/data/zone.json';

export const zoneToNameId = { ...zoneToActivity, ...zoneToRetro };
Object.freeze(zoneToNameId);
