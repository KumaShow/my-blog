# Astro Project Code Review Guidelines for GitHub Copilot (Tailwind V4 Adjusted)

**Project Context:** This project uses Astro, TypeScript, and Tailwind CSS v4 (configured primarily via the main CSS file). Reviews should prioritize Astro best practices, type safety, efficient styling, performance, and maintainability.

**Instructions for Copilot:** When reviewing Pull Requests, please check the code against the following guidelines. Focus on identifying potential issues, suggesting improvements based on best practices, and ensuring consistency.
---

## 1. Astro Core Concepts & Best Practices

*   **Component Structure (`.astro` files):**
    *   **Clarity:** Ensure the separation between the frontmatter script (JavaScript/TypeScript), the HTML template, and optional `<style>` tags is clear and logical.
    *   **Frontmatter Logic:** Keep complex logic out of the frontmatter. Prefer importing utility functions or moving logic to dedicated API routes or server endpoints if necessary.
    *   **Props Definition:** Use TypeScript interfaces or `Props` type alias via `Astro.props` for defining component props clearly and accurately. Ensure all props are typed.
*   **Islands Architecture & Client Directives:**
    *   **Minimal Client-Side JS:** Verify that interactive components are only loaded on the client when necessary using appropriate `client:*` directives.
    *   **Avoid Unnecessary Hydration:** Question components hydrated with `client:load` if interactivity isn't immediately required. Prefer `client:idle` or `client:visible`.
    *   **Correct Framework Usage:** Ensure UI framework components are placed correctly and imported.
    *   **Passing Props to Islands:** Ensure only serializable props are passed.
*   **Routing:**
    *   **Clear File Names:** File names in `src/pages/` or `src/routes/` should clearly represent the route. Use `[param]` and `[...slug]` appropriately.
    *   **Type Safety in Dynamic Routes:** Use `Astro.params` with proper type assertions or validation.
*   **Data Fetching:**
    *   **Top-Level `await`:** Use for fetching data at build/request time.
    *   **`Astro.glob()`:** Use efficiently for importing local files.
    *   **Content Collections:** Check schemas (`src/content/config.ts`) and efficient querying (`getCollection`, `getEntry`).
    *   **API Routes:** Verify HTTP methods, Request/Response types, error handling, and data validation.
*   **Astro Configuration (`astro.config.mjs`):**
    *   Check for clarity and correctness.
    *   Ensure integrations (like Astro's Tailwind integration, framework integrations) are configured properly.
    *   Verify build options and output modes.

## 2. TypeScript Usage

*   **Type Safety:** Avoid `any`, enforce `strict` mode, define clear types/interfaces, type function signatures.
*   **Readability & Consistency:** Use meaningful names, leverage utility types, maintain consistent style.
*   **`tsconfig.json`:** Verify configuration aligns with Astro requirements.

## 3. Tailwind CSS v4 Usage

*   **Configuration (`@import` and `@theme`):**
    *   Verify the main CSS file correctly imports Tailwind (`@import "tailwindcss";`).
    *   If using theme customizations (`@theme`), check that the customizations within the CSS file are clear, well-organized, and logically structured.
*   **Utility-First Principle:**
    *   Prefer applying utility classes directly in the HTML/Astro template.
    *   Avoid creating custom CSS classes just to group Tailwind utilities unless it significantly improves readability for complex, reused patterns.
    *   Discourage overuse of `@apply` within `<style>` tags. Use sparingly for complex abstractions.
*   **Readability & Maintainability:**
    *   Format long lists of utilities clearly. Consider breaking down components or using helper functions for complex conditional classes.
*   **Consistency:**
    *   Use theme values (default or defined via `@theme` in CSS) consistently. Avoid arbitrary values (e.g., `mt-[13px]`) unless necessary and justified.
*   **Content Scanning:**
    *   Ensure the build setup (Astro's Tailwind integration) is correctly configured or implicitly able to scan all relevant file types (`.astro`, `.js`, `.ts`, `.jsx`, `.tsx`, `.svelte`, etc.) where Tailwind classes are used. Missing classes in the final CSS often indicate a scanning issue.
*   **Performance:**
    *   Ensure the setup generates lean CSS (Tailwind v4 and Astro's integration typically handle this well).
    *   Avoid overly complex selectors if possible.

## 4. Performance

*   **Minimize Client-Side JS:** Reiterate checking `client:*` directives.
*   **Asset Optimization:** Check image optimization (consider Astro's `` or ``).
*   **Code Splitting:** Check for unusually large JS chunks.
*   **Efficient Data Loading:** Ensure data fetching is optimal (build vs. request time).

## 5. Accessibility (a11y)

*   **Semantic HTML:** Use elements correctly.
*   **ARIA Attributes:** Use appropriately where needed.
*   **Keyboard Navigation:** Ensure usability.
*   **Alt Text:** Verify meaningful `alt` text for images.

## 6. Error Handling & Logging

*   **API Routes:** Check for robust error handling and meaningful responses.
*   **Client-Side:** Implement basic error handling where needed.
*   **Logging:** Use appropriately.

## 7. Security

*   **API Route Validation:** Validate and sanitize user input.
*   **Environment Variables:** Use for secrets (`import.meta.env`), check `.gitignore`.
*   **Cross-Site Scripting (XSS):** Use `set:html` sparingly and only with trusted, sanitized content.

## 8. General Code Quality

*   **Readability:** Clear, understandable code and names.
*   **Simplicity:** Prefer simple solutions.
*   **DRY:** Refactor duplicated code.
*   **Comments:** Explain the "why," not just the "what."

---

**Final Note for Copilot:** While these guidelines are comprehensive, always consider the context of the change. Use your judgment to prioritize feedback and differentiate between critical issues and minor suggestions. Encourage communication if the intent of the code is unclear.