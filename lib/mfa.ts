import { generateSecret, generateURI, verify } from 'otplib';
import QRCode from 'qrcode';

/**
 * Generate a new MFA secret for a user.
 */
export function generateMfaSecret() {
    return generateSecret();
}

/**
 * Generate a standard TOTP URI for QR Code generation.
 */
export function generateMfaUri(email: string, secret: string) {
    return generateURI({ 
        issuer: 'WealthCash', 
        label: email, 
        secret 
    });
}

/**
 * Convert a URI to a Data URL (base64 image) for the UI.
 */
export async function generateQrCodeDataUrl(uri: string) {
    try {
        return await QRCode.toDataURL(uri);
    } catch (err) {
        console.error('Error generating QR code:', err);
        throw new Error('Failed to generate QR code');
    }
}

/**
 * Verify a TOTP token against a secret.
 */
export async function verifyMfaToken(token: string, secret: string) {
    try {
        // verify is an async function in the functional export of newer otplib
        return await verify({ token, secret });
    } catch (err) {
        return false;
    }
}
