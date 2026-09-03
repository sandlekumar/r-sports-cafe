import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

// Asset imports
import burgerImg from '../assets/signature_burger.png';
import pizzaImg from '../assets/signature_pizza.png';
import coffeeImg from '../assets/signature_coffee.png';
import juiceImg from '../assets/signature_juice.png';
import chickenImg from '../assets/menu_chicken.png';
import fishImg from '../assets/menu_fish.png';
import latteImg from '../assets/menu_latte.png';
import shrimpImg from '../assets/menu_shrimp.png';
import teaImg from '../assets/menu_tea.png';

// Video loops
import coffeeVideo from '../assets/hero-video-opt.mp4';
import pizzaVideo from '../assets/turf.mp4';
import burgerVideo from '../assets/hero-video-opt.mp4';
import drinkVideo from '../assets/turf.mp4';

// ─── Menu Categories ────────────────────────────────────────────────────────
const MENU_CATEGORIES = [
  { id: 'all', label: 'All Collection', icon: '✨' },
  { id: 'beverages', label: 'Specialty Beverages', icon: '☕' },
  { id: 'pizzas', label: 'Woodfired Pizzas', icon: '🍕' },
  { id: 'burgers', label: 'Gourmet Burgers', icon: '🍔' },
  { id: 'mains', label: 'Royal Mains & Biryani', icon: '🍛' },
  { id: 'bowls', label: 'Energy Bowls', icon: '🥗' },
  { id: 'desserts', label: 'Artisanal Desserts', icon: '🍰' },
];

// ─── Motion Loops Showcase Brief Data ──────────────────────────────────────
const MOTION_LOOPS = [
  {
    id: 'loop-coffee',
    name: 'Signature Davara Filter Coffee',
    category: 'Beverage Motion',
    hero: '3/4 top-down angle, brass davara-tumbler on dark wood',
    motionBeat: 'Subtle steam curl drifting right catching 45° warm rim-light',
    loopMethod: 'Steam isolated on alpha layer, 3-sec seamless density crossfade',
    video: coffeeVideo,
    image: coffeeImg,
    fps: '24-30 fps',
    aspect: '1080 × 1080',
    accent: '#D4AF37',
  },
  {
    id: 'loop-pizza',
    name: 'Napoli Truffle Sourdough Pizza',
    category: 'Loaded Motion',
    hero: 'Woodfired sourdough crust, fresh burrata & truffle shavings',
    motionBeat: 'Ultra slow cheese-pull & glossy extra virgin olive oil drizzle',
    loopMethod: 'Glaze-drip loop back-blended to key composition frame',
    video: pizzaVideo,
    image: pizzaImg,
    fps: '24 fps',
    aspect: '1080 × 1080',
    accent: '#EC4899',
  },
  {
    id: 'loop-burger',
    name: 'The Royal Wagyu Smash',
    category: 'Gourmet Motion',
    hero: 'Double wagyu patties, melted aged cheddar on brioche',
    motionBeat: 'Micro-sizzle steam & glossy juice light-catch',
    loopMethod: 'Controlled camera lock with seamless flame-light shimmer',
    video: burgerVideo,
    image: burgerImg,
    fps: '30 fps',
    aspect: '1080 × 1080',
    accent: '#C8956C',
  },
  {
    id: 'loop-elixir',
    name: 'Wild Berry Mint Elixir',
    category: 'Cold Motion',
    hero: 'Highball crystal glass, wild berries & edible flowers',
    motionBeat: 'Condensation bead drift & subtle rose water drop ripple',
    loopMethod: 'Ripple dissipation matched to initial surface stillness',
    video: drinkVideo,
    image: juiceImg,
    fps: '30 fps',
    aspect: '1080 × 1080',
    accent: '#B07D9E',
  },
];

