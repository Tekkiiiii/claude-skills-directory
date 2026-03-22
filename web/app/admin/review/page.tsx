import type { Metadata } from 'next';
import { ReviewQueueClient } from './review-client';

export const metadata: Metadata = {
  title: 'Review Queue',
  description: 'Approve, reject, or edit pending skills before they go live.',
};

export default function ReviewQueuePage() {
  return <ReviewQueueClient />;
}
