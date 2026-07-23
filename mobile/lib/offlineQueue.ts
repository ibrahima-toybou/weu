import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase";

const QUEUE_KEY = "weu_offline_pointages";
const CACHE_KEY = "weu_accueil_cache";

let isSyncing = false;

export interface PointageLocal {
  id: string;
  id_menage: number;
  id_utilisateur: number;
  id_point: number;
  date_heure: string;
  synced: boolean;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

async function getQueue(): Promise<PointageLocal[]> {
  const data = await AsyncStorage.getItem(QUEUE_KEY);
  return data ? JSON.parse(data) : [];
}

async function saveQueue(queue: PointageLocal[]) {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function ajouterPointage(params: {
  id_menage: number;
  id_utilisateur: number;
  id_point: number;
}): Promise<PointageLocal> {
  const pointage: PointageLocal = {
    id: generateId(),
    id_menage: params.id_menage,
    id_utilisateur: params.id_utilisateur,
    id_point: params.id_point,
    date_heure: new Date().toISOString(),
    synced: false,
  };

  const queue = await getQueue();
  queue.push(pointage);
  await saveQueue(queue);

  return pointage;
}

export async function syncPointages(): Promise<{
  synced: number;
  failed: number;
}> {
  // Verrou — empêche les appels simultanés
  if (isSyncing) return { synced: 0, failed: 0 };
  isSyncing = true;

  try {
    const queue = await getQueue();
    const nonSynced = queue.filter((p) => !p.synced);

    if (nonSynced.length === 0) return { synced: 0, failed: 0 };

    let synced = 0;
    let failed = 0;

    for (const pointage of nonSynced) {
      const { error } = await supabase.from("pointage").insert({
        id_menage: pointage.id_menage,
        id_utilisateur: pointage.id_utilisateur,
        id_point: pointage.id_point,
        date_heure: pointage.date_heure,
        statut_sync: "synchronisé",
      });

      if (!error) {
        pointage.synced = true;
        // Sauvegarder immédiatement après chaque succès
        await saveQueue(queue);
        synced++;
      } else {
        failed++;
      }
    }

    // Nettoyer les pointages synchronisés de plus de 24h
    const maintenant = Date.now();
    const queueNettoyee = queue.filter((p) => {
      if (!p.synced) return true;
      const age = maintenant - new Date(p.date_heure).getTime();
      return age < 24 * 60 * 60 * 1000;
    });
    await saveQueue(queueNettoyee);

    return { synced, failed };
  } finally {
    isSyncing = false;
  }
}

export async function getNbEnAttente(): Promise<number> {
  const queue = await getQueue();
  return queue.filter((p) => !p.synced).length;
}

export async function sauvegarderCache(data: any) {
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
}

export async function chargerCache(): Promise<any | null> {
  const data = await AsyncStorage.getItem(CACHE_KEY);
  return data ? JSON.parse(data) : null;
}
