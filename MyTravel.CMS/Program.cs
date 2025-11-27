var builder = WebApplication.CreateBuilder(args);

// Add Orchard Core CMS services (headless mode)
builder.Services.AddOrchardCms();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseStaticFiles();

// Use Orchard Core middleware
app.UseOrchardCore();

app.Run();
