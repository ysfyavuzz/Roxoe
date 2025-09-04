# 🚀 RoxoePOS CI/CD Pipeline Dokümantasyonu

## 📋 İçindekiler
1. [Genel Bakış](#genel-bakış)
2. [Pipeline Yapısı](#pipeline-yapısı)
3. [GitHub Actions Workflows](#github-actions-workflows)
4. [Build Süreci](#build-süreci)
5. [Test Otomasyonu](#test-otomasyonu)
6. [Deployment Stratejisi](#deployment-stratejisi)
7. [Monitoring ve Alerting](#monitoring-ve-alerting)

## 🎯 Genel Bakış

RoxoePOS CI/CD pipeline'ı, kod kalitesini garanti altına alan ve otomatik deployment sağlayan kapsamlı bir sistemdir.

### Pipeline Prensipleri
- **Fail Fast:** Hatalar erken tespit edilir
- **Zero Downtime:** Kesintisiz deployment
- **Rollback Ready:** Hızlı geri alma kapasitesi
- **Quality Gates:** Kalite kontrol noktaları
- **Automated Testing:** Kapsamlı test otomasyonu

## 🏗️ Pipeline Yapısı

```mermaid
graph LR
    A[Push/PR] --> B[Lint & Format]
    B --> C[Unit Tests]
    C --> D[Integration Tests]
    D --> E[Build]
    E --> F[E2E Tests]
    F --> G[Security Scan]
    G --> H[Performance Test]
    H --> I{Quality Gate}
    I -->|Pass| J[Deploy Staging]
    I -->|Fail| K[Notify & Block]
    J --> L[Smoke Tests]
    L --> M{Approval}
    M -->|Approved| N[Deploy Production]
    M -->|Rejected| O[Rollback]
```

## 📦 GitHub Actions Workflows

### 1. Main CI Pipeline
```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18.x'
  PNPM_VERSION: '8'

jobs:
  lint-and-format:
    name: Lint & Format Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          
      - name: Setup PNPM
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
          
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Run ESLint
        run: pnpm run lint
        
      - name: Check Prettier formatting
        run: pnpm run format:check
        
      - name: TypeScript type check
        run: pnpm run type-check

  test-unit:
    name: Unit Tests
    runs-on: ubuntu-latest
    needs: lint-and-format
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          
      - name: Setup PNPM
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
          
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Run unit tests
        run: pnpm run test:unit --coverage
        
      - name: Check coverage thresholds
        run: pnpm run test:coverage:check
        
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella

  test-integration:
    name: Integration Tests
    runs-on: ubuntu-latest
    needs: lint-and-format
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: roxoepos_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          
      - name: Setup PNPM
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
          
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Run integration tests
        run: pnpm run test:integration
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/roxoepos_test

  build:
    name: Build Application
    runs-on: ubuntu-latest
    needs: [test-unit, test-integration]
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          
      - name: Setup PNPM
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
          
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Build application
        run: pnpm run build
        env:
          NODE_ENV: production
          
      - name: Analyze bundle size
        run: pnpm run analyze:bundle
        
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-artifacts
          path: |
            dist/
            .next/
          retention-days: 7

  test-e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v3
      
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-artifacts
          
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          
      - name: Install Playwright
        run: npx playwright install --with-deps
        
      - name: Run E2E tests
        run: pnpm run test:e2e
        
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

  security-scan:
    name: Security Scanning
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'
          
      - name: Upload Trivy results to GitHub Security
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'
          
      - name: Run npm audit
        run: npm audit --audit-level=moderate
        
      - name: Run OWASP dependency check
        uses: dependency-check/Dependency-Check_Action@main
        with:
          project: 'RoxoePOS'
          path: '.'
          format: 'HTML'

  performance-test:
    name: Performance Testing
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v3
      
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-artifacts
          
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/sales
            http://localhost:3000/reports
          budgetPath: ./lighthouse-budget.json
          uploadArtifacts: true
          temporaryPublicStorage: true
```

### 2. Deploy Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy Pipeline

on:
  workflow_run:
    workflows: ["CI Pipeline"]
    types: [completed]
    branches: [main]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Deployment environment'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production

jobs:
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    if: github.event_name == 'workflow_run' && github.event.workflow_run.conclusion == 'success'
    environment:
      name: staging
      url: https://staging.roxoepos.com
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: eu-central-1
          
      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster roxoepos-staging \
            --service roxoepos-app \
            --force-new-deployment
            
      - name: Wait for deployment
        run: |
          aws ecs wait services-stable \
            --cluster roxoepos-staging \
            --services roxoepos-app
            
      - name: Run smoke tests
        run: pnpm run test:smoke --url=https://staging.roxoepos.com
        
      - name: Notify Slack
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Staging deployment completed'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}

  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    if: github.event.inputs.environment == 'production'
    environment:
      name: production
      url: https://roxoepos.com
    steps:
      - uses: actions/checkout@v3
      
      - name: Create deployment
        uses: chrnorm/deployment-action@v2
        id: deployment
        with:
          token: ${{ github.token }}
          environment: production
          
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.PROD_AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.PROD_AWS_SECRET_ACCESS_KEY }}
          aws-region: eu-central-1
          
      - name: Blue-Green Deployment
        run: |
          ./scripts/deploy-blue-green.sh production
          
      - name: Health check
        run: |
          ./scripts/health-check.sh https://roxoepos.com
          
      - name: Update deployment status
        if: always()
        uses: chrnorm/deployment-status@v2
        with:
          token: ${{ github.token }}
          deployment-id: ${{ steps.deployment.outputs.deployment_id }}
          state: ${{ job.status }}
```

## 🔨 Build Süreci

### Development Build
```bash
# Local development
pnpm run dev

# Development build
pnpm run build:dev
```

### Production Build
```bash
# Production optimized build
NODE_ENV=production pnpm run build

# Bundle analysis
pnpm run analyze:bundle

# Size check
pnpm run size:check
```

### Build Optimizasyonları
- Tree shaking
- Code splitting
- Minification
- Compression (gzip/brotli)
- Image optimization
- Font subsetting
- CSS purging

## 🧪 Test Otomasyonu

### Test Piramidi
```
         /\
        /E2E\        5%  - Kritik user journey'ler
       /______\
      /Integra-\     15% - Servis entegrasyonları
     /  tion     \
    /______________\
   /                \  80% - Birim testler
  /   Unit Tests     \
 /____________________\
```

### Test Komutları
```bash
# Tüm testler
pnpm test

# Unit testler
pnpm test:unit

# Integration testler
pnpm test:integration

# E2E testler
pnpm test:e2e

# Coverage raporu
pnpm test:coverage

# Watch mode
pnpm test:watch
```

## 🚢 Deployment Stratejisi

### Blue-Green Deployment
```bash
#!/bin/bash
# scripts/deploy-blue-green.sh

ENVIRONMENT=$1
CURRENT_COLOR=$(aws ecs describe-services --cluster roxoepos-$ENVIRONMENT --services roxoepos-app --query 'services[0].taskDefinition' | grep -o 'blue\|green')
NEW_COLOR=$([ "$CURRENT_COLOR" == "blue" ] && echo "green" || echo "blue")

echo "Deploying $NEW_COLOR environment..."

# Deploy new version
aws ecs update-service \
  --cluster roxoepos-$ENVIRONMENT \
  --service roxoepos-app-$NEW_COLOR \
  --task-definition roxoepos-app-$NEW_COLOR:latest

# Wait for stable
aws ecs wait services-stable \
  --cluster roxoepos-$ENVIRONMENT \
  --services roxoepos-app-$NEW_COLOR

# Switch traffic
aws elbv2 modify-listener \
  --listener-arn $LISTENER_ARN \
  --default-actions Type=forward,TargetGroupArn=$NEW_TG_ARN

echo "Deployment complete. Active: $NEW_COLOR"
```

### Rollback Prosedürü
```bash
# Otomatik rollback
./scripts/rollback.sh production

# Manuel rollback
aws ecs update-service \
  --cluster roxoepos-production \
  --service roxoepos-app \
  --task-definition roxoepos-app:previous
```

## 📊 Monitoring ve Alerting

### Metrics Dashboard
- Deployment frequency
- Lead time for changes
- Mean time to recovery (MTTR)
- Change failure rate
- Build success rate
- Test coverage trends
- Performance metrics

### Alert Konfigürasyonu
```yaml
# .github/alerts.yml
alerts:
  - name: Build Failure
    condition: workflow.conclusion == 'failure'
    channels: ['slack', 'email']
    priority: high
    
  - name: Coverage Drop
    condition: coverage.total < 80
    channels: ['slack']
    priority: medium
    
  - name: Performance Regression
    condition: lighthouse.performance < 90
    channels: ['slack', 'pagerduty']
    priority: high
    
  - name: Security Vulnerability
    condition: security.critical > 0
    channels: ['slack', 'email', 'pagerduty']
    priority: critical
```

## 🔐 Secrets Management

### GitHub Secrets
```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
DATABASE_URL
SENTRY_DSN
SLACK_WEBHOOK
CODECOV_TOKEN
SONAR_TOKEN
```

### Environment Variables
```bash
# .env.production
NODE_ENV=production
API_URL=https://api.roxoepos.com
CDN_URL=https://cdn.roxoepos.com
ANALYTICS_ID=UA-XXXXXXXXX
```

## 📝 Best Practices

### ✅ DO's
- Her PR için otomatik testler çalıştır
- Semantic versioning kullan
- Değişiklikleri küçük tut
- Feature flag kullan
- Rollback planı hazırla
- Monitoring ve alerting kur

### ❌ DON'Ts
- Main branch'e direkt push yapma
- Testleri skip etme
- Büyük değişiklikleri tek seferde deploy etme
- Secret'ları kod içinde saklama
- Manual deployment yapma

## 🆘 Troubleshooting

### Build Hataları
```bash
# Cache temizle
pnpm store prune

# Dependencies yeniden kur
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Build loglarını incele
pnpm run build --verbose
```

### Test Hataları
```bash
# Failing test'i izole et
pnpm test -- --grep "test name"

# Debug mode'da çalıştır
NODE_ENV=test pnpm test --inspect

# Coverage detaylarını göster
pnpm test:coverage --verbose
```

### Deployment Hataları
```bash
# Deployment durumunu kontrol et
aws ecs describe-services --cluster roxoepos-production --services roxoepos-app

# Logları incele
aws logs tail /ecs/roxoepos --follow

# Rollback yap
./scripts/rollback.sh production
```

## 📚 Kaynaklar

- [GitHub Actions Dokümantasyonu](https://docs.github.com/en/actions)
- [AWS ECS Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Playwright Testing](https://playwright.dev/)

---
*Son güncelleme: 2025-09-04*
*Versiyon: 1.0.0*
