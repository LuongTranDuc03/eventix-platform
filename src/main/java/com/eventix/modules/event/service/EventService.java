package com.eventix.modules.event.service;

import com.eventix.common.exception.AppException;
import com.eventix.common.exception.ErrorCode;
import com.eventix.modules.event.dto.CreateEventRequest;
import com.eventix.modules.event.dto.EventResponse;
import com.eventix.modules.event.dto.ZoneResponse;
import com.eventix.modules.event.entity.Event;
import com.eventix.modules.event.entity.EventStatus;
import com.eventix.modules.event.entity.Zone;
import com.eventix.modules.event.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventService {

    private final EventRepository eventRepository;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String CACHE_EVENT_PREFIX = "event:detail:";
    private static final String STOCK_KEY_PREFIX = "zone:stock:"; // Chuẩn bị cho Giai đoạn 3

    // 1. Organizer tạo sự kiện
    @Transactional
    public EventResponse createEvent(Long organizerId, CreateEventRequest request) {
        if (request.getSalesEndTime().isBefore(request.getSalesStartTime())) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Thời gian kết thúc bán phải sau thời gian mở bán");
        }

        Event event = Event.builder()
                .organizerId(organizerId)
                .title(request.getTitle())
                .description(request.getDescription())
                .venue(request.getVenue())
                .bannerUrl(request.getBannerUrl())
                .salesStartTime(request.getSalesStartTime())
                .salesEndTime(request.getSalesEndTime())
                .maxTicketsPerUser(request.getMaxTicketsPerUser() != null ? request.getMaxTicketsPerUser() : 4)
                .status(EventStatus.PENDING_APPROVAL) // Chờ Admin duyệt
                .build();

        for (var zoneReq : request.getZones()) {
            Zone zone = Zone.builder()
                    .name(zoneReq.getName())
                    .zoneType(zoneReq.getZoneType())
                    .price(zoneReq.getPrice())
                    .totalCapacity(zoneReq.getTotalCapacity())
                    .availableCapacity(zoneReq.getTotalCapacity())
                    .build();
            event.addZone(zone);
        }

        Event savedEvent = eventRepository.save(event);
        return mapToResponse(savedEvent);
    }

    // 2. Admin duyệt sự kiện (PUBLISH) & PRE-WARM KHO VÉ VÀO REDIS
    @Transactional
    public EventResponse publishEvent(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy sự kiện"));

        event.setStatus(EventStatus.PUBLISHED);
        Event updatedEvent = eventRepository.save(event);
        EventResponse response = mapToResponse(updatedEvent);

        // --- PRE-WARM CACHE BƯỚC ĐỆM CHO CHỊU TẢI CAO ---
        // 1. Lưu thông tin chi tiết event vào Redis (TTL = 24h)
        String eventCacheKey = CACHE_EVENT_PREFIX + eventId;
        redisTemplate.opsForValue().set(eventCacheKey, response, Duration.ofHours(24));

        // 2. Nạp số lượng vé của từng Zone thẳng vào Redis Key: "zone:stock:{zoneId}"
        // Để chuẩn bị cho Giai đoạn 3 dùng Lua Script trừ kho tốc độ cao!
        for (Zone zone : updatedEvent.getZones()) {
            String stockKey = STOCK_KEY_PREFIX + zone.getId();
            redisTemplate.opsForValue().set(stockKey, zone.getAvailableCapacity().toString());
            log.info("Đã nạp sẵn kho vé Zone [{}] vào Redis: {} vé", zone.getName(), zone.getAvailableCapacity());
        }

        return response;
    }

    // 3. Khách hàng xem thông tin sự kiện (CHIẾN THUẬT CACHE-ASIDE)
    public EventResponse getEventById(Long eventId) {
        String cacheKey = CACHE_EVENT_PREFIX + eventId;

        // B1: Hỏi Redis trước (tốn ~1ms)
        Object cachedData = redisTemplate.opsForValue().get(cacheKey);
        if (cachedData != null) {
            // log.info("🔥 CACHE HIT: Lấy thông tin sự kiện [{}] từ Redis", eventId);
            return (EventResponse) cachedData;
        }

        // B2: Nếu Cache miss -> Truy vấn PostgreSQL
        log.warn("⚠️ CACHE MISS: Truy vấn Database cho sự kiện [{}]", eventId);
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy sự kiện"));

        EventResponse response = mapToResponse(event);

        // B3: Đẩy ngược lại vào Redis để phục vụ hàng ngàn người tiếp theo
        redisTemplate.opsForValue().set(cacheKey, response, Duration.ofHours(24));
        return response;
    }

    private EventResponse mapToResponse(Event event) {
        List<ZoneResponse> zoneResponses = event.getZones().stream()
                .map(z -> ZoneResponse.builder()
                        .id(z.getId())
                        .name(z.getName())
                        .zoneType(z.getZoneType())
                        .price(z.getPrice())
                        .totalCapacity(z.getTotalCapacity())
                        .availableCapacity(z.getAvailableCapacity())
                        .build())
                .toList();

        return EventResponse.builder()
                .id(event.getId())
                .organizerId(event.getOrganizerId())
                .title(event.getTitle())
                .description(event.getDescription())
                .venue(event.getVenue())
                .bannerUrl(event.getBannerUrl())
                .status(event.getStatus())
                .salesStartTime(event.getSalesStartTime())
                .salesEndTime(event.getSalesEndTime())
                .maxTicketsPerUser(event.getMaxTicketsPerUser())
                .zones(zoneResponses)
                .build();
    }
}