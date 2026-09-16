import exprress from 'express';
import {getTopicBreakDown, getWeakSpots, getDifficultyDistribution, getProgressChart, getLeaderboard, getDashboard} from '../controller/statsController.js';
import protect from '../middleware/auth.js';

const router=exprress.Router();

router.get('/leaderboard',getLeaderboard);
router.use(protect);
router.get('/dashboard',getDashboard);
router.get('/topics',getTopicBreakDown);
router.get('/weak-spots',getWeakSpots);
router.get('/difficulty',getDifficultyDistribution);
router.get('/progress',getProgressChart);

export default router;