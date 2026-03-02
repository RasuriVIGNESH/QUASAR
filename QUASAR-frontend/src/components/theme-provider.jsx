import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({ children, ...props }) {
    return (
        <NextThemesProvider
            attribute="data-theme"
            defaultTheme="dark"
            {...props}
        >
            {children}
        </NextThemesProvider>
    )
}
