package com.omkar.uni.verse.services.impl;

import com.omkar.uni.verse.services.RedisLockService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class RedisLockServiceImpl implements RedisLockService {

    private final StringRedisTemplate redisTemplate;
    private final RedisScript<Long> unlockScript;
    private final RedisScript<Long> extendLockScript;

    private static final String LOCK_PREFIX = "lock:";

    @Override
    public boolean tryLock(String resource, String lockValue, long ttl, TimeUnit unit) {
        String key = LOCK_PREFIX + resource;

        try {
            Boolean acquired = redisTemplate.opsForValue()
                    .setIfAbsent(key, lockValue, ttl, unit);

            if (Boolean.TRUE.equals(acquired)) {
                log.debug("Lock acquired: {} with value: {}", key, lockValue);
                return true;
            }

            log.debug("Lock already held : {}", key);
            return false;
        } catch (Exception e) {
            log.debug("Failed to acquire lock for resource {}", resource, e);
            return false;
        }
    }

    @Override
    public boolean unlock(String resource, String lockValue) {
        String key = LOCK_PREFIX + resource;

        try {
            Long result = redisTemplate.execute(
                    unlockScript,
                    Collections.singletonList(key),
                    lockValue
            );

            boolean unlocked = Long.valueOf(1L).equals(result);
            if (unlocked) {
                log.debug("Lock released: {}", key);
            } else {
                log.warn("Failed to release lock (not owner or expired): {}", key);
            }

            return unlocked;
        } catch (Exception e) {
            log.error("Failed to release lock for resource {}", resource, e);
            return false;
        }
    }

    @Override
    public boolean extendLock(String resource, String lockValue, long additionalTtl, TimeUnit unit) {
        String key = LOCK_PREFIX + resource;
        long ttlMillis = unit.toMillis(additionalTtl);
        try {
            Long result = redisTemplate.execute(
                    extendLockScript,
                    Collections.singletonList(key),
                    lockValue,
                    String.valueOf(ttlMillis)
            );

            boolean extended = Long.valueOf(1L).equals(result);
            if (extended) {
                log.debug("Lock increased: {} by {}ms", key, ttlMillis);
            } else {
                log.warn("Failed to extend lock (not owner or expired): {}", key);
            }

            return extended;
        } catch (Exception e) {
            log.error("Failed to extend lock for resource {}", resource, e);
            return false;
        }
    }

    @Override
    public boolean isLocked(String resource) {
        String key = LOCK_PREFIX + resource;
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

    @Override
    public long getLockTtl(String resource) {
        String key = LOCK_PREFIX + resource;
        Long ttl = redisTemplate.getExpire(key, TimeUnit.MILLISECONDS);
        return ttl != null ? ttl : -1L;
    }
}
