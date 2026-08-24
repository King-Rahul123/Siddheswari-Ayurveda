import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/Remedies.css';

function Remedies() {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Trigger animations on mount
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Comprehensive Product Catalog
  const products = [
    {
      id: 1,
      name: "Nutrilong Slim Combi Pack",
      category: "Dietary",
      price: "₹3285",
      rating: 4.9,
      reviews: 164,
      image: "/images/Slim_Combi_Pack.png",
      tag: "Weight Management",
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
      category: "Dietary",
      price: "₹729",
      rating: 4.9,
      reviews: 164,
      image: "/images/Thermogenic_Herbal_Tea.png",
      tag: "Diet Tea",
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
      category: ["Dietary", "Others"],
      price: "₹1485",
      rating: 4.9,
      reviews: 164,
      image: "/images/ChlorophyllDetox.png",
      tag: "Daily Detox",
      badge: "Kshirapak Process",
      specifications: {
        weight: "5g x 30 sachets",
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
      category: "Dietary",
      price: "₹2652",
      rating: 4.9,
      reviews: 164,
      image: "/images/Super_Active_Meal_Replacement.png",
      tag: "Meal Replacement",
      badge: "",
      specifications: {
        weight: "500g",
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
      category: "Dietary",
      price: "₹1428",
      rating: 4.9,
      reviews: 164,
      image: "/images/Super_Active_Protein_Powder.png",
      tag: "Protein Nutrition",
      badge: "",
      specifications: {
        weight: "200g",
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
      category: ["Haircare", "FMCG"],
      price: "₹372",
      rating: 5.0,
      reviews: 98,
      image: "/images/BioEssence_HairOil.png",
      tag: "Hair Care",
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
      category: ["Haircare", "FMCG"],
      price: "₹312",
      rating: 4.9,
      reviews: 164,
      image: "/images/BioEssence_HairShampoo.png",
      tag: "Hair Care",
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
      category: ["Haircare", "FMCG"],
      price: "₹450",
      rating: 4.9,
      reviews: 164,
      image: "/images/BioEssence_HairConditioner.png",
      tag: "Hair Care",
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
      price: "₹798",
      rating: 4.9,
      reviews: 164,
      image: "/images/HairCare.png",
      tag: "Hair Wellness",
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
      price: "₹165",
      rating: 4.9,
      reviews: 164,
      image: "/images/Keshnikhar_Hair_Cleanser.png",
      tag: "Anti Dandruff",
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
      price: "₹225",
      rating: 4.9,
      reviews: 164,
      image: "/images/Keshnikhar_Hair_Toner.png",
      tag: "Anti Dandruff",
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
      tag: "Stress Relief",
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
      category: ["Skincare", "FMCG"],
      price: "₹212",
      rating: 4.9,
      reviews: 164,
      image: "/images/Lehberry_FaceCleanser.png",
      tag: "Face Care",
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
      tag: "Neem Care",
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
      tag: "Oil Control",
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
      tag: "Daily Moisture",
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
      price: "₹149",
      rating: 4.9,
      reviews: 164,
      image: "/images/Turmeric_Multipurpose_Cream.png",
      tag: "Ayurvedic Skincare",
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
      price: "₹369",
      rating: 4.9,
      reviews: 164,
      image: "/images/Gold_Cleansing_Milk.png",
      tag: "Premium Skincare",
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
      price: "₹549",
      rating: 4.9,
      reviews: 164,
      image: "/images/Gold_Cream.png",
      tag: "Premium Skincare",
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
      price: "₹1079",
      rating: 4.9,
      reviews: 164,
      image: "/images/Gold_Youth_Serum.png",
      tag: "Youth Care",
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
      price: "₹741",
      rating: 4.9,
      reviews: 164,
      image: "/images/Gold_Revive_Mist.png",
      tag: "Skin Refresh",
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
      price: "₹1071",
      rating: 4.9,
      reviews: 164,
      image: "/images/Gold_Powder_Mask.png",
      tag: "Face Mask",
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
      price: "₹536",
      rating: 4.9,
      reviews: 164,
      image: "/images/Gold_Peel_Off_Mask.png",
      tag: "Peel Off Mask",
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
      name: "Agefyte Gold Face Scrub",
      category: "Beauty Care",
      price: "₹574",
      rating: 4.9,
      reviews: 164,
      image: "/images/Gold_Face_Scrub.png",
      tag: "Face Exfoliation",
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
      price: "₹4695",
      rating: 4.9,
      reviews: 164,
      image: "/images/Gold_Facial_Kit.png",
      tag: "Premium Facial Kit",
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
      price: "₹369",
      rating: 4.9,
      reviews: 164,
      image: "/images/Sunscreen_Butter.png",
      tag: "Sunscreen",
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
      price: "₹330",
      rating: 4.9,
      reviews: 164,
      image: "/images/Night_Cream.png",
      tag: "Night Cream",
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
      price: "₹184",
      rating: 4.9,
      reviews: 164,
      image: "/images/Fresh_Under_Eye_Cream.jpg",
      tag: "Eye Care",
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
      price: "₹1140",
      rating: 4.9,
      reviews: 164,
      image: "/images/Brightening_Bio_Serum.png",
      tag: "Brightening Care",
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
      price: "₹514",
      rating: 4.9,
      reviews: 164,
      image: "/images/Brightening_Bio_Toner.png",
      tag: "Brightening Care",
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
      price: "₹591",
      rating: 4.9,
      reviews: 164,
      image: "/images/Brightening_Cleansing_Foam.png",
      tag: "Face Cleanser",
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
      price: "₹424",
      rating: 4.9,
      reviews: 164,
      image: "/images/Brightening_Cream.png",
      tag: "Brightening Care",
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
      price: "3539",
      rating: 4.9,
      reviews: 164,
      image: "/images/Brightening_Kit.png",
      tag: "Skincare Kit",
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
      price: "₹1070",
      rating: 4.9,
      reviews: 164,
      image: "/images/Whitening_Mask.png",
      tag: "Face Mask",
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
      price: "₹110",
      rating: 4.9,
      reviews: 164,
      image: "/images/Anti_Acne_face_Cream.png",
      tag: "Acne Care",
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
      price: "₹176",
      rating: 4.9,
      reviews: 164,
      image: "/images/Spot_Free_Cream.png",
      tag: "Spot Care",
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
      price: "₹176",
      rating: 4.9,
      reviews: 164,
      image: "/images/Anti_Aging_Cream.png",
      tag: "Anti-Aging Care",
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
      price: "₹1072",
      rating: 4.9,
      reviews: 164,
      image: "/images/A_Charcoal_Mask.png",
      tag: "Charcoal Mask",
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
      price: "₹798",
      rating: 4.9,
      reviews: 164,
      image: "/images/Diacare_Ras.png",
      tag: "Diabetes",
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
      price: "₹414",
      rating: 4.9,
      reviews: 164,
      image: "/images/Diacare_Tablet.png",
      tag: "Diabetes",
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
      price: "₹1125",
      rating: 4.9,
      reviews: 164,
      image: "/images/Joddaram_Combo.png",
      tag: "Joint Pain",
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
      price: "₹324",
      rating: 4.9,
      reviews: 164,
      image: "/images/Joddaram_Oil.png",
      tag: "Joint Pain",
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
      name: "Sanjeevani Joddaram Tablet",
      category: "Joint Pain",
      price: "₹432",
      rating: 4.9,
      reviews: 164,
      image: "/images/Joddaram_Tablet.png",
      tag: "Joint Pain",
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
      price: "₹249",
      rating: 4.9,
      reviews: 164,
      image: "/images/Joddaram_Cream.png",
      tag: "Joint Pain",
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
      price: "₹774",
      rating: 4.9,
      reviews: 164,
      image: "/images/Mega_Men.png",
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
      price: "₹669",
      rating: 4.9,
      reviews: 164,
      image: "/images/KnightMax_Ras.png",
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
      price: "₹2813",
      rating: 4.9,
      reviews: 164,
      image: "/images/Royal_Honey_For_Him.png",
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
      price: "₹596",
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
      price: "₹798",
      rating: 4.9,
      reviews: 164,
      image: "/images/Prostawon.png",
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
      name: "Nutrilong X-Plus Combi Pack",
      category: "Men's Health",
      price: "",
      rating: 4.9,
      reviews: 164,
      image: "/images/X-Plus_Combi_Pack.png",
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
      name: "Nutrilong Ultra Women",
      category: "Women's Health",
      price: "₹774",
      rating: 4.9,
      reviews: 164,
      image: "/images/Ultra_Women.png",
      tag: "Women's Wellness",
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
      name: "Nutrilong PCOS",
      category: "Women's Health",
      price: "₹2175",
      rating: 4.9,
      reviews: 164,
      image: "/images/PCOS.png",
      tag: "Women's Wellness",
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
      name: "Gynocare Tablet",
      category: "Women's Health",
      price: "₹399",
      rating: 4.9,
      reviews: 164,
      image: "/images/Gynocare_Table.png",
      tag: "Women's Care",
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
      name: "Gynocare Syrup",
      category: "Women's Health",
      price: "₹198",
      rating: 4.9,
      reviews: 164,
      image: "/images/Gynocare_Syrup.png",
      tag: "Women's Care",
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
      name: "Deltas Shatavari Tablet",
      category: "Women's Health",
      price: "₹306",
      rating: 4.9,
      reviews: 164,
      image: "/images/Shatavari.png",
      tag: "Women's Wellness",
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
      name: "Maamfresh Pain Period Shots",
      category: "Women's Health",
      price: "₹1248",
      rating: 4.9,
      reviews: 164,
      image: "/images/Maamfresh_Pain_Period_Shots.png",
      tag: "Period Pain",
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
      name: "Maamfresh Desire Gel",
      category: "Women's Health",
      price: "₹285",
      rating: 4.9,
      reviews: 164,
      image: "/images/Maamfresh_Desire_Gel.png",
      tag: "Women's Care",
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
      name: "Maamfresh Intimate Wash",
      category: "Women's Health",
      price: "₹199",
      rating: 4.9,
      reviews: 164,
      image: "/images/Maamfresh_Intimate_Wash.png",
      tag: "Intimate Wash",
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
      name: "Leucowin Capsule",
      category: "Women's Health",
      price: "₹750",
      rating: 4.9,
      reviews: 164,
      image: "/images/Leucowin.png",
      tag: "Women's Wellness",
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
      id: 60,
      name: "Ashwagandha",
      category: "Memory",
      price: "₹351",
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
      id: 61,
      name: "Brahmi",
      category: "Memory",
      price: "₹297",
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
      id: 62,
      name: "Vatsal Memory Syrup",
      category: "Memory",
      price: "₹152",
      rating: 4.9,
      reviews: 164,
      image: "/images/Vatsal.jpg",
      tag: "Brain Booster",
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
      name: "Nutrilong Arjunaa Plus",
      category: "Heart Care",
      price: "₹441",
      rating: 4.9,
      reviews: 164,
      image: "/images/Arjunaa_Plus.png",
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
      name: "Nutrilong CoQ Ten Plus",
      category: "Heart Care",
      price: "₹1782",
      rating: 4.9,
      reviews: 164,
      image: "/images/CoQ_Ten_Plus.png",
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
      name: "Nutrilong Top Calcium Syrup",
      category: "",
      price: "₹162",
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
      id: 66,
      name: "Nutrilong Multi VItamin Syrup",
      category: "",
      price: "₹243",
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
      id: 67,
      name: "Nutrilong Eye Max",
      category: "Eye Care",
      price: "₹798",
      rating: 4.9,
      reviews: 164,
      image: "/images/Eye_Max.png",
      tag: "Eye Supplement",
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
      name: "Nayansukh Eye Drop",
      category: "Eye Care",
      price: "₹108",
      rating: 4.9,
      reviews: 164,
      image: "/images/Nayansukh_Eye_Drop.png",
      tag: "Eye Care",
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
      id: 69,
      name: "Brahma Rasayana",
      category: "Immunity",
      price: "₹828",
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
      id: 70,
      name: "Guduchi",
      category: "",
      price: "₹279",
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
      id: 71,
      name: "Nutrilong Super Moringa",
      category: "",
      price: "₹2154",
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
      id: 72,
      name: "Nutrilong Super Omega",
      category: "",
      price: "₹2154",
      rating: 4.9,
      reviews: 164,
      image: "/images/Super_Omega.png",
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
      id: 73,
      name: "Pancha Tulasi Drops",
      category: "Immunity",
      price: "₹275",
      rating: 4.9,
      reviews: 164,
      image: "/images/Pancha_Tulasi_Drop.png",
      tag: "Immunity Booster",
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
      id: 74,
      name: "Pancha Tulasi Lozenges",
      category: "Others",
      price: "₹360",
      rating: 4.9,
      reviews: 164,
      image: "/images/PanchaTulasi_Lozenges.png",
      tag: "Immunity Booster",
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
      id: 75,
      name: "Triphala",
      category: "Digestion",
      price: "₹275",
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
      id: 76,
      name: "Superlax Powder",
      category: "Others",
      price: "₹171",
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
      id: 77,
      name: "Antacid Tablet",
      category: ["Digestion", "Others"],
      price: "₹399",
      rating: 4.9,
      reviews: 164,
      image: "/images/Antacid.png",
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
      id: 78,
      name: "Livcare Syrup",
      category: "",
      price: "₹181",
      rating: 4.9,
      reviews: 164,
      image: "/images/Livcare_Syrup.png",
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
      id: 79,
      name: "Livcare Tablet",
      category: "",
      price: "₹399",
      rating: 4.9,
      reviews: 164,
      image: "/images/Livcare_Tablet.png",
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
      id: 80,
      name: "Stonecare-SF Syrup",
      category: "",
      price: "₹279",
      rating: 4.9,
      reviews: 164,
      image: "/images/Stonecare-SF_Syrup.png",
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
      id: 81,
      name: "Pilescare Cream",
      category: "",
      price: "₹216",
      rating: 4.9,
      reviews: 164,
      image: "/images/Pilescare_Cream.png",
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
      name: "Pilescare Tablet",
      category: "",
      price: "₹399",
      rating: 4.9,
      reviews: 164,
      image: "/images/PilesCare_Tablet.png",
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
      name: "Psorino Cream",
      category: "",
      price: "₹399",
      rating: 4.9,
      reviews: 164,
      image: "/images/Psorino_Cream.png",
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
      name: "Psorino Tablet",
      category: "",
      price: "₹399",
      rating: 4.9,
      reviews: 164,
      image: "/images/Psorino_Tablet.png",
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
      name: "Nutrilong Organic Berries 5g × 30 Sachets",
      category: ["Supplement", "Others"],
      price: "₹2070",
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
      id: 86,
      name: "Nutrilong Seabuck Fresh 5g × 30 Sachets",
      category: ["Supplement", "Others"],
      price: "₹2277",
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
      id: 87,
      name: "Spiriluna Tablet",
      category: "",
      price: "₹399",
      rating: 4.9,
      reviews: 164,
      image: "/images/Spiriluna_Tablet.png",
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
      name: "Wheatgrass Tablet",
      category: "",
      price: "₹414",
      rating: 4.9,
      reviews: 164,
      image: "/images/Wheatgrass_Tablet.png",
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
      name: "Active Aamla Juice",
      category: "",
      price: "₹396",
      rating: 4.9,
      reviews: 164,
      image: "/images/Aamla_Juice.png",
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
      name: "Aloe Vera Fiber Juice",
      category: ["Digestion", "Others"],
      price: "₹468",
      rating: 4.9,
      reviews: 164,
      image: "/images/Aloevera_Juice.png",
      tag: "Digestion",
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
      id: 91,
      name: "Alkalizing Drop",
      category: "Others",
      price: "₹1242",
      rating: 4.9,
      reviews: 164,
      image: "/images/Alkalizing_Drop.png",
      tag: "Daily Wellness",
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
      id: 92,
      name: "Alkalizing demo Kit",
      category: "Others",
      price: "₹1242",
      rating: 4.9,
      reviews: 164,
      image: "/images/Alkalizing_Demo_Kit.png",
      tag: "Demo Kit",
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
      name: "Kofcare Syrup",
      category: "",
      price: "₹123",
      rating: 4.9,
      reviews: 164,
      image: "/images/Kofcare_Syrup.png",
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
      id: 94,
      name: "Nutrilong Astaaxanthin",
      category: "",
      price: "₹1782",
      rating: 4.9,
      reviews: 164,
      image: "/images/Astaaxanthin.png",
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
      id: 95,
      name: "Nutrilong Resveratrol Plus",
      category: "",
      price: "₹2070",
      rating: 4.9,
      reviews: 164,
      image: "/images/Resveratrol_Plus.png",
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
      name: "Nutrilong Noni BonZym K2",
      category: "",
      price: "₹792",
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
      id: 97,
      name: "Active Noni Juice",
      category: "",
      price: "₹882",
      rating: 4.9,
      reviews: 164,
      image: "/images/Active_Noni_Juice.png",
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
      name: "Nutrilong Tri Ginseng",
      category: "",
      price: "₹2070",
      rating: 4.9,
      reviews: 164,
      image: "/images/Tri_Ginseng.png",
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
      id: 99,
      name: "Nutrilong A2 Colostrum Advance",
      category: "",
      price: "₹1116",
      rating: 4.9,
      reviews: 164,
      image: "/images/A2_Colostrum_Advance.png",
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
      id: 100,
      name: "Nutrilong Curcumin Max",
      category: "",
      price: "₹567",
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
      id: 101,
      name: "D Stress Capsule",
      category: "",
      price: "₹399",
      rating: 4.9,
      reviews: 164,
      image: "/images/D-Stress_Capsule.png",
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
      id: 102,
      name: "Deltas Neem Tablet",
      category: "",
      price: "₹279",
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
      id: 103,
      name: "Skincare Ayurvedic Body Cleanser",
      category: "FMCG",
      price: "₹240",
      rating: 4.9,
      reviews: 164,
      image: "/images/Ayurvedic_Body_Cleanser.png",
      tag: "Ayurvedic Soap",
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
      id: 104,
      name: "Skincare Fairness Body cleanser",
      category: "FMCG",
      price: "₹240",
      rating: 4.9,
      reviews: 164,
      image: "/images/Fairness_Body_Cleanser.png",
      tag: "Fairness Soap",
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
      id: 105,
      name: "Nutrilong Stemcell",
      category: "Others",
      price: "₹9000",
      rating: 4.9,
      reviews: 164,
      image: "/images/Stemcell.png",
      tag: "Premium Wellness",
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
      id: 106,
      name: "Dentacure Herbal Tooth Cleanser",
      category: "FMCG",
      price: "₹96",
      rating: 4.9,
      reviews: 164,
      image: "/images/DentaCure_Toothpaste.png",
      tag: "Dental Care",
      badge: "",
      specifications: {
        weight: "100g",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "WHO GMP Certified",
        expiry: ""
      }
    },
    {
      id: 107,
      name: "Top Dantunn Red Toothpaste",
      category: "FMCG",
      price: "₹135",
      rating: 4.9,
      reviews: 164,
      image: "/images/Dantunn_RedToothpaste.png",
      tag: "Dental Care",
      badge: "",
      specifications: {
        weight: "100g",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "WHO GMP Certified",
        expiry: ""
      }
    },
    {
      id: 108,
      name: "Top Dantunn Green Toothpaste",
      category: "FMCG",
      price: "₹120",
      rating: 4.9,
      reviews: 164,
      image: "/images/Dantunn_GreenToothpaste.png",
      tag: "Dental Care",
      badge: "",
      specifications: {
        weight: "100g",
        dosage: "",
        keyIngredients: "",
        benefits: "",
        certification: "WHO GMP Certified",
        expiry: ""
      }
    },
    {
      id: 109,
      name: "Potentia Antiseptic Hand Wash",
      category: "FMCG",
      price: "₹123",
      rating: 4.9,
      reviews: 164,
      image: "/images/Antiseptic_handwash.png",
      tag: "Home Care",
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
      id: 110,
      name: "Topkleen Powermop Floor Cleaner",
      category: "FMCG",
      price: "₹150",
      rating: 4.9,
      reviews: 164,
      image: "/images/Floor_Cleaner.png",
      tag: "Home Care",
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
      id: 111,
      name: "Topkleen Supermatic Detergent Powder",
      category: "FMCG",
      price: "₹149",
      rating: 4.9,
      reviews: 164,
      image: "/images/Detergent_Powder.png",
      tag: "Home Care",
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
      id: 112,
      name: "Topkleen Ultrashine Dishwash Gel",
      category: "FMCG",
      price: "₹175",
      rating: 4.9,
      reviews: 164,
      image: "/images/Dishwash_Gel.png",
      tag: "Home Care",
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
      id: 113,
      name: "Topkleen Toilet Cleaner",
      category: "FMCG",
      price: "₹255",
      rating: 4.9,
      reviews: 164,
      image: "/images/Toilet_Cleaner.png",
      tag: "Home Care",
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
      id: 114,
      name: "Topkaa Nature Fresh Chai",
      category: "FMCG",
      price: "₹160",
      rating: 4.9,
      reviews: 164,
      image: "/images/Fresh_Chai.png",
      tag: "CPremium Tea",
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
      id: 115,
      name: "Topkaa Instant Coffee",
      category: "FMCG",
      price: "₹213",
      rating: 4.9,
      reviews: 164,
      image: "/images/Coffee.png",
      tag: "Instant Coffee",
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
      name: "Topflora Liquid",
      category: "Agriculture & Veterinary",
      price: "₹1199",
      rating: 4.9,
      reviews: 164,
      image: "/images/Topflora_Liquid.png",
      tag: "Agricultural",
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
      id: 117,
      name: "Topvet Powder",
      category: "Agriculture & Veterinary",
      price: "₹612",
      rating: 4.9,
      reviews: 164,
      image: "/images/Topvet_Powder.png",
      tag: "Veterinary",
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
  const filterTabs = [
    'All',
    'Immunity',
    'Dietary',
    'Haircare',
    'Skincare',
    'Beauty Care',
    'Women',
    'Men',
    'Eyecare',
    'Joint Pain',
    'FMCG',
    'Agriculture & Veterinary',
    'Others'];

  // Filter products by both the selected category and the current search term.
  const filteredProducts = products.filter((product) => {
    const matchesCategory = activeCategory === "All"
      || product.category?.includes(activeCategory);
    const searchableText = [
      product.name,
      product.tag,
      ...(Array.isArray(product.category) ? product.category : [product.category]),
    ].join(' ').toLowerCase();
    const matchesSearch = searchableText.includes(searchQuery.trim().toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleSearch = (event) => {
    event.preventDefault();
  };

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

        {/* Product Search */}
        <form className={`remedies-search-container ${isLoaded ? 'animate-in' : ''}`} onSubmit={handleSearch} style={{ animationDelay: '0.15s' }}>
          <label className="visually-hidden" htmlFor="remedies-search">Search remedies</label>
          <div className="remedies-search-box">
            <i className="bi bi-search remedies-search-icon"></i>
            <input
              id="remedies-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search remedies, benefits, or categories"
            />
            <button type="submit" className="remedies-search-btn" aria-label="Search remedies">
              <i className="bi bi-arrow-right"></i>
            </button>
          </div>
        </form>

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
        <div className="catalog-wrapper animate-in" key={`${activeCategory}-${searchQuery}`} style={{ animationDelay: '0.1s' }}>
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
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
                      <span className="product-category-badge">
                        {Array.isArray(prod.category)
                        ? prod.category.join(", ")
                        : prod.category}
                      </span>
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
                <span className="product-category-badge">
                  {Array.isArray(selectedProduct.category)
                    ? selectedProduct.category.join(", ")
                    : selectedProduct.category}
                </span>
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