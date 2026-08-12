export type VehicleType = "voiture" | "moto";
export type ModCategory = "esthetique" | "performance" | "confort";
export type MaintenanceKind = "vidange" | "pneus" | "controle_technique" | "freins" | "autre";
export type NotificationType = "follow" | "new_mod_entry" | "like" | "comment";
export type SubscriptionPlan = "monthly" | "yearly";

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
          Partial<Pick<Vehicle, "year" | "cover_photo_url" | "is_public" | "hide_budget" | "horsepower">>,
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
            | "is_completed"
            | "photos_360_before"
            | "photos_360_after"
          >
        >
      >;
      mod_entries: TableDef<
        ModEntry,
        Pick<ModEntry, "vehicle_id" | "category" | "title"> &
          Partial<Pick<ModEntry, "description" | "price" | "photos" | "entry_date">>
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
