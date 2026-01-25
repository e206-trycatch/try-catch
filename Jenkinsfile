pipeline {
    agent any
    
    environment {
        FRONTEND_CHANGED = 'false'
        BACKEND_CHANGED = 'true'
        GITLAB_CREDENTIALS = 'gitlab-credentials'
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'develop',
                    credentialsId: "${GITLAB_CREDENTIALS}",
                    url: 'https://lab.ssafy.com/s14-webmobile1-sub1/S14P11E206.git'
            }
        }
        
        stage('Check Changes') {
            steps {
                script {
                    // 마지막 성공한 빌드의 커밋 찾기
                    def lastSuccessfulCommit = env.GIT_PREVIOUS_SUCCESSFUL_COMMIT
                    
                    if (lastSuccessfulCommit) {
                        // 마지막 성공한 빌드와 비교
                        def changes = sh(
                            script: "git diff --name-only ${lastSuccessfulCommit} ${env.GIT_COMMIT}",
                            returnStdout: true
                        ).trim()
                        
                        echo "========================================="
                        echo "Comparing with last successful build"
                        echo "Last successful commit: ${lastSuccessfulCommit}"
                        echo "Current commit: ${env.GIT_COMMIT}"
                        echo "Changed files:"
                        echo "${changes}"
                        echo "========================================="
                        
                        // if (changes.contains('frontend/')) {
                        //     FRONTEND_CHANGED = 'true'
                        //     echo "✅ Frontend changed"
                        // }
                        if (changes.contains('backend/')) {
                            env.BACKEND_CHANGED = 'true'
                            echo "✅ Backend changed"
                        }
                        
                        if (env.BACKEND_CHANGED == 'false') {
                            echo "⚠️ No backend changes detected"
                            currentBuild.result = 'SUCCESS'
                            return
                        }
                    } else {
                        // 첫 빌드 또는 성공한 빌드가 없음 - 전체 배포
                        echo "========================================="
                        echo "🎉 First build or no previous successful build"
                        echo "Deploying all services..."
                        echo "========================================="
                        // FRONTEND_CHANGED = 'true'
                        env.BACKEND_CHANGED = 'true'
                    }
                }
            }
        }
        
        stage('Setup Environment') {
            steps {
                withCredentials([file(credentialsId: 'env-file', variable: 'ENV_FILE')]) {
                    sh '''
                        echo "Setting up environment variables..."
                        cat "$ENV_FILE" > .env
                        echo "✅ Environment file configured"
                    '''
                }
            }
        }
        
        // stage('Build & Deploy Frontend') {
        //     when {
        //         expression { FRONTEND_CHANGED == 'true' }
        //     }
        //     steps {
        //         echo '========================================='
        //         echo '  Building Frontend'
        //         echo '========================================='
        //         
        //         dir('frontend') {
        //             sh '''
        //                 # nvm 로드
        //                 export NVM_DIR="$HOME/.nvm"
        //                 [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
        //                 
        //                 echo "Using Node.js version:"
        //                 node --version
        //                 npm --version
        //                 
        //                 echo "📦 Installing dependencies..."
        //                 npm ci
        //                 
        //                 echo "🔨 Building React app..."
        //                 npm run build
        //                 
        //                 echo "🚀 Deploying to /var/www/html/..."
        //                 sudo rm -rf /var/www/html/*
        //                 sudo cp -r build/* /var/www/html/
        //                 sudo chown -R www-data:www-data /var/www/html
        //                 
        //                 echo "✅ Frontend deployed successfully"
        //             '''
        //         }
        //     }
        // }
        
        stage('Deploy Backend') {
            when {
                expression { env.BACKEND_CHANGED == 'true' }
            }
            steps {
                echo '========================================='
                echo '  Deploying Backend'
                echo '========================================='
                
                withCredentials([file(credentialsId: 'env-file', variable: 'ENV_FILE')]) {
                    sh '''
                        # 환경 변수 설정
                        echo "Setting up environment variables..."
                        cat "$ENV_FILE" > .env
                        
                        # .env 파일 확인
                        if [ ! -f .env ]; then
                            echo "❌ .env file not found!"
                            exit 1
                        fi
                        
                        # docker-compose 파일 확인
                        if [ ! -f docker-compose-prod.yml ]; then
                            echo "❌ docker-compose-prod.yml not found!"
                            exit 1
                        fi
                        
                        echo "🛑 Stopping existing containers..."
                        docker-compose --env-file .env -f docker-compose-prod.yml down || true
                        
                        echo "🐳 Building and deploying services..."
                        docker-compose --env-file .env -f docker-compose-prod.yml up -d --build
                        
                        echo "✅ Backend deployment initiated"
                    '''
                }
            }
        }
        
        stage('Health Check') {
            when {
                expression { env.BACKEND_CHANGED == 'true' }
            }
            steps {
                echo '========================================='
                echo '  Health Check'
                echo '========================================='
                
                sh '''
                    echo "⏳ Waiting for backend to be healthy..."
                    for i in {1..30}; do
                        if curl -f http://localhost:8081/actuator/health 2>/dev/null; then
                            echo "✅ Backend is healthy"
                            exit 0
                        fi
                        echo "Attempt $i: Backend not ready yet..."
                        sleep 2
                    done
                    echo "❌ Backend health check timeout"
                    exit 1
                '''
            }
        }
        
        stage('Verify Deployment') {
            steps {
                echo '========================================='
                echo '  Deployment Summary'
                echo '========================================='
                
                sh '''
                    echo "Running Containers:"
                    docker ps --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"
                '''
            }
        }
    }
    
    post {
        success {
            script {
                echo '✅✅✅ Deployment Successful! ✅✅✅'
                // if (FRONTEND_CHANGED == 'true') {
                //     echo '✅ Frontend: Deployed to /var/www/html/'
                // }
                if (env.BACKEND_CHANGED == 'true') {
                    echo '✅ Backend: Running on port 8081'
                }
                echo 'MySQL: Running on port 3306'
                echo 'Redis: Running on port 6379'
            }
        }
        failure {
            echo '❌❌❌ Deployment Failed! ❌❌❌'
            
            script {
                if (env.BACKEND_CHANGED == 'true') {
                    echo '========================================='
                    echo 'Spring Boot Container Logs:'
                    echo '========================================='
                    sh 'docker-compose --env-file .env -f docker-compose-prod.yml logs --tail=100 spring-boot || docker logs trycatch-backend || true'
                    
                    echo '========================================='
                    echo 'Container Inspect:'
                    echo '========================================='
                    sh 'docker inspect trycatch-backend || true'
                }
                
                echo '========================================='
                echo 'All Containers Status:'
                echo '========================================='
                sh 'docker ps -a || true'
                
                echo '========================================='
                echo 'Docker Compose Status:'
                echo '========================================='
                sh 'docker-compose --env-file .env -f docker-compose-prod.yml ps || true'
            }
        }
        cleanup {
            sh 'rm -f .env || true'
            echo '🧹 Cleaning up...'
            sh 'docker system prune -f || true'
        }
    }
}