import React, { useState, useEffect } from 'react';
import { CardItem, OrderItem, OrderItemLine, OrderStage } from './types';
import { INITIAL_CARDS, DEFAULT_CATEGORIES, sounds, COLOR_PALETTES, getColorForName } from './utils/helpers';
import { Header } from './components/Header';
import { CardGrid } from './components/CardGrid';
import { TrackingBoard } from './components/TrackingBoard';
import { MenuEditTab } from './components/MenuEditTab';
import { CardEditModal } from './components/CardEditModal';
import { OrderComposer } from './components/OrderComposer';
import { Check, Layers, Activity, SlidersHorizontal } from 'lucide-react';
import {
  testConnection,
  subscribeOrders,
  subscribeCards,
  subscribeCategories,
  syncSaveOrder,
  syncUpdateOrderStatus,
  syncDeleteOrder,
  syncClearDeliveredOrders,
  syncSaveCard,
  syncDeleteCard,
  syncAddCategory,
  syncRenameCategory,
  syncDeleteCategory,
  seedInitialCloudDataIfEmpty,
} from './firebase';

const STORAGE_KEY_CARDS = 'orderflow_cards_v4';
const STORAGE_KEY_ORDERS = 'orderflow_orders_v4';
const STORAGE_KEY_COUNTER = 'orderflow_buzzer_counter_v4';
const STORAGE_KEY_CATEGORIES = 'orderflow_categories_v4';

