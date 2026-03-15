
import { redisClient } from './redis.db.js';

export const revoked_key=({userId,iti })=>{
    return `revokedToken::${userId}::${iti}`;

}
export const get_key=({userId})=>{
    return `revokedToken::${userId}`;
}

export const set = async ({key, value,ttl}={}) => {
    try{
        const data = typeof value === "string" ? value : JSON.stringify(value);
        return ttl? await redisClient.set(key,data,{EX: ttl}): await redisClient.set(key,data);
    }
    catch(err){
        console.log("Error occurred while setting Redis value:", err);
    }
}
export const update = async ({key, value,ttl}={}) => {
    try{
        if(!await redisClient.exists(key)){
            return 0;
        }
        const data = typeof value === "string" ? value : JSON.stringify(value);
        return ttl? await redisClient.set(key,data,{EX: ttl}): await redisClient.set(key,data);
    }
    catch(err){
        console.log("Error occurred while setting Redis value:", err);
    }
}
export const get = async (key) => {
    try{
        const data = await redisClient.get(key);
        try{
            return JSON.parse(data);
        }
        catch(err){
            return data;
        }
    }
    catch(err){
        console.log("Error occurred while getting Redis value:", err);
    }
}
export const exists = async (key) => {
    try{
        return await redisClient.exists(key);
    }
    catch(err){
        console.log("Error occurred while checking Redis key existence:", err);
    }
}

export const ttl = async (key) => {
    try{
        return await redisClient.ttl(key);
    }
    catch(err){
        console.log("Error occurred while checking Redis key TTL:", err);
    }
}
export const del = async (key) => {
    try{
        return await redisClient.del(key);
    }
    catch(err){
        console.log("Error occurred while deleting Redis value:", err);
    }
}

export const keys = async (pattern="*") => {
    try{
        return await redisClient.keys(`${pattern}`);
    }
    catch(err){
        console.log("Error occurred while fetching Redis keys:", err);
    }
}
