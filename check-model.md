# Kiểm tra Model hiện tại

## Nếu model Movie đã có sẵn các field:
```java
@Entity
@Table(name = "movies")
public class Movie {
    // ... existing fields ...
    
    @Column(name = "poster_url")
    private String posterUrl;
    
    @Column(name = "trailer_url") 
    private String trailerUrl;
    
    // ... other fields ...
}
```

## Thì bạn chỉ cần:

### 1. **Chạy SQL script** để thêm dữ liệu:
```sql
-- Chạy file sample-data.sql vào database
-- Nó sẽ thêm 10 phim với ảnh poster
```

### 2. **Cập nhật database** (nếu cần):
```sql
-- Chỉ cần chạy nếu chưa có column poster_url
ALTER TABLE movies ADD COLUMN poster_url VARCHAR(500);
ALTER TABLE movies ADD COLUMN trailer_url VARCHAR(500);
```

### 3. **Test app** - frontend đã sẵn sàng hiển thị ảnh!

## Nếu model chưa có posterUrl:
- Thêm field `posterUrl` và `trailerUrl` vào Movie entity
- Thêm getter/setter
- Restart Spring Boot

## Nếu đã có rồi:
- Chỉ cần chạy SQL script
- Test app ngay!

