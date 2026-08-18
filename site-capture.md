# Site capture — arunlanguagetraining.com

Captured 1 August 2026 by crawling the live site (all 12 resolving URLs downloaded and transcribed; HTML comments inspected to separate live content from retired content). This file is the source of truth for all copy and data in the rebuild. Section numbers are referenced from `PLAN.md` — do not renumber.

**Re-verified 18 August 2026** — live site unchanged since capture. All 12 URLs still resolve 200;
`/gdpr-consent` still 404s. Page copy, all ten listings, salary figures, company details, the four
social URLs and the TEFL affiliate code (`LNMSR2017C`, $249, 15%, 120 hours) all match this file.
The "accredited by the Australian government" claim was re-confirmed as sitting **inside an HTML
comment** — retired, not live (§2.3/§1). Note for future re-crawls: a markdown-converting fetcher
reads that comment back as visible page text and will report it as a live claim. It is not. Check
the raw HTML before believing any tool that says otherwise.

---

## §1 Page inventory

### Live, in navigation
| URL | Title tag | Status |
|---|---|---|
| `/` | Arun Language Training and Recruitment Ltd | Live |
| `/recruitment` | Recruitment Services by Arun Language Training Ltd | Live |
| `/tefl-tesol-courses` | TEFL/TESOL Courses Online — Arun Language Training & Recruitment | Live (top half of page is retired content, see §2.3) |
| `/teaching-jobs` | Teaching Jobs in China, Taiwan and Thailand | Live — all 10 listings on this one page, no per-job URLs |
| `/contact-alt` | Contact Arun Language Training Ltd | Live |
| `/privacy` | Privacy Policy for Arun Language Training Ltd | Live (linked from footer only) |

### Live but de-linked (removed from nav via HTML comments, URLs still resolve)
These belong to the retired "English courses in the UK" service line. All carry pre-Brexit / pre-COVID copy. See §6.

| URL | Content |
|---|---|
| `/english-language-courses-in-the-uk` | UK in-person English course catalogue |
| `/language-course-pricing` | Course pricing table (£49–£100/hr) |
| `/accommodation` | Homestay / B&B / hotel options for course students |
| `/faq` | FAQs for UK course students (contains "If you are from the EU, you do not need a visa" — outdated) |
| `/agents` | Commission agents recruitment |
| `/things-to-do-in-littlehampton` | Local attractions page |

### Dead
- `/gdpr-consent` — linked in the old cookie banner, returns 404.

### Content hidden in HTML comments (NOT live — do not migrate)
- A Thailand listing ("English teachers required in Lopburi, Thailand", 6-month contract) — commented out on `/teaching-jobs`. The page title still says "and Thailand" but no Thailand role is live. **Active listings = 1 Taiwan + 9 China = 10.**
- A COVID-era Taiwan paragraph about quarantine-free arrival — replaced by the live "visa exempt" wording.
- On `/tefl-tesol-courses`, the entire former partnership block (Australian AQF-accredited TESOL, in-class courses in Vietnam/Cambodia at US $1,798, online at US $998) is commented out. Only the ITTT $249 offer is live. **The live page's headline still claims "Accredited by the Australian Government" — that claim belongs to the retired partner and must not be carried over.**
- Nav links to Courses / Accommodation / Things to do / FAQs / Pricing / Agents — commented out.
- The old contact form is partially commented out; a consent checkbox remains ("I consent to Arun Language Training & Recruitment collecting my details *").

---

## §2 Live page copy

### §2.1 Home (`/`)

H1: **Language Training in Littlehampton** *(note: mispositioned — the live business is recruitment)*

> **Our Mission** — To support companies, schools and colleges with their recruitment needs, and to provide high quality placement services to teachers and other job seekers
>
> **Who we are** — Arun Language Training & Recruitment Ltd is a teacher recruitment company based in West Sussex on the south coast of England
>
> **What we do** — We offer teacher recruitment services to companies, schools and colleges. We help teachers to find the right job for them and aim to make the process as smooth and simple as possible
>
> **English Language Teaching Jobs** — We are working with clients in China and Taiwan to recruit teachers for kindergarten, language schools, and training centres. We also recruit for other training related positions and non-training related positions from time to time.
>
> If you are looking for recruitment services for your organisation, please contact us for further information on mutually beneficial partnerships.
>
> If you are looking for teaching and teaching related jobs overseas, please check out our jobs board or contact us directly.

