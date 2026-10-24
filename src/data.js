/* Northstar Academy — site data. Programmes, fees, faculty and results all live here.
   People, numbers and addresses are placeholders for this concept. */

export const img = (id, w = 800) => `/img/p/${id}-${w > 700 ? 1280 : 640}.webp`;

export const CONFIG = {
  name: 'Northstar Academy',
  // Empty for the concept so WhatsApp lets the visitor choose a chat.
  whatsappNumber: '',
  phoneDisplay: '+92 21 3455 0000',
  phoneHref: 'tel:+922134550000',
  email: 'admissions@northstar.example',
  address: 'Plot 22, Block 2, PECHS, Shahrah-e-Faisal, Karachi',
  officeHours: 'Admissions office: Mon–Sat, 10 am – 7 pm',
  multiSubjectDiscount: 0.1, // 10% off when taking 4 or more subjects
  siblingDiscount: 0.1,
};

/* Each programme is a constellation: one star per subject.
   shape: points in -1..1 space (same order as subjects), edges join them. */
export const PROGRAMMES = [
  {
    id: 'o-level', name: 'O Level', board: 'Cambridge', constellation: 'The Compass', duration: '2 years', ages: 'Grades 9–11',
    blurb: 'A steady two-year run at Cambridge O Levels, with weekly mock papers from month three.',
    admission: 15000, minSubjects: 1,
    batches: [{ name: 'Weekday evening', days: 'Mon – Thu', time: '3:30 – 7:30 pm' }, { name: 'Weekend', days: 'Sat – Sun', time: '10 am – 2 pm' }],
    subjects: [
      ['Mathematics', 6500, 'Mon & Wed · 3:30 pm'], ['Physics', 6500, 'Tue & Thu · 3:30 pm'], ['Chemistry', 6500, 'Mon & Wed · 5:30 pm'], ['Biology', 6500, 'Tue & Thu · 5:30 pm'],
      ['Computer Science', 6500, 'Sat · 10 am'], ['English Language', 6000, 'Mon & Thu · 6:30 pm'], ['Urdu', 5000, 'Sat · 12 pm'], ['Islamiyat', 5000, 'Sun · 10 am'],
      ['Pakistan Studies', 5000, 'Sun · 12 pm'], ['Economics', 6000, 'Tue · 6:30 pm'], ['Accounting', 6000, 'Wed · 6:30 pm'], ['Business Studies', 6000, 'Sat · 1 pm'],
    ],
    shape: [[0, 1], [0.3, 0.3], [1, 0], [0.3, -0.3], [0, -1], [-0.3, -0.3], [-1, 0], [-0.3, 0.3], [0.62, 0.75], [0.75, -0.62], [-0.62, -0.75], [-0.75, 0.62]],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0], [0, 8], [2, 9], [4, 10], [6, 11]],
  },
  {
    id: 'a-level', name: 'A Level', board: 'Cambridge', constellation: 'The Kite', duration: '2 years (AS + A2)', ages: 'Grades 12–13',
    blurb: 'Small batches for AS and A2, with past-paper clinics before every session.',
    admission: 20000, minSubjects: 1,
    batches: [{ name: 'Weekday evening', days: 'Mon – Fri', time: '4 – 8 pm' }],
    subjects: [
      ['Mathematics', 9000, 'Mon & Wed · 4 pm'], ['Further Mathematics', 9000, 'Fri · 4 pm'], ['Physics', 9000, 'Tue & Thu · 4 pm'], ['Chemistry', 9000, 'Mon & Wed · 6 pm'],
      ['Biology', 9000, 'Tue & Thu · 6 pm'], ['Computer Science', 9000, 'Fri · 6 pm'], ['Economics', 8500, 'Mon & Thu · 7 pm'], ['Accounting', 8500, 'Tue & Fri · 7 pm'],
      ['Business', 8500, 'Wed · 7 pm'], ['Psychology', 8500, 'Thu · 7 pm'],
    ],
    shape: [[0, 1], [0.55, 0.25], [0, -0.45], [-0.55, 0.25], [0, 0.3], [0.12, -0.62], [-0.08, -0.76], [0.1, -0.9], [-0.06, -1.04], [0.24, -0.72]],
    edges: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 4], [4, 2], [1, 4], [4, 3], [2, 5], [5, 6], [6, 7], [7, 8], [5, 9]],
  },
  {
    id: 'matric', name: 'Matric', board: 'Karachi Board (SSC)', constellation: 'The Lantern', duration: '2 years', ages: 'Grades 9–10',
    blurb: 'Science-group coaching mapped to the board syllabus, chapter by chapter, with monthly tests.',
    admission: 5000, minSubjects: 1,
    batches: [{ name: 'Morning (summer)', days: 'Mon – Sat', time: '8 am – 12 pm' }, { name: 'Evening', days: 'Mon – Fri', time: '4 – 7 pm' }],
    subjects: [
      ['Mathematics', 2800, 'Mon, Wed, Fri · 4 pm'], ['Physics', 2500, 'Tue & Thu · 4 pm'], ['Chemistry', 2500, 'Mon & Wed · 5 pm'], ['Biology', 2500, 'Tue & Thu · 5 pm'],
      ['Computer Science', 2500, 'Fri · 5 pm'], ['English', 2200, 'Mon & Thu · 6 pm'], ['Urdu', 2000, 'Tue · 6 pm'],
    ],
    shape: [[0, 1], [0, 0.7], [0.45, 0.4], [0.5, -0.2], [0, -0.62], [-0.5, -0.2], [-0.45, 0.4]],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 1]],
  },
  {
    id: 'intermediate', name: 'Intermediate', board: 'Karachi Board (HSSC)', constellation: 'The Bridge', duration: '2 years', ages: 'Grades 11–12',
    blurb: 'Pre-Medical, Pre-Engineering and ICS groups, with entry-test practice built into year two.',
    admission: 7000, minSubjects: 1,
    batches: [{ name: 'Evening', days: 'Mon – Fri', time: '4 – 8 pm' }, { name: 'Weekend revision', days: 'Sun', time: '10 am – 1 pm' }],
    subjects: [
      ['Physics', 3500, 'Mon & Wed · 4 pm'], ['Chemistry', 3500, 'Tue & Thu · 4 pm'], ['Biology', 3500, 'Mon & Wed · 6 pm'], ['Mathematics', 3800, 'Tue & Thu · 6 pm'],
      ['Computer Science', 3500, 'Fri · 4 pm'], ['English', 3000, 'Fri · 6 pm'],
    ],
    shape: [[-1, -0.3], [-0.6, 0.35], [-0.2, 0.62], [0.2, 0.62], [0.6, 0.35], [1, -0.3]],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]],
  },
  {
    id: 'mdcat', name: 'MDCAT Prep', board: 'Medical entry test', constellation: 'The Pulse', duration: '4 months, intensive', ages: 'After Intermediate',
    blurb: 'Four months of daily drills, full-length mocks every Sunday, and a doctor-mentor for every batch.',
    admission: 8000, minSubjects: 1, packageDiscount: 0.15,
    batches: [{ name: 'Morning intensive', days: 'Mon – Sat', time: '9 am – 1 pm' }, { name: 'Evening intensive', days: 'Mon – Sat', time: '4 – 8 pm' }],
    subjects: [
      ['Biology', 6000, 'Daily · first block'], ['Chemistry', 5500, 'Daily · second block'], ['Physics', 5500, 'Daily · third block'], ['English', 3000, 'Mon, Wed, Fri'], ['Logical Reasoning', 3000, 'Tue, Thu, Sat'],
    ],
    shape: [[-1, 0], [-0.35, 0], [-0.08, 0.78], [0.2, -0.7], [1, 0]],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4]],
  },
  {
    id: 'ecat', name: 'ECAT Prep', board: 'Engineering entry test', constellation: 'The Arrow', duration: '3 months, intensive', ages: 'After Intermediate',
    blurb: 'Speed and accuracy training for engineering entry tests, with timed sectionals every week.',
    admission: 8000, minSubjects: 1, packageDiscount: 0.15,
    batches: [{ name: 'Evening intensive', days: 'Mon – Sat', time: '4 – 8 pm' }],
    subjects: [
      ['Mathematics', 6000, 'Daily · first block'], ['Physics', 5500, 'Daily · second block'], ['Chemistry / Computer', 5000, 'Mon, Wed, Fri'], ['English', 3000, 'Tue, Thu, Sat'],
    ],
    shape: [[-0.9, -0.65], [0.6, 0.55], [0.08, 0.6], [0.66, 0.02]],
    edges: [[0, 1], [1, 2], [1, 3]],
  },
];

