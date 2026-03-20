export const metadata = {
    title: "JOSAA Master",
    description: "Know your college chances",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
