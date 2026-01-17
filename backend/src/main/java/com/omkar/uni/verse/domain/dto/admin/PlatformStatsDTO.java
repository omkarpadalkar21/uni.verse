package com.omkar.uni.verse.domain.dto.admin;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class PlatformStatsDTO {
    long totalClubs;
    long totalEvents;
    long totalUsers;
    long pendingApprovals;
}
