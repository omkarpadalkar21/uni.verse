package com.omkar.uni.verse.services.impl;

import com.omkar.uni.verse.services.RateLimitingService;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.BucketConfiguration;
import io.github.bucket4j.distributed.proxy.ProxyManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.function.Supplier;

@Service
@RequiredArgsConstructor
public class RateLimitingServiceImpl implements RateLimitingService {

    private final ProxyManager<String> proxyManager;

    @Override
    public Bucket resolveBucketWithGreedyRefill(String key, int requestsPerMinute) {
        Supplier<BucketConfiguration> configurationSupplier = () -> {
            Bandwidth limit = Bandwidth.builder()
                    .capacity(requestsPerMinute)
                    .refillGreedy(requestsPerMinute, Duration.ofMinutes(1))
                    .build();

            return BucketConfiguration.builder()
                    .addLimit(limit)
                    .build();
        };

        return proxyManager.builder().build(key, configurationSupplier);
    }

    @Override
    public Bucket resolveEmailBucket(String email) {
        String bucketKey = "email:" + email;
        Supplier<BucketConfiguration> configurationSupplier = () -> {
            Bandwidth limit = Bandwidth.builder()
                    .capacity(5)
                    .refillGreedy(5, Duration.ofHours(1)) // 5 Emails per hour per user
                    .build();

            return BucketConfiguration.builder()
                    .addLimit(limit)
                    .build();
        };

        return proxyManager.builder().build(bucketKey, configurationSupplier);
    }
}
