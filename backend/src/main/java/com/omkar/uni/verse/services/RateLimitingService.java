package com.omkar.uni.verse.services;

import io.github.bucket4j.Bucket;

public interface RateLimitingService {
    Bucket resolveBucketWithGreedyRefill(String key, int requestsPerMinute);

    Bucket resolveEmailBucket(String email);

}
