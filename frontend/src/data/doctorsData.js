// To unlock doctor, set SHOW_MULTIPLE_DOCTORS to true

export const SHOW_MULTIPLE_DOCTORS = false;

export const DEFAULT_DOCTORS = [
  {
    id: "dr-subham-maity",
    doctorCode: "DR0001",
    doctorName: "Dr. Subham Maity",
    title: "Chief Ayurvedic Physician & Surgeon",
    speciality: "Rheumatology",
    specialityLabel: "Rheumatology (Sandhivata)",
    qualifications: "B.A.M.S. | M.D. (Ayurveda) | Specialist in Ksharasutra & Panchakarma",
    experience: "25+",
    experienceText: "Years Clinical Experience",
    image: "/images/doctor.png",
    bio: "Dr. Shubham Maity, M.D. (Ayurveda), is a senior Ayurvedic physician specializing in Ksharasutra, Sandhivata (Rheumatology), and classical Panchakarma. He offers holistic treatment for chronic joint ailments, digestive disorders, anorectal conditions, and lifestyle diseases, restoring vitality by treating the root cause.",
    timetable: [
      {
        day: "Every 2nd & 4th Monday",
        time: "04:00 PM – 06:30 PM",
        badge: "Healthy Family 🌿",
        icon: "bi-heart"
      },
      {
        day: "Every Wednesday & Friday",
        time: "05:00 PM – 07:30 PM",
        badge: "Specialist OPD",
        icon: "bi-calendar-check"
      }
    ],
    expertise: [
      "Sandhivata & Arthritis",
      "Ksharasutra Therapy",
      "Panchakarma Detox",
      "Digestive Disorders",
      "Chronic Skin Conditions"
    ],
    fee: "₹300"
  },
  {
    id: "dr-priya-sen",
    doctorCode: "DR0002",
    doctorName: "Dr. Priya Sen",
    title: "Senior Ayurvedic Ophthalmologist & Netra Specialist",
    speciality: "Vision",
    specialityLabel: "Vision (Netra Roga)",
    qualifications: "B.A.M.S. | M.S. (Ayurveda - Shalakya Tantra) | Netra Chikitsa Specialist",
    experience: "18+",
    experienceText: "Years Clinical Experience",
    image: "/images/doctor_vision.jpg",
    bio: "Dr. Priya Sen is an accomplished Ayurvedic ophthalmic consultant specializing in Netra Tarpana, natural eyesight rejuvenation, computer vision syndrome, diabetic retinopathy support, and chronic dry eyes through non-invasive Shalakya Tantra protocols.",
    timetable: [
      {
        day: "Every Tuesday & Thursday",
        time: "10:30 AM – 01:30 PM",
        badge: "Vision Clinic",
        icon: "bi-eye"
      },
      {
        day: "Every Saturday",
        time: "03:00 PM – 06:00 PM",
        badge: "Netra Tarpana OPD",
        icon: "bi-sun"
      }
    ],
    expertise: [
      "Netra Tarpana Therapy",
      "Computer Vision Syndrome",
      "Dry Eye & Eye Strain",
      "Myopia & Glaucoma Support",
      "Herbal Eye Rejuvenation"
    ],
    fee: "₹300"
  },
  {
    id: "dr-rajiv-sharma",
    doctorCode: "DR0003",
    doctorName: "Dr. Rajiv Sharma",
    title: "Consultant Neurologist & Shiro-Roga Expert",
    speciality: "Neurology",
    specialityLabel: "Neurology (Vata Vyadhi)",
    qualifications: "B.A.M.S. | M.D. (Ayurveda) | Neuro-Rehab & Vata Specialist",
    experience: "22+",
    experienceText: "Years Clinical Experience",
    image: "/images/doctor_neuro.jpg",
    bio: "Dr. Rajiv Sharma is a respected authority in Ayurvedic neurology, specializing in migraine, insomnia, cervical spondylosis, neuropathies, facial paralysis, and stroke rehabilitation using classical Shirodhara, Nasya, and potent Medhya Rasayana botanicals.",
    timetable: [
      {
        day: "Monday, Wednesday & Friday",
        time: "11:00 AM – 02:00 PM",
        badge: "Neuro Care 🧠",
        icon: "bi-activity"
      },
      {
        day: "Every Sunday",
        time: "10:00 AM – 01:00 PM",
        badge: "Shirodhara Special",
        icon: "bi-moon-stars"
      }
    ],
    expertise: [
      "Chronic Migraine & Headache",
      "Sciatica & Nerve Compression",
      "Insomnia & Anxiety",
      "Shirodhara & Medhya Karma",
      "Stroke Rehabilitation"
    ],
    fee: "₹350"
  },
  {
    id: "dr-debabrata-roy",
    doctorCode: "DR0004",
    doctorName: "Dr. Debabrata Roy",
    title: "Senior Rheumatologist & Spine Care Specialist",
    speciality: "Rheumatology",
    specialityLabel: "Rheumatology (Sandhivata)",
    qualifications: "B.A.M.S. | M.D. (Kayachikitsa) | Fellow in Sandhi-Marma Chikitsa",
    experience: "20+",
    experienceText: "Years Clinical Experience",
    image: "/images/doctor_rheumatology.jpg",
    bio: "Dr. Debabrata Roy focuses on restoring pain-free movement for patients suffering from osteoarthritis, rheumatoid arthritis (Amavata), gout, spine stiffness, and cartilage wear through classical Janu Basti, herbal potli swedana, and Rasayana therapy.",
    timetable: [
      {
        day: "Tuesday, Thursday & Saturday",
        time: "04:30 PM – 07:00 PM",
        badge: "Joint & Spine 🦴",
        icon: "bi-universal-access"
      },
      {
        day: "Every 1st & 3rd Sunday",
        time: "09:30 AM – 12:30 PM",
        badge: "Janu Basti Clinic",
        icon: "bi-heart-pulse"
      }
    ],
    expertise: [
      "Rheumatoid Arthritis (Amavata)",
      "Osteoarthritis & Knee Pain",
      "Janu Basti & Patra Pinda",
      "Cervical & Lumbar Spondylosis",
      "Gout & Uric Acid Balance"
    ],
    fee: "₹300"
  }
];

export const SPECIALITY_OPTIONS = [
  { key: "All", label: "All Doctors", icon: "bi-grid-fill" },
  { key: "Vision", label: "Vision", icon: "bi-eye-fill" },
  { key: "Rheumatology", label: "Rheumatology", icon: "bi-universal-access" },
  { key: "Neurology", label: "Neurology", icon: "bi-activity" }
];
