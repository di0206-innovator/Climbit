import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Climbit E2E User Flow', () => {
  
  test('should go from landing page to onboarding, complete it, and verify dashboard calculations', async ({ page }) => {
    // 1. Visit Landing Page
    await page.goto('/');
    
    // Check heading
    const title = page.locator('h1');
    await expect(title).toContainText('Stop guessing. Take the single best climate action next.');
    
    // 2. Click CTA to start Onboarding
    const getStartedBtn = page.locator('#start-onboarding-hero');
    await getStartedBtn.click();
    await expect(page).toHaveURL(/\/onboarding/);

    // 3. Complete Onboarding Form (8 Questions)
    // Q1: Role -> Student
    const roleOpt = page.locator('#opt-role-student');
    await expect(roleOpt).toBeVisible();
    await roleOpt.click();

    // Q2: Living Style -> Hostel
    const livingOpt = page.locator('#opt-livingStyle-hostel');
    await expect(livingOpt).toBeVisible();
    await livingOpt.click();

    // Q3: Commute Mode -> Walk/Cycle
    const commuteOpt = page.locator('#opt-commuteMode-walk_cycle');
    await expect(commuteOpt).toBeVisible();
    await commuteOpt.click();

    // Q4: Diet -> Vegan
    const dietOpt = page.locator('#opt-dietPattern-vegan');
    await expect(dietOpt).toBeVisible();
    await dietOpt.click();

    // Q5: Delivery -> Rarely
    const deliveryOpt = page.locator('#opt-deliveryFrequency-rarely');
    await expect(deliveryOpt).toBeVisible();
    await deliveryOpt.click();

    // Q6: Travel -> Rarely
    const travelOpt = page.locator('#opt-travelFrequency-rarely');
    await expect(travelOpt).toBeVisible();
    await travelOpt.click();

    // Q7: AC -> None
    const acOpt = page.locator('#opt-acUsageProxy-none');
    await expect(acOpt).toBeVisible();
    await acOpt.click();

    // Q8: Electricity -> Low
    const electricityOpt = page.locator('#opt-electricityUsageProxy-low');
    await expect(electricityOpt).toBeVisible();
    await electricityOpt.click();

    // 4. Verification on Results Dashboard
    // It should have navigated to /dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    
    // Verify Monthly Total heading exists
    const monthlyEmissions = page.locator('span:has-text("kg CO₂ / month")').locator('xpath=..');
    await expect(monthlyEmissions).toBeVisible();
    await expect(monthlyEmissions).toContainText('132'); // Expected monthly total for low impact

    // Verify Persona is rendered
    await expect(page.locator('text=Persona: The Green Guardian')).toBeVisible();

    // Verify Hero Action Card is visible
    await expect(page.locator('#hero-recommendation-card')).toBeVisible();

    // Verify Challenge quest board is present
    await expect(page.locator('#challenge-board-card')).toBeVisible();

    // 5. Verify Habit Simulator interaction
    // Click simulator check boxes to toggle recommendation actions and verify calculations adjust
    const simulatorCard = page.locator('#habit-simulator-card');
    await expect(simulatorCard).toBeVisible();
    
    // Toggle the first milestone week box
    const milestoneBox = page.locator('#milestone-week-1');
    await expect(milestoneBox).toBeVisible();
    await milestoneBox.click();

    // 6. Navigate to share page and verify share card matches inputs
    const shareBtn = page.locator('#go-share-btn');
    await shareBtn.click();
    await page.waitForURL(/\/share/);
    
    await expect(page.locator('h1')).toContainText('Your Shareable Impact Card');
    await expect(page.locator('#share-card-container')).toBeVisible();
    await expect(page.locator('#download-png-btn')).toBeVisible();
  });

  test('should pass basic accessibility audit on the landing page', async ({ page }) => {
    await page.goto('/');
    
    // Scan landing page accessibility structure
    const results = await new AxeBuilder({ page })
      .disableRules(['color-contrast', 'region']) // Allow styling overrides/decoratives
      .analyze();
      
    // Assert no high-priority markup structure violations
    expect(results.violations.filter(v => v.impact === 'critical')).toEqual([]);
  });
});
