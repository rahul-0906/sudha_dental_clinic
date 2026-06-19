package com.sudhaclinic.service;

import com.sudhaclinic.entity.ChatMessage;
import com.sudhaclinic.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;

    @Transactional(readOnly = true)
    public List<ChatMessage> getAllMessages() {
        log.debug("Fetching all chat messages");
        return chatMessageRepository.findAllByOrderBySentAtAsc();
    }

    @Transactional(readOnly = true)
    public List<ChatMessage> getMessagesByPatient(String phone) {
        log.debug("Fetching messages for patient phone: {}", phone);
        return chatMessageRepository.findByRecipientPhoneOrderBySentAtAsc(phone);
    }

    @Transactional
    public ChatMessage saveMessage(ChatMessage message) {
        log.info("Saving chat message sent to: {}", message.getRecipientPhone());
        message.setSentAt(LocalDateTime.now());
        if (message.getStatus() == null) {
            message.setStatus("SENT");
        }
        return chatMessageRepository.save(message);
    }
}
