import { google, type Auth, type calendar_v3 } from "googleapis";

export async function createDedicatedCalendar(
  authClient: Auth.OAuth2Client,
  summary: string,
): Promise<calendar_v3.Schema$Calendar> {
  try {
    const calendar = google.calendar({ version: "v3", auth: authClient });
    const response = await calendar.calendars.insert({
      requestBody: {
        summary,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Failed to create calendar:", error);
    throw new Error(
      "Failed to create calendar. Please check your connection and try again.",
    );
  }
}

export async function getAuthClient(token: string): Promise<Auth.OAuth2Client> {
  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: token });
    return oauth2Client;
  } catch (error) {
    console.error("Failed to get auth client:", error);
    throw new Error(
      "Failed to authenticate. Please check your token and try again.",
    );
  }
}

/**
 * Crée un événement dans Google Calendar
 * @param authClient Le client d'authentification
 * @param event Les détails de l'événement à créer
 * @returns Les détails de l'événement créé
 */
export async function createCalendarEvent(
  authClient: Auth.OAuth2Client,
  calendarId: string,
  event: calendar_v3.Schema$Event,
): Promise<calendar_v3.Schema$Event> {
  try {
    const calendar = google.calendar({ version: "v3", auth: authClient });
    const response = await calendar.events.insert({
      calendarId,
      requestBody: event,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to create calendar event:", error);
    throw new Error(
      "Failed to create calendar event. Please check your connection and try again.",
    );
  }
}

/**
 * Met à jour un événement dans Google Calendar
 * @param authClient Le client d'authentification
 * @param eventId L'ID de l'événement à mettre à jour
 * @param event Les nouvelles données de l'événement
 * @returns Les détails de l'événement mis à jour
 */
export async function updateCalendarEvent(
  authClient: Auth.OAuth2Client,
  calendarId: string,
  eventId: string,
  event: calendar_v3.Schema$Event,
): Promise<calendar_v3.Schema$Event> {
  try {
    const calendar = google.calendar({ version: "v3", auth: authClient });
    const response = await calendar.events.update({
      calendarId,
      requestBody: event,
      eventId,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to update calendar event:", error);
    throw new Error(
      "Failed to update calendar event. Please check your connection and try again.",
    );
  }
}

/**
 * Supprime un événement dans Google Calendar
 * @param authClient Le client d'authentification
 * @param eventId L'ID de l'événement à supprimer
 */
export async function deleteCalendarEvent(
  authClient: Auth.OAuth2Client,
  calendarId: string,
  eventId: string,
): Promise<void> {
  try {
    const calendar = google.calendar({ version: "v3", auth: authClient });
    await calendar.events.delete({
      calendarId,
      eventId,
    });
  } catch (error) {
    console.error("Failed to delete calendar event:", error);
    throw new Error(
      "Failed to delete calendar event. Please check your connection and try again.",
    );
  }
}
