package com.omkar.uni.verse.services;

import java.util.concurrent.TimeUnit;

public interface RedisLockService {
    boolean tryLock(String resource, String lockValue, long ttl, TimeUnit unit);

    boolean unlock(String resource, String lockValue);

    boolean extendLock(String resource, String lockValue, long additionalTtl, TimeUnit unit);

    boolean isLocked(String resource);

    long getLockTtl(String resource);
}
