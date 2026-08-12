// Mode démo — un faux client Supabase en mémoire, utilisé uniquement quand
// EXPO_PUBLIC_PREVIEW=1. Permet de tester l'app sans backend Supabase réel
// (voir README « Tester rapidement sans backend »). Aucune donnée n'est
// persistée : tout est réinitialisé à chaque redémarrage de l'app.

const now = Date.now();
const daysAgo = (n: number) => new Date(now - n * 86400000).toISOString();
const daysFromNow = (n: number) => new Date(now + n * 86400000).toISOString().slice(0, 10);
const dateDaysAgo = (n: number) => new Date(now - n * 86400000).toISOString().slice(0, 10);

// Séquence factice de N images pour simuler une vue 360° dans le mode démo.
function rotationFrames(label: string, count: number, bg: string, fg: string): string[] {
  return Array.from({ length: count }, (_, i) =>
    `https://placehold.co/640x480/${bg}/${fg}?text=${encodeURIComponent(label)}+${i + 1}%2F${count}`
  );
}

const db: Record<string, any[]> = {
  profiles: [
    {
      id: "u1",
      username: "alex_gti",
      display_name: "Alex",
      avatar_url: null,
      bio: "Passionné de GTI depuis 10 ans. 205 GTI en cours de restauration.",
      is_premium: true,
      created_at: daysAgo(400),
    },
    { id: "u2", username: "lea_moto", display_name: "Léa", avatar_url: null, bio: null, is_premium: false, created_at: daysAgo(200) },
    { id: "u3", username: "max_tuning", display_name: "Max", avatar_url: null, bio: null, is_premium: true, created_at: daysAgo(100) },
  ],
  vehicles: [
    {
      id: "v1",
      owner_id: "u1",
      type_vehicule: "voiture",
      brand: "Peugeot",
      model: "205 GTI",
      year: 1990,
      cover_photo_url: null,
      is_public: true,
      hide_budget: false,
      horsepower: 132,
      is_completed: true,
      photos_360_before: rotationFrames("Avant", 8, "1a1a2e", "6f6690"),
      photos_360_after: rotationFrames("Apres", 8, "1a0e2e", "B026FF"),
      created_at: daysAgo(300),
    },
    {
      id: "v2",
      owner_id: "u1",
      type_vehicule: "moto",
      brand: "Yamaha",
      model: "MT-07",
      year: 2022,
      cover_photo_url: null,
      is_public: true,
      hide_budget: false,
      horsepower: 73,
      is_completed: false,
      photos_360_before: rotationFrames("Avant", 6, "0e1a2e", "22E4E4"),
      photos_360_after: [],
      created_at: daysAgo(60),
    },
    {
      id: "v3",
      owner_id: "u2",
      type_vehicule: "voiture",
      brand: "Volkswagen",
      model: "Golf GTI",
      year: 2015,
      cover_photo_url: null,
      is_public: true,
      hide_budget: false,
      horsepower: 230,
      is_completed: false,
      photos_360_before: [],
      photos_360_after: [],
      created_at: daysAgo(90),
    },
    {
      id: "v4",
      owner_id: "u3",
      type_vehicule: "moto",
      brand: "Honda",
      model: "CB650R",
      year: 2021,
      cover_photo_url: null,
      is_public: true,
      hide_budget: false,
      horsepower: 94,
      is_completed: false,
      photos_360_before: [],
      photos_360_after: [],
      created_at: daysAgo(45),
    },
  ],
  mod_entries: [
    { id: "e1", vehicle_id: "v1", category: "esthetique", title: "Jantes 18 pouces", description: "Jantes Speedline en remplacement des jantes tôle d'origine.", price: 850, photos: [], entry_date: dateDaysAgo(280), created_at: daysAgo(280) },
    { id: "e2", vehicle_id: "v1", category: "performance", title: "Reprogrammation moteur", description: "Passage de 105 à 130ch chez un spécialiste local.", price: 600, photos: [], entry_date: dateDaysAgo(180), created_at: daysAgo(180) },
    { id: "e3", vehicle_id: "v1", category: "confort", title: "Sièges baquets", description: "Sièges Recaro d'occasion, montage par un garage.", price: 1200, photos: [], entry_date: dateDaysAgo(30), created_at: daysAgo(30) },
    { id: "e4", vehicle_id: "v3", category: "esthetique", title: "Kit carrosserie GTI", description: "Pare-choc, jupes latérales et diffuseur arrière.", price: 950, photos: [], entry_date: dateDaysAgo(10), created_at: daysAgo(10) },
    { id: "e5", vehicle_id: "v2", category: "performance", title: "Ligne d'échappement Akrapovic", description: "Son plus profond, gain de quelques chevaux.", price: 780, photos: [], entry_date: dateDaysAgo(20), created_at: daysAgo(20) },
  ],
  maintenance_items: [
    { id: "m1", vehicle_id: "v1", kind: "vidange", label: "Vidange + filtre à huile", due_date: daysFromNow(12), due_mileage: null, last_done_date: null, last_done_mileage: null, completed: false, created_at: daysAgo(100) },
    { id: "m2", vehicle_id: "v1", kind: "pneus", label: "Changement pneus avant", due_date: daysFromNow(-8), due_mileage: null, last_done_date: null, last_done_mileage: null, completed: false, created_at: daysAgo(200) },
    { id: "m3", vehicle_id: "v1", kind: "controle_technique", label: "Contrôle technique", due_date: daysFromNow(90), due_mileage: null, last_done_date: null, last_done_mileage: null, completed: false, created_at: daysAgo(50) },
    { id: "m4", vehicle_id: "v2", kind: "freins", label: "Plaquettes de frein avant", due_date: daysFromNow(45), due_mileage: null, last_done_date: null, last_done_mileage: null, completed: false, created_at: daysAgo(10) },
  ],
  follows: [
    { follower_id: "u1", following_id: "u2", created_at: daysAgo(50) },
    { follower_id: "u3", following_id: "u1", created_at: daysAgo(5) },
  ],
  mod_entry_likes: [
    { mod_entry_id: "e1", user_id: "u2", created_at: daysAgo(2) },
    { mod_entry_id: "e1", user_id: "u3", created_at: daysAgo(1) },
  ],
  notifications: [
    { id: "n1", user_id: "u1", actor_id: "u3", type: "follow", vehicle_id: null, mod_entry_id: null, read: false, created_at: daysAgo(5) },
    { id: "n2", user_id: "u1", actor_id: "u2", type: "like", vehicle_id: null, mod_entry_id: "e1", read: false, created_at: daysAgo(2) },
    { id: "n3", user_id: "u1", actor_id: "u3", type: "like", vehicle_id: null, mod_entry_id: "e1", read: true, created_at: daysAgo(1) },
  ],
};

