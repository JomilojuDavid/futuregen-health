Build a full-stack responsive web app named "SicklePredict" based strictly on the provided UI design specs, page layouts, component hierarchy, and functionality detailed below.

---

### 1. Overall Design System & Styling Rules

- **Color Palette:** Primary theme uses muted forest and olive greens (light background: soft mint green/off-white; dark background: deep forest/emerald hues). Use high-contrast text and risk status badges (Green = Safe, Yellow = Moderate Risk, Red = High/Very High Risk).

- **Layout & Structure:** Exact mobile-first responsive layout with standard card border-radii (16px–24px), smooth drop shadows, clean spacing, and a sticky bottom navigation bar across main screens with tabs: Home, Predictor, Learn, Share, Profile.

- **Dark Mode Support:** Implement a global Dark Mode toggle (accessible via top bar/settings) that smoothly transitions all background panels, text colors, and UI cards without altering status badge meanings.

---

### 2. Authentication (Login & Sign Up Pages)

- **Login Page:**

  - Standard fields: Email, Password, "Forgot Password" link.

  - Include a **"Remember Me"** checkbox next to credentials.

  - Include a primary **"Log In"** button.

  - Add a dedicated **"Sign in with Google"** button with official Google branding.

- **Sign Up Page:**

  - Input fields: Full Name, Email, Password, Confirm Password.

  - Include a primary **"Sign Up"** button.

  - Add a dedicated **"Sign up with Google"** button with official Google branding.

---

### 3. Core Pages & Layout Breakdown

#### Page A: Home Screen

- Header greeting: "Hi, [User's Name]".

- Feature Card: "Genotype Compatibility Checker" -> "Predict possible genotypes of future children." / "Know Today, Protect Tomorrow".

- Selection Controls:

  - "Your Genotype" selector pills: [AA] [AS] [SS]

  - "Partner's Genotype" selector pills: [AA] [AS] [SS]

- Primary CTA: "Predict Future Babies" button routing directly to the Predictor results.

#### Page B: Predictor (Results Screen)

- Header title: "Predictor" / "Your Future Babies".

- **Genetic Cross (Punnett Square) Matrix:** Interactive 2x2 Mendelian genetics visual grid mapping Partner's Genes vs. Your Genes (A and S alleles).

- **Probability breakdown bars/percentages:**

  - AA (%) | AS (%) | SS (%)

- **Risk Level Badge:** Dynamic risk alert pill (e.g., "High Risk", "Moderate Risk", "Safe") with accompanying description (e.g., "This combination carries a risk of sickle cell disease. Genetic counseling is advised.").

- Action Buttons: "Share Results" and "Predict Again".

#### Page C: Learn Modules & Tabs (Dynamic Web Scraping / Internet Retrieval)

- **CRITICAL OVERRIDE:** Do NOT use hardcoded definitions for questions/answers.

- **Dynamic Content Engine:** Integrate an automated fetching mechanism (or simulated backend query service using web/medical resources like WHO, CDC, or PubMed) to retrieve updated, up-to-date, real-world explanations for all 4 learning modules:

  1. _What is Genotype?_ (Basics about genes & hemoglobin genotypes)

  2. _Understanding Genotypes_ (In-depth breakdown of AA, AS, and SS)

  3. _Safe & Risky Combinations_ (Genetic cross probabilities: Safe, Moderate, High Risk)

  4. _Prevention Tips_ (Medical guidelines, premarital testing, genetic counseling, IVF with PGD)

- Present content with expandable accordion tabs and rich-text responses.

#### Page D: Share Results Page

- Summary card displaying:

  - User's Genotype & Partner's Genotype

  - Calculated Risk Level Badge

  - Percentage outcomes for AA, AS, SS

- **STRICT SHARING OPTIONS:**

  - Share options MUST be restricted strictly to **PDF format**.

  - Provide direct export/share triggers strictly for:

    1. **Email / Gmail** (Generates & attaches/links PDF report)

    2. **WhatsApp** (Shares PDF link/file via WhatsApp Web/API)

    3. **Phone Number / SMS / Messages** (Sends direct link to PDF summary)

#### Page E: Profile & Sub-Screens

- User avatar, name ("Lauretta"), quote ("Stay informed, stay protected.").

- Navigation options:

  - **My Results History:** Chronological log of past genotype checks (showing dates, e.g., "May 14, 2026", "April 28, 2026", SS + AS, Risk badges).

  - **Notification Settings:** Toggle switches for Push Notifications, Result Summary, Tip of the Day, Newsletter, and Check Reminders.

  - **Settings (Edit Profile):** Fields to update Full Name, Email, Gender (Male/Female), Your Genotype, Partner's Gender, "Save Changes", and "Delete Account".

  - **Help & Support:** Accordion listing common questions (What is sickle cell disease?, How accurate is the predictor?, Contact Support).

  - **About SicklePredict:** App version (v1.0.0), Mission, How it works, Medical Disclaimer.

  - **Rate Us Screen:** Interactive star rating and optional feedback comment box.

  - **Logout Button**.

---

### 4. Logic & Calculations

- AA + AA = 100% AA (Safe)

- AA + AS = 50% AA, 50% AS (Safe)

- AA + SS = 100% AS (Safe / Carrier)

- AS + AS = 25% AA, 50% AS, 25% SS (Moderate Risk)

- AS + SS = 50% AS, 50% SS (High Risk)

- SS + SS = 100% SS (Very High Risk)

Generate clean, modern React + Tailwind CSS code with fully functional routing, state management, and clear UI component structure.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/0b06f1d4-47ff-475e-9521-c3e91a7c0578).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