export const FACULTY = [
  { name: 'Sir Asim Raza', subject: 'Mathematics', levels: 'O & A Level', quals: 'MSc Mathematics, LUMS', years: 17, tone: '#ffd23f', quote: 'Every hard question is three easy ones wearing a coat.' },
  { name: 'Ms. Hira Baig', subject: 'Chemistry', levels: 'A Level · MDCAT', quals: 'MPhil Chemistry, KU', years: 12, tone: '#7cc4ff', quote: 'If you can draw it, you can remember it.' },
  { name: 'Sir Owais Khan', subject: 'Physics', levels: 'O & A Level · ECAT', quals: 'MS Physics, NUST', years: 14, tone: '#ff9f6b', quote: 'Units first. The answer usually follows.' },
  { name: 'Dr. Mahnoor Zaidi', subject: 'Biology', levels: 'Intermediate · MDCAT', quals: 'MBBS, Dow Medical College', years: 9, tone: '#8be3b5', quote: 'Learn the story of the body, not a list of parts.' },
  { name: 'Ms. Sadaf Iqbal', subject: 'English', levels: 'All programmes', quals: 'MA English Literature, KU', years: 15, tone: '#d6a6ff', quote: 'Short sentences. Strong verbs. Then the marks come.' },
  { name: 'Sir Faisal Memon', subject: 'Computer Science', levels: 'O & A Level · Inter', quals: 'BS Computer Science, FAST', years: 8, tone: '#5ee0e6', quote: 'Trace it on paper before you run it.' },
  { name: 'Ms. Areeba Siddiqui', subject: 'Economics & Business', levels: 'O & A Level', quals: 'MBA, IBA Karachi', years: 10, tone: '#ffb3c7', quote: 'Every graph is an argument. Make yours convincing.' },
  { name: 'Sir Kashif Ali', subject: 'Matric Science', levels: 'Matric · Intermediate', quals: 'MSc Physics, KU', years: 20, tone: '#ffe08a', quote: 'Board papers reward the basics, done perfectly.' },
];

