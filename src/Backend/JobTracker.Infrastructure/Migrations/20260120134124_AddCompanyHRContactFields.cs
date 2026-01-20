using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobTracker.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCompanyHRContactFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Address",
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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Address",
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
    }
}
