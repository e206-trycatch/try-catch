package io.ssafy.trycatch.websocket.common;

import io.ssafy.trycatch.domain.room.enums.RoomMode;

import java.time.Duration;

public enum TimeLimitPolicy {
    SINGLE(RoomMode.SINGLE, Duration.ofMinutes(1)),
    MULTI(RoomMode.MULTI, Duration.ofMinutes(20));

    private final RoomMode mode;
    private final Duration limit;

    TimeLimitPolicy(RoomMode mode, Duration limit) {
        this.mode = mode;
        this.limit = limit;
    }

    public Duration getLimit() {
        return limit;
    }

    public static Duration resolve(RoomMode mode) {
        for (TimeLimitPolicy policy : values()) {
            if (policy.mode == mode) {
                return policy.limit;
            }
        }
        throw new IllegalArgumentException("No time limit policy for mode=" + mode);
    }
}