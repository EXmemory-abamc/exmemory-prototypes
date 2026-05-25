---
status: in-progress
phase: 4
updated: 2026-05-22
---

# Implementation Plan

## Goal
Update country.html, city.html, and room.html to match globe.html's design system (Tailwind CSS, glassmorphism, reality layer colors, typography, and UI components) while preserving existing JavaScript logic and Three.js functionality.

## Context & Decisions
| Decision | Rationale | Source |
|----------|-----------|--------|
| Use Tailwind CSS Play CDN approach like globe.html | Maintain consistency across all EXmemory6 pages | Analysis of globe.html implementation |
| Preserve existing JavaScript/Three.js logic | User requirement to maintain functionality | User request |
| Update CSS variables to Tailwind configuration | Align with globe.html's design tokens | Comparison of country/city/room vs globe.html |
| Keep same HTML structure and element IDs | Preserve JavaScript selectors and functionality | Analysis of existing file structures |

## Phase 1: Analysis [COMPLETE]
- [x] 1.1 Analyze current UI implementation in globe.html to understand the design system
- [x] 1.2 Compare country.html, city.html, and room.html to identify gaps in UI/UX implementation
- [x] 1.3 Read and analyze Struttura e riassunto.md to understand core philosophy

## Phase 2: Country.html Modification [COMPLETE]
- [x] 2.1 Add Tailwind CSS Play CDN and Google Fonts to country.html
- [x] 2.2 Replace custom CSS variables with Tailwind configuration matching globe.html
- [x] 2.3 Implement glassmorphism effects on HUD panels
- [x] 2.4 Update navigation styling to match globe.html design
- [x] 2.5 Update hover effects and transitions to use Tailwind utilities
- [x] 2.6 Preserve existing JavaScript logic and Three.js canvas functionality

## Phase 3: City.html Modification [COMPLETE]
- [x] 3.1 Add Tailwind CSS Play CDN and Google Fonts to city.html
- [x] 3.2 Replace custom CSS variables with Tailwind configuration matching globe.html
- [x] 3.3 Implement glassmorphism effects on HUD panels
- [x] 3.4 Update navigation and toggle styling to match globe.html design
- [x] 3.5 Update hover effects and transitions to use Tailwind utilities
- [x] 3.6 Preserve existing JavaScript logic and Three.js canvas functionality

## Phase 4: Room.html Modification [COMPLETE]
- [x] 4.1 Add Tailwind CSS Play CDN and Google Fonts to room.html
- [x] 4.2 Replace custom CSS variables with Tailwind configuration matching globe.html
- [x] 4.3 Implement glassmorphism effects on HUD panels
- [x] 4.4 Update navigation and popup styling to match globe.html design
- [x] 4.5 Update hover effects and transitions to use Tailwind utilities
- [x] 4.6 Preserve existing JavaScript logic and Three.js canvas functionality

## Notes
- 2026-05-22: Completed analysis phase, identified key differences between globe.html and other files
- 2026-05-22: Began implementation with country.html modification
- 2026-05-22: Completed all phases — country/city/room updated to globe.html design system; all JS logic preserved; old CSS vars eliminated