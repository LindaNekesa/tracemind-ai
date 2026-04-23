# Requirements Document

## Introduction

TraceMind AI is a dark-themed, role-based digital forensics platform built with Next.js, Tailwind CSS v4, and Recharts. The platform currently has a consistent dark navy/black design on the landing page and auth screens, but the authenticated interior (dashboard, cases, admin, evidence, reports, settings, profile) uses a mixed light/dark approach with inconsistent component styling — notably `SearchBar` and `FilterPanel` use unstyled default browser elements, and several shared components lack visual cohesion.

This feature covers a comprehensive UI/UX redesign across the entire platform: the public-facing landing page, authentication flows (login, register, forgot/reset password, email verification), and all authenticated pages and shared components. The goal is a polished, accessible, visually unified forensics-grade interface that reinforces trust and clarity for investigators, analysts, auditors, legal counsel, and other specialist roles.

---

## Glossary

- **Platform**: The TraceMind AI Next.js web application.
- **Landing_Page**: The public `app/page.tsx` route, including the Navbar, Hero, Stats bar, Features section, Roles section, CTA section, and Footer.
- **Auth_Pages**: The login, register, forgot-password, reset-password, and verify-email pages.
- **Dashboard**: The authenticated `/dashboard` route and its role-specific sub-dashboards.
- **Sidebar**: The `components/SideBar.tsx` persistent left navigation component used in all authenticated layouts.
- **Topbar**: The `components/NavBar.tsx` sticky top header used in all authenticated layouts.
- **Design_System**: The shared set of color tokens, typography scales, spacing rules, component variants, and animation utilities defined in `app/globals.css` and applied via Tailwind CSS v4.
- **Dark_Theme**: The primary visual mode using deep navy/black backgrounds (`#060b18`, `#0d1117`) with white/gray text and blue accent colors.
- **Light_Theme**: The secondary visual mode using light gray backgrounds (`#f8fafc`, `#ffffff`) with dark text.
- **Color_Token**: A named CSS custom property defined in the `@theme` block of `globals.css`.
- **Accent_Blue**: The primary interactive color, currently `#2563eb` (Tailwind `blue-600`).
- **StatsCard**: The `components/StatsCard.tsx` reusable metric display component.
- **FilterPanel**: The `components/FilterPanel.tsx` filter controls component.
- **SearchBar**: The `components/SearchBar.tsx` search input component.
- **Role_Dashboard**: One of the 12 role-specific dashboard components in `components/dashboards/`.
- **WCAG_AA**: Web Content Accessibility Guidelines 2.1 Level AA contrast and interaction standards.
- **Skeleton_Loader**: An animated placeholder shown while content is loading.
- **Toast**: The `react-hot-toast` notification component used for user feedback.

---

## Requirements

### Requirement 1: Unified Design System Tokens

**User Story:** As a developer, I want a single source of truth for colors, typography, and spacing, so that all pages and components look visually consistent without per-file overrides.

#### Acceptance Criteria

1. THE Design_System SHALL define all background, surface, border, text, and accent colors as named Color_Tokens in the `@theme` block of `globals.css`.
2. THE Design_System SHALL define a typography scale with at least four named size tokens (xs, sm, base, lg) and corresponding line-height values.
3. THE Design_System SHALL define spacing tokens for the four most-used padding/gap values used across the Platform.
4. WHEN a Color_Token is updated in `globals.css`, THE Design_System SHALL propagate the change to all components that reference that token without requiring per-file edits.
5. THE Design_System SHALL maintain the existing Dark_Theme as the default and preserve the Light_Theme toggle behavior implemented in `DarkModeToggle`.

---

### Requirement 2: Landing Page Visual Refresh

**User Story:** As a visitor, I want the landing page to feel modern and trustworthy, so that I am confident in the platform's professionalism before signing up.

#### Acceptance Criteria

