# Browser-side webR analysis foundation; never executed by GitHub Pages itself.
infra_audit <- function(events) {
  list(event_count = length(events), timestamp = as.character(Sys.time()))
}