CTAs: "Recruitment Services", "Teaching Jobs", "Contact us Today".

### §2.2 Recruitment (`/recruitment`)

H1: Recruitment Servcices by Arun Language Training Ltd in Littlehampton *(sic — "Servcices" typo is live)*

> Arun Language Training & Recruitment Ltd offers recruitment services to UK and international organisations requiring English language instructors and other subject specialists. We aim to provide high calibre candidates with a high level of reliability. We offer a menu of services and support:
>
> Advertising · Shortlisting · Interviewing · Selection · Induction · Visa Support · Mobilisation
>
> If you are interested in recruiting English language instructors, EFL teachers or other subject specialists, please contact Barry Shorten at Arun Language Training & Recruitment now: barry.shorten@arunlanguagetraining.com

*(Seven services. The service menu has no per-service descriptions on the live site.)*

### §2.3 TEFL/TESOL courses (`/tefl-tesol-courses`) — live portion only

> **Online TESOL programme (120 hours)**
>
> The online TEFL/TESOL programme with ITTT can be taken remotely anywhere in the world. The programme length is 120 hours to be completed in your own time and at your own pace. The ITTT certificate is recognised by schools globally, giving you a passport to the world!
>
> The fee for the online TEFL/TESOL programme currently stands at US $249.00
>
> Applicants should use the following link to arrange a 15% discount on the above course fee.
>
> https://www.teflcourse.net/apply/?cu=LNMSR2017C
>
> The above link gives candidates a 15% discount on the course fee. Remember to apply using the link or the code LNMSR2017C when booking your course.
>
> Good luck!
>
> Interested applicants in either the online or in-class programmes should email info@arunlanguagetraining.com for further details.

Affiliate link: `https://www.teflcourse.net/apply/?cu=LNMSR2017C` — code `LNMSR2017C`, 15% off US $249.

### §2.4 Contact (`/contact-alt`)

Form (name / phone / email / message) with disclosure text:

> This form collects your name, phone and email address for the purpose of responding to you. Check out the privacy policy on how we protect and manage your data.
>
> ☐ I consent to Arun Language Training & Recruitment collecting my details *

Plus contact details block (see §4).

---

## §3 Job listings — verbatim (all ten)

Shared page intro on `/teaching-jobs`:

> **English Teaching Jobs in China and Taiwan**
> Teaching jobs around the world, search here for international teaching jobs abroad and overseas. Apply now with your CV.

Every listing ends with: *"To apply please email your CV to info@arunlanguagetraining.com"*.

### §3.0 TAIWAN — English teachers required throughout Taiwan

Page note above the listing: *Candidates for these teaching positions must have UK, US, Canadian, Australian, New Zealand or Irish citizenship in order to obtain work visas for Taiwan.*

> Candidates can arrive in Taiwan visa exempt. Candidates could be arriving in Taiwan within just a few weeks of having an offer. Training and induction are provided before candidates do any teaching. Meals and accommodation are provided during the initial training.
>
> **Requirements:**
> - Bachelor's Degree or US Associate Degree.
> - Candidates with a US Associate Degree will need to have or obtain a TEFL certificate.
> - Those with a Bachelor's Degree do not require a TEFL certificate.
> - Candidates must have a hard copy of their degree certificate.
> - Candidates must be able to obtain a clean national criminal background check.
> - Passport with minimum 18 months before expiry.
>
> The school is looking for enthusiastic and dynamic graduates with a genuine love of working with children. Candidates must be flexible to work with children of all ages.
>
> **Salary & benefits:**
> - Hourly Pay starting pay rate range of NT $650 – 700 per hour based on previous teaching qualifications & experience
> - Ceiling rate from NT $800 per hour
>
> **Teaching Duties Stipend:**
> - NT $3000 per month for class preparation work — e.g. for meetings, training, class preparation, etc.
>
> **First-year Contract Renewal Bonus:**
> - Staff retention is an important priority. The purpose of this bonus is to encourage teachers to stay for a minimum of two years. (Contracts are for a year)
> - NT $10,000 is paid in the 6th month of 2nd contract
> - NT $15,000 at the end of 24th month.
>
> **Approximate monthly income depending on hours worked:**
> - 26 Hours Week = 75,600 NTD per month (approx. £1,900 / $2,400)
> - Guaranteed hours — guaranteed minimum of 20 hours per week (average 26 per week), more at busy times
> - 10 days' training is provided prior to start of work — accommodation and meals are provided during the training programme
> - Assistance finding housing
> - Full visa support from the HR team
> - Free TEFL certification
> - Full work permit and residence permit
> - National health insurance
> - Mandarin courses available
>
> Positions are scheduled to start each month throughout the year ahead. Choose the month that suits you best.