1. THE Landing_Page SHALL render the Navbar, Hero, Stats bar, Features section, Roles section, CTA section, and Footer in a single scrollable layout with no horizontal overflow on viewports from 320 px to 1920 px wide.
2. WHEN the viewport width is below 768 px, THE Landing_Page SHALL collapse the Navbar links into a mobile-friendly menu.
3. THE Landing_Page SHALL display the hero headline, subtitle, and CTA buttons with the existing gradient-text and animation classes preserved.
4. THE Landing_Page SHALL replace emoji icons in the feature cards with SVG icons that render crisply at all pixel densities.
5. THE Landing_Page SHALL display the Stats bar values with a count-up animation that triggers once when the section enters the viewport.
6. WHEN a visitor clicks "Get Started" or "Create Account", THE Landing_Page SHALL navigate to `/register` without a full page reload.
7. WHEN a visitor clicks "Sign In", THE Landing_Page SHALL navigate to `/login` without a full page reload.
8. THE Landing_Page SHALL achieve a Lighthouse performance score of 80 or above on desktop.
9. THE Landing_Page SHALL meet WCAG_AA contrast requirements for all text elements against their backgrounds.

---

### Requirement 3: Authentication Pages Consistency

**User Story:** As a new or returning user, I want the login, register, and password-reset pages to feel like part of the same product, so that I trust the platform with my credentials.

#### Acceptance Criteria

1. THE Auth_Pages SHALL use the same two-panel layout (branding panel left, form panel right) on viewports 1024 px and wider, collapsing to a single centered form on narrower viewports.
2. THE Auth_Pages SHALL use identical input field styling: `bg-white/5 border border-white/10 rounded-xl` with a `focus:ring-2 focus:ring-blue-500` focus state.
3. THE Auth_Pages SHALL display inline validation errors below each field within 300 ms of the user leaving the field (blur event), without requiring form submission.
4. WHEN a form submission is in progress, THE Auth_Pages SHALL disable the submit button and display a spinner with a descriptive loading label.
5. IF a network error occurs during form submission, THEN THE Auth_Pages SHALL display a dismissible error banner at the top of the form with a human-readable message.
6. THE Auth_Pages SHALL preserve the password strength indicator on the register page, updating in real time as the user types.
7. THE Auth_Pages SHALL meet WCAG_AA contrast requirements for all labels, placeholders, and error messages.
8. WHEN email verification succeeds, THE Auth_Pages SHALL redirect to `/login?verified=true` and display the existing success banner.

---

### Requirement 4: Sidebar Navigation Redesign

**User Story:** As an authenticated user, I want the sidebar to clearly show my current location and role, so that I can navigate the platform efficiently.

#### Acceptance Criteria

1. THE Sidebar SHALL display the TraceMind AI logo, the authenticated user's name, role label, and avatar in a persistent header section.
2. WHEN a navigation link is active, THE Sidebar SHALL highlight it with the `bg-blue-600/15 text-blue-400 border border-blue-500/20` active state and a filled indicator dot.
3. WHEN the Admin Panel link is active, THE Sidebar SHALL use the `bg-red-500/15 text-red-400 border border-red-500/20` active state to visually distinguish admin navigation.
4. THE Sidebar SHALL group navigation links under labeled sections ("Navigation", "Admin") with uppercase tracking-widest section labels.
5. WHEN the viewport width is below 1024 px, THE Sidebar SHALL collapse to an icon-only rail with tooltips on hover, expanding to full width on user interaction.
6. THE Sidebar SHALL display the user's avatar using the `Avatar` component, falling back to the user's initials when no avatar image is set.
7. WHEN the user clicks "Sign Out", THE Sidebar SHALL clear the `auth_token` cookie and redirect to `/login`.

---

### Requirement 5: Topbar Redesign

**User Story:** As an authenticated user, I want the topbar to show contextual breadcrumbs and quick actions, so that I always know where I am and can act quickly.

#### Acceptance Criteria

