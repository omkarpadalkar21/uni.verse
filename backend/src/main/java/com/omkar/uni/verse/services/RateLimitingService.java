package com.omkar.uni.verse.services;

import io.github.bucket4j.Bucket;

public interface RateLimitingService {
    public Bucket resolveBucketWithGreedyRefil(String key,int requestsPerMinute);
}
