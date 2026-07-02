export type FieldStudyGroup = {
  group: string;
  options: string[];
};

function cleanMainLabel(value: string) {
  return value.replace(/^Main\s*-\s*/i, "").trim();
}

const rawFieldStudyGroups: FieldStudyGroup[] = [
  {
    group: "Main - Commerce / Business / Management",
    options: [
      "B.Com",
      "B.Com Honours",
      "BBA",
      "BBM",
      "BMS",
      "BAF - Bachelor of Accounting and Finance",
      "BBI - Bachelor of Banking and Insurance",
      "BFM - Bachelor of Financial Markets",
      "M.Com",
      "MBA",
      "PGDM",
      "MMS - Master of Management Studies",
      "MFM - Master of Financial Management",
      "MHRM - Master of Human Resource Management",
      "MIB - Master of International Business",
      "Other"
    ]
  },
  {
    group: "Main - Computer / IT",
    options: [
      "BCA",
      "MCA",
      "B.Sc Computer Science",
      "B.Sc Information Technology",
      "B.Sc Data Science",
      "B.Sc Artificial Intelligence / Machine Learning",
      "B.Sc Cyber Security",
      "M.Sc Computer Science",
      "M.Sc Information Technology",
      "M.Sc Data Science",
      "M.Sc Artificial Intelligence / Machine Learning",
      "M.Sc Cyber Security",
      "PG Diploma in Computer Applications",
      "Other"
    ]
  },
  {
    group: "Main - Engineering / Technology",
    options: [
      "B.E.",
      "B.Tech",
      "M.E.",
      "M.Tech",
      "Computer Science Engineering",
      "Information Technology Engineering",
      "Electronics and Communication Engineering",
      "Electrical Engineering",
      "Mechanical Engineering",
      "Civil Engineering",
      "Automobile Engineering",
      "Chemical Engineering",
      "Biotechnology Engineering",
      "Aeronautical / Aerospace Engineering",
      "Mechatronics / Robotics Engineering",
      "Instrumentation Engineering",
      "Other"
    ]
  },
  {
    group: "Main - Arts / Humanities / Social Sciences",
    options: [
      "B.A.",
      "B.A. Honours",
      "B.A. English",
      "B.A. Hindi / Regional Language",
      "B.A. Economics",
      "B.A. Psychology",
      "B.A. Sociology",
      "B.A. Political Science",
      "B.A. History",
      "B.A. Philosophy",
      "B.A. Public Administration",
      "M.A. English",
      "M.A. Hindi / Regional Language",
      "M.A. Economics",
      "M.A. Psychology",
      "M.A. Sociology",
      "M.A. Political Science",
      "M.A. History",
      "M.A. Public Administration",
      "MSW - Master of Social Work",
      "Other"
    ]
  },
  {
    group: "Science",
    options: [
      "B.Sc",
      "B.Sc Physics",
      "B.Sc Chemistry",
      "B.Sc Mathematics",
      "B.Sc Statistics",
      "B.Sc Biology",
      "B.Sc Biotechnology",
      "B.Sc Microbiology",
      "B.Sc Zoology",
      "B.Sc Botany",
      "B.Sc Environmental Science",
      "M.Sc Physics",
      "M.Sc Chemistry",
      "M.Sc Mathematics",
      "M.Sc Statistics",
      "M.Sc Biology",
      "M.Sc Biotechnology",
      "M.Sc Microbiology",
      "M.Sc Zoology",
      "M.Sc Botany",
      "M.Sc Environmental Science",
      "Other"
    ]
  },
  {
    group: "Main - Media / Communication / Design",
    options: [
      "BMM - Bachelor of Mass Media",
      "BJMC - Bachelor of Journalism and Mass Communication",
      "B.A. Journalism",
      "B.A. Mass Communication",
      "B.Des - Bachelor of Design",
      "BFA - Bachelor of Fine Arts",
      "Animation / VFX Course",
      "Graphic Design Course",
      "Fashion Design",
      "Interior Design",
      "Multimedia / Visual Communication",
      "MJMC - Master of Journalism and Mass Communication",
      "M.A. Journalism and Mass Communication",
      "M.Des - Master of Design",
      "MFA - Master of Fine Arts",
      "M.A. Media / Communication",
      "Other"
    ]
  },
  {
    group: "Main - Law",
    options: ["LLB", "B.A. LLB", "BBA LLB", "B.Com LLB", "LLM", "Other"]
  },
  {
    group: "Main - Medical / Healthcare / Pharmacy",
    options: [
      "MBBS",
      "BDS",
      "BAMS",
      "BHMS",
      "BUMS",
      "BPT - Bachelor of Physiotherapy",
      "B.Pharm",
      "Pharm.D",
      "B.Sc Nursing",
      "GNM Nursing",
      "ANM Nursing",
      "BMLT - Medical Lab Technology",
      "B.Sc Radiology",
      "B.Sc Operation Theatre Technology",
      "B.Sc Optometry",
      "B.Sc Nutrition / Dietetics",
      "MD",
      "MS",
      "MDS",
      "MPT - Master of Physiotherapy",
      "M.Pharm",
      "M.Sc Nursing",
      "M.Sc Medical Lab Technology",
      "M.Sc Nutrition / Dietetics",
      "Other"
    ]
  },
  {
    group: "Main - Education / Teaching",
    options: ["B.Ed", "D.El.Ed", "B.El.Ed", "B.P.Ed", "M.Ed", "M.P.Ed", "Other"]
  },
  {
    group: "Main - Hotel / Travel / Aviation",
    options: [
      "BHM - Bachelor of Hotel Management",
      "B.Sc Hotel Management",
      "BBA Hospitality",
      "Travel and Tourism Course",
      "BTTM - Bachelor of Travel and Tourism Management",
      "Aviation / Cabin Crew Course",
      "Airport Management Course",
      "MHM - Master of Hotel Management",
      "MBA Hospitality Management",
      "MBA Travel and Tourism",
      "Other"
    ]
  },
  {
    group: "Main - Agriculture / Veterinary / Food / Allied Fields",
    options: [
      "B.Sc Agriculture",
      "B.Sc Horticulture",
      "B.Sc Forestry",
      "B.Sc Fisheries",
      "B.V.Sc - Veterinary Science",
      "Dairy Technology",
      "Food Technology",
      "M.Sc Agriculture",
      "M.Sc Horticulture",
      "M.Sc Forestry",
      "M.Sc Fisheries",
      "M.V.Sc - Master of Veterinary Science",
      "M.Tech Food Technology",
      "Other"
    ]
  },
  {
    group: "Main - Vocational / Diploma / Skill-Based",
    options: [
      "ITI",
      "Polytechnic Diploma",
      "Diploma in IT / Computer Science",
      "B.Voc",
      "M.Voc",
      "Skill Development Course",
      "Certification Course",
      "Professional Training Course",
      "Other"
    ]
  }
];

export const fieldStudyGroups: FieldStudyGroup[] = rawFieldStudyGroups.map((group) => ({
  ...group,
  group: cleanMainLabel(group.group)
}));
