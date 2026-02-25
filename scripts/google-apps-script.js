/**
 * KSAA Google Meet Link Generator — Google Apps Script
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to https://script.google.com
 * 2. Create a new project, name it "KSAA Meet Generator"
 * 3. Paste this entire code into Code.gs (replace everything)
 * 4. Click Deploy → New Deployment
 * 5. Select Type: "Web app"
 * 6. Set "Execute as": "Me"
 * 7. Set "Who has access": "Anyone"
 * 8. Click Deploy and authorize when prompted
 * 9. Copy the Web App URL and add it to Vercel as GOOGLE_APPS_SCRIPT_URL
 */

function doPost(e) {
    try {
        var data = JSON.parse(e.postData.contents);

        var startTime = new Date(data.startDateTime);
        var endTime = new Date(data.endDateTime);

        var event = CalendarApp.getDefaultCalendar().createEvent(
            data.summary,
            startTime,
            endTime,
            {
                description: data.description,
                location: data.location || ''
            }
        );

        // This is the magic — createEvent on a regular Google account
        // supports adding Google Meet conferencing!
        var conferenceData = Calendar.Events.patch(
            {
                conferenceData: {
                    createRequest: {
                        requestId: data.requestId || Utilities.getUuid(),
                        conferenceSolutionKey: { type: 'hangoutsMeet' }
                    }
                }
            },
            'primary',
            event.getId().replace('@google.com', ''),
            { conferenceDataVersion: 1 }
        );

        var meetLink = conferenceData.conferenceData
            ? conferenceData.conferenceData.entryPoints[0].uri
            : conferenceData.hangoutLink;

        return ContentService
            .createTextOutput(JSON.stringify({
                success: true,
                eventId: event.getId(),
                meetLink: meetLink
            }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService
            .createTextOutput(JSON.stringify({
                success: false,
                error: error.toString()
            }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

function doGet(e) {
    return ContentService
        .createTextOutput(JSON.stringify({ status: 'KSAA Meet Generator is running' }))
        .setMimeType(ContentService.MimeType.JSON);
}
