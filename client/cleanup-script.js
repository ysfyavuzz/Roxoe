#!/usr/bin/env node

/**
 * RoxoePOS Automated Cleanup Script
 * Performs automated code quality improvements and identifies issues
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CodeCleanupManager {
  constructor() {
    this.projectRoot = process.cwd();
    this.srcPath = path.join(this.projectRoot, 'src');
    this.results = {
      fixedIssues: [],
      identifiedIssues: [],
      metrics: {
        totalFiles: 0,
        processedFiles: 0,
        errorCount: 0,
        warningCount: 0,
      },
    };
  }

  /**
   * Main cleanup execution
   */
  async runCleanup() {
    console.log('🧹 RoxoePOS Automated Cleanup Starting...\n');

    try {
      // 1. Analyze code quality
      await this.analyzeCodeQuality();

      // 2. Fix type safety issues
      await this.fixTypeSafetyIssues();

      // 3. Remove unused imports
      await this.removeUnusedImports();

      // 4. Fix ESLint issues
      await this.fixESLintIssues();

      // 5. Generate cleanup report
      this.generateReport();

      console.log('\n✅ Cleanup process completed!');
    } catch (error) {
      console.error('❌ Cleanup process failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Analyzes overall code quality
   */
  async analyzeCodeQuality() {
    console.log('📊 Analyzing code quality...');

    const tsFiles = this.getAllTypeScriptFiles();
    this.results.metrics.totalFiles = tsFiles.length;

    for (const filePath of tsFiles) {
      try {
        await this.analyzeFile(filePath);
        this.results.metrics.processedFiles++;
      } catch (error) {
        console.warn(`⚠️ Warning analyzing ${filePath}: ${error.message}`);
        this.results.metrics.warningCount++;
      }
    }

    console.log(
      `   📁 Analyzed ${this.results.metrics.processedFiles}/${this.results.metrics.totalFiles} files`
    );
  }

  /**
   * Analyzes individual file
   */
  async analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(this.projectRoot, filePath);

    // Check for @ts-ignore usage
    const tsIgnoreMatches = content.match(/@ts-ignore/g);
    if (tsIgnoreMatches) {
      this.results.identifiedIssues.push({
        type: 'ts-ignore-usage',
        file: relativePath,
        count: tsIgnoreMatches.length,
        severity: 'high',
      });
    }

    // Check for any type usage
    const anyTypeMatches = content.match(/:\s*any[,;\]\}\)]/g);
    if (anyTypeMatches) {
      this.results.identifiedIssues.push({
        type: 'any-type-usage',
        file: relativePath,
        count: anyTypeMatches.length,
        severity: 'medium',
      });
    }

    // Check for TODO/FIXME comments
    const todoMatches = content.match(/(TODO|FIXME|XXX):/gi);
    if (todoMatches) {
      this.results.identifiedIssues.push({
        type: 'todo-comments',
        file: relativePath,
        count: todoMatches.length,
        severity: 'low',
      });
    }

    // Check for console.log usage
    const consoleMatches = content.match(/console\.(log|warn|error)/g);
    if (consoleMatches) {
      this.results.identifiedIssues.push({
        type: 'console-usage',
        file: relativePath,
        count: consoleMatches.length,
        severity: 'low',
      });
    }

    // Check file size
    const sizeKB = Buffer.byteLength(content, 'utf8') / 1024;
    if (sizeKB > 50) {
      this.results.identifiedIssues.push({
        type: 'large-file',
        file: relativePath,
        size: `${sizeKB.toFixed(1)}KB`,
        severity: 'medium',
      });
    }
  }

  /**
   * Fixes type safety issues
   */
  async fixTypeSafetyIssues() {
    console.log('🔧 Fixing type safety issues...');

    let fixedCount = 0;

    // Fix common type issues
    const commonFixes = [
      {
        pattern: /:\s*any\[\]/g,
        replacement: ': unknown[]',
        description: 'Fixed any[] to unknown[]',
      },
      {
        pattern: /:\s*any\s*=/g,
        replacement: ': unknown =',
        description: 'Fixed any assignment to unknown',
      },
    ];

    const tsFiles = this.getAllTypeScriptFiles();

    for (const filePath of tsFiles) {
      const content = fs.readFileSync(filePath, 'utf8');
      let modified = content;
      let fileFixed = false;

      for (const fix of commonFixes) {
        if (fix.pattern.test(modified)) {
          modified = modified.replace(fix.pattern, fix.replacement);
          fileFixed = true;
        }
      }

      if (fileFixed) {
        fs.writeFileSync(filePath, modified, 'utf8');
        fixedCount++;
        this.results.fixedIssues.push({
          type: 'type-safety',
          file: path.relative(this.projectRoot, filePath),
          description: 'Fixed type safety issues',
        });
      }
    }

    console.log(`   ✅ Fixed type safety in ${fixedCount} files`);
  }

  /**
   * Removes unused imports (basic implementation)
   */
  async removeUnusedImports() {
    console.log('📦 Checking for unused imports...');

    try {
      // Run TypeScript compiler to check for unused imports
      const result = execSync('npx tsc --noEmit --strict', {
        encoding: 'utf8',
        cwd: this.projectRoot,
      });
      console.log('   ✅ No TypeScript errors found');
    } catch (error) {
      // TypeScript errors might include unused import warnings
      const output = error.stdout || error.stderr || '';
      const unusedImportRegex =
        /'([^']+)' is declared but its value is never read/g;
      let match;

      while ((match = unusedImportRegex.exec(output)) !== null) {
        this.results.identifiedIssues.push({
          type: 'unused-import',
          import: match[1],
          severity: 'low',
        });
      }

      console.log(
        `   ⚠️ Found ${this.results.identifiedIssues.filter(i => i.type === 'unused-import').length} potential unused imports`
      );
    }
  }

  /**
   * Fixes ESLint issues automatically
   */
  async fixESLintIssues() {
    console.log('🔍 Running ESLint auto-fix...');

    try {
      execSync('npx eslint . --ext ts,tsx --fix', {
        cwd: this.projectRoot,
        stdio: 'pipe',
      });

      console.log('   ✅ ESLint auto-fix completed');
      this.results.fixedIssues.push({
        type: 'eslint-autofix',
        description: 'Applied ESLint automatic fixes',
      });
    } catch (error) {
      console.log('   ⚠️ ESLint found some unfixable issues');
      this.results.metrics.warningCount++;
    }
  }

  /**
   * Gets all TypeScript files in the project
   */
  getAllTypeScriptFiles() {
    const files = [];

    function walkDir(dir) {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (
          stat.isDirectory() &&
          !item.startsWith('.') &&
          item !== 'node_modules'
        ) {
          walkDir(fullPath);
        } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
          files.push(fullPath);
        }
      }
    }

    if (fs.existsSync(this.srcPath)) {
      walkDir(this.srcPath);
    }

    return files;
  }

  /**
   * Generates cleanup report
   */
  generateReport() {
    console.log('\n📋 Cleanup Report:\n');

    // Summary
    console.log('📊 Summary:');
    console.log(`   Files analyzed: ${this.results.metrics.processedFiles}`);
    console.log(`   Issues fixed: ${this.results.fixedIssues.length}`);
    console.log(
      `   Issues identified: ${this.results.identifiedIssues.length}`
    );
    console.log(`   Warnings: ${this.results.metrics.warningCount}\n`);

    // Fixed issues
    if (this.results.fixedIssues.length > 0) {
      console.log('✅ Fixed Issues:');
      this.results.fixedIssues.forEach(issue => {
        console.log(`   • ${issue.type}: ${issue.description || issue.file}`);
      });
      console.log('');
    }

    // Identified issues by severity
    const highPriorityIssues = this.results.identifiedIssues.filter(
      i => i.severity === 'high'
    );
    const mediumPriorityIssues = this.results.identifiedIssues.filter(
      i => i.severity === 'medium'
    );
    const lowPriorityIssues = this.results.identifiedIssues.filter(
      i => i.severity === 'low'
    );

    if (highPriorityIssues.length > 0) {
      console.log('🔴 High Priority Issues:');
      highPriorityIssues.forEach(issue => {
        console.log(
          `   • ${issue.type} in ${issue.file}: ${issue.count || issue.size || 'detected'}`
        );
      });
      console.log('');
    }

    if (mediumPriorityIssues.length > 0) {
      console.log('🟡 Medium Priority Issues:');
      mediumPriorityIssues.forEach(issue => {
        console.log(
          `   • ${issue.type} in ${issue.file}: ${issue.count || issue.size || 'detected'}`
        );
      });
      console.log('');
    }

    if (lowPriorityIssues.length > 0) {
      console.log('🟢 Low Priority Issues:');
      lowPriorityIssues.slice(0, 10).forEach(issue => {
        console.log(
          `   • ${issue.type} in ${issue.file}: ${issue.count || issue.import || 'detected'}`
        );
      });
      if (lowPriorityIssues.length > 10) {
        console.log(`   ... and ${lowPriorityIssues.length - 10} more`);
      }
      console.log('');
    }

    // Recommendations
    console.log('💡 Recommendations:');
    if (highPriorityIssues.length > 0) {
      console.log('   • Fix high priority @ts-ignore usage first');
    }
    if (mediumPriorityIssues.some(i => i.type === 'large-file')) {
      console.log(
        '   • Consider splitting large files into smaller components'
      );
    }
    if (mediumPriorityIssues.some(i => i.type === 'any-type-usage')) {
      console.log(
        '   • Replace any types with specific types for better type safety'
      );
    }
    console.log('   • Run this script regularly to maintain code quality');

    // Save detailed report
    const reportPath = path.join(this.projectRoot, 'cleanup-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }
}

// Run cleanup if called directly
if (require.main === module) {
  const cleanup = new CodeCleanupManager();
  cleanup.runCleanup().catch(console.error);
}

module.exports = CodeCleanupManager;
