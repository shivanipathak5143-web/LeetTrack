import express from 'express';
import {syncStats, getStats, getRecentSubmissions, getHeatmap, getPublicStats} from '../controller/leetcodeController.js';
import protect from '../middleware/auth.js';

const router=express.Router();

router.get('/sync-stats',protect,syncStats);
router.get('/stats',protect,getStats);
router.get('/recent-submissions',protect,getRecentSubmissions);
router.get('/heatmap',protect,getHeatmap);
router.get('/public-stats/:username',getPublicStats);

export default router;