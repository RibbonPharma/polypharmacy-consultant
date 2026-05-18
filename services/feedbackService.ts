
import { FeedbackSubmission } from "../types";

/**
 * Mock service to submit user feedback for RLHF (Reinforcement Learning from Human Feedback)
 * In a real application, this would post to a backend endpoint.
 */
export const submitFeedback = async (feedback: FeedbackSubmission): Promise<boolean> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  console.group("📝 [Feedback Submitted]");
  console.log("Target:", feedback.targetId);
  console.log("Category:", feedback.category);
  console.log("Rating:", feedback.rating);
  console.log("Comment:", feedback.comment || "N/A");
  console.log("Timestamp:", feedback.timestamp);
  console.groupEnd();

  return true;
};
