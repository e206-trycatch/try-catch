FROM gradle:8.5-jdk21 AS builder
WORKDIR /app

# 의존성 캐싱!
COPY build.gradle settings.gradle ./
RUN gradle dependencies --no-daemon || return 0

COPY . .
RUN gradle build -x test --no-daemon

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar

HEALTHCHECK CMD curl -f http://localhost:8080/actuator/health || exit 1

EXPOSE 8080

ENTRYPOINT ["java", "-Duser.timezone=Asia/Seoul", "-jar", "app.jar"]