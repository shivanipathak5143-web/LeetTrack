import rateLimit from 'express-rate-limit';

export const apiLimiter=rateLimit({
    windowMs:15*60*1000,
    max:100,
    standardHeaders:true,
    legacyHeaders:false,
    message:{
        success:false,
        message:'Too many requests from this IP, please try again after 15 minutes',
        statusCode:429,
    },
});

export const authLimiter=rateLimit({
    windowMs:15*60*1000,
    max:10,
    standardHeaders:true,
    legacyHeaders:false,
    message:{  
        success:false,
        error:'Too many login attempts from this IP, please try again after 15 minutes',
        statusCode:429,
    },
});

export const leetcodeSyncLimiter=rateLimit({
    windowMs:60*60*1000,
    max:10,
    standardHeaders:true,
    legacyHeaders:false,
    message:{
        success:false,
        error:'Too many sync attempts from this IP, please try again after an hour',
        statusCode:429,
    }
})