import { ipcMain } from 'electron';
import { machineIdSync } from 'node-machine-id';
import Store from 'electron-store';

interface SerialData {
  serialNo: string;
  machineId: string;
  activatedAt: string;
  isActive: boolean;
}

class SerialManager {
  private store: Store<{ serialData?: SerialData }>;
  private VALID_SERIALS: string[];

  constructor() {
    this.store = new Store<{ serialData?: SerialData }>({
      name: 'serial',
      encryptionKey: 'roxoe-serial-key'
    });
    
    // Geçerli serial numaraları - istediğin kadar ekleyebilirsin
    this.VALID_SERIALS = [
      'ROXOE-2025-001',
      'ROXOE-2025-002', 
      'ROXOE-2025-003',
      'ROXOE-DEMO-001',
      'ROXOE-TEST-001'
    ];
    
    this.setupListeners();
  }

  private setupListeners() {
    ipcMain.handle('check-serial', async () => {
      try {
        const serialData = this.store.get('serialData');
        if (!serialData || !serialData.isActive) {
          return { isValid: false };
        }
        const currentMachineId = machineIdSync();
        if (currentMachineId !== serialData.machineId) {
          return { isValid: false, error: 'Geçersiz makine ID' };
        }
        // Serial no geçerli mi kontrol et
        if (!this.VALID_SERIALS.includes(serialData.serialNo)) {
          return { isValid: false, error: 'Geçersiz serial numarası' };
        }
        return { isValid: true };
      } catch (error) {
        return { isValid: false, error: 'Serial kontrol hatası' };
      }
    });

    ipcMain.handle('activate-serial', async (_, serialNo: string) => {
      try {
        // Serial no formatını kontrol et
        if (!serialNo || serialNo.trim() === '') {
          return { success: false, error: 'Serial numarası boş olamaz' };
        }

        const trimmedSerial = serialNo.trim().toUpperCase();
        
        // Geçerli serial listesinde var mı kontrol et
        if (!this.VALID_SERIALS.includes(trimmedSerial)) {
          return { success: false, error: 'Geçersiz serial numarası' };
        }

        const machineId = machineIdSync();
        const serialData: SerialData = {
          serialNo: trimmedSerial,
          machineId,
          activatedAt: new Date().toISOString(),
          isActive: true
        };
        
        this.store.set('serialData', serialData);
        return { success: true, message: 'Serial başarıyla aktive edildi' };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Serial aktivasyon hatası',
        };
      }
    });

    ipcMain.handle('get-serial-info', async () => {
      try {
        const serialData = this.store.get('serialData');
        if (!serialData) return { exists: false };
        
        const currentMachineId = machineIdSync();
        if (currentMachineId !== serialData.machineId) {
          return { exists: false, error: 'Geçersiz makine ID' };
        }
        
        // Serial no geçerli mi kontrol et
        const isValidSerial = this.VALID_SERIALS.includes(serialData.serialNo);
        
        return {
          exists: true,
          serialNo: serialData.serialNo,
          activatedAt: serialData.activatedAt,
          isActive: serialData.isActive && isValidSerial,
          machineId: serialData.machineId
        };
      } catch (error) {
        return { exists: false, error: 'Serial bilgisi alınamadı' };
      }
    });

    // Serial sıfırlama (geliştirme için)
    ipcMain.handle('reset-serial', async () => {
      try {
        this.store.delete('serialData');
        return { success: true };
      } catch (error) {
        return { success: false, error: 'Serial sıfırlama hatası' };
      }
    });
  }
}

export default SerialManager;