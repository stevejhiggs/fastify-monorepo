

FROM node:24-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
COPY ./package.json /app/package.json
RUN corepack enable pnpm && pnpm -v
WORKDIR /app

FROM base AS prepare
ARG TARGET_PACKAGE
RUN pnpm -g add turbo@2
COPY . .
# Add lockfile and package.json's of isolated subworkspace
# Generate a partial monorepo with a pruned lockfile for a target workspace.
RUN turbo prune ${TARGET_PACKAGE} --docker

# Strip out dev dependencies
FROM prepare AS prod-deps
ARG TARGET_PACKAGE
WORKDIR /app
COPY --from=prepare /app/out/json/ .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --filter ${TARGET_PACKAGE}... --prod --shamefully-hoist

# Build the app
FROM base AS build
ARG TARGET_PACKAGE
COPY --from=prepare /app/out/json/ .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY --from=prepare /app/out/full/ .
RUN DIST_DIR=/app/.dist pnpm -w --filter ${TARGET_PACKAGE}... build

# Final image
FROM base
WORKDIR /app

COPY --from=build /app/.dist/ ./
COPY --from=prod-deps /app/node_modules ./node_modules

# Run as non-root user
USER node
EXPOSE 3000
CMD [ "node", "--enable-source-maps", "--import", "./telemetry.mjs", "./index.mjs" ]
