import itemOrder from '@/data/itemOrder.json';
import itemPkg from 'file-loader?name=assets/pkg/item.[md5:hash:hex:8].[ext]!@/assets/pkg/item.zip';

export const ITEM_ORDER = itemOrder;
export const ITEM_PKG = itemPkg;
