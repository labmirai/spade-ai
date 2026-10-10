// Navigation
export const NAV_LINKS = [
  { name: 'Home',       href: '/'           },
  { name: 'About',      href: '#about'      },
  { name: 'Impact',     href: '#impact'     },
  { name: 'Team',       href: '#team'       },
];

// Team
export const TEAM = [
  {
    name: "Prof. Dr. Md. Alam Hossain",
    role: "Principal Investigator",
    credential: "Professor, PhD",
    affiliation: "Department of Computer Science and Engineering, Jashore University of Science and Technology",
    focus: "",
    image: "",
    email: "pi.spade.ai@gmail.com",
    links: [] as { label: string; href: string }[],
  },
  {
    name: "Dr. A F M Shahab Uddin",
    role: "Co-Principal Investigator",
    credential: "PhD",
    affiliation: "Department of Computer Science and Engineering, Jashore University of Science and Technology",
    focus: "Deep learning, data augmentation, image restoration, image quality assessment",
    image: "",
    email: "copi.spade.ai@gmail.com",
    links: [] as { label: string; href: string }[],
  },
  {
    name: "Dr. Md. Mamun-Or-Rashid",
    role: "Co-Principal Investigator",
    credential: "Professor",
    affiliation: "Department of Computer Science and Engineering, University of Dhaka",
    focus: "Sensor networks, IoT",
    image: "/team/mamun.jpg",
    email: "",
    links: [
      { label: "Faculty profile", href: "https://www.du.ac.bd/faculty/faculty_details/CSE/1769" },
      { label: "Google Scholar", href: "https://scholar.google.com/citations?user=OUanlWAAAAAJ&hl=en" },
    ],
  },
  {
    name: "Abdullah Ibne Hanif Arean",
    role: "Consultant",
    credential: "MSc student",
    affiliation: "Department of Computer Science and Engineering, University of Dhaka",
    focus: "",
    image: "/team/arean.jpg",
    email: "",
    links: [
      { label: "Website", href: "https://abdullaharean.com/" },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/abdullaharean" },
    ],
  },
  {
    name: "Md. Emon Khan",
    role: "Research Assistant",
    credential: "MSc student",
    affiliation: "Department of Computer Science and Engineering, University of Dhaka",
    focus: "",
    image: "/team/emon.jpg",
    email: "",
    links: [
      { label: "GitHub", href: "https://github.com/ignite312" },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/sajjademon/" },
    ],
  },
  {
    name: "Asfin Jannat Shamsi",
    role: "Research Assistant",
    credential: "MSc student",
    affiliation: "Department of Computer Science and Engineering, University of Dhaka",
    focus: "",
    image: "/team/shamsi.png",
    email: "",
    links: [
      { label: "LinkedIn", href: "https://www.linkedin.com/in/asfinjannatshamsi" },
    ],
  },
];

// Impact - ICSETEP
export const ICSETEP_OBJECTIVES = [
  { label: "Promoting Interdisciplinary and Industry-Relevant Research (Objective 7)" },
  { label: "Expanding and Modernizing CSE/IT Education (Objective 2)" },
  { label: "Strengthening Faculty Research and Innovation Capacity (Objective 5)" },
  { label: "Enhancing Socio-Economic Impact through Digital Transformation (Objectives 1 & 7)" },
  { label: "Encouraging Female and Youth Participation in Applied Research (Objective 3)" },
];

// Impact - National Policies
export const NATIONAL_POLICIES = [
  { label: "National Agriculture Policy (2018)" },
  { label: "National ICT Policy (2018)" },
  { label: "Bangladesh Delta Plan 2100" },
  { label: "Vision 2041 and Smart Bangladesh" },
];

// Impact - SDGs
export const SDG_GOALS = [
  { logo: "/sdgs/E_WEB_02.png", title: "Zero Hunger",              description: "Enhances food security through optimized crop selection and increased agricultural productivity." },
  { logo: "/sdgs/E_WEB_09.png", title: "Industry & Innovation",    description: "Establishes an AI-based agricultural intelligence platform accessible to farmers nationwide." },
  { logo: "/sdgs/E_WEB_12.png", title: "Responsible Consumption",  description: "Encourages sustainable use of soil and water resources through data-driven crop recommendations." },
  { logo: "/sdgs/E_WEB_13.png", title: "Climate Action",           description: "Supports adaptation to climate variability through region-specific, soil-aware crop guidance." },
  { logo: "/sdgs/E_WEB_15.png", title: "Life on Land",             description: "Promotes soil conservation and reduces degradation by encouraging rotational cropping aligned with soil health." },
];

// Footer - Contact emails
export const FOOTER_CONTACTS = [
  { label: "PI",    email: "pi.spade.ai@gmail.com"   },
  { label: "Co-PI", email: "copi.spade.ai@gmail.com" },
];

// Footer - Logos
export const FOOTER_LOGOS = [
  { src: "/logos/adb.png",     alt: "Asian Development Bank"                },
  { src: "/logos/ugc.png",     alt: "University Grants Commission Bangladesh" },
  { src: "/logos/icsetep.png", alt: "ICSETEP"                               },
];

// Footer - Quick Links
export const FOOTER_LINKS = [
  { label: "About",  href: "#about"  },
  { label: "Impact", href: "#impact" },
  { label: "Team",   href: "#team"   },
];
