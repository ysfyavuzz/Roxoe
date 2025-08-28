# ADR-0003: Optimize edilmiş yedekleme stratejisi

## Context
Büyük veri setlerinde performans ve dayanıklılık

## Decision
OptimizedBackupManager ana yol; streaming serializer ile parça parça işleme.

## Consequences
+ Büyük veride daha dayanıklı
+ İlerleme raporları (backup-progress)
- Kod karmaşıklığı artışı

## Alternatives
- Tek seferde JSON serialize/deserialize (performans zayıf)

