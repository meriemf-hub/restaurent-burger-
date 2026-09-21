import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
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

const PORT = 3000;

// Load Firebase Public Config
let firebaseConfig: any = null;
try {
  const configFile = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configFile)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));
  }
} catch (e) {
  console.error('Could not load firebase-applet-config.json:', e);
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

// Client Firestore instance for public reads (menu products, restaurant settings)
const clientApp = initClientApp(firebaseConfig);
const firestoreDb = getClientFirestore(clientApp, firebaseConfig.firestoreDatabaseId);

// Server-side Firebase Admin SDK initialization
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
      console.log('[Admin SDK] Successfully initialized Firebase Admin Firestore.');
    } catch (initErr) {
      console.error('[Admin SDK] Error initializing Admin App:', initErr);
    }
  }

  return adminDb;
}

// In-memory store for development/preview fallback when FIREBASE_SERVICE_ACCOUNT is not configured
const devOrdersCache = new Map<string, any>();

async function startServer() {
  const app = express();

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'SmashArt Order Server',
      database: firebaseConfig.firestoreDatabaseId,
      timestamp: new Date().toISOString(),
    });
  });

  // Server-authoritative order creation endpoint
  app.post('/api/orders', async (req, res) => {
    try {
      const {
        customerId: clientCustomerId,
        nomClient,
        telephone,
        adresse,
        commune,
        notes,
        items,
      } = req.body;

      // 1. Basic validation of required inputs
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

      // 2. Extract or verify customer auth context
      let authenticatedUid: string | null = null;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const idToken = authHeader.split('Bearer ')[1].trim();
        if (idToken && idToken !== 'null' && idToken !== 'undefined') {
          try {
            // Validate Firebase ID token via Identity Toolkit endpoint
            const verifyUrl = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseConfig.apiKey}`;
            const lookupRes = await fetch(verifyUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ idToken }),
            });
            if (lookupRes.ok) {
              const lookupData = await lookupRes.json();
              if (lookupData.users && lookupData.users.length > 0) {
                authenticatedUid = lookupData.users[0].localId;
              }
            }
          } catch (tokenErr) {
            console.warn('Notice: token verification skipped fallback to client ID:', tokenErr);
          }
        }
      }

      // Customer identifier strictly assigned
      const finalCustomerId = authenticatedUid || clientCustomerId || `guest_${Date.now()}`;

      // 3. Retrieve restaurant settings (official delivery fee and store status)
      let deliveryFee = 200; // standard default for Hydra / Alger
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
      } catch (settingsErr) {
        console.warn('Could not read restaurantSettings, using default delivery fee 200 DA:', settingsErr);
      }

      if (!isStoreOpen) {
        return res.status(400).json({
          error: "Le restaurant Smash'Art est actuellement fermé. Les commandes en ligne sont temporairement suspendues.",
        });
      }

      // 4. Retrieve real product prices from Firestore & recalculate totals server-side
      let calculatedSubtotal = 0;
      const verifiedItems: any[] = [];

      for (const rawItem of items) {
        const productId = rawItem.productId;
        const requestedQty = Number(rawItem.quantite || rawItem.quantity || 1);
        const qty = Math.max(1, Math.floor(requestedQty));
        const isCombo = Boolean(rawItem.isCombo);
        const comboDrink = rawItem.comboDrink || '';

        if (!productId || typeof productId !== 'string') {
          return res.status(400).json({ error: 'Chaque article doit posséder un identifiant de produit valide.' });
        }

        const productDocSnap = await getDoc(doc(firestoreDb, 'products', productId));
        if (!productDocSnap.exists()) {
          return res.status(400).json({ error: `Le produit "${productId}" n'existe plus au menu.` });
        }

        const productData = productDocSnap.data();

        // Check availability
        if (productData.disponible === false || productData.isAvailable === false) {
          return res.status(400).json({
            error: `Le produit "${productData.nom || productData.name}" est actuellement en rupture de stock.`,
          });
        }

        // Real authoritative price directly from Firestore document
        const basePrice = Number(productData.prix ?? productData.price ?? 0);
        if (basePrice <= 0) {
          return res.status(400).json({
            error: `Prix invalide pour le produit "${productData.nom || productData.name}".`,
          });
        }

        // Combo extra: standard formula adds 250 DA for fries + drink
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

      // Final server-verified total
      const calculatedTotal = calculatedSubtotal + deliveryFee;
      const numeroCommande = `#SM-${Math.floor(1000 + Math.random() * 9000)}`;

      // 5. Construct order document with server-authoritative fields (No backend secret)
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
        // Compatibility duplicate fields for admin & tracking modals
        customerName: nomClient.trim(),
        customerPhone: telephone.trim(),
        deliveryAddress: adresse.trim(),
      };

      // 6. Write order using server-side privileged Firebase Admin SDK
      let orderId: string;
      const adminDatabase = getAdminDatabase();

      if (adminDatabase) {
        // Production: Firebase Admin SDK bypasses Firestore Security Rules with IAM service account privileges
        const docRef = await adminDatabase.collection('orders').add(orderDocument);
        orderId = docRef.id;
        console.log(`[Order Server] Created verified Firestore order ${orderId} (${numeroCommande}) via Firebase Admin SDK`);
      } else {
        // Development/Preview fallback when FIREBASE_SERVICE_ACCOUNT is not yet configured in env
        orderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        devOrdersCache.set(orderId, { id: orderId, ...orderDocument });
        console.log(`[Order Server] Notice: FIREBASE_SERVICE_ACCOUNT not configured. Generated verified preview order ${orderId} (${numeroCommande}) - Total: ${calculatedTotal} DA`);
      }

      // 7. Return verified order confirmation
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
      console.error('[Order Server] Error creating order:', err);
      return res.status(500).json({
        error: err.message || 'Une erreur est survenue lors de la création de votre commande.',
      });
    }
  });

  // Vite middleware setup (development mode)
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static files serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Smash'Art Hydra server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup failure:', err);
  process.exit(1);
});
