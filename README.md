# fastify-monorepo

An attempt to implement a fastify mono-repo with all the high-level features you would want from a production app.

## Implemented

* Buildless package support
* Package generation from templates
* Common fastify setup with the ability to also use each package independantly
* Swagger docs generated on `/documentation`
* Zod schema support for requests and responses
  * Automatically typed and validated requests and responses
  * Integrated into the swagger docs
* Logging support
  * Optional gcp formatting
  * Persistant logger used throughout the request, usable from anywhere
* Caching support
  * In memory with and without a redis secondary cache
* Turborepo

## Todo

* Open telemetry support
* Docker buildfile
* Auth
* Github actions
* Api generation from templates
* Rate limiting