1. THE Topbar SHALL display a breadcrumb trail derived from the current pathname, using the mapping defined in `NavBar.tsx`.
2. THE Topbar SHALL render the `DarkModeToggle` and `NotificationBell` components in the right action area.
3. THE Topbar SHALL display a "Sign Out" button that clears the auth cookie and redirects to `/login`.
4. WHEN the dark mode is toggled, THE Topbar SHALL update its background from `bg-white/80` to `bg-[#0d1117]/80` without a flash of unstyled content.
5. THE Topbar SHALL use `backdrop-blur-xl` and a bottom border to visually separate it from the page content below.
6. THE Topbar SHALL remain sticky at the top of the viewport while the user scrolls the main content area.

---

### Requirement 6: Dashboard Page Redesign

**User Story:** As an authenticated user, I want my role-specific dashboard to surface the most relevant metrics and actions immediately, so that I can start working without hunting for information.

#### Acceptance Criteria

1. THE Dashboard SHALL render the correct Role_Dashboard component based on the authenticated user's role, as determined by the JWT payload.
2. THE Dashboard SHALL display StatsCard components in a responsive grid: 2 columns on viewports below 1280 px, up to 5 columns on viewports 1280 px and wider.
3. THE Dashboard SHALL display a "Quick Actions" section with links to the most common tasks for the user's role.
4. WHEN dashboard data is loading, THE Dashboard SHALL display Skeleton_Loader placeholders in place of StatsCard and chart components.
5. WHEN dashboard data fails to load, THE Dashboard SHALL display an error state with a "Retry" button that re-fetches the data.
6. THE Dashboard SHALL render the `ChartComponent` and `RecentActivity` components in a two-column grid on viewports 1024 px and wider, stacking vertically on narrower viewports.

---

### Requirement 7: Cases Page Redesign

**User Story:** As an investigator or analyst, I want the cases list to be easy to scan and filter, so that I can find the right case quickly.

#### Acceptance Criteria

1. THE Cases_Page SHALL display cases in a table with columns for Case title, Type, Status, Priority, Created date, and Actions.
2. THE Cases_Page SHALL apply the `statusConfig` and `priorityConfig` badge styles consistently for all status and priority values.
3. THE Cases_Page SHALL display a search input and status filter buttons in a flex row above the table, wrapping to a new line on viewports below 640 px.
4. WHEN the cases list is empty and no filters are active, THE Cases_Page SHALL display an empty state with an illustration, a descriptive message, and a "Create First Case" CTA button.
5. WHEN the cases list is empty due to active filters, THE Cases_Page SHALL display a "No matching cases" message with a "Clear Filters" action.
6. THE Cases_Page SHALL display pagination controls when the total number of cases exceeds 20, showing the current page and total pages.
7. WHEN a case row is hovered, THE Cases_Page SHALL reveal the "View" and "Delete" action buttons with an opacity transition.

---

### Requirement 8: Shared Component Redesign — SearchBar and FilterPanel

**User Story:** As a developer, I want the SearchBar and FilterPanel components to match the platform's design system, so that they do not look out of place on any page.

#### Acceptance Criteria

1. THE SearchBar SHALL use the same input styling as the Auth_Pages: `bg-white/5 border border-white/10 rounded-xl` in Dark_Theme and `bg-white border border-gray-200 rounded-xl` in Light_Theme.
2. THE SearchBar SHALL display a search icon inside the left edge of the input field.
3. THE SearchBar SHALL accept a `placeholder` prop and an `onSearch` callback, triggering the callback on both form submit and input change with a 300 ms debounce.
4. THE FilterPanel SHALL replace the unstyled `<select>` elements with styled dropdowns that match the Design_System button and input styles.
5. THE FilterPanel SHALL accept a `filters` prop defining the available filter options and an `onFilterChange` callback.
6. WHEN a filter value is selected, THE FilterPanel SHALL visually highlight the active filter using the `bg-blue-600 text-white` active state.

