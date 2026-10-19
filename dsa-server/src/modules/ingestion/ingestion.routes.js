import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";

const router = Router();

// Indexing is intentionally a CLI operation rather than an HTTP endpoint.
// Running a costly PDF ingestion from an exposed web route is risky. Use:
// npm run index:pdf
router.get("/status", requireAuth, (_req, res) => {
  res.json({ success: true, data: { mode: "cli", command: "npm run index:pdf" } });
});

export default router;
