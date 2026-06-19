package com.sudhaclinic.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String senderName;
    private String senderRole;
    private String recipientPhone;

    @Column(columnDefinition = "TEXT")
    private String messageText;

    private LocalDateTime sentAt;
    private String status; // SENT, READ
    private String type;   // WHATSAPP, SMS, INTERNAL

    @PrePersist
    public void prePersist() {
        if (this.sentAt == null) {
            this.sentAt = LocalDateTime.now();
        }
    }
}
