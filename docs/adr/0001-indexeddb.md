# ADR-0001: Yerel veri deposu olarak IndexedDB

## Context
Masaüstü (Electron) renderer tarafında offline-first gereksinimi ve web standartlarıyla uyum.

## Decision
IndexedDB (idb kütüphanesi ile) kullanıldı.

## Consequences
+ Offline ve hızlı erişim
+ Şema esnekliği
- Karmaşık migration adımları gerekebilir

## Alternatives
- SQLite (native): Daha güçlü sorgular, ancak ek paket/dağıtım karmaşıklığı

