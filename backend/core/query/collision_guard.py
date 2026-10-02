class PopulateCollisionGuard:
    """
    Stage 05/06 Helper — Populate Collision Guard.
    Normalizes requested populate paths to prevent redundant or contradictory
    nested join and prefetch instructions.
    """

    @classmethod
    def normalize_paths(cls, raw_paths: list[str]) -> list[str]:
        if not raw_paths:
            return []

        # Sort by depth / length so parent paths come before child paths
        sorted_paths = sorted(set(raw_paths), key=lambda p: (p.count("."), p.count("__"), len(p)))

        normalized: list[str] = []
        for path in sorted_paths:
            # Strip join symbols for path prefix comparison
            clean_path = path.rstrip("><")
            normalized.append(path)

        return normalized
