import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonInput, IonSpinner } from '@ionic/angular';
import { Router } from '@angular/router';
import { NotlabBackendService } from './notlab-backend.service';
interface CountryOption {
  iso: string;
  name: string;
  dialCode: string;
  localLength: number;
  flag: string;
  placeholder: string;
}

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, IonInput, IonSpinner],
  templateUrl: './onboarding.page.html',
  styleUrl: './onboarding.page.scss',
})
export class OnboardingPage {
  mode: 'welcome' | 'register' | 'login' | 'success' = 'welcome';
  name = '';
  phone = '';
  errorMessage = '';
  isSubmitting = false;
  readonly countries: CountryOption[] = [
    { iso: 'HT', name: 'Haïti', dialCode: '+509', localLength: 8, flag: '🇭🇹', placeholder: '1234 5678' },
    { iso: 'DO', name: 'République dominicaine', dialCode: '+1', localLength: 10, flag: '🇩🇴', placeholder: '809 555 0123' },
    { iso: 'US', name: 'États-Unis', dialCode: '+1', localLength: 10, flag: '🇺🇸', placeholder: '202 555 0123' },
    { iso: 'CA', name: 'Canada', dialCode: '+1', localLength: 10, flag: '🇨🇦', placeholder: '514 555 0123' },
    { iso: 'FR', name: 'France', dialCode: '+33', localLength: 9, flag: '🇫🇷', placeholder: '6 12 34 56 78' },
    { iso: 'CO', name: 'Colombie', dialCode: '+57', localLength: 10, flag: '🇨🇴', placeholder: '300 123 4567' },
    { iso: 'BR', name: 'Brésil', dialCode: '+55', localLength: 11, flag: '🇧🇷', placeholder: '11 91234 5678' },
    { iso: 'MX', name: 'Mexique', dialCode: '+52', localLength: 10, flag: '🇲🇽', placeholder: '55 1234 5678' },
    { iso: 'CU', name: 'Cuba', dialCode: '+53', localLength: 8, flag: '🇨🇺', placeholder: '5123 4567' },
    { iso: 'JM', name: 'Jamaïque', dialCode: '+1', localLength: 10, flag: '🇯🇲', placeholder: '876 555 0123' },
    { iso: 'GB', name: 'Royaume-Uni', dialCode: '+44', localLength: 10, flag: '🇬🇧', placeholder: '7700 900123' },
    { iso: 'ES', name: 'Espagne', dialCode: '+34', localLength: 9, flag: '🇪🇸', placeholder: '612 345 678' },
  ];
  selectedCountryIso = localStorage.getItem('notlab.countryIso') || 'HT';

  get selectedCountry(): CountryOption {
    return this.countries.find((country) => country.iso === this.selectedCountryIso) || this.countries[0];
  }

  constructor(
    private readonly backend: NotlabBackendService,
    private readonly router: Router,
  ) {}

  showRegister() {
    this.mode = 'register';
    this.resetMessage();
  }

  showLogin() {
    this.mode = 'login';
    this.resetMessage();
  }

  goBack() {
    this.mode = 'welcome';
    this.resetMessage();
  }

  login() {
    const name = this.name.trim();
    const phone = this.normalizePhone(this.phone);
    const savedName = localStorage.getItem('notlab.currentUserName')?.trim() || '';
    const savedPhone = localStorage.getItem('notlab.currentUserPhone')?.replace(/\D/g, '') || '';
    const fullPhone = `${this.selectedCountry.dialCode.replace(/\D/g, '')}${phone}`;

    if (!name || phone.length !== this.selectedCountry.localLength) {
      this.errorMessage = 'Entrez votre nom et votre numéro de téléphone.';
      return;
    }

    if (name.toLowerCase() !== savedName.toLowerCase() || fullPhone !== savedPhone) {
      this.errorMessage = 'Ces informations ne correspondent pas à un compte enregistré sur cet appareil.';
      return;
    }

    localStorage.setItem('notlab.isRegistered', 'true');
    void this.router.navigateByUrl('/home');
  }

  submitRegistration() {
    const name = this.name.trim();
    const digits = this.normalizePhone(this.phone);

    if (name.length < 2) {
      this.errorMessage = 'Entrez votre nom.';
      return;
    }

    if (digits.length !== this.selectedCountry.localLength) {
      this.errorMessage = `Entrez un numéro de ${this.selectedCountry.localLength} chiffres pour ${this.selectedCountry.name}.`;
      return;
    }

    const phone = `${this.selectedCountry.dialCode} ${this.formatLocalNumber(digits)}`;
    const userId = crypto.randomUUID ? crypto.randomUUID() : `user-${Date.now()}`;
    this.isSubmitting = true;
    this.errorMessage = '';

    this.backend.registerUser(name, phone, userId).subscribe({
      next: () => this.finishRegistration(name, phone, userId),
      error: () => this.finishRegistration(name, phone, userId, true),
    });
  }

  private finishRegistration(name: string, phone: string, userId: string, offline = false) {
    localStorage.setItem('notlab.userId', userId);
    localStorage.setItem('notlab.currentUserName', name);
    localStorage.setItem('notlab.currentUserPhone', phone);
    localStorage.setItem('notlab.isRegistered', 'true');
    this.isSubmitting = false;

    if (offline) {
      this.errorMessage = 'Profil enregistré localement. Synchronisation en attente.';
    }

    this.mode = 'success';
  }

  continueToHome() {
    void this.router.navigateByUrl('/home', { replaceUrl: true });
  }

  private resetMessage() {
    this.errorMessage = '';
    this.isSubmitting = false;
  }

  selectCountry(iso: string) {
    this.selectedCountryIso = iso;
    this.phone = '';
    this.errorMessage = '';
    localStorage.setItem('notlab.countryIso', iso);
  }

  private normalizePhone(value: string): string {
    const digits = value.replace(/\D/g, '');
    const dialDigits = this.selectedCountry.dialCode.replace(/\D/g, '');
    const localDigits = digits.length > this.selectedCountry.localLength && digits.startsWith(dialDigits)
      ? digits.slice(dialDigits.length)
      : digits;
    return localDigits.slice(0, this.selectedCountry.localLength);
  }

  private formatLocalNumber(digits: string): string {
    if (digits.length === 8) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    if (digits.length === 9) return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    if (digits.length === 10) return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    if (digits.length === 11) return `${digits.slice(0, 2)} ${digits.slice(2, 7)} ${digits.slice(7)}`;
    return digits;
  }
}
