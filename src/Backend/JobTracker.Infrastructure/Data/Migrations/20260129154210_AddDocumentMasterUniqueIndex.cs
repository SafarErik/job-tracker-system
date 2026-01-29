using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobTracker.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddDocumentMasterUniqueIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Documents_UserId",
                table: "Documents");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_UserId_Type",
                table: "Documents",
                columns: new[] { "UserId", "Type" },
                unique: true,
                filter: "\"IsMaster\" = TRUE");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Documents_UserId_Type",
                table: "Documents");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_UserId",
                table: "Documents",
                column: "UserId");
        }
    }
}
