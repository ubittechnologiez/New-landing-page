import {
  db,
  collection,
  doc,
  setDoc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "./firebase";

export interface FirestoreQuote {
  id?: string;
  clientName: string;
  company: string;
  email: string;
  phone?: string;
  category: string;
  notes?: string;
  status: "new" | "reviewing" | "contacted" | "completed" | "archived";
  createdAt?: any;
}

export interface FirestoreGalleryItem {
  id?: string;
  url: string;
  title?: string;
  description?: string;
  category?: string;
  client?: string;
  altText?: string;
  featured?: boolean;
  position: number;
  createdAt?: any;
}

export interface FirestoreClientLogo {
  id?: string;
  name: string;
  logoUrl: string;
  position: number;
  website?: string;
  isActive?: boolean;
  industry?: string;
  scale?: number; // Visual scale multiplier, e.g., 0.6 to 1.8 (default 1.0 = 100%)
  createdAt?: any;
  updatedAt?: any;
}

export interface FirestoreBannerSettings {
  logoHeight?: number; // Base height in px (e.g., 36, 48, 60, 72)
  globalScale?: number; // Global scale percentage (e.g. 100)
  speed?: "slow" | "normal" | "fast";
  gap?: number; // px gap between items (e.g., 24, 32, 48, 64)
  updatedAt?: any;
}

export interface FirestoreUser {
  id?: string;
  uid?: string;
  email: string;
  name: string;
  role: "super_admin" | "admin" | "sales_lead" | "content_editor";
  status: "active" | "suspended" | "pending";
  department?: string;
  phone?: string;
  lastLogin?: any;
  createdAt?: any;
  permissions?: string[];
}

// ---------------- User Management Services ---------------- //

export const INITIAL_ADMIN_USERS: Omit<FirestoreUser, "id">[] = [
  {
    email: "ubittechnologiez@gmail.com",
    name: "Master Administrator",
    role: "super_admin",
    status: "active",
    department: "Executive Management",
    phone: "+91 94443 85999",
    permissions: ["all_access", "manage_gallery", "manage_users", "manage_quotes", "manage_settings"],
  },
  {
    email: "md@ubittechnologiez.com",
    name: "Managing Director",
    role: "super_admin",
    status: "active",
    department: "Executive Board",
    phone: "+91 94443 85999",
    permissions: ["all_access", "manage_gallery", "manage_users", "manage_quotes", "manage_settings"],
  },
  {
    email: "admin@ubittechnologiez.com",
    name: "IT Infrastructure Lead",
    role: "admin",
    status: "active",
    department: "Enterprise Solutions",
    phone: "+91 94443 85999",
    permissions: ["manage_gallery", "manage_quotes", "view_users"],
  },
  {
    email: "sales@ubittechnologiez.com",
    name: "Enterprise Sales Desk",
    role: "sales_lead",
    status: "active",
    department: "B2B Sales & Procurement",
    phone: "+91 94443 85999",
    permissions: ["manage_quotes", "view_gallery"],
  },
];

export function subscribeToUsers(
  onUpdate: (users: FirestoreUser[]) => void,
  onError?: (err: Error) => void,
) {
  const usersRef = collection(db, "users");
  const q = query(usersRef, orderBy("createdAt", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        // If empty in Firestore, return initial list with fallback IDs
        const seeded: FirestoreUser[] = INITIAL_ADMIN_USERS.map((u, i) => ({
          id: `seeded-user-${i}`,
          ...u,
          createdAt: { seconds: Math.floor(Date.now() / 1000) - i * 86400 },
        }));
        onUpdate(seeded);
        return;
      }
      const items: FirestoreUser[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<FirestoreUser, "id">),
      }));
      onUpdate(items);
    },
    (err) => {
      console.warn("Users subscription warning:", err.message);
      // Return initial roster on error
      const seeded: FirestoreUser[] = INITIAL_ADMIN_USERS.map((u, i) => ({
        id: `seeded-user-${i}`,
        ...u,
        createdAt: { seconds: Math.floor(Date.now() / 1000) - i * 86400 },
      }));
      onUpdate(seeded);
      if (onError) onError(err);
    },
  );
}

