import BasePage from './BasePage';

class LoginPage extends BasePage {
  // ── Selectors ───────────────────────────────────────────────
  get emailInput()       { return $(this.selector('login_email_input')); }
  get passwordInput()    { return $(this.selector('login_password_input')); }
  get loginButton()      { return $(this.selector('login_submit_button')); }
  get signUpLink()       { return $(this.selector('login_signup_link')); }
  get forgotPwLink()     { return $(this.selector('login_forgot_password')); }
  get errorMessage()     { return $(this.selector('login_error_message')); }
  get skipButton()       { return $(this.selector('onboarding_skip_button')); }
  get verificationInput(){ return $(this.selector('signup_verification_code')); }

  // ── Actions ─────────────────────────────────────────────────
  async login(email: string, password: string) {
    await this.waitAndType('~login_email_input', email);
    await this.waitAndType('~login_password_input', password);
    await this.waitAndTap('~login_submit_button');
  }

  async loginWithDefaults() {
    await this.login(
      process.env.FLEXBETS_TEST_USER_EMAIL!,
      process.env.FLEXBETS_TEST_USER_PASSWORD!,
    );
  }

  async getErrorText(): Promise<string> {
    return this.getText('~login_error_message');
  }

  async isLoginScreenVisible(): Promise<boolean> {
    return this.isDisplayed('~login_email_input');
  }

  async skipOnboarding() {
    if (await this.isDisplayed('~onboarding_skip_button', 3_000)) {
      await this.waitAndTap('~onboarding_skip_button');
    }
  }

  // ── Sign-Up ─────────────────────────────────────────────────
  async startSignUp() {
    await this.waitAndTap('~login_signup_link');
  }

  async fillSignUpForm(email: string, password: string) {
    await this.waitAndType('~signup_email_input', email);
    await this.waitAndType('~signup_password_input', password);
    await this.waitAndTap('~signup_submit_button');
  }
}

export default new LoginPage();