Page note above the China listings: *Candidates for these teaching positions must have UK, US, Canadian, South African, Australian, New Zealand or Irish citizenship in order to obtain work visas for China.*

### §3.1 Primary school, Guangzhou

> **Requirements:** Bachelor's Degree + TEFL certificate
>
> **Position:** Primary School in Guangzhou, ESL teacher
> - Location: Zengcheng District, Guangzhou
> - No. Hiring: 1
> - Schedule: Monday to Friday, weekends off, no office hours
> - Class size: 40 students
> - Salary: 17-25k
> - Teaching materials will be provided
> - Length of class: 40 minutes
> - Accommodation provided
> - Holidays: All public holidays; weekends off, winter vacation
> - Visa: work visa, work permit and residence permit

### §3.2 English teachers — kindergarten and primary schools in Shenzhen (near Hong Kong/Macau)

> **Requirements:** BA + TEFL certificate or PGCE or 2 years' teaching experience.
> Native English speakers from UK, US, Australia, Canada, Ireland, New Zealand or South Africa
>
> **Locations:** Positions in Shenzhen, Guangzhou, Dongguan
> - Working week Monday to Friday.
> - Normal school schedules (not training centres).
> - 18 hours teaching per week (24 lessons per week or fewer)
> - Textbooks provided
>
> **Package:**
> - Salary: 19,000 – 23,000 RMB before tax for English/ESL teaching positions
> - Winter/Summer vacation pay 8,000 RMB
> - Airfare reimbursement 8,000 RMB
> - All salary levels based on experience, qualifications and locations.
> - Health Insurance: Provided
> - Salary Advance: Negotiable
> - Visa: Sponsored legal Z work visa
> - Vacation: Official Winter vacation and Summer Holiday, 11 paid official public holidays.
>
> **On boarding:**
> 1. Free hotel accommodation during your first week and free orientation training.
> 2. Assistance provided with finding accommodation, opening bank account, mobile phone SIM.
> 3. Curriculum support and training provided.

### §3.3 English language teachers: Nanjing, Weifang, Lianyungang

> **Educational Requirements:**
> - Bachelor's Degree or above
> - TEFL/TESOL/CELTA certificate or with over two years' teaching experience
>
> **Visa requirements:**
> - American/Australian/Canadian/British/Irish/New Zealand passport holders only
> - A clean criminal background
> - A clean bill of health
>
> **Age group of learners:** 3–12 years old
>
> **Job details:**
> - Begin and end classes on time.
> - Follow lesson plans, teaching objectives and syllabus.
> - Prepare and review the lesson in advance together with co-teachers.
> - Inform students of rules and be responsible for the students' welfare and progress.
> - Discuss every class performance with co-teachers to determine areas for improvement.
> - Grade students' assignments and follow up with students and parents if necessary.
> - Adhere to pre and post lesson procedures.
>
> **Working hours:**
> - 20-25 teaching hours per week
> - 15-20 office hours per week
>
> **Schedule & Holidays:**
> - Work 5 days/week
> - At least 3 scheduled paid weeks off / year
>
> **Monthly Salary & Benefits:**
> - RMB 14,000 to RMB 18,000 (After-Tax)
> - Initial flight paid in advance by school then deducted from salary in equal instalments
> - Annual airfare allowance at end of the year.
> - Paid holidays.
> - Free accommodation.
> - Commission for students that sign up during your demonstration class.

