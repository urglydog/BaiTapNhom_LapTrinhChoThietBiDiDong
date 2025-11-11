# Cập nhật Spring Boot để hỗ trợ ảnh

## 1. Thêm dependency cho file upload
```xml
<dependency>
    <groupId>commons-fileupload</groupId>
    <artifactId>commons-fileupload</artifactId>
    <version>1.4</version>
</dependency>
```

## 2. Cập nhật application.properties
```properties
# File upload settings
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# Static resources
spring.web.resources.static-locations=classpath:/static/,file:uploads/
```

## 3. Tạo FileController để xử lý upload ảnh
```java
@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*")
public class FileController {
    
    @Value("${file.upload-dir}")
    private String uploadDir;
    
    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path targetLocation = Paths.get(uploadDir).resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            
            String fileUrl = "/uploads/" + fileName;
            return ResponseEntity.ok(Map.of("url", fileUrl));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Could not upload file");
        }
    }
}
```

## 4. Cập nhật Movie entity để hỗ trợ ảnh
```java
@Entity
@Table(name = "movies")
public class Movie {
    // ... existing fields ...
    
    @Column(name = "poster_url")
    private String posterUrl;
    
    @Column(name = "trailer_url")
    private String trailerUrl;
    
    // ... getters and setters ...
}
```

## 5. Tạo thư mục uploads
```bash
mkdir -p src/main/resources/static/uploads
```

## 6. Cập nhật MovieService để xử lý ảnh
```java
@Service
public class MovieService {
    
    public Movie createMovie(Movie movie, MultipartFile posterFile) {
        if (posterFile != null && !posterFile.isEmpty()) {
            String posterUrl = uploadFile(posterFile);
            movie.setPosterUrl(posterUrl);
        }
        return movieRepository.save(movie);
    }
    
    private String uploadFile(MultipartFile file) {
        // Implementation for file upload
        return "/uploads/" + file.getOriginalFilename();
    }
}
```

## 7. Cập nhật CORS configuration
```java
@Configuration
public class CorsConfig {
    
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.addAllowedOriginPattern("*");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        
        return new CorsFilter(source);
    }
}
```

## 8. Cập nhật database schema (nếu cần)
```sql
ALTER TABLE movies ADD COLUMN poster_url VARCHAR(500);
ALTER TABLE movies ADD COLUMN trailer_url VARCHAR(500);
ALTER TABLE cinemas ADD COLUMN image_url VARCHAR(500);
```

## 9. Tạo endpoint để lấy ảnh
```java
@RestController
@RequestMapping("/api/images")
public class ImageController {
    
    @GetMapping("/{filename}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) {
        try {
            Path filePath = Paths.get("uploads").resolve(filename);
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists()) {
                return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
```

## 10. Cập nhật frontend để hiển thị ảnh
```typescript
// Trong MovieCard component
<Image 
  source={{ uri: movie.posterUrl || 'https://via.placeholder.com/300x400' }}
  style={styles.poster}
  resizeMode="cover"
/>
```


