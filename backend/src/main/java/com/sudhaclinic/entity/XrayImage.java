package com.sudhaclinic.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Represents an X-ray image uploaded for a patient, optionally associated with a specific visit.
 * Files are stored on the local filesystem; this entity records metadata only.
 */
@Entity
@Table(name = "xray_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class XrayImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;



    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String filePath;

    @Column(nullable = false, updatable = false)
    private LocalDateTime uploadedAt;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @PrePersist
    public void prePersist() {
        this.uploadedAt = LocalDateTime.now();
    }
}
