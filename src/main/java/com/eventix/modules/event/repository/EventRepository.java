package com.eventix.modules.event.repository;

import com.eventix.modules.event.entity.Event;
import com.eventix.modules.event.entity.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByStatus(EventStatus status);

    List<Event> findByOrganizerId(Long organizerId);
}