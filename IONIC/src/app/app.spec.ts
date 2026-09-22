import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NotlabBackendService } from './notlab-backend.service';
import { OnboardingPage } from './onboarding.page';

describe('OnboardingPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardingPage],
      providers: [
        { provide: NotlabBackendService, useValue: {} },
        { provide: Router, useValue: {} },
      ],
    })
      .compileComponents();
  });

  it('should create the onboarding page', () => {
    const fixture = TestBed.createComponent(OnboardingPage);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the onboarding welcome actions', async () => {
    const fixture = TestBed.createComponent(OnboardingPage);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Créer un compte');
    expect(compiled.textContent).toContain('Se connecter');
  });
});
