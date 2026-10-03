# Implementation Plan: 1:1 Item Icons & Image Upload Support (Completed)

Implementing 1:1 fixed-proportion item icons positioned directly to the left of initials in the card center, category-specific vector drawings, and image URL / file upload capabilities in the Menu Edit modal without enlarging card dimensions.

---

## Implemented & Verified Changes

### 1. 1:1 Fixed-Proportion Item Icons Without Enlarging Cards
- **Preserved Card Dimensions**: Maintained original card heights (`min-h-[135px]` standard, `min-h-[110px]` compact) without enlarging any cards.
- **Horizontal Pairing in Card Center**: Positioned the 1:1 square icon container directly to the left of the item initials in a balanced, centered horizontal cluster (`[ 1:1 Icon ] [ Initials ]`).
- **Visual Consistency in Order Summary**: Also applied the 1:1 icon directly to the left of the item initials in the Order Summary list on the right column.

### 2. Category Vector Drawings (Generic Drawings for Each Category)
- Crafted custom, clean vector SVG line drawings for every cafe category:
  - **Breakfast / Egg**: Sunny-side-up egg with yolk and bread.
  - **Lunch / Sandwich / Wrap**: Layered artisan sub/sandwich with fresh lettuce, cheese, and tomato lines.
  - **Toast / Bread**: Sliced toasted artisan bread with melting golden butter.
  - **MFY (Made For You)**: Chef skillet/pan with hot sizzle/steam waves.
  - **Mini Hot / Hot Dog**: Savory sausage with mustard drizzle.
  - **SSG Rolls**: Flaky golden pastry roll with scoring marks.
  - **Pies / Tarts**: Aussie meat pie with fluted crust and steam vents.
  - **Drinks / Coffee**: Takeaway cafe cup with fresh aroma steam and saucer.
  - **Sweets / Bakery**: Decorated cupcake/muffin with cherry on top.
  - **Default**: Cloche dining plate with fork and knife linework.

### 3. Image URL & File Upload Support
- **Custom Image Support**: `CardItem` and `OrderItemLine` now accept an optional `imageUrl?: string`.
- **Card Edit Modal**:
  - Image URL input field for pasting direct web images (`https://...`).
  - Native file upload button (`<input type="file" accept="image/*">`) with instant FileReader conversion to data URL.
  - 1:1 square thumbnail preview in the edit form.
  - "Revert to Category Drawing" button to easily clear custom images and restore the default category drawing.
  - Live card preview updating in real-time as an image URL or file is selected.
