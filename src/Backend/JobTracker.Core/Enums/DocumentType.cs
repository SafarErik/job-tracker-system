namespace JobTracker.Core.Enums;

/// <summary>
/// Specifies the type of an uploaded document.
/// </summary>
public enum DocumentType
{
    /// <summary>Curriculum Vitae or Resume.</summary>
    Resume,

    /// <summary>Formal cover letter for an application.</summary>
    CoverLetter,

    /// <summary>Educational or professional certificate.</summary>
    Certificate,

    /// <summary>Link or file representing a professional portfolio.</summary>
    Portfolio,

    /// <summary>Official job offer letter received from a company.</summary>
    OfferLetter,

    /// <summary>Other miscellaneous document types.</summary>
    Other = 99
}