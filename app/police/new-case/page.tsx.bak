"use client"

import React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Send } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useStore } from "@/lib/store"

const whereCommittedOptions = [
  "BANK","DRINKING_CLUB","RESTAURANT","CARPARK","CHURCH","HOME","SCHOOL","FACTORY","FARM_LANDS",
  "HOSPITAL","HOTEL","OFFICE","STREET","SHOP_SUPERMARKET","KRAAL","SPECIFY"
]

export default function PoliceNewCase() {
  const router = useRouter()
  const { currentUser, createCase, submitToInvestigation } = useStore()

  const [stnCode, setStnCode] = React.useState("")
  const [crimeNo, setCrimeNo] = React.useState("")
  const [crimeYear, setCrimeYear] = React.useState(String(new Date().getFullYear()))
  const [crimeRegion, setCrimeRegion] = React.useState("")

  const [dateReported, setDateReported] = React.useState("")
  const [timeReported, setTimeReported] = React.useState("")
  const [methodOfComplaint, setMethodOfComplaint] = React.useState<"discovered_by_police" | "reported_by_victim" | "other_person" | "unknown">("unknown")
  const [reportingPersonFullName, setReportingPersonFullName] = React.useState("")
  const [reportingAddress, setReportingAddress] = React.useState("")

  const [aggrievedFullName, setAggrievedFullName] = React.useState("")
  const [aggrievedAddress, setAggrievedAddress] = React.useState("")
  const [sex, setSex] = React.useState("")
  const [age, setAge] = React.useState("")
  const [dateOfBirth, setDateOfBirth] = React.useState("")

  const [allegedCrime, setAllegedCrime] = React.useState("")
  const [attempt, setAttempt] = React.useState(false)
  const [whereCommitted, setWhereCommitted] = React.useState<string>("")
  const [whereCommittedSpecify, setWhereCommittedSpecify] = React.useState("")

  const [whenFromDate, setWhenFromDate] = React.useState("")
  const [whenFromTime, setWhenFromTime] = React.useState("")
  const [whenToDate, setWhenToDate] = React.useState("")
  const [whenToTime, setWhenToTime] = React.useState("")

  const [modusOperandi, setModusOperandi] = React.useState("")
  const [propertyOrInjury, setPropertyOrInjury] = React.useState("")

  const [drinkRelated, setDrinkRelated] = React.useState<"offender" | "victim" | "both" | "not_known" | "not_involved">("not_known")
  const [drugRelated, setDrugRelated] = React.useState<"offender" | "victim" | "both" | "not_known" | "not_involved">("not_known")

  const [firearmUsed, setFirearmUsed] = React.useState<"pistol_revolver" | "rifle" | "shotgun" | "discharged" | "yes" | "no" | "unknown">("unknown")
  const [firearmSpecify, setFirearmSpecify] = React.useState("")
  const [weaponUsed, setWeaponUsed] = React.useState<"knife" | "stick" | "stone" | "scissors" | "yes" | "no" | "unknown">("unknown")
  const [weaponSpecify, setWeaponSpecify] = React.useState("")

  const [extentOfInjury, setExtentOfInjury] = React.useState<"slight" | "serious_hospital" | "dead" | "none" | "unknown">("unknown")
  const [offenderVictimRelationship, setOffenderVictimRelationship] = React.useState<"family_relative" | "same_household" | "no_relationship" | "not_known">("not_known")
  const [victimStatementTaken, setVictimStatementTaken] = React.useState(false)

  const [suspectDetails, setSuspectDetails] = React.useState("")

  const [recComplainantOfficer, setRecComplainantOfficer] = React.useState("")
  const [investigatorOfficerNameNumber, setInvestigatorOfficerNameNumber] = React.useState("")
  const [investigatorUnit, setInvestigatorUnit] = React.useState("")
  const [supervisor, setSupervisor] = React.useState("")
  const [stationArrestNumber, setStationArrestNumber] = React.useState("")
  const [detectedBy, setDetectedBy] = React.useState<"cid" | "uniform" | "uniform_cid" | "other" | "unknown">("unknown")

  if (!currentUser) {
    return (
      <DashboardLayout allowedRoles={["police_officer"]} title="Open New Case">
        <div className="text-sm text-muted-foreground">Please log in as Police Officer.</div>
      </DashboardLayout>
    )
  }

  const makeCaseNumber = () => {
    const y = new Date().getFullYear()
    const n = Math.floor(10000 + Math.random() * 90000)
    return `LMPS-${y}-${n}`
  }

  const saveDraft = () => {
    const created = createCase({
      caseNumber: makeCaseNumber(),
      citation: "",
      district: currentUser.station || "UNKNOWN",
      parties: aggrievedFullName || reportingPersonFullName || "UNKNOWN",
      charge: allegedCrime || "UNKNOWN",
      description: modusOperandi || "â€”",
      evidence: [],
      policeOfficerId: currentUser.id,
      policeOfficerName: currentUser.name,
      policeStationId: currentUser.station || "UNKNOWN",
      policeSections: {
        sectionA: {
          openedById: currentUser.id,
          openedByName: currentUser.name,
          openedAt: new Date().toISOString(),
          station: currentUser.station || "UNKNOWN",
          stnCode,
          crimeNo,
          crimeYear,
          crimeRegion,
          dateReported,
          timeReported,
          methodOfComplaint,
          reportingPersonFullName,
          reportingAddress,
          aggrievedFullName,
          aggrievedAddress,
          sex,
          age,
          dateOfBirth,
          allegedCrime,
          attempt,
          whereCommitted,
          whereCommittedSpecify,
          whenFromDate,
          whenFromTime,
          whenToDate,
          whenToTime,
          modusOperandi,
          propertyOrInjury,
          drinkRelated,
          drugRelated,
          firearmUsed,
          firearmSpecify,
          weaponUsed,
          weaponSpecify,
          extentOfInjury,
          offenderVictimRelationship,
          victimStatementTaken,
          suspectDetails,
          recComplainantOfficer,
          investigatorOfficerNameNumber,
          investigatorUnit,
          supervisor,
          stationArrestNumber,
          detectedBy,
          // legacy mirrors
          complainantName: aggrievedFullName || reportingPersonFullName,
          accusedName: "",
          location: whereCommittedSpecify || whereCommitted,
          summary: modusOperandi,
        },
      },
    })
    router.push(`/police/case/${created.caseId}`)
  }

  const submitNow = () => {
    const created = createCase({
      caseNumber: makeCaseNumber(),
      citation: "",
      district: currentUser.station || "UNKNOWN",
      parties: aggrievedFullName || reportingPersonFullName || "UNKNOWN",
      charge: allegedCrime || "UNKNOWN",
      description: modusOperandi || "â€”",
      evidence: [],
      policeOfficerId: currentUser.id,
      policeOfficerName: currentUser.name,
      policeStationId: currentUser.station || "UNKNOWN",
      policeSections: {
        sectionA: {
          openedById: currentUser.id,
          openedByName: currentUser.name,
          openedAt: new Date().toISOString(),
          station: currentUser.station || "UNKNOWN",
          stnCode,
          crimeNo,
          crimeYear,
          crimeRegion,
          dateReported,
          timeReported,
          methodOfComplaint,
          reportingPersonFullName,
          reportingAddress,
          aggrievedFullName,
          aggrievedAddress,
          sex,
          age,
          dateOfBirth,
          allegedCrime,
          attempt,
          whereCommitted,
          whereCommittedSpecify,
          whenFromDate,
          whenFromTime,
          whenToDate,
          whenToTime,
          modusOperandi,
          propertyOrInjury,
          drinkRelated,
          drugRelated,
          firearmUsed,
          firearmSpecify,
          weaponUsed,
          weaponSpecify,
          extentOfInjury,
          offenderVictimRelationship,
          victimStatementTaken,
          suspectDetails,
          recComplainantOfficer,
          investigatorOfficerNameNumber,
          investigatorUnit,
          supervisor,
          stationArrestNumber,
          detectedBy,
          complainantName: aggrievedFullName || reportingPersonFullName,
          accusedName: "",
          location: whereCommittedSpecify || whereCommitted,
          summary: modusOperandi,
        },
      },
    })
    submitToInvestigation(created.caseId, currentUser)
    router.push(`/police/case/${created.caseId}`)
  }

  return (
    <DashboardLayout allowedRoles={["police_officer"]} title="Case Opening & Amendment (LMPS C1/C2)">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button asChild variant="secondary">
            <Link href="/police/dashboard"><ArrowLeft className="h-4 w-4 mr-2" />Back</Link>
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={saveDraft}><Save className="h-4 w-4 mr-2" />Save Draft</Button>
            <Button onClick={submitNow}><Send className="h-4 w-4 mr-2" />Submit â†’ Investigation</Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Header</CardTitle>
            <CardDescription>Only the fields from the official Case Opening & Amendment form.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-4">
            <div className="space-y-1">
              <Label>Station Code</Label>
              <Input value={stnCode} onChange={(e)=>setStnCode(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Crime No</Label>
              <Input value={crimeNo} onChange={(e)=>setCrimeNo(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Year</Label>
              <Input value={crimeYear} onChange={(e)=>setCrimeYear(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Region</Label>
              <Input value={crimeRegion} onChange={(e)=>setCrimeRegion(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Date Reported</Label>
              <Input value={dateReported} onChange={(e)=>setDateReported(e.target.value)} placeholder="YYYY-MM-DD" />
            </div>
            <div className="space-y-1">
              <Label>Time Reported</Label>
              <Input value={timeReported} onChange={(e)=>setTimeReported(e.target.value)} placeholder="HH:MM" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>A. Method of Complaint</CardTitle></CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Method</Label>
              <Select value={methodOfComplaint} onValueChange={(v:any)=>setMethodOfComplaint(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="discovered_by_police">Discovered by Police</SelectItem>
                  <SelectItem value="reported_by_victim">Reported by Victim</SelectItem>
                  <SelectItem value="other_person">Other Person</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Reporting Person Full Name</Label>
              <Input value={reportingPersonFullName} onChange={(e)=>setReportingPersonFullName(e.target.value)} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Reporting Address</Label>
              <Input value={reportingAddress} onChange={(e)=>setReportingAddress(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Complainant / Aggrieved Person</CardTitle></CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Full Name</Label>
              <Input value={aggrievedFullName} onChange={(e)=>setAggrievedFullName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Address</Label>
              <Input value={aggrievedAddress} onChange={(e)=>setAggrievedAddress(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Sex</Label>
              <Input value={sex} onChange={(e)=>setSex(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Age</Label>
              <Input value={age} onChange={(e)=>setAge(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Date of Birth</Label>
              <Input value={dateOfBirth} onChange={(e)=>setDateOfBirth(e.target.value)} placeholder="YYYY-MM-DD" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Incident</CardTitle></CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1 md:col-span-2">
              <Label>Alleged Crime</Label>
              <Input value={allegedCrime} onChange={(e)=>setAllegedCrime(e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label>Attempt</Label>
              <Select value={attempt ? "yes" : "no"} onValueChange={(v)=>setAttempt(v==="yes")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Where Committed</Label>
              <Select value={whereCommitted} onValueChange={setWhereCommitted}>
                <SelectTrigger><SelectValue placeholder="Select location type" /></SelectTrigger>
                <SelectContent>
                  {whereCommittedOptions.map(o => <SelectItem key={o} value={o}>{o.replaceAll("_"," ")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {whereCommitted === "SPECIFY" && (
              <div className="space-y-1 md:col-span-2">
                <Label>Specify</Label>
                <Input value={whereCommittedSpecify} onChange={(e)=>setWhereCommittedSpecify(e.target.value)} />
              </div>
            )}

            <div className="space-y-1">
              <Label>When From (Date)</Label>
              <Input value={whenFromDate} onChange={(e)=>setWhenFromDate(e.target.value)} placeholder="YYYY-MM-DD" />
            </div>
            <div className="space-y-1">
              <Label>When From (Time)</Label>
              <Input value={whenFromTime} onChange={(e)=>setWhenFromTime(e.target.value)} placeholder="HH:MM" />
            </div>
            <div className="space-y-1">
              <Label>When To (Date)</Label>
              <Input value={whenToDate} onChange={(e)=>setWhenToDate(e.target.value)} placeholder="YYYY-MM-DD" />
            </div>
            <div className="space-y-1">
              <Label>When To (Time)</Label>
              <Input value={whenToTime} onChange={(e)=>setWhenToTime(e.target.value)} placeholder="HH:MM" />
            </div>

            <div className="space-y-1 md:col-span-2">
              <Label>Brief Details of Offence (Modus Operandi)</Label>
              <Textarea value={modusOperandi} onChange={(e)=>setModusOperandi(e.target.value)} rows={4} />
            </div>

            <div className="space-y-1 md:col-span-2">
              <Label>Property / Vehicle Stolen OR Injury Sustained (Full description)</Label>
              <Textarea value={propertyOrInjury} onChange={(e)=>setPropertyOrInjury(e.target.value)} rows={3} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Flags & Injury / Weapons</CardTitle></CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Drink Related</Label>
              <Select value={drinkRelated} onValueChange={(v:any)=>setDrinkRelated(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="offender">Offender drinking</SelectItem>
                  <SelectItem value="victim">Victim drinking</SelectItem>
                  <SelectItem value="both">Both drinking</SelectItem>
                  <SelectItem value="not_known">Not known</SelectItem>
                  <SelectItem value="not_involved">Drink not involved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Drug Related</Label>
              <Select value={drugRelated} onValueChange={(v:any)=>setDrugRelated(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="offender">Offender under influence</SelectItem>
                  <SelectItem value="victim">Victim under influence</SelectItem>
                  <SelectItem value="both">Both under influence</SelectItem>
                  <SelectItem value="not_known">Not known</SelectItem>
                  <SelectItem value="not_involved">Drugs not involved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Firearm Used</Label>
              <Select value={firearmUsed} onValueChange={(v:any)=>setFirearmUsed(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pistol_revolver">Pistol / Revolver</SelectItem>
                  <SelectItem value="rifle">Rifle</SelectItem>
                  <SelectItem value="shotgun">Shotgun</SelectItem>
                  <SelectItem value="discharged">Discharged</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Weapon Used</Label>
              <Select value={weaponUsed} onValueChange={(v:any)=>setWeaponUsed(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="knife">Knife</SelectItem>
                  <SelectItem value="stick">Stick</SelectItem>
                  <SelectItem value="stone">Stone</SelectItem>
                  <SelectItem value="scissors">Scissors</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Specify Firearm</Label>
              <Input value={firearmSpecify} onChange={(e)=>setFirearmSpecify(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Specify Weapon</Label>
              <Input value={weaponSpecify} onChange={(e)=>setWeaponSpecify(e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label>Extent of Injury</Label>
              <Select value={extentOfInjury} onValueChange={(v:any)=>setExtentOfInjury(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="slight">Slight cuts / bruising</SelectItem>
                  <SelectItem value="serious_hospital">Serious / detained in hospital</SelectItem>
                  <SelectItem value="dead">Dead</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Offender/Victim Relationship</Label>
              <Select value={offenderVictimRelationship} onValueChange={(v:any)=>setOffenderVictimRelationship(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="family_relative">Family relative</SelectItem>
                  <SelectItem value="same_household">Same household</SelectItem>
                  <SelectItem value="no_relationship">No relationship</SelectItem>
                  <SelectItem value="not_known">Not known</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Victim Statement Taken</Label>
              <Select value={victimStatementTaken ? "yes" : "no"} onValueChange={(v)=>setVictimStatementTaken(v==="yes")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Suspect Details</CardTitle></CardHeader>
          <CardContent>
            <Textarea value={suspectDetails} onChange={(e)=>setSuspectDetails(e.target.value)} rows={4} placeholder="Description / name / distinguishing features..." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Officer / Investigation Admin</CardTitle></CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Rec. Complainant Officer</Label>
              <Input value={recComplainantOfficer} onChange={(e)=>setRecComplainantOfficer(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Investigator Officer Name & Number</Label>
              <Input value={investigatorOfficerNameNumber} onChange={(e)=>setInvestigatorOfficerNameNumber(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Unit</Label>
              <Input value={investigatorUnit} onChange={(e)=>setInvestigatorUnit(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Supervisor</Label>
              <Input value={supervisor} onChange={(e)=>setSupervisor(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Station Arrest Number</Label>
              <Input value={stationArrestNumber} onChange={(e)=>setStationArrestNumber(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Detected By</Label>
              <Select value={detectedBy} onValueChange={(v:any)=>setDetectedBy(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cid">CID</SelectItem>
                  <SelectItem value="uniform">Uniform</SelectItem>
                  <SelectItem value="uniform_cid">Uniform/CID</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Property Seizure</CardTitle>
            <CardDescription>After saving the case, open it and add seizure items under the â€œProperty Seizureâ€ tab.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" onClick={saveDraft}>Save Draft First</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}