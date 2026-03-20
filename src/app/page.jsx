// import { redirect } from "next/navigation";

// export default function Root() {
//     // redirect("/dashboard");
//     return null;
// }
export default function Home() {
    return (
        <>
            <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { overflow: hidden; height: 100%; }
      `}</style>
            <iframe
                src="/landing/index.html"
                style={{
                    width: "100vw",
                    height: "100vh",
                    border: "none",
                    display: "block",
                }}
                scrolling="auto"
            />
        </>
    );
}