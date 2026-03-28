import { test, expect } from '@playwright/test';

test.describe('Test de Conformité E2E - Incubateur 4.0', () => {

  test('Vérification Landing Page et Liens Essentiels', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('INCUBATEUR');
    
    // Check navigation buttons
    // Check navigation buttons
    await page.click('text=Voir les Programmes');
    // Mettre une attente plus laxiste pour la navigation
    await page.waitForURL('**/*#pricing', { timeout: 5000 });
  });

  test('Vérification Authentification Frontend/Backend', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Submit invalid credentials to test error state
    await page.fill('input[type="email"]', 'mauvais@email.com');
    await page.fill('input[type="password"]', 'mauvaispass');
    await page.click('button[type="submit"]');
    
    const errorMsg = page.locator('text=Identifiants invalides.');
    await expect(errorMsg).toBeVisible({ timeout: 5000 });
  });

  test('Vérification Résilience (404 personnalisé)', async ({ page }) => {
    const response = await page.goto('/une-page-inconnue-12345');
    expect(response?.status()).toBe(404);
    await expect(page.locator('text=Page Introuvable')).toBeVisible();
  });

  test('Vérification de la route Coming Soon', async ({ page }) => {
    const response = await page.goto('/coming-soon');
    expect(response?.status()).toBe(200);
    await expect(page.locator('text=PROCHAINEMENT')).toBeVisible();
    await expect(page.locator('button:has-text("M\'avertir")')).toBeVisible();
  });

  test('Vérification de la Sécurité (Redirection Dashboard)', async ({ page }) => {
    // Si on navigue vers une page protégée sans être connecté
    await page.goto('/dashboard');
    
    // Le serveur doit nous rediriger vers la page de login personnalisée
    await page.waitForURL('**/auth/login', { timeout: 5000 });
    // Vérification textuelle sur la page cible
    await expect(page.locator('text=Accédez à votre espace Élite')).toBeVisible();
  });

  test('Vérification du tunnel Lead Capture', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[placeholder="Votre prénom"]', 'Prospect');
    await page.fill('input[placeholder="nom@exemple.com"]', 'lead.test@example.com');
    await page.click('button:has-text("Obtenir mon accès VIP")');

    await expect(page.locator("text=Bienvenue dans l'Élite !")).toBeVisible({ timeout: 8000 });
  });

  test('Vérification des routes reset password', async ({ page }) => {
    await page.goto('/auth/forgot-password');
    await expect(page.locator('text=MOT DE PASSE OUBLIE')).toBeVisible();
    await page.fill('input[name="email"]', 'test@example.com');
    await page.click('button:has-text("Envoyer le lien")');
    await expect(page.locator('text=Si votre email existe')).toBeVisible({ timeout: 5000 });

    await page.goto('/auth/reset-password');
    await expect(page.locator('text=Lien invalide ou incomplet.')).toBeVisible();
  });
});
