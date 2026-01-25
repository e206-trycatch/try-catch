######################## 1) Build Stage ########################
FROM gradle:8.5-jdk21 AS builder
WORKDIR /app

# Gradle 설정/래퍼 먼저 복사
COPY build.gradle settings.gradle ./
COPY gradle ./gradle
COPY gradlew ./
RUN chmod +x gradlew

# 의존성/플러그인 캐시
RUN ./gradlew dependencies --no-daemon

# 소스 복사 후 빌드
COPY . .
RUN ./gradlew build -x test --no-daemon


######################## 2) Runtime Stage ######################
FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8081

ENTRYPOINT ["java", "-Duser.timezone=Asia/Seoul", "-jar", "app.jar"]