import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
    return new ImageResponse(
        (
            <svg
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ width: '100%', height: '100%', background: '#0f172a', borderRadius: '4px' }}
            >
                {/* C Curve */}
                <path
                    d="M 28 12 C 24 6 16 6 12 12 C 8 18 8 26 14 31"
                    stroke="#a1a1aa"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {/* W forming arrow */}
                <path
                    d="M 8 18 L 14 28 L 20 18 L 26 28 L 34 16"
                    stroke="white"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {/* Arrowhead */}
                <path
                    d="M 26 16 L 34 16 L 34 24"
                    stroke="white"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        ),
        { ...size }
    );
}
