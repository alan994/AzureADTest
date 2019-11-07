using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.AzureAD.UI;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Identity.Web;
using Microsoft.Identity.Web.Resource;
using Microsoft.IdentityModel.Logging;

namespace WebApi2
{
	public class Startup
	{
		public Startup(IConfiguration configuration)
		{
			Configuration = configuration;
		}

		public IConfiguration Configuration { get; }

		public void ConfigureServices(IServiceCollection services)
		{
			services.AddControllers();

			//services.AddAuthentication(AzureADDefaults.AuthenticationScheme)
			//	.AddAzureADBearer(options => Configuration.Bind("AzureAD", options));

			 services.AddProtectedWebApi(Configuration);

			//services.Configure<JwtBearerOptions>(AzureADDefaults.JwtBearerAuthenticationScheme, options =>
			//{
			//	// This is a Microsoft identity platform web API.
			//	options.Authority += "/v2.0";

			//	// The web API accepts as audiences both the Client ID (options.Audience) and api://{ClientID}.
			//	options.TokenValidationParameters.ValidAudiences = new[]
			//	{
			//		options.Audience,
			//		$"api://{options.Audience}/all"
			//	};

			//	// Instead of using the default validation (validating against a single tenant,
			//	// as we do in line-of-business apps),
			//	// we inject our own multitenant validation logic (which even accepts both v1 and v2 tokens).
			//	options.TokenValidationParameters.IssuerValidator = AadIssuerValidator.GetIssuerValidator(options.Authority).Validate;
			//});

			services.AddCors(options => options.AddPolicy("client", policy => policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));
		}

		public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
		{
			if (env.IsDevelopment())
			{
				IdentityModelEventSource.ShowPII = true;
				app.UseDeveloperExceptionPage();
			}
			app.UseCors("client");
			app.UseHttpsRedirection();

			app.UseRouting();

			app.UseAuthentication();
			app.UseAuthorization();

			app.UseEndpoints(endpoints =>
			{
				endpoints.MapControllers();
			});
		}
	}
}
