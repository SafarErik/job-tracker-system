using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobTracker.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveLegacyHRFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Backfill legacy data to CompanyContacts
            migrationBuilder.Sql(
                @"INSERT INTO ""CompanyContacts"" (""CompanyId"", ""Name"", ""Email"", ""LinkedIn"")
                  SELECT 
                      ""Id"", 
                      COALESCE(""HRContactName"", ""ContactPerson"", ""HRContactEmail"", 'Unknown Contact'), 
                      ""HRContactEmail"", 
                      ""HRContactLinkedIn""
                  FROM ""Companies""
                  WHERE (""HRContactEmail"" IS NOT NULL OR ""HRContactName"" IS NOT NULL OR ""ContactPerson"" IS NOT NULL OR ""HRContactLinkedIn"" IS NOT NULL)
                  AND NOT EXISTS (
                      SELECT 1 FROM ""CompanyContacts"" 
                      WHERE ""CompanyContacts"".""CompanyId"" = ""Companies"".""Id""
                      AND (
                          (""Companies"".""HRContactEmail"" IS NOT NULL AND ""CompanyContacts"".""Email"" = ""Companies"".""HRContactEmail"")
                          OR 
                          (""Companies"".""HRContactLinkedIn"" IS NOT NULL AND ""CompanyContacts"".""LinkedIn"" = ""Companies"".""HRContactLinkedIn"")
                      )
                  );");

            migrationBuilder.DropColumn(
                name: "ContactPerson",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "HRContactEmail",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "HRContactLinkedIn",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "HRContactName",
                table: "Companies");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ContactPerson",
                table: "Companies",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HRContactEmail",
                table: "Companies",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HRContactLinkedIn",
                table: "Companies",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HRContactName",
                table: "Companies",
                type: "text",
                nullable: true);
        }
    }
}
