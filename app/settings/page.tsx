"use client"

import React from "react"
import { CheckCircle2, MoonStar, Palette, Sun, Trash2, Upload, UserCircle2 } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { applyThemePreference, type AppTheme, getUserPreferences, setUserPreferences } from "@/lib/user-preferences"
import { useStore } from "@/lib/store"

function themeOption(
  id: AppTheme,
  label: string,
  description: string,
  Icon: React.ComponentType<{ className?: string }>
) {
  return { id, label, description, Icon }
}

const THEMES = [
  themeOption("current", "Current", "The system default style you are using now.", Palette),
  themeOption("white", "White", "Clean white background and high readability.", Sun),
  themeOption("navy", "Navy Blue", "Professional navy-focused interface.", MoonStar),
]

export default function SettingsPage() {
  const currentUser = useStore((s: any) => s.currentUser)
  const setCurrentUser = useStore((s: any) => s.setCurrentUser)

  const [theme, setTheme] = React.useState<AppTheme>("current")
  const [profileImageDataUrl, setProfileImageDataUrl] = React.useState("")
  const [message, setMessage] = React.useState("")
  const [error, setError] = React.useState("")
  const uploadInputRef = React.useRef<HTMLInputElement | null>(null)

  React.useEffect(() => {
    if (!currentUser?.id) return
    const prefs = getUserPreferences(currentUser.id)
    setTheme(prefs.theme)
    setProfileImageDataUrl(String(prefs.profileImageDataUrl || ""))
  }, [currentUser?.id])

  const initials = String(currentUser?.name || "U")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  function savePreferences(nextTheme: AppTheme, nextImage: string) {
    if (!currentUser?.id) return
    setUserPreferences(currentUser.id, { theme: nextTheme, profileImageDataUrl: nextImage })
    applyThemePreference(nextTheme)
    setCurrentUser?.({
      ...currentUser,
      metadata: {
        ...(currentUser?.metadata || {}),
        profileImageDataUrl: nextImage,
        theme: nextTheme,
      },
    })
  }

  return (
    <DashboardLayout title="Settings">
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserCircle2 className="h-4.5 w-4.5 text-white" />
              Profile
            </CardTitle>
            <CardDescription className="text-sm">Upload a profile picture visible in your account header.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border border-border">
                <AvatarImage src={profileImageDataUrl} alt="Profile preview" />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="text-xs text-muted-foreground">
                {currentUser?.name} - {String(currentUser?.role || "").replace(/_/g, " ")}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-upload">Profile Picture</Label>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={uploadInputRef}
                  id="profile-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    setError("")
                    const file = event.target.files?.[0]
                    if (!file) return
                    if (file.size > 2 * 1024 * 1024) {
                      setError("Image too large. Please upload an image up to 2MB.")
                      return
                    }

                    const reader = new FileReader()
                    reader.onload = () => {
                      const next = String(reader.result || "")
                      setProfileImageDataUrl(next)
                      savePreferences(theme, next)
                      setMessage("Profile picture saved.")
                    }
                    reader.onerror = () => setError("Could not read image file.")
                    reader.readAsDataURL(file)
                  }}
                />
                <Button
                  type="button"
                  onClick={() => uploadInputRef.current?.click()}
                  size="sm"
                >
                  <Upload className="mr-2 h-4 w-4 text-white" />
                  Upload Picture
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setProfileImageDataUrl("")
                    savePreferences(theme, "")
                    setMessage("Profile picture removed.")
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4 text-white" />
                  Remove Picture
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Palette className="h-4.5 w-4.5 text-white" />
              Theme
            </CardTitle>
            <CardDescription className="text-sm">Choose your preferred color theme for the full system.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 md:grid-cols-3">
            {THEMES.map((option) => {
              const selected = theme === option.id
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setTheme(option.id)
                    savePreferences(option.id, profileImageDataUrl)
                    setMessage(`Theme changed to ${option.label}.`)
                  }}
                  className={[
                    "rounded-xl border p-3 text-left transition-all",
                    selected
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border bg-card hover:border-primary/50",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between">
                    <option.Icon className="h-4 w-4 text-white" />
                    {selected ? <CheckCircle2 className="h-4 w-4 text-white" /> : null}
                  </div>
                  <div className="mt-1.5 text-sm font-semibold">{option.label}</div>
                  <div className="text-xs text-muted-foreground">{option.description}</div>
                </button>
              )
            })}
          </CardContent>
        </Card>

        {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </DashboardLayout>
  )
}
