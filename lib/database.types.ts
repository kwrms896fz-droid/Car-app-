export type VehicleType = "voiture" | "moto";
export type ModCategory = "esthetique" | "performance" | "confort";
export type MaintenanceKind = "vidange" | "pneus" | "controle_technique" | "freins" | "autre";
export type NotificationType = "follow" | "new_mod_entry" | "like" | "comment";
export type SubscriptionPlan = "monthly" | "yearly";
export type PowerLogSource = "banc" | "estime" | "constructeur";
export type BuildProjectStatus = "draft" | "in_progress" | "done";
export type BuildItemCategory = "esthetique" | "performance" | "confort" | "main_oeuvre" | "autre";
export type Difficulty = "facile" | "moyen" | "difficile";
export type UsageType = "daily" | "piste" | "drift" | "show" | "rallye";
export type ReliabilityPreference = "fiabilite" | "equilibre" | "performance_max";

export type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_premium: boolean;
  created_at: string;
};

export type Vehicle = {
  id: string;
  owner_id: string;
  type_vehicule: VehicleType;
  brand: string;
  model: string;
  year: number | null;
  cover_photo_url: string | null;
  is_public: boolean;
  hide_budget: boolean;
  horsepower: number | null;
  mileage: number | null;
  is_completed: boolean;
  photos_360_before: string[];
  photos_360_after: string[];
  created_at: string;
};

export type Vehicle360State = "before" | "after";

export type ModEntry = {
  id: string;
  vehicle_id: string;
  category: ModCategory;
  title: string;
  description: string | null;
  price: number | null;
  photos: string[];
  entry_date: string;
  resulting_horsepower: number | null;
  created_at: string;
};

export type PowerLog = {
  id: string;
  vehicle_id: string;
  recorded_date: string;
  horsepower: number;
  torque_nm: number | null;
  source: PowerLogSource;
  track_name: string | null;
  lap_time_seconds: number | null;
  notes: string | null;
  created_at: string;
};

export type BuildProject = {
  id: string;
  vehicle_id: string;
  title: string;
  target_horsepower: number | null;
  status: BuildProjectStatus;
  created_at: string;
};

export type BuildProjectItem = {
  id: string;
  project_id: string;
  label: string;
  category: BuildItemCategory;
  estimated_price: number | null;
  difficulty: Difficulty | null;
  is_done: boolean;
  created_at: string;
};

export type MaintenanceItem = {
  id: string;
  vehicle_id: string;
  kind: MaintenanceKind;
  label: string;
  due_date: string | null;
  due_mileage: number | null;
  last_done_date: string | null;
  last_done_mileage: number | null;
  completed: boolean;
  created_at: string;
};

export type Follow = {
  follower_id: string;
  following_id: string;
  created_at: string;
};

export type ModEntryLike = {
  mod_entry_id: string;
  user_id: string;
  created_at: string;
};

export type Comment = {
  id: string;
  mod_entry_id: string;
  author_id: string;
  body: string;
  created_at: string;
};

export type AppNotification = {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: NotificationType;
  vehicle_id: string | null;
  mod_entry_id: string | null;
  read: boolean;
  created_at: string;
};

export type Subscription = {
  user_id: string;
  is_active: boolean;
  plan: SubscriptionPlan | null;
  current_period_end: string | null;
  revenuecat_customer_id: string | null;
  updated_at: string;
};

type TableDef<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  public: {
    Tables: {
      profiles: TableDef<
        Profile,
        Pick<Profile, "id" | "username"> & Partial<Pick<Profile, "display_name" | "avatar_url" | "bio">>
      >;
      vehicles: TableDef<
        Vehicle,
        Pick<Vehicle, "owner_id" | "type_vehicule" | "brand" | "model"> &
          Partial<Pick<Vehicle, "year" | "cover_photo_url" | "is_public" | "hide_budget" | "horsepower" | "mileage">>,
        Partial<
          Pick<
            Vehicle,
            | "brand"
            | "model"
            | "year"
            | "cover_photo_url"
            | "is_public"
            | "hide_budget"
            | "horsepower"
            | "mileage"
            | "is_completed"
            | "photos_360_before"
            | "photos_360_after"
          >
        >
      >;
      mod_entries: TableDef<
        ModEntry,
        Pick<ModEntry, "vehicle_id" | "category" | "title"> &
          Partial<Pick<ModEntry, "description" | "price" | "photos" | "entry_date" | "resulting_horsepower">>
      >;
      power_logs: TableDef<
        PowerLog,
        Pick<PowerLog, "vehicle_id" | "horsepower"> &
          Partial<Pick<PowerLog, "recorded_date" | "torque_nm" | "source" | "track_name" | "lap_time_seconds" | "notes">>
      >;
      build_projects: TableDef<
        BuildProject,
        Pick<BuildProject, "vehicle_id" | "title"> & Partial<Pick<BuildProject, "target_horsepower" | "status">>,
        Partial<Pick<BuildProject, "title" | "target_horsepower" | "status">>
      >;
      build_project_items: TableDef<
        BuildProjectItem,
        Pick<BuildProjectItem, "project_id" | "label" | "category"> &
          Partial<Pick<BuildProjectItem, "estimated_price" | "difficulty" | "is_done">>,
        Partial<Pick<BuildProjectItem, "label" | "category" | "estimated_price" | "difficulty" | "is_done">>
      >;
      maintenance_items: TableDef<
        MaintenanceItem,
        Pick<MaintenanceItem, "vehicle_id" | "kind" | "label"> &
          Partial<
            Pick<
              MaintenanceItem,
              "due_date" | "due_mileage" | "last_done_date" | "last_done_mileage" | "completed"
            >
          >
      >;
      follows: TableDef<Follow, Pick<Follow, "follower_id" | "following_id">>;
      mod_entry_likes: TableDef<ModEntryLike, Pick<ModEntryLike, "mod_entry_id" | "user_id">>;
      comments: TableDef<Comment, Pick<Comment, "mod_entry_id" | "author_id" | "body">>;
      notifications: TableDef<
        AppNotification,
        Pick<AppNotification, "user_id" | "type"> &
          Partial<Pick<AppNotification, "actor_id" | "vehicle_id" | "mod_entry_id" | "read">>,
        Partial<Pick<AppNotification, "read">>
      >;
      subscriptions: TableDef<Subscription, Partial<Subscription>, Partial<Subscription>>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
