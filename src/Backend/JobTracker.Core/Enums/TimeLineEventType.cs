namespace JobTracker.Core.Enums;

public enum TimelineEventType
{
    Note,
    StatusChange,   // "Applied" -> "Interviewing"
    Email,          // E-mail
    PhoneCall,
    Interview,
    TechnicalTask,
    AiAnalysis,
    OfferReceived,
    Rejection
}