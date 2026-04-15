export const MASERU_POLICE_STATIONS = [
  "Lesotho Mounted Police Headquarters (PHQ)",
  "Maseru Central Police Station",
  "Maseru Rural Police Headquarters",
  "Traffic Police (Maseru)",
  "Thamae Police Station",
  "Lithoteng Police Station",
  "Mabote Police Station",
  "Ha Hoohlo Police Post",
  "Ha Foso Police Post",
  "Upper Thamae Police Post",
  "Sefikeng Police Post",
  "Ha Abia Police Post",
  "Europa / Police Training College Post",
] as const

export const MASERU_POLICE_STATION_GROUPS = [
  {
    label: "Central",
    stations: [
      "Lesotho Mounted Police Headquarters (PHQ)",
      "Maseru Central Police Station",
    ],
  },
  {
    label: "Urban Stations",
    stations: [
      "Maseru Rural Police Headquarters",
      "Traffic Police (Maseru)",
      "Thamae Police Station",
      "Lithoteng Police Station",
      "Mabote Police Station",
    ],
  },
  {
    label: "Local Posts",
    stations: [
      "Ha Hoohlo Police Post",
      "Ha Foso Police Post",
      "Upper Thamae Police Post",
      "Sefikeng Police Post",
      "Ha Abia Police Post",
      "Europa / Police Training College Post",
    ],
  },
] as const
