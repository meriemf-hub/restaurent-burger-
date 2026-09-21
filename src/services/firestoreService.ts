import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  writeBatch,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import {
  Category,
  Product,
  Order,
  OrderStatus,
  OrderProductItem,
  RestaurantSettings,
  UserProfile,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_SETTINGS,
} from '../lib/seedData';

export const CATEGORIES_COL = 'categories';
export const PRODUCTS_COL = 'products';
export const ORDERS_COL = 'orders';
export const SETTINGS_COL = 'restaurantSettings';
export const USERS_COL = 'users';

// Normalize helper for Product from Firestore doc
export function normalizeProduct(id: string, data: any): Product {
  const nom = data.nom || data.name || 'Produit';
  const description = data.description || '';
  const prix = typeof data.prix === 'number' ? data.prix : (typeof data.price === 'number' ? data.price : 0);
  const photoUrl = data.photoUrl || data.image || '';
  const categorieId = data.categorieId || data.categoryId || '';
  const disponible = typeof data.disponible === 'boolean' ? data.disponible : (typeof data.isAvailable === 'boolean' ? data.isAvailable : true);
  const ordre = typeof data.ordre === 'number' ? data.ordre : (typeof data.order === 'number' ? data.order : 99);

  return {
    id,
    nom,
    description,
    prix,
    photoUrl,
    categorieId,
    disponible,
    ordre,
    // Aliases for compatibility
    name: nom,
    price: prix,
    image: photoUrl,
    categoryId: categorieId,
    isAvailable: disponible,
    order: ordre,
    badge: data.badge,
    comboAvailable: data.comboAvailable,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

// Normalize helper for Category from Firestore doc
export function normalizeCategory(id: string, data: any): Category {
  const nom = data.nom || data.name || 'Catégorie';
  const ordre = typeof data.ordre === 'number' ? data.ordre : (typeof data.order === 'number' ? data.order : 99);

  return {
    id,
    nom,
    ordre,
    name: nom,
    order: ordre,
    description: data.description || '',
    iconName: data.iconName || 'lunch_dining',
    isActive: typeof data.isActive === 'boolean' ? data.isActive : true,
    createdAt: data.createdAt,
  };
}

// Normalize helper for Order from Firestore doc
export function normalizeOrder(id: string, data: any): Order {
  const statut = data.statut || data.status || 'Nouvelle';
  const numeroCommande = data.numeroCommande || (data.orderNumber ? `#${data.orderNumber}` : `#SM-${id.slice(-4).toUpperCase()}`);
  const nomClient = data.nomClient || data.customerName || 'Client';
  const telephone = data.telephone || data.customerPhone || '';
  const adresse = data.adresse || data.deliveryAddress || '';
  const commune = data.commune || 'Hydra';
  const modePaiement = data.modePaiement || data.paymentMethod || 'cash à la livraison';
  const total = typeof data.total === 'number' ? data.total : 0;
  const createdAt = data.createdAt || new Date().toISOString();

  const rawItems = Array.isArray(data.items) ? data.items : [];
  const items: OrderProductItem[] = rawItems.map((it: any) => ({
    nom: it.nom || it.productName || 'Article',
    quantite: typeof it.quantite === 'number' ? it.quantite : (typeof it.quantity === 'number' ? it.quantity : 1),
    prix: typeof it.prix === 'number' ? it.prix : (typeof it.price === 'number' ? it.price : 0),
    subtotal: typeof it.subtotal === 'number' ? it.subtotal : (it.prix || it.price || 0) * (it.quantite || it.quantity || 1),
    productId: it.productId,
    isCombo: it.isCombo,
    comboDrink: it.comboDrink,
    productName: it.nom || it.productName,
    quantity: it.quantite || it.quantity,
    price: it.prix || it.price,
  }));

  return {
    id,
    numeroCommande,
    nomClient,
    telephone,
    adresse,
    commune,
    notes: data.notes || '',
    items,
    total,
    deliveryFee: data.deliveryFee,
    subtotal: data.subtotal,
    modePaiement,
    statut,
    createdAt,
    updatedAt: data.updatedAt,
    customerId: data.customerId,
    customerName: nomClient,
    customerPhone: telephone,
    deliveryAddress: adresse,
    paymentMethod: modePaiement,
    status: statut,
  };
}

// --- SEEDING & INITIALIZATION ---

export async function seedDatabaseIfNeeded(): Promise<boolean> {
  try {
    const catSnap = await getDocs(collection(db, CATEGORIES_COL));
    // If empty or if missing the required Smash Burgers category, seed
    let needsSeeding = catSnap.empty;
    if (!needsSeeding) {
      const existingNames = catSnap.docs.map((d) => (d.data().nom || d.data().name || '').toLowerCase());
      if (!existingNames.includes('smash burgers') || !existingNames.includes('tenders')) {
        needsSeeding = true;
      }
    }

    if (!needsSeeding) {
      return false;
    }

    await forceReseedDatabase();
    return true;
  } catch (error: any) {
    console.warn('Notice in seedDatabaseIfNeeded:', error?.message || error);
    return false;
  }
}

export async function forceReseedDatabase(): Promise<void> {
  const batch = writeBatch(db);

  // Seed Categories
  for (const cat of INITIAL_CATEGORIES) {
    const ref = doc(db, CATEGORIES_COL, cat.id);
    batch.set(ref, {
      id: cat.id,
      nom: cat.nom,
      ordre: cat.ordre,
      // helpers
      name: cat.nom,
      order: cat.ordre,
      description: cat.description || '',
      iconName: cat.iconName || 'lunch_dining',
      isActive: true,
      createdAt: new Date().toISOString(),
    });
  }

  // Seed Products
  for (const prod of INITIAL_PRODUCTS) {
    const ref = doc(db, PRODUCTS_COL, prod.id);
    batch.set(ref, {
      id: prod.id,
      nom: prod.nom,
      description: prod.description,
      prix: prod.prix,
      photoUrl: prod.photoUrl,
      categorieId: prod.categorieId,
      disponible: prod.disponible,
      ordre: prod.ordre,
      // helpers
      name: prod.nom,
      price: prod.prix,
      image: prod.photoUrl,
      categoryId: prod.categorieId,
      isAvailable: prod.disponible,
      badge: prod.badge || '',
      comboAvailable: prod.comboAvailable ?? false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // Seed Settings
  const settingsRef = doc(db, SETTINGS_COL, 'general');
  batch.set(settingsRef, INITIAL_SETTINGS);

  await batch.commit();
}

// --- FIREBASE STORAGE ---

export async function uploadProductPhoto(file: File): Promise<string> {
  try {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `products/${Date.now()}_${cleanFileName}`;
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (storageError) {
    console.warn('Direct Firebase Storage upload failed or not enabled, falling back to base64 Data URL:', storageError);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read image file'));
        }
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }
}

// --- CATEGORIES ---

export function onCategoriesSnapshot(
  callback: (categories: Category[]) => void
) {
  const colRef = collection(db, CATEGORIES_COL);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const categories: Category[] = [];
      snapshot.forEach((docSnap) => {
        categories.push(normalizeCategory(docSnap.id, docSnap.data()));
      });
      categories.sort((a, b) => (a.ordre ?? 99) - (b.ordre ?? 99));
      callback(categories.length > 0 ? categories : INITIAL_CATEGORIES);
    },
    (error) => {
      console.warn('Categories subscription fallback to defaults:', error);
      callback(INITIAL_CATEGORIES);
    }
  );
}

export async function createCategory(
  category: { nom: string; ordre?: number; iconName?: string; description?: string }
): Promise<string> {
  const ordre = category.ordre ?? Date.now();
  const docData = {
    nom: category.nom.trim(),
    ordre,
    name: category.nom.trim(),
    order: ordre,
    iconName: category.iconName || 'lunch_dining',
    description: category.description?.trim() || '',
    isActive: true,
    createdAt: new Date().toISOString(),
  };
  const ref = await addDoc(collection(db, CATEGORIES_COL), docData);
  return ref.id;
}

export async function updateCategory(
  id: string,
  category: Partial<Category>
): Promise<void> {
  const ref = doc(db, CATEGORIES_COL, id);
  const updateData: any = { ...category };
  if (category.nom) {
    updateData.name = category.nom;
  }
  if (category.ordre !== undefined) {
    updateData.order = category.ordre;
  }
  await updateDoc(ref, updateData);
}

export async function deleteCategory(id: string): Promise<void> {
  await deleteDoc(doc(db, CATEGORIES_COL, id));
}

// --- PRODUCTS ---

export function onProductsSnapshot(
  callback: (products: Product[]) => void
) {
  const colRef = collection(db, PRODUCTS_COL);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const products: Product[] = [];
      snapshot.forEach((docSnap) => {
        products.push(normalizeProduct(docSnap.id, docSnap.data()));
      });
      products.sort((a, b) => (a.ordre ?? 99) - (b.ordre ?? 99));
      callback(products.length > 0 ? products : INITIAL_PRODUCTS);
    },
    (error) => {
      console.warn('Products subscription fallback to defaults:', error);
      callback(INITIAL_PRODUCTS);
    }
  );
}

export async function createProduct(
  product: {
    nom: string;
    description: string;
    prix: number;
    photoUrl: string;
    categorieId: string;
    disponible?: boolean;
    ordre?: number;
    badge?: string;
  }
): Promise<string> {
  const ordre = product.ordre ?? 10;
  const disponible = product.disponible ?? true;
  const docData = {
    nom: product.nom.trim(),
    description: product.description.trim(),
    prix: Number(product.prix),
    photoUrl: product.photoUrl.trim(),
    categorieId: product.categorieId,
    disponible,
    ordre,
    name: product.nom.trim(),
    price: Number(product.prix),
    image: product.photoUrl.trim(),
    categoryId: product.categorieId,
    isAvailable: disponible,
    badge: product.badge || '',
    comboAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const ref = await addDoc(collection(db, PRODUCTS_COL), docData);
  return ref.id;
}

export async function updateProduct(
  id: string,
  product: Partial<Product>
): Promise<void> {
  const ref = doc(db, PRODUCTS_COL, id);
  const updateData: any = {
    ...product,
    updatedAt: new Date().toISOString(),
  };
  if (product.nom !== undefined) {
    updateData.name = product.nom;
  }
  if (product.prix !== undefined) {
    updateData.price = Number(product.prix);
    updateData.prix = Number(product.prix);
  }
  if (product.photoUrl !== undefined) {
    updateData.image = product.photoUrl;
  }
  if (product.categorieId !== undefined) {
    updateData.categoryId = product.categorieId;
  }
  if (product.disponible !== undefined) {
    updateData.isAvailable = product.disponible;
  }
  if (product.ordre !== undefined) {
    updateData.order = product.ordre;
  }

  await updateDoc(ref, updateData);
}

export async function toggleProductAvailability(
  id: string,
  disponible: boolean
): Promise<void> {
  const ref = doc(db, PRODUCTS_COL, id);
  await updateDoc(ref, {
    disponible,
    isAvailable: disponible,
    updatedAt: new Date().toISOString(),
  });
}

export async function quickUpdateProductPrice(
  id: string,
  prix: number
): Promise<void> {
  const ref = doc(db, PRODUCTS_COL, id);
  await updateDoc(ref, {
    prix: Number(prix),
    price: Number(prix),
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, PRODUCTS_COL, id));
}

// --- RESTAURANT SETTINGS ---

export function onSettingsSnapshot(
  callback: (settings: RestaurantSettings) => void
) {
  const ref = doc(db, SETTINGS_COL, 'general');
  return onSnapshot(
    ref,
    (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as RestaurantSettings);
      } else {
        callback(INITIAL_SETTINGS);
      }
    },
    (error) => {
      console.warn('Settings subscription fallback to default:', error);
      callback(INITIAL_SETTINGS);
    }
  );
}

