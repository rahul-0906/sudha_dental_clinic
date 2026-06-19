package com.sudhaclinic.controller;

import com.sudhaclinic.entity.ChatMessage;
import com.sudhaclinic.service.ChatMessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = {"http://localhost:5174", "http://127.0.0.1:5174"}, allowCredentials = "true")
@RequiredArgsConstructor
public class ChatMessageController {

    private final ChatMessageService chatMessageService;

    @GetMapping
    public ResponseEntity<List<ChatMessage>> getAllMessages() {
        log.debug("GET /api/messages");
        return ResponseEntity.ok(chatMessageService.getAllMessages());
    }

    @GetMapping("/patient/{phone}")
    public ResponseEntity<List<ChatMessage>> getMessagesByPatient(@PathVariable String phone) {
        log.debug("GET /api/messages/patient/{}", phone);
        return ResponseEntity.ok(chatMessageService.getMessagesByPatient(phone));
    }

    @PostMapping
    public ResponseEntity<?> sendMessage(@RequestBody ChatMessage message) {
        log.info("POST /api/messages - Sending message to: {}", message.getRecipientPhone());
        try {
            ChatMessage saved = chatMessageService.saveMessage(message);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            log.error("Failed to send message", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
