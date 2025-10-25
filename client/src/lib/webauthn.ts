// WebAuthn utility for biometric authentication
// Supports Face ID, Touch ID, Windows Hello, and other platform authenticators

export interface WebAuthnCredential {
  id: string;
  publicKey: string;
  counter: number;
  userId: string;
}

export interface WebAuthnRegistrationResponse {
  credentialId: string;
  publicKey: string;
  success: boolean;
}

export interface WebAuthnAuthenticationResponse {
  credentialId: string;
  signature: string;
  success: boolean;
}

class WebAuthnService {
  private isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'credentials' in navigator &&
      'create' in navigator.credentials &&
      'get' in navigator.credentials &&
      'PublicKeyCredential' in window
    );
  }

  private async generateChallenge(): Promise<Uint8Array> {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return array;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Check if biometric authentication is supported on this device
   */
  async isBiometricSupported(): Promise<boolean> {
    if (!this.isSupported()) {
      return false;
    }

    try {
      // Check if platform authenticator is available
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      return available;
    } catch (error) {
      console.log('WebAuthn not supported:', error);
      return false;
    }
  }

  /**
   * Register a new biometric credential for a user
   */
  async registerBiometric(userId: string, userName: string, userEmail: string): Promise<WebAuthnRegistrationResponse> {
    if (!this.isSupported()) {
      throw new Error('WebAuthn is not supported on this device');
    }

    try {
      const challenge = await this.generateChallenge();
      
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: challenge,
          rp: {
            name: "StockSprout",
            id: window.location.hostname,
          },
          user: {
            id: new TextEncoder().encode(userId),
            name: userEmail,
            displayName: userName,
          },
          pubKeyCredParams: [
            { alg: -7, type: "public-key" }, // ES256
            { alg: -257, type: "public-key" }, // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform", // Built-in authenticator (Face ID, Touch ID, etc.)
            userVerification: "required",
            residentKey: "preferred",
          },
          timeout: 60000,
          attestation: "none",
        },
      }) as PublicKeyCredential;

      if (!credential || !credential.response) {
        throw new Error('Failed to create credential');
      }

      const response = credential.response as AuthenticatorAttestationResponse;
      
      return {
        credentialId: this.arrayBufferToBase64(credential.rawId),
        publicKey: this.arrayBufferToBase64(response.publicKey!),
        success: true,
      };
    } catch (error) {
      console.error('WebAuthn registration failed:', error);
      throw new Error('Biometric registration failed');
    }
  }

  /**
   * Authenticate using biometric credentials
   */
  async authenticateBiometric(credentialIds: string[]): Promise<WebAuthnAuthenticationResponse> {
    if (!this.isSupported()) {
      throw new Error('WebAuthn is not supported on this device');
    }

    try {
      const challenge = await this.generateChallenge();
      const allowCredentials = credentialIds.map(id => ({
        type: "public-key" as const,
        id: this.base64ToArrayBuffer(id),
      }));

      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: challenge,
          allowCredentials: allowCredentials,
          userVerification: "required",
          timeout: 60000,
        },
      }) as PublicKeyCredential;

      if (!credential || !credential.response) {
        throw new Error('Authentication failed');
      }

      const response = credential.response as AuthenticatorAssertionResponse;
      
      return {
        credentialId: this.arrayBufferToBase64(credential.rawId),
        signature: this.arrayBufferToBase64(response.signature),
        success: true,
      };
    } catch (error) {
      console.error('WebAuthn authentication failed:', error);
      throw new Error('Biometric authentication failed');
    }
  }

  /**
   * Get a user-friendly error message for WebAuthn errors
   */
  getErrorMessage(error: any): string {
    if (error.name === 'NotAllowedError') {
      return 'Biometric authentication was cancelled or not allowed';
    } else if (error.name === 'NotSupportedError') {
      return 'Biometric authentication is not supported on this device';
    } else if (error.name === 'SecurityError') {
      return 'Security error occurred during authentication';
    } else if (error.name === 'UnknownError') {
      return 'An unknown error occurred';
    } else if (error.message) {
      return error.message;
    } else {
      return 'Biometric authentication failed';
    }
  }

  /**
   * Get device capabilities information
   */
  async getDeviceInfo(): Promise<{
    isSupported: boolean;
    hasBiometric: boolean;
    platform: string;
    userAgent: string;
  }> {
    const isSupported = this.isSupported();
    const hasBiometric = await this.isBiometricSupported();
    
    return {
      isSupported,
      hasBiometric,
      platform: navigator.platform,
      userAgent: navigator.userAgent,
    };
  }
}

// Export singleton instance
export const webAuthnService = new WebAuthnService();

// Export types and service
export default webAuthnService;
