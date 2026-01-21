using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace JobTracker.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddIdentityRelations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_JobApplicationSkill_JobApplications_JobApplicationsId",
                table: "JobApplicationSkill");

            migrationBuilder.DropForeignKey(
                name: "FK_JobApplicationSkill_Skills_SkillsId",
                table: "JobApplicationSkill");

            migrationBuilder.DropPrimaryKey(
                name: "PK_JobApplicationSkill",
                table: "JobApplicationSkill");

            migrationBuilder.RenameTable(
                name: "JobApplicationSkill",
                newName: "JobApplicationSkills");

            migrationBuilder.RenameIndex(
                name: "IX_JobApplicationSkill_SkillsId",
                table: "JobApplicationSkills",
                newName: "IX_JobApplicationSkills_SkillsId");

            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "Skills",
                type: "text",
                nullable: true);

            // STAGED MIGRATION APPROACH:
            // Step 1: Add UserId columns as nullable first to avoid errors with existing data
            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "JobApplications",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "Documents",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "Documents",
                type: "text",
                nullable: true);

            // Step 2: Create Users table first (moved before backfill SQL)

            migrationBuilder.AddPrimaryKey(
                name: "PK_JobApplicationSkills",
                table: "JobApplicationSkills",
                columns: new[] { "JobApplicationsId", "SkillsId" });

            migrationBuilder.CreateTable(
                name: "AspNetRoles",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    NormalizedName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    FirstName = table.Column<string>(type: "text", nullable: true),
                    LastName = table.Column<string>(type: "text", nullable: true),
                    ProfilePictureUrl = table.Column<string>(type: "text", nullable: true),
                    CurrentJobTitle = table.Column<string>(type: "text", nullable: true),
                    YearsOfExperience = table.Column<int>(type: "integer", nullable: true),
                    Bio = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastLoginAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsExternalAccount = table.Column<bool>(type: "boolean", nullable: false),
                    ExternalProvider = table.Column<string>(type: "text", nullable: true),
                    UserName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    NormalizedUserName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    Email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    NormalizedEmail = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    EmailConfirmed = table.Column<bool>(type: "boolean", nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: true),
                    SecurityStamp = table.Column<string>(type: "text", nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "text", nullable: true),
                    PhoneNumber = table.Column<string>(type: "text", nullable: true),
                    PhoneNumberConfirmed = table.Column<bool>(type: "boolean", nullable: false),
                    TwoFactorEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    LockoutEnd = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    LockoutEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    AccessFailedCount = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetRoleClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RoleId = table.Column<string>(type: "text", nullable: false),
                    ClaimType = table.Column<string>(type: "text", nullable: true),
                    ClaimValue = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoleClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    ClaimType = table.Column<string>(type: "text", nullable: true),
                    ClaimValue = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetUserClaims_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserLogins",
                columns: table => new
                {
                    LoginProvider = table.Column<string>(type: "text", nullable: false),
                    ProviderKey = table.Column<string>(type: "text", nullable: false),
                    ProviderDisplayName = table.Column<string>(type: "text", nullable: true),
                    UserId = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserLogins", x => new { x.LoginProvider, x.ProviderKey });
                    table.ForeignKey(
                        name: "FK_AspNetUserLogins_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserRoles",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "text", nullable: false),
                    RoleId = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserRoles", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserTokens",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "text", nullable: false),
                    LoginProvider = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Value = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserTokens", x => new { x.UserId, x.LoginProvider, x.Name });
                    table.ForeignKey(
                        name: "FK_AspNetUserTokens_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserSkills",
                columns: table => new
                {
                    SkillsId = table.Column<int>(type: "integer", nullable: false),
                    UsersId = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserSkills", x => new { x.SkillsId, x.UsersId });
                    table.ForeignKey(
                        name: "FK_UserSkills_Skills_SkillsId",
                        column: x => x.SkillsId,
                        principalTable: "Skills",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserSkills_Users_UsersId",
                        column: x => x.UsersId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            // STAGED MIGRATION Step 3: Backfill UserId columns with SQL
            // Option A: Delete orphaned records (choose based on business requirements)
            migrationBuilder.Sql(@"
                -- Create a migration placeholder user if needed
                INSERT INTO ""Users"" (""Id"", ""UserName"", ""NormalizedUserName"", ""Email"", ""NormalizedEmail"", 
                    ""EmailConfirmed"", ""SecurityStamp"", ""ConcurrencyStamp"", ""PhoneNumberConfirmed"", 
                    ""TwoFactorEnabled"", ""LockoutEnabled"", ""AccessFailedCount"", ""IsExternalAccount"", ""CreatedAt"")
                SELECT 'migration-placeholder-user', 'migration@placeholder.local', 'MIGRATION@PLACEHOLDER.LOCAL',
                    'migration@placeholder.local', 'MIGRATION@PLACEHOLDER.LOCAL', 
                    false, gen_random_uuid()::text, gen_random_uuid()::text, false, 
                    false, false, 0, false, NOW()
                WHERE NOT EXISTS (SELECT 1 FROM ""Users"" WHERE ""Id"" = 'migration-placeholder-user')
                AND (EXISTS (SELECT 1 FROM ""JobApplications"" WHERE ""UserId"" IS NULL)
                     OR EXISTS (SELECT 1 FROM ""Documents"" WHERE ""UserId"" IS NULL));
                
                -- Backfill JobApplications with placeholder user
                UPDATE ""JobApplications"" SET ""UserId"" = 'migration-placeholder-user' WHERE ""UserId"" IS NULL;
                
                -- Backfill Documents with placeholder user
                UPDATE ""Documents"" SET ""UserId"" = 'migration-placeholder-user' WHERE ""UserId"" IS NULL;
            ");

            // STAGED MIGRATION Step 4: Now make UserId columns non-nullable
            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                table: "JobApplications",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                table: "Documents",
                type: "text",
                nullable: false,
                defaultValue: "");

            // STAGED MIGRATION Step 5: Create indices (before FK constraints)
            migrationBuilder.CreateIndex(
                name: "IX_Skills_Name",
                table: "Skills",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JobApplications_UserId",
                table: "JobApplications",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_UserId",
                table: "Documents",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetRoleClaims_RoleId",
                table: "AspNetRoleClaims",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                table: "AspNetRoles",
                column: "NormalizedName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserClaims_UserId",
                table: "AspNetUserClaims",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserLogins_UserId",
                table: "AspNetUserLogins",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserRoles_RoleId",
                table: "AspNetUserRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                table: "Users",
                column: "NormalizedEmail");

            migrationBuilder.CreateIndex(
                name: "UserNameIndex",
                table: "Users",
                column: "NormalizedUserName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserSkills_UsersId",
                table: "UserSkills",
                column: "UsersId");

            migrationBuilder.AddForeignKey(
                name: "FK_Documents_Users_UserId",
                table: "Documents",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_JobApplications_Users_UserId",
                table: "JobApplications",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_JobApplicationSkills_JobApplications_JobApplicationsId",
                table: "JobApplicationSkills",
                column: "JobApplicationsId",
                principalTable: "JobApplications",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_JobApplicationSkills_Skills_SkillsId",
                table: "JobApplicationSkills",
                column: "SkillsId",
                principalTable: "Skills",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Documents_Users_UserId",
                table: "Documents");

            migrationBuilder.DropForeignKey(
                name: "FK_JobApplications_Users_UserId",
                table: "JobApplications");

            migrationBuilder.DropForeignKey(
                name: "FK_JobApplicationSkills_JobApplications_JobApplicationsId",
                table: "JobApplicationSkills");

            migrationBuilder.DropForeignKey(
                name: "FK_JobApplicationSkills_Skills_SkillsId",
                table: "JobApplicationSkills");

            migrationBuilder.DropTable(
                name: "AspNetRoleClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserLogins");

            migrationBuilder.DropTable(
                name: "AspNetUserRoles");

            migrationBuilder.DropTable(
                name: "AspNetUserTokens");

            migrationBuilder.DropTable(
                name: "UserSkills");

            migrationBuilder.DropTable(
                name: "AspNetRoles");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Skills_Name",
                table: "Skills");

            migrationBuilder.DropIndex(
                name: "IX_JobApplications_UserId",
                table: "JobApplications");

            migrationBuilder.DropIndex(
                name: "IX_Documents_UserId",
                table: "Documents");

            migrationBuilder.DropPrimaryKey(
                name: "PK_JobApplicationSkills",
                table: "JobApplicationSkills");

            migrationBuilder.DropColumn(
                name: "Category",
                table: "Skills");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "JobApplications");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Documents");

            migrationBuilder.RenameTable(
                name: "JobApplicationSkills",
                newName: "JobApplicationSkill");

            migrationBuilder.RenameIndex(
                name: "IX_JobApplicationSkills_SkillsId",
                table: "JobApplicationSkill",
                newName: "IX_JobApplicationSkill_SkillsId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_JobApplicationSkill",
                table: "JobApplicationSkill",
                columns: new[] { "JobApplicationsId", "SkillsId" });

            migrationBuilder.AddForeignKey(
                name: "FK_JobApplicationSkill_JobApplications_JobApplicationsId",
                table: "JobApplicationSkill",
                column: "JobApplicationsId",
                principalTable: "JobApplications",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_JobApplicationSkill_Skills_SkillsId",
                table: "JobApplicationSkill",
                column: "SkillsId",
                principalTable: "Skills",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
