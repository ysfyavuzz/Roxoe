/**
 * useAuth Hook Unit Tests
 * Kimlik doğrulama ve yetkilendirme hook'u için kapsamlı test senaryoları
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAuth } from '../useAuth';
import * as authService from '../../services/authService';
import * as userDB from '../../services/userDB';
import * as sessionStorage from '../../utils/sessionStorage';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// Mock dependencies
vi.mock('../../services/authService');
vi.mock('../../services/userDB');
vi.mock('../../utils/sessionStorage');
vi.mock('react-hot-toast');
vi.mock('react-router-dom');

describe('useAuth Hook', () => {
  const mockUser = {
    id: 1,
    username: 'testuser',
    name: 'Test User',
    email: 'test@example.com',
    role: 'cashier',
    permissions: ['sales', 'cash_operations', 'reports'],
    isActive: true,
    createdAt: '2025-01-01',
    lastLogin: '2025-01-20T09:00:00'
  };

  const mockAdminUser = {
    ...mockUser,
    id: 2,
    username: 'admin',
    name: 'Admin User',
    role: 'admin',
    permissions: ['all']
  };

  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(sessionStorage.getItem).mockReturnValue(null);
    vi.mocked(sessionStorage.setItem).mockImplementation(() => {});
    vi.mocked(sessionStorage.removeItem).mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('başlangıçta kullanıcı oturumu kontrolü yapmalı', async () => {
      const mockToken = 'valid-token';
      vi.mocked(sessionStorage.getItem).mockReturnValue(mockToken);
      vi.mocked(authService.validateToken).mockResolvedValueOnce({ valid: true, user: mockUser });

      const { result } = renderHook(() => useAuth());

      expect(result.current.loading).toBe(true);
      expect(result.current.isAuthenticated).toBe(false);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.user).toEqual(mockUser);
      });

      expect(authService.validateToken).toHaveBeenCalledWith(mockToken);
    });

    it('geçersiz token ile kullanıcıyı logout etmeli', async () => {
      const mockToken = 'invalid-token';
      vi.mocked(sessionStorage.getItem).mockReturnValue(mockToken);
      vi.mocked(authService.validateToken).mockResolvedValueOnce({ valid: false });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.user).toBeNull();
      });

      expect(sessionStorage.removeItem).toHaveBeenCalledWith('token');
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('refreshToken');
    });

    it('token yoksa authenticated false olmalı', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.user).toBeNull();
      });

      expect(authService.validateToken).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('başarılı giriş yapmalı', async () => {
      const credentials = {
        username: 'testuser',
        password: 'Test123!'
      };

      const loginResponse = {
        success: true,
        user: mockUser,
        token: 'new-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600
      };

      vi.mocked(authService.login).mockResolvedValueOnce(loginResponse);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        const success = await result.current.login(credentials);
        expect(success).toBe(true);
      });

      expect(authService.login).toHaveBeenCalledWith(credentials);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(sessionStorage.setItem).toHaveBeenCalledWith('token', loginResponse.token);
      expect(sessionStorage.setItem).toHaveBeenCalledWith('refreshToken', loginResponse.refreshToken);
      expect(toast.success).toHaveBeenCalledWith('Giriş başarılı');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    it('yanlış şifre ile giriş yapamamalı', async () => {
      const credentials = {
        username: 'testuser',
        password: 'wrongpassword'
      };

      vi.mocked(authService.login).mockRejectedValueOnce(
        new Error('Kullanıcı adı veya şifre yanlış')
      );

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        const success = await result.current.login(credentials);
        expect(success).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(toast.error).toHaveBeenCalledWith('Kullanıcı adı veya şifre yanlış');
    });

    it('deaktif kullanıcı giriş yapamamalı', async () => {
      const credentials = {
        username: 'inactive',
        password: 'Test123!'
      };

      vi.mocked(authService.login).mockRejectedValueOnce(
        new Error('Hesabınız deaktif edilmiş')
      );

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        const success = await result.current.login(credentials);
        expect(success).toBe(false);
      });

      expect(toast.error).toHaveBeenCalledWith('Hesabınız deaktif edilmiş');
    });

    it('maksimum deneme sayısı aşımında hesap kilitlenmeli', async () => {
      const { result } = renderHook(() => useAuth());

      // 5 başarısız deneme
      for (let i = 0; i < 5; i++) {
        vi.mocked(authService.login).mockRejectedValueOnce(
          new Error('Kullanıcı adı veya şifre yanlış')
        );

        await act(async () => {
          await result.current.login({ username: 'test', password: 'wrong' });
        });
      }

      expect(result.current.loginAttempts).toBe(5);
      expect(result.current.isAccountLocked).toBe(true);
      expect(toast.error).toHaveBeenCalledWith('Hesabınız kilitlendi. 15 dakika bekleyin.');
    });

    it('remember me seçeneği ile giriş yapmalı', async () => {
      const credentials = {
        username: 'testuser',
        password: 'Test123!',
        rememberMe: true
      };

      const loginResponse = {
        success: true,
        user: mockUser,
        token: 'token',
        refreshToken: 'refresh',
        expiresIn: 604800 // 7 gün
      };

      vi.mocked(authService.login).mockResolvedValueOnce(loginResponse);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login(credentials);
      });

      expect(sessionStorage.setItem).toHaveBeenCalledWith('rememberMe', 'true');
      expect(loginResponse.expiresIn).toBe(604800);
    });
  });

  describe('logout', () => {
    it('başarılı çıkış yapmalı', async () => {
      // Önce login yap
      vi.mocked(sessionStorage.getItem).mockReturnValue('token');
      vi.mocked(authService.validateToken).mockResolvedValueOnce({ 
        valid: true, 
        user: mockUser 
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      vi.mocked(authService.logout).mockResolvedValueOnce({ success: true });

      await act(async () => {
        await result.current.logout();
      });

      expect(authService.logout).toHaveBeenCalled();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('token');
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(toast.success).toHaveBeenCalledWith('Çıkış yapıldı');
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('zorla çıkış yapabilmeli (force logout)', async () => {
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.forceLogout('Oturum süresi doldu');
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(toast.warning).toHaveBeenCalledWith('Oturum süresi doldu');
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  describe('password management', () => {
    it('şifre değiştirme işlemi yapmalı', async () => {
      vi.mocked(sessionStorage.getItem).mockReturnValue('token');
      vi.mocked(authService.validateToken).mockResolvedValueOnce({ 
        valid: true, 
        user: mockUser 
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      const passwordData = {
        currentPassword: 'OldPass123!',
        newPassword: 'NewPass456!',
        confirmPassword: 'NewPass456!'
      };

      vi.mocked(authService.changePassword).mockResolvedValueOnce({ 
        success: true 
      });

      await act(async () => {
        const success = await result.current.changePassword(passwordData);
        expect(success).toBe(true);
      });

      expect(authService.changePassword).toHaveBeenCalledWith(passwordData);
      expect(toast.success).toHaveBeenCalledWith('Şifre değiştirildi');
    });

    it('eski şifre yanlışsa değiştirememeli', async () => {
      const { result } = renderHook(() => useAuth());

      vi.mocked(authService.changePassword).mockRejectedValueOnce(
        new Error('Mevcut şifre yanlış')
      );

      await act(async () => {
        const success = await result.current.changePassword({
          currentPassword: 'WrongPass',
          newPassword: 'NewPass456!',
          confirmPassword: 'NewPass456!'
        });
        expect(success).toBe(false);
      });

      expect(toast.error).toHaveBeenCalledWith('Mevcut şifre yanlış');
    });

    it('şifre sıfırlama isteği gönderebilmeli', async () => {
      const { result } = renderHook(() => useAuth());

      vi.mocked(authService.requestPasswordReset).mockResolvedValueOnce({
        success: true,
        message: 'Sıfırlama bağlantısı gönderildi'
      });

      await act(async () => {
        const success = await result.current.requestPasswordReset('test@example.com');
        expect(success).toBe(true);
      });

      expect(authService.requestPasswordReset).toHaveBeenCalledWith('test@example.com');
      expect(toast.success).toHaveBeenCalledWith('Sıfırlama bağlantısı e-posta adresinize gönderildi');
    });

    it('şifre sıfırlama işlemi yapmalı', async () => {
      const { result } = renderHook(() => useAuth());

      const resetData = {
        token: 'reset-token',
        newPassword: 'NewPass789!',
        confirmPassword: 'NewPass789!'
      };

      vi.mocked(authService.resetPassword).mockResolvedValueOnce({
        success: true
      });

      await act(async () => {
        const success = await result.current.resetPassword(resetData);
        expect(success).toBe(true);
      });

      expect(authService.resetPassword).toHaveBeenCalledWith(resetData);
      expect(toast.success).toHaveBeenCalledWith('Şifreniz başarıyla sıfırlandı');
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  describe('permissions', () => {
    it('kullanıcı yetkilerini kontrol etmeli', async () => {
      vi.mocked(sessionStorage.getItem).mockReturnValue('token');
      vi.mocked(authService.validateToken).mockResolvedValueOnce({ 
        valid: true, 
        user: mockUser 
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      expect(result.current.hasPermission('sales')).toBe(true);
      expect(result.current.hasPermission('cash_operations')).toBe(true);
      expect(result.current.hasPermission('user_management')).toBe(false);
    });

    it('admin tüm yetkilere sahip olmalı', async () => {
      vi.mocked(sessionStorage.getItem).mockReturnValue('token');
      vi.mocked(authService.validateToken).mockResolvedValueOnce({ 
        valid: true, 
        user: mockAdminUser 
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      expect(result.current.hasPermission('any_permission')).toBe(true);
      expect(result.current.isAdmin).toBe(true);
    });

    it('rol kontrolü yapmalı', async () => {
      vi.mocked(sessionStorage.getItem).mockReturnValue('token');
      vi.mocked(authService.validateToken).mockResolvedValueOnce({ 
        valid: true, 
        user: mockUser 
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      expect(result.current.hasRole('cashier')).toBe(true);
      expect(result.current.hasRole('admin')).toBe(false);
      expect(result.current.hasRole('manager')).toBe(false);
    });

    it('çoklu yetki kontrolü yapmalı', async () => {
      vi.mocked(sessionStorage.getItem).mockReturnValue('token');
      vi.mocked(authService.validateToken).mockResolvedValueOnce({ 
        valid: true, 
        user: mockUser 
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Tüm yetkiler var mı?
      expect(result.current.hasAllPermissions(['sales', 'reports'])).toBe(true);
      expect(result.current.hasAllPermissions(['sales', 'user_management'])).toBe(false);

      // En az bir yetki var mı?
      expect(result.current.hasAnyPermission(['sales', 'user_management'])).toBe(true);
      expect(result.current.hasAnyPermission(['user_management', 'system_settings'])).toBe(false);
    });
  });

  describe('session management', () => {
    it('oturum süresini yenilemeli', async () => {
      vi.mocked(sessionStorage.getItem).mockReturnValue('token');
      vi.mocked(authService.validateToken).mockResolvedValueOnce({ 
        valid: true, 
        user: mockUser 
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      vi.mocked(authService.refreshToken).mockResolvedValueOnce({
        success: true,
        token: 'new-token',
        refreshToken: 'new-refresh',
        expiresIn: 3600
      });

      await act(async () => {
        const success = await result.current.refreshSession();
        expect(success).toBe(true);
      });

      expect(authService.refreshToken).toHaveBeenCalled();
      expect(sessionStorage.setItem).toHaveBeenCalledWith('token', 'new-token');
    });

    it('otomatik oturum yenileme yapmalı', async () => {
      vi.mocked(sessionStorage.getItem).mockReturnValue('token');
      vi.mocked(authService.validateToken).mockResolvedValueOnce({ 
        valid: true, 
        user: mockUser 
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Auto refresh etkinleştir
      act(() => {
        result.current.enableAutoRefresh(5); // 5 saniye
      });

      expect(result.current.autoRefreshEnabled).toBe(true);

      // Auto refresh devre dışı bırak
      act(() => {
        result.current.disableAutoRefresh();
      });

      expect(result.current.autoRefreshEnabled).toBe(false);
    });

    it('oturum zaman aşımını kontrol etmeli', async () => {
      const { result } = renderHook(() => useAuth());

      // Token süresi dolmuş
      vi.mocked(authService.isTokenExpired).mockReturnValue(true);

      const isExpired = result.current.isSessionExpired();
      
      expect(isExpired).toBe(true);
    });

    it('idle timeout yönetimi yapmalı', async () => {
      vi.mocked(sessionStorage.getItem).mockReturnValue('token');
      vi.mocked(authService.validateToken).mockResolvedValueOnce({ 
        valid: true, 
        user: mockUser 
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // İdle timeout ayarla (1 saniye)
      act(() => {
        result.current.setIdleTimeout(1);
      });

      // 1 saniye bekle
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Idle timeout tetiklenmeli
      expect(toast.warning).toHaveBeenCalledWith(
        expect.stringContaining('hareketsizlik')
      );
    });
  });

  describe('two-factor authentication', () => {
    it('2FA etkinleştirme işlemi yapmalı', async () => {
      vi.mocked(sessionStorage.getItem).mockReturnValue('token');
      vi.mocked(authService.validateToken).mockResolvedValueOnce({ 
        valid: true, 
        user: mockUser 
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      vi.mocked(authService.enable2FA).mockResolvedValueOnce({
        success: true,
        qrCode: 'data:image/png;base64,QR_CODE_DATA',
        secret: 'SECRET_KEY'
      });

      await act(async () => {
        const result2fa = await result.current.enable2FA();
        expect(result2fa).toMatchObject({
          success: true,
          qrCode: expect.any(String)
        });
      });

      expect(authService.enable2FA).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('2FA etkinleştirildi');
    });

    it('2FA devre dışı bırakma işlemi yapmalı', async () => {
      vi.mocked(sessionStorage.getItem).mockReturnValue('token');
      vi.mocked(authService.validateToken).mockResolvedValueOnce({ 
        valid: true, 
        user: { ...mockUser, twoFactorEnabled: true } 
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      vi.mocked(authService.disable2FA).mockResolvedValueOnce({
        success: true
      });

      await act(async () => {
        const success = await result.current.disable2FA('123456');
        expect(success).toBe(true);
      });

      expect(authService.disable2FA).toHaveBeenCalledWith('123456');
      expect(toast.success).toHaveBeenCalledWith('2FA devre dışı bırakıldı');
    });

    it('2FA kodu ile giriş yapmalı', async () => {
      const credentials = {
        username: 'testuser',
        password: 'Test123!',
        twoFactorCode: '123456'
      };

      vi.mocked(authService.login).mockResolvedValueOnce({
        success: true,
        requiresTwoFactor: false,
        user: mockUser,
        token: 'token',
        refreshToken: 'refresh'
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        const success = await result.current.loginWith2FA(credentials);
        expect(success).toBe(true);
      });

      expect(authService.login).toHaveBeenCalledWith(credentials);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('user profile', () => {
    it('kullanıcı profilini güncellemeli', async () => {
      vi.mocked(sessionStorage.getItem).mockReturnValue('token');
      vi.mocked(authService.validateToken).mockResolvedValueOnce({ 
        valid: true, 
        user: mockUser 
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      const profileUpdate = {
        name: 'Updated Name',
        email: 'newemail@example.com',
        phone: '5551234567'
      };

      vi.mocked(userDB.updateUserProfile).mockResolvedValueOnce({
        ...mockUser,
        ...profileUpdate
      });

      await act(async () => {
        const success = await result.current.updateProfile(profileUpdate);
        expect(success).toBe(true);
      });

      expect(userDB.updateUserProfile).toHaveBeenCalledWith(mockUser.id, profileUpdate);
      expect(result.current.user?.name).toBe('Updated Name');
      expect(toast.success).toHaveBeenCalledWith('Profil güncellendi');
    });

    it('avatar yüklemeli', async () => {
      vi.mocked(sessionStorage.getItem).mockReturnValue('token');
      vi.mocked(authService.validateToken).mockResolvedValueOnce({ 
        valid: true, 
        user: mockUser 
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      const file = new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' });

      vi.mocked(userDB.uploadAvatar).mockResolvedValueOnce({
        success: true,
        avatarUrl: '/uploads/avatar.jpg'
      });

      await act(async () => {
        const success = await result.current.uploadAvatar(file);
        expect(success).toBe(true);
      });

      expect(userDB.uploadAvatar).toHaveBeenCalledWith(mockUser.id, file);
      expect(toast.success).toHaveBeenCalledWith('Avatar güncellendi');
    });

    it('kullanıcı tercihlerini güncellemeli', async () => {
      vi.mocked(sessionStorage.getItem).mockReturnValue('token');
      vi.mocked(authService.validateToken).mockResolvedValueOnce({ 
        valid: true, 
        user: mockUser 
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      const preferences = {
        theme: 'dark',
        language: 'tr',
        notifications: true,
        emailAlerts: false
      };

      vi.mocked(userDB.updateUserPreferences).mockResolvedValueOnce({
        success: true
      });

      await act(async () => {
        await result.current.updatePreferences(preferences);
      });

      expect(userDB.updateUserPreferences).toHaveBeenCalledWith(mockUser.id, preferences);
      expect(result.current.userPreferences).toEqual(preferences);
    });
  });

  describe('login history', () => {
    it('giriş geçmişini getirmeli', async () => {
      vi.mocked(sessionStorage.getItem).mockReturnValue('token');
      vi.mocked(authService.validateToken).mockResolvedValueOnce({ 
        valid: true, 
        user: mockUser 
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      const loginHistory = [
        {
          id: 1,
          userId: mockUser.id,
          loginTime: '2025-01-20T09:00:00',
          ipAddress: '192.168.1.1',
          device: 'Chrome/Windows',
          location: 'Istanbul, TR'
        },
        {
          id: 2,
          userId: mockUser.id,
          loginTime: '2025-01-19T14:30:00',
          ipAddress: '192.168.1.1',
          device: 'Chrome/Windows',
          location: 'Istanbul, TR'
        }
      ];

      vi.mocked(authService.getLoginHistory).mockResolvedValueOnce(loginHistory);

      const history = await result.current.getLoginHistory();

      expect(history).toEqual(loginHistory);
      expect(authService.getLoginHistory).toHaveBeenCalledWith(mockUser.id);
    });

    it('aktif oturumları listelemeli', async () => {
      vi.mocked(sessionStorage.getItem).mockReturnValue('token');
      vi.mocked(authService.validateToken).mockResolvedValueOnce({ 
        valid: true, 
        user: mockUser 
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      const activeSessions = [
        {
          id: 'session-1',
          device: 'Chrome/Windows',
          ipAddress: '192.168.1.1',
          lastActivity: '2025-01-20T15:00:00',
          current: true
        },
        {
          id: 'session-2',
          device: 'Mobile/Android',
          ipAddress: '192.168.1.2',
          lastActivity: '2025-01-20T14:00:00',
          current: false
        }
      ];

      vi.mocked(authService.getActiveSessions).mockResolvedValueOnce(activeSessions);

      const sessions = await result.current.getActiveSessions();

      expect(sessions).toEqual(activeSessions);
    });

    it('diğer oturumları sonlandırmalı', async () => {
      vi.mocked(sessionStorage.getItem).mockReturnValue('token');
      vi.mocked(authService.validateToken).mockResolvedValueOnce({ 
        valid: true, 
        user: mockUser 
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      vi.mocked(authService.terminateOtherSessions).mockResolvedValueOnce({
        success: true,
        terminated: 2
      });

      await act(async () => {
        const result2 = await result.current.terminateOtherSessions();
        expect(result2.terminated).toBe(2);
      });

      expect(toast.success).toHaveBeenCalledWith('2 oturum sonlandırıldı');
    });
  });

  describe('security features', () => {
    it('güvenlik sorularını ayarlamalı', async () => {
      vi.mocked(sessionStorage.getItem).mockReturnValue('token');
      vi.mocked(authService.validateToken).mockResolvedValueOnce({ 
        valid: true, 
        user: mockUser 
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      const securityQuestions = [
        { question: 'İlk evcil hayvanınızın adı?', answer: 'Fluffy' },
        { question: 'Doğduğunuz şehir?', answer: 'Istanbul' }
      ];

      vi.mocked(authService.setSecurityQuestions).mockResolvedValueOnce({
        success: true
      });

      await act(async () => {
        const success = await result.current.setSecurityQuestions(securityQuestions);
        expect(success).toBe(true);
      });

      expect(authService.setSecurityQuestions).toHaveBeenCalledWith(securityQuestions);
      expect(toast.success).toHaveBeenCalledWith('Güvenlik soruları ayarlandı');
    });

    it('şüpheli giriş denemelerini tespit etmeli', async () => {
      const { result } = renderHook(() => useAuth());

      vi.mocked(authService.checkSuspiciousActivity).mockResolvedValueOnce({
        suspicious: true,
        reason: 'Farklı lokasyondan giriş',
        requiresVerification: true
      });

      await act(async () => {
        const check = await result.current.checkSuspiciousActivity();
        expect(check.suspicious).toBe(true);
      });

      expect(toast.warning).toHaveBeenCalledWith('Şüpheli giriş denemesi tespit edildi');
    });

    it('IP kısıtlaması kontrolü yapmalı', async () => {
      const { result } = renderHook(() => useAuth());

      vi.mocked(authService.checkIPRestriction).mockResolvedValueOnce({
        allowed: false,
        reason: 'IP adresi kara listede'
      });

      await act(async () => {
        const allowed = await result.current.checkIPAccess('192.168.1.100');
        expect(allowed).toBe(false);
      });

      expect(toast.error).toHaveBeenCalledWith('Bu IP adresinden giriş yapılamaz');
    });
  });

  describe('error handling', () => {
    it('ağ hatalarını yönetmeli', async () => {
      const { result } = renderHook(() => useAuth());

      vi.mocked(authService.login).mockRejectedValueOnce(
        new Error('Network error')
      );

      await act(async () => {
        const success = await result.current.login({
          username: 'test',
          password: 'pass'
        });
        expect(success).toBe(false);
      });

      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Bağlantı hatası')
      );
    });

    it('sunucu hatalarını yönetmeli', async () => {
      const { result } = renderHook(() => useAuth());

      vi.mocked(authService.login).mockRejectedValueOnce(
        new Error('Internal server error')
      );

      await act(async () => {
        const success = await result.current.login({
          username: 'test',
          password: 'pass'
        });
        expect(success).toBe(false);
      });

      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Sunucu hatası')
      );
    });

    it('rate limiting hatalarını yönetmeli', async () => {
      const { result } = renderHook(() => useAuth());

      vi.mocked(authService.login).mockRejectedValueOnce(
        new Error('Too many requests')
      );

      await act(async () => {
        const success = await result.current.login({
          username: 'test',
          password: 'pass'
        });
        expect(success).toBe(false);
      });

      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Çok fazla deneme')
      );
    });
  });
});