function matches(row: any, filters: [string, string, any][]) {
  return filters.every(([op, col, val]) => {
    if (op === "eq") return row[col] === val;
    if (op === "neq") return row[col] !== val;
    if (op === "in") return (val as any[]).includes(row[col]);
    return true;
  });
}

class MockBuilder implements PromiseLike<any> {
  private filters: [string, string, any][] = [];
  private op: "select" | "insert" | "update" | "delete" = "select";
  private payload: any = null;
  private singleMode: "single" | "maybeSingle" | null = null;
  private orderCol: string | null = null;
  private orderAsc = true;
  private limitN: number | null = null;
  private countOpt: string | null = null;

  constructor(private table: string) {}

  select(_cols?: string, opts?: { count?: string; head?: boolean }) {
    if (opts?.count) this.countOpt = opts.count;
    return this;
  }
  eq(col: string, val: any) {
    this.filters.push(["eq", col, val]);
    return this;
  }
  neq(col: string, val: any) {
    this.filters.push(["neq", col, val]);
    return this;
  }
  in(col: string, vals: any[]) {
    this.filters.push(["in", col, vals]);
    return this;
  }
  order(col: string, opts?: { ascending?: boolean }) {
    this.orderCol = col;
    this.orderAsc = opts?.ascending !== false;
    return this;
  }
  limit(n: number) {
    this.limitN = n;
    return this;
  }
  single() {
    this.singleMode = "single";
    return this;
  }
  maybeSingle() {
    this.singleMode = "maybeSingle";
    return this;
  }
  insert(values: any) {
    this.op = "insert";
    this.payload = values;
    return this;
  }
  update(values: any) {
    this.op = "update";
    this.payload = values;
    return this;
  }
  delete() {
    this.op = "delete";
    return this;
  }

