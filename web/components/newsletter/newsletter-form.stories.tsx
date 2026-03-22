/**
 * Story file for the NewsletterForm component.
 *
 * Storybook is not installed in this project. To use these stories:
 *   npm install -D @storybook/react @storybook/react-vite
 *   npx storybook@latest init
 *
 * These named exports represent the component's visual states.
 * With Storybook running, each export becomes a story in the sidebar.
 */

import { NewsletterForm } from './newsletter-form';

/** Default — idle state, ready for email input. */
export function Default() {
  return <NewsletterForm />;
}
