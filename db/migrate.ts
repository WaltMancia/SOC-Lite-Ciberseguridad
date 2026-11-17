import { migrate } from "drizzle-orm/mysql2/migrator";
import { getDb } from "../api/queries/connection";

async function runMigrations() {
  console.log("Aplicando migraciones de SOC Lite...");
  await migrate(getDb(), { migrationsFolder: "./db/migrations" });
  console.log("Migraciones aplicadas correctamente.");
  process.exit(0);
}

runMigrations().catch((error) => {
  console.error("No se pudieron aplicar las migraciones:", error);
  process.exit(1);
});
