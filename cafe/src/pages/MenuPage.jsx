import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

// Asset imports
import burgerImg from '../assets/signature_burger.webp';
import pizzaImg from '../assets/signature_pizza.webp';
import coffeeImg from '../assets/signature_coffee.webp';
import juiceImg from '../assets/signature_juice.webp';
import chickenImg from '../assets/menu_chicken.webp';
import fishImg from '../assets/menu_fish.webp';
import latteImg from '../assets/menu_latte.webp';
import shrimpImg from '../assets/menu_shrimp.webp';
import teaImg from '../assets/menu_tea.webp';

// ─── Menu Categories ────────────────────────────────────────────────────────
const MENU_CATEGORIES = [
  { id: 'salads', label: 'Salads & Proteins' },
  { id: 'eggs', label: 'Egg Station' },
  { id: 'fries', label: 'Friestation' },
  { id: 'breads', label: 'Between The Breads' },
  { id: 'global', label: 'Local Meets Global' },
  { id: 'pastas', label: 'Pastas & Works' },
  { id: 'sharing', label: 'Sharing Plates' },
  { id: 'catch', label: 'From Fresh Catch' },
  { id: 'pizzas', label: 'Pizzas' },
  { id: 'housebrew', label: 'House Brew' },
  { id: 'cloudcoffee', label: 'Cloud Coffees & Matcha' },
  { id: 'frappes', label: 'Coffee Packed Frappes' },
  { id: 'shakes', label: 'Signature Shaken Sips' },
  { id: 'mocktails', label: 'Mocktails' },
];

