import React, { useEffect, useRef } from 'react';

class AudioSystem {
  constructor() {
    this.audioContext = null;
    this.sounds = {};
    this.isInitialized = false;
  }

  async initialize() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      await this.loadSounds();
      this.isInitialized = true;
      console.log('🎵 Epic Audio System Initialized!');
    } catch (error) {
      console.error('Audio system initialization failed:', error);
    }
  }

  async loadSounds() {
    // Create epic notification sounds using Web Audio API
    this.sounds = {
      notification: this.createNotificationSound(),
      success: this.createSuccessSound(),
      error: this.createErrorSound(),
      payment: this.createPaymentSound(),
      message: this.createMessageSound(),
      epic: this.createEpicSound()
    };
  }

  createNotificationSound() {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
    
    return { oscillator, gainNode };
  }

  createSuccessSound() {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.setValueAtTime(523.25, this.audioContext.currentTime); // C5
    oscillator.frequency.exponentialRampToValueAtTime(659.25, this.audioContext.currentTime + 0.1); // E5
    oscillator.frequency.exponentialRampToValueAtTime(783.99, this.audioContext.currentTime + 0.2); // G5
    
    gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
    
    return { oscillator, gainNode };
  }

  createErrorSound() {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(150, this.audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
    
    return { oscillator, gainNode };
  }

  createPaymentSound() {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime); // A4
    oscillator.frequency.exponentialRampToValueAtTime(554.37, this.audioContext.currentTime + 0.1); // C#5
    oscillator.frequency.exponentialRampToValueAtTime(659.25, this.audioContext.currentTime + 0.2); // E5
    oscillator.frequency.exponentialRampToValueAtTime(783.99, this.audioContext.currentTime + 0.3); // G5
    
    gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
    
    return { oscillator, gainNode };
  }

  createMessageSound() {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.1);
    oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
    
    return { oscillator, gainNode };
  }

  createEpicSound() {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Epic rock-style chord progression
    oscillator.frequency.setValueAtTime(220, this.audioContext.currentTime); // A3
    oscillator.frequency.exponentialRampToValueAtTime(277.18, this.audioContext.currentTime + 0.2); // C#4
    oscillator.frequency.exponentialRampToValueAtTime(329.63, this.audioContext.currentTime + 0.4); // E4
    oscillator.frequency.exponentialRampToValueAtTime(440, this.audioContext.currentTime + 0.6); // A4
    oscillator.frequency.exponentialRampToValueAtTime(554.37, this.audioContext.currentTime + 0.8); // C#5
    
    gainNode.gain.setValueAtTime(0.6, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1.0);
    
    return { oscillator, gainNode };
  }

  playSound(soundName) {
    if (!this.isInitialized || !this.sounds[soundName]) {
      console.warn(`Sound ${soundName} not available`);
      return;
    }

    try {
      const sound = this.sounds[soundName];
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Clone the sound parameters
      Object.assign(oscillator, sound.oscillator);
      Object.assign(gainNode, sound.gainNode);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.5);
      
      console.log(`🎵 Playing ${soundName} sound`);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }

  playNotification() {
    this.playSound('notification');
  }

  playSuccess() {
    this.playSound('success');
  }

  playError() {
    this.playSound('error');
  }

  playPayment() {
    this.playSound('payment');
  }

  playMessage() {
    this.playSound('message');
  }

  playEpic() {
    this.playSound('epic');
  }

  // Rock-style drum beat
  playDrumBeat() {
    if (!this.isInitialized) return;

    const kick = this.audioContext.createOscillator();
    const kickGain = this.audioContext.createGain();
    const snare = this.audioContext.createOscillator();
    const snareGain = this.audioContext.createGain();
    
    kick.connect(kickGain);
    kickGain.connect(this.audioContext.destination);
    snare.connect(snareGain);
    snareGain.connect(this.audioContext.destination);
    
    const now = this.audioContext.currentTime;
    
    // Kick drum
    kick.frequency.setValueAtTime(150, now);
    kickGain.gain.setValueAtTime(1, now);
    kickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    kick.start(now);
    kick.stop(now + 0.1);
    
    // Snare drum
    setTimeout(() => {
      snare.frequency.setValueAtTime(200, this.audioContext.currentTime);
      snareGain.gain.setValueAtTime(0.5, this.audioContext.currentTime);
      snareGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
      snare.start(this.audioContext.currentTime);
      snare.stop(this.audioContext.currentTime + 0.1);
    }, 200);
  }

  // Epic victory fanfare
  playVictoryFanfare() {
    if (!this.isInitialized) return;

    const frequencies = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
    const now = this.audioContext.currentTime;

    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.5);
      }, index * 100);
    });
  }
}

// Create global audio system instance
const audioSystem = new AudioSystem();

export default audioSystem; 