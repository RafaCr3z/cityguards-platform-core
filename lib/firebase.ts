import * as admin from 'firebase-admin';

let db: admin.firestore.Firestore;

// Evitar inicializar múltiplas vezes o Firebase Admin em desenvolvimento e evitar erros no build
if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // É necessário substituir \n literal por quebras de linha caso venha como string do .env
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
      console.log("Firebase Admin inicializado com sucesso.");
    } else {
      console.warn("Variáveis de ambiente do Firebase em falta. A ignorar inicialização para fins de compilação (build/CI).");
    }
  } catch (error: any) {
    console.error('Firebase admin initialization error', error.stack);
  }
}

// Se não há apps ativas, não inicializamos o firestore para evitar crash de build estático
db = admin.apps.length ? admin.firestore() : (null as any);

export { admin, db };
