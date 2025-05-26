# Base image for building
ARG LITELLM_BUILD_IMAGE=cgr.dev/chainguard/python:latest-dev
ARG LITELLM_RUNTIME_IMAGE=cgr.dev/chainguard/python:latest-dev

##############
# Builder Stage
##############
FROM ${LITELLM_BUILD_IMAGE} AS builder

WORKDIR /app
USER root

# Install build dependencies
RUN apk add --no-cache gcc python3-dev openssl openssl-dev

# Upgrade pip and install build tool
RUN pip install --upgrade pip && pip install build

# Copy source code
COPY . .

# Build Admin UI
RUN chmod +x docker/build_admin_ui.sh && ./docker/build_admin_ui.sh

# Build the Python package
RUN rm -rf dist/ && python -m build

# Install the built wheel (assumes only one .whl)
RUN pip install dist/*.whl

# Prebuild dependencies as wheels
RUN pip wheel --no-cache-dir --wheel-dir=/wheels -r requirements.txt

# Force PyJWT version and remove conflicting packages
RUN pip uninstall jwt PyJWT -y && pip install PyJWT==2.9.0 --no-cache-dir

##############
# Runtime Stage
##############
FROM ${LITELLM_RUNTIME_IMAGE} AS runtime

WORKDIR /app
USER root

# Install runtime dependencies
RUN apk add --no-cache openssl

# Copy source code
COPY . .

# Copy wheel and wheels from builder
COPY --from=builder /app/dist/*.whl .
COPY --from=builder /wheels /wheels

# Install the built wheel and dependencies
RUN pip install *.whl /wheels/* --no-index --find-links=/wheels && \
    rm -f *.whl && rm -rf /wheels

# Generate Prisma client
RUN prisma generate

# Make entrypoints executable
RUN chmod +x docker/entrypoint.sh docker/prod_entrypoint.sh

EXPOSE 4000/tcp

ENTRYPOINT ["docker/prod_entrypoint.sh"]
CMD ["--port", "4000"]