const FULL_MENU = {
  salads: [
    { name: 'Healthy Greens', price: 200, veg: true, desc: 'All veggies — lettuce, carrots, cherry tomatoes, wild cucumbers, peppers and watermelon with spicy mango dressing.' },
    { name: 'Supplement: Grilled Chicken Supremes', price: 100, veg: false },
    { name: 'Supplement: Grilled Marinated Paneer', price: 110, veg: true },
    { name: 'Supplement: Chilli Garlic Prawn Skewer', price: 150, veg: false },
    { name: 'Supplement: Smashed Avocado (Seasonal)', price: 120, veg: true },
    { name: 'Black Channa and Grilled Chicken', price: 390, veg: false, desc: 'Layers of mushy treated black channa, boiled channa with a grilled chicken supreme, lettuce and cherry tomatoes.' },
  ],
  eggs: [
    { name: 'Scrambled Eggs', price: 210, veg: true, desc: 'Three eggs with butter, cream and white pepper powder softly scrambled, served on toasted bread.' },
    { name: 'Railway Station Omelette with Butter Toast', price: 220, veg: true, desc: 'Done on a flat top with onions, tomatoes, chillies and masala powders, buttered grilled milk bread and ketchup.' },
    { name: 'Ask For Omelette — Cheese and Onion', price: 200, veg: true },
    { name: 'Ask For Omelette — Mushroom and Peppers', price: 220, veg: true },
    { name: 'Ask For Omelette — Spanish Flat', price: 235, veg: true },
    { name: 'Sakshuka', price: 280, veg: true, desc: 'Lebanese style spicy tomato sauce with egg baked on top — feta and basil.' },
    { name: 'Classic Benedict', price: 280, veg: true, desc: 'Poached eggs doused with buttery hollandaise served on top of bread.' },
  ],
  fries: [
    { name: 'Classic Salted Fries (Reg/Large)', price: '120 / 180', veg: true, desc: 'With sea salt and garlic powder.' },
    { name: 'Peri Peri Fries (Reg/Large)', price: '125 / 190', veg: true, desc: 'Dusted with South African peri peri dust.' },
    { name: 'Cheesy Fries', price: 220, veg: true, desc: 'Just simple fries loaded with cheese.' },
    { name: 'Commando Fries — Spicy Baked Beans', price: 230, veg: true, desc: 'Fully loaded fries with cheese sauce, chipotle, jalapeños and tomato salsa.' },
    { name: 'Commando Fries — Seasoned Chilli Chicken Mince', price: 250, veg: false },
    { name: 'Potato Wedges', price: 210, veg: true, desc: 'Served fried or with peri peri.' },
    { name: 'Loaded Nachos — Spicy Baked Beans', price: 230, veg: true, desc: 'Fully loaded nachos with cheese sauce, chipotle, jalapeños and tomato salsa.' },
    { name: 'Loaded Nachos — Seasoned Chilli Chicken Mince', price: 250, veg: false },
  ],
  breads: [
    { name: 'The Simple Veg White', price: 220, veg: true, desc: 'Thinly sliced cucumber, tomatoes with a layer of cheddar, salt and pepper in white sandwich bread. (Ask for grilled)' },
    { name: 'Duo of Saucy Paneer Slider', price: 265, veg: true, desc: 'Grilled paneer patties between slider buns with chipotle and tomato sauce.' },
    { name: 'Classic Chicken N Cheese', price: 250, veg: false, desc: 'Slow cooked hand-pulled chicken with lettuce, tomatoes, dijon mustard and mayonnaise, cheese and pickles. (Ask for grilled)' },
    { name: 'Club NY', price: 270, veg: false, desc: 'Classic layered club sandwich with veggies, fried egg, chicken and cheese.' },
    { name: 'Cajun Paneer Wraps', price: 245, veg: true, desc: 'Cajun grilled paneer tossed with peppers, onions, garlic and cheese — wrapped.' },
    { name: 'Peri Peri Chicken Wraps', price: 340, veg: false, desc: 'Seasoned chicken tossed in bold peri-peri flavours, wrapped with crisp veggies and cheese.' },
    { name: 'Paneer Quesadilla', price: 340, veg: true, desc: 'Mexican cheese and paneer loaded tortillas grilled, served with Mexican chilli salsa.' },
    { name: 'Chicken Quesadilla', price: 395, veg: false, desc: 'Chicken fajita mix stuffed tortillas with cheese, grilled.' },
    { name: 'Duo of Chicken Sliders', price: 290, veg: false, desc: 'Minced chicken mini burgers with pickle, cheese and salsa.' },
    { name: 'The Over Load Burger', price: 350, veg: false, desc: 'A heavy chicken burger, 2 layers of chicken, cheese, fried egg and veggies.' },
    { name: 'Crispy Chicken Burger', price: 325, veg: false, desc: 'Buttermilk soaked chicken strips crispy fried, stacked with cheese, mayonnaise and veggies.' },
    { name: 'Veg Burger', price: 300, veg: true, desc: 'A golden-fried, spiced mixed-vegetable and potato patty with lettuce, tomato and tomato sauce.' },
  ],
  global: [
    { name: 'Thai Green Curry Rice Bowl — Veg', price: 400, veg: true, desc: 'Fresh seasonal vegetables in an authentic Thai green curry, over fragrant steamed rice.' },
    { name: 'Thai Green Curry Rice Bowl — Chicken', price: 450, veg: false, desc: 'Tender chicken in a creamy coconut Thai green curry, over fragrant steamed rice.' },
    { name: 'Thai Green Curry Rice Bowl — Prawns', price: 480, veg: false, desc: 'Fresh prawns in a creamy coconut Thai green curry. Choose basmati or sticky rice.' },
    { name: 'Pepper Corn Chicken Rice Bowl', price: 450, veg: false, desc: 'Fragrant steamed basmati rice topped with signature pepper chicken and sautéed vegetables.' },
    { name: 'Signature Thoothukudi Parotta & Pepper Chicken', price: 400, veg: false, desc: 'Flaky Thoothukudi coin parottas with signature pepper chicken — a local classic, elevated. Ask for fried/thawed (vatta).' },
  ],
  pastas: [
    { name: 'Spicy Arabiatta', price: 340, veg: true, desc: 'Bold, spicy tomato sauce with garlic and herbs, served with garlic bread.' },
    { name: 'Two Cheese Sauce', price: 370, veg: true, desc: 'Rich, creamy blend of two cheeses, served with garlic bread.' },
    { name: 'Mushroom and Cheese Sauce', price: 385, veg: true, desc: 'Sautéed mushrooms in a creamy cheese sauce, served with garlic bread.' },
    { name: 'The Pink Sauce', price: 390, veg: true, desc: 'A luscious blend of tomato and cream, served with garlic bread.' },
    { name: 'Chicken Bolognaise', price: 400, veg: false, desc: 'Rich tomato sauce with savoury minced chicken, herbs and spices, served with garlic bread.' },
    { name: 'Creamy Chicken', price: 400, veg: false, desc: 'Tender chicken in a smooth, creamy herb sauce, served with garlic bread.' },
  ],
  sharing: [
    { name: 'Chili Paneer Skewers', price: 300, veg: true, desc: 'Paprika marinated skewers with peppers and onions, side salad.' },
    { name: 'Mac Cubes', price: 310, veg: true, desc: 'Three cheesy macaroni cubes, crumb fried, over pomodoro sauce.' },
    { name: 'Texan Chilli BBQ Wings', price: 395, veg: false, desc: 'Floured chicken wings tossed in Texan BBQ and chilli sauce.' },
    { name: 'Gochujang Chicken Skewers', price: 370, veg: false, desc: 'Korean style tightly packed chicken skewers, chilli marinade, grilled.' },
    { name: 'Roast Spiced Chicken', price: 475, veg: false, desc: 'Leg quarters of spiced roasted chicken on creamy pea risotto.' },
    { name: 'Crispy Tender Chicken', price: 370, veg: false, desc: 'Served with peri peri dust and chipotle sauce.' },
    { name: "Chicken Platter", price: 495, veg: false, desc: "Combination of chef's choice of chicken dishes for two to share." },
    { name: 'American Corn Cheese Balls', price: 250, veg: true, desc: 'A classic cheese ball with jalapeños and chopped olives.' },
    { name: 'Greek Lamb Keftedes', price: 450, veg: false, desc: 'Lamb mince poached and crumb fried, soft inside.' },
  ],
  catch: [
    { name: 'Fish N Chips', price: 375, veg: false, desc: 'Mini fish fingers with chilli fries, peri peri dusted, served with tartare sauce.' },
    { name: 'Squid Fritters', price: 450, veg: false, desc: 'Marinated squid roundels, seasoned flour, crispy fried, peri peri dusted.' },
    { name: 'Prawn Tempura 65 Style', price: 480, veg: false, desc: 'Crispy prawn tempura, bold south Indian 65-style seasoning, fresh salad.' },
    { name: 'Seafood Basket', price: 590, veg: false, desc: "Fresh catch of the day with calamari and bay prawns, served with salad." },
  ],
  pizzas: [
    { name: 'Margarita', price: 355, veg: true, desc: 'Simple pomodoro sauce, cheese, fresh basil.' },
    { name: 'Veggie Blast', price: 375, veg: true, desc: 'Grilled veggies with olives and jalapeños.' },
    { name: 'Mushroom and Corn', price: 375, veg: true, desc: 'Sautéed wild mushrooms, corn kernels, pickle and chillies. Red or white sauce.' },
    { name: 'Classic Pepperoni Supreme', price: 410, veg: false, desc: 'Hand-stretched crust, premium pepperoni, mozzarella, Italian tomato sauce.' },
    { name: 'Spicy Peri Peri Chicken', price: 395, veg: false, desc: 'Grilled spiced peri peri chicken, peppers and green chillies.' },
    { name: 'Shrimpizza', price: 420, veg: false, desc: 'Grilled mustard marinated prawns with vegetables, peri peri kick, melted cheese.' },
    { name: 'Meat Feast', price: 435, veg: false, desc: 'Grilled chicken, chicken bolognaise and grilled chicken sausages with peppers.' },
  ],
  housebrew: [
    { name: 'Solo', price: 165, veg: true, desc: 'A single shot of espresso.' },
    { name: 'Doppio', price: 185, veg: true, desc: 'Double shot espresso for a deeper, stronger kick.' },
    { name: 'Latte', price: 225, veg: true, desc: 'A smooth espresso, made creamy with milk.' },
    { name: 'Cappuccino', price: 225, veg: true, desc: 'Bold espresso topped with airy foam.' },
    { name: 'Flat White', price: 255, veg: true, desc: 'Strong like filter coffee but smooth and silky.' },
    { name: 'Caramel Macchiato', price: 255, veg: true, desc: 'Swirl of espresso, milk and buttery caramel.' },
    { name: 'Americano', price: 235, veg: true, desc: 'Bold espresso softened with water, balanced and full-bodied.' },
    { name: 'Mocha', price: 255, veg: true, desc: 'Rich chocolate and bold coffee. Served hot or cold.' },
    { name: 'White Mocha', price: 255, veg: true, desc: 'Rich white chocolate and bold coffee. Served hot or cold.' },
    { name: 'Hot Chocolate', price: 225, veg: true, desc: 'A rich, velvety cocoa drink.' },
    { name: 'Affogato', price: 235, veg: true, desc: 'A scoop of ice cream topped with a shot of hot espresso.' },
  ],
  cloudcoffee: [
    { name: 'Red Velvety', price: 290, veg: true, desc: 'Smooth coffee, red velvet sweetness and velvety cloud foam.' },
    { name: 'Thoothukudi Macron', price: 310, veg: true, desc: 'Indulgent coffee inspired by macarons, topped with a velvety cloud.' },
    { name: 'Matcha — Cloud Tender Coconut', price: 300, veg: true, desc: 'Earthy matcha with tender coconut, soft creamy cloud.' },
    { name: 'Matcha — Strawberry', price: 300, veg: true, desc: 'Vibrant matcha layered with strawberry and a creamy finish.' },
    { name: 'Matcha — Classic', price: 280, veg: true, desc: 'Smooth, earthy matcha, naturally mellow, creamy finish.' },
  ],
  frappes: [
    { name: 'Hazelnut Cafe Frappe', price: 270, veg: true },
    { name: 'Javachip Coffee Frappe', price: 270, veg: true, desc: 'Rich coffee with chocolate chips.' },
    { name: 'Tiramisu Mocha Frappe', price: 300, veg: true, desc: 'Espresso, chocolate and cocoa, dessert-style frappe.' },
    { name: 'Salted Caramel Frappe', price: 280, veg: true },
    { name: 'Iced Spanish Latte', price: 275, veg: true },
    { name: 'Sun Kissed Coconut Frappe', price: 330, veg: true },
    { name: 'Dubai Chocolate Pistachio Frappe', price: 325, veg: true },
    { name: 'Lava Chocolate Mocha', price: 325, veg: true },
    { name: 'Iced Shaken White Mocha', price: 300, veg: true },
    { name: 'Blue Spanish Latte', price: 280, veg: true, desc: 'Vibrant blue twist on a classic Spanish latte.' },
    { name: 'Classic Cold Coffee Expresso', price: 265, veg: true },
  ],
  shakes: [
    { name: 'Ferrero Rocher Milk Shake', price: 290, veg: true, desc: 'Vanilla bean ice cream, crushed Ferrero Rocher, silky chocolate sauce.' },
    { name: 'Madagascar Vanilla Shake', price: 290, veg: true, desc: 'Premium ice cream infused with Madagascar vanilla beans.' },
    { name: 'Strawberry Creamy Shake', price: 290, veg: true },
    { name: 'Avocado Milkshake (Seasonal)', price: 370, veg: true },
    { name: 'Banana Protein Milkshake', price: 280, veg: true },
  ],
  mocktails: [
    { name: 'Mango Spiced Mocktail', price: 185, veg: true, desc: 'Mango, lemon and ginger with a subtle chilli kick.' },
    { name: 'Watermelon Mocktail', price: 185, veg: true, desc: 'Juicy watermelon, zesty lime, honey, fresh mint.' },
    { name: 'Tender Coconut Cooler', price: 190, veg: true, desc: 'Fresh tender coconut water, coconut pulp, pomegranate, cooling mint.' },
    { name: 'Passion Tea Lemonade', price: 190, veg: true, desc: 'Passion tea and lemonade with a sweet strawberry twist.' },
    { name: 'Blue Logan Mocktail', price: 190, veg: true, desc: 'Zesty citrus and vibrant blue flavours, served chilled.' },
    { name: 'Strawberry Mocktail', price: 190, veg: true, desc: 'Sweet, juicy strawberry with a citrus twist and honey.' },
  ],
};

