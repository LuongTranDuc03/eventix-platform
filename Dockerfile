# Sử dụng OpenJDK 21 tối giản trên nền Alpine Linux
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy file jar đã build vào container (Yêu cầu bạn phải chạy mvn clean package trước)
COPY target/*.jar app.jar

# Expose cổng 8080 của Spring Boot
EXPOSE 8080

# Chạy ứng dụng Java 21 với Virtual Threads đã kích hoạt sẵn trong cấu hình
ENTRYPOINT ["java", "-jar", "app.jar"]