// ─── Full Menu Items Dataset ────────────────────────────────────────────────
const FULL_MENU = [
  {
    id: 'm1',
    category: 'burgers',
    name: 'The Royal Wagyu Smash',
    tagline: 'Chef\'s Masterpiece Smash Burger',
    desc: 'Double-smashed premium wagyu beef patties, aged white cheddar, slow-caramelized onion jam, truffle aioli on toasted artisanal brioche.',
    price: '₹349',
    isVeg: false,
    isChefSpecial: true,
    isTrending: true,
    calories: '680 kcal',
    prepTime: '12-15 mins',
    pairing: 'Pairs best with Cold Brew or IPA',
    image: burgerImg,
    video: burgerVideo,
    accent: '#C8956C',
    ingredients: ['Wagyu Beef', 'Aged Cheddar', 'Truffle Aioli', 'Caramelized Onion', 'Brioche'],
  },
  {
    id: 'm2',
    category: 'pizzas',
    name: 'Napoli Truffle Sourdough',
    tagline: '72-Hour Fermented Woodfired Crust',
    desc: 'San Marzano plum tomatoes, fresh imported burrata, wild forest mushrooms, black truffle shavings, finished with cold-pressed olive oil.',
    price: '₹449',
    isVeg: true,
    isChefSpecial: true,
    isTrending: true,
    calories: '720 kcal',
    prepTime: '15-18 mins',
    pairing: 'Pairs best with Sparkling Rose or Iced Peach Tea',
    image: pizzaImg,
    video: pizzaVideo,
    accent: '#D4A574',
    ingredients: ['Sourdough', 'Burrata', 'Black Truffle', 'San Marzano Tomatoes', 'Basil'],
  },
  {
    id: 'm3',
    category: 'beverages',
    name: 'Davara Specialty Filter Coffee',
    tagline: 'Traditional South Indian Velvet Roast',
    desc: 'Hand-picked Chikmagalur Arabica & Robusta beans, brewed in brass filter, aerated with foamed whole milk in classic brass Davara.',
    price: '₹149',
    isVeg: true,
    isChefSpecial: true,
    isTrending: true,
    calories: '110 kcal',
    prepTime: '5-7 mins',
    pairing: 'Pairs best with Banana Jaggery Loaf',
    image: coffeeImg,
    video: coffeeVideo,
    accent: '#D4AF37',
    ingredients: ['Chikmagalur Beans', 'Jaggery/Sugar', 'Whole Milk', 'Chicory 15%'],
  },
  {
    id: 'm4',
    category: 'beverages',
    name: 'Wild Berry Mint Elixir',
    tagline: 'Cold-Pressed Antioxidant Elixir',
    desc: 'Cold-pressed wild raspberries, pomegranate, crushed fresh spearmint, subtle organic rose water, served over clear sphere ice.',
    price: '₹199',
    isVeg: true,
    isChefSpecial: false,
    isTrending: true,
    calories: '90 kcal',
    prepTime: '5 mins',
    pairing: 'Pairs best with Avocado Tartine',
    image: juiceImg,
    video: drinkVideo,
    accent: '#B07D9E',
    ingredients: ['Wild Raspberry', 'Pomegranate', 'Spearmint', 'Rose Water', 'Clear Ice'],
  },
  {
    id: 'm5',
    category: 'mains',
    name: 'Velvet Royal Mutton Biryani',
    tagline: 'Slow Dum-Cooked Nizam Recipe',
    desc: 'Tender tenderloin mutton marinated in green cardamom, saffron, curd & herbs, layered with long-grain Basmati rice, dum-cooked in clay pot.',
    price: '₹489',
    isVeg: false,
    isChefSpecial: true,
    isTrending: true,
    calories: '850 kcal',
    prepTime: '20 mins',
    pairing: 'Served with Mirchi ka Salan & Burani Raita',
    image: chickenImg,
    accent: '#E65100',
    ingredients: ['Prime Mutton', 'Kashmiri Saffron', 'Aged Basmati', 'Green Cardamom', 'Desi Ghee'],
  },
  {
    id: 'm6',
    category: 'beverages',
    name: 'Spanish Cortado Velvet',
    tagline: 'Double Shot Espresso & Textured Milk',
    desc: 'Equal parts single-origin espresso and silky steamed milk served in cut glass. Rich notes of roasted hazelnut & dark cocoa.',
    price: '₹229',
    isVeg: true,
    isChefSpecial: false,
    isTrending: false,
    calories: '85 kcal',
    prepTime: '5 mins',
    pairing: 'Pairs with Butter Croissant',
    image: latteImg,
    accent: '#8D6E63',
    ingredients: ['Espresso Double Shot', 'Textured Whole Milk'],
  },
  {
    id: 'm7',
    category: 'mains',
    name: 'Tandoori Smoked Tiger Prawns',
    tagline: 'Charcoal-Grilled Coastal Spices',
    desc: 'Jumbo ocean tiger prawns marinated in yellow chili, mustard oil, lemon juice & crushed carom seeds, seared over bhabha charcoal.',
    price: '₹529',
    isVeg: false,
    isChefSpecial: true,
    isTrending: false,
    calories: '420 kcal',
    prepTime: '15 mins',
    pairing: 'Pairs with Mint Coriander Chutney',
    image: shrimpImg,
    accent: '#FF7043',
    ingredients: ['Tiger Prawns', 'Carom Seeds', 'Mustard Oil', 'Yellow Chili', 'Lemon'],
  },
  {
    id: 'm8',
    category: 'mains',
    name: 'Pan-Seared Sea Bass',
    tagline: 'Crispy Skin with Lemon Butter Glaze',
    desc: 'Fresh wild sea bass fillet seared in noisette butter, garlic thyme reduction, served over roasted saffron baby potatoes & asparagus.',
    price: '₹569',
    isVeg: false,
    isChefSpecial: false,
    isTrending: false,
    calories: '490 kcal',
    prepTime: '18 mins',
    pairing: 'Pairs with Sparkling Citrus Tonic',
    image: fishImg,
    accent: '#26A69A',
    ingredients: ['Sea Bass', 'Noisette Butter', 'Thyme', 'Asparagus', 'Baby Potatoes'],
  },
  {
    id: 'm9',
    category: 'bowls',
    name: 'Matchday Champion Bowl',
    tagline: 'High Protein Athlete Recovery Bowl',
    desc: 'Grilled herb chicken breast, tri-color quinoa, charred sweet corn, avocado slices, roasted chickpeas, tahini lime drizzle.',
    price: '₹379',
    isVeg: false,
    isChefSpecial: false,
    isTrending: false,
    calories: '540 kcal',
    prepTime: '12 mins',
    pairing: 'Pairs with Fresh Coconut Water',
    image: chickenImg,
    accent: '#66BB6A',
    ingredients: ['Herb Chicken', 'Quinoa', 'Avocado', 'Chickpeas', 'Tahini Lime'],
  },
  {
    id: 'm10',
    category: 'beverages',
    name: 'Artisanal Himalayan Green Tea',
    tagline: 'Single Estate Whole Leaf Steep',
    desc: 'Whole leaf green tea hand-picked from Kangra valley estates, infused with lemongrass & dried marigold petals.',
    price: '₹169',
    isVeg: true,
    isChefSpecial: false,
    isTrending: false,
    calories: '5 kcal',
    prepTime: '4 mins',
    pairing: 'Pairs with Almond Biscotti',
    image: teaImg,
    accent: '#9CCC65',
    ingredients: ['Whole Green Tea Leaves', 'Lemongrass', 'Marigold Petals'],
  },
];

