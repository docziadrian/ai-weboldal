import { defineConfig } from "drizzle-kit";



export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: "mysql://root:@localhost:3306/tanulopont",
  },
});
