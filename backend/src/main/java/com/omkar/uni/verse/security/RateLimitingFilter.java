package com.omkar.uni.verse.security;

import com.omkar.uni.verse.services.JwtService;
import com.omkar.uni.verse.services.RateLimitingService;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class RateLimitingFilter implements Filter {
    private final RateLimitingService rateLimitingService;
    private final JwtService jwtService;
    @Value("${requests.per.minute}")
    private int allowedRequestsPerMinute;

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest httpServletRequest = (HttpServletRequest) servletRequest;
        HttpServletResponse httpServletResponse = (HttpServletResponse) servletResponse;

        // Get the clientKey to assign a bucket
        String clientKey = getClientKey(httpServletRequest);

        // Get or create a bucket for this client
        Bucket bucket = rateLimitingService.resolveBucketWithGreedyRefill(clientKey, allowedRequestsPerMinute);

        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);

        if (probe.isConsumed()) {
            // Request allowed - add rate limit headers
            httpServletResponse.setHeader("X-Rate-Limiting-Remaining", String.valueOf(probe.getRemainingTokens()));
            filterChain.doFilter(servletRequest, servletResponse);
        } else {
            long waitForRefill = probe.getNanosToWaitForRefill() / 1_000_000_000;
            httpServletResponse.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            httpServletResponse.setHeader("X-Rate-Limit-Retry-After-Seconds", String.valueOf(waitForRefill));
            httpServletResponse.setContentType("application/json");
            httpServletResponse.getWriter().write(
                    String.format("{\"error\":\"Rate limit exceeded. Try again in %d seconds\"}", waitForRefill)
            );
            log.warn("Rate limit exceeded for client: {}", clientKey);
        }

    }

    private String getClientKey(HttpServletRequest httpServletRequest) {
        // User based rate limiting key
        String jwt = httpServletRequest.getHeader("Authorization");
        if (jwt != null && jwt.startsWith("Bearer ")) {
            try {
                String token = jwt.substring(7);
                String username = jwtService.extractUsername(token);

                if (username != null) {
                    return "user:" + username;
                }
            } catch (Exception e) {
                log.warn("Failed to extract user from jwt: {}", e.getMessage());
            }
        }

        // IP based rate limiting key
        String clientIp = httpServletRequest.getHeader("X-Forwarded-For");
        if (clientIp == null || clientIp.isEmpty()) {
            clientIp = httpServletRequest.getRemoteAddr();
        }

        return clientIp;
    }
}
