# ADR-0005: Şifreleme anahtar yönetimi

## Context
Yerel ayarlar/lisans verisinin güvenliği

## Decision
`node-machine-id` ile cihaz bazlı anahtar türetme + crypto-js AES, HMAC.

## Consequences
+ Basit ve cihaz bağlı güvenlik
- Cihaz değişiminde veri erişimi için göç adımı gerekebilir

## Alternatives
- Kullanıcı parolasıyla türetme (kullanıcı deneyimi karmaşık)

