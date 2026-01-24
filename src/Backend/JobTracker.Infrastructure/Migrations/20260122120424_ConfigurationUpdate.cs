using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobTracker.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ConfigurationUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "NormalizedName",
                table: "Skills",
                type: "text",
                nullable: false,
                defaultValue: "");

            // Backfill existing rows with normalized values
            migrationBuilder.Sql(
                @"UPDATE ""Skills"" 
                  SET ""NormalizedName"" = UPPER(TRIM(COALESCE(""Name"", '')))");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NormalizedName",
                table: "Skills");
        }
    }
}
