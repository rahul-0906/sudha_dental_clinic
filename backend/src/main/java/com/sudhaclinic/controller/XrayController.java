package com.sudhaclinic.controller;

import com.sudhaclinic.entity.XrayImage;
import com.sudhaclinic.service.XrayService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/xrays")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5174", "http://127.0.0.1:5174"})
public class XrayController {

    private final XrayService xrayService;

    @PostMapping("/upload")
    public ResponseEntity<XrayImage> uploadXray(
            @RequestParam("patientId") Long patientId,
            @RequestParam(value = "visitId", required = false) Long visitId,
            @RequestParam(value = "notes", required = false) String notes,
            @RequestParam("file") MultipartFile file) {
        XrayImage image = xrayService.uploadXray(patientId, visitId, file, notes);
        return ResponseEntity.ok(image);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<XrayImage>> getPatientXrays(@PathVariable Long patientId) {
        return ResponseEntity.ok(xrayService.getXraysByPatient(patientId));
    }

    @GetMapping("/visit/{visitId}")
    public ResponseEntity<List<XrayImage>> getVisitXrays(@PathVariable Long visitId) {
        return ResponseEntity.ok(xrayService.getXraysByVisit(visitId));
    }

    @GetMapping("/files/{fileName:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String fileName) {
        Resource resource = xrayService.serveXray(fileName);
        String contentType = "image/jpeg";
        if (fileName.toLowerCase().endsWith(".png")) {
            contentType = "image/png";
        } else if (fileName.toLowerCase().endsWith(".gif")) {
            contentType = "image/gif";
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteXray(@PathVariable Long id) {
        xrayService.deleteXray(id);
        return ResponseEntity.noContent().build();
    }
}