### §3.4 English teachers — Hangzhou

> **School Information:**
> - School Location: Hangzhou and other cities in Zhejiang
> - Quantity of teachers needed: 60
> - Contract period: 1 year or 2 years
> - Teaching hours: 20 hours/week
> - Office time: 8:00 am–5:00 pm (Mon–Fri)
> - Class hours: 30-40 minutes
> - Class size: 20-30 students
> - Student age: 3-12
>
> **Job Package:**
> - A reputable teaching experience in China
> - Monthly salary: 15-20,000 RMB
> - Housing allowance or free housing depending on school location
> - 24/7 living and teaching support in China without even knowing any Chinese
> - Chinese learning opportunity
> - Flight allowance 10,000 RMB
> - Free Medical check
> - Free TEFL provided
> - Health insurance provided
> - Legal working visa provided
> - Legal visa application for accompanied family members
> - Free Foreign Expert Certificate & Residence Permit provided
> - Paid Chinese national holidays
> - Off days: 2 days per week
> - Start-up assistance (bank account, phone, etc)
> - Well-managed business
> - On-going training
> - Genuine opportunity for progression
> - Job security
> - Fun with colleagues
>
> **Job Requirements:**
> - Bachelor's degree or higher in any subject, or
> - Diploma or US Associate's degree in Childhood Education
> - Clean criminal background check
> - A team player with excellent communication skills

### §3.5 English teachers — Shanghai

> We are a boutique English language school for young children in downtown Shanghai. We started our school in 2013 to improve the quality of after-school education.
>
> **A couple things that set us apart:**
> - Small class sizes of 4-8 students to ensure quality English education.
> - Continued professional and personal development.
> - Close-knit team of teachers and plenty of team-building events plus trips!
> - Free Chinese language classes.
> - Centrally located in Huang Pu district.
>
> **The Job**
> - Schedule: Evenings and weekends (two weekdays off)
> - 16-22 teaching hours a week
> - Location: Shanghai, Huangpu district (downtown)
> - Age of students: 3-12 years old
> - Small class sizes of 4-8 students
> - Longman Pearson Curriculum that includes Tot Talk, Welcome to English and Side by Side.
> - We also offer reading & writing classes, arts and crafts, science and drama classes.
>
> **Pay & Benefits**
> - 2 Months paid probation
> - After-tax salary of 20,000 - 25,000 RMB per month (3000 - 3,500 USD) DOE for teachers with 1-3 years of relevant teaching experience with students ages 4-12.
> - Higher pay during the summer and winter and plenty of opportunity to work overtime. In 2022 some teachers earned in excess of 30,000 RMB/month.
> - Overtime pay
> - 3,500 RMB monthly Housing allowance
> - Quarterly Performance bonus of 1500-3500 RMB.
> - Paid Holidays: All Chinese holidays plus an additional week off for Chinese New Year and two weeks in the summer.
> - Contract-end Bonus of 5,000 - 15,000 RMB
> - Paid company trip every year.
> - Health Insurance provided.
> - Ongoing professional development and teacher training.
> - Full arrival support and on-boarding — Housing, bank, sim card, etc.
>
> **Requirements**
> - Must be able to commit to a one-year contract
> - Willingness to learn about coach and give constructive feedback to new teachers.
> - Willingness to learn about course and curriculum development
> - Clear criminal background check.
> - Bachelor's Degree or higher.
> - Must love interacting with kids.
> - TEFL qualification preferred (we can help).
> - Passport from UK, Ireland, USA, Canada, New Zealand, Australia, South Africa
>
> In practice our teachers get paid around 30-32k a month after tax if they factor in housing allowance, overtime and performance bonuses. They need to have two years of work experience.

### §3.6 Primary school teaching vacancies — Foshan (near Guangzhou)

> **Key points:**
> - Location: Shunde District, Foshan City
> - Vacancies: 8
> - Schedule: Monday to Friday, weekends off
> - Class size: 40 students
> - Students age group: 7-12 years old
> - Length of class: 40 minutes
> - All teaching materials are provided
>
> **Pay & Benefits**
> - Salary: 17-23,000 RMB per month
> - Holidays: all public holidays; weekends off, winter vacation
> - Visa: work visa, work permit and residence permit
> - Airport support
> - Flight allowance
> - Up to 750 RMB hotel reimbursements
> - Paid public holidays
> - Accident insurance
> - Job orientation and on-going training
>
> **Requirements:**
> - Background check
> - Bachelor's Degree
> - TEFL qualification
> - Passport from UK, Ireland, Canada, New Zealand, USA, Australia

