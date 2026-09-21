import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface BackendElement {
  action: 'save_element';
  element_id: string;
  page_id: string;
  user_id: string;
  author_name: string;
  author_tag: string;
  line_index: number;
  content: string;
  color: string;
}

export interface BackendResponse {
  status?: string;
  message?: string;
  element_id?: string;
}

export interface BackendPage {
  page_id: string;
  page_number: number;
  title: string;
  line_count: number;
  created_at: string;
  modified_at: string;
  owner_user_id: string;
}

export interface ChatMessage {
  message_id?: string;
  project_id: string;
  page_id?: string;
  user_id: string;
  author_name: string;
  author_tag?: string;
  content: string;
  type?: 'text' | 'image' | 'file' | 'voice';
  created_at?: string;
}

export interface ChatMessagesResponse extends BackendResponse {
  messages?: ChatMessage[];
}

@Injectable({ providedIn: 'root' })
export class NotlabBackendService {
  private readonly webhookUrl = 'https://script.google.com/macros/s/AKfycbyaIao4AkSOYHjVuUvxMOccZeEwBA6u-Zf115eaRJsNed6UlOBgg_JbD0CF3MQcSZ0BiA/exec';

  constructor(private readonly http: HttpClient) {}

  saveElement(element: BackendElement): Observable<BackendResponse> {
    // A string body keeps the Apps Script request simple and avoids a browser preflight.
    return this.http.post<BackendResponse>(this.webhookUrl, JSON.stringify(element));
  }

  syncBatch(elements: BackendElement[], strokes: unknown[] = []): Observable<BackendResponse> {
    return this.http.post<BackendResponse>(this.webhookUrl, JSON.stringify({
      action: 'sync_batch',
      elements,
      strokes,
    }));
  }

  syncPages(pages: BackendPage[], userId: string): Observable<BackendResponse> {
    return this.http.post<BackendResponse>(this.webhookUrl, JSON.stringify({
      action: 'sync_pages',
      user_id: userId,
      pages,
    }));
  }

  deletePage(pageId: string, userId: string): Observable<BackendResponse> {
    return this.http.post<BackendResponse>(this.webhookUrl, JSON.stringify({
      action: 'delete_page',
      page_id: pageId,
      user_id: userId,
    }));
  }

  sendChatMessage(message: ChatMessage): Observable<BackendResponse> {
    return this.http.post<BackendResponse>(this.webhookUrl, JSON.stringify({
      action: 'send_chat_message',
      ...message,
    }));
  }

  getChatMessages(projectId: string, pageId = '', limit = 100): Observable<ChatMessagesResponse> {
    const params = new URLSearchParams({
      action: 'get_chat_messages',
      project_id: projectId,
      limit: String(limit),
    });
    if (pageId) params.set('page_id', pageId);
    return this.http.get<ChatMessagesResponse>(`${this.webhookUrl}?${params.toString()}`);
  }


  logoutUser(userId: string): Observable<BackendResponse> {
    return this.postAction({ action: 'logout_user', user_id: userId });
  }

  deleteUser(userId: string): Observable<BackendResponse> {
    return this.postAction({ action: 'delete_user', user_id: userId });
  }

  updateElement(elementId: string, userId: string, content: string, color: string): Observable<BackendResponse> {
    return this.postAction({ action: 'update_element', element_id: elementId, user_id: userId, content, color });
  }

  deleteElement(elementId: string, userId: string): Observable<BackendResponse> {
    return this.postAction({ action: 'delete_element', element_id: elementId, user_id: userId });
  }

  deletePageMessages(pageId: string, userId: string): Observable<BackendResponse> {
    return this.postAction({ action: 'delete_page_messages', page_id: pageId, user_id: userId });
  }

  updateChatMessage(messageId: string, userId: string, content: string): Observable<BackendResponse> {
    return this.postAction({ action: 'update_chat_message', message_id: messageId, user_id: userId, content });
  }

  deleteChatMessage(messageId: string, userId: string): Observable<BackendResponse> {
    return this.postAction({ action: 'delete_chat_message', message_id: messageId, user_id: userId });
  }

  private postAction(payload: Record<string, unknown>): Observable<BackendResponse> {
    return this.http.post<BackendResponse>(this.webhookUrl, JSON.stringify(payload)).pipe(
      map((response) => {
        if (response.status === 'error') throw new Error(response.message || 'Action backend impossible.');
        return response;
      }),
    );
  }
  registerUser(name: string, phone: string, userId: string): Observable<BackendResponse> {
    return this.http.post<BackendResponse>(this.webhookUrl, JSON.stringify({
      action: 'register_user',
      id: userId,
      name,
      // Store +509 as text even if the deployed Apps Script is still an older version.
      phone: phone.startsWith("'") ? phone : `'${phone}`,
      date: new Date().toISOString(),
      status: 'Actif',
    })).pipe(
      map((response) => {
        if (response.status === 'error') {
          throw new Error(response.message || 'Échec de l\'enregistrement.');
        }
        return response;
      }),
    );
  }
}