---

### Requirement 9: Admin Panel Redesign

**User Story:** As an administrator, I want the admin panel to clearly separate system management tools from analytics, so that I can act on the right information without confusion.

#### Acceptance Criteria

1. THE Admin_Panel SHALL display AI tool cards (Case Verifier, Credibility Scanner, AI Assistant) in a 3-column grid on viewports 640 px and wider, stacking to a single column on narrower viewports.
2. THE Admin_Panel SHALL display system StatsCards (Total Users, Total Cases, Evidence Files, AI Analyses) in a 4-column grid on viewports 1280 px and wider.
3. THE Admin_Panel SHALL display the "Recently Registered Users" table with avatar initials, name, email, role badge, and join date columns.
4. WHEN an admin navigates to a sub-page (users, messages, verify, credibility, assistant, audit, training, health), THE Admin_Panel layout SHALL preserve the Sidebar and Topbar.
5. THE Admin_Panel SHALL display the Training Program banner with a direct link to `/admin/training`.

---

### Requirement 10: Responsive Layout and Accessibility

**User Story:** As a user on any device, I want the platform to be usable and readable, so that I can work effectively whether I am at a desk or on a tablet.

#### Acceptance Criteria

1. THE Platform SHALL render all pages without horizontal scrollbars on viewports from 320 px to 1920 px wide.
2. THE Platform SHALL meet WCAG_AA contrast ratio requirements (4.5:1 for normal text, 3:1 for large text) in both Dark_Theme and Light_Theme.
3. THE Platform SHALL support keyboard navigation for all interactive elements: links, buttons, inputs, and dropdowns.
4. WHEN a user navigates using the keyboard, THE Platform SHALL display a visible focus ring on the focused element.
5. THE Platform SHALL provide `aria-label` attributes on all icon-only buttons (DarkModeToggle, NotificationBell, password visibility toggle, Sign Out).
6. THE Platform SHALL use semantic HTML elements (`<nav>`, `<main>`, `<header>`, `<footer>`, `<section>`, `<table>`) in all page layouts.
7. WHILE a form submission is in progress, THE Platform SHALL set `aria-busy="true"` on the submit button and `aria-live="polite"` on the error message region.

---

### Requirement 11: Dark Mode Persistence

**User Story:** As a user, I want my dark/light mode preference to be remembered across sessions, so that I do not have to toggle it every time I visit.

#### Acceptance Criteria

1. WHEN a user toggles the theme, THE Platform SHALL persist the preference to `localStorage` under the key `"theme"`.
2. WHEN the Platform loads, THE Platform SHALL read the `"theme"` key from `localStorage` and apply the corresponding class to `<html>` before the first paint to prevent a flash of unstyled content.
3. IF no `"theme"` key exists in `localStorage`, THEN THE Platform SHALL default to Dark_Theme.
4. THE DarkModeToggle SHALL reflect the current theme state on mount by reading from `localStorage` or the `<html>` class.

---

### Requirement 12: Loading States and Micro-interactions

**User Story:** As a user, I want the interface to respond immediately to my actions with visual feedback, so that I know the platform is working.

#### Acceptance Criteria

1. WHEN data is being fetched, THE Platform SHALL display Skeleton_Loader components that match the shape and size of the content they replace.
2. WHEN a button action is in progress, THE Platform SHALL replace the button label with a spinner and a descriptive loading text.
3. WHEN a user hovers over an interactive card or table row, THE Platform SHALL apply a `-translate-y-0.5` lift and a smooth `transition-all duration-300` effect.
4. WHEN a Toast notification is triggered, THE Platform SHALL display it in the top-right corner using `react-hot-toast` with the existing `Toaster` configuration.
5. THE Platform SHALL use the `animate-fade-in-up` and `animate-fade-in` CSS animation classes for page-level content entry, with staggered delays using the existing `.delay-100` through `.delay-400` utility classes.
