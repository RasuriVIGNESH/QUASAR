import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ModeToggle() {
    const { setTheme, theme } = useTheme()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="glass-surface hover-spring border-[var(--border-subtle)] hover:border-[var(--border-medium)]">
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all [html[data-theme='dark']_&]:-rotate-90 [html[data-theme='dark']_&]:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all [html[data-theme='dark']_&]:rotate-0 [html[data-theme='dark']_&]:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-surface border-[var(--border-subtle)]">
                <DropdownMenuItem onClick={() => setTheme("light")} className="hover-spring">
                    Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")} className="hover-spring">
                    Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")} className="hover-spring">
                    System
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
