using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace TokenLogger
{
	public class TokeLoggerMiddleware
	{
		private ILogger<TokeLoggerMiddleware> _logger;
		private readonly RequestDelegate _next;
		private IConfigurationRoot _configuration;

		public TokeLoggerMiddleware(RequestDelegate next, ILogger<TokeLoggerMiddleware> logger, IConfigurationRoot configuration)
		{
			this._next = next;
			this._logger = logger;
			this._configuration = configuration;
		}

#pragma warning disable IDE1006 // Naming Styles
		public async Task Invoke(HttpContext httpContext)
#pragma warning restore IDE1006 // Naming Styles
		{
			await this._next(httpContext);
		}
	}

	// Extension method used to add the middleware to the HTTP request pipeline.
	public static class TokenLoggerMiddlewareExtensions
	{
		public static IApplicationBuilder UseTokenLogger(this IApplicationBuilder builder)
		{
			return builder.UseMiddleware<TokeLoggerMiddleware>();
		}
	}
}

