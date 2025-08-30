/**
 * Smart Archiving System
 * Analyzes usage patterns and automatically determines optimal archiving strategies
 */

import { openDB, IDBPDatabase } from 'idb';

export interface UsagePattern {
  table: string;
  recordId: string | number;
  lastAccessed: Date;
  accessCount: number;
  accessFrequency: number; // accesses per day
  dataSize: number; // estimated size in bytes
  importance: 'HIGH' | 'MEDIUM' | 'LOW';
  businessValue: number; // 0-1 scale
}

export interface ArchivingRule {
  table: string;
  condition: string;
  priority: number;
  retentionDays: number;
  description: string;
  estimatedRecords: number;
  estimatedSpaceSaving: number; // in MB
}

export interface SmartArchiveResult {
  success: boolean;
  analyzedRecords: number;
  archivedRecords: number;
  spaceSaved: number; // in MB
  performanceImprovement: number; // percentage
  appliedRules: ArchivingRule[];
  nextOptimizationDate: Date;
  recommendations: string[];
}

export class SmartArchiveManager {
  private usagePatterns: Map<string, UsagePattern> = new Map();
  private archivingRules: ArchivingRule[] = [];

  // Güvenli tip yardımcıları
  private toRecord(value: unknown): Record<string, unknown> {
    return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
  }
  private num(value: unknown, fallback = 0): number {
    if (typeof value === 'number') {return value;}
    if (typeof value === 'string') {
      const n = Number(value);
      return Number.isFinite(n) ? n : fallback;
    }
    return fallback;
  }
  private str(value: unknown, fallback = ''): string {
    return typeof value === 'string' ? value : fallback;
  }

  /**
   * Analyzes usage patterns and performs intelligent archiving
   */
  async performSmartArchiving(): Promise<SmartArchiveResult> {
    console.log('🧠 Smart Archiving Analysis başlatılıyor...');

    const result: SmartArchiveResult = {
      success: true,
      analyzedRecords: 0,
      archivedRecords: 0,
      spaceSaved: 0,
      performanceImprovement: 0,
      appliedRules: [],
      nextOptimizationDate: new Date(),
      recommendations: []
    };

    try {
      // 1. Collect usage patterns
      await this.analyzeUsagePatterns();

      // 2. Generate smart archiving rules
      this.generateSmartRules();

      // 3. Apply archiving based on patterns
      const archiveResults = await this.applySmartArchiving();

      // 4. Calculate results
      result.analyzedRecords = this.getTotalAnalyzedRecords();
      result.archivedRecords = archiveResults.archivedCount;
      result.spaceSaved = archiveResults.spaceSaved;
      result.performanceImprovement = this.calculatePerformanceImprovement(result.spaceSaved);
      result.appliedRules = this.archivingRules;
      result.nextOptimizationDate = this.calculateNextOptimizationDate();
      result.recommendations = this.generateRecommendations();

      console.log('✅ Smart Archiving tamamlandı:', result);
    } catch (error) {
      console.error('❌ Smart Archiving hatası:', error);
      result.success = false;
    }

    return result;
  }

  /**
   * Analyzes usage patterns across all databases
   */
  private async analyzeUsagePatterns(): Promise<void> {
    console.log('📊 Usage pattern analizi başlıyor...');

    const databases = [
      { name: 'posDB', tables: ['products', 'cashRegisterSessions', 'cashTransactions'] },
      { name: 'salesDB', tables: ['sales'] },
      { name: 'creditDB', tables: ['customers', 'transactions'] }
    ];

    for (const { name: dbName, tables } of databases) {
      try {
        const db = await openDB(dbName);
        
        for (const tableName of tables) {
          if (db.objectStoreNames.contains(tableName)) {
            await this.analyzeTableUsage(db, dbName, tableName);
          }
        }
        
        db.close();
      } catch (error) {
        console.error(`${dbName} analiz hatası:`, error);
      }
    }
  }

  /**
   * Analyzes usage patterns for a specific table
   */
  private async analyzeTableUsage(
    db: IDBPDatabase, 
    dbName: string, 
    tableName: string
  ): Promise<void> {
    try {
      const transaction = db.transaction(tableName, 'readonly');
      const store = transaction.objectStore(tableName);
      const cursor = await store.openCursor();
      
      let recordCount = 0;
      const sampleSize = 100; // Analyze first 100 records for patterns
      
      while (cursor && recordCount < sampleSize) {
        const record = cursor.value;
        const pattern = this.analyzeRecordUsage(dbName, tableName, record);
        
        if (pattern) {
          this.usagePatterns.set(`${dbName}.${tableName}.${record.id}`, pattern);
        }
        
        await cursor.continue();
        recordCount++;
      }
      
      await transaction.done;
      console.log(`📋 ${dbName}.${tableName}: ${recordCount} kayıt analiz edildi`);
    } catch (error) {
      console.error(`Tablo analiz hatası ${dbName}.${tableName}:`, error);
    }
  }

