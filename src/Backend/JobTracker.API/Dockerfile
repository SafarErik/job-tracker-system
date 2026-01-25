# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy solution file and project files first (for better caching)
COPY ["JobTracker.slnx", "./"]
COPY ["JobTracker.API/JobTracker.API.csproj", "JobTracker.API/"]
COPY ["JobTracker.Application/JobTracker.Application.csproj", "JobTracker.Application/"]
COPY ["JobTracker.Core/JobTracker.Core.csproj", "JobTracker.Core/"]
COPY ["JobTracker.Infrastructure/JobTracker.Infrastructure.csproj", "JobTracker.Infrastructure/"]

# Restore dependencies
RUN dotnet restore "JobTracker.API/JobTracker.API.csproj"

# Copy the rest of the source code
COPY . .

# Build and Publish
WORKDIR "/src/JobTracker.API"
RUN dotnet build "JobTracker.API.csproj" -c Release -o /app/build
RUN dotnet publish "JobTracker.API.csproj" -c Release -o /app/publish

# Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

COPY --from=build /app/publish .

# Entry point
ENTRYPOINT ["dotnet", "JobTracker.API.dll"]
