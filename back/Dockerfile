FROM eclipse-temurin:25-jdk AS builder
WORKDIR /app

# 의존성 레이어 캐시 (build.gradle.kts 변경 없으면 재다운로드 안 함)
COPY gradlew .
COPY gradle gradle
COPY build.gradle.kts settings.gradle.kts ./
RUN ./gradlew dependencies --no-daemon --console=plain 2>/dev/null || true

COPY src ./src
RUN ./gradlew bootJar -x test --no-daemon

FROM eclipse-temurin:25-jre
WORKDIR /app

RUN groupadd -r spring && useradd -r -g spring spring
USER spring

COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
