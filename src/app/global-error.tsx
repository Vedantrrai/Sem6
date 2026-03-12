"use client";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error;
    reset: () => void;
}) {
    return (
        <html>
            <body style={{ fontFamily: "sans-serif", textAlign: "center", padding: "40px" }}>
                <h2>Something went wrong!</h2>
                <p>{error.message}</p>

                <button
                    onClick={() => reset()}
                    style={{
                        marginTop: "20px",
                        padding: "10px 20px",
                        background: "#FF7A00",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                    }}
                >
                    Try Again
                </button>
            </body>
        </html>
    );
}