### §3.7 Kindergarten vacancies: Beijing, Shanghai, Nanjing, Shenzhen, Wuhan, Guangzhou

> **Requirements:**
> - Native English Speaker from: US, UK, Canada, Australia, New Zealand, Ireland
> - Bachelor's degree
> - TEFL
>
> **Job Description:**
> - Student age: 3~6 years old
> - Class size: 15 students
> - Working hours: 8:00am – 5:30pm, Mon-Fri, two and a half hours break at noon time (12–14:30)
> - Schedule: 2 days off per week. Two weeks holiday in winter and again in summer holidays
> - Workload: No more than 20 classes per week
> - Class preparation and related work
> - Maintain good relationship with children and their parents
>
> **Salary and benefits:**
> - Base salary: RMB 15,000-20,000 (before tax, depends on qualification)
> - Housing allowance: RMB 2,000-3,000 (before tax, depends on city)
> - Contract renewal bonus: RMB 5,000
> - Visa reimbursement: RMB 5,000
> - Pre-paid flight or the above flight allowance depending on circumstances
> - Free hotel upon arrival
> - Accident and Health Insurance coverage
>
> **Company support:**
> - Visa guidance, follow up and advice
> - Airport pick-up
> - Hotel arrangement upon arrival
> - City life intro and guidance
>
> **Locations:** Shanghai, Beijing, Wuhan, Shenzhen, Guangzhou, Nanjing

### §3.8 Kindergarten teachers needed in Chengdu

> **Requirements:**
> 1. Candidates must have a passport from the following: US, UK, IRE, CAN, AUS, NZ
> 2. Passion for children's education and child development.
> 3. Bachelor's degree from a recognized institution.
> 4. No criminal record.
> 5. Teaching experience is advantageous but not mandatory.
> 6. Eligible for a work Z visa
>
> **Working Conditions & Benefits**
> 1. Working Schedule: 7:40–12:10, 14:00–17:30, Monday–Friday
> 2. Students aged 3-6 years old. Class Size: 20-28
> 3. Three-in-one teaching team, with a dual-class teacher system for both Chinese and English (1 full-time foreign teacher, 2 Chinese teachers, 1 life teacher).
> 4. Basic Salary: 21K-23,000 RMB/month (after tax) + housing allowance (1,500 RMB)
> 5. Contract completion bonus and renewal: 3K-6K RMB
> 6. Medical insurance: Yes
> 7. Holiday: winter and summer holiday
>
> **Exploratory Theme-Based Teaching Curriculum**
> The curriculum involves children conducting in-depth research around topics of interest from their lives or issues they're curious about, with support from teachers. It's a curriculum reform that shifts from traditional subject-based teaching, fostering a more democratic and collaborative approach to knowledge construction.

### §3.9 University teaching positions — Jinan, Qinghuangdao, Qingdao, Taizhou and Nanjing

> **School type:** University
>
> **Location and number of vacancies:** Harbin ×1, Jinan ×3, Qinghuangdao ×2, Qingdao ×1, Taizhou & Nanjing ×1
>
> **Responsibilities:**
> - Deliver English for Academic Purposes programs to Chinese university students who may transfer to overseas universities in Australia, New Zealand and the UK.
> - Carry out administrative functions in a timely and accurate manner, including but not restricted to recording attendance, providing written feedback on student assessment.
> - Address individual student needs and concerns both inside and outside the classroom.
> - Actively participate in and encourage professional development activities with local teachers at branches in China.
> - Attend weekly Branch meetings.
> - Help create a team environment and contribute to the delivery of quality English language courses.
>
> **Workload:** 38 hours weekly, which includes 20-21 hours of face-to-face teaching, 17-18 hours office hours (office hours for lesson planning, paper grading, student tutorials etc, can be flexible)
>
> **Requirements:**
> - Passport from UK, Canada, US, Ireland, Australia, New Zealand
> - Bachelor's degree or above
> - Teaching certificates such as CELTA, TEFL or TESOL
> - Minimum of one-year EAP teaching experience at a recognized provider preferred
> - Online teaching experience preferred
>
> **Benefits:**
> 1. 16,000-26,000 RMB monthly, negotiable, depending on qualifications.
> 2. Flight Allowance
> 3. Free on-campus accommodation (excludes electricity, water, telephone, network charges)
> 4. Paid 3 weeks leave during Winter OR Summer school break.
> 5. Visa cost reimbursement
> 6. Opportunity for paid professional development programs.