export async function updateRestaurantSettings(
  settings: Partial<RestaurantSettings>
): Promise<void> {
  const ref = doc(db, SETTINGS_COL, 'general');
  await setDoc(ref, settings, { merge: true });
}

export async function toggleRestaurantOpenStatus(
  isOpen: boolean,
  announcement?: string
): Promise<void> {
  const ref = doc(db, SETTINGS_COL, 'general');
  const updateData: Partial<RestaurantSettings> = {
    isOpen,
    announcement: announcement || (isOpen ? 'Ouvert 7j/7 · Commandes en ligne actives' : 'Fermé · Réouverture demain à 11h30'),
  };
  await setDoc(ref, updateData, { merge: true });
}

// --- ORDERS ---

export interface CreateOrderPayload {
  customerId?: string;
  nomClient: string;
  telephone: string;
  adresse: string;
  commune: string;
  notes?: string;
  items: Array<{
    productId?: string;
    nom?: string;
    quantite?: number;
    quantity?: number;
    prix?: number;
    subtotal?: number;
    isCombo?: boolean;
    comboDrink?: string;
  }>;
  total?: number;
  deliveryFee?: number;
}

export async function createOrder(
  payload: CreateOrderPayload,
  _unusedProducts?: Product[],
  _unusedDeliveryFee?: number,
  idToken?: string
): Promise<{ id: string; numeroCommande: string; total?: number }> {
  // Send ONLY trusted user input to the backend: product IDs, quantities, combo options, and coordinates.
  // Prices, delivery fees, and totals are never trusted from the client.
  const trustedInput = {
    customerId: payload.customerId,
    nomClient: payload.nomClient.trim(),
    telephone: payload.telephone.trim(),
    adresse: payload.adresse.trim(),
    commune: (payload.commune || 'Hydra').trim(),
    notes: (payload.notes || '').trim(),
    items: payload.items.map((it) => ({
      productId: it.productId,
      quantite: Math.max(1, Math.floor(it.quantite || it.quantity || 1)),
      isCombo: Boolean(it.isCombo),
      comboDrink: it.comboDrink || '',
    })),
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (idToken) {
    headers['Authorization'] = `Bearer ${idToken}`;
  }

  const response = await fetch('/api/orders', {
    method: 'POST',
    headers,
    body: JSON.stringify(trustedInput),
  });

  if (!response.ok) {
    let errorMsg = 'Une erreur est survenue lors de la création de votre commande.';
    try {
      const errJson = await response.json();
      if (errJson.error) {
        errorMsg = errJson.error;
      }
    } catch {}
    throw new Error(errorMsg);
  }

  const data = await response.json();
  return {
    id: data.id,
    numeroCommande: data.numeroCommande,
    total: data.total,
  };
}

export function onAdminOrdersSnapshot(callback: (orders: Order[]) => void) {
  const colRef = collection(db, ORDERS_COL);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const orders: Order[] = [];
      snapshot.forEach((docSnap) => {
        orders.push(normalizeOrder(docSnap.id, docSnap.data()));
      });
      // Sort newest first
      orders.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      callback(orders);
    },
    (err) => {
      console.warn('Notice in onAdminOrdersSnapshot:', err.message);
      callback([]);
    }
  );
}

