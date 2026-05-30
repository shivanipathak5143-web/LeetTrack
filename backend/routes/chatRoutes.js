import express from 'express';
import {sendMessage, getAllChats, getChatById, deleteChat, clearChat, getRoadmap} from '../controller/chatController.js';
import protect from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';

const chatLimiter=rateLimit({
    windowMs:60*1000,
    max:20,
    message:{
        success:false,
        error:'Too many messages, please slow down',
        statusCode:429,
    },
});

const router=express.Router();

router.use(protect);

router.post('/message',chatLimiter,sendMessage);
router.get('/',getAllChats);
router.get('/roadmap',getRoadmap);
router.get('/:chatId',getChatById);
router.delete('/:chatId',deleteChat);
router.put('/:chatId/clear',clearChat);

export default router;