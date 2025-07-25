import { useKeyboardVisibility } from "@/hooks/useKeyboardVisibility";
import OnboardingComponent from "./component";
import useOnboardingController from "./controller";

export default function OnboardingContainer() {
  const { onboarding, actions, isNextEnabled } = useOnboardingController();

  useKeyboardVisibility((visible) =>
    onboarding.setFieldState("keyboardVisible", visible)
  );

  return (
    <OnboardingComponent
      onboarding={onboarding}
      isNextEnabled={isNextEnabled}
      actions={actions}
    />
  );
}
