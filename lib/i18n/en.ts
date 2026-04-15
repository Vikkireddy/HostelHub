export const en = {
  // Dashboard page
  DASHBOARD: "Dashboard",
  WELCOME_BACK_ADMIN: "Welcome back, Admin",
  LOADING_DASHBOARD: "Loading dashboard...",
  FAILED_TO_LOAD_DASHBOARD: "Failed to load dashboard",

  // Stats grid
  TOTAL_STUDENTS: "Total Students",
  PLUS_TWO_THIS_MONTH: "+2 this month",
  STUDENTS_PLUS_THIS_MONTH: "+{count} this month",
  STUDENTS_MINUS_THIS_MONTH: "-{count} this month",
  STUDENTS_SAME_AS_LAST_MONTH: "Same as last month",
  AVAILABLE_ROOMS: "Available Rooms",
  OCCUPIED: "occupied",
  PENDING_BILLS: "Pending Bills",
  DUE_AMOUNT: "Due Amount",
  VIEW_ALL: "View All →",
  ADMIN_EXPENSES: "Admin Expenses",
  PROFIT: "Profit",
  LOSS: "Loss",
  MANAGE_EXPENSES: "Manage →",
  INCOME_VS_EXPENSES: "Income vs Expenses",
  INCOME: "Income",
  EXPENSES: "Expenses",

  // Pending bills modal
  PENDING_BILLS_MODAL_TITLE: "Pending Bills",
  PENDING_BILLS_DESCRIPTION: "Students with pending or overdue payments. Total due: ₹{amount}",
  PAYMENT_HISTORY_STUDENT_FALLBACK: "Student",
  PAYMENT_HISTORY: "Payment History",
  PAYMENT_HISTORY_CLOSE: "Close",
  PAYMENT_HISTORY_LOADING: "Loading payment history...",
  PAYMENT_HISTORY_NO_DATA: "No payment history found",
  PAYMENT_HISTORY_LAST_PAYMENT: "Last Payment",
  PAYMENT_HISTORY_TOTAL_COLLECTED: "Total Collected",
  ROOM: "Room",
  PAYMENT_HISTORY_PENDING: "Pending",
  PAYMENT_HISTORY_CURRENT_DUE: "Current Due",
  PAYMENT_HISTORY_TOTAL: "Total",
  PAYMENT_HISTORY_STATUS_PARTIAL: "Partial",
  PAYMENT_HISTORY_STATUS_PAID: "Paid",
  PAYMENT_HISTORY_RECORDED: "Recorded",
  PAYMENT_HISTORY_DOWNLOAD_RECEIPT: "Download Receipt",

  // Revenue chart
  REVENUE_OVERVIEW: "Revenue Overview",
  NO_REVENUE_DATA_FOUND: "No revenue data found",
  REVENUE_EMPTY_MESSAGE: "Revenue will appear here once payments are recorded",

  // Room distribution chart
  ROOM_DISTRIBUTION: "Room Distribution",
  NO_ROOM_DISTRIBUTION_FOUND: "No room distribution found",
  ROOM_DISTRIBUTION_EMPTY_MESSAGE: "Add rooms from the Rooms page to see distribution",

  // Planned vacates (dashboard)
  PLANNED_VACATES_TITLE: "Upcoming vacates",
  PLANNED_VACATES_VACATE_ON: "Vacating on",
  PLANNED_VACATES_EMPTY_TITLE: "No upcoming vacates",
  PLANNED_VACATES_EMPTY_MESSAGE:
    "When a student plans to leave, set their planned vacate date on the Students page. It will show here for planning room availability.",
  PLANNED_VACATE_DATE_LABEL: "Planned vacate date",
  PLANNED_VACATE_DATE_OPTIONAL: "Optional — visible on the dashboard for room planning",

  // Recent payments
  RECENT_PAYMENTS: "Recent Payments",
  MARK_AS_PAID: "Mark as Paid",
  DAYS: "Days",
  DUE_TODAY: "Due today",
  NO_PAYMENTS_FOUND: "No payments found",
  PAYMENTS_EMPTY_MESSAGE: "Payment records will appear here once payments are recorded",

  // Students overview
  STUDENTS_OVERVIEW: "Students Overview",
  MANAGE: "Manage →",
  NO_STUDENTS_FOUND: "No students found",
  STUDENTS_EMPTY_MESSAGE: "Add students from the Students page to see them here",
  NAME: "Name",
  ROOM_LABEL: "Room",
  COURSE: "Course",
  JOIN_DATE: "Join Date",
  PHONE: "Phone",

  // Student actions
  MARK_AS_LEFT: "Mark as Left",
  CHECK_OUT: "Check Out",
  CHECKOUT_DISABLED_DUES: "Clear pending payments before checkout",
  STUDENT_CHECKOUT: "Student Check-Out",
  CHECKOUT_CONFIRM_MESSAGE: "Are you sure you want to check out this student? This will free up their room.",
  STUDENT_LABEL: "Student",
  JOINED: "Joined",
  CHECKOUT_DATE: "Checkout Date",
  PENDING_DUES_WARNING: "Pending Dues. This student has ₹{amount} in pending/overdue payments.",
  CONFIRM_CHECKOUT: "Confirm Check-Out",
  CANCEL: "Cancel",
  CONFIRM_MARK_AS_LEFT: "Are you sure this student has left the hostel? Their room will be freed and their record will be moved to Exited Students.",
  STUDENT_MARKED_AS_LEFT: "Student marked as left successfully",

  // Student tabs
  PRESENT: "Present",
  INACTIVE: "Inactive",
  LEFT_DATE: "Left Date",
  NO_INACTIVE_STUDENTS: "No inactive students found",
  INACTIVE_STUDENTS_EMPTY_MESSAGE: "Students who leave the hostel will appear here",
  LOADING_STUDENTS: "Loading students...",
  FAILED_TO_LOAD_STUDENTS: "Failed to load students",
  STUDENT_MANAGEMENT: "Student Management",
  ADD_STUDENT: "Add Student",
  STUDENT_IMPORT_CTA: "Import CSV",
  STUDENT_IMPORT_TITLE: "Import students from CSV",
  STUDENT_IMPORT_DESCRIPTION:
    "Upload a CSV with one student per row. Room numbers must match your Rooms page. Use the sample file for column names and formatting.",
  STUDENT_IMPORT_DOWNLOAD_TEMPLATE: "Download sample CSV",
  STUDENT_IMPORT_CHOOSE_FILE: "Choose CSV file",
  STUDENT_IMPORT_SELECTED_FILE: "Selected file",
  STUDENT_IMPORT_READY: "{count} row(s) ready to import",
  STUDENT_IMPORT_HINT:
    "id_proof_type must be one of: Aadhaar, PAN, Passport, Driving License, Voter ID, College ID, Other. Use YYYY-MM-DD for dates. planned_vacate_date is optional.",
  STUDENT_IMPORT_RUN: "Import",
  STUDENT_IMPORT_IMPORTING: "Importing…",
  STUDENT_IMPORT_CSV_ONLY: "Please choose a .csv file.",
  STUDENT_IMPORT_FAILED: "Import failed",
  STUDENT_IMPORT_SUCCESS: "Imported {count} student(s).",
  STUDENT_IMPORT_SOME_FAILED: "{failed} row(s) could not be imported.",
  STUDENT_IMPORT_NOTHING: "No rows were imported.",
  STUDENT_IMPORT_ROW: "Row",
  STUDENT_EXPORT_CURRENT: "Download current students",
  STUDENT_EXPORT_DOWNLOADING: "Downloading…",
  STUDENT_EXPORT_SUCCESS: "Student CSV downloaded.",
  STUDENT_EXPORT_FAILED: "Failed to download student CSV",
  OVERDUE: "Overdue",
  PENDING: "Pending",
  TOTAL_DUE: "Total Due",
  DUE_OVERDUE_AMOUNT_BY_MONTH: "Due/overdue amount by month for {studentName}",
  PAYMENT_BREAKDOWN: "Payment Breakdown",
  VIEW_BREAKDOWN: "View breakdown",
  SEARCH_STUDENTS_PLACEHOLDER: "Search name, phone, ID…",
  ALL_ROOMS: "All Rooms",
  ALL_STATUS: "All Status",
  COLLECTED_AMOUNT: "Collected Amount",
  PENDING_AMOUNT: "Pending Amount",
  OVERDUE_COUNT: "Overdue Count",
  THIS_MONTH: "This Month",
  VIEW_COLLECTED: "View Collected",
  VIEW_PENDING: "View Pending",
  VIEW_OVERDUE: "View Overdue",
  VIEW_THIS_MONTH: "View This Month",

  // Signup page
  SIGNUP_CREATE_YOUR_HOSTEL: "Create Your Hostel",
  SIGNUP_REGISTER_SUBTITLE: "Register your hostel and start managing",
  SIGNUP_TITLE: "Sign Up",
  SIGNUP_FILL_DETAILS: "Fill in your hostel and account details",
  SIGNUP_ALREADY_HAVE_ACCOUNT: "Already have an account?",
  SIGNUP_SIGN_IN: "Sign In",
  SIGNUP_FAILED: "Sign-up failed. Please try again.",
  SIGNUP_ERROR_OCCURRED: "An error occurred. Please try again.",

  // Signup sections
  SIGNUP_HOSTEL_DETAILS: "Hostel Details",
  SIGNUP_ADDRESS_OPTIONAL: "Address (Optional)",
  SIGNUP_ACCOUNT_CREDENTIALS: "Account Credentials",

  // Signup fields
  SIGNUP_HOSTEL_NAME: "Hostel Name",
  SIGNUP_HOSTEL_NAME_PLACEHOLDER: "e.g. Sunrise Hostel",
  SIGNUP_OWNER_NAME: "Owner / Admin Name",
  SIGNUP_OWNER_NAME_PLACEHOLDER: "e.g. John Doe",
  SIGNUP_EMAIL_ADDRESS: "Email Address",
  SIGNUP_EMAIL_PLACEHOLDER: "admin@hostel.com",
  SIGNUP_MOBILE_NUMBER: "Mobile Number",
  SIGNUP_MOBILE_PLACEHOLDER: "9876543210",
  SIGNUP_ADDRESS: "Address",
  SIGNUP_ADDRESS_PLACEHOLDER: "123 Main Street",
  SIGNUP_CITY: "City",
  SIGNUP_CITY_PLACEHOLDER: "Hyderabad",
  SIGNUP_STATE: "State",
  SIGNUP_STATE_PLACEHOLDER: "Telangana",
  SIGNUP_PINCODE: "Pincode",
  SIGNUP_PINCODE_PLACEHOLDER: "500001",
  SIGNUP_PASSWORD: "Password",
  SIGNUP_PASSWORD_PLACEHOLDER: "",
  SIGNUP_CONFIRM_PASSWORD: "Confirm Password",
  SIGNUP_CONFIRM_PASSWORD_PLACEHOLDER: "",
  SIGNUP_PASSWORD_HINT: "Min 8 chars, 1 uppercase, 1 number, 1 special character",
  SIGNUP_ACCEPT_TERMS: "I accept the Terms & Conditions and Privacy Policy",
  SIGNUP_BUTTON: "Sign Up",
  SIGNUP_CREATING_ACCOUNT: "Creating account...",

  // Signup validation errors
  SIGNUP_ERROR_HOSTEL_REQUIRED: "Hostel name is required",
  SIGNUP_ERROR_OWNER_REQUIRED: "Owner/Admin name is required",
  SIGNUP_ERROR_EMAIL_REQUIRED: "Email is required",
  SIGNUP_ERROR_EMAIL_INVALID: "Invalid email format",
  SIGNUP_ERROR_MOBILE_REQUIRED: "Mobile number is required",
  SIGNUP_ERROR_MOBILE_INVALID: "Mobile must be 10 digits",
  SIGNUP_ERROR_PASSWORD_MIN: "Minimum 8 characters",
  SIGNUP_ERROR_PASSWORD_UPPERCASE: "At least 1 uppercase letter",
  SIGNUP_ERROR_PASSWORD_NUMBER: "At least 1 number",
  SIGNUP_ERROR_PASSWORD_SPECIAL: "At least 1 special character",
  SIGNUP_ERROR_CONFIRM_REQUIRED: "Confirm password is required",
  SIGNUP_ERROR_TERMS_REQUIRED: "You must accept the Terms & Conditions",
  SIGNUP_ERROR_PASSWORDS_MISMATCH: "Passwords do not match",

  // Settings - Branding
  BRANDING: "Branding",
  BRANDING_TITLE: "Hostel Branding",
  BRANDING_DESCRIPTION: "Customize your hostel name and logo in the app header",
  HOSTEL_NAME: "Hostel Name",
  HOSTEL_NAME_PLACEHOLDER: "e.g. Sunrise Hostel",
  HOSTEL_LOGO: "Hostel Logo",
  UPLOAD_LOGO: "Upload Logo",
  LOGO_PREVIEW: "Logo Preview",
  SAVE_BRANDING: "Save",
  BRANDING_SAVED: "Branding saved successfully",
  LOGO_TOO_LARGE: "Logo must be under 500KB. Please choose a smaller image.",
  REMOVE_LOGO: "Remove logo",
  BRANDING_REQUIRES_HOSTEL: "You must be logged in to a hostel account to update branding.",
  PAYMENT_HISTORY_LOAD_FAILED: "Failed to load payment history",
  APPEARAMCE_SETTINGS: "Appearance",
  SAVE_PREFERENCE: "Save Preferences",

  // Landing — header & nav
  LANDING_HEADER_LOGO_ALT: "Admin HostelHub",
  LANDING_HEADER_NAV_ARIA: "Page sections",
  LANDING_NAV_FEATURES: "Features",
  LANDING_NAV_HOW_IT_WORKS: "How it works",
  LANDING_NAV_ABOUT: "About",
  LANDING_NAV_FAQ: "FAQ",
  LANDING_NAV_CONTACT: "Contact",

  // Landing — auth CTAs
  LANDING_AUTH_GO_TO_DASHBOARD: "Go to Dashboard",
  LANDING_AUTH_SIGN_IN: "Sign In",
  LANDING_AUTH_GET_STARTED: "Get Started",
  LANDING_AUTH_START_FREE_TRIAL: "Start Free Trial",

  // Landing — hero visual (mock)
  LANDING_HERO_PREVIEW_ALT: "Admin HostelHub preview",
  LANDING_HERO_MOCK_LIVE_OVERVIEW: "Live overview",
  LANDING_HERO_MOCK_ROOMS: "Rooms",
  LANDING_HERO_MOCK_STUDENTS: "Students",
  LANDING_HERO_MOCK_OCCUPANCY: "Occupancy",

  // Landing — trust strip
  LANDING_TRUST_ARIA: "Why teams choose Admin HostelHub",
  LANDING_TRUST_TRIAL_TITLE: "7-day full trial",
  LANDING_TRUST_TRIAL_TEXT:
    "Use real workflows before you commit—rooms, students, payments, and reports.",
  LANDING_TRUST_NO_CARD_TITLE: "No card for trial",
  LANDING_TRUST_NO_CARD_TEXT: "Start exploring without payment details. Subscribe only when you're ready.",
  LANDING_TRUST_SECURE_TITLE: "Secure by design",
  LANDING_TRUST_SECURE_TEXT: "HTTPS, access controls, and sensible defaults so sensitive data stays protected.",
  LANDING_TRUST_EXPORT_TITLE: "Export-friendly",
  LANDING_TRUST_EXPORT_TEXT: "Clear ledgers and summaries you can share with accountants or auditors.",

  // Landing — how it works
  LANDING_HOW_KICKER: "How it works",
  LANDING_HOW_HEADING_BEFORE: "From signup to",
  LANDING_HOW_HEADING_ACCENT: "smooth operations",
  LANDING_HOW_SUBTITLE:
    "A clear path for owners and managers—no consultants required. Adjust steps as your hostel grows.",
  LANDING_HOW_STEP_01: "01",
  LANDING_HOW_STEP_01_TITLE: "Create your workspace",
  LANDING_HOW_STEP_01_BODY:
    "Sign up, add your hostel profile, branding, and key contacts so everything stays organized in one place.",
  LANDING_HOW_STEP_02: "02",
  LANDING_HOW_STEP_02_TITLE: "Map rooms & students",
  LANDING_HOW_STEP_02_BODY:
    "Define floors, room types, and beds, then onboard students with profiles, documents, and fee rules.",
  LANDING_HOW_STEP_03: "03",
  LANDING_HOW_STEP_03_TITLE: "Run operations daily",
  LANDING_HOW_STEP_03_BODY:
    "Track occupancy, record payments, monitor dues, and review insights from a single admin dashboard.",
  LANDING_HOW_CTA_TRIAL: "Start your free trial",

  // Landing — FAQ
  LANDING_FAQ_KICKER: "FAQ",
  LANDING_FAQ_HEADING_BEFORE: "Questions,",
  LANDING_FAQ_HEADING_ACCENT: "answered",
  LANDING_FAQ_INTRO_BEFORE_LINK:
    "Tap a question to expand. Still stuck? Visit our",
  LANDING_FAQ_CONTACT_LINK: "contact page",
  LANDING_FAQ_INTRO_AFTER_LINK: "or use the details in the footer.",
  LANDING_FAQ_Q1: "What's included in the 7-day trial?",
  LANDING_FAQ_A1:
    "Full access to core Admin HostelHub features for your hostel: rooms, students, payments, and reporting. No credit card required to start.",
  LANDING_FAQ_Q2: "Can I change or cancel my plan later?",
  LANDING_FAQ_A2:
    "Yes. Upgrade anytime as you grow, or adjust your subscription from the dashboard. Contact us for enterprise terms or custom billing.",
  LANDING_FAQ_Q3: "Do you support multiple hostels or branches?",
  LANDING_FAQ_A3:
    "Yes. Higher tiers support multiple properties so you can switch context in one admin workspace and keep data separated per hostel.",
  LANDING_FAQ_Q4: "How is my data kept secure?",
  LANDING_FAQ_A4:
    "We use industry-standard practices: encrypted connections, secure hosting, and access controls so your team only sees what they need.",
  LANDING_FAQ_Q5: "How do student payments and fees work?",
  LANDING_FAQ_A5:
    "Record fees, track dues, and mark payments as paid. Integrations and gateways depend on your plan—ask us for your region.",

  // Landing — about
  LANDING_ABOUT_BADGE: "About Admin HostelHub",
  LANDING_ABOUT_HEADING_BEFORE: "Simplifying",
  LANDING_ABOUT_HEADING_ACCENT: "student housing",
  LANDING_ABOUT_HEADING_AFTER: "operations",
  LANDING_ABOUT_LEAD:
    "Admin HostelHub is built for owners and managers who run tight ships—one place to track beds, students, dues, and month-end numbers without chasing spreadsheets.",
  LANDING_ABOUT_STAT1_VALUE: "1",
  LANDING_ABOUT_STAT1_LABEL: "Unified workspace",
  LANDING_ABOUT_STAT1_SUB: "Rooms, students & payments together",
  LANDING_ABOUT_STAT2_VALUE: "7",
  LANDING_ABOUT_STAT2_LABEL: "Day trial",
  LANDING_ABOUT_STAT2_SUB: "Explore the full workflow risk-free",
  LANDING_ABOUT_STAT3_VALUE: "Multi",
  LANDING_ABOUT_STAT3_LABEL: "Hostel ready",
  LANDING_ABOUT_STAT3_SUB: "Switch properties without extra logins",
  LANDING_ABOUT_STAT4_VALUE: "256-bit",
  LANDING_ABOUT_STAT4_LABEL: "TLS in transit",
  LANDING_ABOUT_STAT4_SUB: "Role-aware access for your team",
  LANDING_ABOUT_DRIVES_TITLE: "What drives us",
  LANDING_ABOUT_DRIVES_SUB:
    "How we think about product decisions—so Admin HostelHub stays practical for real teams on the ground.",
  LANDING_ABOUT_PILLAR_MISSION_TITLE: "Our mission",
  LANDING_ABOUT_PILLAR_MISSION_BODY:
    "Help hostel operators digitize day-to-day work—allocation, fees, records, and reporting—so teams spend less time on paperwork and more time on residents.",
  LANDING_ABOUT_PILLAR_VISION_TITLE: "Our vision",
  LANDING_ABOUT_PILLAR_VISION_BODY:
    "Become the trusted standard for student housing admin: clear occupancy, predictable cash flow, and transparency owners and parents can rely on.",
  LANDING_ABOUT_PILLAR_VALUES_TITLE: "Our values",
  LANDING_ABOUT_PILLAR_VALUES_BODY:
    "We prioritize reliability, data security, honest pricing, and listening to real hostel teams when we design every screen and report.",
  LANDING_ABOUT_CTA_WORKSPACE: "Create your workspace",

  // Landing — footer social
  LANDING_FOLLOW_US: "Follow us",
  LANDING_SOCIAL_EMAIL: "Email",
  LANDING_SOCIAL_INSTAGRAM: "Instagram",
  LANDING_SOCIAL_FACEBOOK: "Facebook",
  LANDING_SOCIAL_X: "X",
  LANDING_SOCIAL_YOUTUBE: "YouTube",
  LANDING_SOCIAL_LINKEDIN: "LinkedIn",

  //subscription Page
  PAYMENT_SUCCESS: "Payment successful! Subscription activated.",
} as const;

export type EnKeys = keyof typeof en;
