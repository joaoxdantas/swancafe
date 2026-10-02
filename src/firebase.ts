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
          isDigitalBuzzer: Boolean(data.isDigitalBuzzer),
          scannedAt: data.scannedAt,
          buzzedAt: data.buzzedAt,
          completedAt: data.completedAt,
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

export function subscribeOrderById(
  orderId: string,
  onData: (order: OrderItem | null) => void,
  onError?: (err: unknown) => void
) {
  const path = `orders/${orderId}`;
  return onSnapshot(
    doc(db, 'orders', orderId),
    (docSnap) => {
      if (!docSnap.exists()) {
        onData(null);
        return;
      }
      const data = docSnap.data();
      onData({
        id: docSnap.id,
        buzzerNumber: String(data.buzzerNumber || '1').replace(/#/g, ''),
        isDigitalBuzzer: Boolean(data.isDigitalBuzzer),
        scannedAt: data.scannedAt,
        buzzedAt: data.buzzedAt,
        completedAt: data.completedAt,
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
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

export async function syncMarkOrderScanned(orderId: string) {
  const path = `orders/${orderId}`;
  try {
    await setDoc(
      doc(db, 'orders', orderId),
      {
        scannedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function syncTriggerOrderBuzzer(orderId: string) {
  const path = `orders/${orderId}`;
  try {
    await setDoc(
      doc(db, 'orders', orderId),
      {
        buzzedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function syncCompleteOrder(orderId: string) {
  const path = `orders/${orderId}`;
  try {
    await setDoc(
      doc(db, 'orders', orderId),
      {
        completedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function syncSaveOrder(order: OrderItem) {
  const path = `orders/${order.id}`;
  try {
    // Sanitize items array ensuring zero undefined fields reach Firestore
    const cleanItems = (order.items || []).map((it) => ({
      cardId: it.cardId || '',
      cardName: it.cardName || '',
      initials: it.initials || '',
      quantity: Number(it.quantity) || 1,
      category: it.category || 'General',
      colorScheme: it.colorScheme || {
        bg: 'bg-amber-50/80',
        border: 'border-amber-500',
        text: 'text-amber-700',
        badge: 'bg-amber-100 text-amber-800',
        pillBg: 'bg-amber-500',
      },
    }));

    const docData: Record<string, unknown> = {
      id: order.id,
      buzzerNumber: order.buzzerNumber,
      isDigitalBuzzer: Boolean(order.isDigitalBuzzer),
      items: cleanItems,
      stage: order.stage,
      notes: order.notes || '',
      queuedAt: order.queuedAt || Date.now(),
      createdAt: order.createdAt || Date.now(),
    };

    if (order.scannedAt) docData.scannedAt = order.scannedAt;
    if (order.buzzedAt) docData.buzzedAt = order.buzzedAt;
    if (order.completedAt) docData.completedAt = order.completedAt;
    if (order.ovenAt) docData.ovenAt = order.ovenAt;
    if (order.deliveredAt) docData.deliveredAt = order.deliveredAt;

    await setDoc(doc(db, 'orders', order.id), docData, { merge: true });
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
    };
    if (additionalTimestamps?.ovenAt !== undefined) {
      updateData.ovenAt = additionalTimestamps.ovenAt;
    }
    if (additionalTimestamps?.deliveredAt !== undefined) {
      updateData.deliveredAt = additionalTimestamps.deliveredAt;
    }
    await setDoc(doc(db, 'orders', orderId), updateData, { merge: true });
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
  onData: (categories: string[], categoryColors: Record<string, string>) => void,
  onError?: (err: unknown) => void
) {
  const path = 'categories';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const catList: { id: string; name: string; color?: string; createdAt: number }[] = [];
      const colorsMap: Record<string, string> = {};
      snapshot.forEach((d) => {
        const data = d.data();
        if (data.name) {
          catList.push({
            id: d.id,
            name: data.name,
            color: data.color,
            createdAt: data.createdAt || 0,
          });
          if (data.color) {
            colorsMap[data.name] = data.color;
          }
        }
      });
      catList.sort((a, b) => a.createdAt - b.createdAt);
      onData(catList.map((c) => c.name), colorsMap);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

export async function syncAddCategory(name: string, color?: string) {
  const trimmed = name.trim();
  if (!trimmed) return;
  const id = `cat-${trimmed.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  const path = `categories/${id}`;
  try {
    await setDoc(doc(db, 'categories', id), {
      id,
      name: trimmed,
      color: color || 'orange',
      createdAt: Date.now(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function syncUpdateCategoryColor(name: string, color: string) {
  const trimmed = name.trim();
  if (!trimmed) return;
  const id = `cat-${trimmed.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  const path = `categories/${id}`;
  try {
    await updateDoc(doc(db, 'categories', id), {
      color,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function syncRenameCategory(
  oldName: string,
  newName: string,
  cardsToUpdate: CardItem[],
  color?: string
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
      ...(color ? { color } : {}),
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
  initialOrders: OrderItem[],
  initialCategoryColors?: Record<string, string>
) {
  try {
    const cardsSnap = await getDocs(collection(db, 'cards'));
    if (cardsSnap.empty) {
      console.log('Seeding initial cloud data to Firestore...');
      const batch = writeBatch(db);

      // Seed categories
      initialCategories.forEach((catName, idx) => {
        const id = `cat-${catName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
        const color = (initialCategoryColors && initialCategoryColors[catName]) || (catName.toLowerCase().includes('salad') ? 'emerald' : 'orange');
        batch.set(doc(db, 'categories', id), {
          id,
          name: catName,
          color,
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
