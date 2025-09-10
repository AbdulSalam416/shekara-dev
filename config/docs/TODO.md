# Koko & Koobi MVP Plan

This document outlines the next steps to get the Koko & Koobi project to a Minimum Viable Product (MVP) stage.

## 1. Foundational Setup & Design System

- [x] Rename project from `ArtiEaz` to `koko-koobi-web`.
- [x] Update all documentation and configuration to reflect the new project identity.
- [ ] **Finalize Design System:**
    - [ ] Review and refine all components in the `@app-ui` library for consistency and completeness.
    - [ ] Ensure `koko-koobi-web` is fully integrated with the `@app-ui` design system.
- [ ] **Fix ShadCn Utils:**
    - [ ] Investigate and resolve any remaining configuration issues with `ShadCn` utility functions.

## 2. Core Feature Implementation (MVP)

- [ ] **Daily Price Updates Feature:**
    - [ ] Define a data schema/interface for commodity prices.
    - [ ] Create a mock data source (e.g., a JSON file) for initial development.
    - [ ] Build the UI component to display the price data.
    - [ ] Connect the UI component to the mock data source.
- [ ] **Landing Page Content:**
    - [ ] Ensure all sections of the landing page (`Hero`, `ToolsSection`, `Testimonials`, `CTA`) are populated with the content from `siteConfig.ts`.

## 3. Future Steps (Post-MVP)

- [ ] **Mobile App:**
    - [ ] Scaffold a new application for the Koko & Koobi mobile app.
- [ ] **Backend & Database:**
    - [ ] Plan and set up a backend service and database to manage real price data.
- [ ] **Deployment:**
    - [ ] Configure a CI/CD pipeline to deploy the `koko-koobi-web` application.