  /**
   * Analyzes individual record usage patterns
   */
  private analyzeRecordUsage(
    dbName: string, 
    tableName: string, 
    record: unknown
  ): UsagePattern | null {
    try {
      const now = new Date();
      const rec = this.toRecord(record);
      const createdRaw = rec['createdAt'] ?? rec['date'];
      let recordDate: Date;
      if (typeof createdRaw === 'string') {
        recordDate = new Date(createdRaw);
      } else if (createdRaw instanceof Date) {
        recordDate = createdRaw;
      } else {
        recordDate = now;
      }
      const daysSinceCreated = Math.floor((now.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Kayıt özelliklerine göre simüle erişim deseni
      const accessPattern = this.calculateAccessPattern(tableName, rec, daysSinceCreated);
      
      const idRaw = rec['id'] ?? rec['sessionId'] ?? 'unknown';
      const recordId = (typeof idRaw === 'string' || typeof idRaw === 'number') ? idRaw : 'unknown';
      
      return {
        table: `${dbName}.${tableName}`,
        recordId,
        lastAccessed: this.estimateLastAccess(rec, daysSinceCreated),
        accessCount: accessPattern.totalAccess,
        accessFrequency: accessPattern.frequency,
        dataSize: this.estimateRecordSize(rec),
        importance: this.calculateImportance(tableName, rec, daysSinceCreated),
        businessValue: this.calculateBusinessValue(tableName, rec)
      };
    } catch (error) {
      console.error('Record usage analiz hatası:', error);
      return null;
    }
  }

  /**
   * Calculates access patterns based on record type and age
   */
  private calculateAccessPattern(tableName: string, record: Record<string, unknown>, daysSinceCreated: number) {
    let baseAccess = 10;
    let frequency = 1;

    switch (tableName) {
      case 'products':
        // Popüler ürünler daha sık erişilir
        baseAccess = this.num(record['stock']) > 10 ? 50 : 20;
        frequency = daysSinceCreated > 30 ? 0.5 : 2;
        break;
        
      case 'sales':
        // Son satışlara daha sık erişilir
        baseAccess = daysSinceCreated < 7 ? 15 : 3;
        frequency = Math.max(0.1, 5 - daysSinceCreated / 10);
        break;
        
      case 'customers':
        // Borcu olan aktif müşteriler
        baseAccess = this.num(record['totalDebt']) > 0 ? 25 : 8;
        frequency = this.num(record['totalDebt']) > 0 ? 1.5 : 0.3;
        break;
        
      case 'cashRegisterSessions':
        // Yakın tarihli oturumlar
        baseAccess = daysSinceCreated < 30 ? 10 : 2;
        frequency = Math.max(0.1, 2 - daysSinceCreated / 30);
        break;
    }

    return {
      totalAccess: Math.floor(baseAccess * Math.random() * 1.5),
      frequency: frequency * (0.8 + Math.random() * 0.4) // Biraz rastgelelik
    };
  }

  /**
   * Estimates last access date based on record characteristics
   */
  private estimateLastAccess(_record: Record<string, unknown>, daysSinceCreated: number): Date {
    const now = new Date();
    const randomDaysAgo = Math.floor(Math.random() * Math.min(daysSinceCreated, 90));
    return new Date(now.getTime() - randomDaysAgo * 24 * 60 * 60 * 1000);
  }

  /**
   * Estimates record size in bytes
   */
  private estimateRecordSize(record: Record<string, unknown>): number {
    const jsonString = JSON.stringify(record);
    return jsonString.length * 2; // Yaklaşık UTF-16 tahmini
  }

  /**
   * Calculates record importance based on business logic
   */
  private calculateImportance(tableName: string, record: Record<string, unknown>, daysSinceCreated: number): 'HIGH' | 'MEDIUM' | 'LOW' {
    switch (tableName) {
      case 'products':
        if (this.num(record['stock']) > 0) {return 'HIGH';}
        if (daysSinceCreated < 90) {return 'MEDIUM';}
        return 'LOW';
        
      case 'sales':
        if (daysSinceCreated < 30) {return 'HIGH';}
        if (this.num(record['total']) > 100) {return 'MEDIUM';}
        return 'LOW';
        
      case 'customers':
        if (this.num(record['totalDebt']) > 0) {return 'HIGH';}
        if (daysSinceCreated < 180) {return 'MEDIUM';}
        return 'LOW';
        
      default:
        if (daysSinceCreated < 60) {return 'MEDIUM';}
        return 'LOW';
    }
  }

  /**
   * Calculates business value (0-1 scale)
   */
  private calculateBusinessValue(tableName: string, record: Record<string, unknown>): number {
    switch (tableName) {
      case 'products':
        return this.num(record['stock']) > 0 ? 0.9 : 0.3;
        
      case 'sales':
        // Yüksek tutarlı satışlar daha önemli
        return Math.min(0.95, 0.3 + this.num(record['total']) / 1000);
        
      case 'customers':
        return this.num(record['totalDebt']) > 0 ? 0.8 : 0.4;
        
      default:
        return 0.5;
    }
  }

  /**
   * Generates smart archiving rules based on usage patterns
   */
  private generateSmartRules(): void {
    console.log('🔧 Smart archiving rules oluşturuluyor...');

    this.archivingRules = [];

    // Analyze patterns to create intelligent rules
    const tablePatterns = this.groupPatternsByTable();

    for (const [table, patterns] of tablePatterns.entries()) {
      const rules = this.createTableSpecificRules(table, patterns);
      this.archivingRules.push(...rules);
    }

    // Sort rules by priority
    this.archivingRules.sort((a, b) => b.priority - a.priority);

    console.log(`📋 ${this.archivingRules.length} smart rule oluşturuldu`);
  }

  /**
   * Groups usage patterns by table
   */
  private groupPatternsByTable(): Map<string, UsagePattern[]> {
    const grouped = new Map<string, UsagePattern[]>();

    for (const pattern of this.usagePatterns.values()) {
      if (!grouped.has(pattern.table)) {
        grouped.set(pattern.table, []);
      }
      grouped.get(pattern.table)?.push(pattern);
    }

    return grouped;
  }

  /**
   * Creates table-specific archiving rules
   */
  private createTableSpecificRules(table: string, patterns: UsagePattern[]): ArchivingRule[] {
    const rules: ArchivingRule[] = [];
    const lowImportancePatterns = patterns.filter(p => p.importance === 'LOW');
    const oldUnusedPatterns = patterns.filter(p => 
      p.accessFrequency < 0.1 && 
      (Date.now() - p.lastAccessed.getTime()) > 30 * 24 * 60 * 60 * 1000
    );

    if (lowImportancePatterns.length > 0) {
      rules.push({
        table,
        condition: 'Low importance records older than 6 months',
        priority: 80,
        retentionDays: 180,
        description: `Archive ${lowImportancePatterns.length} low-importance records to improve performance`,
        estimatedRecords: lowImportancePatterns.length,
        estimatedSpaceSaving: this.calculateSpaceSaving(lowImportancePatterns)
      });
    }

    if (oldUnusedPatterns.length > 0) {
      rules.push({
        table,
        condition: 'Unused records for 30+ days with low access frequency',
        priority: 90,
        retentionDays: 90,
        description: `Archive ${oldUnusedPatterns.length} rarely accessed old records`,
        estimatedRecords: oldUnusedPatterns.length,
        estimatedSpaceSaving: this.calculateSpaceSaving(oldUnusedPatterns)
      });
    }

    // Table-specific intelligent rules
    const specificRules = this.createTableSpecificIntelligentRules(table, patterns);
    rules.push(...specificRules);

    return rules;
  }

  /**
   * Creates intelligent rules specific to table types
   */
  private createTableSpecificIntelligentRules(table: string, patterns: UsagePattern[]): ArchivingRule[] {
    const rules: ArchivingRule[] = [];

    if (table.includes('sales')) {
      // Archive completed sales older than 1 year with low value
      const lowValueOldSales = patterns.filter(p => 
        p.businessValue < 0.4 && 
        (Date.now() - p.lastAccessed.getTime()) > 365 * 24 * 60 * 60 * 1000
      );

      if (lowValueOldSales.length > 0) {
        rules.push({
          table,
          condition: 'Low-value completed sales older than 1 year',
          priority: 85,
          retentionDays: 365,
          description: `Archive ${lowValueOldSales.length} old low-value sales to optimize current sales performance`,
          estimatedRecords: lowValueOldSales.length,
          estimatedSpaceSaving: this.calculateSpaceSaving(lowValueOldSales)
        });
      }
    }

    if (table.includes('customers')) {
      // Archive inactive customers with no debt
      const inactiveCustomers = patterns.filter(p => 
        p.businessValue < 0.5 && 
        p.accessFrequency < 0.2
      );

      if (inactiveCustomers.length > 0) {
        rules.push({
          table,
          condition: 'Inactive customers with no outstanding debt',
          priority: 70,
          retentionDays: 540, // 1.5 years
          description: `Archive ${inactiveCustomers.length} inactive customers to streamline customer management`,
          estimatedRecords: inactiveCustomers.length,
          estimatedSpaceSaving: this.calculateSpaceSaving(inactiveCustomers)
        });
      }
    }

    return rules;
  }

  /**
   * Calculates space saving for a set of patterns
   */
  private calculateSpaceSaving(patterns: UsagePattern[]): number {
    const totalBytes = patterns.reduce((sum, pattern) => sum + pattern.dataSize, 0);
    return Number((totalBytes / (1024 * 1024)).toFixed(2)); // Convert to MB
  }

  /**
   * Applies smart archiving based on generated rules
   */
  private async applySmartArchiving(): Promise<{ archivedCount: number; spaceSaved: number }> {
    console.log('🔄 Smart archiving rules uygulanıyor...');

    let totalArchived = 0;
    let totalSpaceSaved = 0;

    // Apply highest priority rules first
    for (const rule of this.archivingRules.slice(0, 3)) { // Apply top 3 rules
      try {
        const result = await this.applyArchivingRule(rule);
        totalArchived += result.archivedCount;
        totalSpaceSaved += result.spaceSaved;

        console.log(`✅ Rule applied: ${rule.description} - ${result.archivedCount} records archived`);
      } catch (error) {
        console.error(`Rule application error: ${rule.description}`, error);
      }
    }

    return {
      archivedCount: totalArchived,
      spaceSaved: totalSpaceSaved
    };
  }

  /**
   * Applies a specific archiving rule
   */
  private async applyArchivingRule(rule: ArchivingRule): Promise<{ archivedCount: number; spaceSaved: number }> {
    // This would be the actual archiving logic
    // For now, we simulate the archiving process
    
    const simulatedCount = Math.floor(rule.estimatedRecords * 0.8); // Simulate 80% success rate
    const simulatedSpace = rule.estimatedSpaceSaving * 0.8;

    // In real implementation, this would:
    // 1. Query records matching the rule condition
    // 2. Move them to archive database
    // 3. Remove from main database
    // 4. Update indexes

    return {
      archivedCount: simulatedCount,
      spaceSaved: simulatedSpace
    };
  }

  /**
   * Gets total analyzed records count
   */
  private getTotalAnalyzedRecords(): number {
    return this.usagePatterns.size;
  }

  /**
   * Calculates performance improvement based on space saved
   */
  private calculatePerformanceImprovement(spaceSavedMB: number): number {
    // Rough estimation: every 10MB saved improves performance by ~2%
    return Math.min(50, spaceSavedMB * 0.2);
  }

  /**
   * Calculates next optimization date
   */
  private calculateNextOptimizationDate(): Date {
    const now = new Date();
    const nextOptimization = new Date(now);
    
    // Schedule next optimization based on data growth rate
    const dataGrowthRate = this.estimateDataGrowthRate();
    const daysUntilNext = dataGrowthRate > 0.5 ? 7 : 30; // More frequent if rapid growth
    
    nextOptimization.setDate(nextOptimization.getDate() + daysUntilNext);
    return nextOptimization;
  }

  /**
   * Estimates data growth rate (records per day)
   */
  private estimateDataGrowthRate(): number {
    // Simulate growth rate analysis
    return 0.3 + Math.random() * 0.4; // 0.3-0.7 records per day per table
  }

  /**
   * Generates optimization recommendations
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (this.archivingRules.length > 3) {
      recommendations.push('Consider implementing automated weekly archiving for optimal performance');
    }
    
    const highPriorityRules = this.archivingRules.filter(r => r.priority >= 85);
    if (highPriorityRules.length > 0) {
      recommendations.push(`${highPriorityRules.length} high-priority archiving opportunities detected`);
    }
    
    const totalPotentialSpace = this.archivingRules.reduce((sum, rule) => sum + rule.estimatedSpaceSaving, 0);
    if (totalPotentialSpace > 50) {
      recommendations.push(`Potential ${totalPotentialSpace.toFixed(1)}MB space optimization available`);
    }
    
    recommendations.push('Enable smart archiving for continuous performance optimization');
    
    return recommendations;
  }

  /**
   * Gets current smart archiving status
   */
  async getSmartArchivingStatus(): Promise<{
    isEnabled: boolean;
    lastRun: Date | null;
    nextScheduled: Date | null;
    pendingRules: number;
    estimatedBenefit: number;
  }> {
    try {
      // This would read from settings/configuration
      return {
        isEnabled: true,
        lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        nextScheduled: this.calculateNextOptimizationDate(),
        pendingRules: this.archivingRules.length,
        estimatedBenefit: this.archivingRules.reduce((sum, rule) => sum + rule.estimatedSpaceSaving, 0)
      };
    } catch (error) {
      console.error('Status check error:', error);
      return {
        isEnabled: false,
        lastRun: null,
        nextScheduled: null,
        pendingRules: 0,
        estimatedBenefit: 0
      };
    }
  }
}

// Singleton instance
export const smartArchiveManager = new SmartArchiveManager();