// ─── Main Menu Page ───────────────────────────────────────────────────────────
export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState('all'); // 'all', 'veg', 'nonveg', 'special'
  const [activeModalItem, setActiveModalItem] = useState(null);
  const [mutedStates, setMutedStates] = useState({
    'loop-coffee': true,
    'loop-pizza': true,
    'loop-burger': true,
    'loop-elixir': true,
  });

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleMute = (id) => {
    setMutedStates((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filtered dishes calculation
  const filteredDishes = FULL_MENU.filter((item) => {
    // Category match
    const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
    // Search query match
    const matchSearch =
      searchQuery.trim() === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ingredients.some((i) => i.toLowerCase().includes(searchQuery.toLowerCase()));

    // Dietary match
    let matchDiet = true;
    if (dietaryFilter === 'veg') matchDiet = item.isVeg === true;
    if (dietaryFilter === 'nonveg') matchDiet = item.isVeg === false;
    if (dietaryFilter === 'special') matchDiet = item.isChefSpecial === true;

    return matchCategory && matchSearch && matchDiet;
  });

  return (
    <div className="min-h-screen bg-sandalBg text-darkText font-sans antialiased selection:bg-[#B58A55] selection:text-white">
      <SEO
        title="Cafe Menu in Thoothukudi | R Sports & Cafe"
        description="Explore food, coffee, refreshing drinks, pizzas and desserts at R Sports & Cafe in Thoothukudi."
        canonical="/menu"
      />
      
      {/* ─── Hero Banner Section ─────────────────────────────────────────── */}
      <section className="relative pt-28 pb-16 md:pt-32 md:pb-24 px-6 lg:px-16 border-b border-borderGlass overflow-hidden bg-cream">
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#B58A55]/10 border border-[#B58A55]/30 text-[#B58A55] text-[10px] font-bold tracking-[0.2em] uppercase mb-6">
            <span>✨</span> ARTISANAL GOURMET SELECTION
          </div>

          <h1 className="font-sans font-bold text-[clamp(36px,7vw,76px)] uppercase leading-[0.95] tracking-tight mb-6 text-darkText">
            Culinary Mastery <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B58A55] to-[#8C6239]">
              In Every Detail.
            </span>
          </h1>

          <p className="font-inter text-[15px] md:text-[18px] text-darkText/70 max-w-2xl mx-auto leading-[1.8] mb-10">
            From 72-hour fermented woodfired pizzas to authentic Davara filter coffee and slow-dum biryanis. Explore our complete food & beverage collection.
          </p>

          {/* External Menu Link */}
          <div className="mt-8 flex justify-center">
            <a 
              href="http://localhost:3001/r-sports-cafe" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-2 px-10 py-4 rounded-full font-sans font-semibold text-[13px] uppercase tracking-[0.2em] transition-all duration-300"
              style={{
                background: '#1B1B1B',
                color: '#FFF8E7',
                boxShadow: '0 8px 32px rgba(0,0,0,0.15), 0 0 0 1px rgba(181,138,85,0.3)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#B58A55';
                e.currentTarget.style.color = '#FFF';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(181,138,85,0.3), 0 0 0 1px rgba(181,138,85,0.6)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#1B1B1B';
                e.currentTarget.style.color = '#FFF8E7';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.15), 0 0 0 1px rgba(181,138,85,0.3)';
              }}
            >
              Explore Full Menu →
            </a>
          </div>
        </div>
      </section>

      {/* ─── Footer ────────────────────────────────────────────────────── */}
      <footer className="border-t border-borderGlass py-12 px-6 lg:px-16 text-center text-darkText/50 font-inter text-[12px] bg-sandalBg">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2026 R Sports & Cafe. Gourmet Dining & Sports Club Experience.</p>
          <div className="flex items-center gap-6 font-bold uppercase tracking-[0.12em] text-[11px] text-darkText/70">
            <Link to="/" className="hover:text-[#B58A55] transition-colors">Home</Link>
            <Link to="/turf" className="hover:text-[#B58A55] transition-colors">Turf</Link>
            <Link to="/booking" className="hover:text-[#B58A55] transition-colors">Reserve Table</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
