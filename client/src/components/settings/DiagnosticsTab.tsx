import React, { useEffect, useMemo, useState } from 'react'
import { Database, RefreshCw, Wrench, ShieldAlert } from 'lucide-react'
import { reportMissingIndexCandidates, indexOptimizer } from '../../services/IndexOptimizer'
import { useAlert } from '../../components/AlertProvider'

interface Candidate { db: string; store: string; index: string; count: number }

interface DiagnosticsTabProps {
  // Gelecekte gerçek rol sistemine bağlanacak.
  // Şimdilik varsayılan true (dev/test kolaylığı için)
  canApplyIndexes?: boolean
}

const DiagnosticsTab: React.FC<DiagnosticsTabProps> = ({ canApplyIndexes = true }) => {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(false)
  const [optimizing, setOptimizing] = useState(false)
  const { confirm, showSuccess, showError, showWarning } = useAlert()

  const previewList = useMemo(() => {
    if (!candidates.length) {return 'Uygulanacak öneri bulunmuyor.'}
    return candidates.map((c) => `• ${c.db}.${c.store}.${c.index} (adet: ${c.count})`).join('\n')
  }, [candidates])

  async function load() {
    setLoading(true)
    try {
      const list = reportMissingIndexCandidates()
      setCandidates(list)
    } finally {
      setLoading(false)
    }
  }

  async function applySuggested() {
    if (!canApplyIndexes) {
      showWarning('Bu işlem için yönetici yetkisi gerekiyor.')
      return
    }
    const ok = await confirm(
      `Önerilen indeksleri uygulamak üzeresiniz. Bu işlem veritabanı şema sürümünü artırır.\n\nÖnizleme:\n${previewList}\n\nDevam edilsin mi?`
    )
    if (!ok) {return}

    setOptimizing(true)
    try {
      const result = await indexOptimizer.optimizeAllDatabases()
      await load()
      if (result.success) {
        showSuccess('İndeks optimizasyonu tamamlandı')
      } else {
        showWarning('Optimizasyon tamamlandı ancak bazı hatalar oluştu. Ayrıntılar için konsolu kontrol edin.')
      }
    } catch (e) {
      showError('İndeks optimizasyonu sırasında bir hata oluştu')
    } finally {
      setOptimizing(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Wrench size={20} />
        <h2 className="text-xl font-semibold" data-testid="diagnostics-title">Tanılama ve İndeks Önerileri</h2>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => void load()}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
          disabled={loading || optimizing}
          data-testid="btn-refresh"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Yenile
        </button>
        <button
          onClick={() => void applySuggested()}
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-md ${canApplyIndexes ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
          disabled={optimizing}
          data-testid="btn-apply"
          title={canApplyIndexes ? undefined : 'Yalnızca yönetici kullanıcılar uygulayabilir'}
        >
          {canApplyIndexes ? <Database size={16} /> : <ShieldAlert size={16} />} {canApplyIndexes ? 'Önerilen indeksleri uygula' : 'Yetki gerekli'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="font-medium">Eksik indeks adayları</div>
          {loading && <div className="text-sm text-gray-500">Yükleniyor...</div>}
        </div>
        <div className="p-4">
          {candidates.length === 0 ? (
            <div className="text-gray-500" data-testid="no-candidates">Şu an öneri yok. Sistem stabil görünüyor.</div>
          ) : (
            <ul className="divide-y" data-testid="candidate-list">
              {candidates.map((c, i) => (
                <li key={`${c.db}.${c.store}.${c.index}.${i}`} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{c.db}.{c.store}.{c.index}</div>
                    <div className="text-sm text-gray-500">Tekrarlanma: {c.count}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default DiagnosticsTab
