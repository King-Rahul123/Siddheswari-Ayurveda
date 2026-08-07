import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/Remedies.css';

function Remedies() {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  // Trigger animations on mount
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Comprehensive Product Catalog
  const products = [
    {
      id: 1,
      name: "Nutrilong Slim Combi Pack",
      category: "Weight Loss",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "/images/Slim_Combi_Pack.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 2,
      name: "Thermogenic Herbal Tea",
      category: "Weight Loss",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "/images/Thermogenic_Herbal_Tea.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 3,
      name: "Chlorophyll Detox",
      category: "Weight Loss",
      price: "₹499",
      rating: 4.9,
      reviews: 164,
      image: "/images/ChlorophyllDetox.png",
      tag: "",
      badge: "Kshirapak Process",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 4,
      name: "Nutrilong Super Active Meal Replacement",
      category: "Weight Loss",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "/images/Super_Active_Meal_Replacement.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 5,
      name: "Nutrilong Super Active Protein Powder",
      category: "Weight Loss",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "/images/Super_Active_Protein_Powder.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 6,
      name: "Bio Essence Hair Oil",
      category: "Haircare",
      price: "₹899",
      rating: 5.0,
      reviews: 98,
      image: "/images/BioEssence_HairOil.png",
      tag: "Magical Radiance",
      badge: "Pure Saffron",
      specifications: {
        weight: "",
        dosage: "Take the required amount of oil. Gently massage this oil to scalp and hairs.",
        keyIngredients: "Bhringa OSLE Panchang Neeli OSLE Leal, Brahmi DSLE Panchang ,Karani CSLE seed, Beheda OSLE Fruit, Harad OSLE Fruit, Amla OSLE Fruit, Indrayan OSLE seed, Chhoti elaychi seed, Jatamanshi OSLE Rhizome, Neem OSLE seed, Henna OSLE Leaf, Yashtirmadhi OSLE Root, Chandthi OSLE seed, Vacha OSLE Rhizome, Dhatura OSLE Seeds, Kesut OSLE Leaves, Akkarkara DSLE Root, Grit Kumari OSLE Leaves Japakusum OSLE Flower, Lemon oil Fruit peel, Vitamin E, Tea tree oil Leaves",
        benefits: "Fights dandruff Provides relief from itching and flaking Moisturize both hair and scalp Leaves hair soft and healthy looking",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 7,
      name: "Bio Essence Hair Shampoo",
      category: "Haircare",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "/images/BioEssence_HairShampoo.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 8,
      name: "Bio Essence Hair Conditioner",
      category: "Haircare",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "/images/BioEssence_HairConditioner.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 9,
      name: "Nutrilong Hair Care",
      category: "Haircare",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "/images/HairCare.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 10,
      name: "Kesh Nikhar Anti Dandruff Hair Cleanser",
      category: "Haircare",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 11,
      name: "Kesh Nikhar Anti Dandruff Hair Toner",
      category: "Haircare",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 12,
      name: "Himnidra D-stress Oil",
      category: "Haircare",
      price: "₹220",
      rating: 4.9,
      reviews: 164,
      image: "/images/Himnidra_dStress_Oil.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 13,
      name: "Leh Berry Face Cleanser",
      category: "SkinCare",
      price: "₹212",
      rating: 4.9,
      reviews: 164,
      image: "/images/Lehberry_FaceCleanser.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 14,
      name: "Neem face Cleanser",
      category: "Skincare",
      price: "₹190",
      rating: 4.9,
      reviews: 164,
      image: "/images/Neem_FaceCleanser.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 15,
      name: "Oil & Acne Control Face Wash",
      category: "Skincare",
      price: "₹249",
      rating: 4.9,
      reviews: 164,
      image: "/images/Oli&Acne_FaceWash.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 16,
      name: "Moisturising Lotion",
      category: "Skincare",
      price: "₹130",
      rating: 4.9,
      reviews: 164,
      image: "/images/Moisturizing_Lotion.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 17,
      name: "Turmeric Multipurpose Cream",
      category: "Skincare",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "/images/Turmeric_Multipurpose_Cream.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "50 g",
        dosage: "Apply a small amount to the affected area and gently massage until absorbed.",
        keyIngredients: "Daru Haldi Root/Bark liquid extract, Haldi Rhizome liquid extract,Tulasi leaves liquid extract, Mulethi root liquid extract, Kesar stigma liquid extract, Jatyadi tailam permitted base materials.",
        benefits: "Provides natural moisturizing and soothing properties for the skin. Helps to reduce inflammation and redness. Can be used for minor cuts, burns, and skin irritations.",
        certification: "WHO GMP Certified, ISO 9001:2015 Certified, Ayush Approved",
        expiry: ""
      }
    },
    {
      id: 18,
      name: "Agefyte Gold Cleansing Milk",
      category: "Beauty Care",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "/images/Gold_Cleansing_Milk.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 19,
      name: "Agefyte Gold Cream",
      category: "Beauty Care",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "/images/Gold_Cream.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 20,
      name: "Agefyte Gold Youth Serum",
      category: "Beauty Care",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "/images/Gold_Youth_Serum.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 21,
      name: "Agefyte Gold Revive Mist",
      category: "Beauty Care",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "/images/Gold_Revive_Mist.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 22,
      name: "Agefyte Gold Powder Mask",
      category: "Beauty Care",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "/images/Gold_Powder_Mask.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 23,
      name: "Agefyte Gold Peel Off Mask",
      category: "Beauty Care",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "/images/Gold_Peel_Off_Mask.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 24,
      name: "agefyte Gold Face Scrub",
      category: "Beauty Care",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "/images/Gold_Face_Scrub.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 25,
      name: "Agefyte Gold Facial Kit",
      category: "Beauty Care",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "/images/Gold_Facial_Kit.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 26,
      name: "Agefyte Sunscreen Butter",
      category: "Skincare",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "/images/Sunscreen_Butter.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 27,
      name: "Agefyte Night Cream",
      category: "Skincare",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "/images/Night_Cream.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 28,
      name: "Agefyte Fresh Under Eye Cream",
      category: "Skincare",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "/images/Fresh_Under_Eye_Cream.jpg",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 29,
      name: "Agefyte Brightening Bio Serum",
      category: "Skincare",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "/images/Brightening_Bio_Serum.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 30,
      name: "Agefyte Brightening Bio Toner",
      category: "Skincare",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "/images/Brightening_Bio_Toner.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 31,
      name: "Agefyte Brightening Cleansing Foam",
      category: "Skincare",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "/images/Brightening_Cleansing_Foam.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 32,
      name: "Agefyte Brightening Cream",
      category: "Skincare",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "/images/Brightening_Cream.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 33,
      name: "Agefyte Brightening Kit",
      category: "Skincare",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "/images/Brightening_Kit.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 34,
      name: "Agefyte Whitening Mask",
      category: "Beauty Care",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "/images/Whitening_Mask.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 35,
      name: "Agefyte Anti Acne Face Cream",
      category: "Skincare",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 36,
      name: "Agefyte Spot Free Cream",
      category: "Skincare",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "/images/Spot_Free_Cream.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 37,
      name: "Agefyte Anti Aging Cream",
      category: "Skincare",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 38,
      name: "Agefyte A Charcoal Mask",
      category: "Beauty Care",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "/images/A_Charcoal_Mask.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 39,
      name: "DiaCare Ras",
      category: "Diabetes",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 40,
      name: "Diacare Tablet",
      category: "Diabetes",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 41,
      name: "Sanjeevani Joddaram Combi Pack",
      category: "Joint Pain",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 42,
      name: "Sanjeevani Joddaram Oil",
      category: "Joint Pain",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 43,
      name: "Sanjeevani Jodaram Tablet",
      category: "Joint Pain",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 44,
      name: "Sanjeevani Joddaram Cream",
      category: "Joint Pain",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 45,
      name: "Nutrilong Mega Men",
      category: "Men's Health",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 46,
      name: "Knight Max Ras",
      category: "Men's Health",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 47,
      name: "Royal Honey for Him",
      category: "Men's Health",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 48,
      name: "Deltas Shilajit Gold",
      category: "Men's Health",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "/images/Shilajit_Gold.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 49,
      name: "Prostawon Capsule",
      category: "Men's Health",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 50,
      name: "Nutrilong Ultra Women",
      category: "Women's Health",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 51,
      name: "Nutrilong PCOS",
      category: "Women's Health",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 52,
      name: "Gynocare Tablet",
      category: "Women's Health",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 53,
      name: "Gynocare Syrup",
      category: "Women's Health",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "/images/Gynocare_Syrup.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 54,
      name: "Deltas Shatavari Tablet",
      category: "Women's Health",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 55,
      name: "Mamfresh Pain Period Shots",
      category: "Women's Health",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 56,
      name: "Maamfresh Desire Gel",
      category: "Women's Health",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 57,
      name: "Maamfresh Intimate Wash",
      category: "Women's Health",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 38,
      name: "Ashwagandha",
      category: "Memory",
      price: "₹450",
      rating: 4.8,
      reviews: 185,
      image: "/images/Ashwagandha.png",
      tag: "Stress Relief",
      badge: "KSM-66 Extract",
      specifications: {
        weight: "60 Vegetarian Capsules",
        dosage: "1 capsule twice daily after meals with milk or water",
        keyIngredients: "High Potency KSM-66 Ashwagandha Root Extract (500mg), Swarna Bhasma (Purified Gold ash traces)",
        benefits: "Reduces cortisol and anxiety, elevates muscle strength, improves sleep quality, boosts stamina.",
        certification: "Non-GMO, Vegetarian, Ayush Approved",
        expiry: "24 months from MFD"
      }
    },
    {
      id: 39,
      name: "Brahmi",
      category: "Memory",
      price: "₹380",
      rating: 4.7,
      reviews: 86,
      image: "/images/Brahmi.png",
      tag: "Mental Clarity",
      badge: "Nootropic Tonic",
      specifications: {
        weight: "200ml Glass Bottle",
        dosage: "10ml twice daily with water",
        keyIngredients: "Brahmi (Bacopa monnieri), Shankhpushpi, Jatamansi, Vacha, Mulethi",
        benefits: "Enhances cognitive focus, memory retention, reduces mental exhaustion, calms hyperactive minds.",
        certification: "Classical Syrup Standard, 100% Herbal",
        expiry: "24 months from MFD"
      }
    },
    {
      id: 40,
      name: "Vatsal Memory Syrup",
      category: "Memory",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "/images/Vatsal.jpg",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 41,
      name: "Nutrilong Arjunaa Plus",
      category: "Heart Care",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 42,
      name: "Nutrilong CoQ Ten Plus",
      category: "Heart Care",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 49,
      name: "Nutrilong Top Calcium Syrup",
      category: "",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "/images/Calcium_Syrup.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 50,
      name: "Nutrilong Multi VItamin Syrup",
      category: "",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "/images/MultiVitamin_Syrup.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 51,
      name: "Nutrilong Eye Max",
      category: "",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "/images/Eye_Max.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 52,
      name: "Nayansukh Eye Drop",
      category: "",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 53,
      name: "Brahma Rasayana",
      category: "Immunity",
      price: "₹599",
      rating: 4.9,
      reviews: 142,
      image: "/images/Brahma_Rasayana.png",
      tag: "Best Seller",
      badge: "Pure & Organic",
      specifications: {
        weight: "500g Glass Jar",
        dosage: "1-2 teaspoons twice daily with warm milk or water",
        keyIngredients: "Fresh Organic Amla, Kashmiri Saffron, Wild Honey, Bramhi, Shankhpushpi, 48 Classical Ayurvedic Herbs",
        benefits: "Boosts immune system, enhances memory and stamina, supports respiratory wellness, anti-aging properties.",
        certification: "100% Ayurvedic Formulation, GMP & ISO Certified",
        expiry: "24 months from MFD"
      }
    },
    {
      id: 54,
      name: "Guduchi",
      category: "",
      price: "₹499",
      rating: 4.9,
      reviews: 164,
      image: "/images/Guduchi.png",
      tag: "Hair Fall Control",
      badge: "Kshirapak Process",
      specifications: {
        weight: "200ml Glass Bottle with Applicator",
        dosage: "Gently massage into scalp 2-3 times a week, leave for 2 hours or overnight",
        keyIngredients: "Bhringraj, Amla, Sesame Oil, Coconut Milk, Neem, Nagarmotha",
        benefits: "Prevents premature graying, stops hair fall, stimulates new hair growth, relieves stress & headache.",
        certification: "Traditional Kshirapak Recipe, No Mineral Oils",
        expiry: "24 months from MFD"
      }
    },
    {
      id: 55,
      name: "Nutrilong Super Moringa",
      category: "",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "/images/Super_Moringa.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 56,
      name: "Nutrilong Super Omega",
      category: "",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 57,
      name: "Pancha Tulasi Drops",
      category: "",
      price: "₹275",
      rating: 4.9,
      reviews: 164,
      image: "/images/Pancha_Tulasi_Drop.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 58,
      name: "Pancha Tulasi Lozenges",
      category: "",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "/images/PanchaTulasi_Lozenges.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 59,
      name: "Triphala",
      category: "Digestion",
      price: "₹320",
      rating: 4.9,
      reviews: 210,
      image: "/images/Triphala.png",
      tag: "Detox Specialist",
      badge: "Raw Herb Powder",
      specifications: {
        weight: "250g Airtight Eco Jar",
        dosage: "1 teaspoon (3-5g) before sleep with lukewarm water",
        keyIngredients: "Equal parts of organic Haritaki, Bibhitaki, and Amla",
        benefits: "Cleanses digestive tract, relieves chronic constipation, balances Tridoshas, promotes metabolic health.",
        certification: "Organic Certified, Zero Preservatives",
        expiry: "12 months from MFD"
      }
    },
    {
      id: 60,
      name: "Superlax Powder",
      category: "",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "/images/Superlax_Powder.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 61,
      name: "Antacid Tablet",
      category: "",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 62,
      name: "Livcare Syrup",
      category: "",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 63,
      name: "Livcare Tablet",
      category: "",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 64,
      name: "Stonecare SF Syrup",
      category: "",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 65,
      name: "Pilescare Cream",
      category: "",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 66,
      name: "Pilescare Tablet",
      category: "",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 67,
      name: "Psorino Cream",
      category: "",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 68,
      name: "Psorino Tablet",
      category: "",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 82,
      name: "Nutrilong Organic Berries",
      category: "",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "/images/Organic_Berries.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 83,
      name: "Nutrilong Seabuck Fresh",
      category: "",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "/images/SeaBuck_Fresh.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 84,
      name: "Spiriluna Tablet",
      category: "",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 85,
      name: "Wheatgrass Tablet",
      category: "",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 86,
      name: "Active Amla Juice",
      category: "",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 87,
      name: "Aloe Vera Fiber Juice",
      category: "",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 88,
      name: "Alkalizing Drop",
      category: "",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 89,
      name: "Alkalizing demo Kit",
      category: "",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 90,
      name: "Kofcare Syrup",
      category: "",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },

    {
      id: 15,
      name: "Nutrilong Astaaxanthin",
      category: "",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 17,
      name: "Nutrilong Resveratrol Plus",
      category: "",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 20,
      name: "Nutrilong Noni BonZym K2",
      category: "",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "/images/Noni_BonzymK2.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 23,
      name: "Nutrilong Tri Ginseng",
      category: "",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 24,
      name: "Nutrilong A2 Colostrum Advance",
      category: "",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 26,
      name: "Nutrilong Curcumin Max",
      category: "",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "/images/CurcuminMax.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 30,
      name: "Nutrilong X-Plus Combi Pack",
      category: "",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    
    {
      id: 37,
      name: "Leucowin Capsule",
      category: "",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 44,
      name: "D Stress Capsule",
      category: "",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 67,
      name: "Deltas Neem Tablet",
      category: "",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "/images/Neem.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    
    
    
    {
      id: 108,
      name: "Skincare Ayurvedic Body Cleanser",
      category: "",
      price: "₹240",
      rating: 4.9,
      reviews: 164,
      image: "/images/Ayurvedic_Body_Cleanser.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 109,
      name: "Skincare Fairness Body cleanser",
      category: "",
      price: "₹240",
      rating: 4.9,
      reviews: 164,
      image: "/images/Fairness_Body_Cleanser.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 116,
      name: "Nutrilong Stemcell",
      category: "",
      price: "₹9000",
      rating: 4.9,
      reviews: 164,
      image: "",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 93,
      name: "Dentacure Herbal Tooth Cleanser",
      category: "Dental Care",
      price: "₹96",
      rating: 4.9,
      reviews: 164,
      image: "/images/DentaCure_Toothpaste.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "100g",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 94,
      name: "Top Dantunn Red Toothpaste",
      category: "Dental Care",
      price: "₹135",
      rating: 4.9,
      reviews: 164,
      image: "/images/Dantunn_RedToothpaste.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "100g",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 95,
      name: "Top Dantunn Green Toothpaste",
      category: "Dental Care",
      price: "₹120",
      rating: 4.9,
      reviews: 164,
      image: "/images/Dantunn_GreenToothpaste.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "100g",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 97,
      name: "Potentia Antiseptic Hand Wash",
      category: "Home Care",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "/images/Antiseptic_handwash.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 98,
      name: "Topkleen Powermop Floor Cleaner",
      category: "Home Care",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "/images/Floor_Cleaner.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "500 ml",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 99,
      name: "Topkleen Supermatic Detergent Powder",
      category: "Home Care",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "/images/Detergent_Powder.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "500 g",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 100,
      name: "Topkleen Ultrashine Dishwash Gel",
      category: "Home Care",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "/images/Dishwash_Gel.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 101,
      name: "Topkleen Toilet Cleaner",
      category: "Home Care",
      price: "₹255",
      rating: 4.9,
      reviews: 164,
      image: "/images/Toilet_Cleaner.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 96,
      name: "Topkaa Nature Fresh Chai",
      category: "Food & Beverages",
      price: "₹160",
      rating: 4.9,
      reviews: 164,
      image: "/images/Fresh_Chai.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "250 g",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 102,
      name: "Topkaa Instant Coffee",
      category: "Food & Beverages",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "/images/Coffee.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 103,
      name: "Topflora Liquid",
      category: "Agriculture & Veterinary",
      price: "₹1199",
      rating: 4.9,
      reviews: 164,
      image: "/images/Topflora_Liquid.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "1 liter",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
    {
      id: 104,
      name: "Topvet Powder",
      category: "Agriculture & Veterinary",
      price: "₹612",
      rating: 4.9,
      reviews: 164,
      image: "/images/Topvet_Powder.png",
      tag: "",
      badge: "",
      specifications: {
        weight: "1kg",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "",
        expiry: ""
      }
    },
  ];

  // Filter Tabs definition
  const filterTabs = ['All', 'Immunity', 'Skincare', 'Digestion', 'Memory', 'Haircare'];

  // Filter products based on active category
  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="remedies-page-layout light-theme">
      {/* Magical Ambient Effects */}
      <div className="magical-orb orb-1"></div>
      <div className="magical-orb orb-2"></div>
      
      {/* Floating Exit Button */}
      <button 
        className={`exit-btn ${isLoaded ? 'animate-in' : ''}`} 
        onClick={() => navigate('/')}
        aria-label="Close page"
      >
        <i className="bi bi-x"></i>
      </button>

      <div className="container py-5">
        <header className={`remedies-header ${isLoaded ? 'animate-in' : ''}`}>
          <span className="section-kicker">Siddheswari Apothecary</span>
          <h1 className="page-heading">Complete Natural Remedies</h1>
          <p className="section-subtext mx-auto">
            Browse our full collection of authentic Ayurvedic formulations, meticulously crafted from nature's rarest botanicals to restore balance and vitality.
          </p>
          <div className="gold-divider"></div>
        </header>

        {/* Category Filter Tabs */}
        <div className={`category-filters-container ${isLoaded ? 'animate-in' : ''}`} style={{ animationDelay: '0.2s' }}>
          {filterTabs.map((cat) => (
            <button
              key={cat}
              className={`filter-tab-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Single continuous grid for all filtered products */}
        <div className="catalog-wrapper animate-in" key={activeCategory} style={{ animationDelay: '0.1s' }}>
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
              {filteredProducts.map((prod) => (
                <div key={prod.id} className="product-card-modern">
                  <div className="product-image-wrap">
                    <img src={prod.image} alt={prod.name} className="product-img" loading="lazy" />
                    <span className="product-tag">{prod.tag}</span>
                    <button className="quick-spec-btn" onClick={() => setSelectedProduct(prod)}>
                      <i className="bi bi-eye"></i> View Specifications
                    </button>
                  </div>

                  <div className="product-info">
                    <div className="product-header-meta">
                      <span className="product-category-badge">{prod.category}</span>
                      <span className="product-rating">
                        <i className="bi bi-star-fill gold-icon"></i> {prod.rating} ({prod.reviews})
                      </span>
                    </div>

                    <h3 className="product-name">{prod.name}</h3>

                    <div className="product-footer-meta">
                      <div className="price-container">
                        <span className="product-price">{prod.price}</span>
                        <span className="tax-inclusive">Incl. all taxes</span>
                      </div>

                      <button className="btn-add-cart" onClick={() => setSelectedProduct(prod)}>
                        <i className="bi bi-info-circle"></i> Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-products-found animate-in">
              <i className="bi bi-flower1"></i>
              <p>Formulations for this category are currently brewing. Please check back soon.</p>
            </div>
          )}
        </div>
      </div>

      {/* Product Specifications Modal */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="spec-modal glass-card-large" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedProduct(null)}>
              <i className="bi bi-x-lg"></i>
            </button>

            <div className="modal-grid">
              <div className="modal-image-col">
                <img src={selectedProduct.image} alt={selectedProduct.name} className="modal-product-img" />
                <span className="modal-badge">{selectedProduct.badge}</span>
              </div>

              <div className="modal-info-col">
                <span className="product-category-badge">{selectedProduct.category}</span>
                <h2>{selectedProduct.name}</h2>
                <div className="modal-price">{selectedProduct.price}</div>

                <div className="specs-detail-list">
                  <div className="spec-item">
                    <strong><i className="bi bi-box-seam gold-icon"></i> Packaging & Weight:</strong>
                    <span>{selectedProduct.specifications.weight}</span>
                  </div>

                  <div className="spec-item">
                    <strong><i className="bi bi-capsule gold-icon"></i> Recommended Dosage:</strong>
                    <span>{selectedProduct.specifications.dosage}</span>
                  </div>

                  <div className="spec-item">
                    <strong><i className="bi bi-droplet-half gold-icon"></i> Key Ingredients:</strong>
                    <span>{selectedProduct.specifications.keyIngredients}</span>
                  </div>

                  <div className="spec-item">
                    <strong><i className="bi bi-heart-pulse gold-icon"></i> Primary Benefits:</strong>
                    <span>{selectedProduct.specifications.benefits}</span>
                  </div>

                  <div className="spec-item">
                    <strong><i className="bi bi-shield-check gold-icon"></i> Certification & Purity:</strong>
                    <span>{selectedProduct.specifications.certification}</span>
                  </div>
                </div>

                <div className="modal-actions">
                  <button className="btn-gold-primary" onClick={() => setSelectedProduct(null)}>
                    <i className="bi bi-geo-alt"></i> Available at Ghatal Clinic
                  </button>
                  <button className="btn-glass-secondary" onClick={() => setSelectedProduct(null)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Remedies;