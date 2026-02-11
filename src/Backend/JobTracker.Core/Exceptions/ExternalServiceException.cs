namespace JobTracker.Core.Exceptions;

/// <summary>
/// Exception thrown when an external service (like the Scraper microservice) fails or is unreachable.
/// </summary>
public class ExternalServiceException : Exception
{
    public string ServiceName { get; }
    public int? StatusCode { get; }

    public ExternalServiceException(string message, string serviceName, int? statusCode = null)
        : base(message)
    {
        ServiceName = serviceName;
        StatusCode = statusCode;
    }

    public ExternalServiceException(string message, string serviceName, Exception innerException, int? statusCode = null)
        : base(message, innerException)
    {
        ServiceName = serviceName;
        StatusCode = statusCode;
    }
}
