package com.sudhaclinic.repository;

import com.sudhaclinic.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByRecipientPhoneOrderBySentAtAsc(String recipientPhone);
    List<ChatMessage> findAllByOrderBySentAtAsc();
}
