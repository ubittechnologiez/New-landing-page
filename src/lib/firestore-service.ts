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
}> {
  try {
    const gallerySnap = await getDocs(collection(db, "gallery"));
    const quotesSnap = await getDocs(collection(db, "quotes"));
    const usersSnap = await getDocs(collection(db, "users"));
    return {
      galleryCount: gallerySnap.size,
      quotesCount: quotesSnap.size,
      usersCount: usersSnap.size || INITIAL_ADMIN_USERS.length,
    };
  } catch (e) {
    console.warn("Could not retrieve Firestore stats:", e);
    return { galleryCount: 0, quotesCount: 0, usersCount: INITIAL_ADMIN_USERS.length };
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
