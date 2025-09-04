/**
 * EventBus Utility Tests
 * Event bus sistemi için testler
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import eventBus from '../eventBus';

describe('EventBus', () => {
  beforeEach(() => {
    // Clear all listeners before each test
    eventBus.removeAllListeners();
  });

  describe('on', () => {
    it('event listener eklemeli', () => {
      const callback = vi.fn();
      eventBus.on('test-event', callback);

      eventBus.emit('test-event', 'data');
      expect(callback).toHaveBeenCalledWith('data');
    });

    it('birden fazla listener eklenebilmeli', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      eventBus.on('test-event', callback1);
      eventBus.on('test-event', callback2);

      eventBus.emit('test-event', 'data');
      
      expect(callback1).toHaveBeenCalledWith('data');
      expect(callback2).toHaveBeenCalledWith('data');
    });

    it('farklı event\'ler için farklı listener\'lar çalışmalı', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      eventBus.on('event1', callback1);
      eventBus.on('event2', callback2);

      eventBus.emit('event1', 'data1');
      expect(callback1).toHaveBeenCalledWith('data1');
      expect(callback2).not.toHaveBeenCalled();

      eventBus.emit('event2', 'data2');
      expect(callback2).toHaveBeenCalledWith('data2');
    });
  });

  describe('once', () => {
    it('listener sadece bir kez çalışmalı', () => {
      const callback = vi.fn();
      eventBus.once('test-event', callback);

      eventBus.emit('test-event', 'first');
      eventBus.emit('test-event', 'second');

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('first');
    });
  });

  describe('off', () => {
    it('belirtilen listener kaldırılmalı', () => {
      const callback = vi.fn();
      eventBus.on('test-event', callback);

      eventBus.off('test-event', callback);
      eventBus.emit('test-event', 'data');

      expect(callback).not.toHaveBeenCalled();
    });

    it('sadece belirtilen listener kaldırılmalı', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      eventBus.on('test-event', callback1);
      eventBus.on('test-event', callback2);

      eventBus.off('test-event', callback1);
      eventBus.emit('test-event', 'data');

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledWith('data');
    });
  });

  describe('emit', () => {
    it('birden fazla argüman iletebilmeli', () => {
      const callback = vi.fn();
      eventBus.on('test-event', callback);

      eventBus.emit('test-event', 'arg1', 'arg2', { key: 'value' });
      
      expect(callback).toHaveBeenCalledWith('arg1', 'arg2', { key: 'value' });
    });

    it('listener yoksa hata vermemeli', () => {
      expect(() => {
        eventBus.emit('non-existent-event', 'data');
      }).not.toThrow();
    });

    it('listener sırayla çalışmalı', () => {
      const order: number[] = [];
      
      eventBus.on('test-event', () => order.push(1));
      eventBus.on('test-event', () => order.push(2));
      eventBus.on('test-event', () => order.push(3));

      eventBus.emit('test-event');
      
      expect(order).toEqual([1, 2, 3]);
    });
  });

  describe('removeAllListeners', () => {
    it('tüm listener\'lar kaldırılmalı', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      eventBus.on('event1', callback1);
      eventBus.on('event2', callback2);

      eventBus.removeAllListeners();

      eventBus.emit('event1');
      eventBus.emit('event2');

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
    });

    it('belirtilen event için tüm listener\'lar kaldırılmalı', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const callback3 = vi.fn();

      eventBus.on('event1', callback1);
      eventBus.on('event1', callback2);
      eventBus.on('event2', callback3);

      eventBus.removeAllListeners('event1');

      eventBus.emit('event1');
      eventBus.emit('event2');

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
      expect(callback3).toHaveBeenCalled();
    });
  });

  describe('listenerCount', () => {
    it('listener sayısını döndürmeli', () => {
      expect(eventBus.listenerCount('test-event')).toBe(0);

      eventBus.on('test-event', () => {});
      expect(eventBus.listenerCount('test-event')).toBe(1);

      eventBus.on('test-event', () => {});
      expect(eventBus.listenerCount('test-event')).toBe(2);
    });
  });

  describe('listeners', () => {
    it('listener listesini döndürmeli', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      eventBus.on('test-event', callback1);
      eventBus.on('test-event', callback2);

      const listeners = eventBus.listeners('test-event');
      expect(listeners).toContain(callback1);
      expect(listeners).toContain(callback2);
      expect(listeners).toHaveLength(2);
    });
  });

  describe('error handling', () => {
    it('listener hata verse de diğerleri çalışmalı', () => {
      const callback1 = vi.fn(() => {
        throw new Error('Test error');
      });
      const callback2 = vi.fn();

      const consoleError = vi.spyOn(console, 'error').mockImplementation();

      eventBus.on('test-event', callback1);
      eventBus.on('test-event', callback2);

      eventBus.emit('test-event', 'data');

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();

      consoleError.mockRestore();
    });
  });
});
