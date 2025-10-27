namespace MAE_WebAPI.Data;

using MAE_WebAPI.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

public class MAEDbContext : IdentityDbContext<ApplicationUser>
{
    public MAEDbContext(DbContextOptions<MAEDbContext> options) : base(options)
    {

    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<LearnedMove>()
            .HasOne(lm => lm.ApplicationUser)
            .WithMany(u => u.LearnedMoves)
            .HasForeignKey(lm => lm.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // builder.Entity<LearnedStep>()
        //     .HasOne(ls => ls.LearnedMove)
        //     .WithMany(lm => lm.LearnedSteps)
        //     .HasForeignKey(ls => ls.LearnedMoveId)
        //     .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<LearnedMove>()
           .HasOne(lm => lm.Move)
           .WithMany()
           .HasForeignKey(lm => lm.MoveId)
           .OnDelete(DeleteBehavior.Restrict);


    }

    public DbSet<MartialArt> MartialArts { get; set; }
    public DbSet<Move> Moves { get; set; }
    public DbSet<Step> Steps { get; set; }
    public DbSet<StepOption> StepOptions { get; set; }
    public DbSet<LearnedMove> LearnedMoves { get; set; }
    // public DbSet<LearnedStep> LearnedSteps { get; set; }
}