### Suggested slugs (for the rebuild)
`taiwan-english-teachers` · `guangzhou-primary-school` · `shenzhen-kindergarten-primary` · `nanjing-weifang-lianyungang` · `hangzhou-english-teachers` · `shanghai-boutique-school` · `foshan-primary-school` · `kindergarten-six-cities` · `chengdu-kindergarten` · `china-university-positions`

---

## §4 Company details, contact points & social links

- **Legal name:** Arun Language Training & Recruitment Ltd
- **Company number:** 9744912 (Companies House, Cardiff)
- **Registered office:** 7 Goda Road, Littlehampton, BN17 6AS, United Kingdom
- **General email:** info@arunlanguagetraining.com (all job applications go here)
- **Employer/recruitment contact:** barry.shorten@arunlanguagetraining.com
- **Data protection contact:** dpo@arunlanguagetraining.com
- **Phone:** +44 (0)7495 368 499
- **Domain:** arunlanguagetraining.com

**Social links (the four in the old footer):**
- Facebook: https://www.facebook.com/Arun-Language-Training-Recruitment-Ltd-193363187707948/
- LinkedIn: https://www.linkedin.com/company/10206087/
- Instagram: https://www.instagram.com/arun_recruitment/
- Twitter/X: https://twitter.com/arunrecruitment/

Old footer credit "Website Design - iwebsitez.com" — do not carry over.

---

## §5 Privacy policy — verbatim

Port this to `/privacy` unchanged, with a code TODO noting it was last updated 13 May 2018, is written against EU GDPR / EEA transfers, and describes cookie and marketing practices the new site does not perform. Needs proper legal review (out of scope).

