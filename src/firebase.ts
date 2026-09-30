import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { CardItem, OrderItem, OrderStage } from './types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Initialize Firestore using the specific database ID from configuration
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test on boot
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client offline, utilizing cached state.');
    }
  }
}

// ==========================================
// REAL-TIME ORDERS SUBSCRIPTIONS & MUTATIONS
// ==========================================

export function subscribeOrders(
  onData: (orders: OrderItem[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'orders';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const ordersList: OrderItem[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        ordersList.push({
          id: d.id,
          buzzerNumber: String(data.buzzerNumber || '1').replace(/#/g, ''),
          items: Array.isArray(data.items) ? data.items : [],
          cardId: data.cardId,
          cardName: data.cardName,
          initials: data.initials,
          colorScheme: data.colorScheme,
          notes: data.notes || '',
          stage: data.stage || 'queue',
          createdAt: data.createdAt || Date.now(),
          queuedAt: data.queuedAt || Date.now(),
          ovenAt: data.ovenAt,
          deliveredAt: data.deliveredAt,
        });
      });
      // Sort in memory by queuedAt descending
      ordersList.sort((a, b) => b.queuedAt - a.queuedAt);
      onData(ordersList);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

export async function syncSaveOrder(order: OrderItem) {
  const path = `orders/${order.id}`;
  try {
    await setDoc(doc(db, 'orders', order.id), {
      id: order.id,
      buzzerNumber: order.buzzerNumber,
      items: order.items,
      stage: order.stage,
      notes: order.notes || '',
      queuedAt: order.queuedAt,
      createdAt: order.createdAt,
      ...(order.ovenAt ? { ovenAt: order.ovenAt } : {}),
      ...(order.deliveredAt ? { deliveredAt: order.deliveredAt } : {}),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function syncUpdateOrderStatus(
  orderId: string,
  newStage: OrderStage,
  additionalTimestamps?: { ovenAt?: number; deliveredAt?: number }
) {
  const path = `orders/${orderId}`;
  try {
    const updateData: Record<string, unknown> = {
      stage: newStage,
      ...additionalTimestamps,
    };
    await updateDoc(doc(db, 'orders', orderId), updateData);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function syncDeleteOrder(orderId: string) {
  const path = `orders/${orderId}`;
  try {
    await deleteDoc(doc(db, 'orders', orderId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function syncClearDeliveredOrders(deliveredOrderIds: string[]) {
  if (deliveredOrderIds.length === 0) return;
  try {
    const batch = writeBatch(db);
    deliveredOrderIds.forEach((id) => {
      batch.delete(doc(db, 'orders', id));
    });
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, 'orders(batch)');
  }
}

// ==========================================
// REAL-TIME CARDS SUBSCRIPTIONS & MUTATIONS
// ==========================================

export function subscribeCards(
  onData: (cards: CardItem[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'cards';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const cardsList: CardItem[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        cardsList.push({
          id: d.id,
          name: data.name || 'Menu Item',
          initials: data.initials || 'ITEM',
          category: data.category || 'General',
          isActive: data.isActive !== false,
          colorScheme: data.colorScheme || {
            bg: 'bg-orange-50/60',
            border: 'border-orange-200',
            text: 'text-orange-700',
            badge: 'bg-orange-100 text-orange-800',
            pillBg: 'bg-orange-500',
          },
          createdAt: data.createdAt || Date.now(),
        });
      });
      // Sort by creation time
      cardsList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      onData(cardsList);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

export async function syncSaveCard(card: CardItem) {
  const path = `cards/${card.id}`;
  try {
    await setDoc(doc(db, 'cards', card.id), {
      id: card.id,
      name: card.name,
      initials: card.initials,
      category: card.category || 'General',
      isActive: card.isActive !== false,
      colorScheme: card.colorScheme,
      createdAt: card.createdAt || Date.now(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function syncDeleteCard(cardId: string) {
  const path = `cards/${cardId}`;
  try {
    await deleteDoc(doc(db, 'cards', cardId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// ===============================================
// REAL-TIME CATEGORIES SUBSCRIPTIONS & MUTATIONS
// ===============================================

export function subscribeCategories(
  onData: (categories: string[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'categories';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const catList: { id: string; name: string; createdAt: number }[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        if (data.name) {
          catList.push({
            id: d.id,
            name: data.name,
            createdAt: data.createdAt || 0,
          });
        }
      });
      catList.sort((a, b) => a.createdAt - b.createdAt);
      onData(catList.map((c) => c.name));
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

export async function syncAddCategory(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;
  const id = `cat-${trimmed.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  const path = `categories/${id}`;
  try {
    await setDoc(doc(db, 'categories', id), {
      id,
      name: trimmed,
      createdAt: Date.now(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function syncRenameCategory(
  oldName: string,
  newName: string,
  cardsToUpdate: CardItem[]
) {
  const trimmedNew = newName.trim();
  if (!trimmedNew || trimmedNew === oldName) return;
  try {
    const oldId = `cat-${oldName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const newId = `cat-${trimmedNew.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

    const batch = writeBatch(db);
    batch.delete(doc(db, 'categories', oldId));
    batch.set(doc(db, 'categories', newId), {
      id: newId,
      name: trimmedNew,
      createdAt: Date.now(),
    });

    cardsToUpdate.forEach((card) => {
      if (card.category === oldName) {
        batch.update(doc(db, 'cards', card.id), { category: trimmedNew });
      }
    });

    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'categories(rename)');
  }
}

export async function syncDeleteCategory(
  catName: string,
  cardsToReassign: CardItem[]
) {
  try {
    const catId = `cat-${catName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const batch = writeBatch(db);
    batch.delete(doc(db, 'categories', catId));

    cardsToReassign.forEach((card) => {
      if (card.category === catName) {
        batch.update(doc(db, 'cards', card.id), { category: 'General' });
      }
    });

    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, 'categories(delete)');
  }
}

// Initial Seeding: if cloud database is empty, seed initial menu cards, categories, and sample orders
export async function seedInitialCloudDataIfEmpty(
  initialCards: CardItem[],
  initialCategories: string[],
  initialOrders: OrderItem[]
) {
  try {
    const cardsSnap = await getDocs(collection(db, 'cards'));
    if (cardsSnap.empty) {
      console.log('Seeding initial cloud data to Firestore...');
      const batch = writeBatch(db);

      // Seed categories
      initialCategories.forEach((catName, idx) => {
        const id = `cat-${catName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
        batch.set(doc(db, 'categories', id), {
          id,
          name: catName,
          createdAt: Date.now() + idx,
        });
      });

      // Seed cards
      initialCards.forEach((c) => {
        batch.set(doc(db, 'cards', c.id), {
          id: c.id,
          name: c.name,
          initials: c.initials,
          category: c.category || 'General',
          isActive: c.isActive !== false,
          colorScheme: c.colorScheme,
          createdAt: c.createdAt || Date.now(),
        });
      });

      // Seed initial sample orders
      initialOrders.forEach((o) => {
        batch.set(doc(db, 'orders', o.id), {
          id: o.id,
          buzzerNumber: o.buzzerNumber,
          items: o.items,
          stage: o.stage,
          notes: o.notes || '',
          queuedAt: o.queuedAt,
          createdAt: o.createdAt,
          ...(o.ovenAt ? { ovenAt: o.ovenAt } : {}),
          ...(o.deliveredAt ? { deliveredAt: o.deliveredAt } : {}),
        });
      });

      await batch.commit();
      console.log('Initial cloud seed completed successfully!');
    }
  } catch (err) {
    console.warn('Seeding skipped or already populated:', err);
  }
}
