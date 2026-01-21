namespace JobTracker.Application.DTOs.Common;

/// <summary>
/// Generic wrapper for API responses.
/// Provides consistent response structure across all endpoints.
/// </summary>
/// <typeparam name="T">The type of data being returned</typeparam>
public class ApiResponse<T>
{
    /// <summary>
    /// Indicates if the operation was successful
    /// </summary>
    public bool Succeeded { get; set; }
    
    /// <summary>
    /// Human-readable message about the result
    /// </summary>
    public string Message { get; set; } = string.Empty;
    
    /// <summary>
    /// The actual data payload (null if operation failed)
    /// </summary>
    public T? Data { get; set; }
    
    /// <summary>
    /// List of error details (only populated on failure)
    /// </summary>
    public List<string> Errors { get; set; } = new();
    
    // ============================================
    // FACTORY METHODS FOR CONVENIENCE
    // ============================================
    
    /// <summary>
    /// Create a successful response with data
    /// </summary>
    public static ApiResponse<T> Success(T data, string message = "Operation completed successfully")
    {
        return new ApiResponse<T>
        {
            Succeeded = true,
            Message = message,
            Data = data
        };
    }
    
    /// <summary>
    /// Create a failure response with error message
    /// </summary>
    public static ApiResponse<T> Failure(string message, List<string>? errors = null)
    {
        return new ApiResponse<T>
        {
            Succeeded = false,
            Message = message,
            Errors = errors ?? new List<string>()
        };
    }
}

/// <summary>
/// DTO for paginated list responses.
/// Supports cursor-based and offset-based pagination.
/// </summary>
/// <typeparam name="T">The type of items in the list</typeparam>
public class PagedResponse<T>
{
    /// <summary>
    /// The items for the current page
    /// </summary>
    public List<T> Items { get; set; } = new();
    
    /// <summary>
    /// Current page number (1-based)
    /// </summary>
    public int PageNumber { get; set; }
    
    /// <summary>
    /// Number of items per page
    /// </summary>
    public int PageSize { get; set; }
    
    /// <summary>
    /// Total number of items across all pages
    /// </summary>
    public int TotalCount { get; set; }
    
    /// <summary>
    /// Total number of pages
    /// </summary>
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    
    /// <summary>
    /// Whether there is a previous page
    /// </summary>
    public bool HasPreviousPage => PageNumber > 1;
    
    /// <summary>
    /// Whether there is a next page
    /// </summary>
    public bool HasNextPage => PageNumber < TotalPages;
}

/// <summary>
/// DTO for pagination request parameters.
/// </summary>
public class PaginationParams
{
    private const int MaxPageSize = 100;
    private int _pageSize = 10;
    
    /// <summary>
    /// Page number (1-based, default: 1)
    /// </summary>
    public int PageNumber { get; set; } = 1;
    
    /// <summary>
    /// Items per page (default: 10, max: 100)
    /// </summary>
    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value > MaxPageSize ? MaxPageSize : value;
    }
}

/// <summary>
/// DTO for sorting request parameters.
/// </summary>
public class SortingParams
{
    /// <summary>
    /// Field to sort by (e.g., "appliedAt", "position", "companyName")
    /// </summary>
    public string? SortBy { get; set; }
    
    /// <summary>
    /// Sort direction: true for ascending, false for descending
    /// </summary>
    public bool Ascending { get; set; } = false;
}

/// <summary>
/// Combined filtering, sorting, and pagination parameters.
/// </summary>
public class QueryParams : PaginationParams
{
    /// <summary>
    /// Search term to filter results
    /// </summary>
    public string? Search { get; set; }
    
    /// <summary>
    /// Field to sort by
    /// </summary>
    public string? SortBy { get; set; }
    
    /// <summary>
    /// Sort ascending (true) or descending (false)
    /// </summary>
    public bool Ascending { get; set; } = false;
}
