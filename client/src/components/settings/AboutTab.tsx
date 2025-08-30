// components/settings/AboutTab.tsx
import { Info, Globe, Mail, Phone, ExternalLink } from "lucide-react";
import React from "react";

import Button from "../ui/Button";
import Card from "../ui/Card";

interface AboutTabProps {
  appVersion: string;
  onCheckForUpdates: () => void;
  onOpenLogs: () => void;
  onOpenWebsite: () => void;
}

const AboutTab: React.FC<AboutTabProps> = React.memo(({
  appVersion,
  onCheckForUpdates,
  onOpenLogs,
  onOpenWebsite,
}) => {
  return (
    <div className="space-y-6">
      {/* Uygulama Bilgileri */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Info size={20} />
          <h3 className="text-lg font-semibold">Uygulama Bilgileri</h3>
        </div>
        
        <div className="flex items-start gap-6">
          <div className="flex-shrink-0">
            <img 
              src="/icon.png" 
              alt="RoxoePOS Logo" 
              className="w-16 h-16 rounded-lg shadow-sm"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzM5NjZGRiIvPgo8dGV4dCB4PSIzMiIgeT0iNDAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5SPC90ZXh0Pgo8L3N2Zz4K";
              }}
            />
          </div>
          
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">RoxoePOS</h2>
            <p className="text-gray-600 mb-4">
              Modern ve kullanıcı dostu satış noktası (POS) yazılımı
            </p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Sürüm:</span>
                <span className="ml-2 text-gray-900 font-mono">{appVersion}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Platform:</span>
                <span className="ml-2 text-gray-900">Electron + React</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Lisans:</span>
                <span className="ml-2 text-gray-900">Ticari Yazılım</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Dil:</span>
                <span className="ml-2 text-gray-900">Türkçe</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Özellikler */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Ana Özellikler</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Satış ve Stok Yönetimi</h4>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• Hızlı POS satış işlemleri</li>
              <li>• Stok takibi ve uyarıları</li>
              <li>• Barkod desteği</li>
              <li>• Kategori yönetimi</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Raporlama ve Analiz</h4>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• Detaylı satış raporları</li>
              <li>• Kâr-zarar analizi</li>
              <li>• Müşteri analizi</li>
              <li>• Grafik ve istatistikler</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Kasa Yönetimi</h4>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• Günlük kasa açma/kapama</li>
              <li>• Nakit giriş/çıkış takibi</li>
              <li>• Kasa sayımı</li>
              <li>• Vardiya yönetimi</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Gelişmiş Özellikler</h4>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• AI destekli optimizasyon</li>
              <li>• Bulut senkronizasyon</li>
              <li>• Otomatik yedekleme</li>
              <li>• Performans izleme</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Güncellemeler ve Destek */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Güncellemeler ve Destek</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={onCheckForUpdates}
            className="flex items-center justify-center gap-2 h-12"
          >
            <ExternalLink size={16} />
            Güncellemeleri Kontrol Et
          </Button>
          
          <Button
            variant="outline"
            onClick={onOpenLogs}
            className="flex items-center justify-center gap-2 h-12"
          >
            <Info size={16} />
            Log Dosyalarını Aç
          </Button>
        </div>
      </Card>

      {/* İletişim Bilgileri */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">İletişim ve Destek</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Destek Ekibi</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-gray-400" />
                <div>
                  <div className="text-gray-900">destek@roxoepos.com</div>
                  <div className="text-gray-500">Teknik destek için</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail size={16} className="text-gray-400" />
                <div>
                  <div className="text-gray-900">Yusuf Yavuz</div>
                  <div className="text-gray-500">Roxoe Team · yusuf.yavuz@roxoe.com.tr</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-gray-400" />
                <div>
                  <div className="text-gray-900">0850 XXX XX XX</div>
                  <div className="text-gray-500">Pazartesi-Cuma 09:00-18:00</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Globe size={16} className="text-gray-400" />
                <div>
                  <button
                    onClick={onOpenWebsite}
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    www.roxoepos.com
                  </button>
                  <div className="text-gray-500">Resmi web sitesi</div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Kullanım Kılavuzu</h4>
            <div className="space-y-2 text-sm">
              <button
                onClick={() => window.open('https://docs.roxoepos.com/quickstart', '_blank')}
                className="block w-full text-left p-2 rounded border hover:bg-gray-50"
              >
                📚 Hızlı Başlangıç Kılavuzu
              </button>
              
              <button
                onClick={() => window.open('https://docs.roxoepos.com/features', '_blank')}
                className="block w-full text-left p-2 rounded border hover:bg-gray-50"
              >
                🔧 Özellik Detayları
              </button>
              
              <button
                onClick={() => window.open('https://docs.roxoepos.com/troubleshooting', '_blank')}
                className="block w-full text-left p-2 rounded border hover:bg-gray-50"
              >
                🛠️ Sorun Giderme
              </button>
              
              <button
                onClick={() => window.open('https://docs.roxoepos.com/faq', '_blank')}
                className="block w-full text-left p-2 rounded border hover:bg-gray-50"
              >
                ❓ Sıkça Sorulan Sorular
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Sistem Bilgileri */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Sistem Bilgileri</h3>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">İşletim Sistemi:</span>
            <div className="text-gray-900 mt-1">{navigator.platform}</div>
          </div>
          
          <div>
            <span className="font-medium text-gray-700">Tarayıcı:</span>
            <div className="text-gray-900 mt-1">{navigator.userAgent.split(' ')[0]}</div>
          </div>
          
          <div>
            <span className="font-medium text-gray-700">Ekran Çözünürlüğü:</span>
            <div className="text-gray-900 mt-1">{screen.width} x {screen.height}</div>
          </div>
          
          <div>
            <span className="font-medium text-gray-700">Bellek:</span>
              <div className="text-gray-900 mt-1">
              {(() => {
                type PerfWithMemory = { memory?: { usedJSHeapSize: number } };
                const mem = (performance as unknown as PerfWithMemory).memory;
                return mem ? `${Math.round(mem.usedJSHeapSize / 1024 / 1024)} MB` : 'Bilinmiyor';
              })()}
              </div>
          </div>
        </div>
      </Card>

      {/* Telif Hakkı */}
      <Card className="p-6">
        <div className="text-center text-sm text-gray-500">
          <p>© 2024 RoxoePOS. Tüm hakları saklıdır.</p>
          <p className="mt-1">
            Bu yazılım ticari amaçlarla geliştirilmiştir ve telif hakkı yasalarıyla korunmaktadır.
          </p>
        </div>
      </Card>
    </div>
  );
});

AboutTab.displayName = "AboutTab";

export default AboutTab;