export default function App() {
  const [activeTab, setActiveTab] = useState<'cards' | 'tracking' | 'menu-edit'>('cards');

  // Categories State
  const [categories, setCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = parsed.filter((c): c is string => typeof c === 'string' && !!c.trim());
          if (cleaned.length > 0) return cleaned;
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_CATEGORIES;
  });

  // Cards State (with Add, Edit, Remove, and On/Off toggle support)
  const [cards, setCards] = useState<CardItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CARDS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((c, i) => ({
            id: c.id || `card-${i}`,
            name: c.name || 'Menu Item',
            initials: c.initials || 'ITEM',
            category: c.category || 'General',
            isActive: c.isActive !== false,
            colorScheme: c.colorScheme || INITIAL_CARDS[i % INITIAL_CARDS.length]?.colorScheme || INITIAL_CARDS[0].colorScheme,
            createdAt: c.createdAt || Date.now(),
          }));
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_CARDS;
  });

  // Active Buzzer Order Draft (supports multiple items per order)
  const [draftItems, setDraftItems] = useState<OrderItemLine[]>([]);

  // Buzzer reference number (NO #)
  const [buzzerNumber, setBuzzerNumber] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COUNTER);
      if (saved) return saved.replace(/#/g, '');
    } catch {
      // fallback
    }
    return '14';
  });

  // Orders State (in Queue, Oven, Delivered) with multiple items and Buzzer number (NO #)
  const [orders, setOrders] = useState<OrderItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ORDERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((o: any) => {
            const fallbackColor = o.colorScheme || INITIAL_CARDS[0].colorScheme;
            return {
              ...o,
              buzzerNumber: String(o.buzzerNumber || '1').replace(/#/g, ''),
              items: Array.isArray(o.items) && o.items.length > 0
                ? o.items.map((it: any) => ({
                    cardId: it.cardId || 'item',
                    cardName: it.cardName || 'Item',
                    initials: it.initials || '??',
                    quantity: typeof it.quantity === 'number' && it.quantity > 0 ? it.quantity : 1,
                    colorScheme: it.colorScheme || fallbackColor,
                  }))
                : [
                    {
                      cardId: o.cardId || 'legacy',
                      cardName: o.cardName || 'Item',
                      initials: o.initials || '??',
                      quantity: 1,
                      colorScheme: fallbackColor,
                    },
                  ],
            };
          });
        }
      }
    } catch {
      // fallback
    }
    const now = Date.now();
    return [
      {
        id: 'ord-seed-1',
        buzzerNumber: '12',
        cardId: 'card-1',
        cardName: 'Margherita Classic',
        initials: 'MC',
        colorScheme: INITIAL_CARDS[0].colorScheme,
        items: [
          {
            cardId: 'card-1',
            cardName: 'Margherita Classic',
            initials: 'MC',
            quantity: 2,
            colorScheme: INITIAL_CARDS[0].colorScheme,
          },
          {
            cardId: 'card-5',
            cardName: 'Garlic Focaccia',
            initials: 'GF',
            quantity: 1,
            colorScheme: INITIAL_CARDS[4].colorScheme,
          },
        ],
        stage: 'queue',
        notes: 'Table 4 - Extra crispy',
        createdAt: now - 85000,
        queuedAt: now - 85000,
      },
      {
        id: 'ord-seed-2',
        buzzerNumber: '7',
        cardId: 'card-2',
        cardName: 'Pepperoni Supreme',
        initials: 'PS',
        colorScheme: INITIAL_CARDS[1].colorScheme,
        items: [
          {
            cardId: 'card-2',
            cardName: 'Pepperoni Supreme',
            initials: 'PS',
            quantity: 1,
            colorScheme: INITIAL_CARDS[1].colorScheme,
          },
          {
            cardId: 'card-3',
            cardName: 'Quattro Formaggi',
            initials: 'QF',
            quantity: 1,
            colorScheme: INITIAL_CARDS[2].colorScheme,
          },
        ],
        stage: 'oven',
        notes: 'Well done crust',
        createdAt: now - 190000,
        queuedAt: now - 190000,
        ovenAt: now - 90000,
      },
      {
        id: 'ord-seed-3',
        buzzerNumber: '3',
        cardId: 'card-5',
        cardName: 'Garlic Focaccia',
        initials: 'GF',
        colorScheme: INITIAL_CARDS[4].colorScheme,
        items: [
          {
            cardId: 'card-5',
            cardName: 'Garlic Focaccia',
            initials: 'GF',
            quantity: 1,
            colorScheme: INITIAL_CARDS[4].colorScheme,
          },
          {
            cardId: 'card-6',
            cardName: 'Caesar Salad',
            initials: 'CS',
            quantity: 2,
            colorScheme: INITIAL_CARDS[5].colorScheme,
          },
        ],
        stage: 'delivered',
        createdAt: now - 520000,
        queuedAt: now - 520000,
        ovenAt: now - 400000,
        deliveredAt: now - 130000,
      },
    ];
  });

  // Sound settings
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Search & Filter state for cards
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [cardToEdit, setCardToEdit] = useState<CardItem | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    actionText?: string;
    onAction?: () => void;
  } | null>(null);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
    } catch {
      // ignore
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(cards));
    } catch {
      // ignore
    }
  }, [cards]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COUNTER, buzzerNumber.replace(/#/g, ''));
    } catch {
      // ignore
    }
  }, [buzzerNumber]);

  // Real-time Cloud Synchronization (Firebase Firestore onSnapshot)
  useEffect(() => {
    testConnection();
    // Seed initial data if cloud is empty so any new device gets the full pizza menu
    seedInitialCloudDataIfEmpty(INITIAL_CARDS, DEFAULT_CATEGORIES, orders);

    let isInitialLoad = true;
    const unsubOrders = subscribeOrders((cloudOrders) => {
      if (!isInitialLoad) {
        setOrders((prev) => {
          const prevMap = new Map(prev.map((o) => [o.id, o]));
          // Check if a brand-new order arrived in Queue from another device
          const hasNewIncoming = cloudOrders.some(
            (o) => !prevMap.has(o.id) && o.stage === 'queue'
          );
          if (hasNewIncoming) {
            sounds.playBell();
          }
          return cloudOrders;
        });
      } else {
        isInitialLoad = false;
        if (cloudOrders.length > 0) {
          setOrders(cloudOrders);
        }
      }
    });

    const unsubCards = subscribeCards((cloudCards) => {
      if (cloudCards.length > 0) {
        setCards(cloudCards);
      }
    });

    const unsubCategories = subscribeCategories((cloudCategories) => {
      if (cloudCategories.length > 0) {
        setCategories(cloudCategories);
      }
    });

    return () => {
      unsubOrders();
      unsubCards();
      unsubCategories();
    };
  }, []);

  // Click card in grid -> adds item to active Buzzer draft order!
  const handleSelectCard = (card: CardItem) => {
    if (card.isActive === false) return;
    sounds.playPop();
    setDraftItems((prev) => {
      const existing = prev.find((item) => item.cardId === card.id);
      if (existing) {
        return prev.map((item) =>
          item.cardId === card.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          cardId: card.id,
          cardName: card.name,
          initials: card.initials,
          quantity: 1,
          colorScheme: card.colorScheme,
        },
      ];
    });
  };

  // Adjust item quantity in draft
  const handleUpdateDraftQuantity = (cardId: string, delta: number) => {
    sounds.playPop();
    setDraftItems((prev) => {
      return prev
        .map((item) => {
          if (item.cardId === cardId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as OrderItemLine[];
    });
  };

  // Clear draft
  const handleClearDraft = () => {
    sounds.playPop();
    setDraftItems([]);
  };

  // Dispatch current buzzer draft to kitchen queue
  const handleSendDraftOrder = (notes?: string) => {
    if (draftItems.length === 0) return;

    const cleanBuzzer = buzzerNumber.trim().replace(/#/g, '') || '1';
    const now = Date.now();
    const primaryItem = draftItems[0];
    const totalCount = draftItems.reduce((acc, it) => acc + it.quantity, 0);

    const newOrder: OrderItem = {
      id: `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      buzzerNumber: cleanBuzzer,
      items: draftItems,
      cardId: primaryItem.cardId,
      cardName: primaryItem.cardName,
      initials: primaryItem.initials,
      colorScheme: primaryItem.colorScheme,
      stage: 'queue',
      notes,
      createdAt: now,
      queuedAt: now,
    };

    setOrders((prev) => [newOrder, ...prev]);
    syncSaveOrder(newOrder);
    setDraftItems([]);

    // Advance buzzer number
    const parsed = parseInt(cleanBuzzer, 10);
    if (!isNaN(parsed)) {
      setBuzzerNumber(String(parsed + 1));
    }

    // Confirmation Toast (NO #)
    setToastMessage({
      text: `Buzzer ${cleanBuzzer} sent to Queue with ${totalCount} item${totalCount > 1 ? 's' : ''}!`,
      actionText: 'View Tracking ➔',
      onAction: () => {
        setActiveTab('tracking');
        setToastMessage(null);
      },
    });

    setTimeout(() => {
      setToastMessage((current) => (current?.text.includes(cleanBuzzer) ? null : current));
    }, 4500);
  };

  // CATEGORY MANAGEMENT HANDLERS
  const handleAddCategory = (newCat: string) => {
    const trimmed = newCat.trim();
    if (!trimmed || categories.includes(trimmed)) return;
    setCategories((prev) => [...prev, trimmed]);
    syncAddCategory(trimmed);
    setToastMessage({ text: `Category "${trimmed}" created.` });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRenameCategory = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) return;

    // Update categories list
    setCategories((prev) =>
      prev.map((cat) => (cat === oldName ? trimmed : cat))
    );

    // Update all cards using old category
    setCards((prev) =>
      prev.map((c) => (c.category === oldName ? { ...c, category: trimmed } : c))
    );

    syncRenameCategory(oldName, trimmed, cards);

    // If currently filtered by old category, update filter
    if (selectedCategory === oldName) {
      setSelectedCategory(trimmed);
    }

    setToastMessage({
      text: `Renamed category "${oldName}" to "${trimmed}".`,
    });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeleteCategory = (catName: string) => {
    setCategories((prev) => prev.filter((c) => c !== catName));

    // Re-assign cards that used this category to 'General' or default
    setCards((prev) =>
      prev.map((c) =>
        c.category === catName ? { ...c, category: 'General' } : c
      )
    );

    syncDeleteCategory(catName, cards);

    if (selectedCategory === catName) {
      setSelectedCategory('All');
    }

    setToastMessage({ text: `Category "${catName}" removed.` });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ITEM ACTIVE / INACTIVE TOGGLE (TURN ON / OFF FOR REUSE)
  const handleToggleCardActive = (cardId: string) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id !== cardId) return c;
        const newStatus = !(c.isActive !== false);
        const updated = { ...c, isActive: newStatus };
        syncSaveCard(updated);
        setToastMessage({
          text: newStatus
            ? `Turned ON: "${c.name}" is now available in Cards tab.`
            : `Turned OFF: "${c.name}" hidden from Cards tab (saved for reuse).`,
        });
        setTimeout(() => setToastMessage(null), 3500);
        return updated;
      })
    );
  };

  // Duplicate Card
  const handleDuplicateCard = (card: CardItem) => {
    sounds.playPop();
    const newCard: CardItem = {
      ...card,
      id: `card-${Date.now()}`,
      name: `${card.name} (Copy)`,
      createdAt: Date.now(),
    };
    setCards((prev) => [newCard, ...prev]);
    syncSaveCard(newCard);
    setToastMessage({ text: `Duplicated "${card.name}".` });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handle Open Edit for Existing Card
  const handleEditCard = (card: CardItem) => {
    try {
      sounds.playPop();
    } catch {
      // ignore
    }
    const safeCard: CardItem = {
      ...card,
      name: card.name || 'Menu Item',
      initials: card.initials || 'ITEM',
      category: card.category || (categories[0] || 'General'),
      isActive: card.isActive !== false,
      colorScheme: card.colorScheme || getColorForName(card.name || 'Item') || COLOR_PALETTES[0],
    };
    setCardToEdit(safeCard);
    setIsEditModalOpen(true);
  };

  // Handle Open Add New Card
  const handleOpenAddModal = () => {
    sounds.playPop();
    setCardToEdit(null);
    setIsEditModalOpen(true);
  };

  // Handle Save (Add or Update) Card
  const handleSaveCard = (cardData: Omit<CardItem, 'id' | 'createdAt'> & { id?: string }) => {
    if (cardData.id) {
      const existing = cards.find((c) => c.id === cardData.id);
      const updatedCard: CardItem = {
        ...cardData,
        id: cardData.id,
        createdAt: existing?.createdAt || Date.now(),
      };
      setCards((prev) =>
        prev.map((c) => (c.id === cardData.id ? updatedCard : c))
      );
      syncSaveCard(updatedCard);
      setToastMessage({
        text: `Updated card "${cardData.name}" [${cardData.initials}]`,
      });
    } else {
      const newCard: CardItem = {
        ...cardData,
        id: `card-${Date.now()}`,
        createdAt: Date.now(),
      };
      setCards((prev) => [newCard, ...prev]);
      syncSaveCard(newCard);
      setToastMessage({
        text: `Added card "${newCard.name}" [${newCard.initials}]`,
      });
    }
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handle Delete Card
  const handleDeleteCard = (cardId: string) => {
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    setDraftItems((prev) => prev.filter((it) => it.cardId !== cardId));
    syncDeleteCard(cardId);
    setToastMessage({ text: 'Card removed successfully.' });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Update Order Stage (Queue -> Oven -> Delivered)
  const handleUpdateStage = (orderId: string, newStage: OrderStage) => {
    const now = Date.now();
    const additionalTimestamps: { ovenAt?: number; deliveredAt?: number } = {};
    if (newStage === 'oven') {
      additionalTimestamps.ovenAt = now;
    } else if (newStage === 'delivered') {
      additionalTimestamps.deliveredAt = now;
    }

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const updated = { ...order, stage: newStage, ...additionalTimestamps };
        return updated;
      })
    );
    syncUpdateOrderStatus(orderId, newStage, additionalTimestamps);
  };

  // Remove individual order
  const handleRemoveOrder = (orderId: string) => {
    sounds.playPop();
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    syncDeleteOrder(orderId);
  };

  // Clear all delivered
  const handleClearDelivered = () => {
    sounds.playPop();
    const deliveredIds = orders.filter((o) => o.stage === 'delivered').map((o) => o.id);
    setOrders((prev) => prev.filter((o) => o.stage !== 'delivered'));
    syncClearDeliveredOrders(deliveredIds);
  };

  // Quick Demo / Test Order
  const handleQuickDemoOrder = () => {
    const activeAvailable = cards.filter((c) => c.isActive !== false);
    const random1 = activeAvailable[0] || INITIAL_CARDS[0];
    const random2 = activeAvailable[1] || INITIAL_CARDS[1];
    const demoItems: OrderItemLine[] = [
      {
        cardId: random1.id,
        cardName: random1.name,
        initials: random1.initials,
        quantity: 2,
        colorScheme: random1.colorScheme,
      },
      {
        cardId: random2.id,
        cardName: random2.name,
        initials: random2.initials,
        quantity: 1,
        colorScheme: random2.colorScheme,
      },
    ];

    const cleanBuzzer = buzzerNumber.trim().replace(/#/g, '') || '99';
    const now = Date.now();

    const newOrder: OrderItem = {
      id: `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      buzzerNumber: cleanBuzzer,
      items: demoItems,
      cardId: random1.id,
      cardName: random1.name,
      initials: random1.initials,
      colorScheme: random1.colorScheme,
      stage: 'queue',
      notes: 'Quick test multi-item order',
      createdAt: now,
      queuedAt: now,
    };

    setOrders((prev) => [newOrder, ...prev]);
    syncSaveOrder(newOrder);

    const parsed = parseInt(cleanBuzzer, 10);
    if (!isNaN(parsed)) {
      setBuzzerNumber(String(parsed + 1));
    }

    setToastMessage({
      text: `Buzzer ${cleanBuzzer} sent to Queue with 2 items!`,
      actionText: 'View Tracking ➔',
      onAction: () => {
        setActiveTab('tracking');
        setToastMessage(null);
      },
    });
  };

  const queueCount = orders.filter((o) => o.stage === 'queue').length;
  const ovenCount = orders.filter((o) => o.stage === 'oven').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-orange-100 selection:text-orange-900">
      {/* Clean Sticky Header with 3 Tabs */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        queueCount={queueCount}
        ovenCount={ovenCount}
        onOpenAddModal={handleOpenAddModal}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onQuickDemoOrder={handleQuickDemoOrder}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'cards' ? (
          <div>
            {/* Active Buzzer Order Composer (Multi-Item Support) */}
            <OrderComposer
              draftItems={draftItems}
              onUpdateQuantity={handleUpdateDraftQuantity}
              onClearDraft={handleClearDraft}
              buzzerNumber={buzzerNumber}
              setBuzzerNumber={setBuzzerNumber}
              onSendOrder={handleSendDraftOrder}
              availableCards={cards.filter((c) => c.isActive !== false)}
              onAddCardToDraft={handleSelectCard}
            />

            {/* Cards Grid */}
            <CardGrid
              cards={cards}
              categories={categories}
              draftItems={draftItems}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              onSelectCard={handleSelectCard}
              onNavigateToMenuEdit={() => {
                sounds.playPop();
                setActiveTab('menu-edit');
              }}
            />
          </div>
        ) : activeTab === 'tracking' ? (
          <TrackingBoard
            orders={orders}
            onUpdateStage={handleUpdateStage}
            onRemoveOrder={handleRemoveOrder}
            onClearDelivered={handleClearDelivered}
            onGoToCardsTab={() => setActiveTab('cards')}
          />
        ) : (
          /* Menu Edit Tab: All Edits, Category Management & Turning On/Off */
          <MenuEditTab
            cards={cards}
            categories={categories}
            onAddCategory={handleAddCategory}
            onRenameCategory={handleRenameCategory}
            onDeleteCategory={handleDeleteCategory}
            onToggleCardActive={handleToggleCardActive}
            onEditCard={handleEditCard}
            onDeleteCard={handleDeleteCard}
            onDuplicateCard={handleDuplicateCard}
            onOpenAddModal={handleOpenAddModal}
          />
        )}
      </main>

      {/* Add / Edit Card Modal */}
      <CardEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setCardToEdit(null);
        }}
        cardToEdit={cardToEdit}
        categories={categories}
        onSaveCard={handleSaveCard}
        onDeleteCard={handleDeleteCard}
        onAddNewCategory={handleAddCategory}
      />

      {/* Floating Bottom Quick Tab Bar on Mobile */}
      <div className="sm:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-lg rounded-2xl p-1.5 flex items-center gap-1">
        <button
          type="button"
          onClick={() => {
            sounds.playPop();
            setActiveTab('cards');
          }}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
            activeTab === 'cards'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Cards</span>
          {draftItems.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-orange-600 text-white text-[10px] font-black flex items-center justify-center">
              {draftItems.reduce((acc, it) => acc + it.quantity, 0)}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            sounds.playPop();
            setActiveTab('tracking');
          }}
          className={`relative flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
            activeTab === 'tracking'
              ? 'bg-orange-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Tracking</span>
          {queueCount + ovenCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-white text-orange-600 text-[10px] font-black flex items-center justify-center">
              {queueCount + ovenCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            sounds.playPop();
            setActiveTab('menu-edit');
          }}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
            activeTab === 'menu-edit'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Menu</span>
        </button>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-3 duration-200">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-3 max-w-sm sm:max-w-md">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <p className="text-xs sm:text-sm font-medium flex-1 truncate">
              {toastMessage.text}
            </p>
            {toastMessage.actionText && toastMessage.onAction && (
              <button
                type="button"
                onClick={toastMessage.onAction}
                className="text-xs font-bold text-orange-400 hover:text-orange-300 underline shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <span>{toastMessage.actionText}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
