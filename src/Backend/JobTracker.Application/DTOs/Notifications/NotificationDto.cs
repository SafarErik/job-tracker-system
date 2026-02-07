using System;
using System.Text.Json.Serialization;

namespace JobTracker.Application.DTOs.Notifications;

public enum NotificationType
{
    Ai,
    Company,
    Reminder,
    System
}

public class NotificationDto
{
    public Guid Id { get; set; } = Guid.Empty;
    public NotificationType Type { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public bool IsRead { get; set; }
}
