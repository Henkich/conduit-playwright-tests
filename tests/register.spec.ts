import { test, expect } from '@playwright/test';
import { createUser, generateEmail, type User } from '../helpers/api';
import { LoginPage } from '../pages/LoginPage';
import { Navbar } from '../pages/Navbar';
import { RegisterPage } from '../pages/RegisterPage';


test.describe('Register', () => {
    let registerPage: RegisterPage;
    let navbar: Navbar;

    test.beforeEach(async ({ page }) => {
        registerPage = new RegisterPage(page);
        navbar = new Navbar(page);
        await registerPage.open();
    });

    test('user can register with valid credentials', async ({ page }) => {
        const user: User = {
            username: `user${Date.now()}${Math.floor(Math.random() * 1000)}`,
            email: generateEmail(),
            password: 'Passw0rd!',
        };
        await registerPage.register(user.email, user.password, user.username);
        await expect(page).toHaveURL(/\/#\/$/);
        await expect(navbar.newArticleLink).toBeVisible();
        await expect(navbar.userMenu).toHaveText(user.username);
    });


    test('shows error for existing email', async ({ page, request }) => {
        const existingUser = await createUser(request);

        await registerPage.register(existingUser.email, existingUser.password, existingUser.username);

        await expect(page).toHaveURL(/\/#\/register$/);
        await expect(registerPage.errorMessage).toBeVisible();
        await expect(registerPage.errorMessage).toContainText(/email already exists/i);
    });

});