package com.omkar.uni.verse.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.data.redis.core.script.RedisScript;

@Configuration
public class RedisLockConfig {

    /**
     * Lua script for safe lock release
     * Only deletes the key if the value matches (prevents releasing someone else's lock)
     * Returns 1 if deleted, 0 if not found or value mismatch
     */
    @Bean
    public RedisScript<Long> unlockScript() {
        String script =
                "if redis.call('get', KEYS[1]) == ARGV[1] then " +
                        "    return redis.call('del', KEYS[1]) " +
                        "else " +
                        "    return 0 " +
                        "end";

        DefaultRedisScript<Long> redisScript = new DefaultRedisScript<>();
        redisScript.setScriptText(script);
        redisScript.setResultType(Long.class);
        return redisScript;
    }

    /**
     * Lua script for safe lock extension (optional)
     * Only extends TTL if the current lock value matches
     * Returns 1 if extended, 0 if lock doesn't exist or value mismatch
     */
    @Bean
    public RedisScript<Long> extendLockScript() {
        String script =
                "if redis.call('get', KEYS[1]) == ARGV[1] then " +
                        "    return redis.call('pexpire', KEYS[1], ARGV[2]) " +
                        "else " +
                        "    return 0 " +
                        "end";

        DefaultRedisScript<Long> redisScript = new DefaultRedisScript<>();
        redisScript.setScriptText(script);
        redisScript.setResultType(Long.class);
        return redisScript;
    }
}