export const RESULTS = [
  ['Ayaan Shaikh', 'O Level', '9 A*s'], ['Zoya Hasan', 'A Level', 'A*A*A*'], ['Hamza Qureshi', 'MDCAT', '192 / 200'], ['Mehak Ansari', 'Matric', '1,089 / 1,100'],
  ['Rayan Malik', 'ECAT', '351 / 400'], ['Inaya Farooq', 'O Level', '8 A*s'], ['Daniyal Akhtar', 'A Level', 'A*A*A'], ['Aleena Butt', 'Intermediate', '1,041 / 1,100'],
  ['Saad Jamil', 'MDCAT', '188 / 200'], ['Fatima Noor', 'O Level', '8 A*s, 1 A'], ['Umer Rehman', 'A Level', 'A*AA'], ['Hareem Javed', 'Matric', '1,076 / 1,100'],
  ['Arham Siddiqui', 'ECAT', '338 / 400'], ['Laiba Khan', 'Intermediate', '1,033 / 1,100'], ['Musa Abbasi', 'O Level', '7 A*s'], ['Sana Waheed', 'MDCAT', '185 / 200'],
  ['Talha Mirza', 'A Level', 'A*A*B'], ['Anaya Rizvi', 'Matric', '1,071 / 1,100'], ['Bilal Hashmi', 'Intermediate', '1,028 / 1,100'], ['Eshal Kazmi', 'O Level', '7 A*s, 2 As'],
  ['Zain Chaudhry', 'ECAT', '332 / 400'], ['Maryam Tariq', 'A Level', 'A*AA'], ['Ahmed Lodhi', 'MDCAT', '183 / 200'], ['Noor Fatima', 'Matric', '1,068 / 1,100'],
].map(([name, programme, score], i) => ({ name, programme, score, year: 2026, rank: i + 1 }));

export const STATS = [
  { value: 142, label: 'A* grades in the 2026 Cambridge session' },
  { value: 38, label: 'students into medical colleges this year' },
  { value: 96, suffix: '%', label: 'of Matric students scored an A or A+' },
  { value: 14, label: 'years of Karachi results' },
];