const menuTheme = {
  pageBg: '#FDFBF6',       // warm cream, matches the PDF's content pages
  blobTan: '#EFE6D6',      // soft organic blob accent
  blobSage: '#DCE3D4',     // soft organic blob accent
  headerGreen: '#3F5A3A',  // category header color
  gold: '#B58A55',         // underline + price (already used site-wide)
  vegGreen: '#2E7D32',
  nonVegRed: '#C62828',
  textPri: '#1B1B1B',
  textSec: '#6F675E',
};

function LeafFlourish({ className }) {
  return (
    <svg viewBox="0 0 70 70" className={className} fill="none" strokeLinecap="round">
      <g stroke="#B58A55" strokeWidth="1.3">
        <path d="M5 60 Q30 40 60 10" />
        <ellipse cx="20" cy="48" rx="7" ry="3" transform="rotate(-40 20 48)" fill="#B58A55" opacity="0.3" />
        <ellipse cx="35" cy="33" rx="7" ry="3" transform="rotate(-40 35 33)" fill="#6B8E5A" opacity="0.4" />
        <ellipse cx="50" cy="18" rx="7" ry="3" transform="rotate(-40 50 18)" fill="#B58A55" opacity="0.3" />
      </g>
    </svg>
  );
}

function ImageMarquee() {
  const marqueeRef = useRef(null);
  const images = [burgerImg, pizzaImg, coffeeImg, juiceImg, chickenImg, fishImg, latteImg, shrimpImg, teaImg];

  const handleScroll = (dir) => {
    if (marqueeRef.current) {
      const scrollStep = window.innerWidth < 768 ? 220 : 340;
      marqueeRef.current.scrollBy({ left: dir * scrollStep, behavior: 'smooth' });
    }
  };

  return (
    <section
      className="relative pt-24 pb-8 md:pt-32 md:pb-12 border-b overflow-hidden z-10 group/gallery"
      style={{ borderColor: `${menuTheme.textSec}20`, background: `${menuTheme.pageBg}E6` }}
    >
      {/* ─── Animated Side Navigation Arrows ("<" and ">") ─── */}
      <button
        onClick={() => handleScroll(-1)}
        aria-label="Previous dishes in gallery"
        className="menu-gallery-nav-left absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 md:w-13 md:h-13 rounded-full flex items-center justify-center bg-white/90 hover:bg-[#3F5A3A] text-[#B58A55] hover:text-white border border-[#B58A55]/40 hover:border-[#3F5A3A] shadow-[0_8px_25px_rgba(0,0,0,0.12),0_0_15px_rgba(181,138,85,0.2)] hover:shadow-[0_10px_30px_rgba(63,90,58,0.35)] transition-all duration-300 backdrop-blur-md active:scale-95 group/arrow cursor-pointer"
      >
        <span className="sr-only">Previous Dishes</span>
        <svg
          className="w-5 h-5 md:w-6 md:h-6 transform transition-transform duration-300 group-hover/arrow:-translate-x-1"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        <span className="absolute inset-0 rounded-full border border-[#B58A55]/40 animate-ping pointer-events-none opacity-20" />
      </button>

      <button
        onClick={() => handleScroll(1)}
        aria-label="Next dishes in gallery"
        className="menu-gallery-nav-right absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 md:w-13 md:h-13 rounded-full flex items-center justify-center bg-white/90 hover:bg-[#3F5A3A] text-[#B58A55] hover:text-white border border-[#B58A55]/40 hover:border-[#3F5A3A] shadow-[0_8px_25px_rgba(0,0,0,0.12),0_0_15px_rgba(181,138,85,0.2)] hover:shadow-[0_10px_30px_rgba(63,90,58,0.35)] transition-all duration-300 backdrop-blur-md active:scale-95 group/arrow cursor-pointer"
      >
        <span className="sr-only">Next Dishes</span>
        <svg
          className="w-5 h-5 md:w-6 md:h-6 transform transition-transform duration-300 group-hover/arrow:translate-x-1"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="absolute inset-0 rounded-full border border-[#B58A55]/40 animate-ping pointer-events-none opacity-20" />
      </button>

      {/* Interactive Scrollable Food Gallery */}
      <div
        ref={marqueeRef}
        className="flex overflow-x-auto no-scrollbar scroll-smooth px-4 md:px-14"
      >
        <div className="flex gap-4 md:gap-6 min-w-max py-2">
          {[...images, ...images].map((src, i) => (
            <div
              key={`item-${i}`}
              className="w-[180px] h-[240px] md:w-[260px] md:h-[340px] flex-shrink-0 rounded-2xl overflow-hidden shadow-md group relative"
            >
              <img
                src={src}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                alt="Culinary highlight"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes float-m-left {
          0%, 100% { transform: translateY(-50%) translateX(0); }
          50% { transform: translateY(-50%) translateX(-5px); }
        }
        @keyframes float-m-right {
          0%, 100% { transform: translateY(-50%) translateX(0); }
          50% { transform: translateY(-50%) translateX(5px); }
        }
        .menu-gallery-nav-left {
          animation: float-m-left 2.6s ease-in-out infinite;
        }
        .menu-gallery-nav-right {
          animation: float-m-right 2.6s ease-in-out infinite;
        }
        .menu-gallery-nav-left:hover,
        .menu-gallery-nav-right:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}

function MenuShowcase() {
  const [active, setActive] = useState('salads');
  const navScrollRef = useRef(null);

  const getCategoryImage = (categoryId, itemName) => {
    const name = itemName.toLowerCase();
    if (name.includes('shrimp') || name.includes('prawn')) return shrimpImg;
    if (name.includes('fish') || name.includes('squid')) return fishImg;
    if (name.includes('chicken')) return chickenImg;
    if (name.includes('tea')) return teaImg;
    if (name.includes('burger') || name.includes('slider')) return burgerImg;
    if (name.includes('pizza')) return pizzaImg;
    if (name.includes('latte') || name.includes('matcha')) return latteImg;
    if (name.includes('coffee') || name.includes('americano') || name.includes('espresso') || name.includes('macchiato')) return coffeeImg;
    
    // Category fallbacks
    switch (categoryId) {
      case 'pizzas': return pizzaImg;
      case 'breads': return burgerImg;
      case 'housebrew':
      case 'frappes': return coffeeImg;
      case 'cloudcoffee': return latteImg;
      case 'shakes':
      case 'mocktails': return juiceImg;
      case 'catch': return fishImg;
      case 'sharing':
      case 'global': return chickenImg;
      default: return burgerImg; // Fallback for salads, eggs, fries, pastas, etc.
    }
  };

  return (
    <div className="relative z-10 text-darkText">
      {/* Sticky category nav with scroll buttons */}
      <nav 
        className="sticky top-0 z-20 backdrop-blur-md border-b"
        style={{ borderColor: `${menuTheme.textSec}20`, background: `${menuTheme.pageBg}E6` }}
      >
        <div className="max-w-7xl mx-auto flex items-center px-2 md:px-6">
          <button
            onClick={() => navScrollRef.current?.scrollBy({ left: -220, behavior: 'smooth' })}
            aria-label="Scroll categories left"
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[#3F5A3A] hover:bg-black/5 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div 
            ref={navScrollRef}
            className="flex gap-2 py-4 overflow-x-auto no-scrollbar scroll-smooth flex-1 px-1"
          >
            {MENU_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActive(cat.id)}
                className="px-5 py-2 rounded-full text-[12px] tracking-[0.08em] uppercase whitespace-nowrap transition-colors cursor-pointer"
                style={{
                  background: active === cat.id ? menuTheme.headerGreen : 'transparent',
                  color: active === cat.id ? '#FDFBF6' : menuTheme.textPri,
                  border: `1px solid ${menuTheme.textSec}30`,
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => navScrollRef.current?.scrollBy({ left: 220, behavior: 'smooth' })}
            aria-label="Scroll categories right"
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[#3F5A3A] hover:bg-black/5 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Item list for the active category */}
      <section className="relative max-w-4xl mx-auto px-6 py-16">
        <LeafFlourish className="absolute top-12 right-4 w-16 opacity-80" />
        <h2
          className="text-[30px] md:text-[40px] font-normal mb-1 relative z-10"
          style={{ color: menuTheme.headerGreen, fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          {MENU_CATEGORIES.find((c) => c.id === active)?.label}
        </h2>
        <div className="w-14 h-0.5 mb-8" style={{ background: menuTheme.gold }} />

        <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
          {FULL_MENU[active]?.map((item, i) => {
            const photoSrc = item.photo || getCategoryImage(active, item.name);
            return (
              <div key={i} className="flex gap-4 items-start pb-6 border-b" style={{ borderColor: `${menuTheme.textSec}20` }}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0"
                      style={{ background: item.veg ? menuTheme.vegGreen : menuTheme.nonVegRed }}
                    />
                    <strong className="text-[15px]" style={{ color: menuTheme.textPri }}>{item.name}</strong>
                  </div>
                  {item.desc && <p className="text-[13px] mb-1.5 leading-relaxed" style={{ color: menuTheme.textSec }}>{item.desc}</p>}
                  <span className="text-[14px] font-semibold" style={{ color: menuTheme.gold }}>₹{item.price}</span>
                </div>
                {photoSrc && (
                  <img src={photoSrc} alt={item.name} loading="lazy" className="w-18 h-18 rounded-xl object-cover flex-shrink-0" style={{ width: 72, height: 72 }} />
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// ─── Main Menu Page ───────────────────────────────────────────────────────────
export default function MenuPage() {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen font-sans antialiased selection:bg-[#B58A55] selection:text-white relative" style={{ color: menuTheme.textPri }}>
      
      {/* Background blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" style={{ background: menuTheme.pageBg }}>
        <svg className="absolute -top-10 -left-16 w-48 opacity-60" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r="70" fill={menuTheme.blobTan} />
        </svg>
        <svg className="absolute -bottom-20 -right-16 w-56 opacity-60" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r="80" fill={menuTheme.blobSage} />
        </svg>
        <svg className="absolute top-[35%] right-[-10%] w-64 opacity-50" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="100" fill={menuTheme.blobTan} />
        </svg>
        <svg className="absolute top-[65%] left-[-5%] w-40 opacity-40" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="60" fill={menuTheme.blobSage} />
        </svg>
      </div>

      <SEO
        title="Cafe Menu in Thoothukudi | R Sports & Cafe"
        description="Explore food, coffee, refreshing drinks, pizzas and desserts at R Sports & Cafe in Thoothukudi."
        canonical="/menu"
      />
      
      {/* ─── Hero Image Marquee ─────────────────────────────────────────── */}
      <ImageMarquee />

      <MenuShowcase />

      {/* ─── Footer ────────────────────────────────────────────────────── */}
      <footer className="border-t py-12 px-6 lg:px-16 text-center font-inter text-[12px] relative z-10" style={{ borderColor: `${menuTheme.textSec}20`, background: menuTheme.pageBg, color: menuTheme.textSec }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2026 R Sports & Cafe. Gourmet Dining & Sports Club Experience.</p>
          <div className="flex items-center gap-6 font-bold uppercase tracking-[0.12em] text-[11px]" style={{ color: menuTheme.textPri }}>
            <Link to="/" className="hover:text-[#B58A55] transition-colors">Home</Link>
            <Link to="/turf" className="hover:text-[#B58A55] transition-colors">Turf</Link>
            <Link to="/booking" className="hover:text-[#B58A55] transition-colors">Reserve Table</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
