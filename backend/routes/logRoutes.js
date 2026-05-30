import express from 'express';
import {logProblem, removeLoggedProblem, getTodayLog, getLogByDate, getLogHistory, getStreakInfo, getActivityGrid, getSummary, updateMood} from '../controller/logController.js';
import protect from '../middleware/auth.js';

const router=express.Router();

router.post('/',protect,logProblem);
router.delete('/:date/:titleSlug', protect, removeLoggedProblem);
router.get('/today',protect,getTodayLog);
router.get('/date/:date',protect,getLogByDate);
router.get('/history',protect,getLogHistory);
router.get('/streak',protect,getStreakInfo);
router.get('/activity-grid',protect,getActivityGrid);
router.get('/summary',protect,getSummary);
router.put('/mood',protect,updateMood);

export default router;