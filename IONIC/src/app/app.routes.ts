import { Routes } from '@angular/router';
import { HomePage } from './home.page';
import { OnboardingPage } from './onboarding.page';

export const routes: Routes = [
	{ path: '', pathMatch: 'full', redirectTo: 'onboarding' },
	{ path: 'onboarding', component: OnboardingPage },
	{ path: 'home', component: HomePage },
	{ path: 'notebook', component: HomePage },
	{ path: '**', redirectTo: 'onboarding' },
];
