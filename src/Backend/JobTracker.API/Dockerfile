# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy solution file and project files first (for better caching)
COPY ["JobTracker.slnx", "./"]
COPY ["src/Backend/JobTracker.API/JobTracker.API.csproj", "src/Backend/JobTracker.API/"]
COPY ["src/Backend/JobTracker.Application/JobTracker.Application.csproj", "src/Backend/JobTracker.Application/"]
COPY ["src/Backend/JobTracker.Core/JobTracker.Core.csproj", "src/Backend/JobTracker.Core/"]
COPY ["src/Backend/JobTracker.Infrastructure/JobTracker.Infrastructure.csproj", "src/Backend/JobTracker.Infrastructure/"]

# Restore dependencies
RUN dotnet restore "src/Backend/JobTracker.API/JobTracker.API.csproj"

# Copy the rest of the source code
COPY . .

# Build and Publish
WORKDIR "/src/src/Backend/JobTracker.API"
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
