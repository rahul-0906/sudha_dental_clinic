package com.sudhaclinic.service;

import com.sudhaclinic.entity.Patient;
import com.sudhaclinic.entity.XrayImage;
import com.sudhaclinic.repository.PatientRepository;
import com.sudhaclinic.repository.XrayImageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class XrayService {

    @Value("${clinic.xray.upload-dir}")
    private String uploadDir;

    private final XrayImageRepository xrayImageRepository;
    private final PatientRepository patientRepository;

    /**
     * Upload an X-ray image for a patient. Optionally linked to a visit.
     * Stores the file on the local filesystem and saves metadata to the database.
     */
    @Transactional
    public XrayImage uploadXray(Long patientId, MultipartFile file, String notes) {
        log.info("Uploading X-ray for patient {}", patientId);

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found with ID: " + patientId));

        // Generate a unique filename to avoid collisions
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String uniqueFileName = "xray_p" + patientId + "_" + timestamp + "_" + UUID.randomUUID().toString().substring(0, 8) + extension;

        // Save file to disk
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(uploadPath);
            Path targetPath = uploadPath.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            log.info("X-ray file saved: {}", targetPath);
        } catch (IOException e) {
            log.error("Failed to save X-ray file: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to store X-ray file: " + e.getMessage(), e);
        }

        // Build and save XrayImage entity
        XrayImage xrayImage = XrayImage.builder()
                .patient(patient)
                .fileName(uniqueFileName)
                .filePath(Paths.get(uploadDir).toAbsolutePath().normalize().toString() + "/" + uniqueFileName)
                .notes(notes)
                .build();



        XrayImage saved = xrayImageRepository.save(xrayImage);
        log.info("X-ray metadata saved with ID: {}", saved.getId());
        return saved;
    }

    /**
     * Return all X-ray images for a given patient.
     */
    @Transactional(readOnly = true)
    public List<XrayImage> getXraysByPatient(Long patientId) {
        patientRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found with ID: " + patientId));
        return xrayImageRepository.findByPatientId(patientId);
    }



    /**
     * Delete an X-ray image by ID (removes both DB record and file).
     */
    @Transactional
    public void deleteXray(Long id) {
        XrayImage xrayImage = xrayImageRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("X-ray not found with ID: " + id));
        try {
            Path filePath = Paths.get(xrayImage.getFilePath());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.warn("Could not delete X-ray file: {}", xrayImage.getFilePath(), e);
        }
        xrayImageRepository.delete(xrayImage);
        log.info("X-ray ID {} deleted.", id);
    }

    /**
     * Serve an X-ray file by filename as a Spring Resource for streaming to the client.
     */
    public Resource serveXray(String fileName) {
        try {
            Path filePath = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(fileName);
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new IllegalArgumentException("X-ray file not found or not readable: " + fileName);
            }
        } catch (MalformedURLException e) {
            throw new IllegalArgumentException("Invalid file path for: " + fileName, e);
        }
    }
}