  private run() {
    const table = db[this.table] ?? [];

    if (this.op === "insert") {
      const row = {
        id: `${this.table}-${Math.random().toString(36).slice(2, 9)}`,
        created_at: new Date().toISOString(),
        photos: [],
        ...this.payload,
      };
      table.push(row);
      return this.singleMode ? { data: row, error: null } : { data: [row], error: null };
    }

    if (this.op === "update") {
      const updated: any[] = [];
      table.forEach((row) => {
        if (matches(row, this.filters)) {
          Object.assign(row, this.payload);
          updated.push(row);
        }
      });
      return { data: updated, error: null };
    }

    if (this.op === "delete") {
      const remaining = table.filter((row) => !matches(row, this.filters));
      db[this.table] = remaining;
      return { data: null, error: null };
    }

    let rows = table.filter((row) => matches(row, this.filters));
    if (this.orderCol) {
      rows = [...rows].sort((a, b) => {
        const av = a[this.orderCol!];
        const bv = b[this.orderCol!];
        if (av == null) return 1;
        if (bv == null) return -1;
        return this.orderAsc ? (av > bv ? 1 : -1) : av > bv ? -1 : 1;
      });
    }
    if (this.limitN != null) rows = rows.slice(0, this.limitN);

    if (this.countOpt) return { data: null, error: null, count: rows.length };
    if (this.singleMode === "single") return { data: rows[0] ?? null, error: rows[0] ? null : { message: "Not found", code: "PGRST116" } };
    if (this.singleMode === "maybeSingle") return { data: rows[0] ?? null, error: null };
    return { data: rows, error: null };
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve(this.run()).then(onfulfilled as any, onrejected as any);
  }
}

const fakeSession = {
  access_token: "preview-token",
  refresh_token: "preview-refresh",
  expires_in: 3600,
  token_type: "bearer",
  user: { id: "u1", email: "alex@example.com" },
} as any;

const mockRecommendations = [
  {
    title: "Amortisseurs sport réglables",
    category: "performance",
    estimated_price: 650,
    difficulty: "moyen",
    explanation: "Améliore la tenue de route et abaisse légèrement le centre de gravité pour un comportement plus sportif.",
  },
  {
    title: "Échappement inox homologué",
    category: "performance",
    estimated_price: 550,
    difficulty: "facile",
    explanation: "Gain de quelques chevaux et une sonorité plus présente, pose rapide chez un garage.",
  },
  {
    title: "Volant sport + pommeau de vitesse",
    category: "esthetique",
    estimated_price: 220,
    difficulty: "facile",
    explanation: "Améliore les sensations de conduite pour un budget limité, montage possible soi-même.",
  },
];

export const previewSupabase: any = {
  auth: {
    getSession: async () => ({ data: { session: fakeSession } }),
    onAuthStateChange: (_cb: any) => ({ data: { subscription: { unsubscribe() {} } } }),
    signInWithPassword: async () => ({ error: null }),
    signUp: async () => ({ error: null }),
    signOut: async () => {},
  },
  from(table: string) {
    return new MockBuilder(table);
  },
  storage: {
    from() {
      return {
        upload: async () => ({ error: null }),
        getPublicUrl: () => ({ data: { publicUrl: "" } }),
      };
    },
  },
  functions: {
    invoke: async (_name: string) => {
      await new Promise((r) => setTimeout(r, 600));
      return { data: { recommendations: mockRecommendations }, error: null };
    },
  },
};
