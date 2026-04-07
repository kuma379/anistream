import { Router, type IRouter } from "express";
import healthRouter from "./health";
import animeRouter from "./anime";

const router: IRouter = Router();

// Health check route
router.use(healthRouter);

// Anime & Film scraping routes - semua route di bawah /api/anime/
router.use("/anime", animeRouter);

export default router;
