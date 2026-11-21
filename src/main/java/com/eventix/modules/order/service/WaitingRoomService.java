package com.eventix.modules.order.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class WaitingRoomService {

    private final RedisTemplate<String, Object> redisTemplate;

    private static final String WAITING_QUEUE_PREFIX = "event:queue:";
    private static final String PASS_TOKEN_PREFIX = "event:token:";

    // 1. Khách hàng tham gia xếp hàng phòng chờ
    public Long joinQueue(Long eventId, Long userId) {
        String queueKey = WAITING_QUEUE_PREFIX + eventId;
        double score = System.currentTimeMillis();

        // Đưa user vào Redis Sorted Set với score là thời gian vào hàng đợi
        redisTemplate.opsForZSet().add(queueKey, userId.toString(), score);

        // Trả về vị trí hiện tại trong hàng đợi (0-indexed)
        Long rank = redisTemplate.opsForZSet().rank(queueKey, userId.toString());
        return rank != null ? rank + 1 : 1;
    }

    // 2. Kiểm tra vị trí của khách trong hàng đợi
    public Long getQueuePosition(Long eventId, Long userId) {
        String queueKey = WAITING_QUEUE_PREFIX + eventId;
        Long rank = redisTemplate.opsForZSet().rank(queueKey, userId.toString());
        return rank != null ? rank + 1 : -1L; // -1 nghĩa là không có trong hàng đợi
    }

    // 3. Tiến trình ngầm (Worker) xả van: Lấy ra N người đứng đầu hàng đợi cấp
    // Token cho họ vào mua vé
    public String generatePassToken(Long eventId, Long userId) {
        String token = UUID.randomUUID().toString();
        String tokenKey = PASS_TOKEN_PREFIX + eventId + ":" + userId;

        // Cấp token có thời hạn 15 phút
        redisTemplate.opsForValue().set(tokenKey, token, 15, TimeUnit.MINUTES);

        // Xóa user khỏi hàng đợi chờ
        String queueKey = WAITING_QUEUE_PREFIX + eventId;
        redisTemplate.opsForZSet().remove(queueKey, userId.toString());

        return token;
    }

    // 4. Kiểm tra xem Token thông hành có hợp lệ không
    public boolean validatePassToken(Long eventId, Long userId, String token) {
        String tokenKey = PASS_TOKEN_PREFIX + eventId + ":" + userId;
        Object storedToken = redisTemplate.opsForValue().get(tokenKey);
        return storedToken != null && storedToken.equals(token);
    }
}