namespace JobTracker.Core.Enums;

/// <summary>
/// Represents the current status of a job application in the pipeline.
/// </summary>
public enum JobApplicationStatus
{
    /// <summary>
    /// The application has been submitted but no response yet.
    /// </summary>
    Applied,

    /// <summary>
    /// The candidate is currently in the interview process.
    /// </summary>
    Interviewing,

    /// <summary>
    /// The application was rejected by the company.
    /// </summary>
    Rejected,

    /// <summary>
    /// An official offer has been received from the company.
    /// </summary>
    OfferReceived,

    /// <summary>
    /// The initial phone screening stage.
    /// </summary>
    PhoneScreen,

    /// <summary>
    /// The company stopped responding after some interaction.
    /// </summary>
    Ghosted,

    /// <summary>
    /// The candidate is performing a technical assessment or home task.
    /// </summary>
    TechnicalTask,

    /// <summary>
    /// The candidate has accepted the offer.
    /// </summary>
    Accepted,

    /// <summary>
    /// The candidate withdrew their application.
    /// </summary>
    Withdrawn
}