export async function addUserToFirestore(user: Omit<FirestoreUser, "id" | "createdAt">) {
  const usersRef = collection(db, "users");
  const docRef = await addDoc(usersRef, {
    ...user,
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateUserInFirestore(
  userId: string,
  updates: Partial<FirestoreUser>,
) {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteUserFromFirestore(userId: string) {
  const userRef = doc(db, "users", userId);
  await deleteDoc(userRef);
}

// ---------------- Quote Services ---------------- //

export async function submitQuoteToFirestore(data: {
  clientName: string;
  company: string;
  email: string;
  phone?: string;
  category: string;
  notes?: string;
}) {
  try {
    const quotesRef = collection(db, "quotes");
    const docRef = await addDoc(quotesRef, {
      ...data,
      status: "new",
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error submitting quote to Firestore:", error);
    throw error;
  }
}

export function subscribeToQuotes(
  onUpdate: (quotes: FirestoreQuote[]) => void,
  onError?: (err: Error) => void,
) {
  const quotesRef = collection(db, "quotes");
  const q = query(quotesRef, orderBy("createdAt", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: FirestoreQuote[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<FirestoreQuote, "id">),
      }));
      onUpdate(items);
    },
    (err) => {
      console.warn("Quotes subscription warning:", err.message);
      if (onError) onError(err);
    },
  );
}

export async function updateQuoteStatusInFirestore(
  quoteId: string,
  status: FirestoreQuote["status"],
) {
  const quoteRef = doc(db, "quotes", quoteId);
  await updateDoc(quoteRef, { status, updatedAt: serverTimestamp() });
}

export async function deleteQuoteFromFirestore(quoteId: string) {
  const quoteRef = doc(db, "quotes", quoteId);
  await deleteDoc(quoteRef);
}

// ---------------- Gallery Services ---------------- //

export async function addGalleryItemToFirestore(item: {
  url: string;
  title?: string;
  description?: string;
  category?: string;
  client?: string;
  altText?: string;
  featured?: boolean;
  position: number;
}) {
  const galleryRef = collection(db, "gallery");
  const docRef = await addDoc(galleryRef, {
    ...item,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateGalleryItemInFirestore(
  id: string,
  updates: Partial<FirestoreGalleryItem>,
) {
  const itemRef = doc(db, "gallery", id);
  await updateDoc(itemRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteGalleryItemFromFirestore(id: string) {
  const itemRef = doc(db, "gallery", id);
  await deleteDoc(itemRef);
}

export const INITIAL_SHOWCASE_DATA = [
  {
    url: "https://www.ubittechnologiez.com/images/hero-banner.png",
    title: "Enterprise Server Infrastructure",
    category: "Server Solutions",
    description: "High-density rackmount computing clusters and SAN storage deployed for high-availability workloads.",
    client: "FinTech Data Center",
    altText: "Enterprise server racks in a secure tier-3 data center",
    featured: true,
    position: 0,
  },
  {
    url: "https://www.ubittechnologiez.com/images/server-solutions.png",
    title: "High-Density Blade Servers",
    category: "Server Solutions",
    description: "Custom thermal-optimized compute nodes for intensive virtualization and database clusters.",
    client: "Healthcare Cloud Node",
    altText: "High density enterprise blade servers",
    featured: true,
    position: 1,
  },
  {
    url: "https://www.ubittechnologiez.com/images/firewall-security.png",
    title: "Next-Gen Fortinet & Cisco Security",
    category: "Cybersecurity",
    description: "Multi-gigabit hardware firewalls, unified threat management, and automated zero-trust perimeter defenses.",
    client: "Regional Banking Group",
    altText: "Enterprise hardware firewalls with active security monitoring",
    featured: true,
    position: 2,
  },
  {
    url: "https://www.ubittechnologiez.com/images/networking-infra.png",
    title: "100GbE Core Optical Switching",
    category: "Networking",
    description: "Redundant spine-and-leaf network fabrics ensuring microsecond latency and zero packet loss.",
    client: "Telecommunications Hub",
    altText: "Fiber optic patch cables and high speed switches",
    featured: false,
    position: 3,
  },
  {
    url: "https://www.ubittechnologiez.com/images/nas-storage.png",
    title: "Enterprise All-Flash & Hybrid NAS",
    category: "Storage",
    description: "Scalable petabyte-scale network attached storage arrays with automated snapshots and off-site backup.",
    client: "Media & Broadcast Studio",
    altText: "All-flash enterprise NAS rack unit",
    featured: false,
    position: 4,
  },
  {
    url: "https://www.ubittechnologiez.com/images/workstation.png",
    title: "Mission-Critical AI Workstations",
    category: "Workstations",
    description: "GPU-accelerated desktop towers for engineering simulation, 3D CAD modeling, and deep learning.",
    client: "Engineering Design Firm",
    altText: "High performance workstation with dual GPU cooling",
    featured: false,
    position: 5,
  },
  {
    url: "https://www.ubittechnologiez.com/images/endpoints-laptops.png",
    title: "Enterprise Fleet Deployment",
    category: "Endpoints",
    description: "Zero-touch configured corporate mobile laptops equipped with endpoint detection and BitLocker encryption.",
    client: "Logistics Enterprise",
    altText: "Corporate laptop fleet rollout",
    featured: false,
    position: 6,
  },
];

export const INITIAL_QUOTES_DATA = [
  {
    clientName: "Infrastructure Operations Team",
    company: "Apex Global Logistics",
    email: "procurement@apexlogistics.com",
    phone: "+1 (555) 234-8900",
    category: "Server Solutions",
    notes: "Requires high-density 2U Dell PowerEdge compute cluster with redundant 100GbE NICs and SAN fiber channel storage.",
    status: "new" as const,
  },
  {
    clientName: "Cybersecurity Director",
    company: "Metro Financial Systems",
    email: "security-team@metrofinance.org",
    phone: "+1 (555) 876-5432",
    category: "Cybersecurity",
    notes: "Seeking FortiGate 200F redundant HA cluster with unified threat protection and 3-year enterprise support license.",
    status: "reviewing" as const,
  },
];

/**
 * Seeds initial gallery items and starter quote records into Firestore
 */
export async function seedFirestoreInitialData(force: boolean = false): Promise<{
  galleryAdded: number;
  quotesAdded: number;
  usersAdded: number;
  message: string;
}> {
  try {
    const galleryRef = collection(db, "gallery");
    const quotesRef = collection(db, "quotes");

    const existingGallery = await getDocs(galleryRef);
    let galleryAdded = 0;

    if (existingGallery.empty || force) {
      for (const item of INITIAL_SHOWCASE_DATA) {
        await addDoc(galleryRef, {
          ...item,
          createdAt: serverTimestamp(),
        });
        galleryAdded++;
      }
    }

    const existingQuotes = await getDocs(quotesRef);
    let quotesAdded = 0;

    if (existingQuotes.empty || force) {
      for (const quote of INITIAL_QUOTES_DATA) {
        await addDoc(quotesRef, {
          ...quote,
          createdAt: serverTimestamp(),
        });
        quotesAdded++;
      }
    }

    const usersRef = collection(db, "users");
    const existingUsers = await getDocs(usersRef);
    let usersAdded = 0;

    if (existingUsers.empty || force) {
      for (const user of INITIAL_ADMIN_USERS) {
        await addDoc(usersRef, {
          ...user,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        });
        usersAdded++;
      }
    }

    return {
      galleryAdded,
      quotesAdded,
      usersAdded,
      message: `Seeded ${galleryAdded} showcase items, ${quotesAdded} quotes, and ${usersAdded} users into Firestore!`,
    };
  } catch (error: any) {
    console.error("Firestore seeding error:", error);
    throw new Error(error?.message || "Failed to seed Firestore data");
  }
}

/**
 * Check counts in Firestore
 */
export async function getFirestoreStats(): Promise<{
  galleryCount: number;
  quotesCount: number;
  usersCount: number;
  clientsCount: number;
}> {
  try {
    const gallerySnap = await getDocs(collection(db, "gallery"));
    const quotesSnap = await getDocs(collection(db, "quotes"));
    const usersSnap = await getDocs(collection(db, "users"));
    const clientsSnap = await getDocs(collection(db, "clients"));
    return {
      galleryCount: gallerySnap.size,
      quotesCount: quotesSnap.size,
      usersCount: usersSnap.size || INITIAL_ADMIN_USERS.length,
      clientsCount: clientsSnap.size || INITIAL_CLIENTS_DATA.length,
    };
  } catch (e) {
    console.warn("Could not retrieve Firestore stats:", e);
    return {
      galleryCount: 0,
      quotesCount: 0,
      usersCount: INITIAL_ADMIN_USERS.length,
      clientsCount: INITIAL_CLIENTS_DATA.length,
    };
  }
}

export function subscribeToGallery(
  onUpdate: (items: FirestoreGalleryItem[]) => void,
  onError?: (err: Error) => void,
) {
  const galleryRef = collection(db, "gallery");
  const q = query(galleryRef, orderBy("position", "asc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: FirestoreGalleryItem[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<FirestoreGalleryItem, "id">),
      }));
      onUpdate(items);
    },
    (err) => {
      console.warn("Gallery Firestore subscription note:", err.message);
      if (onError) onError(err);
    },
  );
}

// ---------------- Client Logos Services ---------------- //

function makeRawBrandLogo(brand: string): string {
  let innerContent = "";
  let width = 200;
  const height = 60;

  switch (brand) {
    case "tcs":
      width = 170;
      innerContent = `
        <g transform="translate(10, 10)">
          <!-- Tata Swirl Ring -->
          <circle cx="20" cy="20" r="18" fill="none" stroke="#38bdf8" stroke-width="3" stroke-dasharray="80 15"/>
          <path d="M12 24 C14 14, 26 14, 28 24" fill="none" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round"/>
          <circle cx="20" cy="17" r="3.5" fill="#38bdf8"/>
          <!-- TCS Wordmark -->
          <text x="50" y="27" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="24" letter-spacing="1.5">TCS</text>
        </g>
      `;
      break;

    case "infosys":
      width = 190;
      innerContent = `
        <g transform="translate(10, 12)">
          <text x="5" y="26" fill="#007cc3" font-family="'Segoe UI', Roboto, Helvetica, sans-serif" font-weight="700" font-size="28" letter-spacing="-0.5">Infosys</text>
          <circle cx="118" cy="10" r="3.5" fill="#38bdf8"/>
        </g>
      `;
      break;

    case "apollo":
      width = 200;
      innerContent = `
        <g transform="translate(10, 10)">
          <!-- Apollo Sun & Medical Flame -->
          <path d="M18 6 L24 16 L34 16 L26 23 L29 33 L20 27 L11 33 L14 23 L6 16 L16 16 Z" fill="#ef4444"/>
          <circle cx="20" cy="20" r="6" fill="#fbbf24"/>
          <!-- Wordmark -->
          <text x="44" y="26" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="22" letter-spacing="0.5">Apollo</text>
        </g>
      `;
      break;

    case "titan":
      width = 180;
      innerContent = `
        <g transform="translate(10, 12)">
          <path d="M8 6 H30 M19 6 V32" stroke="#eab308" stroke-width="3.5" stroke-linecap="square"/>
          <circle cx="19" cy="19" r="15" fill="none" stroke="#ca8a04" stroke-width="1.5" stroke-opacity="0.6"/>
          <text x="44" y="26" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="22" letter-spacing="3">TITAN</text>
        </g>
      `;
      break;

    case "sundaram":
      width = 210;
      innerContent = `
        <g transform="translate(10, 12)">
          <polygon points="18,6 28,12 28,26 18,32 8,26 8,12" fill="none" stroke="#3b82f6" stroke-width="3"/>
          <circle cx="18" cy="19" r="4" fill="#60a5fa"/>
          <text x="38" y="25" fill="#f8fafc" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="18" letter-spacing="1">SUNDARAM</text>
        </g>
      `;
      break;

    case "lt":
      width = 170;
      innerContent = `
        <g transform="translate(10, 10)">
          <circle cx="20" cy="20" r="18" fill="#eab308"/>
          <text x="10" y="27" fill="#0f172a" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="20">L&amp;T</text>
          <text x="48" y="26" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="21" letter-spacing="1">L&amp;T</text>
        </g>
      `;
      break;

    case "ramco":
      width = 180;
      innerContent = `
        <g transform="translate(10, 12)">
          <path d="M6 28 L14 10 L22 28 L18 28 L14 18 L10 28 Z" fill="#ef4444"/>
          <circle cx="14" cy="7" r="3" fill="#f87171"/>
          <text x="30" y="26" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="22" letter-spacing="1">ramco</text>
        </g>
      `;
      break;

    case "tvs":
      width = 180;
      innerContent = `
        <g transform="translate(10, 10)">
          <polygon points="6,24 16,8 24,14 18,30" fill="#38bdf8"/>
          <polygon points="18,30 26,16 34,22 28,34" fill="#ef4444"/>
          <text x="42" y="26" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="24" font-style="italic" letter-spacing="2">TVS</text>
        </g>
      `;
      break;

    case "ashok":
      width = 230;
      innerContent = `
        <g transform="translate(10, 12)">
          <circle cx="16" cy="18" r="14" fill="none" stroke="#10b981" stroke-width="2.5"/>
          <path d="M8 18 H24 M16 10 V26 M10 12 L22 24 M10 24 L22 12" stroke="#10b981" stroke-width="1.5"/>
          <text x="38" y="25" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="17" letter-spacing="1">ASHOK LEYLAND</text>
        </g>
      `;
      break;

    case "zoho":
      width = 180;
      innerContent = `
        <g transform="translate(10, 12)">
          <!-- 4 Zoho Colorful Blocks -->
          <rect x="4" y="6" width="11" height="11" rx="2" fill="#ef4444"/>
          <rect x="17" y="6" width="11" height="11" rx="2" fill="#22c55e"/>
          <rect x="4" y="19" width="11" height="11" rx="2" fill="#3b82f6"/>
          <rect x="17" y="19" width="11" height="11" rx="2" fill="#eab308"/>
          <text x="36" y="26" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="24" letter-spacing="2">ZOHO</text>
        </g>
      `;
      break;

    case "hcl":
      width = 180;
      innerContent = `
        <g transform="translate(10, 12)">
          <path d="M8 8 V28 M8 18 H20 M20 8 V28" stroke="#818cf8" stroke-width="4" stroke-linecap="round"/>
          <text x="32" y="26" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="24" letter-spacing="1">HCL<tspan fill="#818cf8">Tech</tspan></text>
        </g>
      `;
      break;

    case "wipro":
      width = 190;
      innerContent = `
        <g transform="translate(10, 12)">
          <!-- Multi-color concentric sunburst -->
          <circle cx="16" cy="18" r="4" fill="#eab308"/>
          <circle cx="16" cy="8" r="2.5" fill="#ef4444"/>
          <circle cx="24" cy="12" r="2.5" fill="#ec4899"/>
          <circle cx="26" cy="20" r="2.5" fill="#8b5cf6"/>
          <circle cx="22" cy="26" r="2.5" fill="#3b82f6"/>
          <circle cx="14" cy="28" r="2.5" fill="#06b6d4"/>
          <circle cx="7" cy="23" r="2.5" fill="#10b981"/>
          <circle cx="7" cy="14" r="2.5" fill="#84cc16"/>
          <text x="38" y="25" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="22" letter-spacing="0.5">wipro</text>
        </g>
      `;
      break;

    default:
      width = 180;
      innerContent = `
        <g transform="translate(10, 12)">
          <circle cx="16" cy="18" r="12" fill="#38bdf8"/>
          <text x="36" y="25" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="20">${brand.toUpperCase()}</text>
        </g>
      `;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    ${innerContent}
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const INITIAL_CLIENTS_DATA: Omit<FirestoreClientLogo, "id">[] = [
  {
    name: "Tata Consultancy Services",
    logoUrl: makeRawBrandLogo("tcs"),
    position: 1,
    industry: "Enterprise IT & Consulting",
    isActive: true,
    website: "https://www.tcs.com",
  },
  {
    name: "Infosys",
    logoUrl: makeRawBrandLogo("infosys"),
    position: 2,
    industry: "Global Cloud & Systems",
    isActive: true,
    website: "https://www.infosys.com",
  },
  {
    name: "Apollo Hospitals",
    logoUrl: makeRawBrandLogo("apollo"),
    position: 3,
    industry: "Healthcare & Life Sciences",
    isActive: true,
    website: "https://www.apollohospitals.com",
  },
  {
    name: "Titan Company",
    logoUrl: makeRawBrandLogo("titan"),
    position: 4,
    industry: "Consumer & Precision Eng",
    isActive: true,
    website: "https://www.titancompany.in",
  },
  {
    name: "Sundaram Fasteners",
    logoUrl: makeRawBrandLogo("sundaram"),
    position: 5,
    industry: "Automotive Precision Mfg",
    isActive: true,
    website: "https://www.sundaramfasteners.com",
  },
  {
    name: "Larsen & Toubro",
    logoUrl: makeRawBrandLogo("lt"),
    position: 6,
    industry: "Infrastructure & Heavy Tech",
    isActive: true,
    website: "https://www.ltts.com",
  },
  {
    name: "Ramco Systems",
    logoUrl: makeRawBrandLogo("ramco"),
    position: 7,
    industry: "ERP & Aviation Systems",
    isActive: true,
    website: "https://www.ramco.com",
  },
  {
    name: "TVS Motor Company",
    logoUrl: makeRawBrandLogo("tvs"),
    position: 8,
    industry: "Automotive & Manufacturing",
    isActive: true,
    website: "https://www.tvsmotor.com",
  },
  {
    name: "Ashok Leyland",
    logoUrl: makeRawBrandLogo("ashok"),
    position: 9,
    industry: "Commercial Vehicles & Logistics",
    isActive: true,
    website: "https://www.ashokleyland.com",
  },
  {
    name: "Zoho Corporation",
    logoUrl: makeRawBrandLogo("zoho"),
    position: 10,
    industry: "Enterprise Cloud Software",
    isActive: true,
    website: "https://www.zoho.com",
  },
  {
    name: "HCLTech",
    logoUrl: makeRawBrandLogo("hcl"),
    position: 11,
    industry: "Digital & Engineering",
    isActive: true,
    website: "https://www.hcltech.com",
  },
  {
    name: "Wipro",
    logoUrl: makeRawBrandLogo("wipro"),
    position: 12,
    industry: "IT & Global Innovation",
    isActive: true,
    website: "https://www.wipro.com",
  },
];

export function subscribeToClients(
  onUpdate: (clients: FirestoreClientLogo[]) => void,
  onError?: (err: Error) => void,
) {
  const clientsRef = collection(db, "clients");
  const q = query(clientsRef, orderBy("position", "asc"));

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        // Provide seeded initial clients
        const fallback: FirestoreClientLogo[] = INITIAL_CLIENTS_DATA.map((c, i) => ({
          id: `initial-client-${i + 1}`,
          ...c,
        }));
        onUpdate(fallback);
        return;
      }
      const items: FirestoreClientLogo[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<FirestoreClientLogo, "id">),
      }));
      onUpdate(items);
    },
    (err) => {
      console.warn("Clients Firestore subscription note:", err.message);
      const fallback: FirestoreClientLogo[] = INITIAL_CLIENTS_DATA.map((c, i) => ({
        id: `initial-client-${i + 1}`,
        ...c,
      }));
      onUpdate(fallback);
      if (onError) onError(err);
    },
  );
}

export async function addClientLogoToFirestore(client: {
  name: string;
  logoUrl: string;
  position?: number;
  website?: string;
  isActive?: boolean;
  industry?: string;
  scale?: number;
}) {
  const clientsRef = collection(db, "clients");
  
  // Calculate next position if not specified
  let targetPosition = client.position;
  if (targetPosition === undefined || targetPosition === null) {
    try {
      const snap = await getDocs(clientsRef);
      targetPosition = snap.size + 1;
    } catch {
      targetPosition = 1;
    }
  }

  const docRef = await addDoc(clientsRef, {
    ...client,
    scale: client.scale ?? 1,
    position: targetPosition,
    isActive: client.isActive ?? true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateClientLogoInFirestore(
  id: string,
  updates: Partial<FirestoreClientLogo>,
) {
  const docRef = doc(db, "clients", id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteClientLogoFromFirestore(id: string) {
  const docRef = doc(db, "clients", id);
  await deleteDoc(docRef);
}

export async function reorderClientLogosInFirestore(
  orderedItems: { id: string; position: number }[],
) {
  for (const item of orderedItems) {
    if (item.id && !item.id.startsWith("initial-client-")) {
      const docRef = doc(db, "clients", item.id);
      await updateDoc(docRef, {
        position: item.position,
        updatedAt: serverTimestamp(),
      });
    }
  }
}

// ---------------- Global Banner Settings Services ---------------- //

export const BANNER_SETTINGS_STORAGE_KEY = "ubit_clients_banner_settings";

export const DEFAULT_BANNER_SETTINGS: FirestoreBannerSettings = {
  logoHeight: 48,
  globalScale: 100,
  speed: "normal",
  gap: 32,
};

export function getCachedBannerSettings(): FirestoreBannerSettings {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(BANNER_SETTINGS_STORAGE_KEY) : null;
    if (raw) {
      return {
        ...DEFAULT_BANNER_SETTINGS,
        ...JSON.parse(raw),
      };
    }
  } catch (err) {
    console.debug("Cached banner settings parse fallback:", err);
  }
  return DEFAULT_BANNER_SETTINGS;
}

export function subscribeToBannerSettings(
  onUpdate: (settings: FirestoreBannerSettings) => void,
  onError?: (err: Error) => void,
) {
  // 1. Immediately emit cached settings if present
  const initial = getCachedBannerSettings();
  onUpdate(initial);

  // 2. Listen to custom window event for zero-latency local updates
  const handleLocalUpdate = (e: any) => {
    if (e.detail) {
      onUpdate({
        ...DEFAULT_BANNER_SETTINGS,
        ...e.detail,
      });
    }
  };
  if (typeof window !== "undefined") {
    window.addEventListener("ubit_banner_settings_updated", handleLocalUpdate);
  }

  // 3. Listen to Firestore real-time snapshot
  const settingsDoc = doc(db, "settings", "clients_banner");

  const unsubscribe = onSnapshot(
    settingsDoc,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as FirestoreBannerSettings;
        const merged: FirestoreBannerSettings = {
          ...DEFAULT_BANNER_SETTINGS,
          ...data,
        };
        try {
          localStorage.setItem(BANNER_SETTINGS_STORAGE_KEY, JSON.stringify(merged));
        } catch (err) {
          console.debug("Failed to cache banner settings:", err);
        }
        onUpdate(merged);
      } else {
        onUpdate(DEFAULT_BANNER_SETTINGS);
      }
    },
    (err) => {
      console.warn("Banner settings subscription note:", err.message);
      onUpdate(getCachedBannerSettings());
      if (onError) onError(err);
    },
  );

  return () => {
    if (typeof window !== "undefined") {
      window.removeEventListener("ubit_banner_settings_updated", handleLocalUpdate);
    }
    unsubscribe();
  };
}

export async function updateBannerSettingsInFirestore(
  settings: Partial<FirestoreBannerSettings>,
) {
  const current = getCachedBannerSettings();
  const merged: FirestoreBannerSettings = {
    ...current,
    ...settings,
  };

  // 1. Instantly update localStorage and broadcast locally
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(BANNER_SETTINGS_STORAGE_KEY, JSON.stringify(merged));
      window.dispatchEvent(
        new CustomEvent("ubit_banner_settings_updated", { detail: merged })
      );
    } catch (err) {
      console.debug("Failed to broadcast local banner update:", err);
    }
  }

  // 2. Persist to Firestore
  const settingsDoc = doc(db, "settings", "clients_banner");
  await setDoc(
    settingsDoc,
    {
      ...merged,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
