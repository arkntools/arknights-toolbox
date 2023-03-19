import localforage from 'localforage';
import { extendPrototype as extendGetItems } from 'localforage-getitems';
import { extendPrototype as extendSetItems } from 'localforage-setitems';
import { extendPrototype as extendRemoveItems } from 'localforage-removeitems';

extendGetItems(localforage);
extendSetItems(localforage);
extendRemoveItems(localforage);
