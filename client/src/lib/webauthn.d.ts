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
declare class WebAuthnService {
    private isSupported;
    private generateChallenge;
    private arrayBufferToBase64;
    private base64ToArrayBuffer;
    /**
     * Check if biometric authentication is supported on this device
     */
    isBiometricSupported(): Promise<boolean>;
    /**
     * Register a new biometric credential for a user
     */
    registerBiometric(userId: string, userName: string, userEmail: string): Promise<WebAuthnRegistrationResponse>;
    /**
     * Authenticate using biometric credentials
     */
    authenticateBiometric(credentialIds: string[]): Promise<WebAuthnAuthenticationResponse>;
    /**
     * Get a user-friendly error message for WebAuthn errors
     */
    getErrorMessage(error: any): string;
    /**
     * Get device capabilities information
     */
    getDeviceInfo(): Promise<{
        isSupported: boolean;
        hasBiometric: boolean;
        platform: string;
        userAgent: string;
    }>;
}
export declare const webAuthnService: WebAuthnService;
export default webAuthnService;
