FROM supabase/cli:latest

WORKDIR /workspace

COPY supabase ./supabase

# This image packages server configuration and migrations. Local Supabase
# services remain a host-side CLI operation; no Docker socket is mounted.
CMD ["supabase", "--version"]
