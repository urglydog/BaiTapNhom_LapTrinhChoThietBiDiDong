-- Sample data với ảnh cho Movie App

-- Thêm nhiều User
INSERT INTO users (username, email, password, full_name, phone, date_of_birth, gender, role, active) VALUES
('admin', 'admin@movieticket.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'Admin System', '0123456789', '1990-01-01', 'MALE', 'ADMIN', true),
('staff1', 'staff1@movieticket.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'Nguyễn Văn A', '0987654321', '1995-05-15', 'MALE', 'STAFF', true),
('customer1', 'customer1@gmail.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'Trần Thị B', '0912345678', '1998-08-20', 'FEMALE', 'CUSTOMER', true),
('customer2', 'customer2@gmail.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'Lê Văn C', '0923456789', '1992-12-10', 'MALE', 'CUSTOMER', true),
('customer3', 'customer3@gmail.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'Phạm Thị D', '0934567890', '1995-03-25', 'FEMALE', 'CUSTOMER', true),
('customer4', 'customer4@gmail.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'Hoàng Văn E', '0945678901', '1993-07-12', 'MALE', 'CUSTOMER', true);

-- Thêm nhiều Cinema
INSERT INTO cinemas (name, address, phone, email, description, image_url, active) VALUES
('CGV Vincom Center', 'Tầng 4, Vincom Center, 72 Lê Thánh Tôn, Q.1, TP.HCM', '028 3822 8888', 'cgv@cgv.vn', 'Rạp chiếu phim hiện đại với công nghệ IMAX', 'https://images.unsplash.com/photo-1489599808427-5a6b3b3b3b3b?w=800', true),
('Lotte Cinema', 'Tầng 7, Lotte Center, 54 Liễu Giai, Ba Đình, Hà Nội', '024 3773 3333', 'lotte@lotte.vn', 'Rạp chiếu phim cao cấp với ghế VIP', 'https://images.unsplash.com/photo-1489599808427-5a6b3b3b3b3b?w=800', true),
('Galaxy Cinema', 'Tầng 3, Vincom Plaza, 50 Lê Văn Việt, Q.9, TP.HCM', '028 3730 8888', 'galaxy@galaxy.vn', 'Rạp chiếu phim với âm thanh Dolby Atmos', 'https://images.unsplash.com/photo-1489599808427-5a6b3b3b3b3b?w=800', true),
('BHD Star Cineplex', 'Tầng 4, Crescent Mall, 101 Tôn Dật Tiên, Q.7, TP.HCM', '028 3773 3333', 'bhd@bhd.vn', 'Rạp chiếu phim với màn hình 4K', 'https://images.unsplash.com/photo-1489599808427-5a6b3b3b3b3b?w=800', true),
('Mega GS', 'Tầng 3, Aeon Mall, 1 Đường Tân Thuận, Q.7, TP.HCM', '028 3773 3333', 'mega@mega.vn', 'Rạp chiếu phim với công nghệ 3D', 'https://images.unsplash.com/photo-1489599808427-5a6b3b3b3b3b?w=800', true);

-- Thêm nhiều Movie với ảnh
INSERT INTO movies (title, description, duration, release_date, end_date, genre, director, cast, rating, poster_url, trailer_url, language, subtitle, age_rating, active) VALUES
('Avatar: The Way of Water', 'Jake Sully và gia đình của anh ấy khám phá những vùng biển của Pandora và gặp gỡ những sinh vật biển kỳ lạ.', 192, '2022-12-16', '2023-03-16', 'Sci-Fi, Action', 'James Cameron', 'Sam Worthington, Zoe Saldana, Sigourney Weaver', 8.5, 'https://images.unsplash.com/photo-1574375927938-c5f442f1e76e?w=500', 'https://www.youtube.com/watch?v=d9MyW72ELq0', 'English', 'Vietnamese', 'PG-13', true),
('Black Panther: Wakanda Forever', 'Sau cái chết của Vua T''Challa, Wakanda phải đối mặt với những thách thức mới.', 161, '2022-11-11', '2023-02-11', 'Action, Adventure', 'Ryan Coogler', 'Letitia Wright, Angela Bassett, Lupita Nyong''o', 7.8, 'https://images.unsplash.com/photo-1574375927938-c5f442f1e76e?w=500', 'https://www.youtube.com/watch?v=_Z3QKkl1WyM', 'English', 'Vietnamese', 'PG-13', true),
('Top Gun: Maverick', 'Pete "Maverick" Mitchell trở lại với nhiệm vụ nguy hiểm nhất trong sự nghiệp của mình.', 131, '2022-05-27', '2023-01-27', 'Action, Drama', 'Joseph Kosinski', 'Tom Cruise, Miles Teller, Jennifer Connelly', 8.9, 'https://images.unsplash.com/photo-1574375927938-c5f442f1e76e?w=500', 'https://www.youtube.com/watch?v=qSqVVswa420', 'English', 'Vietnamese', 'PG-13', true),
('Spider-Man: No Way Home', 'Peter Parker cần sự giúp đỡ của Doctor Strange để che giấu danh tính của mình.', 148, '2021-12-17', '2022-06-17', 'Action, Adventure', 'Jon Watts', 'Tom Holland, Zendaya, Benedict Cumberbatch', 8.7, 'https://images.unsplash.com/photo-1574375927938-c5f442f1e76e?w=500', 'https://www.youtube.com/watch?v=JfVOs4VSpmA', 'English', 'Vietnamese', 'PG-13', true),
('The Batman', 'Khi một kẻ giết người hàng loạt bắt đầu tàn sát giới thượng lưu của Gotham, Batman phải điều tra.', 176, '2022-03-04', '2022-09-04', 'Action, Crime', 'Matt Reeves', 'Robert Pattinson, Zoë Kravitz, Paul Dano', 8.2, 'https://images.unsplash.com/photo-1574375927938-c5f442f1e76e?w=500', 'https://www.youtube.com/watch?v=mqqft2x_Aa4', 'English', 'Vietnamese', 'PG-13', true),
('Doctor Strange in the Multiverse of Madness', 'Doctor Strange khám phá đa vũ trụ và gặp gỡ các phiên bản khác của chính mình.', 126, '2022-05-06', '2022-11-06', 'Action, Adventure', 'Sam Raimi', 'Benedict Cumberbatch, Elizabeth Olsen, Chiwetel Ejiofor', 7.5, 'https://images.unsplash.com/photo-1574375927938-c5f442f1e76e?w=500', 'https://www.youtube.com/watch?v=aWzlQ2N6qqg', 'English', 'Vietnamese', 'PG-13', true),
('Thor: Love and Thunder', 'Thor cùng với Valkyrie, Korg và Jane Foster chiến đấu chống lại Gorr the God Butcher.', 119, '2022-07-08', '2023-01-08', 'Action, Adventure', 'Taika Waititi', 'Chris Hemsworth, Natalie Portman, Christian Bale', 7.8, 'https://images.unsplash.com/photo-1574375927938-c5f442f1e76e?w=500', 'https://www.youtube.com/watch?v=Go8nTmfrQd8', 'English', 'Vietnamese', 'PG-13', true),
('Jurassic World Dominion', 'Owen và Claire phải đối mặt với những con khủng long nguy hiểm nhất từ trước đến nay.', 147, '2022-06-10', '2023-01-10', 'Action, Adventure', 'Colin Trevorrow', 'Chris Pratt, Bryce Dallas Howard, Laura Dern', 7.2, 'https://images.unsplash.com/photo-1574375927938-c5f442f1e76e?w=500', 'https://www.youtube.com/watch?v=fb5ELWi-ekk', 'English', 'Vietnamese', 'PG-13', true),
('Minions: The Rise of Gru', 'Câu chuyện về Gru khi còn nhỏ và những Minion đầu tiên của anh ta.', 87, '2022-07-01', '2023-01-01', 'Animation, Comedy', 'Kyle Balda', 'Steve Carell, Pierre Coffin, Alan Arkin', 7.8, 'https://images.unsplash.com/photo-1574375927938-c5f442f1e76e?w=500', 'https://www.youtube.com/watch?v=6DxjJzmYsXo', 'English', 'Vietnamese', 'PG', true),
('Lightyear', 'Câu chuyện về Buzz Lightyear và cuộc phiêu lưu vũ trụ của anh ta.', 105, '2022-06-17', '2023-01-17', 'Animation, Adventure', 'Angus MacLane', 'Chris Evans, Keke Palmer, Peter Sohn', 7.2, 'https://images.unsplash.com/photo-1574375927938-c5f442f1e76e?w=500', 'https://www.youtube.com/watch?v=BwPL0Md_QFQ', 'English', 'Vietnamese', 'PG', true);

-- Thêm Showtimes cho các phim
INSERT INTO showtimes (movie_id, cinema_id, show_date, start_time, end_time, price, active) VALUES
-- Avatar: The Way of Water
(1, 1, '2023-01-15', '09:00:00', '12:12:00', 120000, true),
(1, 1, '2023-01-15', '13:00:00', '16:12:00', 120000, true),
(1, 1, '2023-01-15', '17:00:00', '20:12:00', 120000, true),
(1, 2, '2023-01-15', '10:00:00', '13:12:00', 150000, true),
(1, 2, '2023-01-15', '14:00:00', '17:12:00', 150000, true),

-- Black Panther: Wakanda Forever
(2, 1, '2023-01-15', '10:00:00', '12:41:00', 100000, true),
(2, 1, '2023-01-15', '14:00:00', '16:41:00', 100000, true),
(2, 3, '2023-01-15', '11:00:00', '13:41:00', 110000, true),
(2, 3, '2023-01-15', '15:00:00', '17:41:00', 110000, true),

-- Top Gun: Maverick
(3, 2, '2023-01-15', '11:00:00', '13:11:00', 150000, true),
(3, 2, '2023-01-15', '15:00:00', '17:11:00', 150000, true),
(3, 4, '2023-01-15', '12:00:00', '14:11:00', 130000, true),

-- Spider-Man: No Way Home
(4, 3, '2023-01-15', '15:00:00', '17:28:00', 110000, true),
(4, 3, '2023-01-15', '19:00:00', '21:28:00', 110000, true),
(4, 5, '2023-01-15', '16:00:00', '18:28:00', 100000, true),

-- The Batman
(5, 4, '2023-01-15', '19:00:00', '21:56:00', 130000, true),
(5, 4, '2023-01-15', '22:00:00', '00:56:00', 130000, true),
(5, 5, '2023-01-15', '20:00:00', '22:56:00', 120000, true);

-- Thêm Reviews
INSERT INTO reviews (user_id, movie_id, rating, comment, approved) VALUES
(3, 1, 5, 'Phim hay tuyệt vời! Hiệu ứng đẹp mắt.', true),
(4, 1, 4, 'Tốt nhưng hơi dài.', true),
(3, 2, 5, 'Black Panther tuyệt vời!', true),
(4, 3, 5, 'Top Gun Maverick hay quá!', true),
(3, 4, 4, 'Spider-Man No Way Home thú vị.', true),
(5, 1, 5, 'Avatar 2 xuất sắc!', true),
(5, 2, 4, 'Black Panther 2 ổn.', true),
(6, 3, 5, 'Top Gun 2 hay không tưởng!', true),
(6, 4, 4, 'Spider-Man hay nhưng hơi dài.', true),
(5, 5, 5, 'The Batman tối tăm và hay!', true);

-- Thêm Favourites
INSERT INTO favourites (user_id, movie_id) VALUES
(3, 1),
(3, 2),
(4, 3),
(4, 4),
(5, 1),
(5, 3),
(6, 2),
(6, 4),
(3, 5),
(4, 5);

