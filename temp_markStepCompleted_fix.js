  const markStepCompleted = async (stepId: string) => {
    console.log(`🎯 markStepCompleted called with: ${stepId}`);
    console.log(`🎯 Current navigation state BEFORE:`, {
      currentStep: navProgress?.currentStepId,
      completedSteps: completedSteps
    });

    try {
      // CRITICAL FIX: Use the navigation hook's markStepCompleted method directly
      // This ensures atomic updates to both completedSteps and currentStepId
      console.log(`🎯 Calling markNavStepCompleted(${stepId})`);
      await markNavStepCompleted(stepId);
      
      // Wait a moment for the navigation state to update
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Get the updated current step from navigation progress
      const updatedCurrentStep = navProgress?.currentStepId;
      console.log(`🎯 Navigation hook updated currentStepId to: ${updatedCurrentStep}`);
      
      // Update local content to match the new current step if it changed
      const navInfo = navigationSequence[updatedCurrentStep || ''];
      if (navInfo && updatedCurrentStep !== stepId) {
        console.log(`🎯 Updating content to: ${navInfo.contentKey}`);
        setCurrentContent(navInfo.contentKey);
      } else if (updatedCurrentStep !== stepId) {
        console.log(`🔠 No navigation info found for current step: ${updatedCurrentStep}`);
      }

      // Clear manual navigation flag so auto-navigation can work after progress
      sessionStorage.removeItem('hasNavigatedManually');
      console.log(`🎯 Cleared manual navigation flag after step completion`);

      console.log(`✅ Step ${stepId} marked as completed, navigated to ${updatedCurrentStep}`);
      
    } catch (error) {
      console.error(`❌ Failed to complete step ${stepId}:`, error);
      toast({
        title: "Save Error",
        description: "Progress may not have been saved. Please try again.",
        variant: "destructive"
      });
    }
    
    console.log(`🎯 Navigation state AFTER:`, {
      currentStep: navProgress?.currentStepId,
      completedSteps: completedSteps
    });
    console.log(`🎯 Step ${stepId} marked as completed`);
  };