> **Privacy Policy**
>
> Arun Language Training & Recruitment Ltd is committed to protecting the privacy of all our recruitment candidates and anyone we hold information on.
>
> For the purposes of the EU General Data Protection Regulation, GDPR, the data controller is Arun Language Training & Recruitment Ltd, 7 Goda Road, Littlehampton, BN17 6AS, United Kingdom.
>
> We have notified the United Kingdom's Information Commissioner's Office that we will process your personal information in accordance with Data Protection Legislation.
>
> **This Privacy Policy covers**
>
> 1. What personal information we collect about you and how we collect it
> 2. Our legal basis for collecting and using your personal information
> 3. How we use your personal information
> 4. Personal information that we share with third parties
> 5. Data retention, data security and transfers of personal information outside of the European Economic Area (EEA)
> 6. Your rights
> 7. How to unsubscribe from any email alerts that you receive
> 8. Changes to our Privacy Policy
> 9. Legal and Contact Information
>
> **1. What personal information we collect about you and how we collect it**
>
> *Information that you provide us directly*
>
> We collect personal information whenever you contact us with regard to employment applications and provide us with information that we are able to identify you by, including when you contact us by phone, email, via our website or at recruitment fairs. We may request, for example, CV and other documents which act as proof of your qualifications, your work experience and your identity.
>
> *Information that we automatically collect (including use of "cookies")*
>
> We automatically gather certain limited information about your visits to our website. This includes demographic data and browsing patterns. Information automatically received includes your: IP address (which identifies the computer or device that you use to access our website); the time and date of your visit; browser; operating system; internet connection details, as well information regarding which web pages you accessed. This is used to build up marketing profiles, to aid strategic development, and to audit usage of our website.
>
> *Use of Cookies*
>
> In particular, we use cookies to collect this information. A cookie is a small collection of data sent by a web server to a web browser, which lets the server collect information back from the browser. Our use of cookies also may allow registered users to be presented with a personalised version of our website.
>
> Please note that if you do disable cookies, certain services on our website may not be available. You can configure your browser to accept all cookies, reject all cookies, or notify you when a cookie is set. If you reject all cookies, you will not be able to use products or services that require you to "sign in" and you may not be able to take full advantage of offerings of our website.
>
> **2. Our legal basis for collecting and using your personal information**
>
> Our legal basis for collecting and using your personal information is consent.
>
> Before processing your information we will ask for your consent to do so.
>
> The information we collect will be in accordance with the EU General Data Protection Regulation. Your consent will be cover use of data for the following purposes:
>
> - processing of your personal information to provide our service to you;
> - processing of your personal information where it is in our legitimate interests to do so, for example:
>   - ► to analyse and create statistical reports based on the services we provide and our performance of those services; and
>   - ► for the proper keeping of business records.
>
> Where we rely on your consent to process your personal information, you may revoke your consent at any time. This will not affect the lawfulness of any prior use of that personal information.
>
> **3. Personal information that we share with third parties**
>
> In order to provide the services offered on our website, we need to share your personal information with other companies.
>
> *Third parties that we share your personal information with*
>
> Where you have provided us with consent, we will share your personal information with third parties (who will also be data controllers in respect of the information that we share).
>
> *Other circumstances where we use or share your personal information*
>
> In certain circumstances, we may be required by law to disclose your personal information to third parties such as government bodies, law enforcement agencies, and data protection regulators.
>
> **4. How we use your personal information**
>
> We will use your personal information to enable us to provide you with the recruitment services you request and to enable you to use our website, including for the following purposes:
>
> - to authenticate your identity and process your application;
> - to personalise aspects of our services;
> - to deal with your enquiries and requests;
>
> Additionally, where you have provided us with consent, we will also use your personal information for certain other purposes, including:
>
> - to share with recruitment institutions (if you are applying for a job);
> - to contact you about opportunities that we believe may be relevant to you and to provide you with updates about developments on our website and information about the services we offer;
> - for marketing and strategic development purposes, for example to identify trends usage;
>
> It is your responsibility to ensure that any information submitted as part of the registration process to your user account or as part of an application to a job posting is accurate and up to date.
>
> **5. Data retention, data security and transfers of personal information outside of the European Economic Area (EEA)**
>
> We take steps to protect your personal information from unauthorised access and against unlawful processing, accidental loss, destruction and damage. We will only keep your personal information for as long as we reasonably require and, in any event, only for as long as Data Protection Legislation allows.
>
> Unfortunately, the transmission of information via the internet is not completely secure. Although we will take steps to protect your personal information, we cannot guarantee the security of your data transmitted via email and/or our website; any transmission is at your own risk.
>
> We may require third parties that are based outside of the EEA to process, host or store your personal information. We will ask for your consent to do this and by submitting your personal information to us, you are acknowledging this transfer, storing or processing. Please note that countries outside the EEA may not have the same standard of data protection legislation as countries within the EEA.
>
> In the event your personal information is transferred, stored or processed outside of the EEA, we will take all reasonable steps to ensure that your personal information is treated securely and in accordance with this Privacy Policy and the Data Protection Legislation. This means that we will only allow third parties to access your personal information where those third parties have agreed to provide all protections to your personal information as set out in the EU General Data Protection Legislation.
>
> **6. Your rights**
>
> Should you have any queries or complaints in relation to how we use your information, please contact us at dpo@arunlanguagetraining.com. If you wish to take any complaints or queries further, you have the right to contact the Information Commissioner's Office regarding such issues. Further information about how to make a complaint can be obtained at www.ico.org.uk or by telephoning 0303 123 1113.
>
> You have the right to see the personal information we hold about you and to ask us to:
>
> (a) make any changes to ensure that any personal information we hold about you is accurate and up to date;
>
> (b) erase or stop processing any personal information we hold about you where there is no longer need for us to hold it;
>
> (c) transfer any information we hold about you to a specified third party.
>
> **7. How to unsubscribe from our emails**
>
> If you would like to unsubscribe from our emails please click on the "unsubscribe" link at the bottom of an email.
>
> **8. Changes to our Privacy Policy**
>
> Arun Language Training & Recruitment Ltd may amend this Privacy Policy at any time and where we make material changes to it we will provide notice on our website. By continuing to use our services and/or our website, you agree to the updated Privacy Policy. If you do not agree to any changes that we make, you should not use or access our services and/or our website.
>
> **9. Legal and Contact Information**
>
> The registered office of Arun Language Training and Recruitment Ltd is:
>
> Arun Language Training and Recruitment Ltd, 7 Goda Road, Littlehampton, BN17 6AS, United Kingdom. Registered with Companies House, Cardiff. Company registration number 9744912.
>
> We will endeavour to answer any questions or resolve any concerns regarding your privacy promptly.
>
> We welcome all comments, queries and requests relating to our use of your personal information (including in relation to transfers of personal information outside the EEA). If you would like to contact us, queries should be addressed to dpo@arunlanguagetraining.com
>
> Arun Language Training & Recruitment Privacy Policy (updated 13th May 2018)

