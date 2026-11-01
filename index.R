# Infrastruct Professional — browser-side audit and statistical runtime
infra_audit <- function(events) {
  types <- if (length(events)) vapply(events, function(e) as.character(e$type), character(1)) else character()
  list(total = length(types), frequencies = as.list(table(types)), generated_at = as.character(Sys.time()))
}
