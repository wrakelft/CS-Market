package ru.itmo.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.itmo.backend.model.Attachment;

import java.util.List;

public interface AttachmentRepository extends JpaRepository<Attachment, Integer> {
    List<Attachment> findByTicketId(Long ticketId);
}