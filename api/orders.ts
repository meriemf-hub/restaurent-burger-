import type { IncomingMessage, ServerResponse } from 'http';
import fs from 'fs';
import path from 'path';
import { initializeApp as initClientApp } from 'firebase/app';
import {
  getFirestore as getClientFirestore,
  doc,
  getDoc,
} from 'firebase/firestore';
import {
  initializeApp as initAdminApp,
  cert,
  applicationDefault,
  getApps as getAdminApps,
  type App as AdminApp,
} from 'firebase-admin/app';
import {
  getFirestore as getAdminFirestore,
  type Firestore as AdminFirestore,
} from 'firebase-admin/firestore';

let firebaseConfig: any = null;
try {
  const configFile = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configFile)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));
  }
} catch (e) {
  // Ignored
}

if (!firebaseConfig) {
  firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
    firestoreDatabaseId: process.env.VITE_FIREBASE_DATABASE_ID || '(default)',
  };
}

const clientApp = initClientApp(firebaseConfig);
const firestoreDb = getClientFirestore(clientApp, firebaseConfig.firestoreDatabaseId);

let adminApp: AdminApp | null = null;
let adminDb: AdminFirestore | null = null;

function getAdminDatabase(): AdminFirestore | null {
  if (adminDb) return adminDb;

  let credential: any = null;

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const sa = typeof process.env.FIREBASE_SERVICE_ACCOUNT === 'string'
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
        : process.env.FIREBASE_SERVICE_ACCOUNT;
      credential = cert(sa);
    } catch (err) {
      console.error('[Admin SDK] Failed to parse FIREBASE_SERVICE_ACCOUNT:', err);
    }
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      credential = applicationDefault();
    } catch (err) {
      console.error('[Admin SDK] Failed to load GOOGLE_APPLICATION_CREDENTIALS:', err);
    }
  }

  if (credential) {
    try {
      const existingApps = getAdminApps();
      adminApp = existingApps.length > 0
        ? existingApps[0]!
        : initAdminApp({
            credential,
            projectId: firebaseConfig.projectId,
          });
      adminDb = getAdminFirestore(adminApp, firebaseConfig.firestoreDatabaseId);
    } catch (initErr) {
      console.error('[Admin SDK] Error initializing Admin App in serverless function:', initErr);
    }
  }

  return adminDb;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée. Seul POST est accepté.' });
  }

  try {
    const {
      customerId: clientCustomerId,
      nomClient,
      telephone,
      adresse,
      commune,
      notes,
      items,
    } = req.body || {};

    if (!nomClient || typeof nomClient !== 'string' || nomClient.trim().length === 0) {
      return res.status(400).json({ error: 'Le nom du client est obligatoire.' });
    }
    if (!telephone || typeof telephone !== 'string' || telephone.trim().length === 0) {
      return res.status(400).json({ error: 'Le numéro de téléphone est obligatoire.' });
    }
    if (!adresse || typeof adresse !== 'string' || adresse.trim().length === 0) {
      return res.status(400).json({ error: "L'adresse de livraison est obligatoire." });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Le panier ne peut pas être vide.' });
    }

    const finalCustomerId = clientCustomerId || `guest_${Date.now()}`;

    // Delivery fee from settings
    let deliveryFee = 200;
    let isStoreOpen = true;

    try {
      const settingsSnap = await getDoc(doc(firestoreDb, 'restaurantSettings', 'general'));
      if (settingsSnap.exists()) {
        const settings = settingsSnap.data();
        if (typeof settings.deliveryFee === 'number') {
          deliveryFee = settings.deliveryFee;
        } else if (typeof settings.fraisLivraison === 'number') {
          deliveryFee = settings.fraisLivraison;
        }
        if (settings.isOpen === false) {
          isStoreOpen = false;
        }
      }
    } catch {}

    if (!isStoreOpen) {
      return res.status(400).json({
        error: "Le restaurant Smash'Art est actuellement fermé. Les commandes en ligne sont temporairement suspendues.",
      });
    }

    let calculatedSubtotal = 0;
    const verifiedItems: any[] = [];

    for (const rawItem of items) {
      const productId = rawItem.productId;
      const requestedQty = Number(rawItem.quantite || rawItem.quantity || 1);
      const qty = Math.max(1, Math.floor(requestedQty));
      const isCombo = Boolean(rawItem.isCombo);
      const comboDrink = rawItem.comboDrink || '';

      if (!productId || typeof productId !== 'string') {
        return res.status(400).json({ error: 'Identifiant de produit invalide.' });
      }

      const productDocSnap = await getDoc(doc(firestoreDb, 'products', productId));
      if (!productDocSnap.exists()) {
        return res.status(400).json({ error: `Le produit "${productId}" n'existe plus au menu.` });
      }

      const productData = productDocSnap.data();
      if (productData.disponible === false || productData.isAvailable === false) {
        return res.status(400).json({
          error: `Le produit "${productData.nom || productData.name}" est actuellement en rupture de stock.`,
        });
      }

      const basePrice = Number(productData.prix ?? productData.price ?? 0);
      const comboExtra = isCombo ? 250 : 0;
      const unitPrice = basePrice + comboExtra;
      const itemSubtotal = unitPrice * qty;

      calculatedSubtotal += itemSubtotal;

      verifiedItems.push({
        productId,
        nom: productData.nom || productData.name || 'Produit',
        productName: productData.nom || productData.name || 'Produit',
        quantite: qty,
        quantity: qty,
        prix: unitPrice,
        price: unitPrice,
        subtotal: itemSubtotal,
        isCombo,
        comboDrink: isCombo ? comboDrink : '',
      });
    }

    const calculatedTotal = calculatedSubtotal + deliveryFee;
    const numeroCommande = `#SM-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowIso = new Date().toISOString();

    const orderDocument = {
      numeroCommande,
      customerId: finalCustomerId,
      nomClient: nomClient.trim(),
      telephone: telephone.trim(),
      adresse: adresse.trim(),
      commune: (commune || 'Hydra').trim(),
      notes: (notes || '').trim(),
      items: verifiedItems,
      subtotal: calculatedSubtotal,
      deliveryFee,
      total: calculatedTotal,
      paymentMethod: 'cash_on_delivery',
      modePaiement: 'cash à la livraison',
      statut: 'Nouvelle',
      status: 'Nouvelle',
      createdAt: nowIso,
      updatedAt: nowIso,
      customerName: nomClient.trim(),
      customerPhone: telephone.trim(),
      deliveryAddress: adresse.trim(),
    };

    let orderId: string;
    const adminDatabase = getAdminDatabase();

    if (adminDatabase) {
      const docRef = await adminDatabase.collection('orders').add(orderDocument);
      orderId = docRef.id;
    } else {
      orderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      console.warn('[Vercel Serverless] FIREBASE_SERVICE_ACCOUNT not configured. Generated order ID:', orderId);
    }

    return res.status(201).json({
      success: true,
      id: orderId,
      numeroCommande,
      subtotal: calculatedSubtotal,
      deliveryFee,
      total: calculatedTotal,
      customerId: finalCustomerId,
      statut: 'Nouvelle',
    });
  } catch (err: any) {
    console.error('Vercel order handler error:', err);
    return res.status(500).json({
      error: err.message || 'Une erreur est survenue lors de la création de votre commande.',
    });
  }
}