---

## §6 Retired / orphaned pages (not migrated — 301 redirect all to `/`)

All six are de-linked from the nav (commented out), carry stale pre-Brexit/pre-COVID copy, and describe the retired "English courses in the UK" service line. Summaries kept here in case the line ever revives:

- **`/english-language-courses-in-the-uk`** — CEFR-benchmarked in-person courses in Littlehampton: Business English, Work Related English, General English, Technical English, Exam Preparation (IELTS, KET, PET, FCE, CAE), Presentations Skills, Business Writing Skills. Contains one genuinely lovely line worth stealing for the new brand: *"Our location, where the Arun river flows into the sea, gives us a relaxed and tranquil feel."*
- **`/language-course-pricing`** — 1:1 £49/hr up to groups of six £100/hr; 25% deposit; bank transfer.
- **`/accommodation`** — Homestay from £30/night, B&B from £50, Travelodge from £32, Bailiffscourt Hotel and Spa from £219.
- **`/faq`** — travel from Gatwick/Heathrow, visas ("If you are from the EU, you do not need a visa" — pre-Brexit), certificates at 80% completion.
- **`/agents`** — commission agents for course candidates and recruitment clients.
- **`/things-to-do-in-littlehampton`** — Blue Flag beaches, South Downs, River Arun walk to Arundel, the Black Rabbit pub, Arundel wetlands, Fontwell Park, Goodwood; day trips to Worthing, Portsmouth, Brighton, Chichester, London.

Also: `/gdpr-consent` already 404s — leave dead, exclude from sitemap.

---

## §7 Design audit of the current site

- **Theme:** Generic 2015-era Bootstrap 3 template. Loads Bootstrap **3.3.5 and 3.3.7 simultaneously** from two different CDNs, plus Font Awesome 4.4 and bxSlider. IE7/8 conditional comments still present.
- **Palette (from `style.css`, by frequency):** whites/greys dominate; `#363a47` dark slate; `#dedde1` light grey; `#6497d4` blue; `#8cc0c7` light teal (header band — the one recognisable brand element); `#5ba5af` mid teal; `#fd652b` orange CTA and `#c42c00` red (the clashing warm CTA colours); `#ff0000` pure red for form errors.
- **Type:** Bootstrap defaults, small body size (~14px), weak hierarchy. Jobs page is a single very long page of stacked headings.
- **Imagery:** placeholder-grade stock photography in a bxSlider carousel; `images/logo.png`.
- **Tracking:** Google Analytics (gtag.js) plus a cookie-consent banner (`cookie/cookie.css`) — both to be dropped in the rebuild (Cloudflare Web Analytics is cookieless; no banner needed).
- **Mobile:** Bootstrap 3 responsive collapse nav; content readable but cramped.
- **SEO:** no structured data of any kind; one page for all ten jobs (nothing eligible for Google Jobs); title tags present but H1s mispositioned ("Language Training in Littlehampton" on a recruitment site); typo "Servcices" in a live H1.
- **Forms:** contact form with name/phone/email/message + consent checkbox; applications by plain `mailto:` with no subject line, so inbound applications don't identify which role they're for.