export function onCustomerOrdersSnapshot(
  customerId: string,
  callback: (orders: Order[]) => void
) {
  const colRef = collection(db, ORDERS_COL);
  const q = query(colRef, where('customerId', '==', customerId));
  return onSnapshot(
    q,
    (snapshot) => {
      const orders: Order[] = [];
      snapshot.forEach((docSnap) => {
        orders.push(normalizeOrder(docSnap.id, docSnap.data()));
      });
      orders.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      callback(orders);
    },
    (err) => {
      console.error('Error in onCustomerOrdersSnapshot:', err);
      callback([]);
    }
  );
}

export function onSingleOrderSnapshot(
  orderId: string,
  callback: (order: Order | null) => void
) {
  const ref = doc(db, ORDERS_COL, orderId);
  return onSnapshot(
    ref,
    (docSnap) => {
      if (docSnap.exists()) {
        callback(normalizeOrder(docSnap.id, docSnap.data()));
      } else {
        callback(null);
      }
    },
    (err) => {
      console.error(`Error fetching order ${orderId}:`, err);
      callback(null);
    }
  );
}

export async function updateOrderStatus(
  orderId: string,
  statut: OrderStatus
): Promise<void> {
  const ref = doc(db, ORDERS_COL, orderId);
  await updateDoc(ref, {
    statut,
    status: statut,
    updatedAt: new Date().toISOString(),
  });
}

// --- USER PROFILES ---

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(db, USERS_COL, uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return snap.data() as UserProfile;
  }
  return null;
}

export async function saveUserProfile(
  uid: string,
  data: Partial<UserProfile>
): Promise<void> {
  const ref = doc(db, USERS_COL, uid);
  await setDoc(
    ref,
    {
      uid,
      ...data,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}
