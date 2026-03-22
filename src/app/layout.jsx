import Footer from "@/components/Footer";
import "./globals.css";


// app/layout.jsx
export const metadata = {
    title: "JOSAA Master",
    description: "Predict Your College with JEE Rank",
    icons: {
        icon: [
            { url: '/landing/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
            { url: '/landing/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        ],
        apple: [
            { url: '/landing/apple-touch-icon.png', sizes: '180x180' },
        ],
        other: [
            { url: '/landing/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
            { url: '/landing/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
    },
    manifest: '/landing/site.webmanifest',
};


export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}