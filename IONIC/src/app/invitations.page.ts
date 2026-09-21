import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Invitation, NotlabBackendService } from './notlab-backend.service';

@Component({
  selector: 'app-invitations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invitations.page.html',
  styleUrl: './invitations.page.scss',
})
export class InvitationsPage implements OnInit {
  invitations: Invitation[] = [];
  isLoading = true;
  busyId = '';
  message = '';

  private readonly userId = localStorage.getItem('notlab.userId') || '';

  constructor(
    private readonly backend: NotlabBackendService,
    private readonly router: Router,
  ) {}

  ngOnInit() {
    this.loadInvitations();
  }

  loadInvitations() {
    if (!this.userId) {
      this.isLoading = false;
      return;
    }
    this.backend.listInvitations(this.userId).subscribe({
      next: (response) => {
        this.invitations = response.invitations || [];
        this.isLoading = false;
      },
      error: () => {
        this.message = 'Impossible de charger les invitations.';
        this.isLoading = false;
      },
    });
  }

  respond(invitation: Invitation, response: 'accepted' | 'declined') {
    if (this.busyId) return;
    this.busyId = invitation.invitation_id;
    this.backend.respondInvitation(invitation.invitation_id, this.userId, response).subscribe({
      next: () => {
        this.invitations = this.invitations.filter((item) => item.invitation_id !== invitation.invitation_id);
        this.busyId = '';
        if (response === 'accepted') {
          localStorage.setItem('notlab.activeProjectId', invitation.project_id);
          localStorage.setItem('notlab.activeProjectTitle', invitation.project_title);
          void this.router.navigateByUrl('/home', { replaceUrl: true });
        }
      },
      error: (error: Error) => {
        this.message = error.message || 'Action impossible.';
        this.busyId = '';
      },
    });
  }

  goBack() {
    void this.router.navigateByUrl('/home');
  }
}
