# ADR-0004: Sanallaştırılmış listeler (react-window)

## Context
Büyük listelerde performans ve 60fps hedefi

## Decision
`react-window` ile FixedSizeList/Grid kullanımı; küçük listelerde klasik render.

## Consequences
+ Büyük listelerde akıcı scroll
- Satır yüksekliği sabit olmalı (dinamik yükseklik desteği yok)

## Alternatives
- react-virtualized (daha ağır)
- Sanal olmayan klasik render (performans kötü)

