// Automatically import all webp files in src/assets/menuitems
const globImages = import.meta.glob('../assets/menuitems/*.webp', { eager: true, import: 'default' });

// Create a lookup map keyed by simplified filename (lowercased without extension)
const imageLookup = {};
for (const [path, url] of Object.entries(globImages)) {
  const filename = path.split('/').pop().replace(/\.webp$/i, '').trim();
  imageLookup[filename] = url;
  imageLookup[filename.toLowerCase()] = url;
}

// Precise manual mapping connecting every FULL_MENU dish name to its specific file
const DISH_PHOTO_MAP = {
  // Salads & Proteins
  'healthy greens': imageLookup['Salads - Healthy greens'],
  'black channa and grilled chicken': imageLookup['Salads - Black chenna with grilled chicken'],
  'supplement: chilli garlic prawn skewer': imageLookup['Sharing Prawn Tempura 65 style'],

  // Egg Station
  'scrambled eggs': imageLookup['Eggstation - Scrambled egg'],
  'classic benedict': imageLookup['Eggstation - Classic Benedict'],

  // Friestation
  'peri peri fries (reg/large)': imageLookup['Fries - Perry perry'],
  'cheesy fries': imageLookup['Fries - cheesy'],
  'potato wedges': imageLookup['Friestation Potato wedges'],
  'loaded nachos — spicy baked beans': imageLookup['Friestation Loaded Nachos'],
  'loaded nachos — seasoned chilli chicken mince': imageLookup['Friestation Loaded Nachos'],

  // Between The Breads
  'the over load burger': imageLookup['Between the breads Overloaded burger'],
  'veg burger': imageLookup['Between the breads Veg burger'],
  'club ny': imageLookup['Breads - club ny'],
  'duo of chicken sliders': imageLookup['Breads - Duo of chicken sliders'],
  'duo of saucy paneer slider': imageLookup['Breads - Duo of chicken sliders'],
  'cajun paneer wraps': imageLookup['Cajun Paneer wraps'],
  'peri peri chicken wraps': imageLookup['Cajun Paneer wraps'],
  'crispy chicken burger': imageLookup['Between the breads Overloaded burger'],

  // Local Meets Global
  'thai green curry rice bowl — chicken': imageLookup['Local Meets Global - Thai Green Chicken curry bowl'],
  'thai green curry rice bowl — veg': imageLookup['Local Meets Global - Thai Green Chicken curry bowl'],
  'thai green curry rice bowl — prawns': imageLookup['Local Meets Global - Thai Green Chicken curry bowl'],
  'pepper corn chicken rice bowl': imageLookup['Peppercorn chicken rice bowl'],
  'signature thoothukudi parotta & pepper chicken': imageLookup['Local Meets Global - Tuticorin signature Paratha plater'],

  // Pastas & Works
  'spicy arabiatta': imageLookup['Pasta Penne Arabiata'],
  'chicken bolognaise': imageLookup['Pasta - Penne bolognaise'],
  'creamy chicken': imageLookup['Pasta Creamy chicken'],
  'two cheese sauce': imageLookup['Pasta Creamy chicken'],
  'mushroom and cheese sauce': imageLookup['Pasta Creamy chicken'],
  'the pink sauce': imageLookup['Pasta Penne Arabiata'],

  // Sharing Plates
  'chili paneer skewers': imageLookup['Sharing plates - Chilly panneer '],
  'mac cubes': imageLookup['Sharing Mac Cubes veg'],
  'texan chilli bbq wings': imageLookup['Sharing Texan chilly BBQ wings'],
  'gochujang chicken skewers': imageLookup['Sharing Gochujung chicken skewers'],
  'roast spiced chicken': imageLookup['Sharing - Roast spiced chicken'],
  'crispy tender chicken': imageLookup['Sharing Tender crispy chicken'] || imageLookup['Sharing Plates - crispy tender chicken'],
  'chicken platter': imageLookup['Sharing Chicken Plater'] || imageLookup['Sharing Plates - chicken plater'],
  'greek lamb keftedes': imageLookup['Sharing Greek lamb keftedes'],

  // From Fresh Catch
  'fish n chips': imageLookup['Sharing Fish and Chips'],
  'squid fritters': imageLookup['Sharing Squid Fritters'],
  'prawn tempura 65 style': imageLookup['Sharing Prawn Tempura 65 style'],
  'seafood basket': imageLookup['Sharing seafood basket'] || imageLookup['Sharing - Seafood Plater'],

  // Pizzas
  'margarita': imageLookup['Pizza - Margarita'],
  'veggie blast': imageLookup['Pizza Veggie blast'],
  'shrimpizza': imageLookup['Pizza Shripmzza'],

  // House Brew
  'solo': imageLookup['House brews - solo'] || imageLookup['coffee - solo'],
  'doppio': imageLookup['coffee - dopio'],
  'cappuccino': imageLookup['Coffee - capuchino'] || imageLookup['Coffee - Capuchino1'],
  'americano': imageLookup['House brews Americano'],
  'hot chocolate': imageLookup['Coffee - Hot chocolate'],
  'affogato': imageLookup['House brews Affogato'],

  // Cloud Coffees & Matcha
  'matcha — strawberry': imageLookup['Matcha - Strawberry matcha'],
  'matcha — cloud tender coconut': imageLookup['Mocktail Tender coconut'],

  // Coffee Packed Frappes
  'hazelnut cafe frappe': imageLookup['Frappe - Hazzlenut'],
  'tiramisu mocha frappe': imageLookup['Frappes Tiramisu frappe'],
  'iced spanish latte': imageLookup['Frappes - Spanish Latte'],
  'blue spanish latte': imageLookup['Frappes Blue spanish latte'],

  // Signature Shaken Sips
  'ferrero rocher milk shake': imageLookup['Mikshake - Ferrero Rocher milkshake'],
  'strawberry creamy shake': imageLookup['Milkshakes - Strawberry creamy'],

  // Mocktails
  'mango spiced mocktail': imageLookup['Moctail Mango spice'],
  'watermelon mocktail': imageLookup['Moctail Water melon'],
  'tender coconut cooler': imageLookup['Mocktail Tender coconut'],
};

/**
 * Returns the exact dish photo for a menu item name, or undefined if no exact photo.
 */
export function getMenuPhoto(itemName) {
  if (!itemName) return null;
  const key = itemName.toLowerCase().trim();
  return DISH_PHOTO_MAP[key] || null;
}

/**
 * Curated list of high-impact real dish images for marquee / highlights
 */
export const HIGHLIGHT_IMAGES = [
  imageLookup['Between the breads Overloaded burger'],
  imageLookup['Pizza Veggie blast'],
  imageLookup['Friestation Potato wedges'],
  imageLookup['House brews Affogato'],
  imageLookup['Sharing Chicken Plater'] || imageLookup['Sharing Plates - chicken plater'],
  imageLookup['Frappes Blue spanish latte'],
  imageLookup['Sharing Fish and Chips'],
  imageLookup['Local Meets Global - Tuticorin signature Paratha plater'],
  imageLookup['Sharing Prawn Tempura 65 style'],
  imageLookup['Cajun Paneer wraps'],
  imageLookup['Salads - Healthy greens'],
  imageLookup['Mikshake - Ferrero Rocher milkshake'],
  imageLookup['Pasta Penne Arabiata'],
  imageLookup['Friestation Loaded Nachos'],
  imageLookup['Moctail Mango spice'],
].filter(Boolean);

export default DISH_PHOTO_MAP;
