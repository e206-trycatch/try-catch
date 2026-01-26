package io.ssafy.trycatch.global.config;

import io.ssafy.trycatch.domain.room.entity.ProblemFile;
import io.ssafy.trycatch.domain.room.enums.FileType;
import io.ssafy.trycatch.domain.room.enums.FrameworkCategory;
import io.ssafy.trycatch.domain.room.repository.ProblemFileRepository;
import io.ssafy.trycatch.global.common.TrueOrFalse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ProblemFileDataInitializer implements CommandLineRunner {

    private final ProblemFileRepository problemFileRepository;

    @Override
    public void run(String... args) throws Exception {
        log.info("ProblemFile 초기 데이터 삽입 시작...");

        // 이미 데이터가 있으면 스킵
        long count = problemFileRepository.count();
        if (count > 0) {
            log.info("ProblemFile 데이터가 이미 존재합니다: {}개", count);
            return;
        }

        // ========== ProblemFramework 1: Quest 1 - FRONTEND (React) ==========
        problemFileRepository.save(ProblemFile.builder()
                .problemFrameworkId(1L)
                .filePath("frontend_react/src/App.js")
                .codeRole(FrameworkCategory.FRONTEND)
                .code("import React from 'react';\nimport './App.css';\n\nfunction App() {\n  return (\n    <div className=\"App\">\n      <h1>Hello React</h1>\n    </div>\n  );\n}\n\nexport default App;")
                .fileType(FileType.SOURCE)
                .isDeleted(TrueOrFalse.F)
                .build());

        problemFileRepository.save(ProblemFile.builder()
                .problemFrameworkId(1L)
                .filePath("frontend_react/package.json")
                .codeRole(FrameworkCategory.FRONTEND)
                .code("{\n  \"name\": \"react-app\",\n  \"version\": \"1.0.0\",\n  \"dependencies\": {\n    \"react\": \"^18.2.0\",\n    \"react-dom\": \"^18.2.0\"\n  }\n}")
                .fileType(FileType.CONFIG)
                .isDeleted(TrueOrFalse.F)
                .build());

        // ========== ProblemFramework 2: Quest 1 - FRONTEND (Vue) ==========
        problemFileRepository.save(ProblemFile.builder()
                .problemFrameworkId(2L)
                .filePath("frontend_vue/src/App.vue")
                .codeRole(FrameworkCategory.FRONTEND)
                .code("<template>\n  <div id=\"app\">\n    <h1>{{ title }}</h1>\n  </div>\n</template>\n\n<script>\nexport default {\n  data() {\n    return {\n      title: 'Hello Vue'\n    }\n  }\n}\n</script>")
                .fileType(FileType.SOURCE)
                .isDeleted(TrueOrFalse.F)
                .build());

        problemFileRepository.save(ProblemFile.builder()
                .problemFrameworkId(2L)
                .filePath("frontend_vue/package.json")
                .codeRole(FrameworkCategory.FRONTEND)
                .code("{\n  \"name\": \"vue-app\",\n  \"version\": \"1.0.0\",\n  \"dependencies\": {\n    \"vue\": \"^3.0.0\"\n  }\n}")
                .fileType(FileType.CONFIG)
                .isDeleted(TrueOrFalse.F)
                .build());

        // ========== ProblemFramework 3: Quest 1 - BACKEND (Spring) ==========
        problemFileRepository.save(ProblemFile.builder()
                .problemFrameworkId(3L)
                .filePath("backend_spring/src/main/java/com/example/Application.java")
                .codeRole(FrameworkCategory.BACKEND)
                .code("package com.example;\n\nimport org.springframework.boot.SpringApplication;\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\n\n@SpringBootApplication\npublic class Application {\n    public static void main(String[] args) {\n        SpringApplication.run(Application.class, args);\n    }\n}")
                .fileType(FileType.SOURCE)
                .isDeleted(TrueOrFalse.F)
                .build());

        problemFileRepository.save(ProblemFile.builder()
                .problemFrameworkId(3L)
                .filePath("backend_spring/pom.xml")
                .codeRole(FrameworkCategory.BACKEND)
                .code("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<project>\n  <modelVersion>4.0.0</modelVersion>\n  <groupId>com.example</groupId>\n  <artifactId>backend</artifactId>\n  <version>1.0.0</version>\n</project>")
                .fileType(FileType.CONFIG)
                .isDeleted(TrueOrFalse.F)
                .build());

        // ========== ProblemFramework 4: Quest 1 - BACKEND (Django) ==========
        problemFileRepository.save(ProblemFile.builder()
                .problemFrameworkId(4L)
                .filePath("backend_django/app.py")
                .codeRole(FrameworkCategory.BACKEND)
                .code("from django.http import HttpResponse\n\ndef index(request):\n    return HttpResponse('Hello Django')")
                .fileType(FileType.SOURCE)
                .isDeleted(TrueOrFalse.F)
                .build());

        problemFileRepository.save(ProblemFile.builder()
                .problemFrameworkId(4L)
                .filePath("backend_django/requirements.txt")
                .codeRole(FrameworkCategory.BACKEND)
                .code("Django==4.2.0")
                .fileType(FileType.CONFIG)
                .isDeleted(TrueOrFalse.F)
                .build());

        // ========== ProblemFramework 5: Quest 1 - FULLSTACK (React + Spring) ==========
        // Frontend files
        problemFileRepository.save(ProblemFile.builder()
                .problemFrameworkId(5L)
                .filePath("frontend_react/src/App.js")
                .codeRole(FrameworkCategory.FRONTEND)
                .code("import React from 'react';\nimport './App.css';\n\nfunction App() {\n  return (\n    <div className=\"App\">\n      <h1>Hello React</h1>\n    </div>\n  );\n}\n\nexport default App;")
                .fileType(FileType.SOURCE)
                .isDeleted(TrueOrFalse.F)
                .build());

        // Backend files
        problemFileRepository.save(ProblemFile.builder()
                .problemFrameworkId(5L)
                .filePath("backend_spring/src/main/java/com/example/Application.java")
                .codeRole(FrameworkCategory.BACKEND)
                .code("package com.example;\n\nimport org.springframework.boot.SpringApplication;\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\n\n@SpringBootApplication\npublic class Application {\n    public static void main(String[] args) {\n        SpringApplication.run(Application.class, args);\n    }\n}")
                .fileType(FileType.SOURCE)
                .isDeleted(TrueOrFalse.F)
                .build());

        // ========== ProblemFramework 6: Quest 1 - FULLSTACK (React + Django) ==========
        // Frontend files
        problemFileRepository.save(ProblemFile.builder()
                .problemFrameworkId(6L)
                .filePath("frontend_react/src/App.js")
                .codeRole(FrameworkCategory.FRONTEND)
                .code("import React from 'react';\nimport './App.css';\n\nfunction App() {\n  return (\n    <div className=\"App\">\n      <h1>Hello React</h1>\n    </div>\n  );\n}\n\nexport default App;")
                .fileType(FileType.SOURCE)
                .isDeleted(TrueOrFalse.F)
                .build());

        // Backend files
        problemFileRepository.save(ProblemFile.builder()
                .problemFrameworkId(6L)
                .filePath("backend_django/app.py")
                .codeRole(FrameworkCategory.BACKEND)
                .code("from django.http import HttpResponse\n\ndef index(request):\n    return HttpResponse('Hello Django')")
                .fileType(FileType.SOURCE)
                .isDeleted(TrueOrFalse.F)
                .build());

        // ========== ProblemFramework 7: Quest 1 - FULLSTACK (Vue + Spring) ==========
        // Frontend files
        problemFileRepository.save(ProblemFile.builder()
                .problemFrameworkId(7L)
                .filePath("frontend_vue/src/App.vue")
                .codeRole(FrameworkCategory.FRONTEND)
                .code("<template>\n  <div id=\"app\">\n    <h1>{{ title }}</h1>\n  </div>\n</template>\n\n<script>\nexport default {\n  data() {\n    return {\n      title: 'Hello Vue'\n    }\n  }\n}\n</script>")
                .fileType(FileType.SOURCE)
                .isDeleted(TrueOrFalse.F)
                .build());

        // Backend files
        problemFileRepository.save(ProblemFile.builder()
                .problemFrameworkId(7L)
                .filePath("backend_spring/src/main/java/com/example/Application.java")
                .codeRole(FrameworkCategory.BACKEND)
                .code("package com.example;\n\nimport org.springframework.boot.SpringApplication;\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\n\n@SpringBootApplication\npublic class Application {\n    public static void main(String[] args) {\n        SpringApplication.run(Application.class, args);\n    }\n}")
                .fileType(FileType.SOURCE)
                .isDeleted(TrueOrFalse.F)
                .build());

        // ========== ProblemFramework 8: Quest 1 - FULLSTACK (Vue + Django) ==========
        // Frontend files
        problemFileRepository.save(ProblemFile.builder()
                .problemFrameworkId(8L)
                .filePath("frontend_vue/src/App.vue")
                .codeRole(FrameworkCategory.FRONTEND)
                .code("<template>\n  <div id=\"app\">\n    <h1>{{ title }}</h1>\n  </div>\n</template>\n\n<script>\nexport default {\n  data() {\n    return {\n      title: 'Hello Vue'\n    }\n  }\n}\n</script>")
                .fileType(FileType.SOURCE)
                .isDeleted(TrueOrFalse.F)
                .build());

        // Backend files
        problemFileRepository.save(ProblemFile.builder()
                .problemFrameworkId(8L)
                .filePath("backend_django/app.py")
                .codeRole(FrameworkCategory.BACKEND)
                .code("from django.http import HttpResponse\n\ndef index(request):\n    return HttpResponse('Hello Django')")
                .fileType(FileType.SOURCE)
                .isDeleted(TrueOrFalse.F)
                .build());

        long finalCount = problemFileRepository.count();
        log.info("ProblemFile 초기 데이터 삽입 완료! 총 {}개", finalCount);
    }
}