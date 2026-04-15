const USERS = [
  { id: "u_admin", role: "ADMIN", name: "System Admin", fullname: "System Admin", email: "system.admin.bejas@gmail.com", department: "ADMIN", station: "HQ", badge: "ADM-0001" },

  { id: "u_police_admin_1", role: "POLICE_ADMIN", name: "Police Admin", fullname: "Police Admin", email: "charlesnkhabe18@gmail.com", department: "POLICE", station: "Lesotho Mounted Police Headquarters (PHQ)", badge: "P-ADM-0001" },
  { id: "u_police_commissioner_1", role: "POLICE_COMMISSIONER", name: "Police Commissioner", fullname: "Police Commissioner", email: "bejas.police.commissioner@gmail.com", department: "POLICE", station: "Lesotho Mounted Police Headquarters (PHQ)", badge: "P-COM-0001" },
  { id: "u_police_investigator_1", role: "POLICE_INVESTIGATOR", name: "Police Investigator 1", fullname: "Police Investigator 1", email: "bejas.police.investigator1@gmail.com", department: "POLICE", station: "Maseru Central Police Station", badge: "P-INV-0001" },
  { id: "u_police_registry_1", role: "POLICE_REGISTRY", name: "Police Registry 1", fullname: "Police Registry 1", email: "bejas.police.registry1@gmail.com", department: "POLICE", station: "Maseru Central Police Station", badge: "P-REG-0001" },

  { id: "u_dpp_admin_1", role: "DPP_ADMIN", name: "DPP Admin", fullname: "DPP Admin", email: "kobobokangthabo27@gmail.com", department: "DPP", station: "HQ", badge: "DPP-ADM-0001" },
  { id: "u_dpp_prosecutor_1", role: "DPP_PROSECUTOR", name: "DPP Prosecutor 1", fullname: "DPP Prosecutor 1", email: "bejas.dpp.prosecutor1@gmail.com", department: "DPP", station: "HQ", badge: "DPP-0001" },
  { id: "u_dpp_registry_1", role: "DPP_REGISTRY", name: "DPP Registry 1", fullname: "DPP Registry 1", email: "bejas.dpp.registry1@gmail.com", department: "DPP", station: "HQ", badge: "DPP-REG-0001" },
  { id: "u_dpp_registry_2", role: "DPP_REGISTRY", name: "DPP Registry 2", fullname: "DPP Registry 2", email: "bejas.dpp.registry2@gmail.com", department: "DPP", station: "HQ", badge: "DPP-REG-0002" },
  { id: "u_dpp_prosecutor_2", role: "DPP_PROSECUTOR", name: "DPP Prosecutor 2", fullname: "DPP Prosecutor 2", email: "bejas.dpp.prosecutor2@gmail.com", department: "DPP", station: "HQ", badge: "DPP-0002" },

  { id: "u_court_admin_1", role: "COURT_ADMIN", name: "Court Admin", fullname: "Court Admin", email: "kobobokang27@gmail.com", department: "JUDICIARY", station: "HIGH COURT", badge: "CRT-ADM-0001" },
  { id: "u_high_assist_registry_1", role: "HIGH_ASSIST_REGISTRY", name: "High Assistant Registry 1", fullname: "High Assistant Registry 1", email: "bejas.high.registry.assistant1@gmail.com", department: "HIGH_COURT", station: "HIGH COURT", badge: "HC-AR-0001" },
  { id: "u_high_registry_1", role: "HIGH_REGISTRY", name: "High Court Registry 1", fullname: "High Court Registry 1", email: "bejas.high.registry1@gmail.com", department: "HIGH_COURT", station: "HIGH COURT", badge: "HC-R-0001" },
  { id: "u_judge_1", role: "JUDGE", name: "High Court Judge 1", fullname: "High Court Judge 1", email: "bejas.judge1@gmail.com", department: "HIGH_COURT", station: "HIGH COURT", badge: "J-0001" },
  { id: "u_judge_clerk_1", role: "CLERK", name: "Judge Clerk 1", fullname: "Judge Clerk 1", email: "bejas.judge.clerk1@gmail.com", department: "HIGH_COURT", station: "HIGH COURT", badge: "CLK-0001" },

  { id: "u_magistrate_1", role: "MAGISTRATE", name: "Magistrate 1", fullname: "Magistrate 1", email: "bejas.magistrate1@gmail.com", department: "MAG_COURT", station: "MAGISTRATE COURT", badge: "M-0001" },
  { id: "u_mag_assist_registry_1", role: "MAG_ASSIST_REGISTRY", name: "Mag Assistant Registry 1", fullname: "Mag Assistant Registry 1", email: "bejas.mag.registry.assistant1@gmail.com", department: "MAG_COURT", station: "MAGISTRATE COURT", badge: "MC-AR-0001" },
  { id: "u_mag_registry_1", role: "MAG_REGISTRY", name: "Magistrate Registry 1", fullname: "Magistrate Registry 1", email: "bejas.mag.registry1@gmail.com", department: "MAG_COURT", station: "MAGISTRATE COURT", badge: "MC-R-0001" },

  { id: "u_correctional_services_1", role: "CORRECTIONAL_SERVICES", name: "Correctional Officer 1", fullname: "Correctional Officer 1", email: "bejas.correctional.officer1@gmail.com", department: "CORRECTIONAL", station: "MASERU CENTRAL", badge: "COR-0001" },
  { id: "u_correctional_admin_1", role: "CORRECTIONAL_ADMIN", name: "Correctional Admin", fullname: "Correctional Admin", email: "litsitsontsooa043@gmail.com", department: "CORRECTIONAL", station: "HQ", badge: "COR-ADM-0001" },
  { id: "u_appeal_registry_1", role: "APPEAL_REGISTRY", name: "Appeal Registry 1", fullname: "Appeal Registry 1", email: "nalanekekeletso@gmail.com", department: "APPEAL_COURT", station: "HIGH COURT", badge: "APL-REG-0001" },
  { id: "u_appeal_judge_1", role: "APPEAL_JUDGE", name: "Appeal Judge 1", fullname: "Appeal Judge 1", email: "bejas.appeal.judge1@gmail.com", department: "APPEAL_COURT", station: "HIGH COURT", badge: "APL-J-0001" },
  { id: "u_archive_officer_1", role: "ARCHIVE_OFFICER", name: "Archive Officer 1", fullname: "Archive Officer 1", email: "bejas.archive.officer1@gmail.com", department: "ARCHIVE", station: "HQ", badge: "ARC-0001" },
]

const EMAIL_UPDATES = Object.fromEntries(USERS.map((user) => [user.id, user.email]))

module.exports = {
  USERS,
  EMAIL_UPDATES,
}
