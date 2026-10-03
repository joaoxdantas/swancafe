import React, { useState } from 'react';

interface CategoryItemIconProps {
  category?: string;
  imageUrl?: string;
  itemName?: string;
  colorScheme?: {
    bg: string;
    border: string;
    text: string;
    badge: string;
    pillBg: string;
  };
  compact?: boolean;
  className?: string;
}

export const CategoryItemIcon: React.FC<CategoryItemIconProps> = ({
  category = '',
  imageUrl,
  itemName = '',
  colorScheme,
  compact = false,
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);
  const normalizedCat = (category || '').toUpperCase().trim();

  // If a valid image URL is provided and has not errored, render it with 1:1 fixed ratio
  if (imageUrl && imageUrl.trim() && !imageError) {
    return (
      <div
        className={`aspect-square shrink-0 rounded-lg overflow-hidden border border-stone-200/90 dark:border-stone-700/80 bg-white dark:bg-stone-900 shadow-2xs ${
          compact ? 'w-8 h-8 sm:w-9 sm:h-9' : 'w-10 h-10 sm:w-11 sm:h-11'
        } ${className}`}
      >
        <img
          src={imageUrl.trim()}
          alt={itemName || category || 'Item icon'}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  // Generic category vector drawing with 1:1 proportion
  const sizeClasses = compact
    ? 'w-8 h-8 sm:w-9 sm:h-9 p-1.5'
    : 'w-10 h-10 sm:w-11 sm:h-11 p-2';

  // SVG Drawing Selector based on cafe category
  const renderCategoryDrawing = () => {
    // 1. BREAKFAST: Sunny side up egg with warm yolk & toast
    if (normalizedCat.includes('BREAKFAST') || normalizedCat.includes('EGG')) {
      return (
        <svg
          viewBox="0 0 48 48"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full text-blue-600 dark:text-blue-400"
        >
          {/* Egg white organic shape */}
          <path
            d="M24 8C14 8 8 15 8 24C8 33 15 40 24 40C34 40 40 33 40 24C40 14 33 8 24 8Z"
            fill="currentColor"
            fillOpacity="0.12"
          />
          {/* Yolk */}
          <circle cx="24" cy="24" r="7" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
          {/* Shine highlight */}
          <circle cx="22" cy="22" r="2" fill="#FFFFFF" />
        </svg>
      );
    }

    // 2. LUNCH: Layered Artisan Sandwich / Sub
    if (normalizedCat.includes('LUNCH') || normalizedCat.includes('SANDWICH') || normalizedCat.includes('WRAP')) {
      return (
        <svg
          viewBox="0 0 48 48"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full text-amber-600 dark:text-amber-400"
        >
          {/* Top Bread */}
          <path
            d="M6 18C6 14 12 12 24 12C36 12 42 14 42 18V20H6V18Z"
            fill="#F59E0B"
            fillOpacity="0.25"
          />
          {/* Filling: Lettuce wave & Tomato/Cheese */}
          <path d="M6 24C9 22 13 26 17 24C21 22 25 26 29 24C33 22 37 26 42 24" stroke="#10B981" strokeWidth="3" />
          <line x1="8" y1="28" x2="40" y2="28" stroke="#EF4444" strokeWidth="3" />
          {/* Bottom Bread */}
          <path
            d="M6 32V34C6 37 12 39 24 39C36 39 42 37 42 34V32H6Z"
            fill="#F59E0B"
            fillOpacity="0.25"
          />
        </svg>
      );
    }

    // 3. TOAST: Sliced Toasted Artisan Bread
    if (normalizedCat.includes('TOAST') || normalizedCat.includes('BREAD')) {
      return (
        <svg
          viewBox="0 0 48 48"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full text-violet-600 dark:text-violet-400"
        >
          {/* Bread slice outline */}
          <path
            d="M12 16C8 16 8 20 8 24V38C8 40 10 42 12 42H36C38 42 40 40 40 38V24C40 20 40 16 36 16C36 10 30 8 24 8C18 8 12 10 12 16Z"
            fill="currentColor"
            fillOpacity="0.12"
          />
          {/* Butter melting square in center */}
          <rect x="20" y="22" width="8" height="8" rx="2" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
        </svg>
      );
    }

    // 4. MFY (Made For You): Chef Skillet / Pan with Flame
    if (normalizedCat.includes('MFY') || normalizedCat.includes('COOKED') || normalizedCat.includes('HOT FOOD')) {
      return (
        <svg
          viewBox="0 0 48 48"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full text-emerald-600 dark:text-emerald-400"
        >
          {/* Pan bowl */}
          <ellipse cx="21" cy="27" rx="14" ry="9" fill="currentColor" fillOpacity="0.15" />
          {/* Handle */}
          <path d="M33 24L43 18" strokeWidth="3.5" />
          {/* Steam / sizzle waves */}
          <path d="M15 14C15 11 17 9 17 6" stroke="#10B981" strokeWidth="2" />
          <path d="M22 14C22 10 24 8 24 5" stroke="#10B981" strokeWidth="2" />
          <path d="M29 15C29 11 31 10 31 7" stroke="#10B981" strokeWidth="2" />
        </svg>
      );
    }

    // 5. MINI HOT / HOT DOG: Savory Sausage / Snack
    if (normalizedCat.includes('MINI HOT') || normalizedCat.includes('HOT DOG') || normalizedCat.includes('SNACK')) {
      return (
        <svg
          viewBox="0 0 48 48"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full text-orange-600 dark:text-orange-400"
        >
          {/* Bun */}
          <rect x="6" y="16" width="36" height="16" rx="8" fill="currentColor" fillOpacity="0.15" />
          {/* Sausage */}
          <line x1="4" y1="24" x2="44" y2="24" stroke="#EF4444" strokeWidth="5" strokeLinecap="round" />
          {/* Mustard drizzle */}
          <path d="M10 23C13 21 15 25 18 23C21 21 23 25 26 23C29 21 31 25 34 23C37 21 39 25 41 23" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    }

    // 6. SSG ROLLS: Golden Flaky Sausage Roll
    if (normalizedCat.includes('SSG') || normalizedCat.includes('SAUSAGE ROLL') || normalizedCat.includes('ROLL')) {
      return (
        <svg
          viewBox="0 0 48 48"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full text-amber-700 dark:text-amber-500"
        >
          {/* Pastry roll body */}
          <rect x="8" y="14" width="32" height="20" rx="6" fill="#F59E0B" fillOpacity="0.25" />
          {/* Score marks on pastry crust */}
          <line x1="16" y1="17" x2="18" y2="31" stroke="currentColor" strokeWidth="2.5" />
          <line x1="23" y1="17" x2="25" y2="31" stroke="currentColor" strokeWidth="2.5" />
          <line x1="30" y1="17" x2="32" y2="31" stroke="currentColor" strokeWidth="2.5" />
        </svg>
      );
    }

    // 7. PIES: Classic Aussie Meat Pie
    if (normalizedCat.includes('PIE') || normalizedCat.includes('TART') || normalizedCat.includes('BAKE')) {
      return (
        <svg
          viewBox="0 0 48 48"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full text-orange-700 dark:text-orange-400"
        >
          {/* Pie base foil/tin */}
          <path d="M10 24L14 38H34L38 24" fill="currentColor" fillOpacity="0.1" />
          {/* Fluted golden crust */}
          <path
            d="M6 24C6 20 12 16 24 16C36 16 42 20 42 24C42 26 36 28 24 28C12 28 6 26 6 24Z"
            fill="#D97706"
            fillOpacity="0.3"
          />
          {/* Pie top vent cuts */}
          <line x1="20" y1="21" x2="28" y2="23" stroke="#B45309" strokeWidth="2" strokeLinecap="round" />
          <line x1="22" y1="24" x2="26" y2="20" stroke="#B45309" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    }

    // 8. COFFEE / DRINKS: Cafe Cup with Fresh Steam
    if (normalizedCat.includes('COFFEE') || normalizedCat.includes('DRINK') || normalizedCat.includes('BEVERAGE')) {
      return (
        <svg
          viewBox="0 0 48 48"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full text-amber-800 dark:text-amber-300"
        >
          {/* Cup */}
          <path d="M10 18H32V32C32 36 28 38 21 38C14 38 10 36 10 32V18Z" fill="currentColor" fillOpacity="0.15" />
          {/* Handle */}
          <path d="M32 21C36 21 38 23 38 26C38 29 36 31 32 31" strokeWidth="2.5" />
          {/* Saucer */}
          <path d="M6 39H36" strokeWidth="2.5" strokeLinecap="round" />
          {/* Steam */}
          <path d="M16 13C16 11 17 9 17 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M24 13C24 10 25 8 25 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    }

    // 9. SWEETS / BAKERY: Pastry / Cupcake / Muffin
    if (normalizedCat.includes('SWEET') || normalizedCat.includes('CAKE') || normalizedCat.includes('MUFFIN')) {
      return (
        <svg
          viewBox="0 0 48 48"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full text-pink-600 dark:text-pink-400"
        >
          {/* Base paper cup */}
          <path d="M12 24L15 40H33L36 24" fill="currentColor" fillOpacity="0.12" />
          {/* Icing / Dome */}
          <path
            d="M9 24C9 16 16 12 24 12C32 12 39 16 39 24C39 25 38 26 36 26C34 26 33 24 31 24C29 24 28 26 26 26C24 26 23 24 21 24C19 24 18 26 16 26C14 26 13 25 9 24Z"
            fill="#EC4899"
            fillOpacity="0.25"
          />
          {/* Cherry on top */}
          <circle cx="24" cy="9" r="3" fill="#DC2626" />
        </svg>
      );
    }

    // Default: Chef Plate & Cutlery
    return (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-full h-full text-stone-600 dark:text-stone-300"
      >
        <circle cx="24" cy="24" r="16" fill="currentColor" fillOpacity="0.1" />
        <circle cx="24" cy="24" r="11" strokeDasharray="3 3" />
        <path d="M19 21V27M24 19V29M29 21V27" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  };

  return (
    <div
      className={`aspect-square shrink-0 rounded-xl overflow-hidden flex items-center justify-center transition-all bg-stone-100/90 dark:bg-stone-800/90 border border-stone-200/80 dark:border-stone-700/80 shadow-2xs group-hover:scale-105 ${sizeClasses} ${className}`}
      title={`${category || 'Item'} icon`}
    >
      {renderCategoryDrawing()}
    </div>
  );
};
